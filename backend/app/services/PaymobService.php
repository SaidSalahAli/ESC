<?php

namespace App\Services;

use App\Models\Order;
use App\Core\Database;
use Exception;

/**
 * Paymob Payment Gateway Service
 * Handles secure connection and transactions with Paymob API
 */
class PaymobService
{
    private $config;
    private $orderModel;
    private $db;

    public function __construct()
    {
        $this->config = require APP_PATH . '/config/config.php';
        $this->orderModel = new Order();
        $this->db = Database::getInstance();
    }

    /**
     * Step 1: Authentication - Generate Auth Token
     *
     * @return string Authentication token
     * @throws Exception
     */
    private function getAuthToken()
    {
        $apiKey = $this->config['paymob']['api_key'];
        $baseUrl = $this->config['paymob']['base_url'];

        if (empty($apiKey)) {
            throw new Exception('Paymob API key is not configured in .env file');
        }

        $url = $baseUrl . '/auth/tokens';
        $data = ['api_key' => $apiKey];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            error_log('Paymob Auth curl error: ' . $curlError);
            throw new Exception('Failed to connect to payment gateway authentication');
        }

        if ($httpCode !== 201 && $httpCode !== 200) {
            error_log('Paymob Auth API returned HTTP ' . $httpCode . ' Response: ' . $response);
            throw new Exception('Authentication with payment gateway failed');
        }

        $responseData = json_decode($response, true);
        if (empty($responseData['token'])) {
            throw new Exception('Invalid response from payment gateway authentication');
        }

        return $responseData['token'];
    }

    /**
     * Step 2: Order Registration
     *
     * @param string $authToken
     * @param array $order
     * @return int Paymob Order ID
     * @throws Exception
     */
    private function createPaymobOrder($authToken, $order)
    {
        $baseUrl = $this->config['paymob']['base_url'];
        $url = $baseUrl . '/ecommerce/orders';

        // Paymob amount is in cents
        $amountCents = round($order['total'] * 100);

        // Map order items for hosted checkout presentation
        $paymobItems = [];
        $itemsSum = 0;

        if (!empty($order['items'])) {
            foreach ($order['items'] as $item) {
                $itemPriceCents = round($item['price'] * 100);
                $paymobItems[] = [
                    'name' => $item['product_name'] . (!empty($item['variant_name']) ? ' (' . $item['variant_name'] . ')' : ''),
                    'amount_cents' => $itemPriceCents,
                    'description' => $item['product_name'],
                    'quantity' => (int)$item['quantity']
                ];
                $itemsSum += $itemPriceCents * (int)$item['quantity'];
            }
        }

        if (!empty($order['shipping_cost']) && $order['shipping_cost'] > 0) {
            $shippingCents = round($order['shipping_cost'] * 100);
            $paymobItems[] = [
                'name' => 'Shipping & Delivery',
                'amount_cents' => $shippingCents,
                'description' => 'Shipping cost',
                'quantity' => 1
            ];
            $itemsSum += $shippingCents;
        }

        // Adjust for any discount or tax difference between sum of items and order total
        $diff = $amountCents - $itemsSum;
        if ($diff !== 0) {
            $paymobItems[] = [
                'name' => $diff < 0 ? 'Discount / Adjustment' : 'Tax / Adjustment',
                'amount_cents' => $diff,
                'description' => 'System price adjustment',
                'quantity' => 1
            ];
        }

        $data = [
            'auth_token' => $authToken,
            'delivery_needed' => false,
            'amount_cents' => $amountCents,
            'currency' => $order['currency'] ?? 'EGP',
            'merchant_order_id' => $order['order_number'],
            'items' => $paymobItems
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            error_log('Paymob Order creation curl error: ' . $curlError);
            throw new Exception('Failed to connect to payment gateway order registration');
        }

        if ($httpCode !== 201 && $httpCode !== 200) {
            error_log('Paymob Order creation API returned HTTP ' . $httpCode . ' Response: ' . $response);
            throw new Exception('Order registration with payment gateway failed');
        }

        $responseData = json_decode($response, true);
        if (empty($responseData['id'])) {
            throw new Exception('Invalid response from payment gateway order registration');
        }

        return $responseData['id'];
    }

    /**
     * Step 3: Payment Key Generation
     *
     * @param string $authToken
     * @param int $paymobOrderId
     * @param array $order
     * @param array $billingData
     * @return string Payment Token
     * @throws Exception
     */
    private function getPaymentKey($authToken, $paymobOrderId, $order, $billingData)
    {
        $baseUrl = $this->config['paymob']['base_url'];
        $integrationId = $this->config['paymob']['integration_id'];

        if (empty($integrationId)) {
            throw new Exception('Paymob Integration ID is not configured in .env file');
        }

        $url = $baseUrl . '/acceptance/payment_keys';
        $amountCents = round($order['total'] * 100);

        // Ensure all required billing fields exist and are strings (Paymob strict validation)
        $cleanBillingData = [
            'apartment' => !empty($billingData['address_line2']) ? $billingData['address_line2'] : 'NA',
            'email' => !empty($billingData['email']) ? $billingData['email'] : 'guest@escwear.com',
            'floor' => 'NA',
            'first_name' => !empty($billingData['first_name']) ? $billingData['first_name'] : 'Customer',
            'street' => !empty($billingData['address_line1']) ? $billingData['address_line1'] : 'NA',
            'building' => 'NA',
            'phone_number' => !empty($billingData['phone']) ? $billingData['phone'] : '+201000000000',
            'shipping_method' => 'PKG',
            'postal_code' => !empty($billingData['postal_code']) ? $billingData['postal_code'] : 'NA',
            'city' => !empty($billingData['city']) ? $billingData['city'] : 'Cairo',
            'country' => 'EG',
            'last_name' => !empty($billingData['last_name']) ? $billingData['last_name'] : 'Customer',
            'state' => !empty($billingData['governorate']) ? $billingData['governorate'] : 'Cairo'
        ];

        $data = [
            'auth_token' => $authToken,
            'amount_cents' => $amountCents,
            'expiration' => 3600,
            'order_id' => $paymobOrderId,
            'billing_data' => $cleanBillingData,
            'currency' => $order['currency'] ?? 'EGP',
            'integration_id' => (int)$integrationId,
            'lock_order_to_token' => true
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            error_log('Paymob Payment Key curl error: ' . $curlError);
            throw new Exception('Failed to connect to payment gateway session generator');
        }

        if ($httpCode !== 201 && $httpCode !== 200) {
            error_log('Paymob Payment Key API returned HTTP ' . $httpCode . ' Response: ' . $response);
            throw new Exception('Payment session generation failed: ' . ($responseData['detail'] ?? 'Invalid details'));
        }

        $responseData = json_decode($response, true);
        if (empty($responseData['token'])) {
            throw new Exception('Invalid response from payment gateway session generator');
        }

        return $responseData['token'];
    }

    /**
     * Initialize Paymob Payment and Return Iframe Redirection URL
     *
     * @param int $orderId Order Database ID
     * @return string Redirection URL for client
     * @throws Exception
     */
    public function getPaymentUrl($orderId)
    {
        $order = $this->orderModel->getOrderDetails($orderId);

        if (!$order) {
            throw new Exception('Order not found');
        }

        // Get shipping address or user profile for billing data
        $billingData = [];
        if (!empty($order['shipping_address'])) {
            $billingData = $order['shipping_address'];
        } else {
            $sql = "SELECT first_name, last_name, email, phone FROM users WHERE id = ?";
            $user = $this->db->fetch($sql, [$order['user_id']]);
            if ($user) {
                $billingData = [
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'email' => $user['email'],
                    'phone' => $user['phone']
                ];
            }
        }

        // Ensure email exists in billingData
        if (empty($billingData['email'])) {
            $billingData['email'] = $order['guest_email'] ?? $this->getUserEmail($order['user_id']);
        }
        if (empty($billingData['phone'])) {
            $billingData['phone'] = $order['guest_phone'] ?? '';
        }
        if (empty($billingData['first_name'])) {
            $billingData['first_name'] = $order['guest_name'] ?? 'Customer';
        }

        // Classic 3-step flow: Auth → Order → Payment Key → Iframe
        $authToken = $this->getAuthToken();
        $paymobOrderId = $this->createPaymobOrder($authToken, $order);
        $paymentToken = $this->getPaymentKey($authToken, $paymobOrderId, $order, $billingData);

        // Save paymob order ID to database for tracking
        $sql = "UPDATE orders SET transaction_reference = ? WHERE id = ?";
        $this->db->execute($sql, [$paymobOrderId, $orderId]);

        // Insert initial pending payment transaction records
        $this->createPaymentRecord($orderId, null, $order['total'], $order['currency'] ?? 'EGP', 'pending');
        $this->createPaymentTransaction($orderId, [
            'transaction_id' => null,
            'amount' => $order['total'],
            'currency' => $order['currency'] ?? 'EGP',
            'status' => 'pending',
            'paymob_order_id' => $paymobOrderId
        ]);

        // Build iframe URL using base_url from config
        // Supports both accept.paymob.com and accept-alpha.paymob.com
        $iframeId = $this->config['paymob']['iframe_id'];
        if (empty($iframeId)) {
            throw new Exception('Paymob Iframe ID is not configured in .env file');
        }

        $iframeHost = "https://accept.paymob.com";
        return $iframeHost . "/api/acceptance/iframes/" . $iframeId . "?payment_token=" . $paymentToken;
    }

    /**
     * Verify Paymob HMAC Signature
     *
     * @param array $data HTTP GET or POST payload from Paymob webhook
     * @return bool True if signature matches, false otherwise
     */
    public function verifyHmac($data)
    {
        $hmacSecret = $this->config['paymob']['hmac_secret'];
        if (empty($hmacSecret)) {
            error_log('Paymob HMAC verification failed: hmac_secret is not set in config.');
            return false;
        }

        if (!isset($data['obj'])) {
            error_log('Paymob callback signature check failed: obj key is missing.');
            return false;
        }

        $obj = $data['obj'];

        $hmacString = "";
        $hmacString .= $obj['amount_cents'] ?? '';
        $hmacString .= $obj['created_at'] ?? '';
        $hmacString .= $obj['currency'] ?? '';
        $hmacString .= (isset($obj['error_occured']) && $obj['error_occured']) ? 'true' : 'false';
        $hmacString .= (isset($obj['has_parent_transaction']) && $obj['has_parent_transaction']) ? 'true' : 'false';
        $hmacString .= $obj['id'] ?? '';
        $hmacString .= $obj['integration_id'] ?? '';
        $hmacString .= (isset($obj['is_3d_secure']) && $obj['is_3d_secure']) ? 'true' : 'false';
        $hmacString .= (isset($obj['is_auth']) && $obj['is_auth']) ? 'true' : 'false';
        $hmacString .= (isset($obj['is_capture']) && $obj['is_capture']) ? 'true' : 'false';
        $hmacString .= (isset($obj['is_voided']) && $obj['is_voided']) ? 'true' : 'false';
        $hmacString .= (isset($obj['is_refunded']) && $obj['is_refunded']) ? 'true' : 'false';
        $hmacString .= $obj['owner'] ?? '';
        $hmacString .= (isset($obj['pending']) && $obj['pending']) ? 'true' : 'false';
        $hmacString .= $obj['source_data']['pan'] ?? '';
        $hmacString .= $obj['source_data']['sub_type'] ?? '';
        $hmacString .= $obj['source_data']['type'] ?? '';
        $hmacString .= (isset($obj['success']) && $obj['success']) ? 'true' : 'false';

        $calculatedHmac = hash_hmac('sha512', $hmacString, $hmacSecret);

        $receivedHmac = $_GET['hmac'] ?? ($data['hmac'] ?? '');

        if (empty($receivedHmac)) {
            error_log('Paymob webhook callback has no hmac parameter.');
            return false;
        }

        return hash_equals($calculatedHmac, $receivedHmac);
    }

    /**
     * Process Callback and Webhook
     *
     * @param array $payload Webhook POST request body
     * @return array Result summary
     * @throws Exception
     */
    public function processWebhook($payload)
    {
        if (!isset($payload['obj'])) {
            throw new Exception('Invalid webhook payload structure');
        }

        $obj = $payload['obj'];
        $transactionId = $obj['id'];
        $paymobOrderId = $obj['order']['id'];
        $success = $obj['success'] && !$obj['error_occured'];
        $amount = $obj['amount_cents'] / 100;
        $currency = $obj['currency'];

        $status = $success ? 'success' : 'failed';

        $orderNumber = $obj['order']['merchant_order_id'] ?? null;
        $order = null;

        if ($orderNumber) {
            $order = $this->orderModel->findByOrderNumber($orderNumber);
        }

        if (!$order) {
            $sql = "SELECT * FROM orders WHERE transaction_reference = ? LIMIT 1";
            $order = $this->db->fetch($sql, [$paymobOrderId]);
        }

        if (!$order) {
            throw new Exception('Order not found for Paymob ID: ' . $paymobOrderId . ' or Number: ' . $orderNumber);
        }

        $orderId = $order['id'];

        // Prevent duplicate transactions
        if (!empty($transactionId)) {
            $sqlCheckTx = "SELECT id, status FROM payments WHERE transaction_id = ? LIMIT 1";
            $existingTx = $this->db->fetch($sqlCheckTx, [$transactionId]);
            if ($existingTx) {
                error_log("Paymob Webhook Warning: Transaction ID {$transactionId} is already marked as {$existingTx['status']}. Skipping duplicate webhook processing.");
                return [
                    'success' => $existingTx['status'] === 'success',
                    'order' => $order,
                    'status' => $existingTx['status'],
                    'transaction_id' => $transactionId
                ];
            }
        }

        $this->updatePaymentRecord($orderId, $transactionId, $status);

        $this->updatePaymentTransaction($orderId, [
            'transaction_id' => $transactionId,
            'status' => $status,
            'gateway_response' => json_encode($payload),
        ]);

        if ($status === 'success') {
            $this->orderModel->updatePaymentStatus($orderId, 'paid');
            $this->orderModel->updateStatus($orderId, 'processing');

            try {
                $emailService = new \App\Services\EmailService();
                $emailService->sendOrderInvoice($orderId);
            } catch (\Exception $e) {
                error_log('Failed to send order invoice email: ' . $e->getMessage());
            }
        } else {
            $this->orderModel->updatePaymentStatus($orderId, 'failed');
        }

        return [
            'success' => $status === 'success',
            'order' => $order,
            'status' => $status,
            'transaction_id' => $transactionId
        ];
    }

    /**
     * Create payments table record
     */
    private function createPaymentRecord($orderId, $transactionId, $amount, $currency, $status)
    {
        $sqlDelete = "DELETE FROM payments WHERE order_id = ? AND status = 'pending'";
        $this->db->execute($sqlDelete, [$orderId]);

        $sql = "
            INSERT INTO payments (order_id, transaction_id, amount, currency, status, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ";
        return $this->db->execute($sql, [
            $orderId,
            $transactionId,
            $amount,
            $currency,
            $status
        ]);
    }

    /**
     * Update payments table record
     */
    private function updatePaymentRecord($orderId, $transactionId, $status)
    {
        $sqlCheck = "SELECT id FROM payments WHERE order_id = ? LIMIT 1";
        $paymentRecord = $this->db->fetch($sqlCheck, [$orderId]);

        if ($paymentRecord) {
            $sql = "
                UPDATE payments 
                SET transaction_id = ?, status = ?, created_at = NOW()
                WHERE order_id = ?
            ";
            return $this->db->execute($sql, [
                $transactionId,
                $status,
                $orderId
            ]);
        } else {
            $order = $this->orderModel->find($orderId);
            $amount = $order ? $order['total'] : 0;
            $currency = $order ? ($order['currency'] ?? 'EGP') : 'EGP';

            return $this->createPaymentRecord($orderId, $transactionId, $amount, $currency, $status);
        }
    }

    /**
     * Create payment_transactions record (compatibility)
     */
    private function createPaymentTransaction($orderId, $data)
    {
        $sqlDelete = "DELETE FROM payment_transactions WHERE order_id = ? AND payment_gateway = 'paymob' AND status = 'pending'";
        $this->db->execute($sqlDelete, [$orderId]);

        $sql = "
            INSERT INTO payment_transactions 
            (order_id, transaction_id, payment_gateway, amount, currency, status, gateway_response, ip_address, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ";
        return $this->db->execute($sql, [
            $orderId,
            $data['transaction_id'] ?? null,
            'paymob',
            $data['amount'] ?? 0,
            $data['currency'] ?? 'EGP',
            $data['status'] ?? 'pending',
            json_encode($data),
            $_SERVER['REMOTE_ADDR'] ?? null,
        ]);
    }

    /**
     * Update payment_transactions record (compatibility)
     */
    private function updatePaymentTransaction($orderId, $data)
    {
        $sql = "
            UPDATE payment_transactions 
            SET transaction_id = ?, status = ?, gateway_response = ?, updated_at = NOW()
            WHERE order_id = ? AND payment_gateway = 'paymob'
            ORDER BY created_at DESC LIMIT 1
        ";
        return $this->db->execute($sql, [
            $data['transaction_id'] ?? null,
            $data['status'] ?? 'pending',
            $data['gateway_response'] ?? null,
            $orderId,
        ]);
    }

    /**
     * Get user email
     */
    private function getUserEmail($userId)
    {
        $sql = "SELECT email FROM users WHERE id = ? LIMIT 1";
        $user = $this->db->fetch($sql, [$userId]);
        return $user['email'] ?? '';
    }

    /**
     * Refund payment (Optional Admin request)
     */
    public function refundPayment($orderId, $amount = null)
    {
        $order = $this->orderModel->find($orderId);
        if (!$order) {
            throw new Exception('Order not found');
        }

        $sql = "SELECT * FROM payments WHERE order_id = ? AND status = 'success' ORDER BY created_at DESC LIMIT 1";
        $payment = $this->db->fetch($sql, [$orderId]);

        if (!$payment || empty($payment['transaction_id'])) {
            throw new Exception('No successful payment transaction found for this order');
        }

        $refundAmount = $amount ?? $order['total'];
        $authToken = $this->getAuthToken();
        $baseUrl = $this->config['paymob']['base_url'];
        $url = $baseUrl . '/acceptance/void_refund/refund';

        $data = [
            'auth_token' => $authToken,
            'transaction_id' => (int)$payment['transaction_id'],
            'amount_cents' => round($refundAmount * 100)
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            throw new Exception('Refund request failed: connection error');
        }

        $responseData = json_decode($response, true);

        if ($httpCode === 201 || $httpCode === 200) {
            $this->orderModel->updatePaymentStatus($orderId, 'refunded');
            $this->orderModel->updateStatus($orderId, 'refunded');

            $sql = "UPDATE payments SET status = 'refunded' WHERE order_id = ?";
            $this->db->execute($sql, [$orderId]);

            $sql = "UPDATE payment_transactions SET status = 'refunded', gateway_response = ? WHERE order_id = ? AND payment_gateway = 'paymob'";
            $this->db->execute($sql, [$response, $orderId]);

            return [
                'success' => true,
                'message' => 'Payment refunded successfully',
                'refund_transaction_id' => $responseData['id'] ?? null
            ];
        }

        return [
            'success' => false,
            'message' => $responseData['detail'] ?? 'Refund failed at payment gateway'
        ];
    }
}
