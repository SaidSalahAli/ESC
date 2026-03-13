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
  DialogActions
} from '@mui/material';
import { TickCircle, CloseCircle, Eye } from 'iconsax-react';
import { adminService } from 'api';

export default function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalReviews, setTotalReviews] = useState(0);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingReviews(page + 1, rowsPerPage);
      
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

  useEffect(() => {
    fetchReviews();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (review) => {
    setSelectedReview(review);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReview(null);
  };

  const handleApprove = async (reviewId) => {
    try {
      await adminService.approveReview(reviewId);
      fetchReviews();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleReject = async (reviewId) => {
    if (window.confirm('Are you sure you want to reject this review?')) {
      try {
        await adminService.rejectReview(reviewId);
        fetchReviews();
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  if (loading && reviews.length === 0) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h2" sx={{ mb: 3 }}>
            Reviews Management
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Pending Reviews
              </Typography>

              {reviews.length === 0 ? (
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  No pending reviews
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
                          <TableCell>Date</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reviews.map((review) => (
                          <TableRow key={review.id}>
                            <TableCell>
                              <Typography variant="subtitle2">
                                {review.product_name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {review.first_name} {review.last_name}
                            </TableCell>
                            <TableCell>
                              <Rating value={review.rating} readOnly size="small" />
                            </TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2"
                                sx={{
                                  maxWidth: 200,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {review.comment}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {new Date(review.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenDialog(review)}
                              >
                                <Eye />
                              </IconButton>
                              <IconButton 
                                size="small"
                                color="success"
                                onClick={() => handleApprove(review.id)}
                              >
                                <TickCircle />
                              </IconButton>
                              <IconButton 
                                size="small"
                                color="error"
                                onClick={() => handleReject(review.id)}
                              >
                                <CloseCircle />
                              </IconButton>
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
        </Grid>
      </Grid>

      {/* Review Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Review Details</DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Product
                </Typography>
                <Typography variant="body1">
                  {selectedReview.product_name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Customer
                </Typography>
                <Typography variant="body1">
                  {selectedReview.first_name} {selectedReview.last_name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedReview.email}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Rating
                </Typography>
                <Rating value={selectedReview.rating} readOnly />
              </Grid>
              {selectedReview.title && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Title
                  </Typography>
                  <Typography variant="body1">
                    {selectedReview.title}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Comment
                </Typography>
                <Typography variant="body1">
                  {selectedReview.comment}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Verified Purchase
                </Typography>
                <Chip 
                  label={selectedReview.is_verified_purchase ? 'Yes' : 'No'}
                  color={selectedReview.is_verified_purchase ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button 
            onClick={() => {
              handleApprove(selectedReview.id);
              handleCloseDialog();
            }}
            variant="contained"
            color="success"
          >
            Approve
          </Button>
          <Button 
            onClick={() => {
              handleReject(selectedReview.id);
              handleCloseDialog();
            }}
            variant="contained"
            color="error"
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

