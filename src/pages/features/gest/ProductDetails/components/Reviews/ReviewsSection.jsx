import { DocumentText, Star, Star1 } from 'iconsax-react';
import { FormattedMessage, useIntl } from 'react-intl';

export default function ReviewsSection({
  reviews,
  reviewStats,
  loadingReviews,
  isLoggedIn,
  showReviewForm,
  reviewForm,
  submittingReview,
  onShowReviewForm,
  onReviewFormChange,
  onSubmitReview
}) {
  const intl = useIntl();

  return (
    <div className="product-reviews">
      <div className="product-reviews-inner">
        <h2 className="reviews-title">
          <Star1 size="24" />
          <FormattedMessage id="reviews-ratings" />
        </h2>

        {reviewStats && (
          <div className="reviews-summary">
            <div className="summary-score">
              <div className="score-value">{parseFloat(reviewStats.average_rating || 0).toFixed(1)}</div>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size="20"
                    variant={star <= Math.round(reviewStats.average_rating || 0) ? 'Bold' : 'Outline'}
                    color={star <= Math.round(reviewStats.average_rating || 0) ? '#ffc107' : '#ddd'}
                  />
                ))}
              </div>
              <div className="summary-text">
                {reviewStats.total_reviews || 0}{' '}
                {reviewStats.total_reviews === 1 ? <FormattedMessage id="review" /> : <FormattedMessage id="reviews" />}
              </div>
            </div>
          </div>
        )}

        {isLoggedIn && (
          <div className="add-review-block">
            {!showReviewForm ? (
              <button className="write-review-btn" onClick={() => onShowReviewForm(true)}>
                <DocumentText size="20" />
                <FormattedMessage id="write-a-review" />
              </button>
            ) : (
              <ReviewForm
                reviewForm={reviewForm}
                submittingReview={submittingReview}
                onReviewFormChange={onReviewFormChange}
                onSubmitReview={onSubmitReview}
                onCancel={() => {
                  onShowReviewForm(false);
                  onReviewFormChange({ rating: 5, title: '', comment: '' });
                }}
              />
            )}
          </div>
        )}

        {loadingReviews ? (
          <div className="center padding">
            <FormattedMessage id="loading-reviews" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="center padding text-muted">
            <p>
              <FormattedMessage id="no-reviews-yet" />
            </p>
          </div>
        ) : (
          <ReviewsList reviews={reviews} />
        )}
      </div>
    </div>
  );
}
