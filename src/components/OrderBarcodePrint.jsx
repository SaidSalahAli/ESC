import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Printer } from 'iconsax-react';

/**
 * Order Barcode Print Component
 * Displays and prints barcode for an order
 */
function OrderBarcodePrint({ order, onClose }) {
  const barcodeRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (barcodeRef.current && order?.order_number) {
        try {
          const barcodeValue = order.order_number.toString().trim();
          
          if (!barcodeValue || barcodeValue.length === 0) {
            console.error('Invalid order number');
            return;
          }
          
          barcodeRef.current.innerHTML = '';
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          barcodeRef.current.appendChild(svg);
          
          JsBarcode(svg, barcodeValue, {
            format: 'CODE128',
            width: 2,
            height: 80,
            displayValue: true,
            fontSize: 16,
            margin: 10,
            background: '#ffffff',
            lineColor: '#000000'
          });
        } catch (error) {
          console.error('Error generating barcode:', error);
          if (barcodeRef.current) {
            barcodeRef.current.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
          }
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [order?.order_number]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const barcodeSvg = barcodeRef.current?.innerHTML || '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Order Barcode - ${order?.order_number || 'Order'}</title>
          <style>
            @media print {
              @page {
                size: 3.5in 2in;
                margin: 0.2in;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
              }
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .barcode-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 100%;
            }
            .barcode-label {
              text-align: center;
              margin-bottom: 10px;
              font-size: 12px;
              font-weight: bold;
            }
            .barcode-svg {
              margin: 0 auto;
              text-align: center;
            }
            .barcode-svg svg {
              max-width: 100%;
              height: auto;
            }
            .order-info {
              text-align: center;
              margin-top: 10px;
              font-size: 10px;
            }
            .order-info div {
              margin: 2px 0;
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            <div class="barcode-label">
              <strong>Order: ${order.order_number}</strong>
            </div>
            <div class="barcode-svg">
              ${barcodeSvg}
            </div>
            <div class="order-info">
              <div>Order Number: ${order.order_number}</div>
              <div>Date: ${new Date(order.created_at).toLocaleDateString()}</div>
              <div>Total: ${order.total} ${order.currency || 'EGP'}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (!order || !order.order_number) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">No order number available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Order: {order.order_number}
        </Typography>
        
        <Box sx={{ 
          my: 2, 
          display: 'flex', 
          justifyContent: 'center',
          minHeight: '120px',
          alignItems: 'center'
        }}>
          <div 
            ref={barcodeRef}
            style={{
              minWidth: '300px',
              minHeight: '100px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          ></div>
        </Box>
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Order Number: {order.order_number}
        </Typography>
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Date: {new Date(order.created_at).toLocaleDateString()}
        </Typography>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Printer />}
            onClick={handlePrint}
            sx={{ minWidth: 150 }}
          >
            Print Barcode
          </Button>
          {onClose && (
            <Button variant="outlined" onClick={onClose}>
              Close
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default OrderBarcodePrint;






