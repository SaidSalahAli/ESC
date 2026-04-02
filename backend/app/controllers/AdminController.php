<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Review;
use App\Models\Category;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use App\Models\Settings;
use App\Models\ShippingGovernorate;
use App\Helpers\Validator;
use App\Helpers\Security;
use App\Helpers\FileUpload;

/**
 * Admin Controller
 */
class AdminController
{
    private $userModel;
    private $productModel;
    private $orderModel;
    private $reviewModel;
    private $categoryModel;
    private $variantModel;
    private $imageModel;
    private $settingsModel;
    private $governorateModel;

    public function __construct()
    {
        $this->userModel = new User();
        $this->productModel = new Product();
        $this->orderModel = new Order();
        $this->reviewModel = new Review();
        $this->categoryModel = new Category();
        $this->variantModel = new ProductVariant();
        $this->imageModel = new ProductImage();
        $this->settingsModel = new Settings();
        $this->governorateModel = new ShippingGovernorate();
    }

    /**
     * Get dashboard statistics
     */
    public function dashboard(Request $request)
    {
        try {
            // Total customers
            $totalCustomers = $this->userModel->countCustomers();

            // Total products
            $totalProducts = $this->productModel->count('is_active = 1');

            // Total orders
            $totalOrders = $this->orderModel->count();

            // Pending orders
            $pendingOrders = $this->orderModel->count("status = 'pending'");

            // Total revenue
            $revenueResult = $this->orderModel->query(
                "SELECT SUM(total) as total_revenue FROM orders WHERE payment_status = 'paid'"
            );
            $totalRevenue = $revenueResult[0]['total_revenue'] ?? 0;

            // Today's orders
            $todayOrders = $this->orderModel->count(
                "DATE(created_at) = CURDATE() AND payment_status = 'paid'"
            );

            // Today's revenue
            $todayRevenueResult = $this->orderModel->query(
                "SELECT SUM(total) as today_revenue FROM orders WHERE DATE(created_at) = CURDATE() AND payment_status = 'paid'"
            );
            $todayRevenue = $todayRevenueResult[0]['today_revenue'] ?? 0;

            // Top selling products
            $topProducts = $this->productModel->getTopSelling(5);

            // Recent orders
            $recentOrders = $this->orderModel->getRecent(10);

            // Recent customers
            $recentCustomers = $this->userModel->getRecentCustomers(10);

            // Pending reviews (including NULL values)
            $pendingReviews = $this->reviewModel->count("(is_approved = 0 OR is_approved IS NULL)");

            // Sales statistics (last 30 days)
            $salesStats = $this->orderModel->getSalesStatistics(
                date('Y-m-d', strtotime('-30 days')),
                date('Y-m-d')
            );

            return Response::success([
                'summary' => [
                    'total_customers' => $totalCustomers,
                    'total_products' => $totalProducts,
                    'total_orders' => $totalOrders,
                    'pending_orders' => $pendingOrders,
                    'total_revenue' => (float)$totalRevenue,
                    'today_orders' => $todayOrders,
                    'today_revenue' => (float)$todayRevenue,
                    'pending_reviews' => $pendingReviews,
                ],
                'top_products' => $topProducts,
                'recent_orders' => $recentOrders,
                'recent_customers' => $recentCustomers,
                'sales_chart' => $salesStats,
            ]);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch dashboard data: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get all customers
     */
    public function customers(Request $request)
    {
        try {
            $page = (int)$request->input('page', 1);
            $limit = (int)$request->input('limit', 20);
            $offset = ($page - 1) * $limit;

            $customers = $this->userModel->query(
                "SELECT * FROM users WHERE role = 'customer' ORDER BY created_at DESC LIMIT ? OFFSET ?",
                [$limit, $offset]
            );

            $total = $this->userModel->countCustomers();

            return Response::success([
                'customers' => $customers,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit),
                ],
            ]);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch customers: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get all orders
     */
    public function orders(Request $request)
    {
        try {
            $page = (int)$request->input('page', 1);
            $limit = (int)$request->input('limit', 20);
            $offset = ($page - 1) * $limit;
            $status = $request->input('status');

            if ($status) {
                $orders = $this->orderModel->getByStatus($status, $limit, $offset);
                $total = $this->orderModel->count('status = ?', [$status]);
            } else {
                $orders = $this->orderModel->all($limit, $offset);
                $total = $this->orderModel->count();
            }

            return Response::success([
                'orders' => $orders,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit),
                ],
            ]);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch orders: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get order details (admin)
     */
    public function getOrderDetails(Request $request, $orderId)
    {
        try {
            $order = $this->orderModel->getOrderDetails($orderId);

            if (!$order) {
                return Response::notFound('Order not found');
            }

            // Add fulfillment status
            $order['fulfillment_status'] = $this->orderModel->getFulfillmentStatus($orderId);

            return Response::success($order);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch order details: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Scan barcode for order fulfillment
     */
    public function scanBarcode(Request $request, $orderId)
    {
        $validator = new Validator($request->all(), [
            'barcode' => 'required|string',
        ]);

        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }

        try {
            $barcode = $request->input('barcode');
            $result = $this->orderModel->scanBarcode($orderId, $barcode);

            if (!$result['success']) {
                return Response::error($result['message'], null, 400);
            }

            // If all items are scanned, update order status to processing
            if ($result['all_scanned']) {
                $this->orderModel->updateStatus($orderId, 'processing');
            }

            // Get updated order details
            $order = $this->orderModel->getOrderDetails($orderId);
            $order['fulfillment_status'] = $this->orderModel->getFulfillmentStatus($orderId);

            return Response::success([
                'message' => $result['message'],
                'item' => $result['item'],
                'all_scanned' => $result['all_scanned'],
                'order' => $order
            ]);
        } catch (\Exception $e) {
            return Response::error('Failed to scan barcode: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get order fulfillment status
     */
    public function getFulfillmentStatus(Request $request, $orderId)
    {
        try {
            $status = $this->orderModel->getFulfillmentStatus($orderId);
            return Response::success($status);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch fulfillment status: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update order status
     */
    public function updateOrderStatus(Request $request, $orderId)
    {
        $validator = new Validator($request->all(), [
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled,refunded',
            'payment_status' => 'in:pending,paid,failed,refunded',
            'tracking_number' => 'max:100',
        ]);

        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }

        try {
            $status = $request->input('status');
            $paymentStatus = $request->input('payment_status');
            $trackingNumber = $request->input('tracking_number');

            // Update order status
            $this->orderModel->updateStatus($orderId, $status);

            // Prepare update data
            $updateData = [];

            // Update payment status if provided
            if ($paymentStatus) {
                $updateData['payment_status'] = $paymentStatus;
            }

            // Update tracking number if provided
            if ($trackingNumber) {
                $updateData['tracking_number'] = $trackingNumber;
            }

            // Apply updates if any
            if (!empty($updateData)) {
                $this->orderModel->update($orderId, $updateData);
            }

            $order = $this->orderModel->getOrderDetails($orderId);

            // Send status update email to customer
            try {
                $emailService = new \App\Services\EmailService();
                $emailService->sendOrderStatusUpdate($orderId, $status);
            } catch (\Exception $e) {
                error_log('Failed to send order status update email: ' . $e->getMessage());
            }

            return Response::success($order, 'Order status updated successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to update order: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get all products (admin)
     */
    public function products(Request $request)
    {
        try {
            $page = (int)$request->input('page', 1);
            $limit = (int)$request->input('limit', 20);
            $offset = ($page - 1) * $limit;

            // Handle search query
            $query = $request->input('q', '');
            $products = [];

            if (!empty($query)) {
                // Search in products and variants (by SKU, barcode, name)
                $searchTerm = "%{$query}%";
                $db = \App\Core\Database::getInstance();

                $sql = "
                    SELECT DISTINCT p.*
                    FROM products p
                    LEFT JOIN product_variants v ON p.id = v.product_id
                    WHERE p.is_active = 1
                    AND (
                        p.name LIKE ? 
                        OR p.sku LIKE ?
                        OR p.barcode LIKE ?
                        OR v.sku LIKE ?
                        OR v.barcode LIKE ?
                        OR v.size_value LIKE ?
                        OR v.color_value LIKE ?
                    )
                    ORDER BY p.created_at DESC
                    LIMIT ? OFFSET ?
                ";
                $products = $db->fetchAll($sql, [
                    $searchTerm,
                    $searchTerm,
                    $searchTerm,
                    $searchTerm,
                    $searchTerm,
                    $searchTerm,
                    $searchTerm,
                    $limit,
                    $offset
                ]);

                // Count total
                $countSql = "
                    SELECT COUNT(DISTINCT p.id) as count
                    FROM products p
                    LEFT JOIN product_variants v ON p.id = v.product_id
                    WHERE p.is_active = 1
                    AND (
                        p.name LIKE ? 
                        OR p.sku LIKE ?
                        OR p.barcode LIKE ?
                        OR v.sku LIKE ?
                        OR v.barcode LIKE ?
                        OR v.size_value LIKE ?
                        OR v.color_value LIKE ?
                    )
                ";
                $countResult = $db->fetch($countSql, [
                    $searchTerm,
                    $searchTerm,
                    $searchTerm,
                    $searchTerm,
                    $searchTerm,
                    $searchTerm,
                    $searchTerm
                ]);
                $total = $countResult['count'] ?? 0;
            } else {
                // Get all products
                $products = $this->productModel->all($limit, $offset);
                $total = $this->productModel->count();
            }

            // Add variants with SKU and barcode to each product
            foreach ($products as &$product) {
                $variants = $this->variantModel->getByProductId($product['id']);
                $product['variants'] = $variants;

                // Get all combinations (variants with SKU and barcode)
                $combinations = array_filter($variants, function ($v) {
                    return $v['name'] === 'combination';
                });
                $product['combinations'] = array_values($combinations);
            }
            unset($product); // Break reference

            return Response::success([
                'products' => $products,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit),
                ],
            ]);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch products: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create product
     */
    public function createProduct(Request $request)
    {
        $validator = new Validator($request->all(), [
            'name' => 'required|min:3|max:255',
            'slug' => 'required|unique:products,slug',
            'price' => 'required|numeric',
            'category_id' => 'required|integer|exists:categories,id',
        ]);

        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }

        try {
            $data = $request->all();

            // Convert string '1'/'0' to boolean for is_active and is_featured
            if (isset($data['is_active'])) {
                $data['is_active'] = ($data['is_active'] === '1' || $data['is_active'] === 1 || $data['is_active'] === true);
            }
            if (isset($data['is_featured'])) {
                $data['is_featured'] = ($data['is_featured'] === '1' || $data['is_featured'] === 1 || $data['is_featured'] === true);
            }

            // Debug logging
            error_log('📦 Product Data: ' . print_r($data, true));
            error_log('📁 FILES: ' . print_r($_FILES, true));

            // Handle image upload
            if (isset($_FILES['main_image']) && $_FILES['main_image']['error'] === UPLOAD_ERR_OK) {
                error_log('📸 Image file received: ' . $_FILES['main_image']['name']);
                $uploadResult = FileUpload::uploadImage($_FILES['main_image'], 'products');
                if ($uploadResult['success']) {
                    $data['main_image'] = $uploadResult['path'];
                    error_log('✅ Image uploaded to: ' . $uploadResult['path']);
                } else {
                    error_log('❌ Image upload failed: ' . $uploadResult['error']);
                }
            } else {
                error_log('⚠️ No image file in request or upload error');
            }

            // Generate barcode if not provided
            if (empty($data['barcode'])) {
                $data['barcode'] = $this->productModel->generateBarcode();
            }

            $productId = $this->productModel->create($data);

            if (!$productId) {
                return Response::error('Failed to create product');
            }

            // Update barcode with actual product ID if it was auto-generated
            if (empty($request->input('barcode'))) {
                $finalBarcode = $this->productModel->generateBarcode($productId);
                $this->productModel->update($productId, ['barcode' => $finalBarcode]);
            }

            // Handle variants (sizes and colors)
            $this->handleProductVariants($productId, $request);

            // Handle additional images
            $this->handleProductImages($productId, $request);

            $product = $this->productModel->find($productId);
            $product['variants'] = $this->variantModel->getGroupedByProductId($productId);
            $product['images'] = $this->imageModel->getByProductId($productId);

            return Response::success($product, 'Product created successfully', 201);
        } catch (\Exception $e) {
            return Response::error('Failed to create product: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update product
     */
    public function updateProduct(Request $request, $productId)
    {
        try {
            $product = $this->productModel->find($productId);

            if (!$product) {
                return Response::notFound('Product not found');
            }

            $data = $request->all();

            // Remove main_image from data if it's not being updated (to avoid "Array" issue)
            if (isset($data['main_image']) && !isset($_FILES['main_image'])) {
                unset($data['main_image']);
            }

            // Convert string '1'/'0' to boolean for is_active and is_featured
            if (isset($data['is_active'])) {
                $data['is_active'] = ($data['is_active'] === '1' || $data['is_active'] === 1 || $data['is_active'] === true) ? 1 : 0;
            }
            if (isset($data['is_featured'])) {
                $data['is_featured'] = ($data['is_featured'] === '1' || $data['is_featured'] === 1 || $data['is_featured'] === true) ? 1 : 0;
            }

            // Handle image upload
            if (isset($_FILES['main_image']) && $_FILES['main_image']['error'] === UPLOAD_ERR_OK) {
                $uploadResult = FileUpload::uploadImage($_FILES['main_image'], 'products', $product['main_image']);
                if ($uploadResult['success']) {
                    $data['main_image'] = $uploadResult['path'];
                }
            }

            // Debug logging
            error_log('📦 Update Product Data: ' . print_r($data, true));
            error_log('🔍 is_active: ' . ($data['is_active'] ?? 'not set'));
            error_log('🔍 is_featured: ' . ($data['is_featured'] ?? 'not set'));

            $this->productModel->update($productId, $data);

            // Handle variants (sizes and colors)
            $this->handleProductVariants($productId, $request);

            // Handle additional images
            $this->handleProductImages($productId, $request);

            $updatedProduct = $this->productModel->find($productId);
            $updatedProduct['variants'] = $this->variantModel->getGroupedByProductId($productId);
            $updatedProduct['images'] = $this->imageModel->getByProductId($productId);

            return Response::success($updatedProduct, 'Product updated successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to update product: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Delete product
     */
    public function deleteProduct(Request $request, $productId)
    {
        try {
            $product = $this->productModel->find($productId);

            if (!$product) {
                return Response::notFound('Product not found');
            }

            $this->productModel->delete($productId);

            return Response::success(null, 'Product deleted successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to delete product: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get pending reviews
     */
    public function pendingReviews(Request $request)
    {
        try {
            $page = (int)$request->input('page', 1);
            $limit = (int)$request->input('limit', 20);
            $offset = ($page - 1) * $limit;

            $reviews = $this->reviewModel->getPendingReviews($limit, $offset);
            $total = $this->reviewModel->count("is_approved = 0");

            return Response::success([
                'reviews' => $reviews,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit),
                ],
            ]);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch reviews: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Approve review
     */
    public function approveReview(Request $request, $reviewId)
    {
        try {
            $this->reviewModel->approve($reviewId);

            return Response::success(null, 'Review approved successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to approve review: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Reject review
     */
    public function rejectReview(Request $request, $reviewId)
    {
        try {
            $this->reviewModel->reject($reviewId);

            return Response::success(null, 'Review rejected successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to reject review: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get sales report
     */
    public function salesReport(Request $request)
    {
        try {
            $startDate = $request->input('start_date', date('Y-m-01'));
            $endDate = $request->input('end_date', date('Y-m-d'));

            $salesStats = $this->orderModel->getSalesStatistics($startDate, $endDate);

            return Response::success([
                'start_date' => $startDate,
                'end_date' => $endDate,
                'data' => $salesStats,
            ]);
        } catch (\Exception $e) {
            return Response::error('Failed to generate sales report: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get all categories
     */
    public function categories(Request $request)
    {
        try {
            $page = (int)$request->input('page', 1);
            $limit = (int)$request->input('limit', 20);
            $offset = ($page - 1) * $limit;

            $categories = $this->categoryModel->getAllWithProductCount($limit, $offset);
            $total = $this->categoryModel->count();

            return Response::success([
                'categories' => $categories,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit),
                ],
            ]);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch categories: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get all categories (simple list for dropdowns)
     */
    public function categoriesList(Request $request)
    {
        try {
            $categories = $this->categoryModel->getActive();

            return Response::success($categories);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch categories: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create category
     */
    public function createCategory(Request $request)
    {
        $validator = new Validator($request->all(), [
            'name' => 'required|min:3|max:255',
            'slug' => 'required|min:3|max:255',
        ]);

        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }

        try {
            $slug = $request->input('slug');

            // Check if slug exists
            if ($this->categoryModel->slugExists($slug)) {
                return Response::validationError(['slug' => ['Slug already exists']]);
            }

            $data = [
                'name' => $request->input('name'),
                'name_ar' => $request->input('name_ar'),
                'slug' => $slug,
                'description' => $request->input('description'),
                'description_ar' => $request->input('description_ar'),
                'parent_id' => null, // Always null - no parent categories
                'is_active' => ($request->input('is_active') === '1' || $request->input('is_active') === 1 || $request->input('is_active') === true) ? 1 : 0,
                'sort_order' => $request->input('sort_order', 0),
            ];

            $categoryId = $this->categoryModel->create($data);

            if (!$categoryId) {
                return Response::error('Failed to create category');
            }

            $category = $this->categoryModel->find($categoryId);

            return Response::success($category, 'Category created successfully', 201);
        } catch (\Exception $e) {
            return Response::error('Failed to create category: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update category
     */
    public function updateCategory(Request $request, $categoryId)
    {
        try {
            $category = $this->categoryModel->find($categoryId);

            if (!$category) {
                return Response::notFound('Category not found');
            }

            // Check slug uniqueness if slug is being updated
            if ($request->input('slug') && $request->input('slug') !== $category['slug']) {
                if ($this->categoryModel->slugExists($request->input('slug'), $categoryId)) {
                    return Response::validationError(['slug' => ['Slug already exists']]);
                }
            }

            $data = [];

            if ($request->input('name')) {
                $data['name'] = $request->input('name');
            }
            if ($request->has('name_ar')) {
                $data['name_ar'] = $request->input('name_ar');
            }
            if ($request->input('slug')) {
                $data['slug'] = $request->input('slug');
            }
            if ($request->has('description')) {
                $data['description'] = $request->input('description');
            }
            if ($request->has('description_ar')) {
                $data['description_ar'] = $request->input('description_ar');
            }
            // Always set parent_id to null - no parent categories
            $data['parent_id'] = null;
            if ($request->has('is_active')) {
                $data['is_active'] = ($request->input('is_active') === '1' || $request->input('is_active') === 1 || $request->input('is_active') === true) ? 1 : 0;
            }
            if ($request->has('sort_order')) {
                $data['sort_order'] = $request->input('sort_order');
            }

            $this->categoryModel->update($categoryId, $data);

            $updatedCategory = $this->categoryModel->find($categoryId);

            return Response::success($updatedCategory, 'Category updated successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to update category: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Delete category
     */
    public function deleteCategory(Request $request, $categoryId)
    {
        try {
            $category = $this->categoryModel->find($categoryId);

            if (!$category) {
                return Response::notFound('Category not found');
            }

            // Check if category has products
            $productCount = $this->productModel->count('category_id = ?', [$categoryId]);

            if ($productCount > 0) {
                return Response::error(
                    'Cannot delete category with products. Please reassign or delete products first.',
                    null,
                    400
                );
            }

            // Check if category has children
            $childrenCount = $this->categoryModel->count('parent_id = ?', [$categoryId]);

            if ($childrenCount > 0) {
                return Response::error(
                    'Cannot delete category with sub-categories. Please delete sub-categories first.',
                    null,
                    400
                );
            }

            $this->categoryModel->delete($categoryId);

            return Response::success(null, 'Category deleted successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to delete category: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Handle product variants - Create combinations automatically (size + color)
     */
    private function handleProductVariants($productId, Request $request)
    {
        // Delete existing variants if updating
        $variantsJson = $request->input('variants');
        if ($variantsJson) {
            // Delete all existing variants
            $this->variantModel->deleteByProductId($productId);

            // Parse variants JSON
            $variants = json_decode($variantsJson, true);

            if (is_array($variants)) {
                $sizes = [];
                $colorsBySize = []; // Array to group colors by size

                // Log received variants for debugging
                error_log('Received variants: ' . json_encode($variants));

                // First pass: collect sizes and colors
                foreach ($variants as $variant) {
                    if (isset($variant['name']) && isset($variant['value'])) {
                        if ($variant['name'] === 'size') {
                            // Store size variant
                            $sizes[] = [
                                'value' => $variant['value'],
                                'stock_quantity' => isset($variant['stock_quantity']) ? (int)$variant['stock_quantity'] : 0,
                                'price_modifier' => isset($variant['price_modifier']) ? (float)$variant['price_modifier'] : 0.00,
                                'sku' => isset($variant['sku']) ? $variant['sku'] : null,
                            ];
                            error_log('Added size: ' . $variant['value']);
                        } elseif ($variant['name'] === 'color' && isset($variant['size_value'])) {
                            // Color linked to a specific size
                            $sizeValue = $variant['size_value'];
                            if (!isset($colorsBySize[$sizeValue])) {
                                $colorsBySize[$sizeValue] = [];
                            }
                            $colorsBySize[$sizeValue][] = [
                                'value' => $variant['value'],
                                'hex' => isset($variant['hex']) ? $variant['hex'] : '#000000',
                                'stock_quantity' => isset($variant['stock_quantity']) ? (int)$variant['stock_quantity'] : 0,
                                'price_modifier' => isset($variant['price_modifier']) ? (float)$variant['price_modifier'] : 0.00,
                                'sku' => isset($variant['sku']) ? $variant['sku'] : null,
                            ];
                            error_log('Added color ' . $variant['value'] . ' for size ' . $sizeValue);
                        } else {
                            error_log('Skipped variant (missing size_value or not color): ' . json_encode($variant));
                        }
                    }
                }

                error_log('Sizes collected: ' . json_encode($sizes));
                error_log('Colors by size: ' . json_encode($colorsBySize));

                // Create size variants (without stock - stock is only in combinations)
                foreach ($sizes as $size) {
                    $sizeData = [
                        'product_id' => $productId,
                        'name' => 'size',
                        'value' => $size['value'],
                        'size_value' => $size['value'],
                        'price_modifier' => $size['price_modifier'],
                        'stock_quantity' => 0, // لا يوجد مخزون للحجم نفسه - فقط في combinations
                        'sku' => $size['sku'],
                    ];
                    $this->variantModel->create($sizeData);
                }

                // Create combinations (size + color) for each size that has colors
                foreach ($sizes as $size) {
                    $sizeValue = $size['value'];

                    if (isset($colorsBySize[$sizeValue]) && count($colorsBySize[$sizeValue]) > 0) {
                        // This size has colors - create combinations
                        foreach ($colorsBySize[$sizeValue] as $color) {
                            // توليد SKU إذا لم يكن موجوداً
                            $sku = $color['sku'] ?: ($size['sku'] ? $size['sku'] . '-' . $color['value'] : null);

                            $combinationData = [
                                'product_id' => $productId,
                                'name' => 'combination',
                                'value' => $sizeValue . ' / ' . $color['value'],
                                'size_value' => $sizeValue, // تأكد من إرسال القيمة
                                'color_value' => $color['value'], // تأكد من إرسال القيمة
                                'hex' => isset($color['hex']) ? $color['hex'] : null, // Hex color code
                                'price_modifier' => (float)($size['price_modifier'] ?? 0) + (float)($color['price_modifier'] ?? 0),
                                'stock_quantity' => (int)($color['stock_quantity'] ?? 0), // Stock is per combination
                                'sku' => $sku,
                                // barcode سيتم توليده بعد إنشاء الـ variant
                            ];

                            // Log for debugging
                            error_log('Creating combination: ' . json_encode($combinationData));

                            // إنشاء الـ variant أولاً
                            $variantId = $this->variantModel->create($combinationData);

                            if (!$variantId) {
                                error_log('Failed to create combination variant. Data: ' . json_encode($combinationData));
                                continue;
                            }

                            // توليد الباركود لكل combination (لون + مقاس)
                            $barcode = $this->variantModel->generateBarcode($productId, $variantId, $sizeValue, $color['value']);

                            // تحديث الباركود في الـ variant
                            $this->variantModel->update($variantId, ['barcode' => $barcode]);

                            error_log("Generated barcode for variant ID {$variantId}: {$barcode} (Product: {$productId}, Size: {$sizeValue}, Color: {$color['value']})");
                        }
                    }
                    // If size has no colors, it's already created as size-only variant above
                }
            }
        }
    }

    /**
     * Handle product additional images
     */
    private function handleProductImages($productId, Request $request)
    {
        // Handle multiple general images (images[])
        if (isset($_FILES['images'])) {
            if (is_array($_FILES['images']['name'])) {
                $imageCount = count($_FILES['images']['name']);
                $existingImages = $this->imageModel->getByProductId($productId);
                $maxSortOrder = 0;
                foreach ($existingImages as $img) {
                    if ($img['sort_order'] > $maxSortOrder) {
                        $maxSortOrder = $img['sort_order'];
                    }
                }

                for ($i = 0; $i < $imageCount; $i++) {
                    if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                        $file = [
                            'name' => $_FILES['images']['name'][$i],
                            'type' => $_FILES['images']['type'][$i],
                            'tmp_name' => $_FILES['images']['tmp_name'][$i],
                            'error' => $_FILES['images']['error'][$i],
                            'size' => $_FILES['images']['size'][$i],
                        ];

                        $uploadResult = FileUpload::uploadImage($file, 'products');
                        if ($uploadResult['success']) {
                            $imageData = [
                                'product_id' => $productId,
                                'image_url' => $uploadResult['path'],
                                'color_value' => null,
                                'sort_order' => $maxSortOrder + 1 + $i,
                            ];
                            $this->imageModel->create($imageData);
                        }
                    }
                }
            } else if ($_FILES['images']['error'] === UPLOAD_ERR_OK) {
                $uploadResult = FileUpload::uploadImage($_FILES['images'], 'products');
                if ($uploadResult['success']) {
                    $existingImages = $this->imageModel->getByProductId($productId);
                    $maxSortOrder = 0;
                    foreach ($existingImages as $img) {
                        if ($img['sort_order'] > $maxSortOrder) {
                            $maxSortOrder = $img['sort_order'];
                        }
                    }

                    $imageData = [
                        'product_id' => $productId,
                        'image_url' => $uploadResult['path'],
                        'color_value' => null,
                        'sort_order' => $maxSortOrder + 1,
                    ];
                    $this->imageModel->create($imageData);
                }
            }
        }

        // Handle color-specific images (color_images[colorLabel][])
        $colorImages = $_FILES['color_images'] ?? [];

        if (!empty($colorImages['name'])) {
            $existingImages = $this->imageModel->getByProductId($productId);
            $maxSortOrder = 0;
            foreach ($existingImages as $img) {
                if ($img['sort_order'] > $maxSortOrder) {
                    $maxSortOrder = $img['sort_order'];
                }
            }

            // colorImages structure: ['name' => ['Red' => [], 'Blue' => []], ...]
            if (is_array($colorImages['name'])) {
                $sortOrder = $maxSortOrder;

                foreach ($colorImages['name'] as $colorLabel => $files) {
                    if (!is_array($files)) {
                        $files = [$files];
                    }

                    $fileCount = count($files);
                    for ($i = 0; $i < $fileCount; $i++) {
                        if ($colorImages['error'][$colorLabel][$i] === UPLOAD_ERR_OK) {
                            $file = [
                                'name' => $colorImages['name'][$colorLabel][$i],
                                'type' => $colorImages['type'][$colorLabel][$i],
                                'tmp_name' => $colorImages['tmp_name'][$colorLabel][$i],
                                'error' => $colorImages['error'][$colorLabel][$i],
                                'size' => $colorImages['size'][$colorLabel][$i],
                            ];

                            $uploadResult = FileUpload::uploadImage($file, 'products');
                            if ($uploadResult['success']) {
                                $sortOrder++;
                                $imageData = [
                                    'product_id' => $productId,
                                    'image_url' => $uploadResult['path'],
                                    'color_value' => $colorLabel,
                                    'sort_order' => $sortOrder,
                                ];
                                $this->imageModel->create($imageData);
                            }
                        }
                    }
                }
            }
        }

        // Handle image deletion (image_ids_to_delete)
        $imageIdsToDelete = $request->input('image_ids_to_delete');
        if ($imageIdsToDelete) {
            $ids = is_array($imageIdsToDelete) ? $imageIdsToDelete : json_decode($imageIdsToDelete, true);
            if (is_array($ids)) {
                foreach ($ids as $imageId) {
                    $this->imageModel->deleteImage($imageId);
                }
            }
        }
    }

    /**
     * Get product variants
     */
    public function getProductVariants(Request $request, $productId)
    {
        try {
            $variants = $this->variantModel->getGroupedByProductId($productId);
            return Response::success($variants);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch variants: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Add product variant
     */
    public function addProductVariant(Request $request, $productId)
    {
        $validator = new Validator($request->all(), [
            'name' => 'required|in:size,color',
            'value' => 'required|max:100',
        ]);

        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }

        try {
            $data = [
                'product_id' => $productId,
                'name' => $request->input('name'),
                'value' => $request->input('value'),
                'price_modifier' => (float)$request->input('price_modifier', 0),
                'stock_quantity' => (int)$request->input('stock_quantity', 0),
                'sku' => $request->input('sku'),
            ];

            $variantId = $this->variantModel->create($data);

            if (!$variantId) {
                return Response::error('Failed to create variant');
            }

            $variant = $this->variantModel->find($variantId);

            return Response::success($variant, 'Variant added successfully', 201);
        } catch (\Exception $e) {
            return Response::error('Failed to add variant: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Delete product variant
     */
    public function deleteProductVariant(Request $request, $productId, $variantId)
    {
        try {
            $variant = $this->variantModel->find($variantId);

            if (!$variant || $variant['product_id'] != $productId) {
                return Response::notFound('Variant not found');
            }

            $this->variantModel->delete($variantId);

            return Response::success(null, 'Variant deleted successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to delete variant: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get product images
     */
    public function getProductImages(Request $request, $productId)
    {
        try {
            $images = $this->imageModel->getByProductId($productId);
            return Response::success($images);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch images: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get product images grouped by color
     */
    public function getProductImagesByColor(Request $request, $productId)
    {
        try {
            $imagesByColor = $this->imageModel->getImagesByColor($productId);
            return Response::success($imagesByColor);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch images: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Delete product image
     */
    public function deleteProductImage(Request $request, $productId, $imageId)
    {
        try {
            $image = $this->imageModel->find($imageId);

            if (!$image || $image['product_id'] != $productId) {
                return Response::notFound('Image not found');
            }

            $this->imageModel->deleteImage($imageId);

            return Response::success(null, 'Image deleted successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to delete image: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get all settings
     */
    public function getAllSettings(Request $request)
    {
        try {
            $allSettings = $this->settingsModel->getAllSettings();
            return Response::success($allSettings);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch settings: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get shipping cost
     */
    public function getShippingCost(Request $request)
    {
        try {
            $shippingCost = $this->settingsModel->getValue('shipping_cost', 50);
            return Response::success([
                'shipping_cost' => (float)$shippingCost
            ]);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch shipping cost: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update shipping cost (admin only)
     */
    public function updateShippingCost(Request $request)
    {
        $validator = new Validator($request->all(), [
            'shipping_cost' => 'required|numeric|min:0',
        ]);

        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }

        try {
            $shippingCost = (float)$request->input('shipping_cost');
            $this->settingsModel->setSetting('shipping_cost', $shippingCost, 'float', 'Default shipping cost');

            return Response::success([
                'shipping_cost' => $shippingCost
            ], 'Shipping cost updated successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to update shipping cost: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get all shipping governorates
     */
    public function getShippingGovernorates(Request $request)
    {
        try {
            $governorates = $this->governorateModel->getActiveGovernorates();
            return Response::success(['governorates' => $governorates], 'Governorates retrieved successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to fetch governorates: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get all shipping governorates (including inactive)
     */
    public function getAllShippingGovernorates(Request $request)
    {
        try {
            $governorates = $this->governorateModel->all();
            return Response::success(['governorates' => $governorates], 'All governorates retrieved successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to fetch governorates: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Create shipping governorate
     */
    public function createShippingGovernorate(Request $request)
    {
        try {
            $name = $request->input('name');
            $name_ar = $request->input('name_ar');
            $shipping_cost = (float)$request->input('shipping_cost');

            if (!$name || !$name_ar || !$shipping_cost) {
                return Response::error('Missing required fields', null, 400);
            }

            $result = $this->governorateModel->create([
                'name' => $name,
                'name_ar' => $name_ar,
                'shipping_cost' => $shipping_cost
            ]);

            if (!$result) {
                return Response::error('Failed to create governorate', null, 500);
            }

            $governorate = $this->governorateModel->find($result);

            return Response::success(['governorate' => $governorate], 'Governorate created successfully', 201);
        } catch (\Exception $e) {
            return Response::error('Failed to create governorate: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Update shipping governorate
     */
    public function updateShippingGovernorate(Request $request)
    {
        try {
            $id = $request->input('id');
            $name = $request->input('name');
            $name_ar = $request->input('name_ar');
            $shipping_cost = $request->input('shipping_cost');
            $is_active = $request->input('is_active');

            if (!$id) {
                return Response::error('Governorate ID is required', null, 400);
            }

            $governorate = $this->governorateModel->find($id);
            if (!$governorate) {
                return Response::error('Governorate not found', null, 404);
            }

            $data = [];
            if ($name) $data['name'] = $name;
            if ($name_ar) $data['name_ar'] = $name_ar;
            if ($shipping_cost !== null) $data['shipping_cost'] = (float)$shipping_cost;
            if ($is_active !== null) $data['is_active'] = (bool)$is_active;

            $this->governorateModel->update($id, $data);

            $updated = $this->governorateModel->find($id);

            return Response::success(['governorate' => $updated], 'Governorate updated successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to update governorate: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Delete shipping governorate
     */
    public function deleteShippingGovernorate(Request $request)
    {
        try {
            $id = $request->input('id');

            if (!$id) {
                return Response::error('Governorate ID is required', null, 400);
            }

            $governorate = $this->governorateModel->find($id);
            if (!$governorate) {
                return Response::error('Governorate not found', null, 404);
            }

            $this->governorateModel->delete($id);

            return Response::success(null, 'Governorate deleted successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to delete governorate: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Toggle shipping governorate active status
     */
    public function toggleShippingGovernorate(Request $request)
    {
        try {
            $id = $request->input('id');

            if (!$id) {
                return Response::error('Governorate ID is required', null, 400);
            }

            $this->governorateModel->toggleActive($id);
            $updated = $this->governorateModel->find($id);

            return Response::success(['governorate' => $updated], 'Governorate status updated successfully');
        } catch (\Exception $e) {
            return Response::error('Failed to toggle governorate: ' . $e->getMessage(), null, 500);
        }
    }
}
