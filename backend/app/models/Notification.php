<?php
namespace App\Models;

use App\Core\Model;

/**
 * Notification Model
 */
class Notification extends Model
{
    protected $table = 'notifications';
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'link',
        'related_id',
        'is_read',
        'read_at',
    ];
    
    /**
     * Create notification for admins
     */
    public function notifyAdmins($type, $title, $message, $link = null, $relatedId = null)
    {
        // Get all admin users
        $sql = "SELECT id FROM users WHERE role = 'admin'";
        $admins = $this->db->fetchAll($sql);
        
        $notifications = [];
        foreach ($admins as $admin) {
            $data = [
                'user_id' => $admin['id'],
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'link' => $link,
                'related_id' => $relatedId,
                'is_read' => false,
            ];
            
            $notificationId = $this->create($data);
            if ($notificationId) {
                $notifications[] = $this->find($notificationId);
            }
        }
        
        return $notifications;
    }
    
    /**
     * Get notifications for a user
     */
    public function getUserNotifications($userId, $limit = 20, $offset = 0)
    {
        $sql = "
            SELECT * FROM {$this->table}
            WHERE user_id = ? OR user_id IS NULL
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ";
        
        return $this->db->fetchAll($sql, [$userId, $limit, $offset]);
    }
    
    /**
     * Get unread count for user
     */
    public function getUnreadCount($userId)
    {
        $sql = "
            SELECT COUNT(*) as count 
            FROM {$this->table}
            WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0
        ";
        
        $result = $this->db->fetch($sql, [$userId]);
        return $result['count'] ?? 0;
    }
    
    /**
     * Mark notification as read
     */
    public function markAsRead($id, $userId = null)
    {
        $data = [
            'is_read' => true,
            'read_at' => date('Y-m-d H:i:s')
        ];
        
        // If userId is provided, ensure user owns this notification
        if ($userId) {
            $notification = $this->find($id);
            if ($notification && ($notification['user_id'] == $userId || $notification['user_id'] === null)) {
                return $this->update($id, $data);
            }
            return false;
        }
        
        return $this->update($id, $data);
    }
    
    /**
     * Mark all notifications as read for user
     */
    public function markAllAsRead($userId)
    {
        $sql = "
            UPDATE {$this->table}
            SET is_read = 1, read_at = NOW()
            WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0
        ";
        
        return $this->db->execute($sql, [$userId]);
    }
    
    /**
     * Delete notification
     */
    public function deleteNotification($id, $userId = null)
    {
        // If userId is provided, ensure user owns this notification
        if ($userId) {
            $notification = $this->find($id);
            if ($notification && ($notification['user_id'] == $userId || $notification['user_id'] === null)) {
                return $this->delete($id);
            }
            return false;
        }
        
        return $this->delete($id);
    }
}

