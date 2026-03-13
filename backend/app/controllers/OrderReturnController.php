<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\OrderReturn;
use App\Models\Order;
use App\Helpers\Validator;

/**
 * Order Return Controller
 */
class OrderReturnController
{
    private $returnModel;
    private $orderModel;
    
    public function __construct()
    {
        $this->returnModel = new OrderReturn();
        $this->orderModel = new Order();
    }
    
    /**
     * Create return request
     */
    public function create(Request $request, $orderId)
    {
        $validator = new Validator($request->all(), [
            'order_item_id' => 'required|integer',
            'quantity' => 'required|integer|min:1',
            'reason' => 'max:500',
        ]);
        
        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }
        
        try {
            $orderItemId = $request->input('order_item_id');
            $quantity = $request->input('quantity');
            $reason = $request->input('reason');
            
            // Verify order exists and belongs to user (or admin)
            $order = $this->orderModel->find($orderId);
            if (!$order) {
                return Response::notFound('Order not found');
            }
            
            // Check if user has permission
            if ($order['user_id'] != $request->user_id && $request->user_role !== 'admin') {
                return Response::forbidden('Access denied');
            }
            
            // Check if order item exists and get current returns
            $orderItems = $this->orderModel->getOrderItems($orderId);
            $orderItem = null;
            
            foreach ($orderItems as $item) {
                if ($item['id'] == $orderItemId) {
                    $orderItem = $item;
                    break;
                }
            }
            
            if (!$orderItem) {
                return Response::notFound('Order item not found');
            }
            
            // Check how much has already been returned
            $existingReturns = $this->returnModel->getOrderReturns($orderId);
            $alreadyReturned = 0;
            foreach ($existingReturns as $ret) {
                if ($ret['order_item_id'] == $orderItemId && ($ret['status'] === 'pending' || $ret['status'] === 'approved')) {
                    $alreadyReturned += (int)$ret['quantity'];
                }
            }
            
            $remainingQuantity = $orderItem['quantity'] - $alreadyReturned;
            
            if ($quantity > $remainingQuantity) {
                return Response::error("Cannot return {$quantity} items. Only {$remainingQuantity} remaining for this item.");
            }
            
            $returnId = $this->returnModel->createReturn(
                $orderId,
                $orderItemId,
                $quantity,
                $reason,
                $request->user_role === 'admin' ? $request->user_id : null
            );
            
            if (!$returnId) {
                return Response::error('Failed to create return request');
            }
            
            $return = $this->returnModel->find($returnId);
            
            return Response::success($return, 'Return request created successfully', 201);
            
        } catch (\Exception $e) {
            return Response::error('Failed to create return: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Scan barcode for return
     */
    public function scanBarcode(Request $request, $returnId)
    {
        $validator = new Validator($request->all(), [
            'barcode' => 'required|string',
        ]);
        
        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }
        
        try {
            $barcode = $request->input('barcode');
            
            // Verify return exists
            $return = $this->returnModel->find($returnId);
            if (!$return) {
                return Response::notFound('Return not found');
            }
            
            // Get order item to verify barcode
            $order = $this->orderModel->getOrderDetails($return['order_id']);
            $orderItem = null;
            
            foreach ($order['items'] ?? [] as $item) {
                if ($item['id'] == $return['order_item_id']) {
                    $orderItem = $item;
                    break;
                }
            }
            
            if (!$orderItem) {
                return Response::error('Order item not found');
            }
            
            // Verify barcode matches product or variant
            $productModel = new \App\Models\Product();
            $result = $productModel->findByBarcode($barcode);
            
            if (!$result) {
                return Response::error('Barcode not found');
            }
            
            // التحقق من تطابق المنتج
            $productId = null;
            $variantId = null;
            
            if ($result['type'] === 'product') {
                $productId = $result['data']['id'];
            } else if ($result['type'] === 'variant') {
                $productId = $result['data']['product_id'];
                $variantId = $result['data']['id'];
            }
            
            if (!$productId || $productId != $orderItem['product_id']) {
                return Response::error('Barcode does not match the product in this return');
            }
            
            // التحقق من تطابق الـ variant إذا كان موجوداً
            if ($orderItem['variant_id'] && $variantId && $variantId != $orderItem['variant_id']) {
                return Response::error('Barcode does not match the variant in this return');
            }
            
            // Add scanned barcode
            $this->returnModel->addScannedBarcode($returnId, $barcode);
            
            $return = $this->returnModel->find($returnId);
            $scannedBarcodes = json_decode($return['scanned_barcodes'] ?? '[]', true);
            
            return Response::success([
                'return' => $return,
                'scanned_count' => count($scannedBarcodes),
                'required_quantity' => $return['quantity'],
                'all_scanned' => count($scannedBarcodes) >= $return['quantity']
            ], 'Barcode scanned successfully');
            
        } catch (\Exception $e) {
            return Response::error('Failed to scan barcode: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Approve return (Admin only)
     */
    public function approve(Request $request, $returnId)
    {
        try {
            if ($request->user_role !== 'admin') {
                return Response::forbidden('Admin access required');
            }
            
            $result = $this->returnModel->approveReturn($returnId);
            
            if (!$result) {
                return Response::error('Failed to approve return');
            }
            
            $return = $this->returnModel->find($returnId);
            
            return Response::success($return, 'Return approved successfully');
            
        } catch (\Exception $e) {
            return Response::error('Failed to approve return: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Get returns for an order
     */
    public function getOrderReturns(Request $request, $orderId)
    {
        try {
            $order = $this->orderModel->find($orderId);
            if (!$order) {
                return Response::notFound('Order not found');
            }
            
            // Check permission
            if ($order['user_id'] != $request->user_id && $request->user_role !== 'admin') {
                return Response::forbidden('Access denied');
            }
            
            $returns = $this->returnModel->getOrderReturns($orderId);
            
            return Response::success($returns);
            
        } catch (\Exception $e) {
            return Response::error('Failed to fetch returns: ' . $e->getMessage(), null, 500);
        }
    }
}


