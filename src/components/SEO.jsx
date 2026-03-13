import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component - Manages dynamic meta tags, Open Graph, and structured data
 *
 * Usage:
 * <SEO
 *   title="Page Title"
 *   description="Page description"
 *   keywords="keyword1, keyword2"
 *   image="/path/to/image.jpg"
 *   url="https://yoursite.com/page"
 *   type="website" // or "product", "article"
 *   structuredData={{...}} // JSON-LD structured data
 * />
 */
export default function SEO({
  title = 'ESC Wear - ESC-ing the average life! | Modest Sportswear',
  description = 'Discover premium modest sportswear at ESC Wear. High-quality athletic wear designed for comfort, style, and performance. Shop our collection of modest activewear.',
  keywords = 'modest sportswear, athletic wear, sportswear, activewear, ESC Wear, modest clothing, sports clothing',
  image = '/assets/ESC-Icon-Black-Trans.png',
  url,
  type = 'website',
  structuredData,
  canonical,
  author = 'ESC Wear',
  locale = 'en_US',
  alternateLocale = 'ar_EG',
  noindex = false,
  nofollow = false
}) {
  const location = useLocation();
  const currentUrl = url || `${window.location.origin}${location.pathname}`;
  const fullImageUrl = image?.startsWith('http') ? image : `${window.location.origin}${image}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name, content, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author);

    // Robots
    if (noindex || nofollow) {
      const robotsContent = [];
      if (noindex) robotsContent.push('noindex');
      if (nofollow) robotsContent.push('nofollow');
      updateMetaTag('robots', robotsContent.join(', '));
    } else {
      updateMetaTag('robots', 'index, follow');
    }

    // Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', fullImageUrl, 'property');
    updateMetaTag('og:url', currentUrl, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', 'ESC Wear', 'property');
    updateMetaTag('og:locale', locale, 'property');
    if (alternateLocale) {
      updateMetaTag('og:locale:alternate', alternateLocale, 'property');
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', fullImageUrl);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical || currentUrl);

    // Alternate language links
    const updateAlternateLink = (hreflang, href) => {
      let link = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', hreflang);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    updateAlternateLink('en', currentUrl);
    updateAlternateLink('ar', currentUrl);
    updateAlternateLink('x-default', currentUrl);

    // Structured Data (JSON-LD)
    let structuredDataScript = document.getElementById('structured-data');
    if (structuredData) {
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script');
        structuredDataScript.id = 'structured-data';
        structuredDataScript.type = 'application/ld+json';
        document.head.appendChild(structuredDataScript);
      }
      structuredDataScript.textContent = JSON.stringify(structuredData);
    } else if (structuredDataScript) {
      structuredDataScript.remove();
    }

    // Viewport and theme color (ensure they exist)
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=5.0');
    updateMetaTag('theme-color', '#000000');
  }, [
    title,
    description,
    keywords,
    image,
    url,
    type,
    structuredData,
    canonical,
    currentUrl,
    fullImageUrl,
    locale,
    alternateLocale,
    noindex,
    nofollow,
    author
  ]);

  return null; 
}
