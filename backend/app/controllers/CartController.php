<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Cart;
use App\Models\Product;
use App\Helpers\Validator;

/**
 * Cart Controller
 */
class CartController
{
    private $cartModel;
    private $productModel;
    
    public function __construct()
    {
        $this->cartModel = new Cart();
        $this->productModel = new Product();
    }
    
    /**
     * Get user's cart
     */
    public function index(Request $request)
    {
        try {
            $items = $this->cartModel->getUserCart($request->user_id);
            $total = $this->cartModel->getCartTotal($request->user_id);
            
            return Response::success([
                'items' => $items,
                'summary' => $total,
            ]);
            
        } catch (\Exception $e) {
            return Response::error('Failed to fetch cart: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Add item to cart
     */
    public function add(Request $request)
    {
        // Validate input
        $validator = new Validator($request->all(), [
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'variant_id' => 'integer|exists:product_variants,id',
        ]);
        
        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }
        
        try {
            $productId = $request->input('product_id');
            $quantity = $request->input('quantity');
            $variantId = $request->input('variant_id');
            
            // Check if product is active
            $product = $this->productModel->find($productId);
            if (!$product || !$product['is_active']) {
                return Response::error('Product is not available');
            }
            
            // Check if product has variants and variant_id is required
            $productDetails = $this->productModel->getProductDetails($productId);
            $hasVariants = !empty($productDetails['variants']);
            
            if ($hasVariants && !$variantId) {
                return Response::error('Please select size and color for this product');
            }
            
            // Check if item already exists in cart to get current quantity
            $existingCartItem = $this->cartModel->findCartItem($request->user_id, $productId, $variantId);
            $currentCartQuantity = $existingCartItem ? $existingCartItem['quantity'] : 0;
            $newTotalQuantity = $currentCartQuantity + $quantity;
            
            // Check stock for the new total quantity (existing + new)
            if (!$this->productModel->checkStock($productId, $newTotalQuantity, $variantId)) {
                // Get available stock
                $stockInfo = $this->productModel->getStockInfo($productId, $variantId);
                $availableStock = $stockInfo ? $stockInfo['stock_quantity'] : 0;
                return Response::error("Insufficient stock. Available: {$availableStock}, Requested: {$newTotalQuantity}");
            }
            
            $result = $this->cartModel->addToCart(
                $request->user_id,
                $productId,
                $variantId,
                $quantity
            );
            
            if (!$result) {
                return Response::error('Failed to add item to cart');
            }
            
            $items = $this->cartModel->getUserCart($request->user_id);
            $total = $this->cartModel->getCartTotal($request->user_id);
            
            return Response::success([
                'items' => $items,
                'summary' => $total,
            ], 'Item added to cart', 201);
            
        } catch (\Exception $e) {
            return Response::error('Failed to add item to cart: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Update cart item quantity
     */
    public function update(Request $request, $cartId)
    {
        // Validate input
        $validator = new Validator($request->all(), [
            'quantity' => 'required|integer|min:0',
        ]);
        
        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }
        
        try {
            $quantity = $request->input('quantity');
            
            // Get cart item
            $cartItem = $this->cartModel->find($cartId);
            
            if (!$cartItem || $cartItem['user_id'] != $request->user_id) {
                return Response::notFound('Cart item not found');
            }
            
            // If quantity is 0, remove item
            if ($quantity == 0) {
                return $this->remove($request, $cartId);
            }
            
            // Check stock for the new quantity
            if (!$this->productModel->checkStock($cartItem['product_id'], $quantity, $cartItem['variant_id'])) {
                // Get available stock
                $stockInfo = $this->productModel->getStockInfo($cartItem['product_id'], $cartItem['variant_id']);
                $availableStock = $stockInfo ? $stockInfo['stock_quantity'] : 0;
                return Response::error("Insufficient stock. Available: {$availableStock}, Requested: {$quantity}");
            }
            
            $oldQuantity = $cartItem['quantity'];
            $result = $this->cartModel->updateQuantity($cartId, $quantity);
            
            if (!$result) {
                return Response::error('Failed to update cart item');
            }
            
            error_log("Cart item updated: Cart ID={$cartId}, Product ID={$cartItem['product_id']}, Variant ID=" . ($cartItem['variant_id'] ?? 'NULL') . ", Old Qty={$oldQuantity}, New Qty={$quantity}");
            
            $items = $this->cartModel->getUserCart($request->user_id);
            $total = $this->cartModel->getCartTotal($request->user_id);
            
            return Response::success([
                'items' => $items,
                'summary' => $total,
            ], 'Cart updated successfully');
            
        } catch (\Exception $e) {
            return Response::error('Failed to update cart: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Remove item from cart
     */
    public function remove(Request $request, $cartId)
    {
        try {
            $result = $this->cartModel->removeFromCart($cartId, $request->user_id);
            
            if (!$result) {
                return Response::notFound('Cart item not found');
            }
            
            $items = $this->cartModel->getUserCart($request->user_id);
            $total = $this->cartModel->getCartTotal($request->user_id);
            
            return Response::success([
                'items' => $items,
                'summary' => $total,
            ], 'Item removed from cart');
            
        } catch (\Exception $e) {
            return Response::error('Failed to remove item: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Clear cart
     */
    public function clear(Request $request)
    {
        try {
            $this->cartModel->clearCart($request->user_id);
            
            return Response::success(null, 'Cart cleared successfully');
            
        } catch (\Exception $e) {
            return Response::error('Failed to clear cart: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Get cart count
     */
    public function count(Request $request)
    {
        try {
            $count = $this->cartModel->getCartCount($request->user_id);
            
            return Response::success(['count' => $count]);
            
        } catch (\Exception $e) {
            return Response::error('Failed to get cart count: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Validate cart (check stock, prices)
     */
    public function validate(Request $request)
    {
        try {
            $validation = $this->cartModel->validateCart($request->user_id);
            
            if (!$validation['valid']) {
                return Response::error('Cart validation failed', $validation['errors'], 422);
            }
            
            return Response::success(null, 'Cart is valid');
            
        } catch (\Exception $e) {
            return Response::error('Failed to validate cart: ' . $e->getMessage(), null, 500);
        }
    }
}