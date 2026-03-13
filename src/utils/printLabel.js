/**
 * printLabel(labels)
 * ─────────────────────────────────────────────────────────────────────────
 * Prints one 50mm × 25mm sticker per label on Xprinter.
 *
 * Xprinter driver settings:
 *   Width: 1.97 in (50mm)  |  Height: 0.98 in (25mm)
 *   Margins: None  |  Scale: 100%
 *
 * Each label object:
 * {
 *   brand?    : string  — top brand text   (default "ESC WEAR")
 *   title     : string  — bold main line   (product name / order number)
 *   subtitle? : string  — second line      (color • size / customer)
 *   barcode   : string  — barcode value
 *   meta?     : string  — tiny bottom line (SKU / price / phone)
 * }
 */
export function printLabel(labels = []) {
  if (!labels.length) return;

  const labelsHtml = labels
    .map(({ brand = 'ESC WEAR', title = '', subtitle = '', barcode, meta = '' }) => {
      const safeId = `bc_${barcode.replace(/[^a-zA-Z0-9]/g, '_')}`;
      return `
        <div class="label">
      
          <div class="title">${title}</div>
          ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
          <svg id="${safeId}" class="bc"></svg>
          ${meta ? `<div class="meta">${meta}</div>` : ''}
        </div>`;
    })
    .join('');

  const barcodeScripts = labels
    .map(({ barcode }) => {
      const safeId = `bc_${barcode.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const fmt = barcode.length === 13 ? 'EAN13' : 'CODE128';
      return `
        (function(){
          var el = document.getElementById("${safeId}");
          if (!el) return;
          try {
            JsBarcode(el, ${JSON.stringify(barcode)}, {
              format: "${fmt}",
              width: 1.6,       /* bar width — مناسب لـ 50mm */
              height: 28,       /* ارتفاع الباركود بالـ px */
              displayValue: true,
              fontSize: 8,      /* رقم الباركود تحته */
              margin: 1
            });
          } catch(e) {
            try {
              JsBarcode(el, ${JSON.stringify(barcode)}, {
                format: "CODE128",
                width: 1.6, height: 28,
                displayValue: true, fontSize: 8, margin: 1
              });
            } catch(e2) { console.error(e2); }
          }
        })();`;
    })
    .join('\n');

  const win = window.open('', '_blank', 'width=400,height=300');
  win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Labels</title>
<style>
  /* ── الحجم الحقيقي للورقة ── */
  @page {
    size: 50mm 25mm;
    margin: 0;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: Arial, 'Helvetica Neue', sans-serif;
    background: #fff;
    width: 50mm;
  }

  /* ── كل ستيكر ── */
  .label {
    width: 50mm;
    height: 25mm;
    padding: 1mm 1.5mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    page-break-after: always;
    overflow: hidden;
  }

  /* brand: ESC WEAR */
  .brand {
    font-size: 6px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #444;
    margin-bottom: 0.8mm;
  }

  /* اسم المنتج / رقم الطلب */
  .title {
    font-size: 8px;
    font-weight: 700;
    text-align: center;
    max-width: 47mm;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.5mm;
  }

  /* لون • مقاس / اسم العميل */
  .subtitle {
    font-size: 7px;
    color: #222;
    text-align: center;
    margin-bottom: 0.8mm;
  }

  /* SVG الباركود — يملأ عرض الستيكر */
  .bc {
    width: 47mm;
    height: auto;
    display: block;
  }

  /* SKU / سعر / تليفون */
  .meta {
    font-size: 6px;
    color: #555;
    margin-top: 0.8mm;
    text-align: center;
  }
</style>
</head>
<body>

${labelsHtml}

<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
<script>
window.onload = function () {
  ${barcodeScripts}
  setTimeout(function () { window.print(); }, 600);
};
</script>

</body>
</html>`);
  win.document.close();
}
