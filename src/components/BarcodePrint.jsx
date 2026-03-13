import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Box, Button, Paper, Typography, Divider } from '@mui/material';
import { Printer } from 'iconsax-react';
import { printLabel } from 'utils/printLabel';

export default function BarcodePrint({ product, onClose }) {
  const svgRef = useRef(null);

  // ── Preview barcode on screen ──────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current || !product?.barcode) return;
    const value = product.barcode.toString().trim();
    if (!value) return;
    const fmt = value.length === 13 ? 'EAN13' : 'CODE128';
    try {
      JsBarcode(svgRef.current, value, {
        format: fmt,
        width: 2,
        height: 55,
        displayValue: true,
        fontSize: 13,
        margin: 6,
        background: '#ffffff',
        lineColor: '#000000',
        valid: (ok) => {
          if (!ok && fmt === 'EAN13') {
            try {
              JsBarcode(svgRef.current, value, {
                format: 'CODE128',
                width: 2,
                height: 55,
                displayValue: true,
                fontSize: 13,
                margin: 6,
                background: '#ffffff',
                lineColor: '#000000'
              });
            } catch (e) {
              console.error(e);
            }
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
  }, [product?.barcode, product?.id]);

  const handlePrint = () => {
    printLabel([
      {
        title: product.name,
        barcode: product.barcode.toString().trim(),
        meta: [product.sku && `SKU: ${product.sku}`, product.price && `${product.price} EGP`].filter(Boolean).join('  |  ')
      }
    ]);
  };

  if (!product?.barcode) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">No barcode available for this product</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* ── Screen preview (mimics label proportions) ── */}
      <Paper
        variant="outlined"
        sx={{
          maxWidth: 300,
          mx: 'auto',
          p: 2,
          borderRadius: 2,
          textAlign: 'center',
          aspectRatio: '75 / 50',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" noWrap sx={{ maxWidth: '100%' }}>
          {product.name}
        </Typography>
        <Box sx={{ my: 0.5 }}>
          <svg ref={svgRef} style={{ maxWidth: '100%' }} />
        </Box>
        {product.sku && (
          <Typography variant="caption" color="textSecondary">
            SKU: {product.sku}
          </Typography>
        )}
        <Typography variant="caption" color="textSecondary">
          {product.price} EGP
        </Typography>
      </Paper>

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
