<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\PaymobService;
use App\Models\Order;

/**
 * Payment Controller - Paymob Integration
 */
class PaymentController
{
    private $paymentService;
    private $orderModel;
    
    public function __construct()
    {
        $this->paymentService = new PaymobService();
        $this->orderModel = new Order();
    }
    
    /**
     * Initialize payment for an order and get the Paymob iframe URL
     * POST /api/payment/initialize/{orderId}
     */
    public function initialize(Request $request, $orderId)
    {
        try {
            $order = $this->orderModel->find($orderId);
            
            if (!$order) {
                return Response::notFound('Order not found');
            }
            
            // Check if order belongs to user
            if (empty($request->user_id) || $order['user_id'] != $request->user_id) {
                // If it is a guest order, verify view_token to make it secure
                $viewToken = $request->input('view_token') ?? $request->header('X-Guest-View-Token');
                $isOrderGuest = !empty($order['is_guest']) || !empty($order['guest_email']);
                
                if (!$isOrderGuest || empty($order['view_token']) || !hash_equals($order['view_token'], (string)$viewToken)) {
                    return Response::forbidden('Access denied');
                }
            }
            
            // Check if order is already paid
            if ($order['payment_status'] === 'paid') {
                return Response::error('Order is already paid');
            }
            
            // Get Paymob payment iframe URL
            $paymentUrl = $this->paymentService->getPaymentUrl($orderId);
            
            return Response::success([
                'payment_url' => $paymentUrl,
                'order_id' => $orderId,
                'order_number' => $order['order_number'],
                'amount' => $order['total'],
            ], 'Payment initialized successfully');
            
        } catch (\Exception $e) {
            error_log('Paymob payment initialization failed: ' . $e->getMessage());
            return Response::error('Payment initialization failed: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Secure Webhook Endpoint for Paymob (Transaction Processed Callback)
     * POST /api/payment/webhook
     */
    public function webhook(Request $request)
    {
        try {
            $payload = $request->all();
            
            // Validate HMAC signature to verify this request is genuinely from Paymob
            if (!$this->paymentService->verifyHmac($payload)) {
                error_log('Paymob webhook HMAC verification failed.');
                return Response::forbidden('Invalid signature');
            }
            
            // Process the transaction results and update MySQL tables
            $result = $this->paymentService->processWebhook($payload);
            
            return Response::success([
                'processed' => true,
                'status' => $result['status'],
                'order_number' => $result['order']['order_number'] ?? null
            ], 'Webhook processed successfully');
            
        } catch (\Exception $e) {
            error_log('Paymob webhook processing error: ' . $e->getMessage());
            return Response::error('Webhook processing failed: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Handle payment redirection callback from Paymob (Transaction Response Callback)
     * GET /api/payment/callback
     */
    public function callback(Request $request)
    {
        try {
            $data = $request->all();
            
            // Redirect to success or failure page on the React frontend
            $success = $request->input('success') === 'true';
            $paymobOrderId = $request->input('order');
            
            // Find order details
            $db = \App\Core\Database::getInstance();
            $sql = "SELECT id, order_number, view_token FROM orders WHERE transaction_reference = ? LIMIT 1";
            $order = $db->fetch($sql, [$paymobOrderId]);
            
            if (!$order) {
                // Try fallback by merchant_order_id / merchant_txn_ref if present
                $orderNumber = $request->input('merchant_order_id');
                if ($orderNumber) {
                    $order = $this->orderModel->findByOrderNumber($orderNumber);
                }
            }
            
            $config = require APP_PATH . '/config/config.php';
            $frontendUrl = $config['app']['frontend_url'];
            
            $orderNumber = $order ? $order['order_number'] : ($request->input('merchant_order_id') ?? 'unknown');
            $orderId = $order ? $order['id'] : 'unknown';
            $viewTokenParam = ($order && !empty($order['view_token'])) ? '&view_token=' . $order['view_token'] : '';
            
            if ($success) {
                // If it is success, we also verify in DB or let the webhook handle it.
                // Redirect user to Success Page
                $redirectUrl = $frontendUrl . 'payment/success?order=' . $orderNumber . '&id=' . $orderId . $viewTokenParam;
            } else {
                // Redirect user to Failed Page
                $redirectUrl = $frontendUrl . 'payment/failed?order=' . $orderNumber . '&id=' . $orderId . $viewTokenParam;
            }
            
            header('Location: ' . $redirectUrl);
            exit;
            
        } catch (\Exception $e) {
            error_log('Paymob callback redirect failed: ' . $e->getMessage());
            return Response::error('Payment callback failed: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Handle payment cancellation
     * GET /api/payment/cancel
     */
    public function cancel(Request $request)
    {
        try {
            $orderNumber = $request->input('order') ?? 'unknown';
            
            // Redirect to cancel page (frontend)
            $config = require APP_PATH . '/config/config.php';
            $cancelUrl = $config['app']['frontend_url'] . 'payment/cancelled?order=' . $orderNumber;
            
            header('Location: ' . $cancelUrl);
            exit;
            
        } catch (\Exception $e) {
            return Response::error('Payment cancellation failed: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Get payment status
     * GET /api/payment/status/{orderId}
     */
    public function status(Request $request, $orderId)
    {
        try {
            $order = $this->orderModel->find($orderId);
            
            if (!$order) {
                return Response::notFound('Order not found');
            }
            
            // Check if order belongs to user (or user is admin)
            if ($order['user_id'] != $request->user_id && $request->user_role !== 'admin') {
                return Response::forbidden('Access denied');
            }
            
            // Read status from payments table
            $db = \App\Core\Database::getInstance();
            $sql = "SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1";
            $payment = $db->fetch($sql, [$orderId]);
            
            if (!$payment) {
                return Response::success([
                    'status' => 'not_found',
                    'message' => 'No payment transaction found',
                ]);
            }
            
            return Response::success([
                'status' => $payment['status'],
                'transaction_id' => $payment['transaction_id'],
                'amount' => $payment['amount'],
                'currency' => $payment['currency'],
                'created_at' => $payment['created_at'],
            ]);
            
        } catch (\Exception $e) {
            return Response::error('Failed to get payment status: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Refund payment (Admin only)
     * POST /api/admin/payment/{orderId}/refund
     */
    public function refund(Request $request, $orderId)
    {
        try {
            $amount = $request->input('amount'); // Optional partial refund
            
            $result = $this->paymentService->refundPayment($orderId, $amount);
            
            if ($result['success']) {
                return Response::success($result, 'Payment refunded successfully');
            } else {
                return Response::error('Refund failed: ' . ($result['message'] ?? 'Unknown error'));
            }
            
        } catch (\Exception $e) {
            return Response::error('Refund failed: ' . $e->getMessage(), null, 500);
        }
    }
}
