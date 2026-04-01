import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Printer } from 'iconsax-react';

function OrderBarcodePrint({ order, onClose }) {
  const barcodeRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!barcodeRef.current || !order?.order_number) return;
      try {
        const value = order.order_number.toString().trim();
        barcodeRef.current.innerHTML = '';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        barcodeRef.current.appendChild(svg);
        JsBarcode(svg, value, {
          format: 'CODE128',
          width: 3,
          height: 120,
          displayValue: true,
          fontSize: 18,
          margin: 8,
          background: '#ffffff',
          lineColor: '#000000'
        });
        svg.setAttribute('width', '100%');
        svg.removeAttribute('height');
      } catch (err) {
        console.error('Barcode error:', err);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [order?.order_number]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const barcodeSvg = barcodeRef.current?.innerHTML || '';
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Print - ${order?.order_number}</title>
  <style>
    @page { size: 50mm 25mm; margin: 0; }
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; width:50mm; height:25mm; display:flex; align-items:center; justify-content:center; }
    .container { width:50mm; height:25mm; padding:1mm; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .brand { font-size:6px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#444; margin-bottom:0.5mm; }
    .order-num { font-size:8px; font-weight:700; margin-bottom:0.5mm; }
    .bc-wrap { width:48mm; }
    .bc-wrap svg { width:100%; height:auto; display:block; }
    .order-info { font-size:6px; color:#000; margin-top:0.5mm; display:flex; flex-direction:column; align-items:center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="order-num">${order.order_number}</div>
    <div class="bc-wrap">${barcodeSvg}</div>
      <div class="order-info">
              <div>Date: ${new Date(order.created_at).toLocaleDateString()}</div>
              <div>Total: ${order.total} ${order.currency || 'EGP'}</div>
            </div>
  </div>
</body>
</html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  if (!order?.order_number) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">No order number available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper variant="outlined" sx={{ maxWidth: 340, mx: 'auto', p: 2, borderRadius: 2, textAlign: 'center' }}>
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: 2, color: '#888', textTransform: 'uppercase', mb: 0.5 }}>
          ESC WEAR
        </Typography>
        <Typography fontWeight="bold" sx={{ fontSize: '0.9rem', mb: 0.5 }}>
          {order.order_number}
        </Typography>
        <Box sx={{ width: '100%' }}>
          <div ref={barcodeRef} style={{ width: '100%' }} />
        </Box>
      </Paper>

      <Typography variant="caption" color="text.disabled" display="block" textAlign="center" sx={{ mt: 1, mb: 2 }}>
        ⚙️ Paper size: 50mm × 25mm — Margins: None
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Button variant="contained" startIcon={<Printer size={16} />} onClick={handlePrint}>
          طباعة الستيكر
        </Button>
        {onClose && (
          <Button variant="outlined" onClick={onClose}>
            إغلاق
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default OrderBarcodePrint;

