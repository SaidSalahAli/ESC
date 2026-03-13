<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Models\Order;
use App\Models\Cart;
use App\Models\User;
use App\Helpers\Validator;
use App\Services\InvoicePdfService;
use App\Services\EmailService;

/**
 * Order Controller
 */
class OrderController
{
    private $orderModel;
    private $cartModel;

    public function __construct()
    {
        $this->orderModel = new Order();
        $this->cartModel  = new Cart();
    }

    // ── GET /orders ──────────────────────────────────────────────────
    public function index(Request $request)
    {
        try {
            $page   = (int)$request->input('page', 1);
            $limit  = (int)$request->input('limit', 10);
            $offset = ($page - 1) * $limit;

            $orders = $this->orderModel->getUserOrders($request->user_id, $limit, $offset);
            $total  = $this->orderModel->count('user_id = ?', [$request->user_id]);

            return Response::success([
                'orders'     => $orders,
                'pagination' => [
                    'page'  => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit),
                ],
            ]);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch orders: ' . $e->getMessage(), null, 500);
        }
    }

    // ── GET /orders/:id ──────────────────────────────────────────────
    public function show(Request $request, $orderId)
    {
        try {
            $order = $this->orderModel->getOrderDetails($orderId);
            if (!$order) return Response::notFound('Order not found');

            if ($order['user_id'] != $request->user_id && $request->user_role !== 'admin') {
                return Response::forbidden('Access denied');
            }

            return Response::success($order);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch order: ' . $e->getMessage(), null, 500);
        }
    }

    // ── POST /orders ─────────────────────────────────────────────────
    public function create(Request $request)
    {
        // ── 1. Validate payment method ───────────────────────────────
        $paymentMethod = $request->input('payment_method');
        if (!in_array($paymentMethod, ['cib_bank', 'cash_on_delivery'])) {
            return Response::validationError(['payment_method' => 'Invalid payment method']);
        }

        // ── 2. Handle shipping address ───────────────────────────────
        $db                = Database::getInstance();
        $shippingAddressId = null;
        $shippingAddress   = $request->input('shipping_address');
        $contactPhone      = null;

        if ($shippingAddress && is_array($shippingAddress)) {

            $addressValidator = new Validator($shippingAddress, [
                'first_name'    => 'required|string|max:100',
                'last_name'     => 'required|string|max:100',
                'phone'         => 'required|string|max:20',
                'address_line1' => 'required|string|max:255',
                'address_line2' => 'string|max:255',
                'city'          => 'required|string|max:100',
                'state'         => 'string|max:100',
                'postal_code'   => 'string|max:20',
                'country'       => 'string|max:100',
                'governorate'   => 'required|string|max:100',
            ]);

            if (!$addressValidator->validate()) {
                return Response::validationError($addressValidator->errors());
            }

            $contactPhone = trim($shippingAddress['phone']);

            $sql = "INSERT INTO addresses (
                        user_id, first_name, last_name, phone,
                        address_line1, address_line2, city, state,
                        postal_code, country, governorate, is_default
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $db->execute($sql, [
                $request->user_id,
                trim($shippingAddress['first_name']),
                trim($shippingAddress['last_name']),
                $contactPhone,
                $shippingAddress['address_line1'],
                $shippingAddress['address_line2'] ?? null,
                $shippingAddress['city'],
                $shippingAddress['state']       ?? null,
                $shippingAddress['postal_code'] ?? null,
                $shippingAddress['country']     ?? 'Egypt',
                trim($shippingAddress['governorate']),
                0
            ]);

            $shippingAddressId = $db->lastInsertId();
        } else {
            $shippingAddressId = $request->input('shipping_address_id');
            if (!$shippingAddressId) {
                return Response::validationError(['shipping_address' => 'Shipping address is required']);
            }

            $address = $db->fetch(
                "SELECT id, phone FROM addresses WHERE id = ? AND user_id = ?",
                [$shippingAddressId, $request->user_id]
            );
            if (!$address) {
                return Response::validationError(['shipping_address_id' => 'Invalid shipping address']);
            }

            $contactPhone = isset($address['phone']) ? trim($address['phone']) : null;
        }

        // ── 3. Update user phone if missing ──────────────────────────
        if ($contactPhone) {
            $db->execute(
                "UPDATE users SET phone = ? WHERE id = ? AND (phone IS NULL OR phone = '')",
                [$contactPhone, $request->user_id]
            );
        }

        // ── 4. Validate notes ────────────────────────────────────────
        $notes = $request->input('notes', '');
        if (strlen($notes) > 500) {
            return Response::validationError(['notes' => 'Notes must be less than 500 characters']);
        }

        try {
            // ── 5. Validate cart ─────────────────────────────────────
            $validation = $this->cartModel->validateCart($request->user_id);
            if (!$validation['valid']) {
                $errorMessage = !empty($validation['errors'])
                    ? implode('. ', $validation['errors'])
                    : 'Cart validation failed';
                return Response::error($errorMessage, $validation['errors'], 422);
            }

            $cartItems = $this->cartModel->prepareCheckout($request->user_id);
            if (empty($cartItems)) {
                return Response::error('Cart is empty');
            }

            // ── 6. Calculate totals ──────────────────────────────────
            $shippingCost   = (float)$request->input('shipping_cost', 50);
            $couponDiscount = 0;
            $totals         = $this->orderModel->calculateTotals($cartItems, $shippingCost, $couponDiscount);

            // ── 7. Build order data ──────────────────────────────────
            $orderData = [
                'user_id'             => $request->user_id,
                'status'              => 'pending',
                'payment_status'      => 'pending',
                'payment_method'      => $paymentMethod,
                'subtotal'            => $totals['subtotal'],
                'shipping_cost'       => $totals['shipping_cost'],
                'discount'            => $totals['discount'],
                'total'               => $totals['total'],
                'currency'            => 'EGP',
                'shipping_address_id' => $shippingAddressId,
                'billing_address_id'  => $request->input('billing_address_id') ?: $shippingAddressId,
                'notes'               => $notes,
            ];

            // ── 8. Create order ──────────────────────────────────────
            $orderId = $this->orderModel->createOrder($orderData, $cartItems);
            if (!$orderId) return Response::error('Failed to create order');

            // ── 9. Clear cart ────────────────────────────────────────
            $this->cartModel->clearCart($request->user_id);

            $order = $this->orderModel->getOrderDetails($orderId);

            // ── 10. Notify admins ────────────────────────────────────
            try {
                $notificationModel = new \App\Models\Notification();
                $userName = isset($order['user'])
                    ? ($order['user']['first_name'] . ' ' . $order['user']['last_name'])
                    : 'Customer';
                $notificationModel->notifyAdmins(
                    'order',
                    'New Order Received',
                    "New order #{$order['order_number']} has been placed by {$userName}. Total: {$order['total']} EGP",
                    "/dashboard/orders/{$orderId}",
                    $orderId
                );
            } catch (\Exception $e) {
                error_log('Failed to create order notification: ' . $e->getMessage());
            }

            // ── 11. Send invoice email in user's preferred language ───
            try {
                $userModel    = new User();
                $user         = $userModel->find($request->user_id);

                // ✅ Use user's preferred_language, fallback to 'en'
                $userLanguage = $user['preferred_language'] ?? 'en';
                $userLanguage = in_array($userLanguage, ['ar', 'en']) ? $userLanguage : 'en';

                $emailService = new EmailService();
                $pdfService   = new InvoicePdfService();
                $pdfContent   = $pdfService->generateInvoicePdf($orderId, $userLanguage);
                $emailService->sendOrderInvoiceWithPdfAttachment($orderId, $pdfContent, $userLanguage);
            } catch (\Exception $e) {
                error_log('Failed to send order invoice email: ' . $e->getMessage());
            }

            return Response::success($order, 'Order created successfully', 201);
        } catch (\Exception $e) {
            return Response::error('Failed to create order: ' . $e->getMessage(), null, 500);
        }
    }

    // ── POST /orders/:id/cancel ──────────────────────────────────────
    public function cancel(Request $request, $orderId)
    {
        try {
            $order = $this->orderModel->find($orderId);
            if (!$order) return Response::notFound('Order not found');

            if ($order['user_id'] != $request->user_id) return Response::forbidden('Access denied');

            if (!in_array($order['status'], ['pending', 'processing'])) {
                return Response::error('Order cannot be cancelled');
            }

            $this->orderModel->updateStatus($orderId, 'cancelled');
            $order = $this->orderModel->find($orderId);

            return Response::success($order, 'Order cancelled successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to cancel order: ' . $e->getMessage(), null, 500);
        }
    }

    // ── GET /orders/track/:orderNumber ───────────────────────────────
    public function track(Request $request, $orderNumber)
    {
        try {
            $order = $this->orderModel->findByOrderNumber($orderNumber);
            if (!$order) return Response::notFound('Order not found');

            if ($order['user_id'] != $request->user_id && $request->user_role !== 'admin') {
                return Response::forbidden('Access denied');
            }

            return Response::success($this->orderModel->getOrderDetails($order['id']));
        } catch (\Exception $e) {
            return Response::error('Failed to track order: ' . $e->getMessage(), null, 500);
        }
    }

    // ── POST /orders/scan-barcode ────────────────────────────────────
    public function scanBarcode(Request $request)
    {
        $validator = new Validator($request->all(), ['barcode' => 'required|string']);
        if (!$validator->validate()) return Response::validationError($validator->errors());

        try {
            $order = $this->orderModel->findByOrderNumber($request->input('barcode'));
            if (!$order) return Response::notFound('Order not found');
            return Response::success($this->orderModel->getOrderDetails($order['id']), 'Order found');
        } catch (\Exception $e) {
            return Response::error('Failed to scan barcode: ' . $e->getMessage(), null, 500);
        }
    }

    // ── POST /orders/:id/return-item ─────────────────────────────────
    public function returnItemToStock(Request $request, $orderId)
    {
        $validator = new Validator($request->all(), [
            'order_item_id' => 'required|integer',
            'quantity'      => 'required|integer|min:1',
        ]);
        if (!$validator->validate()) return Response::validationError($validator->errors());

        try {
            if ($request->user_role !== 'admin') return Response::forbidden('Admin access required');

            $order = $this->orderModel->find($orderId);
            if (!$order) return Response::notFound('Order not found');

            $orderItemId = $request->input('order_item_id');
            $quantity    = (int)$request->input('quantity');
            $orderItem   = null;

            foreach ($this->orderModel->getOrderItems($orderId) as $item) {
                if ($item['id'] == $orderItemId) {
                    $orderItem = $item;
                    break;
                }
            }
            if (!$orderItem) return Response::notFound('Order item not found');
            if ($quantity > $orderItem['quantity']) return Response::error('Quantity cannot exceed order quantity');

            $db        = Database::getInstance();
            $variantId = $orderItem['variant_id'] ?? null;
            $db->beginTransaction();

            try {
                $result = (new \App\Models\Product())->returnToStock(
                    $orderItem['product_id'],
                    $quantity,
                    $variantId
                );
                if (!$result) {
                    $db->rollback();
                    return Response::error('Failed to return item to stock');
                }

                $db->commit();

                $stockQuery = $variantId
                    ? "SELECT stock_quantity FROM product_variants WHERE id = ?"
                    : "SELECT stock_quantity FROM products WHERE id = ?";
                $stockInfo  = $db->fetch($stockQuery, [$variantId ?? $orderItem['product_id']]);

                return Response::success([
                    'order_item_id'      => $orderItemId,
                    'quantity_returned'  => $quantity,
                    'product_id'         => $orderItem['product_id'],
                    'variant_id'         => $variantId,
                    'new_stock_quantity' => $stockInfo['stock_quantity'] ?? null,
                    'product_name'       => $orderItem['product_name'] ?? null,
                ], 'Item returned to stock successfully');
            } catch (\Exception $e) {
                $db->rollback();
                return Response::error('Failed to return item to stock: ' . $e->getMessage());
            }
        } catch (\Exception $e) {
            return Response::error('Failed to return item to stock: ' . $e->getMessage(), null, 500);
        }
    }

    // ── GET /orders/:id/invoice-pdf ──────────────────────────────────
    /**
     * Query params:
     *   ?lang=ar|en     (default: user's preferred_language → 'en')
     *   ?download=1     (force file download)
     *   ?format=html    (return HTML — fallback for browsers that block PDF)
     */
    public function getInvoicePdf(Request $request, $orderId)
    {
        try {
            $order = $this->orderModel->find($orderId);
            if (!$order) return Response::notFound('Order not found');

            // ── Access control ───────────────────────────────────────
            $hasAccess = false;
            $viewToken = $request->input('view_token');

            if ($request->user_id && $request->user_role) {
                $hasAccess = ($order['user_id'] == $request->user_id || $request->user_role === 'admin');
            } elseif ($viewToken) {
                $config   = require __DIR__ . '/../../config/config.php';
                $appKey   = $config['app_key'] ?? 'default-secret-key';
                $expected = hash_hmac('sha256', $orderId . '|' . $order['user_id'], $appKey);
                $hasAccess = hash_equals($expected, $viewToken);
            }

            if (!$hasAccess) return Response::forbidden('Access denied');

            // ── Resolve language ─────────────────────────────────────
            // Priority: ?lang param → user's preferred_language → 'en'
            $requestedLang = $request->input('lang');

            if ($requestedLang && in_array($requestedLang, ['ar', 'en'])) {
                // Explicit lang param passed from frontend
                $lang = $requestedLang;
            } else {
                // Auto-detect from user's profile
                $userModel = new User();
                $user      = $userModel->find($order['user_id']);
                $lang      = $user['preferred_language'] ?? 'en';
                $lang      = in_array($lang, ['ar', 'en']) ? $lang : 'en';
            }

            $download = $request->input('download') === '1';
            $format   = $request->input('format', 'pdf');

            $pdfService = new InvoicePdfService();

            // ── HTML fallback ────────────────────────────────────────
            if ($format === 'html') {
                $html = $pdfService->generateInvoicePdf($orderId, $lang);
                if (ob_get_level()) ob_end_clean();
                header('Content-Type: text/html; charset=UTF-8');
                header('Cache-Control: no-cache');
                echo $html;
                exit;
            }

            // ── PDF output ───────────────────────────────────────────
            $pdfContent  = $pdfService->generateInvoicePdf($orderId, $lang);
            $filename    = 'Invoice_' . $order['order_number'] . ($lang === 'ar' ? '_ar' : '_en') . '.pdf';
            $disposition = $download ? 'attachment' : 'inline';

            if (ob_get_level()) ob_end_clean();
            header('Content-Type: application/pdf');
            header('Content-Disposition: ' . $disposition . '; filename="' . $filename . '"');
            header('Content-Length: ' . strlen($pdfContent));
            header('Cache-Control: private, max-age=0, must-revalidate');
            header('Pragma: public');
            echo $pdfContent;
            exit;
        } catch (\Exception $e) {
            error_log('Invoice error: ' . $e->getMessage());
            return Response::error('Failed to generate invoice: ' . $e->getMessage(), null, 500);
        }
    }
}
