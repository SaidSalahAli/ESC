import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl, FormattedMessage } from 'react-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, GetApp as ExportIcon, Search as SearchIcon } from '@mui/icons-material';
import { newsletterService } from 'api/newsletter';
import { openSnackbar } from 'api/snackbar';
import './NewsletterManagement.css';

export default function NewsletterManagement() {
  const navigate = useNavigate();
  const intl = useIntl();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    limit: 20,
    offset: 0
  });

  useEffect(() => {
    fetchSubscribers();
  }, [searchTerm, filterActive]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const params = {
        limit: pagination.limit,
        offset: pagination.offset
      };
      if (searchTerm) params.search = searchTerm;
      if (filterActive !== '') params.is_active = filterActive === 'true' ? 1 : 0;

      const response = await newsletterService.getAllSubscribers(params);

      if (response.success && response.data) {
        // Extract the subscribers array from response.data
        const subscribersArray = response.data.data || [];
        setSubscribers(Array.isArray(subscribersArray) ? subscribersArray : []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        setSubscribers([]);
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setSubscribers([]);
      openSnackbar({
        open: true,
        message: 'Failed to load subscribers',
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, email) => {
    setDeleteConfirm({ id, email });
  };

  const confirmDelete = async () => {
    try {
      const response = await newsletterService.deleteSubscriber(deleteConfirm.id);

      if (response.success) {
        openSnackbar({
          open: true,
          message: 'Subscriber deleted successfully',
          variant: 'alert',
          alert: { color: 'success' }
        });

        setDeleteConfirm(null);
        fetchSubscribers();
      }
    } catch (err) {
      console.error('Error deleting subscriber:', err);
      openSnackbar({
        open: true,
        message: 'Failed to delete subscriber',
        variant: 'alert',
        alert: { color: 'error' }
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await newsletterService.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      openSnackbar({
        open: true,
        message: 'CSV exported successfully',
        variant: 'alert',
        alert: { color: 'success' }
      });
    } catch (err) {
      console.error('Error exporting CSV:', err);
      openSnackbar({
        open: true,
        message: 'Failed to export CSV',
        variant: 'alert',
        alert: { color: 'error' }
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await newsletterService.exportExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      openSnackbar({
        open: true,
        message: 'Excel exported successfully',
        variant: 'alert',
        alert: { color: 'success' }
      });
    } catch (err) {
      console.error('Error exporting Excel:', err);
      openSnackbar({
        open: true,
        message: 'Failed to export Excel',
        variant: 'alert',
        alert: { color: 'error' }
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
          <FormattedMessage id="newsletter-management" defaultMessage="Newsletter Management" />
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Subscribers
              </Typography>
              <Typography variant="h5">{pagination.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active
              </Typography>
              <Typography variant="h5" sx={{ color: 'success.main' }}>
                {pagination.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inactive
              </Typography>
              <Typography variant="h5" sx={{ color: 'error.main' }}>
                {pagination.inactive}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                <Button size="small" variant="outlined" startIcon={<ExportIcon />} onClick={handleExportCSV}>
                  CSV
                </Button>
                <Button size="small" variant="outlined" startIcon={<ExportIcon />} onClick={handleExportExcel}>
                  Excel
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
          }}
        />
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </Box>

      {/* Subscribers Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No subscribers found
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id} hover>
                    <TableCell>{subscriber.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={subscriber.is_active ? 'Active' : 'Inactive'}
                        color={subscriber.is_active ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{new Date(subscriber.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(subscriber.id, subscriber.email)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete {deleteConfirm?.email}?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
