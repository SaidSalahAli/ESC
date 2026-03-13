<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Services\EmailService;

/**
 * Invoice PDF Service - Generates professional invoices in PDF format
 * Supports both Arabic and English languages with RTL support
 * 
 * Requirements:
 *   composer require mpdf/mpdf
 */
class InvoicePdfService
{
    private $order;
    private $user;

    /**
     * Generate invoice PDF
     *
     * @param int    $orderId    Order ID
     * @param string $language   Language code ('en' or 'ar')
     * @param bool   $returnPath If true, saves file and returns path; if false, returns PDF binary string
     * @return string PDF binary string or file path
     */
    public function generateInvoicePdf($orderId, $language = 'en', $returnPath = false)
    {
        try {
            $orderModel = new Order();
            $userModel  = new User();

            $this->order = $orderModel->getOrderDetails($orderId);
            if (!$this->order) {
                throw new \Exception('Order not found');
            }

            $this->user = $userModel->find($this->order['user_id']);
            if (!$this->user) {
                throw new \Exception('User not found');
            }

            return $this->generateMpdfInvoice($language, $returnPath);
        } catch (\Exception $e) {
            error_log('Invoice PDF generation error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate PDF using mPDF (supports Arabic / RTL natively)
     *
     * @param string $language   Language code ('en' or 'ar')
     * @param bool   $returnPath Save file and return path instead of binary
     * @return string PDF binary string or absolute file path
     */
    private function generateMpdfInvoice($language = 'en', $returnPath = false)
    {
        $isArabic = ($language === 'ar');
        $strings  = $this->getLanguageStrings($language);

        // ── mPDF configuration ──────────────────────────────────────────────
        $mpdf = new \Mpdf\Mpdf([
            'mode'              => $isArabic ? 'utf-8' : 'utf-8',
            'format'            => 'A4',
            'margin_top'        => 15,
            'margin_bottom'     => 15,
            'margin_left'       => 15,
            'margin_right'      => 15,
            'autoScriptToLang'  => true,
            'autoLangToFont'    => true,
            // Arabic-capable font bundled with mPDF
            'default_font'      => $isArabic ? 'dejavusans' : 'dejavusans',
        ]);

        $mpdf->SetTitle('Invoice #' . $this->order['order_number']);
        $mpdf->SetAuthor('ESC Wear');
        $mpdf->SetCreator('ESC Wear');

        // ── Build HTML ───────────────────────────────────────────────────────
        $html = $this->buildInvoiceHtml($language, $strings, $isArabic);

        $mpdf->WriteHTML($html);

        // ── Output ───────────────────────────────────────────────────────────
        if ($returnPath) {
            $dir = __DIR__ . '/../../public/uploads/invoices/';
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
            $filePath = $dir . 'invoice_' . $this->order['id'] . '.pdf';
            $mpdf->Output($filePath, \Mpdf\Output\Destination::FILE);
            return $filePath;
        }

        // Return binary string
        return $mpdf->Output('', \Mpdf\Output\Destination::STRING_RETURN);
    }

    /**
     * Build the invoice HTML used by mPDF
     *
     * @param string $language
     * @param array  $strings
     * @param bool   $isArabic
     * @return string
     */
    private function buildInvoiceHtml($language, $strings, $isArabic)
    {
        $direction = $isArabic ? 'rtl' : 'ltr';
        $textAlign = $isArabic ? 'right' : 'left';
        $numAlign  = $isArabic ? 'left'  : 'right';

        $paymentMethods = $this->getPaymentMethods($language);
        $paymentMethod  = $paymentMethods[$this->order['payment_method']] ?? $this->order['payment_method'];
        $currency       = $this->order['currency'];

        // ── Styles ────────────────────────────────────────────────────────────
        $css = '
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }

            body {
                font-family: dejavusans, sans-serif;
                font-size: 11px;
                color: #333;
                direction: ' . $direction . ';
            }

            /* ── Header ── */
            .header {
                text-align: center;
                border-bottom: 3px solid #2c3e50;
                padding-bottom: 12px;
                margin-bottom: 18px;
            }
            .header h1 {
                font-size: 22px;
                color: #2c3e50;
                letter-spacing: 2px;
                margin-bottom: 4px;
            }
            .header p { font-size: 11px; color: #7f8c8d; margin: 2px 0; }

            /* ── Two-column meta ── */
            .meta-table { width: 100%; margin-bottom: 20px; }
            .meta-table td { vertical-align: top; width: 50%; padding: 0 6px; }
            .meta-label {
                font-size: 9px;
                text-transform: uppercase;
                color: #95a5a6;
                font-weight: bold;
                margin-bottom: 5px;
                letter-spacing: 1px;
            }
            .meta-value { font-size: 11px; line-height: 1.6; }

            /* ── Items table ── */
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .items-table thead tr {
                background-color: #2c3e50;
                color: #ffffff;
            }
            .items-table thead th {
                padding: 8px 10px;
                font-size: 10px;
                font-weight: bold;
            }
            .items-table tbody td {
                padding: 8px 10px;
                border-bottom: 1px solid #ecf0f1;
                font-size: 10px;
            }
            .items-table tbody tr:nth-child(even) td {
                background-color: #f8f9fa;
            }

            /* ── Totals ── */
            .totals-table {
                width: 45%;
                margin-' . ($isArabic ? 'right' : 'left') . ': auto;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .totals-table td {
                padding: 5px 10px;
                font-size: 11px;
                border-bottom: 1px solid #ecf0f1;
            }
            .totals-table .grand-total td {
                background-color: #2c3e50;
                color: #ffffff;
                font-size: 13px;
                font-weight: bold;
                border: none;
            }

            /* ── Payment box ── */
            .payment-box {
                background-color: #f0f3f4;
                border-radius: 4px;
                padding: 12px 16px;
                margin-bottom: 20px;
            }
            .payment-box h3 {
                font-size: 12px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 6px;
            }
            .payment-box p { font-size: 11px; margin: 3px 0; }

            /* ── Footer ── */
            .footer {
                text-align: center;
                font-size: 10px;
                color: #95a5a6;
                border-top: 1px solid #ecf0f1;
                padding-top: 10px;
            }

            /* Alignment helpers */
            .text-center { text-align: center; }
            .text-right  { text-align: right; }
            .text-left   { text-align: left; }
        </style>';

        // ── Items rows ────────────────────────────────────────────────────────
        $itemsRows = '';
        foreach ($this->order['items'] ?? [] as $item) {
            $productName = htmlspecialchars($item['product_name'] ?? 'N/A');
            $variant     = !empty($item['variant_name'])
                ? ' <span style="color:#7f8c8d">(' . htmlspecialchars($item['variant_name']) . ')</span>'
                : '';
            $itemTotal   = $item['quantity'] * $item['price'];

            $itemsRows .= '
            <tr>
                <td style="text-align:' . $textAlign . '">' . $productName . $variant . '</td>
                <td class="text-center">' . (int)$item['quantity'] . '</td>
                <td style="text-align:' . $numAlign . '">' . number_format($item['price'], 2) . ' ' . $currency . '</td>
                <td style="text-align:' . $numAlign . '">' . number_format($itemTotal, 2) . ' ' . $currency . '</td>
            </tr>';
        }

        // ── Totals rows ───────────────────────────────────────────────────────
        $totalsRows = '
            <tr>
                <td style="text-align:' . $textAlign . '">' . $strings['subtotal_label'] . '</td>
                <td style="text-align:' . $numAlign . '">' . number_format($this->order['subtotal'], 2) . ' ' . $currency . '</td>
            </tr>';

        if ($this->order['shipping_cost'] > 0) {
            $totalsRows .= '
            <tr>
                <td style="text-align:' . $textAlign . '">' . $strings['shipping_label'] . '</td>
                <td style="text-align:' . $numAlign . '">' . number_format($this->order['shipping_cost'], 2) . ' ' . $currency . '</td>
            </tr>';
        }

        if ($this->order['discount'] > 0) {
            $totalsRows .= '
            <tr>
                <td style="text-align:' . $textAlign . '">' . $strings['discount_label'] . '</td>
                <td style="text-align:' . $numAlign . '">- ' . number_format($this->order['discount'], 2) . ' ' . $currency . '</td>
            </tr>';
        }

        $totalsRows .= '
            <tr class="grand-total">
                <td style="text-align:' . $textAlign . '">' . $strings['total_label'] . '</td>
                <td style="text-align:' . $numAlign . '">' . number_format($this->order['total'], 2) . ' ' . $currency . '</td>
            </tr>';

        // ── Shipping address ──────────────────────────────────────────────────
        $shippingAddress =
            htmlspecialchars($this->order['shipping_address']['address_line1'] ?? '') . '<br>' .
            htmlspecialchars($this->order['shipping_address']['city'] ?? '') . ', ' .
            htmlspecialchars($this->order['shipping_address']['postal_code'] ?? '');

        // ── Full HTML ─────────────────────────────────────────────────────────
        $html = '<!DOCTYPE html>
<html lang="' . $language . '" dir="' . $direction . '">
<head>
<meta charset="UTF-8">
' . $css . '
</head>
<body>

    <!-- Header -->
    <div class="header">
        <h1>' . $strings['invoice_title'] . '</h1>
        <p><strong>' . $strings['invoice_number'] . ':</strong> ' . htmlspecialchars($this->order['order_number']) . '</p>
        <p>' . date('Y-m-d H:i', strtotime($this->order['created_at'])) . '</p>
    </div>

    <!-- From / Bill To -->
    <table class="meta-table">
        <tr>
            <td>
                <div class="meta-label">' . $strings['from_label'] . '</div>
                <div class="meta-value">
                    <strong>ESC Wear</strong><br>
                    Egypt
                </div>
            </td>
            <td>
                <div class="meta-label">' . $strings['bill_to_label'] . '</div>
                <div class="meta-value">
                    <strong>' . htmlspecialchars(($this->user['first_name'] ?? '') . ' ' . ($this->user['last_name'] ?? '')) . '</strong><br>
                    ' . $shippingAddress . '
                </div>
            </td>
        </tr>
    </table>

    <!-- Items -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="text-align:' . $textAlign . '; width:50%">' . $strings['product_label'] . '</th>
                <th class="text-center" style="width:12%">' . $strings['quantity_label'] . '</th>
                <th style="text-align:' . $numAlign . '; width:19%">' . $strings['price_label'] . '</th>
                <th style="text-align:' . $numAlign . '; width:19%">' . $strings['total_label'] . '</th>
            </tr>
        </thead>
        <tbody>
            ' . $itemsRows . '
        </tbody>
    </table>

    <!-- Totals -->
    <table class="totals-table">
        ' . $totalsRows . '
    </table>

    <!-- Payment info -->
    <div class="payment-box">
        <h3>' . $strings['payment_info_label'] . '</h3>
        <p><strong>' . $strings['payment_method_label'] . ':</strong> ' . htmlspecialchars($paymentMethod) . '</p>
        <p><strong>' . $strings['payment_status_label'] . ':</strong> ' . htmlspecialchars(ucfirst($this->order['payment_status'])) . '</p>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>' . $strings['thank_you'] . '</p>
    </div>

</body>
</html>';

        return $html;
    }

    /**
     * Generate HTML invoice (kept as lightweight fallback / preview)
     *
     * @param string $language
     * @return string HTML content
     */
    public function generateInvoiceHtml($language = 'en')
    {
        $strings  = $this->getLanguageStrings($language);
        $isArabic = ($language === 'ar');
        return $this->buildInvoiceHtml($language, $strings, $isArabic);
    }

    /**
     * Get language-specific strings
     *
     * @param string $language
     * @return array
     */
    private function getLanguageStrings($language = 'en')
    {
        $translations = [
            'en' => [
                'invoice_title'        => 'INVOICE',
                'invoice_number'       => 'Invoice Number',
                'from_label'           => 'FROM',
                'bill_to_label'        => 'BILL TO',
                'product_label'        => 'Product',
                'quantity_label'       => 'Qty',
                'price_label'          => 'Price',
                'total_label'          => 'Total',
                'subtotal_label'       => 'Subtotal',
                'shipping_label'       => 'Shipping',
                'discount_label'       => 'Discount',
                'payment_info_label'   => 'Payment Information',
                'payment_method_label' => 'Payment Method',
                'payment_status_label' => 'Payment Status',
                'thank_you'            => 'ESC-ing the average life!',
            ],
            'ar' => [
                'invoice_title'        => 'فاتورة',
                'invoice_number'       => 'رقم الفاتورة',
                'from_label'           => 'من',
                'bill_to_label'        => 'إلى',
                'product_label'        => 'المنتج',
                'quantity_label'       => 'الكمية',
                'price_label'          => 'السعر',
                'total_label'          => 'الإجمالي',
                'subtotal_label'       => 'المجموع الجزئي',
                'shipping_label'       => 'الشحن',
                'discount_label'       => 'الخصم',
                'payment_info_label'   => 'معلومات الدفع',
                'payment_method_label' => 'طريقة الدفع',
                'payment_status_label' => 'حالة الدفع',
                'thank_you'            => 'شكراً لتعاملك معنا!',
            ],
        ];

        return $translations[$language] ?? $translations['en'];
    }

    /**
     * Get payment method translations
     *
     * @param string $language
     * @return array
     */
    private function getPaymentMethods($language = 'en')
    {
        if ($language === 'ar') {
            return [
                'cib_bank'         => 'بنك CIB',
                'cash_on_delivery' => 'الدفع عند الاستلام',
            ];
        }

        return [
            'cib_bank'         => 'CIB Bank',
            'cash_on_delivery' => 'Cash on Delivery',
        ];
    }

    /**
     * Send invoice PDF via email
     *
     * @param int    $orderId
     * @param string $language
     * @return bool
     */
    public function sendInvoicePdfEmail($orderId, $language = 'en')
    {
        try {
            $emailService = new EmailService();
            $pdfContent   = $this->generateInvoicePdf($orderId, $language);
            return $emailService->sendOrderInvoiceWithPdfAttachment($orderId, $pdfContent, $language);
        } catch (\Exception $e) {
            error_log('Failed to send invoice PDF email: ' . $e->getMessage());
            return false;
        }
    }
}
