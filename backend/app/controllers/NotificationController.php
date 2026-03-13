<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Notification;

/**
 * Notification Controller
 */
class NotificationController
{
    protected $notificationModel;
    
    public function __construct()
    {
        $this->notificationModel = new Notification();
    }
    
    /**
     * Get user notifications
     */
    public function index(Request $request)
    {
        try {
            $userId = $request->user_id;
            $limit = (int)$request->input('limit', 20);
            $offset = (int)$request->input('offset', 0);
            
            $notifications = $this->notificationModel->getUserNotifications($userId, $limit, $offset);
            $unreadCount = $this->notificationModel->getUnreadCount($userId);
            
            return Response::success([
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
                'limit' => $limit,
                'offset' => $offset
            ]);
            
        } catch (\Exception $e) {
            return Response::error('Failed to fetch notifications: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Get unread count
     */
    public function unreadCount(Request $request)
    {
        try {
            $userId = $request->user_id;
            $count = $this->notificationModel->getUnreadCount($userId);
            
            return Response::success([
                'unread_count' => $count
            ]);
            
        } catch (\Exception $e) {
            return Response::error('Failed to fetch unread count: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        try {
            $userId = $request->user_id;
            $result = $this->notificationModel->markAsRead($id, $userId);
            
            if (!$result) {
                return Response::error('Failed to mark notification as read', null, 500);
            }
            
            return Response::success(null, 'Notification marked as read');
            
        } catch (\Exception $e) {
            return Response::error('Failed to mark notification as read: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        try {
            $userId = $request->user_id;
            $result = $this->notificationModel->markAllAsRead($userId);
            
            if (!$result) {
                return Response::error('Failed to mark all notifications as read', null, 500);
            }
            
            return Response::success(null, 'All notifications marked as read');
            
        } catch (\Exception $e) {
            return Response::error('Failed to mark all notifications as read: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Delete notification
     */
    public function delete(Request $request, $id)
    {
        try {
            $userId = $request->user_id;
            $result = $this->notificationModel->deleteNotification($id, $userId);
            
            if (!$result) {
                return Response::error('Failed to delete notification', null, 500);
            }
            
            return Response::success(null, 'Notification deleted successfully');
            
        } catch (\Exception $e) {
            return Response::error('Failed to delete notification: ' . $e->getMessage(), null, 500);
        }
    }
}

