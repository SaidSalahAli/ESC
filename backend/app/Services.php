<?php
/**
 * Type stubs for IDE auto-completion
 * These files help IntelliSense recognize App namespace classes
 */

namespace App\Services {
    /**
     * Email Service - Handles all email communications
     */
    class EmailService
    {
        public function __construct() {}
        public function sendOrderInvoice($orderId) {}
        public function sendOrderInvoiceWithPdfAttachment($orderId, $pdfContent, $language = 'en') {}
        public function generateInvoiceEmailWithLanguage($order, $user, $language = 'en') {}
        public function sendOrderStatusUpdate($orderId, $newStatus, $language = 'en') {}
        public function sendEmail($to, $subject, $body) {}
        public function generateOrderViewToken($orderId, $userEmail, $ttl = 604800) {}
    }

    /**
     * Invoice PDF Service - Generates professional invoices
     */
    class InvoicePdfService
    {
        public function __construct() {}
        public function generateInvoicePdf($orderId, $language = 'en', $returnPath = false) {}
        public function sendInvoicePdfEmail($orderId, $language = 'en') {}
    }
}
