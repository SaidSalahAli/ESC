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
            $mailer->Subject = 'Your ESC Wear Order Confirmation - ' . $order['order_number'];
            $mailer->isHTML(true);

            // Build email body
            $baseUrl = $_ENV['APP_URL'] ?? 'https://escwear.com';
            $trackingUrl = "{$baseUrl}/guest-order-track/{$order['order_number']}?token={$viewToken}";

            $mailer->Body = "
                <h2>Thank you for your order!</h2>
                <p>Dear {$name},</p>
                <p>We have received your order and will process it shortly.</p>
                <p><strong>Order Number:</strong> {$order['order_number']}</p>
                <p><strong>Order Total:</strong> EGP {$order['total']}</p>
                <p><strong>Shipping Address:</strong><br>
                {$order['shipping_address']['first_name']} {$order['shipping_address']['last_name']}<br>
                {$order['shipping_address']['address_line1']}<br>
                {$order['shipping_address']['city']}, {$order['shipping_address']['governorate']}<br>
                {$order['shipping_address']['country']}</p>
                <p><a href='{$trackingUrl}'>Track your order</a></p>
                <p>Best regards,<br>ESC Wear Team</p>
            ";

            $mailer->AltBody = "Thank you for your order. Your order number is {$order['order_number']}";

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
}
