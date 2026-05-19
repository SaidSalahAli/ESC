import React, { lazy, Suspense, useMemo } from 'react';
import SEO from 'components/SEO';
import ScrollReveal from 'components/ScrollReveal';

// Lazy-loaded sections (IMPORTANT for bundle splitting)
const Hero = lazy(() => import('./Hero'));
const Newsletter = lazy(() => import('./Newsletter'));
const ReviewsSection = lazy(() => import('./ReviewsSection'));
const InstagramSection = lazy(() => import('./InstagramSection.jsx'));
const HomeCategoriesSection = lazy(() => import('./HomeCategoriesSection'));
const Featured = lazy(() => import('./Featured'));

function HomePage() {
  const structuredData = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ESC Wear',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      description:
        'Premium modest sportswear and athletic wear. ESC-ing the average life!',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${
          typeof window !== 'undefined' ? window.location.origin : ''
        }/products?search={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
  }, []);

  return (
    <>
      <SEO
        title="ESC Wear - ESC-ing the average life! | Premium Modest Sportswear"
        description="Discover premium modest sportswear at ESC Wear. High-quality athletic wear designed for comfort, style, and performance."
        keywords="modest sportswear, athletic wear, ESC Wear, modest clothing"
        image="/assets/ESC-Icon-Black-Trans.png"
        type="website"
        structuredData={structuredData}
      />

      <Suspense fallback={null}>
        <Hero />
      </Suspense>

      <div className="container">
        <ScrollReveal>
          <Suspense fallback={null}>
            <HomeCategoriesSection />
          </Suspense>
        </ScrollReveal>
      </div>

      <ScrollReveal>
        <Suspense fallback={null}>
          <Featured />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal>
        <Suspense fallback={null}>
          <InstagramSection />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal>
        <Suspense fallback={null}>
          <ReviewsSection />
        </Suspense>
      </ScrollReveal>

      <ScrollReveal>
        <Suspense fallback={null}>
          <Newsletter />
        </Suspense>
      </ScrollReveal>
    </>
  );
}

export default HomePage;