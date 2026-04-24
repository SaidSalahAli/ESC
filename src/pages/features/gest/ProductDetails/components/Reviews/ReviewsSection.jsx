import React, { useState } from 'react';
import { Star } from 'iconsax-react';
import { FormattedMessage, useIntl } from 'react-intl';
import ReviewForm from './ReviewForm';
import ReviewsList from './ReviewsList';

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
  const average = Number(reviewStats?.average_rating || 0);
  const total = Number(reviewStats?.total_reviews || reviews?.length || 0);
  const [activeTab, setActiveTab] = useState('reviews');

  return (
    <section className="product-reviews">
      <div className="product-reviews-wrapper">
        <div className="reviews-block">
          <h2 className="reviews-title">
            <FormattedMessage id="customer-reviews" defaultMessage="Customer Reviews" />
          </h2>

          {/* Reviews Top Section */}
          <div className="reviews-top">
            {/* Left: Stars & Summary */}
            <div className="reviews-summary-left">
              <div className="stars-display">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size="24" variant="Bold" color={star <= Math.round(average) ? '#ffc238' : '#e6e6e6'} />
                ))}
              </div>
              <div className="based-on-text">
                <FormattedMessage id="based-on" defaultMessage="Based on" />
                <br />
                <strong>{total}</strong>
                <br />
                <FormattedMessage id="reviews-label" defaultMessage="reviews" />
              </div>
            </div>

            {/* Right: Rating Distribution */}
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count =
                  reviewStats?.[`${rating}_star`] ||
                  reviewStats?.[
                    `${rating === 5 ? 'five' : rating === 4 ? 'four' : rating === 3 ? 'three' : rating === 2 ? 'two' : 'one'}_star`
                  ] ||
                  0;

                const percent = total > 0 ? (Number(count) / total) * 100 : 0;

                return (
                  <div className="rating-row" key={rating}>
                    <div className="stars-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size="14" variant="Bold" color={star <= rating ? '#ffc238' : '#e6e6e6'} />
                      ))}
                    </div>
                    <div className="bar-container">
                      <div className="bar-track">
                        <span className="bar-fill" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                    <span className="bar-count">({count || 0})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="reviews-actions">
            {isLoggedIn && (
              <button className="review-action-btn" type="button" onClick={() => onShowReviewForm(true)}>
                <FormattedMessage id="write-review" defaultMessage="Write A Review" />
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
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

          {/* Tabs */}
          <div className="reviews-tabs">
            <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')} type="button">
              <FormattedMessage id="reviews-tab" defaultMessage="Reviews" /> ({total})
            </button>
          </div>

          {/* Sort Select */}
          <div className="reviews-sort">
            <label>
              <FormattedMessage id="sort-by" defaultMessage="SORT BY" />
            </label>
            <select defaultValue="recent">
              <option value="recent">
                <FormattedMessage id="sort-recent" defaultMessage="Most Recent" />
              </option>
              <option value="highest">
                <FormattedMessage id="sort-highest" defaultMessage="Highest Rating" />
              </option>
              <option value="lowest">
                <FormattedMessage id="sort-lowest" defaultMessage="Lowest Rating" />
              </option>
            </select>
          </div>

          {/* Reviews List */}
          {loadingReviews ? (
            <div className="reviews-empty">
              <FormattedMessage id="loading-reviews" defaultMessage="Loading reviews..." />
            </div>
          ) : reviews.length === 0 ? (
            <div className="reviews-empty">
              <FormattedMessage id="no-reviews" defaultMessage="There are no reviews yet." />
            </div>
          ) : (
            <ReviewsList reviews={reviews} />
          )}
        </div>
      </div>
    </section>
  );
}
