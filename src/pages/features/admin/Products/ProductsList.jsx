import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  TablePagination,
  MenuItem,
  Avatar,
  Stack,
  Divider
} from '@mui/material';
import { Edit, Trash, Add, CloseCircle, Printer } from 'iconsax-react';
import { adminService } from 'api';
import { getImageUrl } from 'utils/imageHelper';
import BarcodePrint from 'components/BarcodePrint';
import JsBarcode from 'jsbarcode';
import imageCompression from 'browser-image-compression'; // npm install browser-image-compression

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// ===== إعدادات الضغط =====
const compressionOptions = {
  maxSizeMB: 0.5, // الحد الأقصى للحجم = 2MB
  maxWidthOrHeight: 2560, // أقصى أبعاد = يحافظ على الدقة الأصلية تقريباً
  useWebWorker: true, // الضغط في background thread = مش بيفرّز الصفحة
  initialQuality: 0.95, // جودة 95% = قريب جداً من الأصل
  alwaysKeepResolution: true, // ⬅️ مهم جداً: متقلّلش الأبعاد خالص
  fileType: 'image/webp' // ⬅️ WebP = أحسن ضغط مع أعلى جودة
};
// ===== مكوّن طباعة باركود لون معين =====
function ColorBarcodePrintDialog({ open, onClose, product, color }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
  <html>
    <head>
      <title>Barcode - ${product?.name} - ${color?.label}</title>

      <style>

        @page {
          size: 38mm 25mm;
          margin: 0;
        }

        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
        }

        body{
          font-family: Arial, sans-serif;
          width:38mm;
          height:25mm;
        }

        .label-grid{
          width:38mm;
        }

        .label-card{
          width:38mm;
          height:25mm;
          padding:1mm;
          text-align:center;
          display:flex;
          flex-direction:column;
          justify-content:center;
          align-items:center;
          page-break-after:always;
        }

        .product-name{
          font-size:8px;
          font-weight:bold;
          margin-bottom:1mm;
        }

        .variant-info{
          font-size:7px;
          margin-bottom:1mm;
        }

        .color-dot{
          display:inline-block;
          width:2.5mm;
          height:2.5mm;
          border-radius:50%;
          border:1px solid #ccc;
          margin-right:2px;
          vertical-align:middle;
        }

        svg{
          width:34mm;
          height:auto;
        }

        .sku-text{
          font-size:6px;
          margin-top:1mm;
        }

      </style>

    </head>

    <body>

      <div class="label-grid">

        ${(color?.sizes || [])
          .map((size) => {
            const barcodeVal = size.barcode || size.sku || `${product?.id}-${color?.label}-${size.value}`;

            const safeId = "bc-${size.value}-${barcodeVal.replace(/[^a-zA-Z0-9]/g, '')}";

            return `
              <div class="label-card">

                <div class="product-name">
                  ${product?.name || ''}
                </div>

                <div class="variant-info">
                  <span class="color-dot" style="background:${color?.hex}"></span>
                  ${color?.label} • ${size.value}
                </div>

                <svg id="${safeId}"></svg>

                ${size.sku ? `<div class="sku-text">${size.sku}</div>` : ''}

              </div>
            `;
          })
          .join('')}

      </div>


      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>

      <script>

        window.onload = function(){

          ${(color?.sizes || [])
            .map((size) => {
              const barcodeVal = size.barcode || size.sku || `${product?.id}-${color?.label}-${size.value}`;

              const safeId = "bc-${size.value}-${barcodeVal.replace(/[^a-zA-Z0-9]/g, '')}";

              return `
                try{

                  JsBarcode("#${safeId}", "${barcodeVal}",{
                    format:"CODE128",
                    width:2,
                    height:18,
                    displayValue:true,
                    fontSize:8,
                    margin:0
                  });

                }catch(e){
                  console.error(e);
                }
              `;
            })
            .join('')}

          setTimeout(()=>{
            window.print();
          },500);

        }

      </script>

    </body>
  </html>
  `);

    printWindow.document.close();
  };

  if (!open || !color || !product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            bgcolor: color.hex,
            border: '1px solid #ddd',
            flexShrink: 0
          }}
        />
        طباعة باركود: {product.name} — {color.label}
      </DialogTitle>

      <DialogContent dividers>
        {color.sizes && color.sizes.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {color.sizes.map((size, idx) => {
              const barcodeVal = size.barcode || size.sku || `${product.id}-${color.label}-${size.value}`;
              return (
                <Box
                  key={idx}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: '#fafafa'
                  }}
                >
                  {/* Info */}
                  <Box sx={{ minWidth: 120 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {product.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color.hex, border: '1px solid #ccc' }} />
                      <Typography variant="body2" color="textSecondary">
                        {color.label}
                      </Typography>
                    </Box>
                    <Chip label={`Size: ${size.value}`} size="small" sx={{ mt: 0.5, fontWeight: 'bold' }} />
                    {size.sku && (
                      <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>
                        SKU: {size.sku}
                      </Typography>
                    )}
                    {size.stock_quantity !== undefined && (
                      <Typography variant="caption" display="block" color="textSecondary">
                        Stock: {size.stock_quantity} pcs
                      </Typography>
                    )}
                  </Box>

                  <Divider orientation="vertical" flexItem />

                  {/* Barcode */}
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <ColorBarcodeCanvas value={barcodeVal} />
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                      {barcodeVal}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography color="textSecondary" textAlign="center" py={3}>
            لا توجد أحجام لهذا اللون بعد.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
        <Button
          variant="contained"
          startIcon={<Printer size={18} />}
          onClick={handlePrint}
          disabled={!color.sizes || color.sizes.length === 0}
        >
          طباعة الكل
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ColorBarcodeCanvas({ value }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: 'CODE128',
          width: 1.5,
          height: 45,
          displayValue: true,
          fontSize: 11,
          margin: 6,
          background: '#fafafa'
        });
      } catch (e) {
        console.error('Barcode generation error:', e);
      }
    }
  }, [value]);

  return <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />;
}

// ============================================================

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false);
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    slug: '',
    description: '',
    description_ar: '',
    price: '',
    category_id: '',
    stock_quantity: '',
    is_active: true,
    is_featured: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [compressing, setCompressing] = useState(false); // حالة الضغط

  const [colorsWithSizes, setColorsWithSizes] = useState([]);

  const [additionalImages, setAdditionalImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // ===== Color Barcode Dialog State =====
  const [openColorBarcodeDialog, setOpenColorBarcodeDialog] = useState(false);
  const [selectedColorForBarcode, setSelectedColorForBarcode] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getProducts(page + 1, rowsPerPage);
      if (response.success) {
        setProducts(response.data.products || []);
        setTotalProducts(response.data.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminService.getCategoriesList();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    let total = 0;
    colorsWithSizes.forEach((color) => {
      (color.sizes || []).forEach((size) => {
        total += parseInt(size.stock_quantity, 10) || 0;
      });
    });
    setFormData((prev) => ({ ...prev, stock_quantity: total ? String(total) : '' }));
  }, [colorsWithSizes]);

  const normalizeVariants = (variants) => {
    if (!variants) return [];
    const colors = variants.color || [];
    const combinations = variants.combination || [];
    const colorMap = {};
    colors.forEach((c) => {
      colorMap[c.value] = { label: c.value, hex: c.hex || '#000000', sizes: [] };
    });
    combinations.forEach((combo) => {
      const colorValue = combo.color_value || combo.value || '';
      const sizeValue = combo.size_value || '';
      if (!colorMap[colorValue]) {
        colorMap[colorValue] = { label: colorValue, hex: combo.hex || '#000000', sizes: [] };
      }
      colorMap[colorValue].sizes.push({
        value: sizeValue,
        stock_quantity: combo.stock_quantity || 0,
        price_modifier: combo.price_modifier || 0,
        sku: combo.sku || '',
        barcode: combo.barcode || '',
        variant_id: combo.id
      });
    });
    return Object.values(colorMap);
  };

  const handleOpenDialog = async (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        name_ar: product.name_ar || '',
        slug: product.slug || '',
        description: product.description || '',
        description_ar: product.description_ar || '',
        price: product.price || '',
        category_id: product.category_id || '',
        stock_quantity: product.stock_quantity || '',
        is_active: product.is_active == 1 || product.is_active === true,
        is_featured: product.is_featured == 1 || product.is_featured === true
      });
      setImagePreview(product.main_image ? getImageUrl(product.main_image) : null);
      try {
        const variantsResponse = await adminService.getProductVariants(product.id);
        if (variantsResponse.success && variantsResponse.data) {
          setColorsWithSizes(normalizeVariants(variantsResponse.data));
        } else {
          setColorsWithSizes([]);
        }
        const imagesResponse = await adminService.getProductImages(product.id);
        if (imagesResponse.success && imagesResponse.data) {
          setExistingImages(imagesResponse.data || []);
        } else {
          setExistingImages([]);
        }
      } catch (err) {
        console.error('Failed to fetch variants/images:', err);
        setColorsWithSizes([]);
        setExistingImages([]);
      }
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        name_ar: '',
        slug: '',
        description: '',
        description_ar: '',
        price: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        stock_quantity: '',
        is_active: true,
        is_featured: false
      });
      setImagePreview(null);
      setColorsWithSizes([]);
      setExistingImages([]);
    }
    setImageFile(null);
    setAdditionalImages([]);
    setImagesToDelete([]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setColorsWithSizes([]);
    setAdditionalImages([]);
    setExistingImages([]);
    setImagesToDelete([]);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (name === 'name' && !editingProduct) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  // ===== الصورة الرئيسية مع ضغط =====
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCompressing(true);
    try {
      const compressed = await imageCompression(file, compressionOptions);
      setImageFile(compressed);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error('Compression error:', err);
      // fallback: استخدم الأصلية لو فشل الضغط
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } finally {
      setCompressing(false);
    }
  };

  const handleAddColor = () => {
    setColorsWithSizes((prev) => [...prev, { label: 'New Color', hex: '#000000', sizes: [] }]);
  };

  const handleRemoveColor = (colorIndex) => {
    setColorsWithSizes((prev) => prev.filter((_, i) => i !== colorIndex));
  };

  const handleColorFieldChange = (colorIndex, field, value) => {
    const updated = [...colorsWithSizes];
    updated[colorIndex] = { ...updated[colorIndex], [field]: value };
    setColorsWithSizes(updated);
  };

  const handleAddSizeToColor = (colorIndex) => {
    const updated = [...colorsWithSizes];
    if (!updated[colorIndex].sizes) updated[colorIndex].sizes = [];
    updated[colorIndex].sizes.push({ value: 'S', stock_quantity: 0, price_modifier: 0, sku: '' });
    setColorsWithSizes(updated);
  };

  const handleRemoveSizeFromColor = (colorIndex, sizeIndex) => {
    const updated = [...colorsWithSizes];
    updated[colorIndex].sizes = updated[colorIndex].sizes.filter((_, i) => i !== sizeIndex);
    setColorsWithSizes(updated);
  };

  const handleSizeFieldChange = (colorIndex, sizeIndex, field, value) => {
    const updated = [...colorsWithSizes];
    updated[colorIndex].sizes[sizeIndex] = { ...updated[colorIndex].sizes[sizeIndex], [field]: value };
    setColorsWithSizes(updated);
  };

  // ===== الصور الإضافية مع ضغط =====
  const handleAdditionalImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setCompressing(true);

    const compressAndPreview = async (file) => {
      try {
        const compressed = await imageCompression(file, compressionOptions);
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve({ file: compressed, preview: reader.result });
          reader.readAsDataURL(compressed);
        });
      } catch {
        // fallback للأصلية لو فشل الضغط
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve({ file, preview: reader.result });
          reader.readAsDataURL(file);
        });
      }
    };

    try {
      const results = await Promise.all(files.map(compressAndPreview));
      setAdditionalImages((prev) => [...prev, ...results]);
    } catch (err) {
      console.error('Additional images compression error:', err);
    } finally {
      setCompressing(false);
    }
  };

  const handleRemoveAdditionalImage = (index) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = (imageId) => {
    setImagesToDelete((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        if (value === null || value === undefined || key === 'main_image') return;
        if (typeof value === 'boolean') {
          formDataToSend.append(key, value ? '1' : '0');
        } else if (value !== '') {
          formDataToSend.append(key, value);
        }
      });

      if (imageFile) formDataToSend.append('main_image', imageFile);

      const variants = [];
      const uniqueSizes = new Map();
      colorsWithSizes.forEach((color) => {
        (color.sizes || []).forEach((s) => {
          if (s && s.value)
            uniqueSizes.set(s.value, { value: s.value, price_modifier: parseFloat(s.price_modifier) || 0, sku: s.sku || null });
        });
      });
      Array.from(uniqueSizes.values()).forEach((sz) => {
        variants.push({ name: 'size', value: sz.value, stock_quantity: 0, price_modifier: sz.price_modifier || 0, sku: sz.sku || null });
      });
      colorsWithSizes.forEach((color) => {
        (color.sizes || []).forEach((s) => {
          variants.push({
            name: 'color',
            value: color.label || color.hex,
            hex: color.hex,
            size_value: s.value,
            stock_quantity: parseInt(s.stock_quantity, 10) || 0,
            price_modifier: parseFloat(s.price_modifier) || 0,
            sku: s.sku || null,
            barcode: s.barcode || ''
          });
        });
      });

      if (variants.length > 0) formDataToSend.append('variants', JSON.stringify(variants));
      additionalImages.forEach((img) => {
        if (img.file) formDataToSend.append('images[]', img.file);
      });
      if (imagesToDelete.length > 0) formDataToSend.append('image_ids_to_delete', JSON.stringify(imagesToDelete));

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, formDataToSend);
      } else {
        await adminService.createProduct(formDataToSend);
      }
      handleCloseDialog();
      fetchProducts();
    } catch (err) {
      console.error('❌ Submit error:', err);
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminService.deleteProduct(productId);
        fetchProducts();
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  if (loading && products.length === 0) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h2">Products Management</Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
              Add Product
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Card>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Price (EGP)</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.id}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {product.main_image && (
                              <Avatar src={getImageUrl(product.main_image)} variant="rounded" sx={{ width: 60, height: 60 }} />
                            )}
                            <Box>
                              <Typography variant="subtitle2">{product.name}</Typography>
                              {product.name_ar && (
                                <Typography variant="body2" color="textSecondary">
                                  {product.name_ar}
                                </Typography>
                              )}
                              {product.is_featured && <Chip label="Featured" color="primary" size="small" sx={{ mt: 0.5 }} />}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {categories.find((cat) => cat.id === product.category_id)?.name || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">{product.price} EGP</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.combinations.map((c) => c.stock_quantity).reduce((a, b) => a + b, 0) + ' pcs'}
                            color={product.combinations.map((c) => c.stock_quantity).reduce((a, b) => a + b, 0) > 0 ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.is_active ? 'Active' : 'Inactive'}
                            color={product.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedProductForBarcode(product);
                              setOpenBarcodeDialog(true);
                            }}
                            title="Print Barcode"
                            color="primary"
                          >
                            <Printer />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleOpenDialog(product)} title="Edit">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(product.id)} title="Delete">
                            <Trash />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={totalProducts}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Product Name (English)" name="name" value={formData.name} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="اسم المنتج (عربي)"
                name="name_ar"
                value={formData.name_ar}
                onChange={handleInputChange}
                required
                dir="rtl"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                helperText="URL-friendly name (e.g., product-name)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description (English)"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="الوصف (عربي)"
                name="description_ar"
                value={formData.description_ar}
                onChange={handleInputChange}
                dir="rtl"
              />
            </Grid>

            {/* ===== الصورة الرئيسية مع مؤشر الضغط ===== */}
            <Grid item xs={12}>
              <Stack spacing={2}>
                <Button variant="outlined" component="label" fullWidth disabled={compressing}>
                  {compressing ? 'جارٍ ضغط الصورة...' : 'Upload Product Image'}
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
                {compressing && (
                  <Typography variant="caption" color="primary" textAlign="center">
                    ⏳ يتم ضغط الصورة، لحظة من فضلك...
                  </Typography>
                )}
                {imagePreview && !compressing && (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }} />
                  </Box>
                )}
              </Stack>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Price (EGP)"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Stock Quantity (Auto)"
                name="stock_quantity"
                value={formData.stock_quantity}
                InputProps={{ readOnly: true }}
                helperText="يتم احتساب المخزون تلقائيًا من المقاسات / الألوان"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Category"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={<Switch checked={formData.is_active} onChange={handleInputChange} name="is_active" />}
                label="Active"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={<Switch checked={formData.is_featured} onChange={handleInputChange} name="is_featured" />}
                label="Featured"
              />
            </Grid>

            {/* ===== Colors & Sizes Section ===== */}
            <Grid item xs={12}>
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Colors & Sizes (الألوان والمقاسات)</Typography>
                  <Button size="small" startIcon={<Add />} onClick={handleAddColor}>
                    Add Color
                  </Button>
                </Box>

                {colorsWithSizes.map((color, colorIndex) => (
                  <Box key={colorIndex} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, mb: 2, bgcolor: '#f9f9f9' }}>
                    {/* Color Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: color.hex, border: '1px solid #ccc' }} />
                        <Typography variant="subtitle1" fontWeight="bold">
                          Color: {color.label}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<Printer size={16} />}
                          onClick={() => {
                            setSelectedColorForBarcode({ ...color });
                            setOpenColorBarcodeDialog(true);
                          }}
                          disabled={!color.sizes || color.sizes.length === 0}
                          title="طباعة باركود هذا اللون"
                        >
                          Barcode
                        </Button>

                        <Button size="small" startIcon={<Add />} onClick={() => handleAddSizeToColor(colorIndex)} variant="outlined">
                          Add Size
                        </Button>
                        <IconButton color="error" size="small" onClick={() => handleRemoveColor(colorIndex)}>
                          <CloseCircle />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Color fields */}
                    <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Color Name"
                          value={color.label}
                          onChange={(e) => handleColorFieldChange(colorIndex, 'label', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type="color"
                          label="Color"
                          value={color.hex}
                          onChange={(e) => handleColorFieldChange(colorIndex, 'hex', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>

                    {/* Sizes */}
                    {color.sizes && color.sizes.length > 0 && (
                      <Box sx={{ pl: 2, borderLeft: '2px solid #1976d2' }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          Sizes for {color.label}:
                        </Typography>
                        {color.sizes.map((size, sizeIndex) => (
                          <Grid container spacing={2} key={sizeIndex} sx={{ mb: 1 }} alignItems="center">
                            <Grid item xs={3}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Size Value"
                                value={size.value}
                                onChange={(e) => handleSizeFieldChange(colorIndex, sizeIndex, 'value', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Stock"
                                value={size.stock_quantity}
                                onChange={(e) => handleSizeFieldChange(colorIndex, sizeIndex, 'stock_quantity', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextField
                                fullWidth
                                size="small"
                                label="SKU"
                                value={size.sku || ''}
                                onChange={(e) => handleSizeFieldChange(colorIndex, sizeIndex, 'sku', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={3}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Barcode"
                                value={size.barcode || ''}
                                InputProps={{ readOnly: true }}
                                helperText="Auto-generated"
                                disabled
                                sx={{ fontSize: '0.75rem' }}
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleRemoveSizeFromColor(colorIndex, sizeIndex)}
                                title="Remove Size"
                              >
                                <CloseCircle />
                              </IconButton>
                            </Grid>
                          </Grid>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}

                {colorsWithSizes.length === 0 && (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                    No colors added. Click "Add Color" to get started.
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* ===== Additional Images Section مع ضغط ===== */}
            <Grid item xs={12}>
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Additional Images (for product details)
                </Typography>

                {existingImages.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Existing Images:
                    </Typography>
                    <Grid container spacing={2}>
                      {existingImages.map((img) => (
                        <Grid item xs={4} key={img.id}>
                          <Box sx={{ position: 'relative' }}>
                            <img
                              src={getImageUrl(img.image_url)}
                              alt="Product"
                              style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                            />
                            <IconButton
                              size="small"
                              color="error"
                              sx={{ position: 'absolute', top: 0, right: 0 }}
                              onClick={() => handleDeleteExistingImage(img.id)}
                            >
                              <CloseCircle />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                <Button variant="outlined" component="label" fullWidth startIcon={<Add />} sx={{ mb: 2 }} disabled={compressing}>
                  {compressing ? 'جارٍ ضغط الصور...' : 'Upload Additional Images'}
                  <input type="file" hidden accept="image/*" multiple onChange={handleAdditionalImagesChange} />
                </Button>

                {compressing && (
                  <Typography variant="caption" color="primary" textAlign="center" display="block" sx={{ mb: 1 }}>
                    ⏳ يتم ضغط الصور، لحظة من فضلك...
                  </Typography>
                )}

                {additionalImages.length > 0 && (
                  <Grid container spacing={2}>
                    {additionalImages.map((img, index) => (
                      <Grid item xs={4} key={index}>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={img.preview}
                            alt="Preview"
                            style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            sx={{ position: 'absolute', top: 0, right: 0 }}
                            onClick={() => handleRemoveAdditionalImage(index)}
                          >
                            <CloseCircle />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={compressing}>
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Product-level Barcode Print Dialog */}
      <Dialog
        open={openBarcodeDialog}
        onClose={() => {
          setOpenBarcodeDialog(false);
          setSelectedProductForBarcode(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Print Barcode</DialogTitle>
        <DialogContent>
          {selectedProductForBarcode && (
            <BarcodePrint
              product={selectedProductForBarcode}
              onClose={() => {
                setOpenBarcodeDialog(false);
                setSelectedProductForBarcode(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ===== Color-level Barcode Print Dialog ===== */}
      <ColorBarcodePrintDialog
        open={openColorBarcodeDialog}
        onClose={() => {
          setOpenColorBarcodeDialog(false);
          setSelectedColorForBarcode(null);
        }}
        product={editingProduct}
        color={selectedColorForBarcode}
      />
    </Box>
  );
}
