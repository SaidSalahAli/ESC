function ReviewForm({ reviewForm, submittingReview, onReviewFormChange, onSubmitReview, onCancel }) {
  const intl = useIntl();

  return (
    <form className="review-form" onSubmit={onSubmitReview}>
      <h3>
        <FormattedMessage id="write-your-review" />
      </h3>

      <div className="form-group">
        <label>
          <FormattedMessage id="rating" /> *
        </label>
        <div className="rating-input">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => onReviewFormChange({ ...reviewForm, rating: star })}>
              <Star
                size="32"
                variant={star <= reviewForm.rating ? 'Bold' : 'Outline'}
                color={star <= reviewForm.rating ? '#ffc107' : '#ddd'}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>
          <FormattedMessage id="title-optional" />
        </label>
        <input
          type="text"
          value={reviewForm.title}
          onChange={(e) => onReviewFormChange({ ...reviewForm, title: e.target.value })}
          placeholder={intl.formatMessage({ id: 'review-title' })}
        />
      </div>

      <div className="form-group">
        <label>
          <FormattedMessage id="comment" /> *
        </label>
        <textarea
          rows={5}
          required
          minLength={10}
          value={reviewForm.comment}
          onChange={(e) => onReviewFormChange({ ...reviewForm, comment: e.target.value })}
          placeholder={intl.formatMessage({ id: 'write-review-here' })}
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={submittingReview} className="submit-review-btn">
          {submittingReview ? <FormattedMessage id="submitting" /> : <FormattedMessage id="submit-review" />}
        </button>
        <button type="button" className="cancel-review-btn" onClick={onCancel}>
          <FormattedMessage id="cancel" />
        </button>
      </div>
    </form>
  );
}
