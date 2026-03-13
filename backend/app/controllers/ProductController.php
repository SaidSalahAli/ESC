<?php
namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Product;
use App\Models\Review;
use App\Models\Category;
use App\Helpers\Validator;
use App\Helpers\Localization;

/**
 * Product Controller
 */
class ProductController
{
    private $productModel;
    private $reviewModel;
    private $categoryModel;
    
    public function __construct()
    {
        $this->productModel = new Product();
        $this->reviewModel = new Review();
        $this->categoryModel = new Category();
    }
    
    /**
     * Get all products
     */
    public function index(Request $request)
    {
        try {
            $page = (int)$request->input('page', 1);
            $limit = (int)$request->input('limit', 20);
            $offset = ($page - 1) * $limit;
            
            $query = $request->input('q', '');
            $filters = [
                'category_id' => $request->input('category_id'),
                'min_price' => $request->input('min_price'),
                'max_price' => $request->input('max_price'),
                'brand' => $request->input('brand'),
                'sort' => $request->input('sort', 'created_at'),
                'order' => $request->input('order', 'DESC'),
            ];
            
            $products = $this->productModel->search($query, $filters, $limit, $offset);
            
            // Format products based on language
            $lang = $request->language();
            $products = Localization::formatProducts($products, $lang);
            
            // Calculate total with same filters
            $total = $this->productModel->getFilteredCount($query, $filters);
            
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
     * Get featured products
     */
    public function featured(Request $request)
    {
        
        try {
            $limit = (int)$request->input('limit', 8);
            $products = $this->productModel->getFeatured($limit);
            
            // Format products based on language
            $lang = $request->language();
            $products = Localization::formatProducts($products, $lang);
            
            return Response::success($products);
            
        } catch (\Exception $e) {
            return Response::error('Failed to fetch featured products: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Get top selling products
     */
    public function topSelling(Request $request)
    {
        try {
            $limit = (int)$request->input('limit', 10);
            $products = $this->productModel->getTopSelling($limit);
            
            return Response::success($products);
            
        } catch (\Exception $e) {
            return Response::error('Failed to fetch top selling products: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Get single product by slug
     */
    public function show(Request $request, $slug)
    {
        try {
            $product = $this->productModel->findBySlug($slug);
            
            if (!$product) {
                return Response::notFound('Product not found');
            }
            
            $productDetails = $this->productModel->getProductDetails($product['id']);
            
            // Format product based on language
            $lang = $request->language();
            $productDetails = Localization::formatProduct($productDetails, $lang);
                        
            // Format category if exists
            if (isset($productDetails['category']) && $productDetails['category']) {
                $productDetails['category'] = Localization::formatCategory($productDetails['category'], $lang);
            }
            
            return Response::success($productDetails);
            
        } catch (\Exception $e) {
            return Response::error('Failed to fetch product: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Get single product by ID
     */
    public function showById(Request $request, $id)
    {
        try {
            $productDetails = $this->productModel->getProductDetails($id);
            
            if (!$productDetails) {
                return Response::notFound('Product not found');
            }
            
            // Format product based on language
            $lang = $request->language();
            $productDetails = Localization::formatProduct($productDetails, $lang);
            
            // Format category if exists
            if (isset($productDetails['category']) && $productDetails['category']) {
                $productDetails['category'] = Localization::formatCategory($productDetails['category'], $lang);
            }
            
            return Response::success($productDetails);
            
        } catch (\Exception $e) {
            return Response::error('Failed to fetch product: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Get all categories (public)
     */
    public function categories(Request $request)
    {
        try {
            $categories = $this->categoryModel->getActive();
            
            // Format categories based on language
            $lang = $request->language();
            $categories = Localization::formatCategories($categories, $lang);
            
            return Response::success($categories);
        } catch (\Exception $e) {
            return Response::error('Failed to fetch categories: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Get products by category
     */
    public function byCategory($categorySlug)
    {
        try {
            // Get category by slug
            $category = $this->productModel->query(
                "SELECT * FROM categories WHERE slug = ? LIMIT 1",
                [$categorySlug]
            );
            
            if (empty($category)) {
                return Response::notFound('Category not found');
            }
            
            $categoryId = $category[0]['id'];
            
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 20);
            $offset = ($page - 1) * $limit;
            
            $products = $this->productModel->getByCategory($categoryId, $limit, $offset);
            
            $total = $this->productModel->count('category_id = ? AND is_active = 1', [$categoryId]);
            
            return Response::success([
                'category' => $category[0],
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
     * Get related products
     */
    public function related($productId)
    {
        try {
            $product = $this->productModel->find($productId);
            
            if (!$product) {
                return Response::notFound('Product not found');
            }
            
            $relatedProducts = $this->productModel->getRelated(
                $product['id'],
                $product['category_id'],
                4
            );
            
            return Response::success($relatedProducts);
            
        } catch (\Exception $e) {
            return Response::error('Failed to fetch related products: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Get product reviews
     */
    public function reviews(Request $request, $productId)
    {
        try {
            // Ensure productId is integer
            $productId = (int)$productId;
            
            $page = (int)$request->input('page', 1);
            $limit = (int)$request->input('limit', 10);
            $offset = ($page - 1) * $limit;
            
            // Get approved reviews
            $reviews = $this->reviewModel->getProductReviews($productId, $limit, $offset, true);
            
            // Try to get user ID from token if available (optional auth)
            $userId = null;
            try {
                $token = $request->bearerToken();
                if ($token) {
                    $decoded = \App\Helpers\JWT::verify($token);
                    if ($decoded && isset($decoded['user_id'])) {
                        $userId = $decoded['user_id'];
                    }
                }
            } catch (\Exception $e) {
                // Ignore auth errors for public reviews endpoint
            }
            
            // If user is logged in, also include their own pending reviews
            if ($userId) {
                $sql = "
                    SELECT r.*, u.first_name, u.last_name, u.avatar
                    FROM reviews r
                    LEFT JOIN users u ON r.user_id = u.id
                    WHERE r.product_id = ? 
                        AND r.user_id = ? 
                        AND (r.is_approved = 0 OR r.is_approved IS NULL)
                    ORDER BY r.created_at DESC
                ";
                $db = \App\Core\Database::getInstance();
                $userPendingReviews = $db->fetchAll($sql, [$productId, $userId]);
                
                // Merge user's pending reviews with approved reviews
                $reviews = array_merge($userPendingReviews, $reviews);
            }
            
            $stats = $this->reviewModel->getStatistics($productId);
            
            // Count approved reviews for pagination
            $total = $this->reviewModel->count('product_id = ? AND is_approved = 1', [$productId]);
            
            // If user is logged in, add their pending reviews count to total
            if ($userId) {
                $pendingCount = $this->reviewModel->count('product_id = ? AND user_id = ? AND (is_approved = 0 OR is_approved IS NULL)', [$productId, $userId]);
                $total += $pendingCount;
            }
            
            return Response::success([
                'reviews' => $reviews,
                'statistics' => $stats,
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
     * Add product review (requires authentication)
     */
    public function addReview(Request $request, $productId)
    {
        // Validate input
        $validator = new Validator($request->all(), [
            'rating' => 'required|integer|in:1,2,3,4,5',
            'title' => 'max:255',
            'comment' => 'required|min:10',
        ]);
        
        if (!$validator->validate()) {
            return Response::validationError($validator->errors());
        }
        
        try {
            // Check if product exists
            $product = $this->productModel->find($productId);
            if (!$product) {
                return Response::notFound('Product not found');
            }
            
            // Check if user can review
            if (!$this->reviewModel->canUserReview($request->user_id, $productId)) {
                return Response::error('You cannot review this product. Either you have already reviewed it or you haven\'t purchased it yet.');
            }
            
            $reviewData = [
                'product_id' => $productId,
                'user_id' => $request->user_id,
                'rating' => $request->input('rating'),
                'title' => $request->input('title'),
                'comment' => $request->input('comment'),
            ];
            
            $reviewId = $this->reviewModel->createReview($reviewData);
            
            if (!$reviewId) {
                return Response::error('Failed to create review');
            }
            
            // Get the created review with user info
            $review = $this->reviewModel->find($reviewId);
            
            // If review is approved, return it immediately
            // Otherwise, return success message that it needs approval
            if ($review && $review['is_approved']) {
                // Get user info for the review
                $sql = "SELECT r.*, u.first_name, u.last_name, u.avatar 
                        FROM reviews r 
                        JOIN users u ON r.user_id = u.id 
                        WHERE r.id = ?";
                $db = \App\Core\Database::getInstance();
                $reviewWithUser = $db->fetch($sql, [$reviewId]);
                
                return Response::success($reviewWithUser, 'Review added successfully', 201);
            }
            
            return Response::success($review, 'Review submitted successfully! It will be visible after approval.', 201);
            
        } catch (\Exception $e) {
            return Response::error('Failed to add review: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Check product stock
     */
    public function checkStock($productId)
    {
        try {
            $variantId = $_GET['variant_id'] ?? null;
            $quantity = (int)($_GET['quantity'] ?? 1);
            
            $available = $this->productModel->checkStock($productId, $quantity, $variantId);
            
            return Response::success([
                'available' => $available,
            ]);
            
        } catch (\Exception $e) {
            return Response::error('Failed to check stock: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Get recent reviews (for homepage)
     */
    public function recentReviews(Request $request)
    {
        try {
            $limit = (int)$request->input('limit', 6);
            $reviews = $this->reviewModel->getRecent($limit);
            
            return Response::success($reviews);
            
        } catch (\Exception $e) {
            return Response::error('Failed to fetch recent reviews: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Find product by barcode
     * يدعم البحث في products و product_variants
     */
    public function findByBarcode(Request $request, $barcode)
    {
        try {
            $result = $this->productModel->findByBarcode($barcode);
            
            if (!$result) {
                return Response::notFound('Product or variant not found with this barcode');
            }
            
            // إذا كان المنتج نفسه
            if ($result['type'] === 'product') {
                $productDetails = $this->productModel->getProductDetails($result['data']['id']);
                return Response::success($productDetails);
            }
            
            // إذا كان variant (combination)
            if ($result['type'] === 'variant') {
                $variant = $result['data'];
                $product = $result['product'];
                
                // جلب تفاصيل المنتج مع الـ variant
                $productDetails = $this->productModel->getProductDetails($product['id']);
                
                // إضافة معلومات الـ variant
                $productDetails['variant'] = $variant;
                $productDetails['is_variant'] = true;
                $productDetails['barcode'] = $variant['barcode'];
                $productDetails['variant_sku'] = $variant['sku'];
                $productDetails['variant_stock'] = $variant['stock_quantity'];
                
                return Response::success($productDetails);
            }
            
            return Response::notFound('Product not found with this barcode');
            
        } catch (\Exception $e) {
            return Response::error('Failed to fetch product: ' . $e->getMessage(), null, 500);
        }
    }
}

