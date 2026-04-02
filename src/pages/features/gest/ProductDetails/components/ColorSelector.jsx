import { FormattedMessage } from "react-intl";

export default function ColorSelector({ selectedColor, colors, onColorChange, getAvailableSizesForColor, getStockFromCombination, product }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontWeight: 600, marginBottom: '0.8rem' }}>
        <FormattedMessage id="color" /> <span style={{ color: '#d32f2f' }}>*</span>:
        {selectedColor && <span style={{ fontWeight: 400, marginLeft: '0.5rem', color: '#666' }}>{selectedColor.value}</span>}
      </div>

      {colors.length === 0 ? (
        <div style={{ color: '#f44336', fontSize: '0.9rem', padding: '0.5rem' }}>لا توجد ألوان متاحة</div>
      ) : (
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {colors.map((color) => {
            const bg = color?.hex || color?.value || '#000000';
            const isSelected = selectedColor?.id === color.id;

            // Check if this color has any available sizes
            const availableSizes = getAvailableSizesForColor(color.value, product);
            const hasStock = availableSizes.length > 0;

            return (
              <button
                key={color.id}
                onClick={() => onColorChange(color)}
                className={`color-pill ${isSelected ? 'selected' : ''} ${!hasStock ? 'out-of-stock' : ''}`}
                aria-label={color.value}
                title={`${color.value}${hasStock ? ` - ${availableSizes.length} أحجام متاحة` : ' - غير متوفر'}`}
                disabled={!hasStock}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '20px',
                  border: isSelected ? '2px solid #1976d2' : '1px solid #ccc',
                  backgroundColor: isSelected ? '#e3f2fd' : '#fff',
                  cursor: hasStock ? 'pointer' : 'not-allowed',
                  opacity: hasStock ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: bg,
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                    border: isSelected ? '2px solid #1976d2' : 'none'
                  }}
                />
                <span style={{ fontSize: '0.95rem' }}>{color.value}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}