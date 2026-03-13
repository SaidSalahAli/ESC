// src/pages/AboutUs.jsx
import React from 'react';
import { FormattedMessage } from 'react-intl';

import ProfileImg from 'assets/images/homepage/8.jpg';
import Card3 from 'assets/images/homepage/1.jpg';

import './about.css';

export default function AboutUs() {
  return (
    <div className="about-page">
      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-container">
          <div className="mission-content">
            <h2>
              <FormattedMessage id="about-headline" />
            </h2>
            <p>
              <FormattedMessage id="about-line1" />
            </p>
            <p>
              <FormattedMessage id="about-line2" />
            </p>
            <p>
              <FormattedMessage id="about-line3" />
            </p>
            <p>
              <FormattedMessage id="about-line4" />
            </p>
            <p>
              <FormattedMessage id="about-line5" />
            </p>
            <h3>
              <FormattedMessage id="about-promises" />
            </h3>
            <p>
              <strong>
                <FormattedMessage id="promise1-title" />
              </strong>
              <br />
              <FormattedMessage id="promise1-text" />
            </p>
            <p>
              <strong>
                <FormattedMessage id="promise2-title" />
              </strong>
              <br />
              <FormattedMessage id="promise2-text" />
            </p>

            <p>
              <strong>
                <FormattedMessage id="promise3-title" />
              </strong>
              <br />
              <FormattedMessage id="promise3-text" />
            </p>

            <p>
              <FormattedMessage id="about-final" />
            </p>

            <a href="/collections" className="cta-btn">
              <FormattedMessage id="about-cta" />
            </a>
          </div>

          <div className="mission-image">
            <img src={ProfileImg} alt="ESC Mission" />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="values-container">
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>

              <h3>
                <FormattedMessage id="vision" />
              </h3>

              <p>
                <FormattedMessage id="vision-text" />
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>

              <h3>
                <FormattedMessage id="mission" />
              </h3>

              <p>
                <FormattedMessage id="mission-text" />
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
              </div>

              <h3>
                <FormattedMessage id="values" />
              </h3>

              <div className="values-list">
                <div className="values-row">
                  <div className="value-item">
                    <span className="value-name">
                      <FormattedMessage id="value-modesty" />
                    </span>
                  </div>

                  <div className="value-item">
                    <span className="value-name">
                      <FormattedMessage id="value-movement" />
                    </span>
                  </div>
                </div>

                <div className="values-row">
                  <div className="value-item">
                    <span className="value-name">
                      <FormattedMessage id="value-community" />
                    </span>
                  </div>

                  <div className="value-item">
                    <span className="value-name">
                      <FormattedMessage id="value-empowerment" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="community-section">
        <div className="community-container">
          <div className="community-content">
            <h2>
              <FormattedMessage id="community-title" />
            </h2>

            <p>
              <FormattedMessage id="community-text" />
            </p>

            <a href="/collections" className="cta-btn">
              <FormattedMessage id="shop-now" />
            </a>
          </div>

          <div className="community-image">
            <img src={Card3} alt="ESC Community" />
          </div>
        </div>
      </section>
    </div>
  );
}
