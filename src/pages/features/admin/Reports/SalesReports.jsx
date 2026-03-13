import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Alert,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { adminService } from 'api';

export default function SalesReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);
  
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSalesReport(startDate, endDate);
      
      if (response.success) {
        setSalesData(response.data.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const handleGenerateReport = () => {
    fetchSalesReport();
  };

  const calculateTotals = () => {
    const totals = salesData.reduce(
      (acc, item) => ({
        orders: acc.orders + parseInt(item.total_orders || 0),
        revenue: acc.revenue + parseFloat(item.total_revenue || 0),
        items: acc.items + parseInt(item.total_items_sold || 0)
      }),
      { orders: 0, revenue: 0, items: 0 }
    );

    return totals;
  };

  const totals = calculateTotals();

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h2" sx={{ mb: 3 }}>
            Sales Reports
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Generate Report
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleGenerateReport}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Generate Report'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h3">
                    {totals.orders}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h3">
                    {totals.revenue.toFixed(2)} EGP
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Items Sold
                  </Typography>
                  <Typography variant="h3">
                    {totals.items}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Sales Data Table */}
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Daily Sales
              </Typography>

              {salesData.length === 0 ? (
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  No sales data for the selected period
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Orders</TableCell>
                        <TableCell align="right">Revenue (EGP)</TableCell>
                        <TableCell align="right">Avg Order Value (EGP)</TableCell>
                        <TableCell align="right">Items Sold</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {salesData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(item.sale_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="right">
                            {item.total_orders}
                          </TableCell>
                          <TableCell align="right">
                            {parseFloat(item.total_revenue || 0).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            {parseFloat(item.average_order_value || 0).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            {item.total_items_sold}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

