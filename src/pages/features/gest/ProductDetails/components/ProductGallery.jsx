import { useEffect } from 'react';
import ImageZoom from '../../../../../components/ImageZoom';

export default function ProductGallery({
  allImages = [],
  mainImages = [],
  productName,
  selectedImageIndex,
  onImageSelect,
  onThumbnailSelect
}) {
  useEffect(() => {
    if (selectedImageIndex >= mainImages.length) {
      onImageSelect(0);
    }
  }, [mainImages, selectedImageIndex, onImageSelect]);

  const activeImage = mainImages[selectedImageIndex] || mainImages[0] || null;

  return (
    <div className="gallery">
      <div className="gallery-layout">
        {allImages.length > 1 && (
          <div className="gallery-thumbs vertical">
            {allImages.map((img, idx) => {
              const isActive = activeImage?.url === img.url;

              return (
                <button
                  key={img.id || idx}
                  onClick={() => {
                    if (onThumbnailSelect) {
                      onThumbnailSelect(img);
                      return;
                    }

                    const mainIndex = mainImages.findIndex((mainImg) => mainImg.url === img.url);
                    if (mainIndex !== -1) onImageSelect(mainIndex);
                  }}
                  className={`thumb-btn ${isActive ? 'active' : ''}`}
                  aria-label={`View image ${idx + 1}`}
                  type="button"
                >
                  <img src={img.url} alt={`${productName} thumb ${idx + 1}`} />
                </button>
              );
            })}
          </div>
        )}

        <div className="gallery-main">
          {activeImage ? <ImageZoom src={activeImage.url} alt={productName} /> : <div className="no-image">No image available</div>}
        </div>
      </div>
    </div>
  );
}
