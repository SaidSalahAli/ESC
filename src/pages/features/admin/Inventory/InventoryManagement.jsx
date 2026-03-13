import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  InputAdornment,
  TablePagination
} from '@mui/material';
import { Printer, SearchNormal } from 'iconsax-react';
import { adminService } from 'api';
import { getImageUrl } from 'utils/imageHelper';
import BarcodePrint from 'components/BarcodePrint';

export default function InventoryManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Barcode print dialog
  const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };
      
      if (searchTerm) {
        params.q = searchTerm;
      }

      const response = await adminService.getProducts(params);
      
      if (response.success) {
        setProducts(response.data.products || []);
        setTotalProducts(response.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintBarcode = (product) => {
    setSelectedProduct(product);
    setOpenBarcodeDialog(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter products (search happens on backend via params.q)
  const filteredProducts = products;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Inventory Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage products and print barcodes for inventory
          </Typography>
        </Grid>

        {/* Search */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <TextField
                fullWidth
                label="Search Products"
                placeholder="Search by name, SKU, or barcode"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchNormal size="20" />
                    </InputAdornment>
                  ),
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Products Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product / Variant</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Barcode</TableCell>
                      <TableCell align="center">Stock</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography>Loading...</Typography>
                        </TableCell>
                      </TableRow>
                    ) : filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="textSecondary">No products found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => {
                        // الحصول على combinations (variants مع SKU و barcode)
                        const combinations = product.combinations || [];
                        const hasVariants = combinations.length > 0;
                        
                        // إذا كان المنتج لديه variants، اعرض كل variant كصف منفصل
                        if (hasVariants) {
                          return combinations.map((variant, idx) => (
                            <TableRow key={`${product.id}-variant-${variant.id}`}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  {idx === 0 && product.main_image && (
                                    <img
                                      src={getImageUrl(product.main_image)}
                                      alt={product.name}
                                      style={{
                                        width: 50,
                                        height: 50,
                                        objectFit: 'cover',
                                        borderRadius: 4
                                      }}
                                    />
                                  )}
                                  {idx > 0 && <Box sx={{ width: 50 }} />}
                                  <Box>
                                    {idx === 0 && (
                                      <Typography variant="body2" fontWeight="medium">
                                        {product.name}
                                      </Typography>
                                    )}
                                    <Typography 
                                      variant={idx === 0 ? "caption" : "body2"} 
                                      color="textSecondary"
                                      sx={{ fontStyle: idx > 0 ? 'italic' : 'normal' }}
                                    >
                                      {variant.size_value} / {variant.color_value}
                                      {idx === 0 && ` • ${product.price} EGP`}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontFamily="monospace">
                                  {variant.sku || product.sku || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontFamily="monospace">
                                  {variant.barcode || product.barcode || (
                                    <Chip label="No Barcode" size="small" color="warning" />
                                  )}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={variant.stock_quantity || 0}
                                  color={(variant.stock_quantity || 0) > 0 ? 'success' : 'error'}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  onClick={() => handlePrintBarcode({
                                    ...product,
                                    name: `${product.name} - ${variant.size_value} / ${variant.color_value}`,
                                    barcode: variant.barcode || product.barcode,
                                    sku: variant.sku || product.sku,
                                    price: (parseFloat(product.price) || 0) + (parseFloat(variant.price_modifier) || 0)
                                  })}
                                  disabled={!variant.barcode && !product.barcode}
                                  title="Print Variant Barcode"
                                  color="primary"
                                >
                                  <Printer />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ));
                        }
                        
                        // إذا لم يكن لديه variants، اعرض المنتج فقط
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {product.main_image && (
                                  <img
                                    src={getImageUrl(product.main_image)}
                                    alt={product.name}
                                    style={{
                                      width: 50,
                                      height: 50,
                                      objectFit: 'cover',
                                      borderRadius: 4
                                    }}
                                  />
                                )}
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {product.name}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {product.price} EGP
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontFamily="monospace">
                                {product.sku || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontFamily="monospace">
                                {product.barcode || (
                                  <Chip label="No Barcode" size="small" color="warning" />
                                )}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={product.stock_quantity || 0}
                                color={product.stock_quantity > 0 ? 'success' : 'error'}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handlePrintBarcode(product)}
                                disabled={!product.barcode}
                                title="Print Barcode"
                                color="primary"
                              >
                                <Printer />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
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
                rowsPerPageOptions={[10, 25, 50]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barcode Print Dialog */}
      <Dialog
        open={openBarcodeDialog}
        onClose={() => {
          setOpenBarcodeDialog(false);
          setSelectedProduct(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Print Barcode</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <BarcodePrint
              product={selectedProduct}
              onClose={() => {
                setOpenBarcodeDialog(false);
                setSelectedProduct(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

