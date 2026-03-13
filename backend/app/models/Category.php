<?php
namespace App\Models;

use App\Core\Model;

/**
 * Category Model
 */
class Category extends Model
{
    protected $table = 'categories';
    protected $fillable = [
        'name',
        'name_ar',
        'slug',
        'description',
        'description_ar',
        'parent_id',
        'image',
        'is_active',
        'sort_order'
    ];
    
    /**
     * Get all categories with product count
     */
    public function getAllWithProductCount($limit = null, $offset = 0)
    {
        $sql = "SELECT c.*, 
                COUNT(p.id) as product_count
                FROM {$this->table} c
                LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
                GROUP BY c.id
                ORDER BY c.sort_order ASC, c.name ASC";
        
        if ($limit) {
            $sql .= " LIMIT ? OFFSET ?";
            return $this->query($sql, [$limit, $offset]);
        }
        
        return $this->query($sql);
    }
    
    /**
     * Get active categories
     */
    public function getActive()
    {
        return $this->query(
            "SELECT * FROM {$this->table} WHERE is_active = 1 ORDER BY sort_order ASC, name ASC"
        );
    }
    
    /**
     * Get category with children
     */
    public function getWithChildren($categoryId)
    {
        $category = $this->find($categoryId);
        
        if (!$category) {
            return null;
        }
        
        $children = $this->query(
            "SELECT * FROM {$this->table} WHERE parent_id = ? ORDER BY sort_order ASC, name ASC",
            [$categoryId]
        );
        
        $category['children'] = $children;
        
        return $category;
    }
    
    /**
     * Get parent categories only
     */
    public function getParents()
    {
        return $this->query(
            "SELECT * FROM {$this->table} WHERE parent_id IS NULL ORDER BY sort_order ASC, name ASC"
        );
    }
    
    /**
     * Check if slug exists (for unique validation)
     */
    public function slugExists($slug, $excludeId = null)
    {
        if ($excludeId) {
            $result = $this->query(
                "SELECT COUNT(*) as count FROM {$this->table} WHERE slug = ? AND id != ?",
                [$slug, $excludeId]
            );
        } else {
            $result = $this->query(
                "SELECT COUNT(*) as count FROM {$this->table} WHERE slug = ?",
                [$slug]
            );
        }
        
        return $result[0]['count'] > 0;
    }
}

