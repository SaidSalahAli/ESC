<?php

namespace App\Models;

use App\Core\Model;

/**
 * Newsletter Subscriber Model
 */
class NewsletterSubscriber extends Model
{
    protected $table = 'newsletter_subscribers';
    protected $fillable = [
        'email',
        'is_active',
        'ip_address',
        'user_agent',
    ];

    /**
     * Get all subscribers with filters
     */
    public function getAll($filters = [])
    {
        $sql = "SELECT * FROM {$this->table} WHERE 1=1";
        $params = [];

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $sql .= " AND is_active = ?";
            $params[] = (int)$filters['is_active'];
        }

        if (!empty($filters['search'])) {
            $sql .= " AND email LIKE ?";
            $params[] = '%' . $filters['search'] . '%';
        }

        $sql .= " ORDER BY created_at DESC";

        if (!empty($filters['limit'])) {
            $limit = (int)$filters['limit'];
            $offset = !empty($filters['offset']) ? (int)$filters['offset'] : 0;
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }

        return $this->db->fetchAll($sql, $params);
    }

    /**
     * Get subscriber by ID
     */
    public function findById($id)
    {
        $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        return $this->db->fetch($sql, [$id]);
    }

    /**
     * Get active subscribers
     */
    public function getActive()
    {
        $sql = "SELECT * FROM {$this->table} WHERE is_active = TRUE ORDER BY created_at DESC";
        return $this->db->fetchAll($sql, []);
    }

    /**
     * Get subscriber by email
     */
    public function findByEmail($email)
    {
        $sql = "SELECT * FROM {$this->table} WHERE email = ?";
        return $this->db->fetch($sql, [$email]);
    }

    /**
     * Get total count of subscribers
     */
    public function getTotalCount()
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->table}";
        $result = $this->db->fetch($sql, []);
        return $result['count'] ?? 0;
    }

    /**
     * Get active count
     */
    public function getActiveCount()
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE is_active = TRUE";
        $result = $this->db->fetch($sql, []);
        return $result['count'] ?? 0;
    }

    /**
     * Get inactive count
     */
    public function getInactiveCount()
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE is_active = FALSE";
        $result = $this->db->fetch($sql, []);
        return $result['count'] ?? 0;
    }

    /**
     * Export to array with pagination
     */
    public function export($limit = null, $offset = 0)
    {
        $sql = "SELECT email, created_at FROM {$this->table} WHERE is_active = TRUE";

        if ($limit) {
            $limit = (int)$limit;
            $offset = (int)$offset;
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }

        return $this->db->fetchAll($sql, []);
    }
}
