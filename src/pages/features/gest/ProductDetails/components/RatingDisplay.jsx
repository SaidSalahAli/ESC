import { Star } from "iconsax-react";
import { FormattedMessage } from "react-intl";

export default function RatingDisplay({ reviewStats }) {
  return (
    <div className="rating-row">
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size="18"
            variant={star <= Math.round(reviewStats.average_rating || 0) ? 'Bold' : 'Outline'}
            color={star <= Math.round(reviewStats.average_rating || 0) ? '#ffc107' : '#ddd'}
          />
        ))}
      </div>
      <span className="rating-text">
        {parseFloat(reviewStats.average_rating || 0).toFixed(1)} • {reviewStats.total_reviews || 0}{' '}
        {reviewStats.total_reviews === 1 ? <FormattedMessage id="review" /> : <FormattedMessage id="reviews" />}
      </span>
    </div>
  );
}
