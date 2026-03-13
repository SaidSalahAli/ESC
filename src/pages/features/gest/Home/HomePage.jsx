import React from 'react';
import Hero from './Hero';
import Newsletter from './Newsletter';
import Collections from './Featured';
import ReviewsSection from './ReviewsSection';
import SEO from 'components/SEO';
import Featured from './Featured';
import HomeCategoriesSection from './HomeCategoriesSection';
import img4 from 'assets/images/homepage/4.jpg';
import InstagramSection from './InstagramSection.jsx';
import ScrollReveal from 'components/ScrollReveal';
import StorySection from './StorySection.jsx';
function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ESC Wear',
    url: window.location.origin,
    description: 'Premium modest sportswear and athletic wear. ESC-ing the average life!',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${window.location.origin}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <SEO
        title="ESC Wear - ESC-ing the average life! | Premium Modest Sportswear"
        description="Discover premium modest sportswear at ESC Wear. High-quality athletic wear designed for comfort, style, and performance. Shop our collection of modest activewear for men and women."
        keywords="modest sportswear, athletic wear, sportswear, activewear, ESC Wear, modest clothing, sports clothing, hijab sportswear, modest activewear"
        image="/assets/ESC-Icon-Black-Trans.png"
        type="website"
        structuredData={structuredData}
      />
      <Hero />
      {/* <StorySection /> */}
      <ScrollReveal>
        <Featured />
      </ScrollReveal>

      <ScrollReveal>
        <Newsletter />
      </ScrollReveal>

      <div className="container">
        <ScrollReveal>
          <HomeCategoriesSection />
        </ScrollReveal>
      </div>

      <ScrollReveal>
        <InstagramSection />
      </ScrollReveal>

      <ScrollReveal>
        <ReviewsSection />
      </ScrollReveal>
    </>
  );
}

export default HomePage;
