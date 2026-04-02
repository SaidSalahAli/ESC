import { useState } from 'react';
import { Box, Button, Grid, IconButton, Typography, Stack } from '@mui/material';
import { Add, CloseCircle } from 'iconsax-react';
import imageCompression from 'browser-image-compression';

const compressionOptions = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 2560,
  useWebWorker: true,
  initialQuality: 0.95,
  alwaysKeepResolution: true,
  fileType: 'image/webp'
};

/**
 * Component for uploading and managing images for a specific color
 *
 * Props:
 * - colorLabel: string - Label of the color (e.g., "Red", "Blue")
 * - colorHex: string - Hex code of the color
 * - existingImages: array - Currently saved images for this color
 * - newImages: array - Recently uploaded images (not saved yet)
 * - onAddImages: function - Called when new images are selected
 * - onRemoveNewImage: function - Called to remove a new image by index
 * - onDeleteExistingImage: function - Called to remove an existing image by ID
 * - compressing: boolean - Show compression status
 */
function ColorImagesUpload({
  colorLabel,
  colorHex,
  existingImages = [],
  newImages = [],
  onAddImages,
  onRemoveNewImage,
  onDeleteExistingImage,
  compressing = false
}) {
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const compressOne = async (file) => {
      try {
        const c = await imageCompression(file, compressionOptions);
        return new Promise((res) => {
          const r = new FileReader();
          r.onloadend = () => res({ file: c, preview: r.result });
          r.readAsDataURL(c);
        });
      } catch {
        return new Promise((res) => {
          const r = new FileReader();
          r.onloadend = () => res({ file, preview: r.result });
          r.readAsDataURL(file);
        });
      }
    };

    try {
      const results = await Promise.all(files.map(compressOne));
      onAddImages(results);
    } catch (err) {
      console.error('Error compressing images:', err);
    }
  };

  const hasImages = existingImages.length > 0 || newImages.length > 0;

  return (
    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, mb: 2, bgcolor: '#f9f9f9' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            bgcolor: colorHex,
            border: '2px solid #ccc'
          }}
        />
        <Typography variant="subtitle1" fontWeight="bold">
          صور اللون: {colorLabel}
        </Typography>
        {existingImages.length > 0 && (
          <Typography variant="caption" sx={{ ml: 'auto', color: 'textSecondary' }}>
            {existingImages.length} صور محفوظة
          </Typography>
        )}
      </Box>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            الصور المحفوظة:
          </Typography>
          <Grid container spacing={1.5}>
            {existingImages.map((img) => (
              <Grid item xs={4} sm={3} key={img.id}>
                <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 1 }}>
                  <img
                    src={
                      typeof img.image_url === 'string' && img.image_url.startsWith('http')
                        ? img.image_url
                        : `${import.meta.env.VITE_APP_API_URL || ''}/${img.image_url}`
                    }
                    alt={`${colorLabel} color`}
                    style={{
                      width: '100%',
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 4,
                      display: 'block'
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                    }}
                    onClick={() => onDeleteExistingImage(img.id)}
                  >
                    <CloseCircle size={18} />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* New Images */}
      {newImages.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'primary.main' }}>
            صور جديدة ({newImages.length}):
          </Typography>
          <Grid container spacing={1.5}>
            {newImages.map((img, idx) => (
              <Grid item xs={4} sm={3} key={idx}>
                <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 1 }}>
                  <img
                    src={img.preview}
                    alt={`New ${colorLabel} color`}
                    style={{
                      width: '100%',
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: 4,
                      display: 'block',
                      border: '2px solid #1976d2'
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                    }}
                    onClick={() => onRemoveNewImage(idx)}
                  >
                    <CloseCircle size={18} />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Upload Button */}
      <Stack spacing={1}>
        <Button variant="outlined" component="label" fullWidth startIcon={<Add size={18} />} disabled={compressing} sx={{ py: 1.2 }}>
          {compressing ? '⏳ جارٍ ضغط الصور...' : 'رفع صور لهذا اللون'}
          <input type="file" hidden accept="image/*" multiple onChange={handleFileChange} />
        </Button>
        {compressing && (
          <Typography variant="caption" color="primary" textAlign="center">
            ⏳ جارٍ معالجة الصور...
          </Typography>
        )}
      </Stack>

      {!hasImages && (
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
          لا توجد صور لهذا اللون حتى الآن
        </Typography>
      )}
    </Box>
  );
}

export default ColorImagesUpload;
