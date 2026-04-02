<?php

namespace App\Helpers;

/**
 * File Upload Helper
 */
class FileUpload
{
    private static $allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    private static $maxFileSize = 5242880; // 5MB in bytes

    /**
     * Upload an image file
     * 
     * @param array $file The uploaded file from $_FILES
     * @param string $directory The directory to save to (e.g., 'products', 'categories')
     * @param string|null $oldFile The old file path to delete
     * @return array ['success' => bool, 'path' => string|null, 'error' => string|null]
     */
    public static function uploadImage($file, $directory, $oldFile = null)
    {
        try {
            // Check if file was uploaded
            if (!isset($file['tmp_name']) || empty($file['tmp_name'])) {
                return ['success' => false, 'path' => null, 'error' => 'No file uploaded'];
            }

            // Check for upload errors
            if ($file['error'] !== UPLOAD_ERR_OK) {
                return ['success' => false, 'path' => null, 'error' => 'File upload error: ' . $file['error']];
            }

            // Validate file type
            $fileType = mime_content_type($file['tmp_name']);
            if (!in_array($fileType, self::$allowedImageTypes)) {
                return ['success' => false, 'path' => null, 'error' => 'Invalid file type. Only images are allowed.'];
            }

            // Validate file size
            if ($file['size'] > self::$maxFileSize) {
                return ['success' => false, 'path' => null, 'error' => 'File size exceeds 5MB limit'];
            }

            // Create upload directory if it doesn't exist
            $uploadDir = __DIR__ . '/../../public/uploads/' . $directory;
            if (!is_dir($uploadDir)) {
                if (!mkdir($uploadDir, 0777, true)) {
                    return ['success' => false, 'path' => null, 'error' => 'Failed to create upload directory'];
                }
                chmod($uploadDir, 0777);
            }
            if (!is_writable($uploadDir)) {
                return [
                    'success' => false,
                    'path' => null,
                    'error' => 'المجلد ' . $uploadDir . ' مش قابل للكتابة — افتحه من Windows Explorer وأعط صلاحيات الكتابة'
                ];
            }

            // Ensure directory is writable
            if (!is_writable($uploadDir)) {
                if (!chmod($uploadDir, 0777)) {
                    return ['success' => false, 'path' => null, 'error' => 'Upload directory is not writable. Please check folder permissions.'];
                }
            }

            // Generate unique filename
            // Map MIME type to file extension (handles browser-image-compression which sends blob without extension)
            $mimeToExt = [
                'image/jpeg' => 'jpg',
                'image/jpg'  => 'jpg',
                'image/png'  => 'png',
                'image/gif'  => 'gif',
                'image/webp' => 'webp',
            ];
            $extension = $mimeToExt[$fileType] ?? pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
            $filename = uniqid() . '_' . time() . '.' . $extension;
            $filepath = $uploadDir . '/' . $filename;

            // Move uploaded file
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                return ['success' => false, 'path' => null, 'error' => 'Failed to move uploaded file. Please ensure the uploads directory has write permissions.'];
            }

            // Ensure file is readable
            chmod($filepath, 0644);

            // Delete old file if exists
            if ($oldFile) {
                self::deleteFile($oldFile);
            }

            // Return relative path
            $relativePath = '/uploads/' . $directory . '/' . $filename;

            return ['success' => true, 'path' => $relativePath, 'error' => null];
        } catch (\Exception $e) {
            return ['success' => false, 'path' => null, 'error' => $e->getMessage()];
        }
    }

    /**
     * Delete a file
     * 
     * @param string $filepath The file path to delete
     * @return bool
     */
    public static function deleteFile($filepath)
    {
        try {
            if (empty($filepath)) {
                return false;
            }

            $fullPath = __DIR__ . '/../../public' . $filepath;

            if (file_exists($fullPath)) {
                return unlink($fullPath);
            }

            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Validate image file from $_FILES
     * 
     * @param array $file The uploaded file
     * @return array ['valid' => bool, 'error' => string|null]
     */
    public static function validateImage($file)
    {
        if (!isset($file['tmp_name']) || empty($file['tmp_name'])) {
            return ['valid' => false, 'error' => 'No file uploaded'];
        }

        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['valid' => false, 'error' => 'Upload error'];
        }

        $fileType = mime_content_type($file['tmp_name']);
        if (!in_array($fileType, self::$allowedImageTypes)) {
            return ['valid' => false, 'error' => 'Invalid file type'];
        }

        if ($file['size'] > self::$maxFileSize) {
            return ['valid' => false, 'error' => 'File too large (max 5MB)'];
        }

        return ['valid' => true, 'error' => null];
    }

    /**
     * Get file extension
     * 
     * @param string $filename
     * @return string
     */
    public static function getExtension($filename)
    {
        return strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    }
}
