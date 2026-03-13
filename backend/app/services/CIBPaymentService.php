<?php
namespace App\Services;

use App\Models\Order;

/**
 * CIB Bank Payment Gateway Integration
 * 
 * Note: This is a sample implementation. 
 * Please refer to CIB Bank's official API documentation for exact parameters and endpoints.
 */
class CIBPaymentService
{
    private $config;
    private $orderModel;
    
    public function __construct()
    {
        $this->config = require APP_PATH . '/config/config.php';
        $this->orderModel = new Order();
    }
    
    /**
     * Initialize payment
     */
    public function initializePayment($orderId)
    {
        $order = $this->orderModel->find($orderId);
        
        if (!$order) {
            throw new \Exception('Order not found');
        }
        
        // Prepare payment data
        $paymentData = [
            'merchant_id' => $this->config['cib_payment']['merchant_id'],
            'order_id' => $order['order_number'],
            'amount' => $order['total'],
            'currency' => $order['currency'],
            'return_url' => $this->config['cib_payment']['return_url'],
            'cancel_url' => $this->config['cib_payment']['cancel_url'],
            'customer_email' => $this->getUserEmail($order['user_id']),
            'timestamp' => time(),
        ];
        
        // Generate secure hash
        $paymentData['hash'] = $this->generateHash($paymentData);
        
        // Create payment transaction record
        $this->createPaymentTransaction($orderId, $paymentData);
        
        return $paymentData;
    }
    
    /**
     * Generate payment URL
     */
    public function getPaymentUrl($orderId)
    {
        $paymentData = $this->initializePayment($orderId);
        
        // Build payment URL with parameters
        $url = $this->config['cib_payment']['api_url'] . '/payment/init?';
        $url .= http_build_query($paymentData);
        
        return $url;
    }
    
    /**
     * Process payment with card details
     * This method securely sends card details to CIB Bank API
     */
    public function processPaymentWithCard($orderId, $cardData)
    {
        $order = $this->orderModel->find($orderId);
        
        if (!$order) {
            throw new \Exception('Order not found');
        }
        
        // Prepare payment data for CIB Bank API
        $paymentData = [
            'merchant_id' => $this->config['cib_payment']['merchant_id'],
            'order_id' => $order['order_number'],
            'amount' => $order['total'],
            'currency' => $order['currency'],
            'return_url' => $this->config['cib_payment']['return_url'],
            'cancel_url' => $this->config['cib_payment']['cancel_url'],
            'customer_email' => $this->getUserEmail($order['user_id']),
            // Card details (will be encrypted by CIB Bank)
            'card_number' => $cardData['card_number'],
            'cardholder_name' => $cardData['cardholder_name'],
            'expiry_month' => $cardData['expiry_month'],
            'expiry_year' => $cardData['expiry_year'],
            'cvv' => $cardData['cvv'],
            'timestamp' => time(),
        ];
        
        // Generate secure hash
        $paymentData['hash'] = $this->generateHash($paymentData);
        
        // Create payment transaction record (without storing card details)
        $transactionData = $paymentData;
        unset($transactionData['card_number'], $transactionData['cvv']); // Don't store sensitive data
        $this->createPaymentTransaction($orderId, $transactionData);
        
        // Send payment request to CIB Bank API via secure HTTPS POST
        // This is the secure way to send card details to CIB Bank
        $apiUrl = $this->config['cib_payment']['api_url'] . '/payment/process';
        
        // Use cURL to send secure POST request to CIB Bank
        $ch = curl_init($apiUrl);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($paymentData),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/x-www-form-urlencoded',
                'Accept: application/json'
            ],
            CURLOPT_TIMEOUT => 30
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($curlError) {
            error_log('CIB Bank API Error: ' . $curlError);
            throw new \Exception('Failed to connect to payment gateway');
        }
        
        if ($httpCode !== 200) {
            error_log('CIB Bank API returned HTTP ' . $httpCode);
            throw new \Exception('Payment gateway error');
        }
        
        // Parse response from CIB Bank
        $responseData = json_decode($response, true);
        
        if (isset($responseData['payment_url'])) {
            // CIB Bank returned a payment URL - redirect user there
            return $responseData['payment_url'];
        } elseif (isset($responseData['redirect_url'])) {
            // Alternative: redirect URL
            return $responseData['redirect_url'];
        } else {
            // Fallback: build payment URL (for testing/development)
            // In production, CIB Bank should always return a URL
            $url = $this->config['cib_payment']['api_url'] . '/payment/init?';
            $urlParams = $paymentData;
            unset($urlParams['card_number'], $urlParams['cvv']); // Don't put sensitive data in URL
            $url .= http_build_query($urlParams);
            
            error_log('Warning: CIB Bank did not return payment_url. Using fallback URL.');
            return $url;
        }
    }
    
    /**
     * Process payment callback
     */
    public function processCallback($data)
    {
        // Verify hash
        if (!$this->verifyHash($data)) {
            throw new \Exception('Invalid payment hash');
        }
        
        $orderNumber = $data['order_id'];
        $status = $data['status'] ?? 'failed';
        $transactionId = $data['transaction_id'] ?? null;
        
        // Find order
        $order = $this->orderModel->findByOrderNumber($orderNumber);
        
        if (!$order) {
            throw new \Exception('Order not found');
        }
        
        // Update payment transaction
        $this->updatePaymentTransaction($order['id'], [
            'transaction_id' => $transactionId,
            'status' => $status,
            'gateway_response' => json_encode($data),
        ]);
        
        // Update order payment status
        if ($status === 'success') {
            $this->orderModel->updatePaymentStatus($order['id'], 'paid');
            $this->orderModel->updateStatus($order['id'], 'processing');
            
            // Send invoice email with PDF after payment confirmation
            try {
                $emailService = new \App\Services\EmailService();
                $emailService->sendOrderInvoice($order['id']);
            } catch (\Exception $e) {
                // Log error but don't fail payment processing
                error_log('Failed to send order invoice email: ' . $e->getMessage());
            }
        } else {
            $this->orderModel->updatePaymentStatus($order['id'], 'failed');
        }
        
        return [
            'success' => $status === 'success',
            'order' => $order,
            'message' => $status === 'success' ? 'Payment successful' : 'Payment failed',
        ];
    }
    
    /**
     * Refund payment
     */
    public function refundPayment($orderId, $amount = null)
    {
        $order = $this->orderModel->find($orderId);
        
        if (!$order) {
            throw new \Exception('Order not found');
        }
        
        // Get original transaction
        $transaction = $this->getPaymentTransaction($orderId);
        
        if (!$transaction || $transaction['status'] !== 'success') {
            throw new \Exception('No successful payment found for this order');
        }
        
        $refundAmount = $amount ?? $order['total'];
        
        // Prepare refund request
        $refundData = [
            'merchant_id' => $this->config['cib_payment']['merchant_id'],
            'transaction_id' => $transaction['transaction_id'],
            'amount' => $refundAmount,
            'currency' => $order['currency'],
            'timestamp' => time(),
        ];
        
        $refundData['hash'] = $this->generateHash($refundData);
        
        // Send refund request to CIB
        $response = $this->sendRefundRequest($refundData);
        
        if ($response['success']) {
            // Update order status
            $this->orderModel->updatePaymentStatus($orderId, 'refunded');
            $this->orderModel->updateStatus($orderId, 'refunded');
            
            // Create refund transaction record
            $this->createPaymentTransaction($orderId, [
                'transaction_id' => $response['refund_transaction_id'] ?? null,
                'amount' => $refundAmount,
                'status' => 'refunded',
                'gateway_response' => json_encode($response),
            ]);
        }
        
        return $response;
    }
    
    /**
     * Generate secure hash
     */
    private function generateHash($data)
    {
        // Remove hash field if exists
        unset($data['hash']);
        
        // Sort data alphabetically
        ksort($data);
        
        // Create hash string
        $hashString = '';
        foreach ($data as $key => $value) {
            $hashString .= $key . '=' . $value . '&';
        }
        
        // Add secure hash key
        $hashString .= $this->config['cib_payment']['secure_hash'];
        
        // Generate SHA256 hash
        return hash('sha256', $hashString);
    }
    
    /**
     * Verify hash from callback
     */
    private function verifyHash($data)
    {
        if (!isset($data['hash'])) {
            return false;
        }
        
        $receivedHash = $data['hash'];
        $calculatedHash = $this->generateHash($data);
        
        return hash_equals($calculatedHash, $receivedHash);
    }
    
    /**
     * Create payment transaction record
     */
    private function createPaymentTransaction($orderId, $data)
    {
        $db = \App\Core\Database::getInstance();
        
        $sql = "
            INSERT INTO payment_transactions 
            (order_id, transaction_id, payment_gateway, amount, currency, status, gateway_response, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ";
        
        return $db->execute($sql, [
            $orderId,
            $data['transaction_id'] ?? null,
            'cib_bank',
            $data['amount'] ?? 0,
            $data['currency'] ?? 'EGP',
            $data['status'] ?? 'pending',
            json_encode($data),
            $_SERVER['REMOTE_ADDR'] ?? null,
        ]);
    }
    
    /**
     * Update payment transaction
     */
    private function updatePaymentTransaction($orderId, $data)
    {
        $db = \App\Core\Database::getInstance();
        
        $sql = "
            UPDATE payment_transactions 
            SET transaction_id = ?, status = ?, gateway_response = ?, updated_at = NOW()
            WHERE order_id = ? AND payment_gateway = 'cib_bank'
            ORDER BY created_at DESC LIMIT 1
        ";
        
        return $db->execute($sql, [
            $data['transaction_id'] ?? null,
            $data['status'] ?? 'pending',
            $data['gateway_response'] ?? null,
            $orderId,
        ]);
    }
    
    /**
     * Get payment transaction
     */
    private function getPaymentTransaction($orderId)
    {
        $db = \App\Core\Database::getInstance();
        
        $sql = "
            SELECT * FROM payment_transactions 
            WHERE order_id = ? AND payment_gateway = 'cib_bank' 
            ORDER BY created_at DESC LIMIT 1
        ";
        
        return $db->fetch($sql, [$orderId]);
    }
    
    /**
     * Get user email
     */
    private function getUserEmail($userId)
    {
        $db = \App\Core\Database::getInstance();
        
        $sql = "SELECT email FROM users WHERE id = ? LIMIT 1";
        $user = $db->fetch($sql, [$userId]);
        
        return $user['email'] ?? '';
    }
    
    /**
     * Send refund request
     */
    private function sendRefundRequest($data)
    {
        // This should make an actual HTTP request to CIB API
        // Using cURL or similar
        
        $url = $this->config['cib_payment']['api_url'] . '/payment/refund';
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            return json_decode($response, true);
        }
        
        return [
            'success' => false,
            'message' => 'Refund request failed',
        ];
    }
    
    /**
     * Get payment status
     */
    public function getPaymentStatus($orderId)
    {
        $transaction = $this->getPaymentTransaction($orderId);
        
        if (!$transaction) {
            return [
                'status' => 'not_found',
                'message' => 'No payment transaction found',
            ];
        }
        
        return [
            'status' => $transaction['status'],
            'transaction_id' => $transaction['transaction_id'],
            'amount' => $transaction['amount'],
            'currency' => $transaction['currency'],
            'created_at' => $transaction['created_at'],
        ];
    }
}

