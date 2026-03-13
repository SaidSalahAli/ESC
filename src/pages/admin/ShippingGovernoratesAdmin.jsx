import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  Switch,
  FormControlLabel,
  Container,
  Typography,
  Grid,
  Card as MuiCard,
  InputAdornment,
  Tooltip,
  IconButton,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { openSnackbar } from 'api/snackbar';
import axios from 'utils/axios';

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#f0a500',
  color: '#0f1111',
  fontWeight: 600,
  padding: '12px 16px'
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: '#f9f9f9'
  },
  '&:hover': {
    backgroundColor: '#f0f0f0'
  }
}));

function ShippingGovernoratesAdmin() {
  const intl = useIntl();
  const [governorates, setGovernorates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingRowData, setEditingRowData] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    shipping_cost: '',
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [searchText, setSearchText] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // all, active, inactive

  useEffect(() => {
    fetchGovernorates();
  }, []);

  const fetchGovernorates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/shipping-governorates');
      if (response.data?.success) {
        setGovernorates(response.data.data?.governorates || []);
      }
    } catch (err) {
      console.error('Error fetching governorates:', err);
      openSnackbar({
        open: true,
        message: 'Failed to load governorates',
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (governorate = null) => {
    if (governorate) {
      setEditingId(governorate.id);
      setFormData({
        name: governorate.name,
        name_ar: governorate.name_ar,
        shipping_cost: governorate.shipping_cost.toString(),
        is_active: governorate.is_active
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        name_ar: '',
        shipping_cost: '',
        is_active: true
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'English name is required';
    if (!formData.name_ar.trim()) errors.name_ar = 'Arabic name is required';
    if (!formData.shipping_cost || isNaN(parseFloat(formData.shipping_cost))) {
      errors.shipping_cost = 'Valid shipping cost is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveGovernorate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        name_ar: formData.name_ar,
        shipping_cost: parseFloat(formData.shipping_cost),
        is_active: formData.is_active
      };

      if (editingId) {
        // Update
        const response = await axios.put(`/api/admin/shipping-governorates/${editingId}`, {
          id: editingId,
          ...payload
        });
        if (response.data?.success) {
          openSnackbar({
            open: true,
            message: 'Governorate updated successfully',
            variant: 'alert',
            alert: { color: 'success' }
          });
        }
      } else {
        // Create
        const response = await axios.post('/api/admin/shipping-governorates', payload);
        if (response.data?.success) {
          openSnackbar({
            open: true,
            message: 'Governorate created successfully',
            variant: 'alert',
            alert: { color: 'success' }
          });
        }
      }

      handleCloseDialog();
      fetchGovernorates();
    } catch (err) {
      console.error('Error saving governorate:', err);
      openSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save governorate',
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGovernorate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this governorate?')) return;

    try {
      setLoading(true);
      const response = await axios.delete(`/api/admin/shipping-governorates/${id}`);
      if (response.data?.success) {
        openSnackbar({
          open: true,
          message: 'Governorate deleted successfully',
          variant: 'alert',
          alert: { color: 'success' }
        });
        fetchGovernorates();
      }
    } catch (err) {
      console.error('Error deleting governorate:', err);
      openSnackbar({
        open: true,
        message: 'Failed to delete governorate',
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/admin/shipping-governorates/${id}/toggle`);
      if (response.data?.success) {
        openSnackbar({
          open: true,
          message: 'Governorate status updated',
          variant: 'alert',
          alert: { color: 'success' }
        });
        fetchGovernorates();
      }
    } catch (err) {
      console.error('Error toggling governorate:', err);
      openSnackbar({
        open: true,
        message: 'Failed to update status',
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setLoading(false);
    }
  };

  // Inline editing functions
  const startEditingRow = (governorate) => {
    setEditingRowId(governorate.id);
    setEditingRowData({ ...governorate });
  };

  const cancelEditingRow = () => {
    setEditingRowId(null);
    setEditingRowData({});
  };

  const saveEditingRow = async () => {
    try {
      setLoading(true);
      await axios.put(`/api/admin/shipping-governorates/${editingRowId}`, {
        id: editingRowId,
        ...editingRowData
      });
      openSnackbar({
        open: true,
        message: 'Updated successfully',
        variant: 'alert',
        alert: { color: 'success' }
      });
      setEditingRowId(null);
      fetchGovernorates();
    } catch (err) {
      openSnackbar({
        open: true,
        message: 'Failed to update',
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter governorates
  const filteredGovernorates = governorates.filter((gov) => {
    const matchSearch = gov.name.toLowerCase().includes(searchText.toLowerCase()) || gov.name_ar.includes(searchText);
    const matchFilter =
      filterActive === 'all' || (filterActive === 'active' && gov.is_active) || (filterActive === 'inactive' && !gov.is_active);
    return matchSearch && matchFilter;
  });

  // Statistics
  const stats = {
    total: governorates.length,
    active: governorates.filter((g) => g.is_active).length,
    inactive: governorates.filter((g) => !g.is_active).length,
    minCost: Math.min(...governorates.map((g) => parseFloat(g.shipping_cost))),
    maxCost: Math.max(...governorates.map((g) => parseFloat(g.shipping_cost))),
    avgCost: governorates.reduce((sum, g) => sum + parseFloat(g.shipping_cost), 0) / governorates.length
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="#0f1111" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShippingIcon sx={{ color: '#f0a500' }} />
              <FormattedMessage id="shipping-governorates" />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage shipping costs for all Egyptian governorates
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh data">
              <IconButton onClick={fetchGovernorates} disabled={loading} sx={{ color: '#f0a500' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                backgroundColor: '#f0a500',
                color: '#0f1111',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#e0a000' }
              }}
            >
              <FormattedMessage id="add-governorate" />
            </Button>
          </Stack>
        </Box>

        {/* Statistics Cards */}
        {governorates.length > 0 && !loading && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2.4}>
              <MuiCard elevation={0} sx={{ border: '1px solid #eee', p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h5" sx={{ color: '#0f1111', fontWeight: 700, mt: 1 }}>
                  {stats.total}
                </Typography>
              </MuiCard>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <MuiCard elevation={0} sx={{ border: '1px solid #4caf50', borderLeft: '4px solid #4caf50', p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Active
                </Typography>
                <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 700, mt: 1 }}>
                  {stats.active}
                </Typography>
              </MuiCard>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <MuiCard elevation={0} sx={{ border: '1px solid #f44336', borderLeft: '4px solid #f44336', p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Inactive
                </Typography>
                <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 700, mt: 1 }}>
                  {stats.inactive}
                </Typography>
              </MuiCard>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <MuiCard elevation={0} sx={{ border: '1px solid #ff9800', p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <TrendingDownIcon sx={{ fontSize: 18, color: '#ff9800' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Min Cost
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 700 }}>
                      {stats.minCost?.toFixed(0)} EGP
                    </Typography>
                  </Box>
                </Stack>
              </MuiCard>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <MuiCard elevation={0} sx={{ border: '1px solid #2196f3', p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <TrendingUpIcon sx={{ fontSize: 18, color: '#2196f3' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Max Cost
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 700 }}>
                      {stats.maxCost?.toFixed(0)} EGP
                    </Typography>
                  </Box>
                </Stack>
              </MuiCard>
            </Grid>
          </Grid>
        )}

        {/* Search and Filter */}
        <Paper elevation={0} sx={{ border: '1px solid #ddd', p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Search by name or محافظة..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    '&:hover fieldset': { borderColor: '#f0a500' },
                    '&.Mui-focused fieldset': { borderColor: '#f0a500' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`All (${governorates.length})`}
                  onClick={() => setFilterActive('all')}
                  variant={filterActive === 'all' ? 'filled' : 'outlined'}
                  sx={{
                    backgroundColor: filterActive === 'all' ? '#f0a500' : 'transparent',
                    color: filterActive === 'all' ? '#0f1111' : '#666',
                    cursor: 'pointer'
                  }}
                />
                <Chip
                  label={`Active (${stats.active})`}
                  onClick={() => setFilterActive('active')}
                  variant={filterActive === 'active' ? 'filled' : 'outlined'}
                  sx={{
                    backgroundColor: filterActive === 'active' ? '#4caf50' : 'transparent',
                    color: filterActive === 'active' ? '#fff' : '#666',
                    cursor: 'pointer'
                  }}
                />
                <Chip
                  label={`Inactive (${stats.inactive})`}
                  onClick={() => setFilterActive('inactive')}
                  variant={filterActive === 'inactive' ? 'filled' : 'outlined'}
                  sx={{
                    backgroundColor: filterActive === 'inactive' ? '#f44336' : 'transparent',
                    color: filterActive === 'inactive' ? '#fff' : '#666',
                    cursor: 'pointer'
                  }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Table */}
        <Card elevation={0} sx={{ border: '1px solid #ddd' }}>
          <CardContent sx={{ p: 0 }}>
            {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}

            {!loading && governorates.length === 0 && (
              <Alert severity="info" sx={{ m: 2 }}>
                No governorates found
              </Alert>
            )}

            {!loading && governorates.length > 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableHeadCell align="left" sx={{ width: '25%' }}>
                        Name (EN)
                      </StyledTableHeadCell>
                      <StyledTableHeadCell align="left" sx={{ width: '25%' }}>
                        Name (AR)
                      </StyledTableHeadCell>
                      <StyledTableHeadCell align="center" sx={{ width: '20%' }}>
                        Shipping Cost (EGP)
                      </StyledTableHeadCell>
                      <StyledTableHeadCell align="center" sx={{ width: '15%' }}>
                        Active
                      </StyledTableHeadCell>
                      <StyledTableHeadCell align="center" sx={{ width: '15%' }}>
                        Actions
                      </StyledTableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredGovernorates.map((governorate) => (
                      <StyledTableRow key={governorate.id}>
                        <TableCell align="left" sx={{ fontWeight: 500 }}>
                          {editingRowId === governorate.id ? (
                            <TextField
                              size="small"
                              value={editingRowData.name}
                              onChange={(e) => setEditingRowData({ ...editingRowData, name: e.target.value })}
                              sx={{ width: '100%' }}
                            />
                          ) : (
                            governorate.name
                          )}
                        </TableCell>
                        <TableCell align="left">
                          {editingRowId === governorate.id ? (
                            <TextField
                              size="small"
                              value={editingRowData.name_ar}
                              onChange={(e) => setEditingRowData({ ...editingRowData, name_ar: e.target.value })}
                              sx={{ width: '100%' }}
                            />
                          ) : (
                            governorate.name_ar
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          {editingRowId === governorate.id ? (
                            <TextField
                              size="small"
                              type="number"
                              value={editingRowData.shipping_cost}
                              onChange={(e) =>
                                setEditingRowData({
                                  ...editingRowData,
                                  shipping_cost: e.target.value
                                })
                              }
                              inputProps={{ step: '0.01', min: '0' }}
                              sx={{ width: '120px' }}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">EGP</InputAdornment>
                              }}
                            />
                          ) : (
                            `EGP ${parseFloat(governorate.shipping_cost).toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {editingRowId === governorate.id ? (
                            <Switch
                              checked={editingRowData.is_active}
                              onChange={(e) =>
                                setEditingRowData({
                                  ...editingRowData,
                                  is_active: e.target.checked
                                })
                              }
                              color="primary"
                            />
                          ) : (
                            <Tooltip title={governorate.is_active ? 'Click to deactivate' : 'Click to activate'}>
                              <Switch
                                checked={governorate.is_active}
                                onChange={() => handleToggleActive(governorate.id, governorate.is_active)}
                                color="primary"
                                disabled={loading}
                              />
                            </Tooltip>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            {editingRowId === governorate.id ? (
                              <>
                                <Tooltip title="Save changes">
                                  <IconButton size="small" onClick={saveEditingRow} disabled={loading} sx={{ color: '#4caf50' }}>
                                    <SaveIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                  <IconButton size="small" onClick={cancelEditingRow} disabled={loading} sx={{ color: '#f44336' }}>
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            ) : (
                              <>
                                <Tooltip title="Edit inline">
                                  <IconButton
                                    size="small"
                                    onClick={() => startEditingRow(governorate)}
                                    disabled={loading}
                                    sx={{ color: '#f0a500' }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteGovernorate(governorate.id)}
                                    disabled={loading}
                                    sx={{ color: '#f44336' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f0a500', color: '#0f1111', fontWeight: 700 }}>
          {editingId ? 'Edit Governorate' : 'Add New Governorate'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="English Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
              size="small"
            />
            <TextField
              fullWidth
              label="Arabic Name"
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              error={!!formErrors.name_ar}
              helperText={formErrors.name_ar}
              size="small"
            />
            <TextField
              fullWidth
              label="Shipping Cost (EGP)"
              type="number"
              value={formData.shipping_cost}
              onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
              error={!!formErrors.shipping_cost}
              helperText={formErrors.shipping_cost}
              size="small"
              inputProps={{ step: '0.01', min: '0' }}
            />
            <FormControlLabel
              control={<Switch checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />}
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSaveGovernorate}
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#f0a500',
              color: '#0f1111',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#e0a000' }
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ShippingGovernoratesAdmin;
