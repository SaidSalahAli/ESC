<?php
namespace App\Helpers;

/**
 * Localization Helper
 * Handles multilingual data formatting
 */
class Localization
{
    /**
     * Format product data based on language
     */
    public static function formatProduct($product, $lang = 'en')
    {
        if (!$product) {
            return $product;
        }
        
        $lang = strtolower($lang);
        
        // If Arabic, use Arabic fields, otherwise use English
        if ($lang === 'ar') {
            // Use Arabic fields if available, fallback to English
            if (isset($product['name_ar']) && !empty($product['name_ar'])) {
                $product['name'] = $product['name_ar'];
            }
            if (isset($product['description_ar']) && !empty($product['description_ar'])) {
                $product['description'] = $product['description_ar'];
            }
            if (isset($product['brand_ar']) && !empty($product['brand_ar'])) {
                $product['brand'] = $product['brand_ar'];
            }
        }
        // For English, keep English fields (default)
        
        return $product;
    }
    
    /**
     * Format category data based on language
     */
    public static function formatCategory($category, $lang = 'en')
    {
        if (!$category) {
            return $category;
        }
        
        $lang = strtolower($lang);
        
        if ($lang === 'ar') {
            if (isset($category['name_ar']) && !empty($category['name_ar'])) {
                $category['name'] = $category['name_ar'];
            }
            if (isset($category['description_ar']) && !empty($category['description_ar'])) {
                $category['description'] = $category['description_ar'];
            }
        }
        
        return $category;
    }
    
    /**
     * Format array of products
     */
    public static function formatProducts($products, $lang = 'en')
    {
        if (!is_array($products)) {
            return $products;
        }
        
        return array_map(function($product) use ($lang) {
            return self::formatProduct($product, $lang);
        }, $products);
    }
    
    /**
     * Format array of categories
     */
    public static function formatCategories($categories, $lang = 'en')
    {
        if (!is_array($categories)) {
            return $categories;
        }
        
        return array_map(function($category) use ($lang) {
            return self::formatCategory($category, $lang);
        }, $categories);
    }
}

