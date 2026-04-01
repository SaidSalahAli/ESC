<?php

/**
 * API Routes
 * All routes are prefixed with /api
 */

use App\Middleware\AuthMiddleware;
use App\Middleware\AdminMiddleware;
use App\Middleware\RateLimitMiddleware;
use App\Controllers\AuthController;
use App\Controllers\ProductController;
use App\Controllers\CartController;
use App\Controllers\OrderController;
use App\Controllers\GuestCheckoutController;
use App\Controllers\PaymentController;
use App\Controllers\AdminController;
use App\Controllers\HealthController;
use App\Controllers\SeoController;
use App\Controllers\ContactController;
use App\Controllers\OrderReturnController;
use App\Controllers\NotificationController;
use App\Controllers\NewsletterController;

// ============================================
// Public Routes (No Authentication Required)
// ============================================

// SEO
$router->get('/sitemap.xml', SeoController::class, 'sitemap');

// Authentication
$router->post('/auth/register', AuthController::class, 'register');
$router->post('/auth/login', AuthController::class, 'login');
$router->post('/auth/google', AuthController::class, 'googleAuth');
$router->post('/auth/refresh', AuthController::class, 'refresh');
$router->get('/auth/csrf-token', AuthController::class, 'getCsrfToken');

// Products
$router->get('/products', ProductController::class, 'index');
$router->get('/products/featured', ProductController::class, 'featured');
$router->get('/products/top-selling', ProductController::class, 'topSelling');
$router->get('/products/categories', ProductController::class, 'categories');
$router->get('/products/slug/{slug}', ProductController::class, 'show');
$router->get('/products/barcode/{barcode}', ProductController::class, 'findByBarcode');
$router->get('/products/{id}', ProductController::class, 'showById');
$router->get('/products/category/{categorySlug}', ProductController::class, 'byCategory');
$router->get('/products/reviews/recent', ProductController::class, 'recentReviews');
$router->get('/products/{productId}/related', ProductController::class, 'related');
$router->get('/products/{productId}/reviews', ProductController::class, 'reviews');
$router->get('/products/{productId}/stock', ProductController::class, 'checkStock');

// Contact (Public)
$router->post('/contact', ContactController::class, 'submit');

// Newsletter (Public) - No verification, just collect emails
$router->post('/newsletter/subscribe', NewsletterController::class, 'subscribe');
$router->post('/newsletter/unsubscribe', NewsletterController::class, 'unsubscribe');

// Settings
$router->get('/settings', AdminController::class, 'getAllSettings');
$router->get('/settings/shipping-cost', AdminController::class, 'getShippingCost');

// ============================================
// Protected Routes (Authentication Required)
// ============================================

// User Profile
$router->get('/auth/me', AuthController::class, 'me', [AuthMiddleware::class]);
$router->put('/auth/profile', AuthController::class, 'updateProfile', [AuthMiddleware::class]);
$router->post('/auth/change-password', AuthController::class, 'changePassword', [AuthMiddleware::class]);
$router->post('/auth/logout', AuthController::class, 'logout', [AuthMiddleware::class]);
$router->put('/auth/language', AuthController::class, 'updateLanguage', [AuthMiddleware::class]); // ✅ sync user language

// Shopping Cart
$router->get('/cart', CartController::class, 'index', [AuthMiddleware::class]);
$router->post('/cart', CartController::class, 'add', [AuthMiddleware::class]);
$router->put('/cart/{cartId}', CartController::class, 'update', [AuthMiddleware::class]);
$router->delete('/cart/{cartId}', CartController::class, 'remove', [AuthMiddleware::class]);
$router->delete('/cart/clear/all', CartController::class, 'clear', [AuthMiddleware::class]);
$router->get('/cart/count', CartController::class, 'count', [AuthMiddleware::class]);
$router->get('/cart/validate', CartController::class, 'validate', [AuthMiddleware::class]);

// Orders
$router->get('/orders', OrderController::class, 'index', [AuthMiddleware::class]);
$router->post('/orders', OrderController::class, 'create', [AuthMiddleware::class]);
$router->get('/orders/{orderId}', OrderController::class, 'show', [AuthMiddleware::class]);
$router->post('/orders/{orderId}/cancel', OrderController::class, 'cancel', [AuthMiddleware::class]);
$router->get('/orders/track/{orderNumber}', OrderController::class, 'track', [AuthMiddleware::class]);
$router->post('/orders/scan-barcode', OrderController::class, 'scanBarcode', [AuthMiddleware::class]);
$router->post('/admin/orders/{orderId}/return-to-stock', OrderController::class, 'returnItemToStock', [AdminMiddleware::class]);

// ✅ Invoice PDF - protected so AuthMiddleware fills $request->user_id
$router->get('/orders/{orderId}/invoice-pdf', OrderController::class, 'getInvoicePdf', [AuthMiddleware::class]);

// Order Returns
$router->post('/orders/{orderId}/returns', OrderReturnController::class, 'create', [AuthMiddleware::class]);
$router->get('/orders/{orderId}/returns', OrderReturnController::class, 'getOrderReturns', [AuthMiddleware::class]);
$router->post('/returns/{returnId}/scan', OrderReturnController::class, 'scanBarcode', [AuthMiddleware::class]);
$router->post('/admin/returns/{returnId}/approve', OrderReturnController::class, 'approve', [AdminMiddleware::class]);

// Reviews
$router->post('/products/{productId}/reviews', ProductController::class, 'addReview', [AuthMiddleware::class]);

// Payment
$router->post('/payment/initialize/{orderId}', PaymentController::class, 'initialize', [AuthMiddleware::class]);
$router->post('/payment/process', PaymentController::class, 'process', [AuthMiddleware::class]);
$router->get('/payment/status/{orderId}', PaymentController::class, 'status', [AuthMiddleware::class]);

// Payment Callbacks (No auth - called by payment gateway)
$router->get('/payment/callback', PaymentController::class, 'callback');
$router->post('/payment/callback', PaymentController::class, 'callback');
$router->get('/payment/cancel', PaymentController::class, 'cancel');

// ============================================
// Admin Routes (Admin Authentication Required)
// ============================================

// Dashboard
$router->get('/admin/dashboard', AdminController::class, 'dashboard', [AdminMiddleware::class]);
$router->get('/admin/sales-report', AdminController::class, 'salesReport', [AdminMiddleware::class]);

// Customer Management
$router->get('/admin/customers', AdminController::class, 'customers', [AdminMiddleware::class]);

// Order Management
$router->get('/admin/orders', AdminController::class, 'orders', [AdminMiddleware::class]);
$router->get('/admin/orders/{orderId}', AdminController::class, 'getOrderDetails', [AdminMiddleware::class]);
$router->put('/admin/orders/{orderId}/status', AdminController::class, 'updateOrderStatus', [AdminMiddleware::class]);
$router->post('/admin/orders/{orderId}/scan', AdminController::class, 'scanBarcode', [AdminMiddleware::class]);
$router->get('/admin/orders/{orderId}/fulfillment', AdminController::class, 'getFulfillmentStatus', [AdminMiddleware::class]);

// Product Management
$router->get('/admin/products', AdminController::class, 'products', [AdminMiddleware::class]);
$router->post('/admin/products', AdminController::class, 'createProduct', [AdminMiddleware::class]);
$router->post('/admin/products/{productId}/update', AdminController::class, 'updateProduct', [AdminMiddleware::class]);
$router->put('/admin/products/{productId}', AdminController::class, 'updateProduct', [AdminMiddleware::class]);
$router->delete('/admin/products/{productId}', AdminController::class, 'deleteProduct', [AdminMiddleware::class]);

// Product Variants Management
$router->get('/admin/products/{productId}/variants', AdminController::class, 'getProductVariants', [AdminMiddleware::class]);
$router->post('/admin/products/{productId}/variants', AdminController::class, 'addProductVariant', [AdminMiddleware::class]);
$router->delete('/admin/products/{productId}/variants/{variantId}', AdminController::class, 'deleteProductVariant', [AdminMiddleware::class]);

// Product Images Management
$router->get('/admin/products/{productId}/images', AdminController::class, 'getProductImages', [AdminMiddleware::class]);
$router->delete('/admin/products/{productId}/images/{imageId}', AdminController::class, 'deleteProductImage', [AdminMiddleware::class]);

// Category Management
$router->get('/admin/categories', AdminController::class, 'categories', [AdminMiddleware::class]);
$router->get('/admin/categories/list', AdminController::class, 'categoriesList', [AdminMiddleware::class]);
$router->post('/admin/categories', AdminController::class, 'createCategory', [AdminMiddleware::class]);
$router->put('/admin/categories/{categoryId}', AdminController::class, 'updateCategory', [AdminMiddleware::class]);
$router->delete('/admin/categories/{categoryId}', AdminController::class, 'deleteCategory', [AdminMiddleware::class]);

// Review Management
$router->get('/admin/reviews/pending', AdminController::class, 'pendingReviews', [AdminMiddleware::class]);
$router->post('/admin/reviews/{reviewId}/approve', AdminController::class, 'approveReview', [AdminMiddleware::class]);
$router->post('/admin/reviews/{reviewId}/reject', AdminController::class, 'rejectReview', [AdminMiddleware::class]);

// Settings Management
$router->put('/admin/settings/shipping-cost', AdminController::class, 'updateShippingCost');

// Shipping Governorates Management
$router->get('/admin/shipping-governorates', AdminController::class, 'getAllShippingGovernorates', [AdminMiddleware::class]);
$router->post('/admin/shipping-governorates', AdminController::class, 'createShippingGovernorate', [AdminMiddleware::class]);
$router->put('/admin/shipping-governorates/{id}', AdminController::class, 'updateShippingGovernorate', [AdminMiddleware::class]);
$router->delete('/admin/shipping-governorates/{id}', AdminController::class, 'deleteShippingGovernorate', [AdminMiddleware::class]);
$router->post('/admin/shipping-governorates/{id}/toggle', AdminController::class, 'toggleShippingGovernorate', [AdminMiddleware::class]);

// Public Shipping Governorates (for checkout dropdown)
$router->get('/shipping-governorates', AdminController::class, 'getShippingGovernorates');

// ============================================
// Guest Checkout (No Authentication Required)
// ============================================
$router->post('/guest-checkout', GuestCheckoutController::class, 'createGuestOrder');
$router->get('/guest-checkout/orders/{orderNumber}', GuestCheckoutController::class, 'getGuestOrder');

// Payment Management
$router->post('/admin/payment/{orderId}/refund', PaymentController::class, 'refund', [AdminMiddleware::class]);

// Contact Messages Management (Admin)
$router->get('/admin/contact', ContactController::class, 'getAll', [AdminMiddleware::class]);
$router->get('/admin/contact/{id}', ContactController::class, 'getById', [AdminMiddleware::class]);
$router->put('/admin/contact/{id}/status', ContactController::class, 'updateStatus', [AdminMiddleware::class]);
$router->post('/admin/contact/{id}/reply', ContactController::class, 'reply', [AdminMiddleware::class]);
$router->delete('/admin/contact/{id}', ContactController::class, 'delete', [AdminMiddleware::class]);

// Newsletter Management (Admin)
$router->get('/admin/newsletter', NewsletterController::class, 'getAll', [AdminMiddleware::class]);
$router->get('/admin/newsletter/{id}', NewsletterController::class, 'getById', [AdminMiddleware::class]);
$router->delete('/admin/newsletter/{id}', NewsletterController::class, 'delete', [AdminMiddleware::class]);
$router->post('/admin/newsletter/export-csv', NewsletterController::class, 'export', [AdminMiddleware::class]);
$router->post('/admin/newsletter/export-excel', NewsletterController::class, 'exportExcel', [AdminMiddleware::class]);

// Notifications
$router->get('/notifications', NotificationController::class, 'index', [AuthMiddleware::class]);
$router->get('/notifications/unread-count', NotificationController::class, 'unreadCount', [AuthMiddleware::class]);
$router->put('/notifications/{id}/read', NotificationController::class, 'markAsRead', [AuthMiddleware::class]);
$router->put('/notifications/read-all', NotificationController::class, 'markAllAsRead', [AuthMiddleware::class]);
$router->delete('/notifications/{id}', NotificationController::class, 'delete', [AuthMiddleware::class]);

// ============================================
// Health Check
// ============================================
$router->get('/health', HealthController::class, 'check');
