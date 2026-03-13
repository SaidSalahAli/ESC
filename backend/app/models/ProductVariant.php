<?php
namespace App\Models;

use App\Core\Model;

/**
 * Product Variant Model
 */
class ProductVariant extends Model
{
    protected $table = 'product_variants';
    protected $fillable = [
        'product_id',
        'name', // 'size', 'color', or 'combination'
        'value', // 'S', 'M', 'L', 'XL', 'XXL' or color name/hex or combination like 'S / red'
        'size_value', // Size value for combination variants
        'color_value', // Color value for combination variants
        'hex', // Hex color code for color variants
        'price_modifier',
        'stock_quantity',
        'sku',
        'barcode', // Barcode for each variant (especially combinations)
    ];
    
    /**
     * Get variants by product ID
     */
    public function getByProductId($productId)
    {
        $sql = "SELECT * FROM {$this->table} WHERE product_id = ? ORDER BY name ASC, value ASC";
        return $this->db->fetchAll($sql, [$productId]);
    }
    
    /**
     * Get variants grouped by name (size, color)
     */
    public function getGroupedByProductId($productId)
    {
        $variants = $this->getByProductId($productId);
        $grouped = [];
        
        foreach ($variants as $variant) {
            $name = $variant['name'];
            if (!isset($grouped[$name])) {
                $grouped[$name] = [];
            }
            $grouped[$name][] = $variant;
        }
        
        return $grouped;
    }
    
    /**
     * Delete all variants for a product
     */
    public function deleteByProductId($productId)
    {
        $sql = "DELETE FROM {$this->table} WHERE product_id = ?";
        return $this->db->execute($sql, [$productId]);
    }
    
    /**
     * Get variant by product and value
     */
    public function findByProductAndValue($productId, $name, $value)
    {
        $sql = "SELECT * FROM {$this->table} WHERE product_id = ? AND name = ? AND value = ? LIMIT 1";
        return $this->db->fetch($sql, [$productId, $name, $value]);
    }
    
    /**
     * Find variant by barcode
     */
    public function findByBarcode($barcode)
    {
        $sql = "SELECT * FROM {$this->table} WHERE barcode = ? LIMIT 1";
        return $this->db->fetch($sql, [$barcode]);
    }
    
    /**
     * Generate unique barcode for variant
     * Format: 622 + product_id (6 digits) + variant_id (7 digits)
     * أو: 622 + product_id (6 digits) + size_code (2 digits) + color_code (2 digits)
     */
    public function generateBarcode($productId, $variantId = null, $sizeValue = null, $colorValue = null)
    {
        // إذا كان لدينا variant_id، استخدمه مباشرة
        if ($variantId) {
            return '622' . str_pad($productId, 6, '0', STR_PAD_LEFT) . str_pad($variantId, 7, '0', STR_PAD_LEFT);
        }
        
        // خلاف ذلك، استخدم size + color codes
        $sizeCode = 0;
        $colorCode = 0;
        
        if ($sizeValue) {
            // تحويل الحجم إلى رقم (S=1, M=2, L=3, XL=4, XXL=5, إلخ)
            $sizeMap = ['XS' => 1, 'S' => 2, 'M' => 3, 'L' => 4, 'XL' => 5, 'XXL' => 6, 'XXXL' => 7];
            $sizeCode = $sizeMap[strtoupper($sizeValue)] ?? substr(md5($sizeValue), 0, 2);
        }
        
        if ($colorValue) {
            // استخدام أول حرفين من hash اللون
            $colorCode = abs(crc32($colorValue)) % 100;
        }
        
        // الحصول على max variant ID لضمان التفرقة
        $sql = "SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM {$this->table}";
        $result = $this->db->fetch($sql);
        $nextId = $result['next_id'] ?? 1;
        
        // توليد باركود: 622 + product_id (6) + size_code (2) + color_code (2) + sequence (3)
        $barcode = '622' . 
                   str_pad($productId, 6, '0', STR_PAD_LEFT) . 
                   str_pad($sizeCode, 2, '0', STR_PAD_LEFT) . 
                   str_pad($colorCode, 2, '0', STR_PAD_LEFT) . 
                   str_pad($nextId % 1000, 3, '0', STR_PAD_LEFT);
        
        // التأكد من عدم تكرار الباركود
        while ($this->findByBarcode($barcode)) {
            $nextId++;
            $barcode = '622' . 
                       str_pad($productId, 6, '0', STR_PAD_LEFT) . 
                       str_pad($sizeCode, 2, '0', STR_PAD_LEFT) . 
                       str_pad($colorCode, 2, '0', STR_PAD_LEFT) . 
                       str_pad($nextId % 1000, 3, '0', STR_PAD_LEFT);
        }
        
        return $barcode;
    }
}

