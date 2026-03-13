<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\NewsletterSubscriber;
use App\Helpers\Validator;

/**
 * Newsletter Controller
 * Simple newsletter subscription - no verification needed
 */
class NewsletterController
{
    protected $newsletterModel;

    public function __construct()
    {
        $this->newsletterModel = new NewsletterSubscriber();
    }

    /**
     * Subscribe to newsletter (public)
     * Just collect the email, no verification needed
     */
    public function subscribe(Request $request)
    {
        $validator = new Validator($request->all(), [
            'email' => 'required|email|max:255',
        ]);

        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }

        try {
            $email = trim($request->input('email'));

            // Check if already subscribed
            $existing = $this->newsletterModel->findByEmail($email);
            if ($existing) {
                if ($existing['is_active']) {
                    return Response::error('This email is already joined our community', 409);
                } else {
                    // Reactivate subscription
                    $this->newsletterModel->update($existing['id'], ['is_active' => true]);
                    return Response::success(['message' => 'Welcome back! You are now subscribed again.'], 201);
                }
            }

            // Create new subscriber - directly active (no verification needed)
            $data = [
                'email' => $email,
                'is_active' => true,
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            ];

            $subscriberId = $this->newsletterModel->create($data);

            return Response::success(
                ['message' => 'Thank you for joining our community!', 'subscriber_id' => $subscriberId],
                201
            );
        } catch (\Exception $e) {
            error_log('NewsletterController::subscribe - Exception: ' . $e->getMessage());
            return Response::error('Failed to join our community. Please try again.', 500);
        }
    }

    /**
     * Unsubscribe from newsletter (public)
     */
    public function unsubscribe(Request $request)
    {
        $validator = new Validator($request->all(), [
            'email' => 'required|email|max:255',
        ]);

        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }

        try {
            $email = trim($request->input('email'));
            $subscriber = $this->newsletterModel->findByEmail($email);

            if (!$subscriber) {
                return Response::error('Email not found in our community', 404);
            }

            $this->newsletterModel->update($subscriber['id'], ['is_active' => false]);

            return Response::success(['message' => 'You have been unsubscribed. We will miss you!']);
        } catch (\Exception $e) {
            error_log('NewsletterController::unsubscribe - Exception: ' . $e->getMessage());
            return Response::error('Failed to unsubscribe', 500);
        }
    }

    /**
     * Get all subscribers (admin only)
     */
    public function getAll(Request $request)
    {
        try {
            $filters = [
                'is_active' => $request->input('is_active'),
                'search' => $request->input('search'),
                'limit' => $request->input('limit', 20),
                'offset' => $request->input('offset', 0),
            ];

            $subscribers = $this->newsletterModel->getAll($filters);
            $total = $this->newsletterModel->getTotalCount();
            $active = $this->newsletterModel->getActiveCount();
            $inactive = $this->newsletterModel->getInactiveCount();

            return Response::success([
                'data' => $subscribers,
                'pagination' => [
                    'total' => $total,
                    'active' => $active,
                    'inactive' => $inactive,
                    'limit' => (int)$filters['limit'],
                    'offset' => (int)$filters['offset'],
                ],
            ]);
        } catch (\Exception $e) {
            error_log('NewsletterController::getAll - Exception: ' . $e->getMessage());
            return Response::error('Failed to fetch subscribers', 500);
        }
    }

    /**
     * Get subscriber by ID (admin only)
     */
    public function getById(Request $request, $id)
    {
        try {
            $subscriber = $this->newsletterModel->findById($id);

            if (!$subscriber) {
                return Response::notFound('Subscriber not found');
            }

            return Response::success($subscriber);
        } catch (\Exception $e) {
            error_log('NewsletterController::getById - Exception: ' . $e->getMessage());
            return Response::error('Failed to fetch subscriber', 500);
        }
    }

    /**
     * Delete subscriber (admin only)
     */
    public function delete(Request $request, $id)
    {
        try {
            $subscriber = $this->newsletterModel->findById($id);

            if (!$subscriber) {
                return Response::notFound('Subscriber not found');
            }

            $this->newsletterModel->delete($id);

            return Response::success(['message' => 'Subscriber deleted successfully']);
        } catch (\Exception $e) {
            error_log('NewsletterController::delete - Exception: ' . $e->getMessage());
            return Response::error('Failed to delete subscriber', 500);
        }
    }

    /**
     * Export subscribers to CSV (admin only)
     */
    public function export(Request $request)
    {
        try {
            $limit = $request->input('limit');
            $offset = $request->input('offset', 0);

            $subscribers = $this->newsletterModel->export($limit, $offset);

            // Create CSV
            $csv = "Email,Subscribed Date\n";
            foreach ($subscribers as $subscriber) {
                $csv .= "\"{$subscriber['email']}\",{$subscriber['created_at']}\n";
            }

            // Return CSV with headers
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename="newsletter_subscribers_' . date('Y-m-d_H-i-s') . '.csv"');
            echo "\xEF\xBB\xBF"; // UTF-8 BOM for Excel
            echo $csv;
            exit;
        } catch (\Exception $e) {
            error_log('NewsletterController::export - Exception: ' . $e->getMessage());
            return Response::error('Failed to export subscribers', 500);
        }
    }

    /**
     * Export subscribers to Excel (admin only)
     */
    public function exportExcel(Request $request)
    {
        try {
            $limit = $request->input('limit');
            $offset = $request->input('offset', 0);

            $subscribers = $this->newsletterModel->export($limit, $offset);

            // Check if PhpSpreadsheet is available
            if (!class_exists('\PhpOffice\PhpSpreadsheet\Spreadsheet')) {
                // Fallback to CSV if Excel library is not available
                return $this->exportCSV($subscribers);
            }

            // Create spreadsheet
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Set headers
            $sheet->setCellValue('A1', 'Email');
            $sheet->setCellValue('B1', 'Subscribed Date');

            // Style headers
            $headerStyle = $sheet->getStyle('A1:B1');
            $headerStyle->getFont()->setBold(true);
            $headerStyle->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                ->getStartColor()->setARGB('FFD3D3D3');

            // Add data
            $row = 2;
            foreach ($subscribers as $subscriber) {
                $sheet->setCellValue('A' . $row, $subscriber['email']);
                $sheet->setCellValue('B' . $row, $subscriber['created_at']);
                $row++;
            }

            // Auto-size columns
            $sheet->getColumnDimension('A')->setAutoSize(true);
            $sheet->getColumnDimension('B')->setAutoSize(true);

            // Create writer
            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);

            // Set headers for download
            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment; filename="newsletter_subscribers_' . date('Y-m-d_H-i-s') . '.xlsx"');

            // Output
            $writer->save('php://output');
            exit;
        } catch (\Exception $e) {
            error_log('NewsletterController::exportExcel - Exception: ' . $e->getMessage());
            // Fallback to CSV
            return $this->exportCSV($this->newsletterModel->export($limit ?? null, $offset ?? 0));
        }
    }

    /**
     * Helper function to export as CSV
     */
    private function exportCSV($subscribers)
    {
        // Create CSV
        $csv = "Email,Subscribed Date\n";
        foreach ($subscribers as $subscriber) {
            $csv .= "\"{$subscriber['email']}\",{$subscriber['created_at']}\n";
        }

        // Return CSV with headers
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="newsletter_subscribers_' . date('Y-m-d_H-i-s') . '.csv"');
        echo "\xEF\xBB\xBF"; // UTF-8 BOM for Excel
        echo $csv;
        exit;
    }
}
