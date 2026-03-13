<?php
namespace App\Models;

use App\Core\Model;

/**
 * Order Return Model
 */
class OrderReturn extends Model
{
    protected $table = 'order_returns';
    protected $fillable = [
        'order_id',
        'order_item_id',
        'quantity',
        'reason',
        'status',
        'scanned_barcodes',
        'refund_amount',
        'created_by',
    ];
    
    /**
     * Create return request
     */
    public function createReturn($orderId, $orderItemId, $quantity, $reason = null, $createdBy = null)
    {
        $this->db->beginTransaction();
        
        try {
            // Get order item to calculate refund
            $orderModel = new Order();
            $order = $orderModel->find($orderId);
            $orderItem = $this->getOrderItem($orderItemId);
            
            if (!$orderItem || $orderItem['order_id'] != $orderId) {
                $this->db->rollback();
                return false;
            }
            
            // Check how much has already been returned for this order item
            $sql = "SELECT COALESCE(SUM(quantity), 0) as total_returned FROM {$this->table} WHERE order_item_id = ? AND status IN ('pending', 'approved')";
            $returnedResult = $this->db->fetch($sql, [$orderItemId]);
            $alreadyReturned = (int)($returnedResult['total_returned'] ?? 0);
            $remainingQuantity = $orderItem['quantity'] - $alreadyReturned;
            
            // Check if requested quantity exceeds remaining quantity
            if ($quantity > $remainingQuantity) {
                $this->db->rollback();
                error_log("Cannot return {$quantity} items. Only {$remainingQuantity} remaining for order_item_id={$orderItemId}");
                return false;
            }
            
            // Calculate refund amount (proportional)
            $itemSubtotal = $orderItem['subtotal'];
            $itemQuantity = $orderItem['quantity'];
            $refundAmount = ($itemSubtotal / $itemQuantity) * $quantity;
            
            $data = [
                'order_id' => $orderId,
                'order_item_id' => $orderItemId,
                'quantity' => $quantity,
                'reason' => $reason,
                'status' => 'approved', // Auto-approve when created by admin
                'scanned_barcodes' => json_encode([]),
                'refund_amount' => $refundAmount,
                'created_by' => $createdBy,
            ];
            
            $returnId = $this->create($data);
            
            if (!$returnId) {
                $this->db->rollback();
                return false;
            }
            
            // Return stock to product variant (combination) immediately
            if ($orderItem['variant_id']) {
                $productModel = new \App\Models\Product();
                $result = $productModel->returnToStock(
                    $orderItem['product_id'],
                    $quantity,
                    $orderItem['variant_id']
                );
                
                if (!$result) {
                    $this->db->rollback();
                    error_log("Failed to return stock for variant ID={$orderItem['variant_id']}");
                    return false;
                }
                
                error_log("Stock returned immediately: Product ID={$orderItem['product_id']}, Variant ID={$orderItem['variant_id']}, Quantity={$quantity}");
            } else {
                // If no variant, return to product stock
                $productModel = new \App\Models\Product();
                $result = $productModel->returnToStock(
                    $orderItem['product_id'],
                    $quantity,
                    null
                );
                
                if (!$result) {
                    $this->db->rollback();
                    error_log("Failed to return stock for product ID={$orderItem['product_id']}");
                    return false;
                }
                
                error_log("Stock returned immediately: Product ID={$orderItem['product_id']}, Quantity={$quantity}");
            }
            
            $this->db->commit();
            return $returnId;
            
        } catch (\Exception $e) {
            $this->db->rollback();
            error_log("Error creating return: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get order item
     */
    private function getOrderItem($orderItemId)
    {
        $sql = "SELECT * FROM order_items WHERE id = ? LIMIT 1";
        return $this->db->fetch($sql, [$orderItemId]);
    }
    
    /**
     * Add scanned barcode to return
     */
    public function addScannedBarcode($returnId, $barcode)
    {
        $return = $this->find($returnId);
        if (!$return) {
            return false;
        }
        
        $scannedBarcodes = json_decode($return['scanned_barcodes'] ?? '[]', true);
        if (!in_array($barcode, $scannedBarcodes)) {
            $scannedBarcodes[] = $barcode;
        }
        
        return $this->update($returnId, [
            'scanned_barcodes' => json_encode($scannedBarcodes)
        ]);
    }
    
    /**
     * Approve return (if not already approved)
     */
    public function approveReturn($returnId)
    {
        $return = $this->find($returnId);
        if (!$return) {
            return false;
        }
        
        // If already approved, stock was already returned in createReturn
        if ($return['status'] === 'approved') {
            return true;
        }
        
        // Update return status
        $this->update($returnId, ['status' => 'approved']);
        
        // Get order item to find variant_id
        $orderItem = $this->getOrderItem($return['order_item_id']);
        if (!$orderItem) {
            return false;
        }
        
        // Return stock to product variant (combination) - only if not already returned
        if ($orderItem['variant_id']) {
            $productModel = new \App\Models\Product();
            $result = $productModel->returnToStock(
                $orderItem['product_id'],
                $return['quantity'],
                $orderItem['variant_id']
            );
            
            if (!$result) {
                error_log("Failed to return stock for variant ID={$orderItem['variant_id']} in approveReturn");
            }
        } else {
            // If no variant, return to product stock
            $productModel = new \App\Models\Product();
            $result = $productModel->returnToStock(
                $orderItem['product_id'],
                $return['quantity'],
                null
            );
            
            if (!$result) {
                error_log("Failed to return stock for product ID={$orderItem['product_id']} in approveReturn");
            }
        }
        
        // Update order item quantity (reduce by returned quantity)
        $sql = "UPDATE order_items SET quantity = quantity - ? WHERE id = ?";
        $this->db->execute($sql, [$return['quantity'], $return['order_item_id']]);
        
        // Update order total if needed
        $orderModel = new Order();
        $order = $orderModel->find($return['order_id']);
        if ($order) {
            $newTotal = $order['total'] - $return['refund_amount'];
            $orderModel->update($return['order_id'], ['total' => $newTotal]);
        }
        
        return true;
    }
    
    /**
     * Get returns for an order
     */
    public function getOrderReturns($orderId)
    {
        $sql = "
            SELECT r.*, oi.product_name, oi.variant_name, oi.price
            FROM {$this->table} r
            JOIN order_items oi ON r.order_item_id = oi.id
            WHERE r.order_id = ?
            ORDER BY r.created_at DESC
        ";
        return $this->db->fetchAll($sql, [$orderId]);
    }
}

