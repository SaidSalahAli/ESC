import { FormattedMessage } from 'react-intl';
import { getImageUrl } from 'utils/imageHelper';

export default function ColorSelector({ selectedColor, colors, onColorChange, getAvailableSizesForColor, product }) {
  return (
    <div className="block" style={{ marginBottom: '1.5rem' }}>
      <div className="block-label">
        <FormattedMessage id="color" /> <span className="required">*</span>
        {selectedColor && <span style={{ fontWeight: 400, marginLeft: '0.5rem', color: '#666' }}>{selectedColor.value}</span>}
      </div>

      {colors.length === 0 ? (
        <div style={{ color: '#ff9800', fontSize: '0.9rem', padding: '0.5rem', backgroundColor: '#fff3e0', borderRadius: '4px' }}>
          <FormattedMessage id="no-colors-available" />
        </div>
      ) : (
        <div className="colors-row">
          {colors.map((color) => {
            const isSelected = selectedColor?.id === color.id;
            const availableSizes = getAvailableSizesForColor(color.value, product);
            const isAvailable = availableSizes.length > 0;

            // Find the first image with this color value
            const colorImage = product?.images?.find((img) => img.color_value === color.value);
            const imageUrl = colorImage ? getImageUrl(colorImage.image_url) : null;
            const fallbackColor = color?.hex || color?.value || '#000000';

            return (
              <button
                key={color.id}
                onClick={() => isAvailable && onColorChange(color)}
                className={`color-swatch ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                title={`${color.value}${isAvailable ? ` - ${availableSizes.length} متوفر` : ' - غير متوفر'}`}
                disabled={!isAvailable}
                aria-label={color.value}
              >
                <div
                  className="swatch-circle"
                  style={{
                    backgroundImage: imageUrl ? `url('${imageUrl}')` : 'none',
                    backgroundColor: !imageUrl ? fallbackColor : 'transparent'
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
