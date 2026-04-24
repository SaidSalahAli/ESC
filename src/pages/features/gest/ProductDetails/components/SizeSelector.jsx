import { FormattedMessage } from 'react-intl';

export default function SizeSelector({ sizes, selectedSize, selectedColor, onSizeChange, getStockFromCombination }) {
  if (!selectedColor) {
    return null;
  }

  return (
    <div className="block" style={{ marginBottom: '1.5rem' }}>
      <div className="block-label">
        <FormattedMessage id="size" /> <span className="required">*</span>
        {selectedSize && <span style={{ fontWeight: 400, marginLeft: '0.5rem', color: '#666' }}>{selectedSize}</span>}
      </div>

      {sizes.length === 0 ? (
        <div style={{ color: '#ff9800', fontSize: '0.9rem', padding: '0.5rem', backgroundColor: '#fff3e0', borderRadius: '4px' }}>
          <FormattedMessage id="no-sizes-available" />
        </div>
      ) : (
        <div className="sizes-row">
          {sizes.map((size) => {
            const isSelected = selectedSize === size.value;
            const stockCount = getStockFromCombination(size.value, selectedColor.value);
            const isAvailable = stockCount > 0;

            return (
              <button
                key={size.id}
                onClick={() => isAvailable && onSizeChange(size.value)}
                className={`size-option ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                title={`${size.value}${isAvailable ? ` - ${stockCount} متوفر` : ' - غير متوفر'}`}
                disabled={!isAvailable}
                type="button"
              >
                {size.value}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
