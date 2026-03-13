import React, { useEffect, useRef } from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';
import { Printer } from 'iconsax-react';
import JsBarcode from 'jsbarcode';

export default function OrderInvoicePrint({ orderDetails, onClose }) {
  const barcodeRef = useRef(null);

  const handlePrint = () => {
    setTimeout(() => window.print(), 100);
  };

  useEffect(() => {
    if (barcodeRef.current && orderDetails?.barcode) {
      try {
        JsBarcode(barcodeRef.current, orderDetails.barcode, {
          format: 'CODE128',
          width: 1.5,
          height: 50,
          displayValue: true,
          fontSize: 11,
          margin: 5
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [orderDetails?.barcode]);

  useEffect(() => {
    const before = () => {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    };
    const after = () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);

  if (!orderDetails) return <Typography>No order details available</Typography>;

  const addr = orderDetails.shipping_address;
  const user = orderDetails.user;

  const addressLine = [addr?.address_line1, addr?.address_line2, addr?.city, addr?.state, addr?.country].filter(Boolean).join('، ');

  const paymentLabel = orderDetails.payment_method === 'cib_bank' ? 'CIB بطاقة بنكية' : 'الدفع عند الاستلام';

  const statusMap = {
    pending: 'قيد الانتظار',
    processing: 'جاري المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
    refunded: 'مسترجع'
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // cell style helper
  const cell = (extra = {}) => ({
    border: '1px solid #000',
    padding: '6px 8px',
    ...extra
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');

        .inv-root { font-family: 'Cairo', sans-serif; direction: rtl; }

        @media print {
          body * { visibility: hidden !important; }
          .invoice-print-area, .invoice-print-area * { visibility: visible !important; }
          .invoice-print-area {
            position: absolute !important;
            top: 0 !important; left: 0 !important;
            width: 100% !important;
            // padding: 10mm !important;
            margin: 0 !important;
          }
          .no-print { display: none !important; }
          @page { size: A4; margin: 10mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          table { page-break-inside: avoid; border-collapse: collapse !important; }
        }
      `}</style>

      <Box className="inv-root">
        {/* Toolbar */}
        <Box className="no-print" sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="contained" startIcon={<Printer />} onClick={handlePrint}>
            طباعة الفاتورة
          </Button>
          <Button variant="outlined" onClick={onClose}>
            إغلاق
          </Button>
        </Box>

        {/* ===== INVOICE ===== */}
        <Box
          className="invoice-print-area"
          sx={{
            backgroundColor: '#fff',
            border: '1px solid #000',
            fontFamily: "'Poppins', sans-serif"
            // direction: 'rtl'
          }}
        >
          {/* ── ROW 1: Logo | Barcode ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '2px solid #000' }}>
            <tbody>
              <tr>
                {/* Logo cell */}
                <td
                  style={{
                    ...cell({ borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderLeft: 'none', width: '35%' }),
                    borderRight: '2px solid #000'
                  }}
                >
                  <Typography sx={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: '1.6rem', letterSpacing: 1 }}>ESC WEAR</Typography>
                  <Typography sx={{ fontFamily: 'Cairo', fontSize: '0.7rem', color: '#555' }}>فاتورة / Invoice</Typography>
                </td>
                {/* Barcode cell */}
                <td style={{ padding: '6px 12px', textAlign: 'center' }}>
                  <svg ref={barcodeRef} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── ROW 2: العميل | المدينة | التاريخ ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '1px solid #000' }}>
            <tbody>
              <tr>
                <td style={{ ...cell({ width: '34%', borderTop: 'none', borderRight: 'none' }), borderLeft: '1px solid #000' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>العميل:</span>
                  <br />
                  الاسم : <span style={{ fontSize: '0.85rem' }}>{user ? `${user.first_name} ${user.last_name}` : '—'}</span>
                  {user?.phone && (
                    <>
                      <br />
                      رقم الهاتف : <span style={{ fontSize: '0.78rem', color: '#444' }}>{user.phone}</span>
                    </>
                  )}
                  {user?.email && (
                    <>
                      <br />
                      البريد الإلكتروني : <span style={{ fontSize: '0.72rem', color: '#666' }}>{user.email}</span>
                    </>
                  )}
                </td>
                <td style={{ ...cell({ width: '33%', borderTop: 'none' }), borderLeft: '1px solid #000' }}>
                  <br />
                  <span style={{ fontSize: '0.85rem', display: 'flex', gap: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>المدينة / المحافظة:</span>
                    <div>
                      <span style={{ fontSize: '0.85rem' }}>{addr?.city || '—'}</span>
                      {addr?.state && <span style={{ fontSize: '0.85rem' }}> / {addr.state}</span>}
                    </div>
                  </span>
                </td>
                <td style={{ ...cell({ width: '33%', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }) }}>
                  <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>التاريخ:</span>
                  <br />
                  <span style={{ fontSize: '0.85rem' }}>{formatDate(orderDetails.created_at)}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── ROW 3: العنوان | التسليم ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '1px solid #000' }}>
            <tbody>
              <tr>
                <td style={{ ...cell({ width: '50%', borderTop: 'none', borderRight: 'none' }), borderLeft: '1px solid #000' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>العنوان:</span>
                  <br />
                  <span style={{ fontSize: '0.82rem' }}>{addressLine || '—'}</span>
                  {addr?.postal_code && <span style={{ fontSize: '0.75rem', color: '#666' }}> - {addr.postal_code}</span>}
                </td>
                <td style={{ ...cell({ width: '50%', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }) }}>
                  <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>حالة التسليم:</span>
                  <br />
                  <span style={{ fontSize: '0.85rem' }}>{statusMap[orderDetails.status] || orderDetails.status}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── ROW 4: order note | تاريخ الإشعار | طريقة الدفع ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '2px solid #000' }}>
            <tbody>
              <tr>
                <td style={{ ...cell({ width: '40%', borderTop: 'none', borderRight: 'none' }), borderLeft: '1px solid #000' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>Order Note:</span>
                  <br />
                  <span style={{ fontSize: '0.82rem', color: '#444' }}>{orderDetails.notes || '—'}</span>
                </td>
                <td style={{ ...cell({ width: '30%', borderTop: 'none' }), borderLeft: '1px solid #000' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>تاريخ الإشعار:</span>
                  <br />
                  <span style={{ fontSize: '0.82rem' }}>{formatDate(orderDetails.updated_at)}</span>
                </td>
                <td style={{ ...cell({ width: '30%', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }) }}>
                  <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>طريقة الدفع:</span>
                  <br />
                  <span style={{ fontSize: '0.82rem' }}>{paymentLabel}</span>
                  <br />
                  <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>رقم الطلب:</span>
                  <span style={{ fontSize: '0.75rem', marginRight: 4 }}>{orderDetails.order_number}</span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── SECTION TITLE ── */}
          <Box sx={{ px: 1, py: '4px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #000' }}>
            <Typography sx={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: '0.85rem' }}>تفاصيل الفاتورة:</Typography>
          </Box>

          {/* ── ITEMS TABLE ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '2px solid #000' }}>
            <thead>
              <tr style={{ backgroundColor: '#ececec' }}>
                <th style={{ ...cell({ borderTop: 'none', borderRight: 'none', textAlign: 'right', fontSize: '0.8rem' }) }}>
                  Item / المنتج
                </th>
                <th style={{ ...cell({ borderTop: 'none', width: '12%', textAlign: 'center', fontSize: '0.8rem' }) }}>الكمية</th>
                <th style={{ ...cell({ borderTop: 'none', width: '18%', textAlign: 'center', fontSize: '0.8rem' }) }}>السعر</th>
              </tr>
            </thead>
            <tbody>
              {(orderDetails.items || []).map((item, idx) => (
                <tr key={item.id || idx}>
                  <td style={{ ...cell({ borderRight: 'none', fontSize: '0.82rem' }) }}>
                    {item.product_name || `Product #${item.product_id}`}
                    {item.variant_name && <span style={{ display: 'block', fontSize: '0.72rem', color: '#666' }}>{item.variant_name}</span>}
                    {item.sku && <span style={{ display: 'block', fontSize: '0.68rem', color: '#888' }}>SKU: {item.sku}</span>}
                  </td>
                  <td style={{ ...cell({ textAlign: 'center', fontSize: '0.82rem' }) }}>{item.quantity}</td>
                  <td style={{ ...cell({ textAlign: 'center', fontSize: '0.82rem' }) }}>{parseFloat(item.price).toFixed(2)} ج</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── TOTALS SECTION ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {/* Row: subtotal label empty | subtotal value */}
              <tr>
                <td style={{ ...cell({ borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderLeft: 'none', width: '55%' }) }}>
                  {/* Left side: tracking / payment status */}
                  <Box sx={{ p: '4px 8px' }}>
                    {orderDetails.tracking_number && (
                      <Typography sx={{ fontFamily: 'Cairo', fontSize: '0.78rem' }}>
                        <strong>رقم التتبع:</strong> {orderDetails.tracking_number}
                      </Typography>
                    )}
                    <Typography sx={{ fontFamily: 'Cairo', fontSize: '0.78rem' }}>
                      <strong>حالة الدفع:</strong> {statusMap[orderDetails.payment_status] || orderDetails.payment_status}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Cairo', fontSize: '0.78rem' }}>
                      <strong>العملة:</strong> {orderDetails.currency || 'EGP'}
                    </Typography>
                  </Box>
                </td>
                <td style={{ ...cell({ borderTop: 'none', fontSize: '0.82rem', width: '25%' }) }}>الإجمالي</td>
              </tr>
              <tr>
                <td style={{ ...cell({ fontSize: '0.82rem' }) }}>مصاريف الشحن</td>
                <td style={{ ...cell({ borderLeft: 'none', textAlign: 'center', fontSize: '0.82rem' }) }}>
                  {parseFloat(orderDetails.shipping_cost || 0).toFixed(2)} ج
                </td>
              </tr>
              {parseFloat(orderDetails.discount || 0) > 0 && (
                <tr>
                  <td style={{ ...cell({ fontSize: '0.82rem', color: '#c00' }) }}>الخصم</td>
                  <td style={{ ...cell({ borderLeft: 'none', textAlign: 'center', fontSize: '0.82rem', color: '#c00' }) }}>
                    -{parseFloat(orderDetails.discount).toFixed(2)} ج
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ ...cell({ fontWeight: 700, fontSize: '0.9rem', backgroundColor: '#ececec' }) }}>المبالغ المطلوب للدفع</td>
                <td
                  style={{
                    ...cell({ borderLeft: 'none', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', backgroundColor: '#ececec' })
                  }}
                >
                  {parseFloat(orderDetails.total || 0).toFixed(2)} ج
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── Footer ── */}
          <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #ccc', textAlign: 'center', pb: 1 }}>
            <Typography sx={{ fontFamily: 'Cairo', fontSize: '0.75rem', color: '#555' }}>شكراً لتسوقك مع ESC WEAR</Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}
