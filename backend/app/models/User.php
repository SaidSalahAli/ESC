<?php
namespace App\Models;

use App\Core\Model;

/**
 * User Model
 */
class User extends Model
{
    protected $table = 'users';
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'password',
        'google_id',
        'provider',
        'role',
        'avatar',
        'is_active',
    ];
    protected $hidden = ['password'];
    
    /**
     * Find user by email
     */
    public function findByEmail($email)
    {
        return $this->findOneBy('email', $email);
    }
    
    /**
     * Get user with password (for authentication)
     */
    public function findByEmailWithPassword($email)
    {
        $sql = "SELECT * FROM {$this->table} WHERE email = ? LIMIT 1";
        return $this->db->fetch($sql, [$email]);
    }
    
    /**
     * Update last login
     */
    public function updateLastLogin($userId)
    {
        $sql = "UPDATE {$this->table} SET last_login_at = NOW() WHERE id = ?";
        return $this->db->execute($sql, [$userId]);
    }
    
    /**
     * Get user addresses
     */
    public function getAddresses($userId)
    {
        $sql = "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC";
        return $this->db->fetchAll($sql, [$userId]);
    }
    
    /**
     * Get user orders
     */
    public function getOrders($userId, $limit = 10, $offset = 0)
    {
        $sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
        return $this->db->fetchAll($sql, [$userId, $limit, $offset]);
    }
    
    /**
     * Get user's wishlist
     */
    public function getWishlist($userId)
    {
        $sql = "
            SELECT p.*, w.created_at as added_at 
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        ";
        return $this->db->fetchAll($sql, [$userId]);
    }
    
    /**
     * Find user by Google ID
     */
    public function findByGoogleId($googleId)
    {
        $sql = "SELECT * FROM {$this->table} WHERE google_id = ? LIMIT 1";
        return $this->db->fetch($sql, [$googleId]);
    }
    
    /**
     * Find or create user by Google data
     */
    public function findOrCreateByGoogle($googleData)
    {
        // Try to find by Google ID first
        if (isset($googleData['id'])) {
            $user = $this->findByGoogleId($googleData['id']);
            if ($user) {
                return $user;
            }
        }
        
        // Try to find by email
        if (isset($googleData['email'])) {
            $user = $this->findByEmail($googleData['email']);
            if ($user) {
                // Update existing user with Google ID
                $this->update($user['id'], [
                    'google_id' => $googleData['id'],
                    'provider' => 'google',
                    'avatar' => $googleData['picture'] ?? $user['avatar']
                ]);
                return $this->find($user['id']);
            }
        }
        
        // Create new user
        $nameParts = explode(' ', $googleData['name'] ?? 'User', 2);
        $firstName = $nameParts[0] ?? 'User';
        $lastName = $nameParts[1] ?? '';
        
        $userData = [
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $googleData['email'],
            'google_id' => $googleData['id'],
            'provider' => 'google',
            'password' => password_hash(uniqid(), PASSWORD_DEFAULT), // Random password for OAuth users
            'avatar' => $googleData['picture'] ?? null,
            'role' => 'customer',
            'is_active' => true,
            'email_verified_at' => date('Y-m-d H:i:s'), // Google emails are verified
        ];
        
        $userId = $this->create($userData);
        return $this->find($userId);
    }
    
    /**
     * Get user's cart
     */
    public function getCart($userId)
    {
        $sql = "
            SELECT 
                c.*,
                p.name as product_name,
                p.slug as product_slug,
                p.price as product_price,
                p.main_image,
                p.stock_quantity,
                v.name as variant_name,
                v.value as variant_value,
                v.price_modifier,
                (p.price + COALESCE(v.price_modifier, 0)) * c.quantity as subtotal
            FROM cart c
            JOIN products p ON c.product_id = p.id
            LEFT JOIN product_variants v ON c.variant_id = v.id
            WHERE c.user_id = ?
        ";
        return $this->db->fetchAll($sql, [$userId]);
    }
    
    /**
     * Count total customers
     */
    public function countCustomers()
    {
        return $this->count("role = 'customer'");
    }
    
    /**
     * Get recent customers
     */
    public function getRecentCustomers($limit = 10)
    {
        $sql = "SELECT * FROM {$this->table} WHERE role = 'customer' ORDER BY created_at DESC LIMIT ?";
        $results = $this->db->fetchAll($sql, [$limit]);
        return array_map([$this, 'hideFields'], $results);
    }
}

