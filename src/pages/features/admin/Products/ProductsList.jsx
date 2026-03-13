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
import imageCompression from 'browser-image-compression';
import { printLabel } from 'utils/printLabel';

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const compressionOptions = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 2560,
  useWebWorker: true,
  initialQuality: 0.95,
  alwaysKeepResolution: true,
  fileType: 'image/webp'
};

// ─────────────────────────────────────────────────────────────────────────────
// Barcode canvas for screen preview inside the dialog
// ─────────────────────────────────────────────────────────────────────────────
function BarcodeCanvas({ value }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, value, {
        format: 'CODE128',
        width: 1.6,
        height: 42,
        displayValue: true,
        fontSize: 10,
        margin: 4,
        background: '#fafafa'
      });
    } catch (e) {
      console.error('Barcode canvas error:', e);
    }
  }, [value]);
  return <canvas ref={ref} style={{ maxWidth: '100%' }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// ColorBarcodePrintDialog
// Shows all sizes for a color with their barcodes and prints 75×50mm labels
// ─────────────────────────────────────────────────────────────────────────────
function ColorBarcodePrintDialog({ open, onClose, product, color }) {
  if (!open || !color || !product) return null;

  const handlePrintAll = () => {
    const labels = (color.sizes || []).map((size) => ({
      brand: 'ESC WEAR',
      title: product.name,
      subtitle: `${color.label} • ${size.value}`,
      barcode: (size.barcode || size.sku || `${product.id}-${color.label}-${size.value}`).toString(),
      meta: [size.sku && `SKU: ${size.sku}`, size.stock_quantity !== undefined && `Stock: ${size.stock_quantity}`]
        .filter(Boolean)
        .join('  |  ')
    }));
    printLabel(labels);
  };

  const handlePrintOne = (size) => {
    printLabel([
      {
        brand: 'ESC WEAR',
        title: product.name,
        subtitle: `${color.label} • ${size.value}`,
        barcode: (size.barcode || size.sku || `${product.id}-${color.label}-${size.value}`).toString(),
        meta: [size.sku && `SKU: ${size.sku}`, size.stock_quantity !== undefined && `Stock: ${size.stock_quantity}`]
          .filter(Boolean)
          .join('  |  ')
      }
    ]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Title */}
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: color.hex,
            border: '1px solid #ddd',
            flexShrink: 0
          }}
        />
        باركودات: {product.name} — {color.label}
      </DialogTitle>

      <DialogContent dividers>
        {color.sizes?.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {color.sizes.map((size, idx) => {
              const barcodeVal = (size.barcode || size.sku || `${product.id}-${color.label}-${size.value}`).toString();
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
                  {/* ── Info column ── */}
                  <Box sx={{ minWidth: 130 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {product.name}
                    </Typography>

                    {/* Color dot + name */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Box
                        sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color.hex, border: '1px solid #ccc', flexShrink: 0 }}
                      />
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

                    {/* Print single */}
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Printer size={13} />}
                      onClick={() => handlePrintOne(size)}
                      sx={{ mt: 1, fontSize: '0.7rem' }}
                    >
                      طباعة هذا فقط
                    </Button>
                  </Box>

                  <Divider orientation="vertical" flexItem />

                  {/* ── Barcode preview column ── */}
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <BarcodeCanvas value={barcodeVal} />
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block', wordBreak: 'break-all' }}>
                      {barcodeVal}
                    </Typography>
                  </Box>
                </Box>
              );
            })}

            {/* Paper size hint */}
            <Box sx={{ bgcolor: '#fff8e1', border: '1px solid #ffe082', borderRadius: 1, p: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                ⚙️ <strong>إعداد الطابعة:</strong> Paper size → Custom <strong>75 × 50 mm</strong> — Margins: None
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography color="textSecondary" textAlign="center" py={3}>
            لا توجد مقاسات لهذا اللون بعد.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
        <Button variant="contained" startIcon={<Printer size={16} />} onClick={handlePrintAll} disabled={!color.sizes?.length}>
          طباعة الكل ({color.sizes?.length || 0} ستيكر)
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ProductsList component (unchanged logic, only ColorBarcodePrintDialog updated)
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

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
  const [compressing, setCompressing] = useState(false);
  const [colorsWithSizes, setColorsWithSizes] = useState([]);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
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
      if (response.success) setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, rowsPerPage]); // eslint-disable-line

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    let total = 0;
    colorsWithSizes.forEach((c) =>
      (c.sizes || []).forEach((s) => {
        total += parseInt(s.stock_quantity, 10) || 0;
      })
    );
    setFormData((prev) => ({ ...prev, stock_quantity: total ? String(total) : '' }));
  }, [colorsWithSizes]);

  const normalizeVariants = (variants) => {
    if (!variants) return [];
    const colorMap = {};
    (variants.color || []).forEach((c) => {
      colorMap[c.value] = { label: c.value, hex: c.hex || '#000000', sizes: [] };
    });
    (variants.combination || []).forEach((combo) => {
      const cv = combo.color_value || combo.value || '';
      if (!colorMap[cv]) colorMap[cv] = { label: cv, hex: combo.hex || '#000000', sizes: [] };
      colorMap[cv].sizes.push({
        value: combo.size_value || '',
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
        const vr = await adminService.getProductVariants(product.id);
        setColorsWithSizes(vr.success && vr.data ? normalizeVariants(vr.data) : []);
        const ir = await adminService.getProductImages(product.id);
        setExistingImages(ir.success && ir.data ? ir.data : []);
      } catch (err) {
        console.error(err);
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
    const newValue = type === 'checkbox' ? checked : value;
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
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } finally {
      setCompressing(false);
    }
  };

  const handleAddColor = () => setColorsWithSizes((p) => [...p, { label: 'New Color', hex: '#000000', sizes: [] }]);
  const handleRemoveColor = (i) => setColorsWithSizes((p) => p.filter((_, idx) => idx !== i));
  const handleColorFieldChange = (ci, field, val) => {
    const u = [...colorsWithSizes];
    u[ci] = { ...u[ci], [field]: val };
    setColorsWithSizes(u);
  };
  const handleAddSizeToColor = (ci) => {
    const u = [...colorsWithSizes];
    if (!u[ci].sizes) u[ci].sizes = [];
    u[ci].sizes.push({ value: 'S', stock_quantity: 0, price_modifier: 0, sku: '' });
    setColorsWithSizes(u);
  };
  const handleRemoveSizeFromColor = (ci, si) => {
    const u = [...colorsWithSizes];
    u[ci].sizes = u[ci].sizes.filter((_, i) => i !== si);
    setColorsWithSizes(u);
  };
  const handleSizeFieldChange = (ci, si, field, val) => {
    const u = [...colorsWithSizes];
    u[ci].sizes[si] = { ...u[ci].sizes[si], [field]: val };
    setColorsWithSizes(u);
  };

  const handleAdditionalImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setCompressing(true);
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
      setAdditionalImages((p) => [...p, ...results]);
    } catch (err) {
      console.error(err);
    } finally {
      setCompressing(false);
    }
  };

  const handleRemoveAdditionalImage = (i) => setAdditionalImages((p) => p.filter((_, idx) => idx !== i));
  const handleDeleteExistingImage = (id) => {
    setImagesToDelete((p) => [...p, id]);
    setExistingImages((p) => p.filter((img) => img.id !== id));
  };

  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        const v = formData[key];
        if (v === null || v === undefined || key === 'main_image') return;
        if (typeof v === 'boolean') fd.append(key, v ? '1' : '0');
        else if (v !== '') fd.append(key, v);
      });
      if (imageFile) fd.append('main_image', imageFile);

      const variants = [];
      const uniqueSizes = new Map();
      colorsWithSizes.forEach((c) =>
        (c.sizes || []).forEach((s) => {
          if (s?.value) uniqueSizes.set(s.value, { value: s.value, price_modifier: parseFloat(s.price_modifier) || 0, sku: s.sku || null });
        })
      );
      uniqueSizes.forEach((sz) =>
        variants.push({ name: 'size', value: sz.value, stock_quantity: 0, price_modifier: sz.price_modifier || 0, sku: sz.sku || null })
      );
      colorsWithSizes.forEach((c) =>
        (c.sizes || []).forEach((s) =>
          variants.push({
            name: 'color',
            value: c.label || c.hex,
            hex: c.hex,
            size_value: s.value,
            stock_quantity: parseInt(s.stock_quantity, 10) || 0,
            price_modifier: parseFloat(s.price_modifier) || 0,
            sku: s.sku || null,
            barcode: s.barcode || ''
          })
        )
      );

      if (variants.length > 0) fd.append('variants', JSON.stringify(variants));
      additionalImages.forEach((img) => {
        if (img.file) fd.append('images[]', img.file);
      });
      if (imagesToDelete.length > 0) fd.append('image_ids_to_delete', JSON.stringify(imagesToDelete));

      if (editingProduct) await adminService.updateProduct(editingProduct.id, fd);
      else await adminService.createProduct(fd);
      handleCloseDialog();
      fetchProducts();
    } catch (err) {
      console.error('❌ Submit error:', err);
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminService.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  if (loading && products.length === 0) return <Typography>Loading...</Typography>;

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
                            {categories.find((c) => c.id === product.category_id)?.name || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">{product.price} EGP</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.combinations.reduce((a, c) => a + c.stock_quantity, 0) + ' pcs'}
                            color={product.combinations.reduce((a, c) => a + c.stock_quantity, 0) > 0 ? 'success' : 'error'}
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
                            color="primary"
                            title="Print Barcode"
                            onClick={() => {
                              setSelectedProductForBarcode(product);
                              setOpenBarcodeDialog(true);
                            }}
                          >
                            <Printer />
                          </IconButton>
                          <IconButton size="small" title="Edit" onClick={() => handleOpenDialog(product)}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error" title="Delete" onClick={() => handleDelete(product.id)}>
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

      {/* ── Add / Edit Dialog ── */}
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

            <Grid item xs={12}>
              <Stack spacing={2}>
                <Button variant="outlined" component="label" fullWidth disabled={compressing}>
                  {compressing ? 'جارٍ ضغط الصورة...' : 'Upload Product Image'}
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
                {compressing && (
                  <Typography variant="caption" color="primary" textAlign="center">
                    ⏳ يتم ضغط الصورة...
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
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
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

            {/* ── Colors & Sizes ── */}
            <Grid item xs={12}>
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Colors & Sizes</Typography>
                  <Button size="small" startIcon={<Add />} onClick={handleAddColor}>
                    Add Color
                  </Button>
                </Box>

                {colorsWithSizes.map((color, ci) => (
                  <Box key={ci} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, mb: 2, bgcolor: '#f9f9f9' }}>
                    {/* Color header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: color.hex, border: '1px solid #ccc' }} />
                        <Typography variant="subtitle1" fontWeight="bold">
                          Color: {color.label}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {/* ── Print barcode button ── */}
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<Printer size={14} />}
                          disabled={!color.sizes?.length}
                          onClick={() => {
                            setSelectedColorForBarcode({ ...color });
                            setOpenColorBarcodeDialog(true);
                          }}
                        >
                          Barcode ({color.sizes?.length || 0})
                        </Button>
                        <Button size="small" startIcon={<Add />} onClick={() => handleAddSizeToColor(ci)} variant="outlined">
                          Add Size
                        </Button>
                        <IconButton color="error" size="small" onClick={() => handleRemoveColor(ci)}>
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
                          onChange={(e) => handleColorFieldChange(ci, 'label', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type="color"
                          label="Color"
                          value={color.hex}
                          onChange={(e) => handleColorFieldChange(ci, 'hex', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>

                    {/* Sizes rows */}
                    {color.sizes?.length > 0 && (
                      <Box sx={{ pl: 2, borderLeft: '2px solid #1976d2' }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          Sizes for {color.label}:
                        </Typography>
                        {color.sizes.map((size, si) => (
                          <Grid container spacing={2} key={si} sx={{ mb: 1 }} alignItems="center">
                            <Grid item xs={3}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Size"
                                value={size.value}
                                onChange={(e) => handleSizeFieldChange(ci, si, 'value', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Stock"
                                value={size.stock_quantity}
                                onChange={(e) => handleSizeFieldChange(ci, si, 'stock_quantity', e.target.value)}
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <TextField
                                fullWidth
                                size="small"
                                label="SKU"
                                value={size.sku || ''}
                                onChange={(e) => handleSizeFieldChange(ci, si, 'sku', e.target.value)}
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
                              />
                            </Grid>
                            <Grid item xs={2}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {/* Print single size sticker directly */}
                                <IconButton
                                  size="small"
                                  color="primary"
                                  title="Print this size"
                                  disabled={!size.barcode && !size.sku}
                                  onClick={() =>
                                    printLabel([
                                      {
                                        brand: 'ESC WEAR',
                                        title: editingProduct?.name || '',
                                        subtitle: `${color.label} • ${size.value}`,
                                        barcode: (
                                          size.barcode ||
                                          size.sku ||
                                          `${editingProduct?.id}-${color.label}-${size.value}`
                                        ).toString(),
                                        meta: size.sku ? `SKU: ${size.sku}` : ''
                                      }
                                    ])
                                  }
                                >
                                  <Printer size={16} />
                                </IconButton>
                                <IconButton color="error" size="small" onClick={() => handleRemoveSizeFromColor(ci, si)}>
                                  <CloseCircle />
                                </IconButton>
                              </Box>
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

            {/* ── Additional Images ── */}
            <Grid item xs={12}>
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Additional Images
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
                    ⏳ يتم ضغط الصور...
                  </Typography>
                )}
                {additionalImages.length > 0 && (
                  <Grid container spacing={2}>
                    {additionalImages.map((img, i) => (
                      <Grid item xs={4} key={i}>
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
                            onClick={() => handleRemoveAdditionalImage(i)}
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

      {/* ── Product Barcode Dialog ── */}
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

      {/* ── Color Barcode Dialog ── */}
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
