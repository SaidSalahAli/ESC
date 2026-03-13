import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Printer } from 'iconsax-react';

/**
 * Barcode Print Component
 * Displays and prints barcode for a product
 */
function BarcodePrint({ product, onClose }) {
  const barcodeRef = useRef(null);

  useEffect(() => {
    // Use a small delay to ensure the DOM is ready
    const timer = setTimeout(() => {
      if (barcodeRef.current && product?.barcode) {
        try {
          console.log('Generating barcode for:', product.barcode);
          
          // Clear previous barcode
          barcodeRef.current.innerHTML = '';
          
          // Create SVG element
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          barcodeRef.current.appendChild(svg);
          
          // Generate barcode
          // Use CODE128 format for better compatibility (works with any length)
          // EAN13 requires exactly 13 digits
          const barcodeValue = product.barcode.toString().trim();
          
          // Validate barcode value
          if (!barcodeValue || barcodeValue.length === 0) {
            console.error('Invalid barcode value');
            return;
          }
          
          const format = barcodeValue.length === 13 ? 'EAN13' : 'CODE128';
          console.log('Using format:', format, 'for barcode:', barcodeValue);
          
          JsBarcode(svg, barcodeValue, {
            format: format,
            width: 2,
            height: 80,
            displayValue: true,
            fontSize: 16,
            margin: 10,
            background: '#ffffff',
            lineColor: '#000000',
            valid: function(valid) {
              if (!valid) {
                console.error('Invalid barcode format');
                // Fallback to CODE128 if EAN13 fails
                if (format === 'EAN13') {
                  try {
                    barcodeRef.current.innerHTML = '';
                    const svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    barcodeRef.current.appendChild(svg2);
                    JsBarcode(svg2, barcodeValue, {
                      format: 'CODE128',
                      width: 2,
                      height: 80,
                      displayValue: true,
                      fontSize: 16,
                      margin: 10,
                      background: '#ffffff',
                      lineColor: '#000000'
                    });
                  } catch (e) {
                    console.error('Fallback barcode generation failed:', e);
                  }
                }
              } else {
                console.log('Barcode generated successfully');
              }
            }
          });
        } catch (error) {
          console.error('Error generating barcode:', error);
          // Show error message
          if (barcodeRef.current) {
            barcodeRef.current.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
          }
        }
      } else {
        console.log('Barcode ref or product barcode not available', {
          hasRef: !!barcodeRef.current,
          hasBarcode: !!product?.barcode
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [product?.barcode, product?.id]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const barcodeSvg = barcodeRef.current?.innerHTML || '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode - ${product?.name || 'Product'}</title>
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
            .product-info {
              text-align: center;
              margin-top: 10px;
              font-size: 10px;
            }
            .product-info div {
              margin: 2px 0;
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            <div class="barcode-label">
              <strong>${product.name}</strong>
            </div>
            <div class="barcode-svg">
              ${barcodeSvg}
            </div>
            <div class="product-info">
              <div>SKU: ${product.sku || 'N/A'}</div>
              <div>Price: ${product.price} EGP</div>
              <div>Barcode: ${product.barcode}</div>
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

  if (!product || !product.barcode) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">No barcode available for this product</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          {product.name}
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
          Barcode: {product.barcode}
        </Typography>
        
        {product.sku && (
          <Typography variant="body2" color="textSecondary" gutterBottom>
            SKU: {product.sku}
          </Typography>
        )}
        
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

export default BarcodePrint;

