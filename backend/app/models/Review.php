<?php
namespace App\Models;

use App\Core\Model;

/**
 * Review Model
 */
class Review extends Model
{
    protected $table = 'reviews';
    protected $fillable = [
        'product_id',
        'user_id',
        'rating',
        'title',
        'comment',
        'is_verified_purchase',
        'is_approved',
    ];
    
    /**
     * Get product reviews
     */
    public function getProductReviews($productId, $limit = 10, $offset = 0, $approved = true)
    {
        // Ensure productId is integer
        $productId = (int)$productId;
        $limit = (int)$limit;
        $offset = (int)$offset;
        
        $sql = "
            SELECT 
                r.*,
                u.first_name,
                u.last_name,
                u.avatar
            FROM {$this->table} r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
        ";
        
        $params = [$productId];
        
        if ($approved) {
            $sql .= " AND r.is_approved = 1";
        }
        
        $sql .= " ORDER BY r.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        return $this->db->fetchAll($sql, $params);
    }
    
    /**
     * Get user reviews
     */
    public function getUserReviews($userId, $limit = 10, $offset = 0)
    {
        $sql = "
            SELECT 
                r.*,
                p.name as product_name,
                p.slug as product_slug,
                p.main_image
            FROM {$this->table} r
            JOIN products p ON r.product_id = p.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        ";
        
        return $this->db->fetchAll($sql, [$userId, $limit, $offset]);
    }
    
    /**
     * Check if user can review product (must have purchased)
     */
    public function canUserReview($userId, $productId)
    {
        // Check if user already reviewed
        $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE user_id = ? AND product_id = ?";
        $result = $this->db->fetch($sql, [$userId, $productId]);
        
        if ($result['count'] > 0) {
            return false;
        }
        
        // Check if user purchased the product
        // Include both paid orders and cash on delivery orders (pending payment but order confirmed)
        $sql = "
            SELECT COUNT(*) as count 
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.user_id = ? 
                AND oi.product_id = ? 
                AND o.status NOT IN ('cancelled', 'refunded')
                AND (
                    o.payment_status = 'paid' 
                    OR (o.payment_method = 'cash_on_delivery' AND o.payment_status = 'pending')
                )
        ";
        
        $result = $this->db->fetch($sql, [$userId, $productId]);
        
        return $result['count'] > 0;
    }
    
    /**
     * Check if user has purchased the product (for verified purchase badge)
     */
    private function hasUserPurchased($userId, $productId)
    {
        $sql = "
            SELECT COUNT(*) as count 
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.user_id = ? 
                AND oi.product_id = ? 
                AND o.status NOT IN ('cancelled', 'refunded')
                AND (
                    o.payment_status = 'paid' 
                    OR (o.payment_method = 'cash_on_delivery' AND o.payment_status = 'pending')
                )
        ";
        
        $result = $this->db->fetch($sql, [$userId, $productId]);
        return $result['count'] > 0;
    }
    
    /**
     * Create review
     */
    public function createReview($data)
    {
        // Check if this is a verified purchase (user has purchased the product)
        $isVerified = $this->hasUserPurchased($data['user_id'], $data['product_id']);
        
        // Set verified purchase flag (0 or 1 for boolean field)
        $data['is_verified_purchase'] = $isVerified ? 1 : 0;
        
        // All reviews need manual approval by admin (even verified purchases)
        // This ensures all reviews are reviewed before being shown to customers
        $data['is_approved'] = 0;
        
        // Ensure boolean values are integers for MySQL
        $data['is_verified_purchase'] = (int)$data['is_verified_purchase'];
        $data['is_approved'] = (int)$data['is_approved'];
        
        return $this->create($data);
    }
    
    /**
     * Update review approval status
     */
    public function approve($reviewId)
    {
        return $this->update($reviewId, ['is_approved' => 1]);
    }
    
    /**
     * Reject review
     */
    public function reject($reviewId)
    {
        return $this->update($reviewId, ['is_approved' => 0]);
    }
    
    /**
     * Get pending reviews (for admin)
     */
    public function getPendingReviews($limit = 20, $offset = 0)
    {
        $sql = "
            SELECT 
                r.*,
                u.first_name,
                u.last_name,
                u.email,
                p.name as product_name,
                p.slug as product_slug
            FROM {$this->table} r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
            WHERE (r.is_approved = 0 OR r.is_approved IS NULL)
            ORDER BY r.created_at DESC
            LIMIT ? OFFSET ?
        ";
        
        return $this->db->fetchAll($sql, [$limit, $offset]);
    }
    
    /**
     * Get review statistics
     */
    public function getStatistics($productId = null)
    {
        if ($productId) {
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
        
        $sql = "
            SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                SUM(CASE WHEN is_approved = 1 THEN 1 ELSE 0 END) as approved_count,
                SUM(CASE WHEN is_approved = 0 THEN 1 ELSE 0 END) as pending_count
            FROM {$this->table}
        ";
        
        return $this->db->fetch($sql);
    }
    
    /**
     * Get recent reviews
     */
    public function getRecent($limit = 10)
    {
        $sql = "
            SELECT 
                r.*,
                u.first_name,
                u.last_name,
                p.name as product_name,
                p.slug as product_slug
            FROM {$this->table} r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
            WHERE r.is_approved = 1
            ORDER BY r.created_at DESC
            LIMIT ?
        ";
        
        return $this->db->fetchAll($sql, [$limit]);
    }
}

