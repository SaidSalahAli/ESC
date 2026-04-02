<?php

namespace App\Models;

use App\Core\Model;

/**
 * Order Model
 */
class Order extends Model
{
    protected $table = 'orders';
    protected $fillable = [
        'user_id',
        'order_number',
        'barcode',
        'status',
        'payment_status',
        'payment_method',
        'subtotal',
        'shipping_cost',
        'discount',
        'total',
        'currency',
        'shipping_address_id',
        'billing_address_id',
        'notes',
        'tracking_number',
        'is_guest',
        'guest_email',
        'guest_phone',
        'guest_name',
        'view_token',
    ];

    /**
     * Generate unique order number (also used as barcode)
     */
    public function generateOrderNumber()
    {
        return 'ESC' . date('Ymd') . strtoupper(substr(uniqid(), -6));
    }

    /**
     * Generate barcode for order (using order number)
     */
    public function generateOrderBarcode($orderNumber)
    {
        return $orderNumber;
    }

    /**
     * Create order with items
     */
    public function createOrder($orderData, $items)
    {
        $this->db->beginTransaction();

        try {
            $orderData['order_number'] = $this->generateOrderNumber();
            $orderData['barcode']      = $orderData['order_number'];

            $orderId = $this->create($orderData);

            if (!$orderId) {
                throw new \Exception('Failed to create order');
            }

            foreach ($items as $item) {
                $variantId = $item['variant_id'] ?? null;
                $barcode   = null;
                $sku       = null;

                if ($variantId) {
                    $variantModel = new \App\Models\ProductVariant();
                    $variant      = $variantModel->find($variantId);
                    if ($variant) {
                        $barcode = $variant['barcode'] ?? null;
                        $sku     = $variant['sku']     ?? null;
                    }
                } else {
                    $product = $this->find($item['product_id']);
                    if ($product) {
                        $barcode = $product['barcode'] ?? null;
                        $sku     = $product['sku']     ?? null;
                    }
                }

                $sql = "
                    INSERT INTO order_items 
                    (order_id, product_id, variant_id, product_name, variant_name, barcode, sku, quantity, price, subtotal)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ";

                $this->db->execute($sql, [
                    $orderId,
                    $item['product_id'],
                    $variantId,
                    $item['product_name'],
                    $item['variant_name'] ?? null,
                    $barcode,
                    $sku,
                    $item['quantity'],
                    $item['price'],
                    $item['subtotal'],
                ]);

                $productModel = new Product();

                error_log("Creating order - Decreasing stock: Product ID={$item['product_id']}, Variant ID=" . ($variantId ?? 'NULL') . ", Quantity={$item['quantity']}");

                $stockResult = $productModel->updateStock(
                    $item['product_id'],
                    $item['quantity'],
                    $variantId
                );

                if (!$stockResult) {
                    throw new \Exception("Failed to update stock for product ID: {$item['product_id']}");
                }
            }

            $this->db->commit();
            return $orderId;
        } catch (\Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    /**
     * Get order with details
     */
    public function getOrderDetails($orderId)
    {
        $order = $this->find($orderId);

        if (!$order) return null;

        $order['items']              = $this->getOrderItems($orderId);
        $order['user']               = $this->getOrderUser($order['user_id']);
        $order['fulfillment_status'] = $this->getFulfillmentStatus($orderId);
        $order['payment']            = $this->getPaymentTransaction($orderId);

        if ($order['shipping_address_id']) {
            $order['shipping_address'] = $this->getAddress($order['shipping_address_id']);
        }
        if ($order['billing_address_id']) {
            $order['billing_address'] = $this->getAddress($order['billing_address_id']);
        }

        $shippingPhone = null;
        if (!empty($order['shipping_address']) && isset($order['shipping_address']['phone'])) {
            $shippingPhone = $order['shipping_address']['phone'];
        }

        $billingPhone = null;
        if (!empty($order['billing_address']) && isset($order['billing_address']['phone'])) {
            $billingPhone = $order['billing_address']['phone'];
        }

        if (!empty($order['user']) && empty($order['user']['phone'])) {
            $fallbackPhone = $shippingPhone;
            if ($fallbackPhone === null || $fallbackPhone === '') {
                $fallbackPhone = $billingPhone;
            }

            if ($fallbackPhone !== null && $fallbackPhone !== '') {
                $order['user']['phone'] = $fallbackPhone;
            }
        }

        return $order;
    }

    /**
     * Get order items with category and variant details
     */
    public function getOrderItems($orderId)
    {
        $sql = "
            SELECT 
                oi.*,
                p.main_image,
                p.category_id,
                COALESCE(oi.barcode, p.barcode) as barcode,
                c.name    AS category_name,
                c.name_ar AS category_name_ar,
                v.size_value,
                v.color_value,
                v.price_modifier,
                v.barcode as variant_barcode,
                v.sku     as variant_sku
            FROM order_items oi
            LEFT JOIN products p  ON oi.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_variants v ON oi.variant_id = v.id
            WHERE oi.order_id = ?
            ORDER BY oi.id ASC
        ";
        return $this->db->fetchAll($sql, [$orderId]);
    }

    /**
     * Scan barcode for order fulfillment
     */
    public function scanBarcode($orderId, $barcode)
    {
        $sql = "
            SELECT oi.*, p.barcode, p.name as product_name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ? AND p.barcode = ?
        ";
        $item = $this->db->fetch($sql, [$orderId, $barcode]);

        if (!$item) {
            return ['success' => false, 'message' => 'Product not found in this order'];
        }

        $scannedQty  = (int)($item['scanned_quantity'] ?? 0);
        $requiredQty = (int)$item['quantity'];

        if ($scannedQty >= $requiredQty) {
            return ['success' => false, 'message' => 'All items of this product have been scanned'];
        }

        $newScannedQty = $scannedQty + 1;
        $this->db->execute(
            "UPDATE order_items SET scanned_quantity = ? WHERE id = ?",
            [$newScannedQty, $item['id']]
        );

        return [
            'success'     => true,
            'message'     => 'Product scanned successfully',
            'item'        => array_merge($item, ['scanned_quantity' => $newScannedQty]),
            'all_scanned' => $this->checkAllItemsScanned($orderId),
        ];
    }

    /**
     * Check if all items in order are scanned
     */
    public function checkAllItemsScanned($orderId)
    {
        $sql = "
            SELECT 
                COUNT(*) as total_items,
                SUM(CASE WHEN scanned_quantity >= quantity THEN 1 ELSE 0 END) as scanned_items
            FROM order_items
            WHERE order_id = ?
        ";
        $result = $this->db->fetch($sql, [$orderId]);
        return $result && $result['total_items'] > 0 &&
            $result['scanned_items'] == $result['total_items'];
    }

    /**
     * Get order fulfillment status
     */
    public function getFulfillmentStatus($orderId)
    {
        $sql = "
            SELECT 
                oi.id, oi.product_id, oi.product_name, oi.variant_name,
                oi.quantity, oi.scanned_quantity,
                p.barcode, p.main_image, p.category_id,
                c.name AS category_name, c.name_ar AS category_name_ar,
                v.size_value, v.color_value,
                CASE 
                    WHEN oi.scanned_quantity >= oi.quantity THEN 'completed'
                    WHEN oi.scanned_quantity > 0            THEN 'partial'
                    ELSE 'pending'
                END as status
            FROM order_items oi
            LEFT JOIN products p   ON oi.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_variants v ON oi.variant_id = v.id
            WHERE oi.order_id = ?
            ORDER BY oi.id ASC
        ";
        return $this->db->fetchAll($sql, [$orderId]);
    }

    private function getOrderUser($userId)
    {
        return $this->db->fetch(
            "SELECT id, first_name, last_name, email, phone FROM users WHERE id = ?",
            [$userId]
        );
    }

    private function getAddress($addressId)
    {
        return $this->db->fetch("SELECT * FROM addresses WHERE id = ?", [$addressId]);
    }

    private function getPaymentTransaction($orderId)
    {
        return $this->db->fetch(
            "SELECT * FROM payment_transactions WHERE order_id = ? ORDER BY created_at DESC LIMIT 1",
            [$orderId]
        );
    }

    public function findByOrderNumber($orderNumber)
    {
        return $this->findOneBy('order_number', $orderNumber);
    }

    public function updateStatus($orderId, $status)
    {
        $allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        if (!in_array($status, $allowedStatuses)) return false;

        $data = ['status' => $status];
        if ($status === 'shipped')   $data['shipped_at']   = date('Y-m-d H:i:s');
        if ($status === 'delivered') $data['delivered_at'] = date('Y-m-d H:i:s');
        if ($status === 'cancelled') $data['cancelled_at'] = date('Y-m-d H:i:s');

        return $this->update($orderId, $data);
    }

    public function updatePaymentStatus($orderId, $paymentStatus)
    {
        $allowedStatuses = ['pending', 'paid', 'failed', 'refunded'];
        if (!in_array($paymentStatus, $allowedStatuses)) return false;

        if ($paymentStatus === 'paid') {
            $productModel = new Product();
            foreach ($this->getOrderItems($orderId) as $item) {
                $productModel->updateSalesCount($item['product_id']);
            }
        }

        return $this->update($orderId, ['payment_status' => $paymentStatus]);
    }

    public function getRecent($limit = 10)
    {
        $sql = "
            SELECT 
                o.id, o.order_number, o.status, o.payment_status,
                o.total, o.created_at,
                u.first_name, u.last_name, u.email, u.phone,
                COUNT(oi.id) as total_items
            FROM {$this->table} o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT ?
        ";
        return $this->db->fetchAll($sql, [$limit]);
    }

    public function getUserOrders($userId, $limit = 10, $offset = 0)
    {
        $sql = "
            SELECT o.*,
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
            FROM {$this->table} o
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        ";
        return $this->db->fetchAll($sql, [$userId, $limit, $offset]);
    }

    public function getByStatus($status, $limit = 20, $offset = 0)
    {
        $sql = "SELECT * FROM {$this->table} WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
        return $this->db->fetchAll($sql, [$status, $limit, $offset]);
    }

    /**
     * Calculate order totals — NO TAX
     */
    public function calculateTotals($items, $shippingCost = 0, $couponDiscount = 0)
    {
        $subtotal = 0;
        foreach ($items as $item) {
            $subtotal += $item['price'] * $item['quantity'];
        }

        $total = $subtotal + $shippingCost - $couponDiscount;

        return [
            'subtotal'      => round($subtotal,       2),
            'shipping_cost' => round($shippingCost,   2),
            'discount'      => round($couponDiscount, 2),
            'total'         => round($total,          2),
        ];
    }

    public function getSalesStatistics($startDate = null, $endDate = null)
    {
        $sql = "
            SELECT 
                DATE(o.created_at)    as sale_date,
                COUNT(DISTINCT o.id)  as total_orders,
                SUM(o.total)          as total_revenue,
                AVG(o.total)          as average_order_value,
                SUM(oi.quantity)      as total_items_sold
            FROM {$this->table} o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.payment_status = 'paid'
        ";
        $params = [];

        if ($startDate && $endDate) {
            $sql    .= " AND DATE(o.created_at) BETWEEN ? AND ?";
            $params  = [$startDate, $endDate];
        }

        $sql .= " GROUP BY DATE(o.created_at) ORDER BY sale_date DESC";
        return $this->db->fetchAll($sql, $params);
    }

    public function getMonthlyRevenue($year, $month)
    {
        return $this->db->fetchAll("CALL sp_monthly_sales_report(?, ?)", [$year, $month]);
    }
}
