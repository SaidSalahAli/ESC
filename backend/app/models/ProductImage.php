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
        'color_value',
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
     * Get general images for a product (no color filter)
     */
    public function getGeneralImages($productId)
    {
        $sql = "SELECT * FROM {$this->table} WHERE product_id = ? AND color_value IS NULL ORDER BY sort_order ASC, id ASC";
        return $this->db->fetchAll($sql, [$productId]);
    }

    /**
     * Get images for a specific color
     */
    public function getColorImages($productId, $colorValue)
    {
        $sql = "SELECT * FROM {$this->table} WHERE product_id = ? AND color_value = ? ORDER BY sort_order ASC, id ASC";
        return $this->db->fetchAll($sql, [$productId, $colorValue]);
    }

    /**
     * Get images grouped by color (returns array with 'general' and color keys)
     */
    public function getImagesByColor($productId)
    {
        $images = $this->getByProductId($productId);
        $grouped = ['general' => []];

        foreach ($images as $img) {
            $color = $img['color_value'] ?? null;
            if ($color) {
                if (!isset($grouped[$color])) {
                    $grouped[$color] = [];
                }
                $grouped[$color][] = $img;
            } else {
                $grouped['general'][] = $img;
            }
        }

        return $grouped;
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
