<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\CIBPaymentService;
use App\Models\Order;

/**
 * Payment Controller
 */
class PaymentController
{
    private $paymentService;
    private $orderModel;
    
    public function __construct()
    {
        $this->paymentService = new CIBPaymentService();
        $this->orderModel = new Order();
    }
    
    /**
     * Initialize payment for an order
     */
    public function initialize(Request $request, $orderId)
    {
        try {
            $order = $this->orderModel->find($orderId);
            
            if (!$order) {
                return Response::notFound('Order not found');
            }
            
            // Check if order belongs to user
            if ($order['user_id'] != $request->user_id) {
                return Response::forbidden('Access denied');
            }
            
            // Check if order is already paid
            if ($order['payment_status'] === 'paid') {
                return Response::error('Order is already paid');
            }
            
            // Get payment URL
            $paymentUrl = $this->paymentService->getPaymentUrl($orderId);
            
            return Response::success([
                'payment_url' => $paymentUrl,
                'order_id' => $orderId,
                'order_number' => $order['order_number'],
                'amount' => $order['total'],
            ], 'Payment initialized successfully');
            
        } catch (\Exception $e) {
            return Response::error('Payment initialization failed: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Process payment with card details
     */
    public function process(Request $request)
    {
        $validator = new \App\Core\Validator($request->all(), [
            'order_id' => 'required|integer|exists:orders,id',
            'card_number' => 'required|string|min:16|max:19',
            'cardholder_name' => 'required|string|min:3|max:255',
            'expiry_month' => 'required|string|size:2',
            'expiry_year' => 'required|string|size:2',
            'cvv' => 'required|string|min:3|max:4',
        ]);
        
        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }
        
        try {
            $orderId = $request->input('order_id');
            $order = $this->orderModel->find($orderId);
            
            if (!$order) {
                return Response::notFound('Order not found');
            }
            
            // Check if order belongs to user
            if ($order['user_id'] != $request->user_id) {
                return Response::forbidden('Access denied');
            }
            
            // Check if order is already paid
            if ($order['payment_status'] === 'paid') {
                return Response::error('Order is already paid');
            }
            
            // Validate card number (Luhn algorithm)
            $cardNumber = preg_replace('/\s+/', '', $request->input('card_number'));
            if (!$this->validateCardNumber($cardNumber)) {
                return Response::error('Invalid card number');
            }
            
            // Validate expiry date
            $expiryMonth = (int)$request->input('expiry_month');
            $expiryYear = (int)$request->input('expiry_year');
            $currentYear = (int)date('y');
            $currentMonth = (int)date('m');
            
            if ($expiryYear < $currentYear || ($expiryYear === $currentYear && $expiryMonth < $currentMonth)) {
                return Response::error('Card has expired');
            }
            
            // Prepare payment data for CIB Bank
            // Note: Card details are NOT stored - only sent to CIB Bank securely
            $paymentData = [
                'order_id' => $order['order_number'],
                'amount' => $order['total'],
                'currency' => $order['currency'],
                'card_number' => $cardNumber,
                'cardholder_name' => $request->input('cardholder_name'),
                'expiry_month' => str_pad($expiryMonth, 2, '0', STR_PAD_LEFT),
                'expiry_year' => str_pad($expiryYear, 2, '0', STR_PAD_LEFT),
                'cvv' => $request->input('cvv'),
                'customer_email' => $this->getUserEmail($order['user_id']),
                'timestamp' => time(),
            ];
            
            // Get payment URL from CIB Bank service
            // The service will handle secure transmission to CIB Bank
            $paymentUrl = $this->paymentService->processPaymentWithCard($orderId, $paymentData);
            
            // Log payment attempt (without sensitive data)
            error_log("Payment attempt for order {$order['order_number']} - Amount: {$order['total']} {$order['currency']}");
            
            return Response::success([
                'payment_url' => $paymentUrl,
                'order_id' => $orderId,
                'order_number' => $order['order_number'],
                'amount' => $order['total'],
            ], 'Payment processed successfully. Redirecting to secure payment gateway...');
            
        } catch (\Exception $e) {
            error_log('Payment processing error: ' . $e->getMessage());
            return Response::error('Payment processing failed: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Validate card number using Luhn algorithm
     */
    private function validateCardNumber($cardNumber)
    {
        // Remove all non-digits
        $cardNumber = preg_replace('/\D/', '', $cardNumber);
        
        // Check length
        if (strlen($cardNumber) < 13 || strlen($cardNumber) > 19) {
            return false;
        }
        
        // Luhn algorithm
        $sum = 0;
        $numDigits = strlen($cardNumber);
        $parity = $numDigits % 2;
        
        for ($i = 0; $i < $numDigits; $i++) {
            $digit = (int)$cardNumber[$i];
            
            if ($i % 2 == $parity) {
                $digit *= 2;
            }
            
            if ($digit > 9) {
                $digit -= 9;
            }
            
            $sum += $digit;
        }
        
        return ($sum % 10) == 0;
    }
    
    /**
     * Get user email
     */
    private function getUserEmail($userId)
    {
        $userModel = new \App\Models\User();
        $user = $userModel->find($userId);
        return $user['email'] ?? '';
    }
    
    /**
     * Handle payment callback from CIB Bank
     */
    public function callback(Request $request)
    {
        try {
            $data = $request->all();
            
            $result = $this->paymentService->processCallback($data);
            
            if ($result['success']) {
                // Redirect to success page (frontend)
                $config = require APP_PATH . '/config/config.php';
                $successUrl = $config['app']['frontend_url'] . '/payment/success?order=' . $result['order']['order_number'];
                
                header('Location: ' . $successUrl);
                exit;
            } else {
                // Redirect to failure page
                $config = require APP_PATH . '/config/config.php';
                $failureUrl = $config['app']['frontend_url'] . '/payment/failed?order=' . $result['order']['order_number'];
                
                header('Location: ' . $failureUrl);
                exit;
            }
            
        } catch (\Exception $e) {
            return Response::error('Payment callback failed: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Handle payment cancellation
     */
    public function cancel(Request $request)
    {
        try {
            $orderNumber = $request->input('order');
            
            // Redirect to cancel page (frontend)
            $config = require APP_PATH . '/config/config.php';
            $cancelUrl = $config['app']['frontend_url'] . '/payment/cancelled?order=' . $orderNumber;
            
            header('Location: ' . $cancelUrl);
            exit;
            
        } catch (\Exception $e) {
            return Response::error('Payment cancellation failed: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Get payment status
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
            
            $status = $this->paymentService->getPaymentStatus($orderId);
            
            return Response::success($status);
            
        } catch (\Exception $e) {
            return Response::error('Failed to get payment status: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Refund payment (Admin only)
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

