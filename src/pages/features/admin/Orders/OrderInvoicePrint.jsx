import React, { useEffect, useRef } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Grid, Button } from '@mui/material';
import { Printer } from 'iconsax-react';
import JsBarcode from 'jsbarcode';

export default function OrderInvoicePrint({ orderDetails, onClose }) {
  const barcodeRef = useRef(null);

  const handlePrint = () => {
    // Small delay to ensure styles are applied
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Generate barcode
  useEffect(() => {
    if (barcodeRef.current && orderDetails?.order_number) {
      try {
        JsBarcode(barcodeRef.current, orderDetails.order_number, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
          margin: 10
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [orderDetails?.order_number]);

  // Add print event listeners
  useEffect(() => {
    const beforePrint = () => {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    };

    const afterPrint = () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
    };

    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);

    return () => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  if (!orderDetails) {
    return <Typography>No order details available</Typography>;
  }

  return (
    <>
      {/* Print Styles */}
      <style>
        {`
          @media print {
            /* Hide everything */
            body * {
              visibility: hidden !important;
            }
            
            /* Show only invoice area and its children */
            .invoice-print-container,
            .invoice-print-container * {
              visibility: visible !important;
            }
            
            /* Position invoice at top of page */
            .invoice-print-container {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 20px !important;
            }
            
            /* Hide print buttons */
            .no-print {
              display: none !important;
            }
            
            /* Page settings */
            @page {
              size: A4;
              margin: 15mm;
            }
            
            /* Ensure proper text rendering */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            /* Table styling for print */
            table {
              page-break-inside: avoid;
              border-collapse: collapse !important;
            }
            
            tr {
              page-break-inside: avoid;
            }
            
            /* Remove box shadows and borders that might not print well */
            .MuiCard-root,
            .MuiPaper-root {
              box-shadow: none !important;
              border: 1px solid #e0e0e0 !important;
            }
            
            /* Ensure barcode is visible */
            svg {
              max-width: 100% !important;
            }
          }
          
          @media screen {
            .invoice-print-container {
              min-height: 297mm; /* A4 height */
            }
          }
        `}
      </style>

      <Box>
        {/* Print Button - Hidden in print */}
        <Box className="no-print" sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" startIcon={<Printer />} onClick={handlePrint} sx={{ mr: 1 }}>
            طباعة الفاتورة
          </Button>
          <Button variant="outlined" onClick={onClose}>
            إغلاق
          </Button>
        </Box>

        {/* Invoice Content */}
        <Box
          className="invoice-print-container"
          sx={{
            p: 4,
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: 1
          }}
        >
          {/* Header with Barcode */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              فاتورة
            </Typography>

            {/* Barcode */}
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <svg ref={barcodeRef}></svg>
            </Box>

            <Typography variant="h6" color="textSecondary">
              رقم الطلب: {orderDetails.order_number}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              التاريخ:{' '}
              {new Date(orderDetails.created_at).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Customer & Shipping Information */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {/* Customer Info */}
            {orderDetails.user && (
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  معلومات العميل
                </Typography>
                <Typography variant="body1">
                  <strong>الاسم:</strong> {orderDetails.user.first_name} {orderDetails.user.last_name}
                </Typography>
                <Typography variant="body1">
                  <strong>البريد الإلكتروني:</strong> {orderDetails.user.email}
                </Typography>
                {orderDetails.user.phone && (
                  <Typography variant="body1">
                    <strong>الهاتف:</strong> {orderDetails.user.phone}
                  </Typography>
                )}
              </Grid>
            )}

            {/* Shipping Address */}
            {orderDetails.shipping_address && (
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  عنوان الشحن
                </Typography>
                <Typography variant="body1">
                  {orderDetails.shipping_address.first_name} {orderDetails.shipping_address.last_name}
                </Typography>
                <Typography variant="body1">{orderDetails.shipping_address.street_address}</Typography>
                {orderDetails.shipping_address.apartment && (
                  <Typography variant="body1">{orderDetails.shipping_address.apartment}</Typography>
                )}
                <Typography variant="body1">
                  {orderDetails.shipping_address.city}, {orderDetails.shipping_address.governorate} {orderDetails.shipping_address.postal_code}
                </Typography>
                <Typography variant="body1">{orderDetails.shipping_address.country}</Typography>
                {orderDetails.shipping_address.phone && (
                  <Typography variant="body1">
                    <strong>الهاتف:</strong> {orderDetails.shipping_address.phone}
                  </Typography>
                )}
              </Grid>
            )}
          </Grid>

          {/* Order Status & Payment Info */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                <strong>حالة الطلب:</strong> {orderDetails.status}
              </Typography>
              <Typography variant="body1">
                <strong>حالة الدفع:</strong> {orderDetails.payment_status}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                <strong>طريقة الدفع:</strong> {orderDetails.payment_method === 'cib_bank' ? 'بطاقة بنكية (CIB)' : 'الدفع عند الاستلام'}
              </Typography>
              {orderDetails.tracking_number && (
                <Typography variant="body1">
                  <strong>رقم التتبع:</strong> {orderDetails.tracking_number}
                </Typography>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Order Items Table */}
          {orderDetails.items && orderDetails.items.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                تفاصيل الطلب
              </Typography>
              <TableContainer>
                <Table sx={{ border: '1px solid #e0e0e0' }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}>المنتج</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}>
                        الكمية
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}>
                        السعر
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #e0e0e0' }}>
                        الإجمالي
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderDetails.items.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell sx={{ border: '1px solid #e0e0e0' }}>
                          <Typography variant="body1">{item.product_name || `Product ID: ${item.product_id}`}</Typography>
                          {item.variant_name && (
                            <Typography variant="caption" color="textSecondary" display="block">
                              {item.variant_name}
                            </Typography>
                          )}
                          {item.category_name && (
                            <Typography variant="caption" color="textSecondary" display="block">
                              التصنيف: {item.category_name}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ border: '1px solid #e0e0e0' }}>
                          {item.quantity}
                        </TableCell>
                        <TableCell align="center" sx={{ border: '1px solid #e0e0e0' }}>
                          {item.price} جنيه
                        </TableCell>
                        <TableCell align="center" sx={{ border: '1px solid #e0e0e0' }}>
                          {(item.price * item.quantity).toFixed(2)} جنيه
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Order Totals */}
          <Box sx={{ maxWidth: 400, ml: 'auto' }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1">المجموع الفرعي:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="right">
                  {orderDetails.subtotal} جنيه
                </Typography>
              </Grid>

              {orderDetails.shipping_cost > 0 && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body1">تكلفة الشحن:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">
                      {orderDetails.shipping_cost} جنيه
                    </Typography>
                  </Grid>
                </>
              )}

              {orderDetails.discount > 0 && (
                <>
                  <Grid item xs={6}>
                    <Typography variant="body1" color="error">
                      الخصم:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right" color="error">
                      -{orderDetails.discount} جنيه
                    </Typography>
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  الإجمالي:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" align="right" sx={{ fontWeight: 'bold' }}>
                  {orderDetails.total} جنيه
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Order Notes */}
          {orderDetails.notes && (
            <Box sx={{ mt: 4, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1, border: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                ملاحظات الطلب:
              </Typography>
              <Typography variant="body2">{orderDetails.notes}</Typography>
            </Box>
          )}

          {/* Footer */}
          <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              شكراً لتسوقك معنا!
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
              للاستفسارات، يرجى التواصل معنا
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}
