// src/pages/ContactUs.jsx
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { contactService } from 'api/contact';
import { openSnackbar } from 'api/snackbar';
import useAuth from 'hooks/useAuth';
import './contact.css';

export default function ContactUs() {
  const intl = useIntl();
  const { user, isLoggedIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);

      const response = await contactService.submitMessage(formData);

      if (response.success) {
        openSnackbar({
          open: true,
          message:
            intl.formatMessage({ id: 'contact-message-sent' }) ||
            response.message ||
            'Thank you for your message! We will get back to you soon.',
          variant: 'alert',
          alert: { color: 'success' }
        });

        // Reset form
        setFormData({
          name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '',
          email: user?.email || '',
          phone: user?.phone || '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error submitting contact form:', err);
      openSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          err.message ||
          intl.formatMessage({ id: 'contact-message-failed' }) ||
          'Failed to send message. Please try again.',
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Contact Section */}
      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-form">
            <h2>
              <FormattedMessage id="send-us-message" defaultMessage="Send us a Message" />
            </h2>
            <form id="contactForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">
                  <FormattedMessage id="name" defaultMessage="Name" /> *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <FormattedMessage id="email" defaultMessage="Email" /> *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <FormattedMessage id="phone" defaultMessage="Phone" />
                </label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} disabled={submitting} />
              </div>

              <div className="form-group">
                <label htmlFor="subject">
                  <FormattedMessage id="subject" defaultMessage="Subject" /> *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">
                  <FormattedMessage id="message" defaultMessage="Message" /> *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                ></textarea>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={submitting}
                style={{
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? (
                  <FormattedMessage id="sending" defaultMessage="Sending..." />
                ) : (
                  <FormattedMessage id="send-message" defaultMessage="Send Message" />
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
