<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Models\Order;
use App\Models\Product;
use App\Helpers\Validator;
use App\Services\InvoicePdfService;
use App\Services\EmailService;

/**
 * Guest Checkout Controller
 * Handles order creation without requiring authentication
 */
class GuestCheckoutController
{
    private $orderModel;
    private $db;

    public function __construct()
    {
        $this->orderModel = new Order();
        $this->db = Database::getInstance();
    }

    /**
     * POST /guest-checkout
     * Create order as guest without authentication
     */
    public function createGuestOrder(Request $request)
    {
        // ── 1. Validate payment method ───────────────────────────────
        $paymentMethod = $request->input('payment_method');
        if (!in_array($paymentMethod, ['cib_bank', 'cash_on_delivery'])) {
            return Response::validationError(['payment_method' => 'Invalid payment method']);
        }

        // ── 2. Validate guest contact info ───────────────────────────
        $guestValidator = new Validator($request->all(), [
            'guest_email' => 'required|email|max:255',
            'guest_name' => 'required|string|max:255',
            'guest_phone' => 'required|string|max:20',
        ]);

        if (!$guestValidator->validate()) {
            return Response::validationError($guestValidator->errors());
        }

        $guestEmail = trim(strtolower($request->input('guest_email')));
        $guestName = trim($request->input('guest_name'));
        $guestPhone = trim($request->input('guest_phone'));

        // ── 3. Validate shipping address ─────────────────────────────
        $shippingAddress = $request->input('shipping_address');
        if (!$shippingAddress || !is_array($shippingAddress)) {
            return Response::validationError(['shipping_address' => 'Shipping address is required']);
        }

        $addressValidator = new Validator($shippingAddress, [
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'string|max:100',
            'postal_code' => 'string|max:20',
            'country' => 'string|max:100',
            'governorate' => 'required|string|max:100',
        ]);

        if (!$addressValidator->validate()) {
            return Response::validationError($addressValidator->errors());
        }

        // ── 4. Validate cart items ──────────────────────────────────
        $cartItems = $request->input('cart_items');
        if (!is_array($cartItems) || empty($cartItems)) {
            return Response::error('Cart cannot be empty', null, 422);
        }

        // Validate each cart item structure
        foreach ($cartItems as $item) {
            if (!isset($item['product_id']) || !isset($item['quantity'])) {
                return Response::validationError(['cart_items' => 'Invalid cart item format']);
            }
            if ($item['quantity'] < 1) {
                return Response::validationError(['cart_items' => 'Item quantity must be at least 1']);
            }
        }

        try {
            // ── 5. Validate stock for all items ──────────────────────
            $productModel = new Product();
            foreach ($cartItems as $item) {
                $productId = $item['product_id'];
                $quantity = $item['quantity'];
                $variantId = $item['variant_id'] ?? null;

                // Check if product exists and is active
                $product = $productModel->find($productId);
                if (!$product || !$product['is_active']) {
                    return Response::error("Product ID {$productId} is not available");
                }

                // Check stock
                if (!$productModel->checkStock($productId, $quantity, $variantId)) {
                    $stockInfo = $productModel->getStockInfo($productId, $variantId);
                    $availableStock = $stockInfo ? $stockInfo['stock_quantity'] : 0;
                    return Response::error(
                        "Insufficient stock for product. Available: {$availableStock}, Requested: {$quantity}",
                        null,
                        422
                    );
                }
            }

            // ── 6. Calculate totals (with backend validation) ────────
            $shippingCost = (float)$request->input('shipping_cost', 0);
            $couponDiscount = 0;

            // Prepare items for calculation (fetch product data from DB)
            $preparedItems = [];
            foreach ($cartItems as $item) {
                $product = $productModel->find($item['product_id']);
                $price = $item['price'] ?? $product['sale_price'] ?? $product['price'];

                $preparedItems[] = [
                    'product_id' => $item['product_id'],
                    'product_name' => $product['name'],
                    'variant_id' => $item['variant_id'] ?? null,
                    'variant_name' => $item['variant_name'] ?? null,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'subtotal' => $price * $item['quantity'],
                ];
            }

            $totals = $this->orderModel->calculateTotals($preparedItems, $shippingCost, $couponDiscount);

            // ── 7. Create or get guest user account ──────────────────
            // Create a temporary guest user in the users table
            $guestUserId = $this->createOrGetGuestUser($guestEmail, $guestName, $guestPhone);
            if (!$guestUserId) {
                return Response::error('Failed to create guest user account');
            }

            // ── 8. Create shipping address record ────────────────────
            $shippingAddressId = $this->createGuestAddress($shippingAddress, $guestUserId);
            if (!$shippingAddressId) {
                return Response::error('Failed to create address');
            }

            // ── 9. Build guest order data ──────────────────────────
            $viewToken = bin2hex(random_bytes(32)); // Generate unique token for guest order tracking

            $orderData = [
                'user_id' => $guestUserId, // Link to guest user account
                'is_guest' => true,
                'guest_email' => $guestEmail,
                'guest_phone' => $guestPhone,
                'guest_name' => $guestName,
                'view_token' => $viewToken,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $paymentMethod,
                'subtotal' => $totals['subtotal'],
                'shipping_cost' => $totals['shipping_cost'],
                'discount' => $totals['discount'],
                'total' => $totals['total'],
                'currency' => 'EGP',
                'shipping_address_id' => $shippingAddressId,
                'billing_address_id' => $shippingAddressId,
                'notes' => $request->input('notes', ''),
            ];

            // ── 10. Create order ────────────────────────────────────
            // The createOrder method handles both order creation AND stock updates
            $orderId = $this->orderModel->createOrder($orderData, $preparedItems);
            if (!$orderId) {
                return Response::error('Failed to create order');
            }

            // ── 10. Get created order ──────────────────────────────
            $order = $this->orderModel->getOrderDetails($orderId);

            // ── 11. Send confirmation email to guest ──────────────────
            try {
                $emailService = new EmailService();
                $pdfService = new InvoicePdfService();

                // Generate PDF for guest order (in English by default)
                $pdfContent = $pdfService->generateInvoicePdf($orderId, 'en', true);

                // Send invoice email with PDF to guest
                // We'll send using a custom method or directly with mailer
                $this->sendGuestOrderConfirmationEmail(
                    $guestEmail,
                    $guestName,
                    $order,
                    $pdfContent,
                    $viewToken
                );
            } catch (\Exception $e) {
                error_log('Failed to send guest order email: ' . $e->getMessage());
                // Don't fail the whole order if email fails
            }

            // ── 12. Notify admins ──────────────────────────────────
            try {
                $notificationModel = new \App\Models\Notification();
                $notificationModel->notifyAdmins(
                    'order',
                    'New Guest Order Received',
                    "New guest order #{$order['order_number']} placed by {$guestName} ({$guestEmail}). Total: {$order['total']} EGP",
                    "/dashboard/orders/{$orderId}",
                    $orderId
                );
            } catch (\Exception $e) {
                error_log('Failed to create guest order notification: ' . $e->getMessage());
            }

            // Return order with view token for guest tracking
            $orderResponse = $order;
            $orderResponse['view_token'] = $viewToken;

            return Response::success($orderResponse, 'Guest order created successfully', 201);
        } catch (\Exception $e) {
            error_log('Guest checkout error: ' . $e->getMessage());
            return Response::error('Failed to create guest order: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get guest order by order number with view token
     * GET /guest-checkout/orders/{orderNumber}?view_token={token}
     */
    public function getGuestOrder(Request $request, $orderNumber)
    {
        $viewToken = $request->input('view_token');

        if (!$viewToken) {
            return Response::validationError(['view_token' => 'View token is required']);
        }

        try {
            $order = $this->orderModel->findByOrderNumber($orderNumber);

            if (!$order) {
                return Response::notFound('Order not found');
            }

            // Verify this is a guest order and token matches
            if (!$order['is_guest'] || $order['view_token'] !== $viewToken) {
                return Response::forbidden('Access denied - invalid token');
            }

            return Response::success($this->orderModel->getOrderDetails($order['id']));
        } catch (\Exception $e) {
            return Response::error('Failed to fetch guest order: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create address for guest order
     * Creates address with reference to guest user account
     */
    private function createGuestAddress($addressData, $userId)
    {
        try {
            $sql = "INSERT INTO addresses (
                        user_id, first_name, last_name, phone,
                        address_line1, address_line2, city, state,
                        postal_code, country, governorate, is_default
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $this->db->execute($sql, [
                $userId,
                trim($addressData['first_name']),
                trim($addressData['last_name']),
                trim($addressData['phone']),
                $addressData['address_line1'],
                $addressData['address_line2'] ?? null,
                $addressData['city'],
                $addressData['state'] ?? null,
                $addressData['postal_code'] ?? null,
                $addressData['country'] ?? 'Egypt',
                trim($addressData['governorate']),
                0
            ]);

            return $this->db->lastInsertId();
        } catch (\Exception $e) {
            error_log('Failed to create guest address: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Create or get guest user account
     * Creates a temporary guest user in the users table
     */
    private function createOrGetGuestUser($email, $name, $phone)
    {
        try {
            $userModel = new \App\Models\User();

            // Check if guest user already exists with this email
            $existingUser = $userModel->findByEmail($email);
            if ($existingUser) {
                return $existingUser['id'];
            }

            // Split name into first and last name
            $nameParts = explode(' ', trim($name), 2);
            $firstName = $nameParts[0];
            $lastName = $nameParts[1] ?? '';

            // Create guest user with a temporary password
            $guestPassword = bin2hex(random_bytes(16)); // Random temporary password
            $hashedPassword = password_hash($guestPassword, PASSWORD_BCRYPT);

            $sql = "INSERT INTO users (
                        first_name, last_name, email, phone, password,
                        role, provider, is_active, preferred_language, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

            $result = $this->db->execute($sql, [
                $firstName,
                $lastName,
                $email,
                $phone,
                $hashedPassword,
                'customer', // role
                'local',     // provider
                1,           // is_active
                'en'         // preferred_language
            ]);

            if ($result) {
                return $this->db->lastInsertId();
            }

            return null;
        } catch (\Exception $e) {
            error_log('Failed to create guest user: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Send guest order confirmation email with PDF
     */
    private function sendGuestOrderConfirmationEmail($email, $name, $order, $pdfContent, $viewToken)
    {
        try {
            $mailer = new \PHPMailer\PHPMailer\PHPMailer(true);
            $config = require __DIR__ . '/../config/config.php';

            // Configure SMTP
            $mailConfig = $config['mail'] ?? [];
            $mailer->isSMTP();
            $mailer->Host = $mailConfig['host'] ?? 'smtp.gmail.com';
            $mailer->SMTPAuth = true;
            $mailer->Username = $mailConfig['username'] ?? '';
            $mailer->Password = $mailConfig['password'] ?? '';
            $mailer->SMTPSecure = ($mailConfig['encryption'] ?? 'tls') === 'ssl' ? \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS : \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mailer->Port = $mailConfig['port'] ?? 587;
            $mailer->setFrom($mailConfig['from_address'] ?? 'noreply@escwear.com', $mailConfig['from_name'] ?? 'ESC Wear');

            // Add recipient
            $mailer->addAddress($email, $name);

            // Subject and body
            $mailer->Subject = 'Your ESC Order Is Confirmed!';
            $mailer->isHTML(true);

            // Detect language preference (default to English)
            $language = 'en';
            if (stripos($name, 'أ') !== false || stripos($email, 'ar') !== false) {
                $language = 'ar';
            }

            // Build professional email body
            if ($language === 'ar') {
                $mailer->Body = $this->buildGuestOrderConfirmationEmailAr($name, $order, $viewToken);
                $mailer->AltBody = 'شكراً لطلبك';
            } else {
                $mailer->Body = $this->buildGuestOrderConfirmationEmailEn($name, $order, $viewToken);
                $mailer->AltBody = 'Thank you for your order';
            }

            // Attach PDF
            if ($pdfContent) {
                $tempFile = sys_get_temp_dir() . '/invoice_' . $order['order_number'] . '.pdf';
                file_put_contents($tempFile, $pdfContent);
                $mailer->addAttachment($tempFile, 'Invoice_' . $order['order_number'] . '.pdf');
            }

            return $mailer->send();
        } catch (\Exception $e) {
            error_log('Failed to send guest order email: ' . $e->getMessage());
            return false;
        }
    }

    private function buildGuestOrderConfirmationEmailEn($name, $order, $viewToken)
    {
        $shippingAddress = $order['shipping_address'] ?? [];
        $addressLine = '';
        if ($shippingAddress) {
            $addressLine = $shippingAddress['first_name'] . ' ' . $shippingAddress['last_name'] . ', ' .
                $shippingAddress['address_line1'];
            if (!empty($shippingAddress['address_line2'])) {
                $addressLine .= ', ' . $shippingAddress['address_line2'];
            }
            $addressLine .= ', ' . $shippingAddress['city'] . ', ' . $shippingAddress['governorate'] . ' ' .
                ($shippingAddress['postal_code'] ?? '');
        }

        // Build order items table
        $itemsTable = '';
        if (!empty($order['items'])) {
            foreach ($order['items'] as $item) {
                $itemTotal = floatval($item['price'] ?? 0) * intval($item['quantity'] ?? 1);
                $itemsTable .= '
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; color: #555;">' . htmlspecialchars($item['product_name'] ?? '') . '</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #555;">' . intval($item['quantity'] ?? 1) . '</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; color: #555;">EGP ' . number_format(floatval($item['price'] ?? 0), 2) . '</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #333;">EGP ' . number_format($itemTotal, 2) . '</td>
                    </tr>';
            }
        }

        $baseUrl = $_ENV['APP_URL'] ?? 'https://escwear.com';
        $trackingUrl = "{$baseUrl}/guest-checkout/orders/{$order['order_number']}?view_token={$viewToken}";

        return '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .email-body { background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #ffd814; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #0f1111; margin-bottom: 10px; }
        .greeting { font-size: 22px; font-weight: bold; color: #0f1111; margin-bottom: 20px; text-align: center; }
        .content { color: #333; font-size: 15px; line-height: 1.8; }
        .section { margin: 25px 0; padding: 15px; background-color: #f9f9f9; border-radius: 6px; border-left: 4px solid #ffd814; }
        .section-title { font-weight: bold; color: #0f1111; margin-bottom: 12px; font-size: 16px; }
        .detail-item { margin: 8px 0; color: #555; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .order-table th { background-color: #f5f5f5; padding: 12px; text-align: left; font-weight: bold; color: #0f1111; border-bottom: 2px solid #ddd; }
        .order-table td { padding: 12px; border-bottom: 1px solid #eee; }
        .summary-table { width: 100%; margin: 20px 0; }
        .summary-table tr { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .summary-table .total-row { font-weight: bold; font-size: 18px; color: #B12704; border-top: 2px solid #ddd; border-bottom: none; padding: 15px 0; }
        .button { display: inline-block; background-color: #ffd814; color: #0f1111; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 13px; text-align: center; }
        .tagline { font-weight: bold; color: #ffd814; margin-top: 10px; }
        .icon { display: inline-block; width: 20px; height: 20px; margin-right: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-body">
            <div class="header">
                <div class="logo">🛍️ ESC Wear</div>
            </div>

            <div class="greeting">Thank you for your order!</div>

            <div class="content">
                <p>Dear <strong>' . htmlspecialchars(explode(' ', $name)[0]) . '</strong>,</p>
                <p>Thank you for choosing ESC Wear! We have received your order and our team is now carefully preparing it just for you. Every piece is designed to give you freedom of movement while keeping your authenticity — with no compromises.</p>
            </div>

            <div class="section">
                <div class="section-title">✓ Order Confirmed</div>
                <div class="detail-item"><strong>Order Number:</strong> ' . htmlspecialchars($order['order_number']) . '</div>
                <div class="detail-item"><strong>Order Date:</strong> ' . date('M d, Y', strtotime($order['created_at'])) . '</div>
                <div class="detail-item"><strong>Expected Delivery:</strong> 2-3 Business Days</div>
            </div>

            <div class="section">
                <div class="section-title">📦 Order Items</div>
                <table class="order-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Price</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ' . $itemsTable . '
                    </tbody>
                </table>
            </div>

            <div class="section">
                <div class="section-title">💰 Order Summary</div>
                <div style="margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
                        <span>Subtotal:</span>
                        <span>EGP ' . number_format(floatval($order['subtotal'] ?? 0), 2) . '</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
                        <span>Shipping:</span>
                        <span><strong>EGP ' . number_format(floatval($order['shipping_cost'] ?? 0), 2) . '</strong></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 15px 0; font-weight: bold; font-size: 18px; color: #B12704; border-top: 2px solid #ddd;">
                        <span>Total:</span>
                        <span>EGP ' . number_format(floatval($order['total'] ?? 0), 2) . '</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">📍 Shipping Address</div>
                <div class="detail-item">' . htmlspecialchars($addressLine) . '</div>
            </div>

            <div class="content" style="text-align: center;">
                <p>We will send you shipping updates via email. Your order will be processed and shipped soon.</p>
                <a href="' . htmlspecialchars($trackingUrl) . '" class="button">Track Your Order</a>
            </div>

            <div class="section" style="background-color: #fffbf0; border-left-color: #ffd814;">
                <p style="margin: 0; color: #0f1111;">💡 <strong>Join the ESC Community</strong></p>
                <p style="margin: 5px 0; color: #555; font-size: 14px;">Connect with confident movers: <strong>@esc.wear_ | @esc.community_</strong></p>
            </div>

            <div class="footer">
                <p style="margin: 0;">With love,<br><strong style="font-size: 16px;">ESC Wear Team</strong></p>
                <p class="tagline">ESC-ing the average life! 🌟</p>
                <p style="margin-top: 15px; font-size: 12px; color: #999;">This is an automated email. Please do not reply directly. For support, contact us through our website.</p>
            </div>
        </div>
    </div>
</body>
</html>';
    }

    private function buildGuestOrderConfirmationEmailAr($name, $order, $viewToken)
    {
        $shippingAddress = $order['shipping_address'] ?? [];
        $addressLine = '';
        if ($shippingAddress) {
            $addressLine = $shippingAddress['first_name'] . ' ' . $shippingAddress['last_name'] . ', ' .
                $shippingAddress['address_line1'];
            if (!empty($shippingAddress['address_line2'])) {
                $addressLine .= ', ' . $shippingAddress['address_line2'];
            }
            $addressLine .= ', ' . $shippingAddress['city'] . ', ' . $shippingAddress['governorate'] . ' ' .
                ($shippingAddress['postal_code'] ?? '');
        }

        // Build order items table (RTL)
        $itemsTable = '';
        if (!empty($order['items'])) {
            foreach ($order['items'] as $item) {
                $itemTotal = floatval($item['price'] ?? 0) * intval($item['quantity'] ?? 1);
                $itemsTable .= '
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; color: #555; text-align: right;">' . htmlspecialchars($item['product_name'] ?? '') . '</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #555;">' . intval($item['quantity'] ?? 1) . '</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: left; color: #555;">ج.م ' . number_format(floatval($item['price'] ?? 0), 2) . '</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: left; font-weight: bold; color: #333;">ج.م ' . number_format($itemTotal, 2) . '</td>
                    </tr>';
            }
        }

        $baseUrl = $_ENV['APP_URL'] ?? 'https://escwear.com';
        $trackingUrl = "{$baseUrl}/guest-checkout/orders/{$order['order_number']}?view_token={$viewToken}";

        return '<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: rtl; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .email-body { background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #ffd814; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #0f1111; margin-bottom: 10px; }
        .greeting { font-size: 22px; font-weight: bold; color: #0f1111; margin-bottom: 20px; text-align: center; }
        .content { color: #333; font-size: 15px; line-height: 1.8; }
        .section { margin: 25px 0; padding: 15px; background-color: #f9f9f9; border-radius: 6px; border-right: 4px solid #ffd814; }
        .section-title { font-weight: bold; color: #0f1111; margin-bottom: 12px; font-size: 16px; }
        .detail-item { margin: 8px 0; color: #555; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .order-table th { background-color: #f5f5f5; padding: 12px; text-align: right; font-weight: bold; color: #0f1111; border-bottom: 2px solid #ddd; }
        .order-table td { padding: 12px; border-bottom: 1px solid #eee; }
        .summary-table { width: 100%; margin: 20px 0; }
        .summary-table tr { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .summary-table .total-row { font-weight: bold; font-size: 18px; color: #B12704; border-top: 2px solid #ddd; border-bottom: none; padding: 15px 0; }
        .button { display: inline-block; background-color: #ffd814; color: #0f1111; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 13px; text-align: center; }
        .tagline { font-weight: bold; color: #ffd814; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-body">
            <div class="header">
                <div class="logo">🛍️ ESC Wear</div>
            </div>

            <div class="greeting">شكراً لطلبك!</div>

            <div class="content">
                <p>مرحباً <strong>' . htmlspecialchars(explode(' ', $name)[0]) . '</strong>،</p>
                <p>شكرًا لاختيارك ESC Wear! لقد تم استلام طلبك بنجاح، وفريقنا الآن يعمل بعناية لتحضيره خصيصًا لك. كل قطعة مصممة لتمنحك حرية الحركة مع الحفاظ على أصالتك — بدون أي تنازلات.</p>
            </div>

            <div class="section">
                <div class="section-title">✓ تم تأكيد الطلب</div>
                <div class="detail-item"><strong>رقم الطلب:</strong> ' . htmlspecialchars($order['order_number']) . '</div>
                <div class="detail-item"><strong>تاريخ الطلب:</strong> ' . date('d/m/Y', strtotime($order['created_at'])) . '</div>
                <div class="detail-item"><strong>موعد التسليم المتوقع:</strong> 2-3 أيام عمل</div>
            </div>

            <div class="section">
                <div class="section-title">📦 عناصر الطلب</div>
                <table class="order-table">
                    <thead>
                        <tr>
                            <th style="text-align: right;">المنتج</th>
                            <th style="text-align: center;">الكمية</th>
                            <th style="text-align: left;">السعر</th>
                            <th style="text-align: left;">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ' . $itemsTable . '
                    </tbody>
                </table>
            </div>

            <div class="section">
                <div class="section-title">💰 ملخص الطلب</div>
                <div style="margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
                        <span>الإجمالي الفرعي:</span>
                        <span>ج.م ' . number_format(floatval($order['subtotal'] ?? 0), 2) . '</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
                        <span>الشحن:</span>
                        <span><strong>ج.م ' . number_format(floatval($order['shipping_cost'] ?? 0), 2) . '</strong></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 15px 0; font-weight: bold; font-size: 18px; color: #B12704; border-top: 2px solid #ddd;">
                        <span>الإجمالي:</span>
                        <span>ج.م ' . number_format(floatval($order['total'] ?? 0), 2) . '</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">📍 عنوان الشحن</div>
                <div class="detail-item">' . htmlspecialchars($addressLine) . '</div>
            </div>

            <div class="content" style="text-align: center;">
                <p>سنرسل لك تحديثات الشحن عبر البريد الإلكتروني. سيتم معالجة الطلب وشحنه قريباً.</p>
                <a href="' . htmlspecialchars($trackingUrl) . '" class="button">تتبع طلبك</a>
            </div>

            <div class="section" style="background-color: #fffbf0; border-right-color: #ffd814;">
                <p style="margin: 0; color: #0f1111;">💡 <strong>انضمي إلى مجتمع ESC</strong></p>
                <p style="margin: 5px 0; color: #555; font-size: 14px;">تواصلي مع نساء يتحركن بثقة: <strong>@esc.wear_ | @esc.community_</strong></p>
            </div>

            <div class="footer">
                <p style="margin: 0;">مع كل الحب،<br><strong style="font-size: 16px;">فريق ESC Wear</strong></p>
                <p class="tagline">ESC-ing the average life! 🌟</p>
                <p style="margin-top: 15px; font-size: 12px; color: #999;">هذا بريد آلي. يرجى عدم الرد عليه مباشرة. للدعم، تواصل معنا من خلال موقعنا.</p>
            </div>
        </div>
    </div>
</body>
</html>';
    }
}
