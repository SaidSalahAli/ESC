<?php
namespace App\Models;

use App\Core\Model;

/**
 * Cart Model
 */
class Cart extends Model
{
    protected $table = 'cart';
    protected $fillable = [
        'user_id',
        'product_id',
        'variant_id',
        'quantity',
    ];
    
    /**
     * Get user's cart items
     */
    public function getUserCart($userId)
    {
        $sql = "
            SELECT 
                c.*,
                
                -- Product Information
                p.name AS product_name,
                p.slug AS product_slug,
                p.price AS product_price,
                p.sale_price AS db_sale_price,
                p.is_discount_active,
                p.discount_type,
                p.discount_value,
                p.discount_start_at,
                p.discount_end_at,
                p.main_image,
                p.stock_quantity,
                p.is_active,
                p.category_id,
                
                -- Category Information
                cat.name AS category_name,
                
                -- Variant Information
                v.name AS variant_name,
                v.value AS variant_value,
                v.size_value,
                v.color_value,
                v.price_modifier,
                v.stock_quantity AS variant_stock
                
            FROM cart c
            JOIN products p 
                ON c.product_id = p.id
            LEFT JOIN categories cat 
                ON p.category_id = cat.id
            LEFT JOIN product_variants v 
                ON c.variant_id = v.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        ";
        
        $items = $this->db->fetchAll($sql, [$userId]);

        // Apply dynamic discount meta (includes global offer)
        $productModel = new \App\Models\Product();
        foreach ($items as &$item) {
            // Build a minimal product array for applyDiscountMeta
            $productRow = [
                'price'               => $item['product_price'],
                'sale_price'          => $item['db_sale_price'],
                'is_discount_active'  => $item['is_discount_active'],
                'discount_type'       => $item['discount_type'],
                'discount_value'      => $item['discount_value'],
                'discount_start_at'   => $item['discount_start_at'],
                'discount_end_at'     => $item['discount_end_at'],
            ];
            $discounted = $productModel->applyDiscountMeta($productRow);
            // Write effective sale_price back into the cart item
            $item['sale_price'] = $discounted['sale_price'];
            $item['has_discount'] = $discounted['has_discount'];
            $item['discount_percent'] = $discounted['discount_percent'];
            // Recalculate subtotal with effective price
            $effectivePrice = $discounted['sale_price'] ?? $item['product_price'];
            $effectivePrice += (float)($item['price_modifier'] ?? 0);
            $item['subtotal'] = $effectivePrice * $item['quantity'];
        }
        unset($item);

        return $items;
    }
    
    /**
     * Add item to cart
     */
    public function addToCart($userId, $productId, $variantId = null, $quantity = 1)
    {
        $this->db->beginTransaction();
        
        try {
            // Check if item already exists
            $existing = $this->findCartItem($userId, $productId, $variantId);
            
            if ($existing) {
                // Update quantity (add to existing)
                $newQuantity = $existing['quantity'] + $quantity;
                
                // Check stock before updating
                $productModel = new \App\Models\Product();
                if (!$productModel->checkStock($productId, $newQuantity, $variantId)) {
                    $this->db->rollback();
                    error_log("Insufficient stock when updating cart: Product ID={$productId}, Variant ID=" . ($variantId ?? 'NULL') . ", Requested Qty={$newQuantity}");
                    return false;
                }
                
                $result = $this->updateQuantity($existing['id'], $newQuantity);
                
                if ($result) {
                    error_log("Cart updated: Product ID={$productId}, Variant ID=" . ($variantId ?? 'NULL') . ", Old Qty={$existing['quantity']}, Added Qty={$quantity}, New Qty={$newQuantity}");
                }
                
                $this->db->commit();
                return $result;
            }
            
            // Add new item
            $result = $this->create([
                'user_id' => $userId,
                'product_id' => $productId,
                'variant_id' => $variantId,
                'quantity' => $quantity,
            ]);
            
            if ($result) {
                error_log("Cart item added: Product ID={$productId}, Variant ID=" . ($variantId ?? 'NULL') . ", Qty={$quantity}");
            }
            
            $this->db->commit();
            return $result;
            
        } catch (\Exception $e) {
            $this->db->rollback();
            error_log("Error adding to cart: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Find cart item
     */
    public function findCartItem($userId, $productId, $variantId = null)
    {
        if ($variantId) {
            $sql = "SELECT * FROM {$this->table} WHERE user_id = ? AND product_id = ? AND variant_id = ? LIMIT 1";
            return $this->db->fetch($sql, [$userId, $productId, $variantId]);
        } else {
            $sql = "SELECT * FROM {$this->table} WHERE user_id = ? AND product_id = ? AND variant_id IS NULL LIMIT 1";
            return $this->db->fetch($sql, [$userId, $productId]);
        }
    }
    
    /**
     * Update cart item quantity
     */
    public function updateQuantity($cartId, $quantity)
    {
        if ($quantity <= 0) {
            return $this->delete($cartId);
        }
        
        return $this->update($cartId, ['quantity' => $quantity]);
    }
    
    /**
     * Remove item from cart
     */
    public function removeFromCart($cartId, $userId)
    {
        $sql = "DELETE FROM {$this->table} WHERE id = ? AND user_id = ?";
        return $this->db->execute($sql, [$cartId, $userId]);
    }
    
    /**
     * Clear user's cart
     */
    public function clearCart($userId)
    {
        $sql = "DELETE FROM {$this->table} WHERE user_id = ?";
        return $this->db->execute($sql, [$userId]);
    }
    
    /**
     * Get cart total
     */
    public function getCartTotal($userId)
    {
        // Fetch cart items with dynamic discount applied
        $items = $this->getUserCart($userId);

        $itemCount   = count($items);
        $totalItems  = 0;
        $subtotal    = 0.0;

        foreach ($items as $item) {
            $effectivePrice = (float)($item['sale_price'] ?? $item['product_price']);
            $effectivePrice += (float)($item['price_modifier'] ?? 0);
            $qty = (int)$item['quantity'];
            $totalItems += $qty;
            $subtotal   += $effectivePrice * $qty;
        }

        return [
            'item_count'  => $itemCount,
            'total_items' => $totalItems,
            'subtotal'    => round($subtotal, 2),
        ];
    }
    
    /**
     * Get cart count
     */
    public function getCartCount($userId)
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE user_id = ?";
        $result = $this->db->fetch($sql, [$userId]);
        return $result['count'] ?? 0;
    }
    
    /**
     * Validate cart items (check stock, prices, availability)
     */
    public function validateCart($userId)
    {
        $items = $this->getUserCart($userId);
        $errors = [];
        $variantModel = new \App\Models\ProductVariant();
        
        foreach ($items as $item) {
            // Check if product is active
            if (!$item['is_active']) {
                $errors[] = "Product '{$item['product_name']}' is no longer available";
                continue;
            }
            
            // Check if product has variants and variant_id is required
            $variants = $variantModel->getByProductId($item['product_id']);
            $hasVariants = !empty($variants);
            
            if ($hasVariants && !$item['variant_id']) {
                $errors[] = "Product '{$item['product_name']}' requires size and color selection. Please remove it from cart and add it again with size and color.";
                continue;
            }
            
            // Check stock
            $availableStock = $item['variant_id'] ? $item['variant_stock'] : $item['stock_quantity'];
            
            if ($availableStock < $item['quantity']) {
                $errors[] = "Only {$availableStock} items available for '{$item['product_name']}'";
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }
    
    /**
     * Prepare cart for checkout
     */
    public function prepareCheckout($userId)
    {
        $items = $this->getUserCart($userId);
        $checkoutItems = [];
        
        foreach ($items as $item) {
            // sale_price already has global offer applied via getUserCart()
            $price = $item['sale_price'] ?? $item['product_price'];
            if ($item['variant_id']) {
                $price += (float)($item['price_modifier'] ?? 0);
            }
            
            // Build variant_name with color-first format: "Color / Size"
            $variantName = null;
            if ($item['variant_id']) {
                $variantParts = [];
                
                // Color is primary
                if (!empty($item['color_value'])) {
                    $variantParts[] = $item['color_value'];
                }
                
                // Size is secondary
                if (!empty($item['size_value'])) {
                    $variantParts[] = $item['size_value'];
                }
                
                if (!empty($variantParts)) {
                    $variantName = implode(' / ', $variantParts);
                } elseif ($item['variant_name'] && $item['variant_value']) {
                    $variantName = $item['variant_name'] . ': ' . $item['variant_value'];
                }
            }
            
            $checkoutItems[] = [
                'product_id'   => $item['product_id'],
                'variant_id'   => $item['variant_id'],
                'product_name' => $item['product_name'],
                'variant_name' => $variantName,
                'size_value'   => $item['size_value'] ?? null,
                'color_value'  => $item['color_value'] ?? null,
                'quantity'     => $item['quantity'],
                'price'        => $price,
                'subtotal'     => $price * $item['quantity'],
            ];
        }
        
        return $checkoutItems;
    }
}