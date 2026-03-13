<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\Product;
use App\Models\Category;

/**
 * SEO Controller - Handles sitemap generation
 */
class SeoController extends Controller
{
    private $productModel;
    private $categoryModel;
    
    public function __construct()
    {
        parent::__construct();
        $this->productModel = new Product();
        $this->categoryModel = new Category();
    }
    
    /**
     * Generate XML sitemap
     */
    public function sitemap(Request $request)
    {
        try {
            $baseUrl = $request->input('base_url', 'https://escwear.com');
            
            // Get all active products
            $products = $this->productModel->query(
                "SELECT id, slug, updated_at FROM products WHERE is_active = 1 ORDER BY updated_at DESC"
            );
            
            // Get all active categories
            $categories = $this->categoryModel->query(
                "SELECT id, slug, updated_at FROM categories WHERE is_active = 1 ORDER BY updated_at DESC"
            );
            
            // Start XML
            $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
            $xml .= ' xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";
            
            // Homepage
            $xml .= $this->buildUrl($baseUrl . '/', date('Y-m-d'), 'daily', '1.0');
            $xml .= $this->buildUrl($baseUrl . '/ar', date('Y-m-d'), 'daily', '1.0');
            
            // Products page
            $xml .= $this->buildUrl($baseUrl . '/products', date('Y-m-d'), 'daily', '0.8');
            $xml .= $this->buildUrl($baseUrl . '/collections', date('Y-m-d'), 'weekly', '0.8');
            
            // Individual products
            foreach ($products as $product) {
                $lastmod = $product['updated_at'] ? date('Y-m-d', strtotime($product['updated_at'])) : date('Y-m-d');
                $url = $baseUrl . '/products/' . ($product['slug'] ?: $product['id']);
                $xml .= $this->buildUrl($url, $lastmod, 'weekly', '0.7');
                
                // Arabic version
                $xml .= $this->buildUrl($url . '?lang=ar', $lastmod, 'weekly', '0.7', 'ar');
            }
            
            // Categories
            foreach ($categories as $category) {
                $lastmod = $category['updated_at'] ? date('Y-m-d', strtotime($category['updated_at'])) : date('Y-m-d');
                $url = $baseUrl . '/collections/' . ($category['slug'] ?: $category['id']);
                $xml .= $this->buildUrl($url, $lastmod, 'weekly', '0.6');
                
                // Arabic version
                $xml .= $this->buildUrl($url . '?lang=ar', $lastmod, 'weekly', '0.6', 'ar');
            }
            
            $xml .= '</urlset>';
            
            // Set headers
            header('Content-Type: application/xml; charset=utf-8');
            echo $xml;
            exit;
            
        } catch (\Exception $e) {
            return Response::error('Failed to generate sitemap: ' . $e->getMessage(), null, 500);
        }
    }
    
    /**
     * Build URL entry for sitemap
     */
    private function buildUrl($url, $lastmod, $changefreq, $priority, $hreflang = null)
    {
        $xml = "  <url>\n";
        $xml .= "    <loc>" . htmlspecialchars($url, ENT_XML1, 'UTF-8') . "</loc>\n";
        $xml .= "    <lastmod>" . $lastmod . "</lastmod>\n";
        $xml .= "    <changefreq>" . $changefreq . "</changefreq>\n";
        $xml .= "    <priority>" . $priority . "</priority>\n";
        
        if ($hreflang) {
            $xml .= "    <xhtml:link rel=\"alternate\" hreflang=\"" . $hreflang . "\" href=\"" . htmlspecialchars($url, ENT_XML1, 'UTF-8') . "\" />\n";
        }
        
        $xml .= "  </url>\n";
        return $xml;
    }
}

