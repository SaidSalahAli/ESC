<?php

namespace App\Models;

use App\Core\Model;

/**
 * Product Model
 */
class Product extends Model
{
    protected $table = 'products';
    protected $fillable = [
        'name',
        'name_ar',
        'slug',
        'description',
        'description_ar',
        'short_description',
        'price',
        'sale_price',
        'discount_type',
        'discount_value',
        'discount_start_at',
        'discount_end_at',
        'is_discount_active',
        'sku',
        'barcode',
        'stock_quantity',
        'category_id',
        'brand',
        'brand_ar',
        'main_image',
        'is_featured',
        'is_active',
        'weight',
        'dimensions',
        'meta_title',
        'meta_description',
    ];

    /**
     * Find product by slug
     */
    public function findBySlug($slug)
    {
        return $this->findOneBy('slug', $slug);
    }

    /**
     * Find product by barcode
     * يبحث أولاً في products ثم في product_variants (للبحث عن combination)
     * Returns: array with 'type' => 'product' or 'variant', and the data
     */
    public function findByBarcode($barcode)
    {
        // البحث في جدول المنتجات أولاً
        $product = $this->findOneBy('barcode', $barcode);
        if ($product) {
            return [
                'type' => 'product',
                'data' => $product
            ];
        }

        // البحث في جدول variants (للـ combinations)
        $variantModel = new \App\Models\ProductVariant();
        $variant = $variantModel->findByBarcode($barcode);
        if ($variant) {
            // جلب معلومات المنتج المرتبط
            $product = $this->find($variant['product_id']);
            return [
                'type' => 'variant',
                'data' => $variant,
                'product' => $product
            ];
        }

        return null;
    }

    /**
     * Generate unique barcode
     * Format: 622 + 10 digits (Egypt country code + product ID padded)
     */
    public function generateBarcode($productId = null)
    {
        if ($productId) {
            // Use product ID to generate barcode
            return '622' . str_pad($productId, 10, '0', STR_PAD_LEFT);
        } else {
            // Generate random barcode for new products
            // Get max ID and add 1
            $sql = "SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM {$this->table}";
            $result = $this->db->fetch($sql);
            $nextId = $result['next_id'] ?? 1;
            return '622' . str_pad($nextId, 10, '0', STR_PAD_LEFT);
        }
    }

    /**
     * Get product with full details (images, variants, reviews)
     */
    public function getProductDetails($id)
    {
        $product = $this->find($id);

        if (!$product) {
            return null;
        }

        // Get images
        $product['images'] = $this->getImages($id);

        // Get variants
        $product['variants'] = $this->getVariants($id);

        // Get reviews stats
        $product['reviews'] = $this->getReviewsStats($id);

        // Get category
        $product['category'] = $this->getCategory($product['category_id']);

        // Increment views count
        $this->incrementViews($id);

        return $product;
    }

    /**
     * Get product images
     */
    public function getImages($productId)
    {
        $sql = "SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC";
        return $this->db->fetchAll($sql, [$productId]);
    }

    /**
     * Get product variants - organized by type (size, color, combination)
     */
    public function getVariants($productId)
    {
        $sql = "SELECT * FROM product_variants WHERE product_id = ? ORDER BY name ASC, value ASC";
        $variants = $this->db->fetchAll($sql, [$productId]);

        // Define clothing size order
        $sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '3XL', '4XL'];

        // Group variants by name
        $grouped = [];
        foreach ($variants as $variant) {
            $name = $variant['name'];
            if (!isset($grouped[$name])) {
                $grouped[$name] = [];
            }
            $grouped[$name][] = $variant;
        }

        // Sort size variants by clothing order
        if (isset($grouped['size'])) {
            usort($grouped['size'], function ($a, $b) use ($sizeOrder) {
                $posA = array_search(strtoupper($a['value']), $sizeOrder);
                $posB = array_search(strtoupper($b['value']), $sizeOrder);
                $posA = $posA === false ? 999 : $posA;
                $posB = $posB === false ? 999 : $posB;
                return $posA - $posB;
            });
        }

        // Same sorting for sizes extracted from combinations
        if (isset($grouped['combination']) && count($grouped['combination']) > 0) {
            $sizeMap = [];
            $colorMap = [];

            foreach ($grouped['combination'] as $combo) {
                $sizeValue = $combo['size_value'] ?? null;
                $colorValue = $combo['color_value'] ?? null;

                if ($sizeValue && !isset($sizeMap[$sizeValue])) {
                    $sizeMap[$sizeValue] = [
                        'id' => $combo['id'] ?? null,
                        'value' => $sizeValue,
                        'size_value' => $sizeValue,
                        'stock_quantity' => 0,
                        'price_modifier' => $combo['price_modifier'] ?? 0,
                        'sku' => $combo['sku'] ?? null,
                    ];
                }

                if ($colorValue && !isset($colorMap[$colorValue])) {
                    $colorMap[$colorValue] = [
                        'id' => $combo['id'] ?? null,
                        'value' => $colorValue,
                        'color_value' => $colorValue,
                        'hex' => $combo['hex'] ?? '#000000',
                        'stock_quantity' => 0,
                        'price_modifier' => $combo['price_modifier'] ?? 0,
                        'sku' => $combo['sku'] ?? null,
                    ];
                }
            }

            if (count($sizeMap) > 0) {
                $sizes = array_values($sizeMap);
                // Sort by clothing size order
                usort($sizes, function ($a, $b) use ($sizeOrder) {
                    $posA = array_search(strtoupper($a['value']), $sizeOrder);
                    $posB = array_search(strtoupper($b['value']), $sizeOrder);
                    $posA = $posA === false ? 999 : $posA;
                    $posB = $posB === false ? 999 : $posB;
                    return $posA - $posB;
                });
                $grouped['size'] = $sizes;
            }

            if (count($colorMap) > 0) {
                $grouped['color'] = array_values($colorMap);
            }
        }

        return $grouped;
    }

    /**
     * Get product reviews statistics
     */
    public function getReviewsStats($productId)
    {
        // Try to use view first, fallback to direct query if view doesn't exist
        try {
            $sql = "SELECT * FROM v_product_reviews_stats WHERE product_id = ?";
            $result = $this->db->fetch($sql, [$productId]);
            if ($result) {
                return $result;
            }
        } catch (\Exception $e) {
            // View doesn't exist, use direct query
        }

        // Fallback: Calculate stats directly
        $sql = "
            SELECT 
                ? as product_id,
                COUNT(r.id) as total_reviews,
                COALESCE(AVG(r.rating), 0) as average_rating,
                SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as one_star
            FROM reviews r
            WHERE r.product_id = ? AND r.is_approved = 1
        ";
        return $this->db->fetch($sql, [$productId, $productId]) ?: [
            'product_id' => $productId,
            'total_reviews' => 0,
            'average_rating' => 0,
            'five_star' => 0,
            'four_star' => 0,
            'three_star' => 0,
            'two_star' => 0,
            'one_star' => 0
        ];
    }

    /**
     * Get category
     */
    public function getCategory($categoryId)
    {
        if (!$categoryId) return null;

        $sql = "SELECT * FROM categories WHERE id = ?";
        return $this->db->fetch($sql, [$categoryId]);
    }

    /**
     * Increment views count
     */
    public function incrementViews($productId)
    {
        $sql = "UPDATE {$this->table} SET views_count = views_count + 1 WHERE id = ?";
        return $this->db->execute($sql, [$productId]);
    }

    /**
     * Update sales count
     */
    public function updateSalesCount($productId)
    {
        $sql = "CALL sp_update_product_sales_count(?)";
        return $this->db->execute($sql, [$productId]);
    }

    /**
     * Get featured products with full details (images, variants, reviews)
     */
    public function getFeatured($limit = 8)
    {
        $sql = "SELECT * FROM {$this->table} WHERE is_featured = 1 AND is_active = 1 ORDER BY created_at DESC LIMIT ?";
        $products = $this->db->fetchAll($sql, [$limit]);

        // Add full details for each product
        return $this->enrichProductsWithDetails($products);
    }

    /**
     * Enrich products array with images and variants
     */
    private function enrichProductsWithDetails($products)
    {
        if (empty($products)) {
            return [];
        }

        $enriched = [];
        foreach ($products as $product) {
            $product['images'] = $this->getImages($product['id']);
            $product['variants'] = $this->getVariants($product['id']);
            $product['reviews'] = $this->getReviewsStats($product['id']);
            $product['category'] = $this->getCategory($product['category_id']);
            $enriched[] = $product;
        }

        return $enriched;
    }

    /**
     * Get top selling products
     */
    public function getTopSelling($limit = 10)
    {
        // Use direct query (don't rely on views)
        $sql = "
            SELECT 
                p.*
            FROM {$this->table} p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id 
                AND (o.payment_status = 'paid' OR (o.payment_method = 'cash_on_delivery' AND o.payment_status = 'pending'))
            WHERE p.is_active = 1
            GROUP BY p.id
            ORDER BY p.sales_count DESC, COALESCE(SUM(oi.subtotal), 0) DESC
            LIMIT ?
        ";
        $products = $this->db->fetchAll($sql, [$limit]);

        // Add full details for each product
        return $this->enrichProductsWithDetails($products);
    }

    /**
     * Search products
     */
    public function search($query, $filters = [], $limit = 20, $offset = 0)
    {
        $sql = "SELECT * FROM {$this->table} WHERE is_active = 1";
        $params = [];

        // Full-text search
        if (!empty($query)) {
            $sql .= " AND MATCH(name, description) AGAINST (? IN NATURAL LANGUAGE MODE)";
            $params[] = $query;
        }

        // Category filter
        if (!empty($filters['category_id'])) {
            $sql .= " AND category_id = ?";
            $params[] = $filters['category_id'];
        }

        // Price range filter
        if (!empty($filters['min_price'])) {
            $sql .= " AND price >= ?";
            $params[] = $filters['min_price'];
        }

        if (!empty($filters['max_price'])) {
            $sql .= " AND price <= ?";
            $params[] = $filters['max_price'];
        }

        // Brand filter
        if (!empty($filters['brand'])) {
            $sql .= " AND brand = ?";
            $params[] = $filters['brand'];
        }

        // Sorting
        $sortBy = $filters['sort'] ?? 'created_at';
        $sortOrder = $filters['order'] ?? 'DESC';
        $sql .= " ORDER BY {$sortBy} {$sortOrder}";

        // Pagination
        $sql .= " LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $products = $this->db->fetchAll($sql, $params);

        // Add full details for each product
        return $this->enrichProductsWithDetails($products);
    }

    /**
     * Get filtered products count (for pagination)
     */
    public function getFilteredCount($query = '', $filters = [])
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE is_active = 1";
        $params = [];

        // Full-text search
        if (!empty($query)) {
            $sql .= " AND MATCH(name, description) AGAINST (? IN NATURAL LANGUAGE MODE)";
            $params[] = $query;
        }

        // Category filter
        if (!empty($filters['category_id'])) {
            $sql .= " AND category_id = ?";
            $params[] = $filters['category_id'];
        }

        // Price range filter
        if (!empty($filters['min_price'])) {
            $sql .= " AND price >= ?";
            $params[] = $filters['min_price'];
        }

        if (!empty($filters['max_price'])) {
            $sql .= " AND price <= ?";
            $params[] = $filters['max_price'];
        }

        // Brand filter
        if (!empty($filters['brand'])) {
            $sql .= " AND brand = ?";
            $params[] = $filters['brand'];
        }

        $result = $this->db->fetch($sql, $params);
        return $result['count'] ?? 0;
    }

    /**
     * Get products by category
     */
    public function getByCategory($categoryId, $limit = 20, $offset = 0)
    {
        $sql = "SELECT * FROM {$this->table} WHERE category_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $products = $this->db->fetchAll($sql, [$categoryId, $limit, $offset]);

        // Add full details for each product
        return $this->enrichProductsWithDetails($products);
    }

    /**
     * Get related products
     */
    public function getRelated($productId, $categoryId, $limit = 4)
    {
        $sql = "SELECT * FROM {$this->table} WHERE category_id = ? AND id != ? AND is_active = 1 ORDER BY RAND() LIMIT ?";
        $products = $this->db->fetchAll($sql, [$categoryId, $productId, $limit]);

        // Add full details for each product
        return $this->enrichProductsWithDetails($products);
    }

    /**
     * Check stock availability
     */
    public function checkStock($productId, $quantity = 1, $variantId = null)
    {
        if ($variantId) {
            $sql = "SELECT stock_quantity FROM product_variants WHERE id = ?";
            $result = $this->db->fetch($sql, [$variantId]);
        } else {
            $sql = "SELECT stock_quantity FROM {$this->table} WHERE id = ?";
            $result = $this->db->fetch($sql, [$productId]);
        }

        if (!$result) {
            return false;
        }

        return $result['stock_quantity'] >= $quantity;
    }

    /**
     * Get stock information
     */
    public function getStockInfo($productId, $variantId = null)
    {
        if ($variantId) {
            $sql = "SELECT stock_quantity FROM product_variants WHERE id = ?";
            return $this->db->fetch($sql, [$variantId]);
        } else {
            $sql = "SELECT stock_quantity FROM {$this->table} WHERE id = ?";
            return $this->db->fetch($sql, [$productId]);
        }
    }

    /**
     * Update stock (decrease when order is created)
     */
    public function updateStock($productId, $quantity, $variantId = null)
    {
        try {
            if ($variantId) {
                // Check if variant exists and has enough stock
                $variant = $this->db->fetch("SELECT stock_quantity FROM product_variants WHERE id = ?", [$variantId]);
                if (!$variant) {
                    error_log("Variant not found: ID={$variantId}");
                    return false;
                }

                $newStock = $variant['stock_quantity'] - $quantity;
                if ($newStock < 0) {
                    error_log("Insufficient stock for variant ID={$variantId}. Current: {$variant['stock_quantity']}, Requested: {$quantity}");
                    return false;
                }

                $sql = "UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?";
                $result = $this->db->execute($sql, [$quantity, $variantId]);

                if ($result) {
                    error_log("Stock decreased: Variant ID={$variantId}, Quantity={$quantity}, New Stock=" . ($variant['stock_quantity'] - $quantity));
                }

                return $result;
            } else {
                // Check if product exists and has enough stock
                $product = $this->db->fetch("SELECT stock_quantity FROM {$this->table} WHERE id = ?", [$productId]);
                if (!$product) {
                    error_log("Product not found: ID={$productId}");
                    return false;
                }

                $newStock = $product['stock_quantity'] - $quantity;
                if ($newStock < 0) {
                    error_log("Insufficient stock for product ID={$productId}. Current: {$product['stock_quantity']}, Requested: {$quantity}");
                    return false;
                }

                $sql = "UPDATE {$this->table} SET stock_quantity = stock_quantity - ? WHERE id = ?";
                $result = $this->db->execute($sql, [$quantity, $productId]);

                if ($result) {
                    error_log("Stock decreased: Product ID={$productId}, Quantity={$quantity}, New Stock=" . ($product['stock_quantity'] - $quantity));
                }

                return $result;
            }
        } catch (\Exception $e) {
            error_log("Error updating stock: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Return product to stock (increase stock quantity)
     */
    public function returnToStock($productId, $quantity, $variantId = null)
    {
        try {
            if ($variantId) {
                // Check if variant exists
                $variant = $this->db->fetch("SELECT stock_quantity FROM product_variants WHERE id = ?", [$variantId]);
                if (!$variant) {
                    error_log("Variant not found for return: ID={$variantId}");
                    return false;
                }

                $oldStock = $variant['stock_quantity'];
                $sql = "UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE id = ?";
                $result = $this->db->execute($sql, [$quantity, $variantId]);

                if ($result) {
                    $newStock = $oldStock + $quantity;
                    error_log("Stock returned: Variant ID={$variantId}, Quantity={$quantity}, Old Stock={$oldStock}, New Stock={$newStock}");
                } else {
                    error_log("Failed to return stock for variant ID={$variantId}");
                }

                return $result;
            } else {
                // Check if product exists
                $product = $this->db->fetch("SELECT stock_quantity FROM {$this->table} WHERE id = ?", [$productId]);
                if (!$product) {
                    error_log("Product not found for return: ID={$productId}");
                    return false;
                }

                $oldStock = $product['stock_quantity'];
                $sql = "UPDATE {$this->table} SET stock_quantity = stock_quantity + ? WHERE id = ?";
                $result = $this->db->execute($sql, [$quantity, $productId]);

                if ($result) {
                    $newStock = $oldStock + $quantity;
                    error_log("Stock returned: Product ID={$productId}, Quantity={$quantity}, Old Stock={$oldStock}, New Stock={$newStock}");
                } else {
                    error_log("Failed to return stock for product ID={$productId}");
                }

                return $result;
            }
        } catch (\Exception $e) {
            error_log("Error returning to stock: " . $e->getMessage());
            return false;
        }
    }
    public function validateDiscountData(array $data)
    {
        $errors = [];

        $price = isset($data['price']) ? (float)$data['price'] : 0;
        $isActive = isset($data['is_discount_active']) && (int)$data['is_discount_active'] === 1;
        $type = $data['discount_type'] ?? 'none';
        $value = isset($data['discount_value']) && $data['discount_value'] !== '' ? (float)$data['discount_value'] : 0;

        if (!$isActive || $type === 'none') {
            return [];
        }

        if (!in_array($type, ['percentage', 'fixed'], true)) {
            $errors['discount_type'][] = 'Invalid discount type.';
        }

        if ($value <= 0) {
            $errors['discount_value'][] = 'Discount value must be greater than zero.';
        }

        if ($type === 'percentage' && $value > 100) {
            $errors['discount_value'][] = 'Percentage discount must be less than or equal to 100.';
        }

        if ($type === 'fixed' && $value >= $price) {
            $errors['discount_value'][] = 'Fixed discount must be less than product price.';
        }

        if (!empty($data['discount_start_at']) && !empty($data['discount_end_at'])) {
            if (strtotime($data['discount_end_at']) <= strtotime($data['discount_start_at'])) {
                $errors['discount_end_at'][] = 'Discount end date must be after start date.';
            }
        }

        return $errors;
    }

    public function prepareDiscountData(array $data)
    {
        $isActive = isset($data['is_discount_active']) && (int)$data['is_discount_active'] === 1;

        $data['is_discount_active'] = $isActive ? 1 : 0;
        $data['discount_type'] = $isActive ? ($data['discount_type'] ?? 'none') : 'none';
        $data['discount_value'] = $isActive && isset($data['discount_value']) && $data['discount_value'] !== ''
            ? (float)$data['discount_value']
            : null;

        $data['discount_start_at'] = !empty($data['discount_start_at']) ? $data['discount_start_at'] : null;
        $data['discount_end_at'] = !empty($data['discount_end_at']) ? $data['discount_end_at'] : null;

        $data = $this->applyDiscountMeta($data);

        return $data;
    }
    public function applyDiscountMeta(array $product)
    {
        $price = isset($product['price']) ? (float)$product['price'] : 0;
        $salePrice = null;

        $isActive = isset($product['is_discount_active']) && (int)$product['is_discount_active'] === 1;
        $discountType = $product['discount_type'] ?? 'none';
        $discountValue = isset($product['discount_value']) ? (float)$product['discount_value'] : 0;

        $now = time();

        $startOk = empty($product['discount_start_at']) || strtotime($product['discount_start_at']) <= $now;
        $endOk = empty($product['discount_end_at']) || strtotime($product['discount_end_at']) >= $now;

        if ($isActive && $price > 0 && $discountValue > 0 && $startOk && $endOk) {
            if ($discountType === 'percentage') {
                $salePrice = $price - ($price * $discountValue / 100);
            } elseif ($discountType === 'fixed') {
                $salePrice = $price - $discountValue;
            }
        }

        if ($salePrice !== null) {
            $salePrice = max(round($salePrice, 2), 0);
        }

        $product['sale_price'] = ($salePrice !== null && $salePrice < $price) ? $salePrice : null;

        $product['has_discount'] = $product['sale_price'] !== null;

        $product['discount_percent'] = $product['has_discount']
            ? (int) round((($price - (float)$product['sale_price']) / $price) * 100)
            : 0;

        return $product;
    }
}
