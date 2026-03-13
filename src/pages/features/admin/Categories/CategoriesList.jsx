import { useEffect, useState } from 'react';
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
  MenuItem
} from '@mui/material';
import { Edit, Trash, Add } from 'iconsax-react';
import { adminService } from 'api';

export default function CategoriesList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCategories, setTotalCategories] = useState(0);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    slug: '',
    description: '',
    description_ar: '',
    is_active: true,
    sort_order: 0
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCategories(page + 1, rowsPerPage);
      
      if (response.success) {
        setCategories(response.data.categories || []);
        setTotalCategories(response.data.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        name_ar: category.name_ar || '',
        slug: category.slug || '',
        description: category.description || '',
        description_ar: category.description_ar || '',
        // Convert to boolean properly - 0 should be false, not true!
        is_active: category.is_active == 1 || category.is_active === true,
        sort_order: category.sort_order || 0
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        name_ar: '',
        slug: '',
        description: '',
        description_ar: '',
        is_active: true,
        sort_order: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Auto-generate slug from name if creating new category
    if (name === 'name' && !editingCategory) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Prepare data with proper boolean conversion
      const dataToSend = {
        ...formData,
        is_active: formData.is_active ? 1 : 0
      };
      
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, dataToSend);
      } else {
        await adminService.createCategory(dataToSend);
      }
      
      handleCloseDialog();
      fetchCategories();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminService.deleteCategory(categoryId);
        fetchCategories();
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  if (loading && categories.length === 0) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h2">Categories Management</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Category
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
                      <TableCell>Slug</TableCell>
                      <TableCell>Products</TableCell>
                      <TableCell>Sort Order</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.id}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">
                              {category.name}
                            </Typography>
                            {category.name_ar && (
                              <Typography variant="body2" color="textSecondary">
                                {category.name_ar}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {category.slug}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={category.product_count || 0}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{category.sort_order}</TableCell>
                        <TableCell>
                          <Chip 
                            label={category.is_active ? 'Active' : 'Inactive'} 
                            color={category.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(category)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDelete(category.id)}
                          >
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
                count={totalCategories}
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
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category Name (English)"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="اسم الفئة (عربي)"
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
                helperText="URL-friendly name (e.g., t-shirts)"
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
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Sort Order"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleInputChange}
                helperText="Lower numbers appear first"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    name="is_active"
                  />
                }
                label="Active"
                sx={{ mt: 2 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

