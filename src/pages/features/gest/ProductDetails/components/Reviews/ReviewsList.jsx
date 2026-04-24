import { Star } from 'iconsax-react';
import { FormattedMessage } from 'react-intl';

function ReviewsList({ reviews }) {
  return (
    <div className="reviews-list">
      {reviews.map((review) => (
        <div className="review-card" key={review.id}>
          <div className="review-header">
            <div>
              <div className="review-name">
                {review.first_name} {review.last_name}
              </div>
              <div className="stars small">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size="16"
                    variant={star <= review.rating ? 'Bold' : 'Outline'}
                    color={star <= review.rating ? '#ffc107' : '#ddd'}
                  />
                ))}
              </div>
            </div>
            <div className="review-date">{new Date(review.created_at).toLocaleDateString()}</div>
          </div>

          {review.title && <h4 className="review-title">{review.title}</h4>}
          <p className="review-comment">{review.comment}</p>

          {review.is_verified_purchase && (
            <div className="verified-pill">
              ✓ <FormattedMessage id="verified-purchase" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ReviewsList;
