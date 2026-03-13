import { useEffect, useState } from 'react';
import { Grid, Typography, Card, CardContent, Box } from '@mui/material';
import { adminService } from 'api';

// ==============================|| ADMIN DASHBOARD ||============================== //

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await adminService.getDashboard();
        
        if (response.success) {
          setDashboardData(response.data);
        } else {
          setError(response.message || 'Failed to load dashboard');
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  const summary = dashboardData?.summary || {};

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h2">Admin Dashboard</Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Welcome to ESC Wear Admin Panel
        </Typography>
      </Grid>

      {/* Statistics Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Customers
            </Typography>
            <Typography variant="h3">
              {summary.total_customers || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Products
            </Typography>
            <Typography variant="h3">
              {summary.total_products || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Orders
            </Typography>
            <Typography variant="h3">
              {summary.total_orders || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h3">
              {summary.total_revenue || 0} EGP
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Today's Stats */}
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Today's Orders
            </Typography>
            <Typography variant="h3">
              {summary.today_orders || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Today's Revenue
            </Typography>
            <Typography variant="h3">
              {summary.today_revenue || 0} EGP
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Pending Items */}
      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Pending Orders
            </Typography>
            <Typography variant="h3">
              {summary.pending_orders || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Pending Reviews
            </Typography>
            <Typography variant="h3">
              {summary.pending_reviews || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Products */}
      {dashboardData?.top_products && dashboardData.top_products.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Top Selling Products
              </Typography>
              {dashboardData.top_products.map((product, index) => (
                <Box key={product.id || index} sx={{ mb: 2 }}>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Sales: {product.sales_count} | Revenue: {product.total_revenue} EGP
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}

