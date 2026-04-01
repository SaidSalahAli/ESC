<?php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;
use App\Models\Order;
use App\Models\User;

/**
 * Email Service - Handles all email communications
 * Supports order confirmations, invoices, and status updates
 */
class EmailService
{
    private $mailer;
    private $config;

    public function __construct()
    {
        $this->mailer = new PHPMailer(true);
        $this->config = require __DIR__ . '/../config/config.php';
        $this->configureSMTP();
    }

    /**
     * Configure SMTP settings from config file
     */
    private function configureSMTP()
    {
        try {
            $mailConfig = $this->config['mail'] ?? [];

            $this->mailer->isSMTP();
            $this->mailer->Host = $mailConfig['host'] ?? 'smtp.gmail.com';
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $mailConfig['username'] ?? '';
            $this->mailer->Password = $mailConfig['password'] ?? '';
            $this->mailer->SMTPSecure = ($mailConfig['encryption'] ?? 'tls') === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
            $this->mailer->Port = $mailConfig['port'] ?? 587;

            $this->mailer->setFrom($mailConfig['from_address'] ?? 'noreply@escwear.com', $mailConfig['from_name'] ?? 'ESC Wear');
        } catch (\Exception $e) {
            error_log('SMTP Configuration Error: ' . $e->getMessage());
        }
    }

    /**
     * Send order confirmation email
     */
    public function sendOrderInvoice($orderId)
    {
        try {
            $orderModel = new Order();
            $userModel = new User();

            $order = $orderModel->find($orderId);
            if (!$order) {
                throw new \Exception('Order not found');
            }

            $user = $userModel->find($order['user_id']);
            if (!$user) {
                throw new \Exception('User not found');
            }

            $language = $user['preferred_language'] ?? 'en';

            $this->mailer->clearAllRecipients();
            $this->mailer->addAddress($user['email'], $user['first_name'] . ' ' . $user['last_name']);

            if ($language === 'ar') {
                $this->mailer->Subject = 'تم تأكيد طلبك من ESC!';
                $this->mailer->Body = $this->buildOrderConfirmationEmailAr($user, $order);
                $this->mailer->AltBody = 'شكراً لطلبك';
            } else {
                $this->mailer->Subject = 'Your ESC Order Is Confirmed!';
                $this->mailer->Body = $this->buildOrderConfirmationEmailEn($user, $order);
                $this->mailer->AltBody = 'Thank you for your order';
            }

            $this->mailer->isHTML(true);
            return $this->mailer->send();
        } catch (\Exception $e) {
            error_log('Failed to send order invoice email: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send order invoice with PDF attachment
     */
    public function sendOrderInvoiceWithPdfAttachment($orderId, $pdfContent, $language = 'en')
    {
        try {
            $orderModel = new Order();
            $userModel = new User();

            $order = $orderModel->find($orderId);
            if (!$order) {
                throw new \Exception('Order not found');
            }

            // Handle both registered users and guest orders
            $user = null;
            if ($order['is_guest']) {
                // For guest orders, use guest email and name
                $email = $order['guest_email'];
                $name = $order['guest_name'];
                // Create a fake user object for guest
                $user = (object)[
                    'first_name' => explode(' ', $name)[0],
                    'last_name' => implode(' ', array_slice(explode(' ', $name), 1)),
                    'email' => $email
                ];
            } else {
                // For registered users, fetch from database
                $user = $userModel->find($order['user_id']);
                if (!$user) {
                    throw new \Exception('User not found');
                }
                $email = $user['email'];
                $name = $user['first_name'] . ' ' . $user['last_name'];
            }

            $this->mailer->clearAllRecipients();
            $this->mailer->clearAttachments();
            $this->mailer->addAddress($email, $name);

            $strings = $this->getEmailLanguageStrings($language);
            $this->mailer->Subject = $strings['invoice_subject'] . ' #' . $order['order_number'];
            $this->mailer->isHTML(true);
            $this->mailer->Body = $this->generateInvoiceEmailWithLanguage($order, $user, $language);
            $this->mailer->AltBody = $strings['invoice_body_alt'] . ' #' . $order['order_number'];

            $filename = 'invoice_' . $order['order_number'] . '.pdf';
            $this->mailer->addStringAttachment($pdfContent, $filename, 'base64', 'application/pdf');

            return $this->mailer->send();
        } catch (MailException $e) {
            error_log('Mailer Error: ' . $e->getMessage());
            return false;
        } catch (\Exception $e) {
            error_log('Failed to send order invoice with PDF: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Generate invoice email HTML with language support
     */
    public function generateInvoiceEmailWithLanguage($order, $user, $language = 'en')
    {
        $strings = $this->getEmailLanguageStrings($language);
        $isArabic = $language === 'ar';
        $direction = $isArabic ? 'rtl' : 'ltr';
        $textAlign = $isArabic ? 'right' : 'left';

        $html = '<!DOCTYPE html>
<html lang="' . $language . '" dir="' . $direction . '">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>' . $strings['invoice_subject'] . '</title>
    <style>
        body { font-family: "Segoe UI", Arial, sans-serif; direction: ' . $direction . '; line-height: 1.6; color: #333; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px; }
        .email-body { background-color: white; padding: 30px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #2c3e50; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { color: #2c3e50; margin: 0; font-size: 24px; }
        .order-info { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: ' . $textAlign . '; }
        .order-info p { margin: 8px 0; font-size: 14px; }
        .order-info strong { color: #2c3e50; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table thead { background-color: #34495e; color: white; }
        table th { padding: 10px; text-align: ' . $textAlign . '; font-weight: 600; }
        table td { padding: 10px; border-bottom: 1px solid #ecf0f1; text-align: ' . $textAlign . '; }
        .totals-table { width: 50%; margin-left: auto; border-collapse: collapse; }
        .totals-table tr { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1; }
        .totals-table tr:last-child { border-top: 2px solid #2c3e50; font-weight: bold; font-size: 16px; color: #2c3e50; }
        .footer { text-align: center; font-size: 12px; color: #7f8c8d; border-top: 1px solid #ecf0f1; padding-top: 20px; }
        .cta-button { display: inline-block; background-color: #2c3e50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-body">
            <div class="header">
                <h1>' . $strings['greeting'] . '</h1>
                <p>' . $strings['invoice_sent'] . '</p>
            </div>
            <div class="order-info">
                <p><strong>' . $strings['order_number_label'] . ':</strong> ' . $order['order_number'] . '</p>
                <p><strong>' . $strings['order_date_label'] . ':</strong> ' . date('Y-m-d H:i', strtotime($order['created_at'])) . '</p>
                <p><strong>' . $strings['order_total_label'] . ':</strong> ' . number_format($order['total'], 2) . ' ' . $order['currency'] . '</p>
            </div>
            <p>' . $strings['invoice_details'] . '</p>
            <table>
                <thead>
                    <tr>
                        <th>' . $strings['product_label'] . '</th>
                        <th>' . $strings['quantity_label'] . '</th>
                        <th>' . $strings['price_label'] . '</th>
                        <th>' . $strings['total_label'] . '</th>
                    </tr>
                </thead>
                <tbody>';

        $items = $order['items'] ?? [];
        foreach ($items as $item) {
            $productName = $item['product_name'] ?? 'N/A';
            $variant = !empty($item['variant_name']) ? ' (' . $item['variant_name'] . ')' : '';
            $itemTotal = $item['quantity'] * $item['price'];
            $html .= '
                    <tr>
                        <td>' . $productName . $variant . '</td>
                        <td>' . $item['quantity'] . '</td>
                        <td>' . number_format($item['price'], 2) . ' ' . $order['currency'] . '</td>
                        <td>' . number_format($itemTotal, 2) . ' ' . $order['currency'] . '</td>
                    </tr>';
        }

        $html .= '
                </tbody>
            </table>
            <table class="totals-table">
                <tr>
                    <td>' . $strings['subtotal_label'] . ':</td>
                    <td>' . number_format($order['subtotal'], 2) . ' ' . $order['currency'] . '</td>
                </tr>';

        if ($order['shipping_cost'] > 0) {
            $html .= '
                <tr>
                    <td>' . $strings['shipping_label'] . ':</td>
                    <td>' . number_format($order['shipping_cost'], 2) . ' ' . $order['currency'] . '</td>
                </tr>';
        }

        if ($order['discount'] > 0) {
            $html .= '
                <tr>
                    <td>' . $strings['discount_label'] . ':</td>
                    <td>-' . number_format($order['discount'], 2) . ' ' . $order['currency'] . '</td>
                </tr>';
        }

        $html .= '
                <tr>
                    <td>' . $strings['total_label'] . ':</td>
                    <td>' . number_format($order['total'], 2) . ' ' . $order['currency'] . '</td>
                </tr>
            </table>
            <p>' . $strings['thank_you'] . '</p>
            <div class="footer">
                <p>' . $strings['need_help'] . '</p>
                <p>&copy; 2024 ESC Wear. ' . $strings['all_rights_reserved'] . '</p>
            </div>
        </div>
    </div>
</body>
</html>';

        return $html;
    }

    private function generateOrderEmailHtml($order, $user, $language = 'en')
    {
        return $this->generateInvoiceEmailWithLanguage($order, $user, $language);
    }

    /**
     * Send order status update email
     */
    public function sendOrderStatusUpdate($orderId, $newStatus, $language = null)
    {
        try {
            $orderModel = new Order();
            $userModel = new User();

            $order = $orderModel->find($orderId);
            if (!$order) {
                throw new \Exception('Order not found');
            }

            $user = $userModel->find($order['user_id']);
            if (!$user) {
                throw new \Exception('User not found');
            }

            if ($language === null) {
                $language = $user['preferred_language'] ?? 'en';
            }

            switch ($newStatus) {
                case 'processing':
                    return $this->sendOrderConfirmationEmail($orderId, $user, $order, $language);
                case 'shipped':
                    return $this->sendOrderShippedEmail($orderId, $user, $order, $language);
                case 'delivered':
                    return $this->sendOrderDeliveredEmail($orderId, $user, $order, $language);
                default:
                    return $this->sendGenericStatusUpdateEmail($orderId, $newStatus, $user, $order, $language);
            }
        } catch (\Exception $e) {
            error_log('Failed to send order status update: ' . $e->getMessage());
            return false;
        }
    }

    // =========================================================================
    // EMAIL 1 — Order Confirmation (Immediate)
    // =========================================================================

    private function sendOrderConfirmationEmail($orderId, $user, $order, $language = 'en')
    {
        try {
            $this->mailer->clearAllRecipients();
            $this->mailer->addAddress($user['email'], $user['first_name'] . ' ' . $user['last_name']);

            if ($language === 'ar') {
                $this->mailer->Subject = 'تم تأكيد طلبك من ESC!';
                $htmlBody = $this->buildOrderConfirmationEmailAr($user, $order);
            } else {
                $this->mailer->Subject = 'Your ESC Order Is Confirmed!';
                $htmlBody = $this->buildOrderConfirmationEmailEn($user, $order);
            }

            $this->mailer->isHTML(true);
            $this->mailer->Body = $htmlBody;
            $this->mailer->AltBody = $language === 'ar' ? 'شكراً لطلبك' : 'Thank you for your order';

            return $this->mailer->send();
        } catch (\Exception $e) {
            error_log('Failed to send order confirmation email: ' . $e->getMessage());
            return false;
        }
    }

    private function buildOrderConfirmationEmailAr($user, $order)
    {
        $shippingAddress = $this->getShippingAddress($order['id']);
        $addressLine = '';
        if ($shippingAddress) {
            $addressLine = $shippingAddress['first_name'] . ' ' . $shippingAddress['last_name'] . ', ' .
                $shippingAddress['address_line1'];
            if (!empty($shippingAddress['address_line2'])) {
                $addressLine .= ', ' . $shippingAddress['address_line2'];
            }
            $addressLine .= ', ' . $shippingAddress['city'] . ', ' . $shippingAddress['state'] . ' ' .
                $shippingAddress['postal_code'];
        }

        return '<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: rtl; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-body { background-color: white; padding: 30px; border-radius: 8px; line-height: 1.8; }
        .greeting { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .content { margin: 20px 0; color: #333; font-size: 16px; line-height: 1.8; }
        .section { margin: 25px 0; }
        .section-title { font-weight: bold; color: #333; margin-bottom: 15px; font-size: 16px; }
        .detail-item { margin: 8px 0; color: #555; }
        .community { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-right: 4px solid #e91e63; border-radius: 4px; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 14px; }
        .tagline { font-weight: bold; color: #e91e63; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-body">
            <div class="greeting">مرحبًا ' . htmlspecialchars($user['first_name']) . '،</div>
            <div class="content">شكرًا لاختيارك ESC Wear!</div>
            <div class="content">لقد تم استلام طلبك بنجاح، وفريقنا الآن يعمل بعناية لتحضيره خصيصًا لك. كل قطعة مصممة لتمنحك حرية الحركة مع الحفاظ على أصالتك — بدون أي تنازلات.</div>
            <div class="section">
                <div class="section-title">تفاصيل الطلب:</div>
                <div class="detail-item">• رقم الطلب: ' . htmlspecialchars($order['order_number']) . '</div>
                <div class="detail-item">• موعد التوصيل المتوقع: (2-3 أيام)</div>
                <div class="detail-item">• عنوان الشحن: ' . htmlspecialchars($addressLine) . '</div>
            </div>
            <div class="content">سنخطرك فور شحن طلبك.</div>
            <div class="community">💡 انضمي اليوم إلى مجتمع ESC وتواصلي مع نساء يتحركن بثقة: @esc.wear_&nbsp; @esc.community_</div>
            <div class="footer">
                <div>كل الحب،</div>
                <div style="margin-top: 10px;">فريق ESC Wear</div>
                <div class="tagline">ESC-ing the average life!</div>
            </div>
        </div>
    </div>
</body>
</html>';
    }

    private function buildOrderConfirmationEmailEn($user, $order)
    {
        $shippingAddress = $this->getShippingAddress($order['id']);
        $addressLine = '';
        if ($shippingAddress) {
            $addressLine = $shippingAddress['first_name'] . ' ' . $shippingAddress['last_name'] . ', ' .
                $shippingAddress['address_line1'];
            if (!empty($shippingAddress['address_line2'])) {
                $addressLine .= ', ' . $shippingAddress['address_line2'];
            }
            $addressLine .= ', ' . $shippingAddress['city'] . ', ' . $shippingAddress['state'] . ' ' .
                $shippingAddress['postal_code'];
        }

        return '<!DOCTYPE html>
<html dir="ltr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: ltr; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-body { background-color: white; padding: 30px; border-radius: 8px; line-height: 1.8; }
        .greeting { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .content { margin: 20px 0; color: #333; font-size: 16px; line-height: 1.8; }
        .section { margin: 25px 0; }
        .section-title { font-weight: bold; color: #333; margin-bottom: 15px; font-size: 16px; }
        .detail-item { margin: 8px 0; color: #555; }
        .community { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #e91e63; border-radius: 4px; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 14px; }
        .tagline { font-weight: bold; color: #e91e63; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-body">
            <div class="greeting">Hello ' . htmlspecialchars($user['first_name']) . ',</div>
            <div class="content">Thank you for choosing ESC Wear!</div>
            <div class="content">Your order has been successfully received, and our team is carefully preparing it just for you. Every piece is designed to help women move freely while staying true to themselves — no compromises.</div>
            <div class="section">
                <div class="section-title">Order Details:</div>
                <div class="detail-item">• Order Number: ' . htmlspecialchars($order['order_number']) . '</div>
                <div class="detail-item">• Estimated Delivery: (2-3 days)</div>
                <div class="detail-item">• Shipping Address: ' . htmlspecialchars($addressLine) . '</div>
            </div>
            <div class="content">We\'ll notify you once your order is on its way.</div>
            <div class="community">💡 Join our ESC community today and connect with women moving confidently: @esc.wear_ @esc.community_</div>
            <div class="footer">
                <div>With love,</div>
                <div style="margin-top: 10px;">ESC Wear Team</div>
                <div class="tagline">ESC-ing the average life!</div>
            </div>
        </div>
    </div>
</body>
</html>';
    }

    // =========================================================================
    // EMAIL 2 — Shipping Confirmation (When Shipped)
    // =========================================================================

    private function sendOrderShippedEmail($orderId, $user, $order, $language = 'en')
    {
        try {
            $this->mailer->clearAllRecipients();
            $this->mailer->addAddress($user['email'], $user['first_name'] . ' ' . $user['last_name']);

            $trackingNumber = $order['tracking_number'] ?? 'N/A';

            if ($language === 'ar') {
                $this->mailer->Subject = 'طلبك من ESC في الطريق إليك!';
                $htmlBody = $this->buildOrderShippedEmailAr($user, $order, $trackingNumber);
            } else {
                $this->mailer->Subject = 'Your ESC Order Is On Its Way!';
                $htmlBody = $this->buildOrderShippedEmailEn($user, $order, $trackingNumber);
            }

            $this->mailer->isHTML(true);
            $this->mailer->Body = $htmlBody;
            $this->mailer->AltBody = $language === 'ar' ? 'تم شحن طلبك' : 'Your order has been shipped';

            return $this->mailer->send();
        } catch (\Exception $e) {
            error_log('Failed to send order shipped email: ' . $e->getMessage());
            return false;
        }
    }

    private function buildOrderShippedEmailAr($user, $order, $trackingNumber)
    {
        return '<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: rtl; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-body { background-color: white; padding: 30px; border-radius: 8px; line-height: 1.8; }
        .greeting { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .content { margin: 20px 0; color: #333; font-size: 16px; line-height: 1.8; }
        .section { margin: 25px 0; }
        .detail-item { margin: 8px 0; color: #555; }
        .community { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-right: 4px solid #e91e63; border-radius: 4px; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 14px; }
        .tagline { font-weight: bold; color: #e91e63; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-body">
            <div class="greeting">مرحبًا ' . htmlspecialchars($user['first_name']) . '،</div>
            <div class="content">أخبار رائعة — لقد تم شحن طلبك من ESC وهو الآن في طريقه إليك!</div>
            <div class="section">
                <div class="detail-item">تابعي طلبك هنا: ' . htmlspecialchars($trackingNumber) . '</div>
                <div class="detail-item" style="margin-top: 15px;">موعد التوصيل المتوقع: (2-3 أيام)</div>
            </div>
            <div class="content">لا يمكننا الانتظار حتى تختبري تجربة ESC أثناء الحركة.</div>
            <div class="community">✨ أثناء الانتظار، استلهمي من مجتمع ESC — نساء حقيقيات، حركة حقيقية: @esc.wear_ @esc.community_</div>
            <div class="footer">
                <div>كل الحب،</div>
                <div style="margin-top: 10px;">فريق ESC Wear</div>
                <div class="tagline">ESC-ing the average life!</div>
            </div>
        </div>
    </div>
</body>
</html>';
    }

    private function buildOrderShippedEmailEn($user, $order, $trackingNumber)
    {
        return '<!DOCTYPE html>
<html dir="ltr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: ltr; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-body { background-color: white; padding: 30px; border-radius: 8px; line-height: 1.8; }
        .greeting { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .content { margin: 20px 0; color: #333; font-size: 16px; line-height: 1.8; }
        .section { margin: 25px 0; }
        .detail-item { margin: 8px 0; color: #555; }
        .community { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #e91e63; border-radius: 4px; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 14px; }
        .tagline { font-weight: bold; color: #e91e63; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-body">
            <div class="greeting">Hello ' . htmlspecialchars($user['first_name']) . ',</div>
            <div class="content">Exciting news — your ESC order has been shipped and is now on its way to you!</div>
            <div class="section">
                <div class="detail-item">Track your order here: ' . htmlspecialchars($trackingNumber) . '</div>
                <div class="detail-item" style="margin-top: 15px;">Estimated Delivery: (2-3 days)</div>
            </div>
            <div class="content">We can\'t wait for you to experience ESC in motion.</div>
            <div class="community">✨ While you wait, get inspired by our ESC community — real women, real movement: @esc.wear_ @esc.community_</div>
            <div class="footer">
                <div>With love,</div>
                <div style="margin-top: 10px;">ESC Wear Team</div>
                <div class="tagline">ESC-ing the average life!</div>
            </div>
        </div>
    </div>
</body>
</html>';
    }

    // =========================================================================
    // EMAIL 3 — Delivery Check-In (1 Day After Delivery)
    // =========================================================================

    private function sendOrderDeliveredEmail($orderId, $user, $order, $language = 'en')
    {
        try {
            $this->mailer->clearAllRecipients();
            $this->mailer->addAddress($user['email'], $user['first_name'] . ' ' . $user['last_name']);

            if ($language === 'ar') {
                $this->mailer->Subject = 'هل وصل طلبك من ESC بأمان؟';
                $htmlBody = $this->buildOrderDeliveredEmailAr($user, $order);
            } else {
                $this->mailer->Subject = 'Did Your ESC Order Arrive Safely?';
                $htmlBody = $this->buildOrderDeliveredEmailEn($user, $order);
            }

            $this->mailer->isHTML(true);
            $this->mailer->Body = $htmlBody;
            $this->mailer->AltBody = $language === 'ar' ? 'تم توصيل طلبك' : 'Your order has been delivered';

            return $this->mailer->send();
        } catch (\Exception $e) {
            error_log('Failed to send order delivered email: ' . $e->getMessage());
            return false;
        }
    }

    private function buildOrderDeliveredEmailAr($user, $order)
    {
        return '<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: rtl; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-body { background-color: white; padding: 30px; border-radius: 8px; line-height: 1.8; }
        .greeting { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .content { margin: 20px 0; color: #333; font-size: 16px; line-height: 1.8; }
        .community { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-right: 4px solid #e91e63; border-radius: 4px; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 14px; }
        .tagline { font-weight: bold; color: #e91e63; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-body">
            <div class="greeting">مرحبًا ' . htmlspecialchars($user['first_name']) . '،</div>
            <div class="content">لقد تم توصيل طلبك من ESC، ونتمنى أنه وصل إليك بأمان!</div>
            <div class="content">كيف كان شعورك مع القطع حتى الآن؟ تجربتك مهمة جدًا بالنسبة لنا، لأن ESC صُممت للنساء اللواتي يردن ملابس رياضية تدعمنهن حقًا أثناء الحركة.</div>
            <div class="content">إذا كان هناك أي شيء غير مناسب — المقاس، الملاءمة، أو أي مسألة أخرى — فقط ردي على هذا البريد وسنقوم بحلها فورًا.</div>
            <div class="community">💡 شاركي أول إطلالة لكِ وتابعي مجتمع ESC الملهم: @esc.wear_ @esc.community_</div>
            <div class="footer">
                <div>كل الحب،</div>
                <div style="margin-top: 10px;">فريق ESC Wear</div>
                <div class="tagline">ESC-ing the average life!</div>
            </div>
        </div>
    </div>
</body>
</html>';
    }

    private function buildOrderDeliveredEmailEn($user, $order)
    {
        return '<!DOCTYPE html>
<html dir="ltr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: ltr; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-body { background-color: white; padding: 30px; border-radius: 8px; line-height: 1.8; }
        .greeting { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .content { margin: 20px 0; color: #333; font-size: 16px; line-height: 1.8; }
        .community { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #e91e63; border-radius: 4px; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 14px; }
        .tagline { font-weight: bold; color: #e91e63; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-body">
            <div class="greeting">Hello ' . htmlspecialchars($user['first_name']) . ',</div>
            <div class="content">Your ESC order has been delivered, and we hope it reached you safely!</div>
            <div class="content">How does it feel so far? Your experience matters deeply because ESC was created for women who want sportswear that truly supports them.</div>
            <div class="content">If anything isn\'t right — sizing, fit, or anything else — reply to this email and we\'ll fix it immediately.</div>
            <div class="community">💡 Share your first look and follow our inspiring ESC community: @esc.wear_ @esc.community_</div>
            <div class="footer">
                <div>With Love,</div>
                <div style="margin-top: 10px;">ESC Wear Team</div>
                <div class="tagline">ESC-ing the average life!</div>
            </div>
        </div>
    </div>
</body>
</html>';
    }

    /**
     * Send generic status update email
     */
    private function sendGenericStatusUpdateEmail($orderId, $newStatus, $user, $order, $language = 'en')
    {
        try {
            $this->mailer->clearAllRecipients();
            $this->mailer->addAddress($user['email'], $user['first_name'] . ' ' . $user['last_name']);

            $strings = $this->getEmailLanguageStrings($language);
            $statusMessages = $this->getStatusMessages($language);

            $this->mailer->Subject = $strings['status_update_subject'] . ' #' . $order['order_number'];
            $this->mailer->isHTML(true);

            $isArabic = $language === 'ar';
            $direction = $isArabic ? 'rtl' : 'ltr';
            $statusMessage = $statusMessages[$newStatus] ?? ucfirst($newStatus);

            $htmlBody = '<!DOCTYPE html>
<html dir="' . $direction . '">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: ' . $direction . '; }
        .container { max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px; }
        .body { background-color: white; padding: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="body">
            <h2>' . $strings['status_update_subject'] . '</h2>
            <p>' . $strings['order_number_label'] . ': ' . $order['order_number'] . '</p>
            <p>' . $strings['new_status_label'] . ': <strong>' . $statusMessage . '</strong></p>
            <p>' . $strings['thank_you'] . '</p>
        </div>
    </div>
</body>
</html>';

            $this->mailer->Body = $htmlBody;
            $this->mailer->AltBody = $statusMessage;

            return $this->mailer->send();
        } catch (\Exception $e) {
            error_log('Failed to send generic order status update: ' . $e->getMessage());
            return false;
        }
    }

    private function generateStatusEmailTemplate($isArabic, $data)
    {
        return '';
    }

    // =========================================================================
    // EMAIL 4 — Review & Feedback (3–4 Days After Delivery)
    // =========================================================================

    public function sendReviewRequestEmail($orderId, $language = null)
    {
        try {
            $orderModel = new Order();
            $userModel = new User();

            $order = $orderModel->find($orderId);
            if (!$order) {
                throw new \Exception('Order not found');
            }

            $user = $userModel->find($order['user_id']);
            if (!$user) {
                throw new \Exception('User not found');
            }

            if ($language === null) {
                $language = $user['preferred_language'] ?? 'en';
            }

            $this->mailer->clearAllRecipients();
            $this->mailer->addAddress($user['email'], $user['first_name'] . ' ' . $user['last_name']);

            if ($language === 'ar') {
                $this->mailer->Subject = 'كيف كانت تجربة الحركة مع ESC؟';
                $htmlBody = $this->buildReviewRequestEmailAr($user, $order);
            } else {
                $this->mailer->Subject = 'How Did ESC Move With You?';
                $htmlBody = $this->buildReviewRequestEmailEn($user, $order);
            }

            $this->mailer->isHTML(true);
            $this->mailer->Body = $htmlBody;
            $this->mailer->AltBody = $language === 'ar' ? 'نود سماع رأيك' : 'We would love to hear your feedback';

            return $this->mailer->send();
        } catch (\Exception $e) {
            error_log('Failed to send review request email: ' . $e->getMessage());
            return false;
        }
    }

    private function buildReviewRequestEmailAr($user, $order)
    {
        return '<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: rtl; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-body { background-color: white; padding: 30px; border-radius: 8px; line-height: 1.8; }
        .greeting { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .content { margin: 20px 0; color: #333; font-size: 16px; line-height: 1.8; }
        .bullet-list { margin: 20px 0; padding-right: 20px; }
        .bullet-list li { margin: 10px 0; color: #555; }
        .cta-button { display: inline-block; background-color: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .community { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-right: 4px solid #e91e63; border-radius: 4px; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 14px; }
        .tagline { font-weight: bold; color: #e91e63; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-body">
            <div class="greeting">مرحبًا ' . htmlspecialchars($user['first_name']) . '،</div>
            <div class="content">لقد حصلتِ الآن على فرصة لارتداء قطع ESC الخاصة بكِ، ونسعد جدًا بسماع رأيك:</div>
            <ul class="bullet-list">
                <li>كيف شعرتِ أثناء الحركة؟</li>
                <li>هل كان المقاس مريحًا؟</li>
                <li>هل لبّت توقعاتك؟</li>
            </ul>
            <div class="content">ملاحظاتك تساعدنا على تصميم قطع أفضل للنساء مثلك.</div>
            <a href="' . htmlspecialchars($this->config['app_url'] ?? 'https://escwear.com') . '/orders/' . $order['id'] . '/review" class="cta-button">قدمي تقييمًا سريعًا</a>
            <div class="community">✨ اكتشفي كيف تتحرك نساء أخريات مع ESC وانضمي إلى المجتمع: @esc.wear_ @esc.community_</div>
            <div class="content">شكرًا لكونك جزءًا من ESC!</div>
            <div class="footer">
                <div>كل الحب،</div>
                <div style="margin-top: 10px;">فريق ESC Wear</div>
                <div class="tagline">ESC-ing the average life!</div>
            </div>
        </div>
    </div>
</body>
</html>';
    }

    private function buildReviewRequestEmailEn($user, $order)
    {
        return '<!DOCTYPE html>
<html dir="ltr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: ltr; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-body { background-color: white; padding: 30px; border-radius: 8px; line-height: 1.8; }
        .greeting { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .content { margin: 20px 0; color: #333; font-size: 16px; line-height: 1.8; }
        .bullet-list { margin: 20px 0; padding-left: 20px; }
        .bullet-list li { margin: 10px 0; color: #555; }
        .cta-button { display: inline-block; background-color: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .community { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #e91e63; border-radius: 4px; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 14px; }
        .tagline { font-weight: bold; color: #e91e63; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-body">
            <div class="greeting">Hello ' . htmlspecialchars($user['first_name']) . ',</div>
            <div class="content">By now, you\'ve had the chance to wear your ESC pieces. We\'d love to hear your thoughts:</div>
            <ul class="bullet-list">
                <li>How did it feel while moving?</li>
                <li>Was the fit comfortable?</li>
                <li>Did it meet your expectations?</li>
            </ul>
            <div class="content">Your feedback helps us create better pieces for women like you.</div>
            <a href="' . htmlspecialchars($this->config['app_url'] ?? 'https://escwear.com') . '/orders/' . $order['id'] . '/review" class="cta-button">Leave a quick review here</a>
            <div class="community">✨ See how other women move with ESC and join the community: @esc.wear_ @esc.community_</div>
            <div class="content">Thank you for being part of ESC!</div>
            <div class="footer">
                <div>With Love,</div>
                <div style="margin-top: 10px;">ESC Wear Team</div>
                <div class="tagline">ESC-ing the average life!</div>
            </div>
        </div>
    </div>
</body>
</html>';
    }

    // =========================================================================
    // EMAIL 5 — Community Engagement (7–10 Days After Delivery)
    // =========================================================================

    public function sendCommunityEngagementEmail($orderId, $language = null)
    {
        try {
            $orderModel = new Order();
            $userModel = new User();

            $order = $orderModel->find($orderId);
            if (!$order) {
                throw new \Exception('Order not found');
            }

            $user = $userModel->find($order['user_id']);
            if (!$user) {
                throw new \Exception('User not found');
            }

            if ($language === null) {
                $language = $user['preferred_language'] ?? 'en';
            }

            $this->mailer->clearAllRecipients();
            $this->mailer->addAddress($user['email'], $user['first_name'] . ' ' . $user['last_name']);

            if ($language === 'ar') {
                $this->mailer->Subject = 'نود أن نراكِ في ESC!';
                $htmlBody = $this->buildCommunityEngagementEmailAr($user, $order);
            } else {
                $this->mailer->Subject = 'We\'d Love to See You in ESC';
                $htmlBody = $this->buildCommunityEngagementEmailEn($user, $order);
            }

            $this->mailer->isHTML(true);
            $this->mailer->Body = $htmlBody;
            $this->mailer->AltBody = $language === 'ar' ? 'شاركي صورتك معنا' : 'Share your ESC moment with us';

            return $this->mailer->send();
        } catch (\Exception $e) {
            error_log('Failed to send community engagement email: ' . $e->getMessage());
            return false;
        }
    }

    private function buildCommunityEngagementEmailAr($user, $order)
    {
        return '<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: rtl; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-body { background-color: white; padding: 30px; border-radius: 8px; line-height: 1.8; }
        .greeting { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .content { margin: 20px 0; color: #333; font-size: 16px; line-height: 1.8; }
        .highlight { color: #e91e63; font-weight: bold; }
        .community { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-right: 4px solid #e91e63; border-radius: 4px; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 14px; }
        .tagline { font-weight: bold; color: #e91e63; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-body">
            <div class="greeting">مرحبًا ' . htmlspecialchars($user['first_name']) . '،</div>
            <div class="content">تم إنشاء ESC للنساء الحقيقيات والحركة الحقيقية.</div>
            <div class="content">إذا كنتِ تستمتعين بقطعك، فنحن نود أن نرى كيف ترتدينها!</div>
            <div class="content">شاركِي صورة أو فيديو وقومي بوضع علامة على <span class="highlight">@esc.wear_</span> و <span class="highlight">@esc.community_</span> — قد تلهم قصتك امرأة أخرى لتتحرك بثقة وحرية.</div>
            <div class="community">✨ انضمي إلى مجتمع ESC المتنامي وتواصلي مع نساء مثلك!</div>
            <div class="footer">
                <div>كل الحب،</div>
                <div style="margin-top: 10px;">فريق ESC Wear</div>
                <div class="tagline">ESC-ing the average life!</div>
            </div>
        </div>
    </div>
</body>
</html>';
    }

    private function buildCommunityEngagementEmailEn($user, $order)
    {
        return '<!DOCTYPE html>
<html dir="ltr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: ltr; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-body { background-color: white; padding: 30px; border-radius: 8px; line-height: 1.8; }
        .greeting { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .content { margin: 20px 0; color: #333; font-size: 16px; line-height: 1.8; }
        .highlight { color: #e91e63; font-weight: bold; }
        .community { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #e91e63; border-radius: 4px; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 14px; }
        .tagline { font-weight: bold; color: #e91e63; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-body">
            <div class="greeting">Hello ' . htmlspecialchars($user['first_name']) . ',</div>
            <div class="content">ESC was built for real women and real movement.</div>
            <div class="content">If you\'ve been enjoying your pieces, we\'d love to see how you wear them!</div>
            <div class="content">Share a photo or video and tag <span class="highlight">@esc.wear_</span> and <span class="highlight">@esc.community_</span> — your story could inspire another woman to move freely with confidence.</div>
            <div class="community">✨ Join our growing ESC community and connect with women just like you!</div>
            <div class="footer">
                <div>With love,</div>
                <div style="margin-top: 10px;">ESC Wear Team</div>
                <div class="tagline">ESC-ing the average life!</div>
            </div>
        </div>
    </div>
</body>
</html>';
    }

    // =========================================================================
    // EMAIL 6 — Loyalty / Repeat Purchase (12–14 Days After Delivery)
    // =========================================================================

    public function sendLoyaltyEmail($orderId, $loyaltyCode = 'ESC10', $language = null)
    {
        try {
            $orderModel = new Order();
            $userModel = new User();

            $order = $orderModel->find($orderId);
            if (!$order) {
                throw new \Exception('Order not found');
            }

            $user = $userModel->find($order['user_id']);
            if (!$user) {
                throw new \Exception('User not found');
            }

            if ($language === null) {
                $language = $user['preferred_language'] ?? 'en';
            }

            $this->mailer->clearAllRecipients();
            $this->mailer->addAddress($user['email'], $user['first_name'] . ' ' . $user['last_name']);

            if ($language === 'ar') {
                $this->mailer->Subject = 'جاهزة لمجموعة ESC التالية؟';
                $htmlBody = $this->buildLoyaltyEmailAr($user, $order, $loyaltyCode);
            } else {
                $this->mailer->Subject = 'Ready for Your Next ESC Set?';
                $htmlBody = $this->buildLoyaltyEmailEn($user, $order, $loyaltyCode);
            }

            $this->mailer->isHTML(true);
            $this->mailer->Body = $htmlBody;
            $this->mailer->AltBody = $language === 'ar' ? 'احصلي على خصم 10% على طلبك القادم' : 'Get 10% off your next order';

            return $this->mailer->send();
        } catch (\Exception $e) {
            error_log('Failed to send loyalty email: ' . $e->getMessage());
            return false;
        }
    }

    private function buildLoyaltyEmailAr($user, $order, $loyaltyCode)
    {
        return '<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: rtl; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-body { background-color: white; padding: 30px; border-radius: 8px; line-height: 1.8; }
        .greeting { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .content { margin: 20px 0; color: #333; font-size: 16px; line-height: 1.8; }
        .bullet-list { margin: 20px 0; padding-right: 20px; }
        .bullet-list li { margin: 10px 0; color: #555; }
        .code-box { background-color: #f9f9f9; border: 2px solid #e91e63; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
        .code { font-size: 24px; font-weight: bold; color: #e91e63; font-family: monospace; }
        .code-desc { color: #666; font-size: 14px; margin-top: 10px; }
        .cta-button { display: inline-block; background-color: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .community { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-right: 4px solid #e91e63; border-radius: 4px; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 14px; }
        .tagline { font-weight: bold; color: #e91e63; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-body">
            <div class="greeting">مرحبًا ' . htmlspecialchars($user['first_name']) . '،</div>
            <div class="content">حتى الآن، قد شعرتِ بالفعل بتجربة ESC أثناء الحركة. كل قطعة مصممة لتتحرك معك — براحة وثقة وبدون أي تنازلات.</div>
            <div class="content">الكثير من النساء يحببن تنسيق قطع ESC معًا لإنشاء مجموعة كاملة:</div>
            <ul class="bullet-list">
                <li>تيشيرت ضاغط + ليغينغ</li>
                <li>تيشيرت ضاغط + بنطلون فلير</li>
                <li>مجموعة متكاملة بالكامل</li>
            </ul>
            <div class="content">ككوبون شكر، إليكِ كود ولاء 10% لطلبك القادم:</div>
            <div class="code-box">
                <div class="code">' . htmlspecialchars($loyaltyCode) . '</div>
                <div class="code-desc">استخدميه في أي وقت</div>
            </div>
            <a href="' . htmlspecialchars($this->config['app_url'] ?? 'https://escwear.com') . '/shop" class="cta-button">تسوقي الآن</a>
            <div class="community">✨ أكملي مجموعتك وانضمي إلى مجتمع ESC من النساء الواثقات والمتحركات بحرية: @esc.wear_ @esc.community_</div>
            <div class="footer">
                <div>كل الحب،</div>
                <div style="margin-top: 10px;">فريق ESC Wear</div>
                <div class="tagline">ESC-ing the average life!</div>
            </div>
        </div>
    </div>
</body>
</html>';
    }

    private function buildLoyaltyEmailEn($user, $order, $loyaltyCode)
    {
        return '<!DOCTYPE html>
<html dir="ltr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: ltr; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-body { background-color: white; padding: 30px; border-radius: 8px; line-height: 1.8; }
        .greeting { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .content { margin: 20px 0; color: #333; font-size: 16px; line-height: 1.8; }
        .bullet-list { margin: 20px 0; padding-left: 20px; }
        .bullet-list li { margin: 10px 0; color: #555; }
        .code-box { background-color: #f9f9f9; border: 2px solid #e91e63; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
        .code { font-size: 24px; font-weight: bold; color: #e91e63; font-family: monospace; }
        .code-desc { color: #666; font-size: 14px; margin-top: 10px; }
        .cta-button { display: inline-block; background-color: #e91e63; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .community { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #e91e63; border-radius: 4px; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 14px; }
        .tagline { font-weight: bold; color: #e91e63; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-body">
            <div class="greeting">Hello ' . htmlspecialchars($user['first_name']) . ',</div>
            <div class="content">By now, you\'ve experienced what ESC feels like in motion. Every piece is designed to move with you — comfortably, confidently, and without compromise.</div>
            <div class="content">Many women love pairing ESC pieces together to create a full set:</div>
            <ul class="bullet-list">
                <li>Compression T-Shirt + Leggings</li>
                <li>Compression T-Shirt + Flare Pants</li>
                <li>Full Matching Set</li>
            </ul>
            <div class="content">As a thank you, here\'s a 10% loyalty code for your next order:</div>
            <div class="code-box">
                <div class="code">' . htmlspecialchars($loyaltyCode) . '</div>
                <div class="code-desc">Use it anytime</div>
            </div>
            <a href="' . htmlspecialchars($this->config['app_url'] ?? 'https://escwear.com') . '/shop" class="cta-button">Shop Now</a>
            <div class="community">✨ Complete your set and join our ESC community of confident movers: @esc.wear_ @esc.community_</div>
            <div class="footer">
                <div>With love,</div>
                <div style="margin-top: 10px;">ESC Wear Team</div>
                <div class="tagline">ESC-ing the average life!</div>
            </div>
        </div>
    </div>
</body>
</html>';
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    private function getShippingAddress($orderId)
    {
        try {
            $orderModel = new Order();
            $order = $orderModel->find($orderId);
            if (!$order) {
                return null;
            }
            if (!empty($order['shipping_address'])) {
                return $order['shipping_address'];
            }
            return null;
        } catch (\Exception $e) {
            error_log('Failed to get shipping address: ' . $e->getMessage());
            return null;
        }
    }

    public function sendEmail($to, $subject, $body)
    {
        try {
            $this->mailer->clearAllRecipients();
            $this->mailer->addAddress($to);
            $this->mailer->Subject = $subject;
            $this->mailer->Body = $body;
            $this->mailer->isHTML(true);
            return $this->mailer->send();
        } catch (\Exception $e) {
            error_log('Failed to send email: ' . $e->getMessage());
            return false;
        }
    }

    public function generateOrderViewToken($orderId, $userEmail, $ttl = 604800)
    {
        $payload = $orderId . '|' . $userEmail . '|' . (time() + $ttl);
        $secret = $this->config['app_key'] ?? 'default-secret-key';
        return hash_hmac('sha256', $payload, $secret);
    }

    private function getEmailLanguageStrings($language = 'en')
    {
        $translations = [
            'en' => [
                'greeting'              => 'Thank You for Your Order!',
                'invoice_sent'          => 'Your invoice has been attached to this email',
                'invoice_subject'       => 'Order Invoice',
                'invoice_body_alt'      => 'Your order invoice',
                'invoice_details'       => 'Here are the details of your order:',
                'order_number_label'    => 'Order Number',
                'order_date_label'      => 'Order Date',
                'order_total_label'     => 'Order Total',
                'product_label'         => 'Product',
                'quantity_label'        => 'Quantity',
                'price_label'           => 'Price',
                'total_label'           => 'Total',
                'subtotal_label'        => 'Subtotal',
                'shipping_label'        => 'Shipping',
                'discount_label'        => 'Discount',
                'thank_you'             => 'ESC-ing the average life!',
                'need_help'             => 'Need help? Contact us anytime.',
                'all_rights_reserved'   => 'All rights reserved.',
                'status_update_subject' => 'Order Status Update',
                'new_status_label'      => 'New Status',
            ],
            'ar' => [
                'greeting'              => 'شكراً لطلبك!',
                'invoice_sent'          => 'تم إرسال فاتورتك مع هذا البريد الإلكتروني',
                'invoice_subject'       => 'فاتورة الطلب',
                'invoice_body_alt'      => 'فاتورة طلبك',
                'invoice_details'       => 'فيما يلي تفاصيل طلبك:',
                'order_number_label'    => 'رقم الطلب',
                'order_date_label'      => 'تاريخ الطلب',
                'order_total_label'     => 'إجمالي الطلب',
                'product_label'         => 'المنتج',
                'quantity_label'        => 'الكمية',
                'price_label'           => 'السعر',
                'total_label'           => 'الإجمالي',
                'subtotal_label'        => 'المجموع الجزئي',
                'shipping_label'        => 'الشحن',
                'discount_label'        => 'الخصم',
                'thank_you'             => 'شكراً لتعاملك معنا!',
                'need_help'             => 'هل تحتاج إلى مساعدة؟ اتصل بنا في أي وقت.',
                'all_rights_reserved'   => 'جميع الحقوق محفوظة.',
                'status_update_subject' => 'تحديث حالة الطلب',
                'new_status_label'      => 'الحالة الجديدة',
            ],
        ];

        return $translations[$language] ?? $translations['en'];
    }

    private function getStatusMessages($language = 'en')
    {
        if ($language === 'ar') {
            return [
                'pending'    => 'قيد الانتظار',
                'processing' => 'قيد المعالجة',
                'shipped'    => 'تم الشحن',
                'delivered'  => 'تم التسليم',
                'cancelled'  => 'تم الإلغاء',
                'refunded'   => 'تم استرجاع المبلغ',
            ];
        }

        return [
            'pending'    => 'Pending',
            'processing' => 'Processing',
            'shipped'    => 'Shipped',
            'delivered'  => 'Delivered',
            'cancelled'  => 'Cancelled',
            'refunded'   => 'Refunded',
        ];
    }
}
