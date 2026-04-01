/**
 * SEO Meta Tags Generator
 * Dynamically generates meta tags and structured data for better SEO
 */

export const generatePageMeta = (config) => {
  const {
    title = 'ESC Wear - Premium Modest Sportswear',
    description = 'Discover premium modest sportswear at ESC Wear. High-quality athletic wear designed for comfort, style, and performance.',
    canonical = 'https://escwear.com/',
    ogImage = 'https://escwear.com/assets/ESC-Icon-Black-Trans.png',
    ogType = 'website',
    keywords = 'modest sportswear, athletic wear, activewear',
    author = 'ESC Wear',
    locale = 'en_US',
    robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  } = config;

  // Update document title
  document.title = title;

  // Update meta tags
  updateMetaTag('name', 'title', title);
  updateMetaTag('name', 'description', description);
  updateMetaTag('name', 'keywords', keywords);
  updateMetaTag('name', 'author', author);
  updateMetaTag('name', 'robots', robots);

  // Open Graph
  updateMetaTag('property', 'og:type', ogType);
  updateMetaTag('property', 'og:title', title);
  updateMetaTag('property', 'og:description', description);
  updateMetaTag('property', 'og:image', ogImage);
  updateMetaTag('property', 'og:url', canonical);
  updateMetaTag('property', 'og:site_name', 'ESC Wear');
  updateMetaTag('property', 'og:locale', locale);

  // Twitter
  updateMetaTag('name', 'twitter:card', 'summary_large_image');
  updateMetaTag('name', 'twitter:title', title);
  updateMetaTag('name', 'twitter:description', description);
  updateMetaTag('name', 'twitter:image', ogImage);

  // Canonical URL
  updateCanonical(canonical);

  // Alternate language links
  updateAlternateLinks();
};

export const generateProductSEO = (product) => {
  const title = `${product.name} | Modest Sportswear - ESC Wear Egypt`;
  const description = `${product.name} - Premium modest sportswear. ${product.description || ''} Free delivery in Egypt.`.substring(0, 160);
  const image = product.image || 'https://escwear.com/assets/ESC-Icon-Black-Trans.png';
  const url = `https://escwear.com/products/${product.id}`;

  generatePageMeta({
    title,
    description,
    canonical: url,
    ogImage: image,
    ogType: 'product',
    keywords: `${product.name}, modest activewear, sportswear, ${product.category}`
  });

  // Add product structured data
  addProductSchema(product);
};

export const generateCategorySEO = (category) => {
  const categoryName = category.name;
  const title = `${categoryName} | Premium Modest Sportswear - ESC Wear Egypt`;
  const description =
    category.description ||
    `Shop our collection of ${categoryName} for women and men. High-quality, modest athletic wear. Free delivery in Egypt.`;
  const url = `https://escwear.com/collections/${category.slug}`;

  generatePageMeta({
    title,
    description,
    canonical: url,
    keywords: `${categoryName}, modest gym wear, sportswear, activewear, Egypt`
  });
};

export const generateBlogSEO = (post) => {
  const title = `${post.title} | ESC Wear Blog - Modest Sportswear Tips`;
  const description = post.excerpt || post.content.substring(0, 160);
  const url = `https://escwear.com/blog/${post.slug}`;
  const image = post.featuredImage || 'https://escwear.com/assets/ESC-Icon-Black-Trans.png';

  generatePageMeta({
    title,
    description,
    canonical: url,
    ogImage: image,
    ogType: 'article',
    keywords: `${post.title}, modest fitness, sportswear, gym wear`
  });

  // Add article structured data
  addArticleSchema(post);
};

// Helper functions
function updateMetaTag(type, name, content) {
  let element = document.querySelector(`meta[${type}="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(type, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function updateCanonical(url) {
  let canonical = document.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }

  canonical.setAttribute('href', url);
}

function updateAlternateLinks() {
  // Add Arabic alternate
  let arLink = document.querySelector('link[rel="alternate"][hreflang="ar"]');
  if (!arLink) {
    arLink = document.createElement('link');
    arLink.setAttribute('rel', 'alternate');
    arLink.setAttribute('hreflang', 'ar');
    arLink.setAttribute('href', 'https://escwear.com/ar');
    document.head.appendChild(arLink);
  }

  // Add English alternate
  let enLink = document.querySelector('link[rel="alternate"][hreflang="en"]');
  if (!enLink) {
    enLink = document.createElement('link');
    enLink.setAttribute('rel', 'alternate');
    enLink.setAttribute('hreflang', 'en');
    enLink.setAttribute('href', 'https://escwear.com/en');
    document.head.appendChild(enLink);
  }

  // Add x-default
  let defaultLink = document.querySelector('link[rel="alternate"][hreflang="x-default"]');
  if (!defaultLink) {
    defaultLink = document.createElement('link');
    defaultLink.setAttribute('rel', 'alternate');
    defaultLink.setAttribute('hreflang', 'x-default');
    defaultLink.setAttribute('href', 'https://escwear.com/');
    document.head.appendChild(defaultLink);
  }
}

function addProductSchema(product) {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: 'ESC Wear'
    },
    offers: {
      '@type': 'Offer',
      url: `https://escwear.com/products/${product.id}`,
      priceCurrency: 'EGP',
      price: product.price,
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: product.rating && {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      ratingCount: product.reviewCount
    }
  };

  addSchemaScript(schema);
}

function addArticleSchema(post) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: 'ESC Wear',
      logo: 'https://escwear.com/assets/ESC-Icon-Black-Trans.png'
    },
    publisher: {
      '@type': 'Organization',
      name: 'ESC Wear',
      logo: {
        '@type': 'ImageObject',
        url: 'https://escwear.com/assets/ESC-Icon-Black-Trans.png'
      }
    }
  };

  addSchemaScript(schema);
}

function addSchemaScript(schema) {
  // Remove old schema if exists
  let oldScript = document.querySelector('script[type="application/ld+json"]');
  if (oldScript) {
    oldScript.remove();
  }

  // Add new schema
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

// Organization Schema (add to main layout)
export function addOrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ESC Wear',
    url: 'https://escwear.com',
    logo: 'https://escwear.com/assets/ESC-Icon-Black-Trans.png',
    description: 'Premium modest sportswear for women and men in Egypt',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+20XXXXXXXXX',
      email: 'support@escwear.com'
    },
    sameAs: ['https://www.facebook.com/escwear', 'https://www.instagram.com/escwear', 'https://www.tiktok.com/@escwear'],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'EG',
      addressLocality: 'Cairo'
    }
  };

  addSchemaScript(schema);
}
