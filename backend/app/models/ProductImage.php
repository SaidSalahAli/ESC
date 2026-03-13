<?php
namespace App\Models;

use App\Core\Model;

/**
 * Product Image Model
 */
class ProductImage extends Model
{
    protected $table = 'product_images';
    protected $fillable = [
        'product_id',
        'image_url',
        'sort_order',
    ];
    
    /**
     * Get images by product ID
     */
    public function getByProductId($productId)
    {
        $sql = "SELECT * FROM {$this->table} WHERE product_id = ? ORDER BY sort_order ASC, id ASC";
        return $this->db->fetchAll($sql, [$productId]);
    }
    
    /**
     * Delete all images for a product
     */
    public function deleteByProductId($productId)
    {
        $sql = "DELETE FROM {$this->table} WHERE product_id = ?";
        return $this->db->execute($sql, [$productId]);
    }
    
    /**
     * Delete image by ID
     */
    public function deleteImage($imageId)
    {
        // Get image path before deleting
        $image = $this->find($imageId);
        if ($image && file_exists(PUBLIC_PATH . $image['image_url'])) {
            unlink(PUBLIC_PATH . $image['image_url']);
        }
        
        return $this->delete($imageId);
    }
}

