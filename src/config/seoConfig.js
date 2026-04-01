/**
 * SEO Configuration File
 * Central place to manage all SEO settings
 */

export const SEO_CONFIG = {
  // Site Information
  site: {
    name: 'ESC Wear',
    url: 'https://escwear.com',
    description: 'Premium modest sportswear and athletic wear designed for comfort, style, and performance',
    logo: 'https://escwear.com/assets/ESC-Icon-Black-Trans.png',
    language: 'en',
    locale: 'en_US'
  },

  // Social Media
  social: {
    facebook: 'https://www.facebook.com/escwear',
    instagram: 'https://www.instagram.com/escwear',
    twitter: 'https://twitter.com/escwear',
    tiktok: 'https://www.tiktok.com/@escwear'
  },

  // Contact Information
  contact: {
    email: 'support@escwear.com',
    phone: '+20-XXX-XXX-XXXX',
    address: 'Cairo, Egypt',
    country: 'EG'
  },

  // Keywords Strategy
  keywords: {
    main: ['modest gym wear', 'hijab sportswear', 'modest activewear', 'sportswear Egypt', 'modest athletic wear'],

    longTail: [
      'best modest gym outfits',
      'how to choose modest sportswear',
      'modest gym wear for beginners',
      'hijab gym clothing',
      'modest activewear Egypt',
      'women gym wear modest',
      'modest sportswear online Egypt'
    ],

    local: ['modest gym wear Egypt', 'activewear Cairo', 'sportswear Egypt', 'gym wear Cairo', 'modest fashion Egypt']
  },

  // SEO Pages Configuration
  pages: {
    // High-priority landing pages
    modestGymWear: {
      path: '/collections/modest-gym-wear',
      keywords: ['modest gym wear', 'gym wear women', 'modest athletic wear'],
      priority: 0.9
    },

    hijabSportswear: {
      path: '/collections/hijab-sportswear',
      keywords: ['hijab sportswear', 'modest hijab clothing', 'Islamic sportswear'],
      priority: 0.9
    },

    modestActivewearWomen: {
      path: '/collections/modest-activewear-women',
      keywords: ['modest activewear women', 'activewear for women', 'modest athletic clothing'],
      priority: 0.8
    },

    modestActivewearMen: {
      path: '/collections/modest-activewear-men',
      keywords: ['modest activewear men', 'men sportswear', 'athletic wear men'],
      priority: 0.8
    },

    // Blog pages
    blog: {
      path: '/blog',
      keywords: ['modest sportswear blog', 'activewear tips', 'gym wear guide'],
      priority: 0.8
    },

    // Info pages
    about: {
      path: '/about',
      keywords: ['about ESC Wear', 'modest sportswear brand'],
      priority: 0.6
    },

    faq: {
      path: '/faq',
      keywords: ['modest sportswear FAQ', 'gym wear questions'],
      priority: 0.6
    }
  },

  // Blog Content Strategy
  blogPosts: [
    {
      title: 'Best Modest Gym Outfits in Egypt - Complete Guide',
      slug: 'best-modest-gym-outfits-egypt',
      keywords: ['modest gym outfits', 'gym outfit ideas', 'what to wear to gym'],
      wordCount: 2000,
      priority: 1
    },
    {
      title: 'How to Choose Modest Sportswear - Complete Guide',
      slug: 'choose-modest-sportswear-guide',
      keywords: ['how to choose activewear', 'modest clothing tips', 'sportswear selection'],
      wordCount: 1800,
      priority: 1
    },
    {
      title: 'Why Modest Activewear is Trending in 2024',
      slug: 'modest-activewear-trending',
      keywords: ['modest activewear trends', 'sportswear trends 2024', 'fashion trends'],
      wordCount: 1500,
      priority: 2
    },
    {
      title: 'Hijab Sportswear: Comfort, Style, and Performance',
      slug: 'hijab-sportswear-guide',
      keywords: ['hijab sportswear', 'modest hijab clothing', 'hijab gym wear'],
      wordCount: 2000,
      priority: 1
    },
    {
      title: 'Modest Gym Wear for Beginners - Everything You Need',
      slug: 'modest-gym-wear-beginners',
      keywords: ['modest gym wear beginners', 'starter activewear', 'beginner gym clothes'],
      wordCount: 1500,
      priority: 2
    },
    {
      title: 'Can You Really Stay Modest and Fit? The Answer is Yes',
      slug: 'modest-fitness-lifestyle',
      keywords: ['modest fitness', 'modest lifestyle fitness', 'fitness journey'],
      wordCount: 1800,
      priority: 2
    },
    {
      title: "Women's Modest Activewear: Breaking Barriers in Sports",
      slug: 'women-modest-sports-barriers',
      keywords: ['women modest sports', 'female athletes', 'women empowerment'],
      wordCount: 2000,
      priority: 2
    },
    {
      title: "ESC Wear vs Traditional Sportswear: What's the Difference?",
      slug: 'modest-vs-traditional-sportswear',
      keywords: ['modest vs regular sportswear', 'activewear comparison'],
      wordCount: 1600,
      priority: 3
    }
  ],

  // Internal Linking Strategy
  internalLinking: {
    homepage: ['/collections/modest-gym-wear', '/collections/hijab-sportswear', '/collections/modest-activewear-women', '/blog', '/about'],

    blogToProducts: {
      'best-modest-gym-outfits-egypt': ['/collections/modest-gym-wear', '/collections/gym-tops', '/collections/gym-bottoms'],
      'hijab-sportswear-guide': ['/collections/hijab-sportswear', '/collections/modest-activewear-women']
    },

    productsToBlogs: {
      '/collections/modest-gym-wear': ['/blog/best-modest-gym-outfits-egypt', '/blog/choose-modest-sportswear-guide'],
      '/collections/hijab-sportswear': ['/blog/hijab-sportswear-guide', '/blog/modest-activewear-trending']
    }
  },

  // Topic Clusters (for link structure)
  topicClusters: {
    'modest-gym-wear': {
      pillar: '/collections/modest-gym-wear',
      clusters: ['/blog/best-modest-gym-outfits-egypt', '/blog/choose-modest-sportswear-guide', '/blog/modest-gym-wear-beginners']
    },

    'hijab-sportswear': {
      pillar: '/collections/hijab-sportswear',
      clusters: ['/blog/hijab-sportswear-guide', '/blog/women-modest-sports-barriers']
    }
  },

  // Backlink Strategy Targets
  backlinks: {
    // Influencer partnerships
    influencers: [
      'fitness YouTubers (modest fashion focus)',
      'modest fashion bloggers',
      'hijab fashion influencers',
      'fitness coaches (women targeting)',
      'wellness bloggers'
    ],

    // Directory submissions
    directories: [
      'Local business directories (Egypt)',
      'Fitness & wellness directories',
      'E-commerce directories',
      'Fashion industry directories'
    ],

    // Guest posting targets
    guestPosting: ['Modest fashion blogs', 'Women wellness blogs', 'Fitness blogs', 'Islamic lifestyle blogs', 'Fashion trend blogs'],

    // Partnership opportunities
    partnerships: [
      'Gym chains in Egypt',
      "Women's health organizations",
      'Islamic community organizations',
      'Modest fashion retailers',
      'Fitness apps'
    ]
  },

  // Performance Targets (Core Web Vitals)
  performance: {
    lcp: 2500, // Largest Contentful Paint < 2.5s
    fid: 100, // First Input Delay < 100ms
    cls: 0.1 // Cumulative Layout Shift < 0.1
  },

  // Analytics Events
  analyticsEvents: {
    productView: 'view_item',
    addToCart: 'add_to_cart',
    checkout: 'begin_checkout',
    purchase: 'purchase',
    blogRead: 'read_blog_post',
    contactSubmit: 'contact_form'
  },

  // Search Console Settings
  searchConsole: {
    siteUrl: 'https://escwear.com/',
    supportedCountries: ['EG'],
    preferredDomain: 'https://escwear.com/',
    crawlRate: 'let Google optimize'
  }
};

// Helper function to get keywords for a page
export const getPageKeywords = (pageKey) => {
  const page = SEO_CONFIG.pages[pageKey];
  return page ? page.keywords.join(', ') : '';
};

// Helper function to get blog post config
export const getBlogPostConfig = (slug) => {
  return SEO_CONFIG.blogPosts.find((post) => post.slug === slug);
};

// Helper function to get internal links for a page
export const getInternalLinks = (pageKey) => {
  return SEO_CONFIG.internalLinking[pageKey] || [];
};

export default SEO_CONFIG;
