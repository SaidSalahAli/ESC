<?php
namespace App\Models;

use App\Core\Model;

/**
 * Contact Message Model
 */
class Contact extends Model
{
    protected $table = 'contact_messages';
    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'status',
        'user_id',
        'ip_address',
        'user_agent',
    ];
    
    /**
     * Override filterFillable to handle null values properly
     * This ensures optional fields can be null/empty
     */
    protected function filterFillable($data)
    {
        if (empty($this->fillable)) {
            return $data;
        }
        
        $filtered = [];
        $optionalFields = ['phone', 'user_id', 'ip_address', 'user_agent'];
        
        foreach ($this->fillable as $field) {
            if (array_key_exists($field, $data)) {
                $value = $data[$field];
                
                // For optional fields, include them even if null/empty string
                if (in_array($field, $optionalFields)) {
                    // Convert empty string to null for optional fields
                    $filtered[$field] = ($value === '' || $value === null) ? null : $value;
                } else {
                    // Required fields - only include if not empty
                    if (!empty($value)) {
                        $filtered[$field] = $value;
                    }
                }
            }
        }
        
        return $filtered;
    }
    
    /**
     * Get all messages with optional filters
     */
    public function getAll($filters = [])
    {
        $sql = "SELECT cm.*, u.first_name, u.last_name, u.email as user_email
                FROM {$this->table} cm
                LEFT JOIN users u ON cm.user_id = u.id
                WHERE 1=1";
        
        $params = [];
        
        if (!empty($filters['status'])) {
            $sql .= " AND cm.status = ?";
            $params[] = $filters['status'];
        }
        
        if (!empty($filters['search'])) {
            $sql .= " AND (cm.name LIKE ? OR cm.email LIKE ? OR cm.subject LIKE ? OR cm.message LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        }
        
        $sql .= " ORDER BY cm.created_at DESC";
        
        // Use direct values for LIMIT and OFFSET to avoid PDO issues
        if (!empty($filters['limit'])) {
            $limit = (int)$filters['limit'];
            $offset = !empty($filters['offset']) ? (int)$filters['offset'] : 0;
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }
        
        return $this->db->fetchAll($sql, $params);
    }
    
    /**
     * Get message by ID
     */
    public function getById($id)
    {
        $sql = "SELECT cm.*, u.first_name, u.last_name, u.email as user_email
                FROM {$this->table} cm
                LEFT JOIN users u ON cm.user_id = u.id
                WHERE cm.id = ?";
        
        return $this->db->fetch($sql, [$id]);
    }
    
    /**
     * Get unread messages count
     */
    public function getUnreadCount()
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE status = 'new'";
        $result = $this->db->fetch($sql);
        return $result['count'] ?? 0;
    }
    
    /**
     * Mark message as read
     */
    public function markAsRead($id)
    {
        return $this->update($id, ['status' => 'read']);
    }
    
    /**
     * Mark message as replied
     */
    public function markAsReplied($id)
    {
        return $this->update($id, ['status' => 'replied']);
    }
    
    /**
     * Archive message
     */
    public function archive($id)
    {
        return $this->update($id, ['status' => 'archived']);
    }
    
    /**
     * Get total count of messages with filters (for pagination)
     */
    public function getTotalCount($filters = [])
    {
        $sql = "SELECT COUNT(*) as count FROM {$this->table} WHERE 1=1";
        $params = [];
        
        if (!empty($filters['status'])) {
            $sql .= " AND status = ?";
            $params[] = $filters['status'];
        }
        
        if (!empty($filters['search'])) {
            $sql .= " AND (name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        }
        
        $result = $this->db->fetch($sql, $params);
        return $result['count'] ?? 0;
    }
}

