import { useEffect, useState } from 'react';
import {
  Box,
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
  Alert,
  TablePagination,
  Rating,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Autocomplete,
  Tooltip,
  Divider,
  Stack,
  Avatar,
  CircularProgress
} from '@mui/material';
import { TickCircle, CloseCircle, Eye, Trash, Add, Star1, MessageText } from 'iconsax-react';
import { adminService } from 'api';

// ─── Stats Card ───────────────────────────────────────────────
function StatsCard({ label, value, color = 'primary.main', icon }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            <Typography variant="h3" color={color} fontWeight={700}>
              {value ?? 0}
            </Typography>
          </Box>
          <Box sx={{ color, opacity: 0.15, fontSize: 48 }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function ReviewsList() {
  const [reviews, setReviews]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [page, setPage]                   = useState(0);
  const [rowsPerPage, setRowsPerPage]     = useState(10);
  const [totalReviews, setTotalReviews]   = useState(0);
  const [tabValue, setTabValue]           = useState('all');   // all | pending | approved
  const [stats, setStats]                 = useState({ all: 0, pending: 0, approved: 0 });

  // View dialog
  const [openDialog, setOpenDialog]       = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // Add Review dialog
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [products, setProducts]           = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [newReview, setNewReview]         = useState({
    product_id: '',
    rating: 5,
    title: '',
    comment: '',
    reviewer_email: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addError, setAddError]           = useState('');

  // Delete confirm
  const [deleteId, setDeleteId]           = useState(null);
  const [deleting, setDeleting]           = useState(false);

  // ── Fetch ──
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllReviews(page + 1, rowsPerPage, tabValue);
      if (response.success) {
        setReviews(response.data.reviews || []);
        setTotalReviews(response.data.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [all, pending, approved] = await Promise.all([
        adminService.getAllReviews(1, 1, 'all'),
        adminService.getAllReviews(1, 1, 'pending'),
        adminService.getAllReviews(1, 1, 'approved')
      ]);
      setStats({
        all:      all.data?.pagination?.total     || 0,
        pending:  pending.data?.pagination?.total  || 0,
        approved: approved.data?.pagination?.total || 0
      });
    } catch (_) {}
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await adminService.getProducts(1, 200);
      if (res.success) setProducts(res.data?.products || []);
    } catch (_) {}
    finally { setLoadingProducts(false); }
  };

  useEffect(() => { fetchReviews(); }, [page, rowsPerPage, tabValue]);
  useEffect(() => { fetchStats(); }, []);

  // ── Pagination ──
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  // ── Tab ──
  const handleTabChange = (_, v) => { setTabValue(v); setPage(0); };

  // ── View dialog ──
  const handleOpenDialog = (review) => { setSelectedReview(review); setOpenDialog(true); };
  const handleCloseDialog = () => { setOpenDialog(false); setSelectedReview(null); };

  // ── Approve / Reject ──
  const handleApprove = async (reviewId) => {
    try {
      await adminService.approveReview(reviewId);
      fetchReviews(); fetchStats();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleReject = async (reviewId) => {
    try {
      await adminService.rejectReview(reviewId);
      fetchReviews(); fetchStats();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await adminService.deleteReview(deleteId);
      setDeleteId(null);
      fetchReviews(); fetchStats();
    } catch (err) { alert('Error: ' + err.message); }
    finally { setDeleting(false); }
  };

  // ── Add Review ──
  const handleOpenAdd = () => {
    fetchProducts();
    setNewReview({ product_id: '', rating: 5, title: '', comment: '', reviewer_email: '' });
    setAddError('');
    setOpenAddDialog(true);
  };

  const handleSubmitReview = async () => {
    setAddError('');
    if (!newReview.product_id) { setAddError('Please select a product.'); return; }
    if (!newReview.comment || newReview.comment.length < 5) { setAddError('Comment must be at least 5 characters.'); return; }

    try {
      setSubmittingReview(true);
      const res = await adminService.createAdminReview({
        product_id:     newReview.product_id,
        rating:         newReview.rating,
        title:          newReview.title,
        comment:        newReview.comment,
        reviewer_email: newReview.reviewer_email || undefined
      });
      if (res.success) {
        setOpenAddDialog(false);
        fetchReviews(); fetchStats();
      } else {
        setAddError(res.message || 'Failed to create review.');
      }
    } catch (err) {
      setAddError(err.response?.data?.message || err.message || 'Failed to create review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── Status badge ──
  const StatusChip = ({ approved }) =>
    approved == 1
      ? <Chip label="Approved" color="success" size="small" />
      : <Chip label="Pending"  color="warning" size="small" />;

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h2">Reviews Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add size={18} />}
          onClick={handleOpenAdd}
          sx={{ borderRadius: 2 }}
        >
          Add Review
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Stats */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <StatsCard label="Total Reviews"    value={stats.all}      color="primary.main"  icon={<Star1 />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard label="Pending Approval" value={stats.pending}  color="warning.main"  icon={<MessageText />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard label="Approved"         value={stats.approved} color="success.main"  icon={<TickCircle />} />
        </Grid>
      </Grid>

      {/* Table Card */}
      <Card>
        <CardContent>
          {/* Tabs */}
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label={`All (${stats.all})`}          value="all"      />
            <Tab label={`Pending (${stats.pending})`}  value="pending"  />
            <Tab label={`Approved (${stats.approved})`} value="approved" />
          </Tabs>

          {loading && reviews.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : reviews.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
              No reviews found.
            </Typography>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Comment</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {review.product_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: 13 }}>
                              {review.first_name?.[0] || '?'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {review.first_name} {review.last_name}
                              </Typography>
                              {review.email && (
                                <Typography variant="caption" color="text.secondary">
                                  {review.email}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Rating value={Number(review.rating)} readOnly size="small" />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 220 }}>
                          <Typography
                            variant="body2"
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}
                          >
                            {review.comment}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip approved={review.is_approved} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(review.created_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" justifyContent="center" gap={0.5}>
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={() => handleOpenDialog(review)}>
                                <Eye size={18} />
                              </IconButton>
                            </Tooltip>
                            {review.is_approved != 1 && (
                              <Tooltip title="Approve">
                                <IconButton size="small" color="success" onClick={() => handleApprove(review.id)}>
                                  <TickCircle size={18} />
                                </IconButton>
                              </Tooltip>
                            )}
                            {review.is_approved == 1 && (
                              <Tooltip title="Reject">
                                <IconButton size="small" color="warning" onClick={() => handleReject(review.id)}>
                                  <CloseCircle size={18} />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => setDeleteId(review.id)}>
                                <Trash size={18} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={totalReviews}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* ═══ View Dialog ═══ */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Review Details</DialogTitle>
        <DialogContent dividers>
          {selectedReview && (
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block">Product</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedReview.product_name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block">Customer</Typography>
                <Typography variant="body1">{selectedReview.first_name} {selectedReview.last_name}</Typography>
                {selectedReview.email && (
                  <Typography variant="body2" color="text.secondary">{selectedReview.email}</Typography>
                )}
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">Rating</Typography>
                <Rating value={Number(selectedReview.rating)} readOnly />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">Status</Typography>
                <StatusChip approved={selectedReview.is_approved} />
              </Grid>
              {selectedReview.title && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" display="block">Title</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedReview.title}</Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block">Comment</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{selectedReview.comment}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">Verified Purchase</Typography>
                <Chip
                  label={selectedReview.is_verified_purchase ? 'Yes' : 'No'}
                  color={selectedReview.is_verified_purchase ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">Date</Typography>
                <Typography variant="body2">{new Date(selectedReview.created_at).toLocaleString()}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {selectedReview && selectedReview.is_approved != 1 && (
            <Button variant="contained" color="success" onClick={() => { handleApprove(selectedReview.id); handleCloseDialog(); }}>
              Approve
            </Button>
          )}
          {selectedReview && selectedReview.is_approved == 1 && (
            <Button variant="outlined" color="warning" onClick={() => { handleReject(selectedReview.id); handleCloseDialog(); }}>
              Reject
            </Button>
          )}
          {selectedReview && (
            <Button variant="contained" color="error" onClick={() => { setDeleteId(selectedReview.id); handleCloseDialog(); }}>
              Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ═══ Add Review Dialog ═══ */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={1}>
            <Add size={20} />
            Add Review
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            {addError && (
              <Grid item xs={12}>
                <Alert severity="error">{addError}</Alert>
              </Grid>
            )}

            {/* Product */}
            <Grid item xs={12}>
              <Autocomplete
                options={products}
                loading={loadingProducts}
                getOptionLabel={(o) => o.name || ''}
                onChange={(_, val) => setNewReview(p => ({ ...p, product_id: val?.id || '' }))}
                renderInput={(params) => (
                  <TextField {...params} label="Product *" placeholder="Search product..." fullWidth />
                )}
              />
            </Grid>

            {/* Reviewer email (optional) */}
            <Grid item xs={12}>
              <TextField
                label="Reviewer Email (optional)"
                placeholder="If empty, review will be posted as admin"
                fullWidth
                value={newReview.reviewer_email}
                onChange={(e) => setNewReview(p => ({ ...p, reviewer_email: e.target.value }))}
              />
            </Grid>

            {/* Rating */}
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" mb={0.5}>Rating *</Typography>
              <Rating
                value={newReview.rating}
                onChange={(_, val) => setNewReview(p => ({ ...p, rating: val || 5 }))}
                size="large"
              />
            </Grid>

            {/* Title */}
            <Grid item xs={12}>
              <TextField
                label="Title (optional)"
                fullWidth
                value={newReview.title}
                onChange={(e) => setNewReview(p => ({ ...p, title: e.target.value }))}
              />
            </Grid>

            {/* Comment */}
            <Grid item xs={12}>
              <TextField
                label="Comment *"
                multiline
                rows={4}
                fullWidth
                value={newReview.comment}
                onChange={(e) => setNewReview(p => ({ ...p, comment: e.target.value }))}
                helperText="Minimum 5 characters"
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info" sx={{ fontSize: 12 }}>
                Reviews added from the admin panel are <strong>auto-approved</strong> and will appear immediately on the product page.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} disabled={submittingReview}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={submittingReview}
            startIcon={submittingReview ? <CircularProgress size={16} /> : <Add size={16} />}
          >
            {submittingReview ? 'Submitting...' : 'Add Review'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ Delete Confirm Dialog ═══ */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to permanently delete this review? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <Trash size={16} />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
