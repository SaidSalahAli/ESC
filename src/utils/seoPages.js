/**
 * SEO-Focused Landing Pages Configuration
 * These pages target specific keywords and drive organic traffic
 */

export const seoPages = {
  // Main SEO landing pages
  modestGymWear: {
    path: '/collections/modest-gym-wear',
    title: 'Modest Gym Wear for Women | Comfortable Athletic Clothing - ESC Wear Egypt',
    description:
      'Shop modest gym wear designed for women who want style and comfort while working out. Breathable fabrics, full coverage, and premium quality. Free delivery in Egypt.',
    keywords: ['modest gym wear', 'gym wear for women', 'modest athletic wear', 'sportswear Egypt', 'hijab gym wear'],
    h1: 'Modest Gym Wear for Women - ESC Wear',
    sections: [
      {
        type: 'hero',
        title: 'Gym Wear Designed for Modern Women',
        subtitle: 'Comfortable, Modest, Premium Quality',
        cta: 'Shop Gym Wear'
      },
      {
        type: 'features',
        items: [
          { icon: 'check', title: 'Full Coverage', description: 'Modern modest gym wear that respects your style' },
          { icon: 'check', title: 'Breathable Fabrics', description: 'Stay cool and comfortable during workouts' },
          { icon: 'check', title: 'High Performance', description: 'Premium quality for serious athletes' },
          { icon: 'check', title: 'Free Delivery Egypt', description: 'Fast shipping to all governorates' }
        ]
      },
      {
        type: 'faq',
        items: [
          {
            q: 'What sizes do you offer in modest gym wear?',
            a: 'We offer sizes XS to 3XL for all gym wear items, ensuring a perfect fit for everyone.'
          },
          {
            q: 'Are your gym clothes machine washable?',
            a: 'Yes, all our modest gym wear is machine washable and designed for durability.'
          },
          {
            q: 'Can I wear these for activities other than gym?',
            a: 'Absolutely! Our modest sportswear is perfect for yoga, hiking, sports, and everyday wear.'
          },
          {
            q: 'What is your return policy?',
            a: 'We offer 30-day returns on all gym wear items. See our returns page for more details.'
          }
        ]
      }
    ]
  },

  hijabSportswear: {
    path: '/collections/hijab-sportswear',
    title: 'Hijab Sportswear & Modest Athletic Wear - ESC Wear',
    description:
      'Premium hijab sportswear collection for women who want to stay active while maintaining their style. Shop comfortable, durable athletic wear designed for movement.',
    keywords: ['hijab sportswear', 'modest activewear hijab', 'sports hijab clothing', 'Islamic sportswear', 'modest athletic wear women'],
    h1: 'Premium Hijab Sportswear Collection',
    sections: [
      {
        type: 'hero',
        title: 'Sportswear That Matches Your Values',
        subtitle: 'Premium hijab sportswear for active women',
        cta: 'Browse Collection'
      },
      {
        type: 'benefits',
        title: 'Why Choose Our Hijab Sportswear?',
        items: [
          'Specially designed for modest athletes',
          'Premium, breathable fabrics',
          'Stylish and functional designs',
          'Trusted by women across Egypt',
          'Free delivery on orders'
        ]
      }
    ]
  },

  modestActivewearWomen: {
    path: '/collections/modest-activewear-women',
    title: 'Modest Activewear for Women | ESC Wear - Sportswear Egypt',
    description:
      'Discover our range of modest activewear for women. Premium athletic wear combining style, comfort, and full coverage. Shop trending activewear in Egypt.',
    keywords: ['modest activewear women', 'activewear Egypt', 'modest athletic clothing', "women's sportswear", 'casual activewear'],
    h1: 'Modest Activewear for Women - Style Meets Comfort',
    sections: [
      {
        type: 'content',
        title: 'Activewear That Works for You',
        body: 'Our modest activewear collection is designed for women who refuse to compromise on style or values. From yoga classes to gym sessions, our collection covers it all.'
      }
    ]
  },

  modestActivewearMen: {
    path: '/collections/modest-activewear-men',
    title: 'Modest Activewear for Men | Premium Sportswear - ESC Wear',
    description:
      'Shop modest sportswear for men. Quality athletic wear designed for comfort and performance. Perfect for gym, sports, and everyday wear in Egypt.',
    keywords: ['modest activewear men', "men's sportswear", 'athletic wear for men', 'modest gym wear men', 'sports clothing men Egypt'],
    h1: 'Modest Activewear for Men - Premium Quality',
    sections: []
  }
};

// Blog content strategy - high-traffic keywords
export const blogTopics = [
  {
    title: 'Best Modest Gym Outfits in Egypt - Complete Guide',
    slug: 'best-modest-gym-outfits-egypt',
    keywords: ['modest gym outfits', 'gym outfit ideas Egypt', 'what to wear to gym modest'],
    wordCount: 2000,
    topics: ['outfit combinations', 'seasonal recommendations', 'product pairings']
  },
  {
    title: 'How to Choose Modest Sportswear - A Complete Guide',
    slug: 'choose-modest-sportswear-guide',
    keywords: ['modest sportswear guide', 'how to choose activewear', 'modest clothing tips'],
    wordCount: 1800,
    topics: ['fit and comfort', 'fabric quality', 'brand comparison']
  },
  {
    title: 'Why Modest Activewear is Trending in 2024',
    slug: 'modest-activewear-trending',
    keywords: ['modest activewear trends', 'sportswear trends 2024', 'Islamic fashion trends'],
    wordCount: 1500,
    topics: ['trend analysis', 'fashion evolution', 'cultural impact']
  },
  {
    title: 'Hijab Sportswear: Comfort, Style, and Performance',
    slug: 'hijab-sportswear-guide',
    keywords: ['hijab sportswear', 'modest hijab clothing sports', 'athletic hijab options'],
    wordCount: 2000,
    topics: ['style options', 'performance tips', 'product recommendations']
  },
  {
    title: 'Modest Gym Wear for Beginners - Everything You Need',
    slug: 'modest-gym-wear-beginners',
    keywords: ['modest gym wear beginners', 'first time gym clothing', 'starter activewear'],
    wordCount: 1500,
    topics: ['essential pieces', 'budget tips', 'where to start']
  },
  {
    title: 'Can You Really Stay Modest and Fit? The Answer is Yes',
    slug: 'modest-fitness-lifestyle',
    keywords: ['modest fitness', 'modest lifestyle fitness', 'Islamic fitness'],
    wordCount: 1800,
    topics: ['fitness journey', 'motivation', 'community stories']
  },
  {
    title: "Women's Modest Activewear: Breaking Barriers in Sports",
    slug: 'women-modest-sports-barriers',
    keywords: ['women modest sports', 'female athletes modest clothing', 'women empowerment fitness'],
    wordCount: 2000,
    topics: ['women stories', 'sports culture', 'empowerment']
  },
  {
    title: "ESC Wear vs Traditional Sportswear: What's the Difference?",
    slug: 'modest-vs-traditional-sportswear',
    keywords: ['modest vs regular sportswear', 'modest clothing benefits', 'activewear comparison'],
    wordCount: 1600,
    topics: ['comparison guide', 'benefits analysis', 'when to wear each']
  }
];

// Internal linking strategy
export const internalLinkingStrategy = {
  homepage: ['/collections/modest-gym-wear', '/collections/hijab-sportswear', '/blog', '/about'],

  blogCategory: ['/collections/modest-gym-wear', '/collections/hijab-sportswear', '/collections/modest-activewear-women'],

  productCategory: [
    '/blog',
    '/about',
    '/collections/' // other related collections
  ]
};

// Content clusters for topic authority
export const topicClusters = {
  'modest-gym-wear': {
    pillarPage: '/collections/modest-gym-wear',
    clusterContent: ['best-modest-gym-outfits-egypt', 'choose-modest-sportswear-guide', 'modest-gym-wear-beginners'],
    relatedCategories: ['/collections/hijab-sportswear', '/collections/gym-tops', '/collections/gym-bottoms']
  },

  'hijab-sportswear': {
    pillarPage: '/collections/hijab-sportswear',
    clusterContent: ['hijab-sportswear-guide', 'women-modest-sports-barriers'],
    relatedCategories: ['/collections/modest-activewear-women', '/collections/gym-tops']
  }
};
