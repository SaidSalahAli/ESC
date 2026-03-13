<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Contact;
use App\Helpers\Validator;

/**
 * Contact Controller
 */
class ContactController
{
    protected $contactModel;
    
    public function __construct()
    {
        $this->contactModel = new Contact();
    }
    
    /**
     * Submit contact message (public)
     */
    public function submit(Request $request)
    {
        $validator = new Validator($request->all(), [
            'name' => 'required|string|min:2|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'string|max:50',
            'subject' => 'required|string|min:3|max:255',
            'message' => 'required|string|min:10|max:2000',
        ]);
        
        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }
        
        try {
            // Prepare data array with all fields
            $data = [
                'name' => trim($request->input('name')),
                'email' => trim($request->input('email')),
                'subject' => trim($request->input('subject')),
                'message' => trim($request->input('message')),
                'status' => 'new',
            ];
            
            // Add optional fields (will be handled by filterFillable)
            $phone = trim($request->input('phone', ''));
            if ($phone !== '') {
                $data['phone'] = $phone;
            } else {
                $data['phone'] = null; // Explicitly set to null for optional field
            }
            
            $user_id = $request->user_id ?? null;
            $data['user_id'] = $user_id ? (int)$user_id : null;
            
            // Get IP address
            $ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
            $data['ip_address'] = $ip_address ?: null;
            
            // Get user agent
            $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            $data['user_agent'] = $user_agent ?: null;
            
            // Log data for debugging (only in development)
            $isProduction = (getenv('APP_ENV') === 'production' || getenv('APP_ENV') === 'prod');
            if (!$isProduction) {
                error_log('ContactController::submit - Attempting to create message with data: ' . json_encode($data));
                error_log('ContactController::submit - Data keys: ' . implode(', ', array_keys($data)));
            }
            
            try {
                $messageId = $this->contactModel->create($data);
            } catch (\PDOException $e) {
                error_log('ContactController::submit - PDO Exception in create: ' . $e->getMessage() . ' | Code: ' . $e->getCode());
                throw $e; // Re-throw to be caught by outer catch
            } catch (\Exception $e) {
                error_log('ContactController::submit - Exception in create: ' . $e->getMessage());
                throw $e; // Re-throw to be caught by outer catch
            }
            
            if (!$messageId) {
                error_log('ContactController::submit - Failed to create message. Data: ' . json_encode($data));
                return Response::error('Failed to submit message. Please try again later.', null, 500);
            }
            
            // Create notification for admins
            try {
                $notificationModel = new \App\Models\Notification();
                $notificationModel->notifyAdmins(
                    'contact',
                    'New Contact Message',
                    "New message from {$data['name']} ({$data['email']}): {$data['subject']}",
                    "/dashboard/contact-messages/{$messageId}",
                    $messageId
                );
            } catch (\Exception $e) {
                // Log error but don't fail the message submission
                error_log('Failed to create contact notification: ' . $e->getMessage());
            }
            
            return Response::success([
                'message_id' => $messageId
            ], 'Message submitted successfully. We will get back to you soon.', 201);
            
        } catch (\PDOException $e) {
            error_log('ContactController::submit - PDO Exception: ' . $e->getMessage() . ' | Code: ' . $e->getCode() . ' | SQL State: ' . $e->getCode());
            
            // Check if it's a table doesn't exist error (MySQL error code 1146 or SQLSTATE 42S02)
            $errorCode = $e->getCode();
            $errorMessage = $e->getMessage();
            
            if ($errorCode == 1146 || strpos($errorMessage, "doesn't exist") !== false || strpos($errorMessage, '42S02') !== false) {
                error_log('ContactController::submit - Table does not exist. Please run: backend/database/create_contact_messages_table.sql');
                return Response::error('Contact system is not properly configured. Please contact the administrator.', [
                    'hint' => 'The contact_messages table does not exist. Please run the SQL script: backend/database/create_contact_messages_table.sql'
                ], 500);
            }
            
            $isProduction = (getenv('APP_ENV') === 'production' || getenv('APP_ENV') === 'prod');
            return Response::error('Database error occurred. Please try again later.', [
                'error' => $isProduction ? null : $errorMessage
            ], 500);
        } catch (\Exception $e) {
            error_log('ContactController::submit - Exception: ' . $e->getMessage() . ' | File: ' . $e->getFile() . ' | Line: ' . $e->getLine() . ' | Trace: ' . $e->getTraceAsString());
            return Response::error('An error occurred. Please try again later.', null, 500);
        }
    }
    
    /**
     * Check if contact_messages table exists
     */
    private function checkTableExists()
    {
        try {
            $db = \App\Core\Database::getInstance();
            $sql = "SHOW TABLES LIKE 'contact_messages'";
            $result = $db->fetch($sql);
            
            return [
                'exists' => !empty($result)
            ];
        } catch (\PDOException $e) {
            // Table doesn't exist or database error
            error_log('ContactController::checkTableExists - PDO Error: ' . $e->getMessage());
            return ['exists' => false, 'error' => $e->getMessage()];
        } catch (\Exception $e) {
            error_log('ContactController::checkTableExists - Error: ' . $e->getMessage());
            return ['exists' => false, 'error' => $e->getMessage()];
        }
    }
    
    /**
     * Get all messages (admin only)
     */
    public function getAll(Request $request)
    {
        try {
            $filters = [
                'status' => $request->input('status'),
                'search' => $request->input('search'),
                'limit' => $request->input('limit', 20),
                'offset' => $request->input('offset', 0),
            ];
            
            $messages = $this->contactModel->getAll($filters);
            $unreadCount = $this->contactModel->getUnreadCount();
            
            // Get total count for pagination
            $totalCount = $this->contactModel->getTotalCount($filters);
            
            return Response::success([
                'messages' => $messages,
                'unread_count' => $unreadCount,
                'total' => $totalCount,
                'limit' => $filters['limit'] ?? 20,
                'offset' => $filters['offset'] ?? 0
            ]);
            
        } catch (\Exception $e) {
            return Response::error('Failed to fetch messages: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Get message by ID (admin only)
     */
    public function getById(Request $request, $id)
    {
        try {
            $message = $this->contactModel->getById($id);
            
            if (!$message) {
                return Response::notFound('Message not found');
            }
            
            // Mark as read when viewed
            if ($message['status'] === 'new') {
                $this->contactModel->markAsRead($id);
            }
            
            return Response::success($message);
            
        } catch (\Exception $e) {
            return Response::error('Failed to fetch message: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Update message status (admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = new Validator($request->all(), [
            'status' => 'required|in:new,read,replied,archived',
        ]);
        
        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }
        
        try {
            $status = $request->input('status');
            $result = $this->contactModel->update($id, ['status' => $status]);
            
            if (!$result) {
                return Response::error('Failed to update message status', null, 500);
            }
            
            return Response::success(null, 'Message status updated successfully');
            
        } catch (\Exception $e) {
            return Response::error('Failed to update message status: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Delete message (admin only)
     */
    public function delete(Request $request, $id)
    {
        try {
            $result = $this->contactModel->delete($id);
            
            if (!$result) {
                return Response::error('Failed to delete message', null, 500);
            }
            
            return Response::success(null, 'Message deleted successfully');
            
        } catch (\Exception $e) {
            return Response::error('Failed to delete message: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Reply to a contact message (admin only)
     */
    public function reply(Request $request, $id)
    {
        $validator = new Validator($request->all(), [
            'message' => 'required|string|min:1|max:2000',
            'subject' => 'string|max:255'
        ]);

        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }

        try {
            $message = $this->contactModel->getById($id);

            if (!$message) {
                return Response::notFound('Message not found');
            }

            $replyMessage = $request->input('message');
            $replySubject = $request->input('subject') ?: ('Re: ' . $message['subject']);

            // Send email using EmailService
            try {
                $emailService = new \App\Services\EmailService();
                $emailBody = "<p>Dear " . htmlspecialchars($message['name']) . ",</p>";
                $emailBody .= "<p>" . nl2br(htmlspecialchars($replyMessage)) . "</p>";
                $emailBody .= "<p>Best regards,<br/>" . htmlspecialchars($emailService->config['mail']['from_name'] ?? 'ESC Wear') . "</p>";

                $sent = $emailService->sendRawEmail($message['email'], $replySubject, $emailBody);

                if (!$sent) {
                    throw new \Exception('Failed to send email');
                }

            } catch (\Exception $e) {
                error_log('ContactController::reply - Failed to send reply email: ' . $e->getMessage());
                return Response::error('Failed to send reply email: ' . $e->getMessage(), null, 500);
            }

            // Mark message as replied
            $this->contactModel->markAsReplied($id);

            return Response::success(null, 'Reply sent and message marked as replied');

        } catch (\Exception $e) {
            return Response::error('Failed to reply to message: ' . $e->getMessage(), null, 500);
        }
    }
}

