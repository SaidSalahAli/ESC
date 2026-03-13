// assets
import { Home2, Box1, Category, ShoppingCart, People, Star1, Chart, Setting2, Scan, MessageText1, Truck, Send } from 'iconsax-react';

// icons
const icons = {
  dashboard: Home2,
  products: Box1,
  categories: Category,
  orders: ShoppingCart,
  customers: People,
  reviews: Star1,
  reports: Chart,
  settings: Setting2,
  inventory: Scan,
  contact: MessageText1,
  shipping: Truck,
  newsletter: Send
};

// ==============================|| MENU ITEMS - ADMIN ||============================== //

const admin = {
  id: 'admin',
  title: 'Admin Panel',
  type: 'group',
  children: [
    {
      id: 'admin-dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.dashboard,
      breadcrumbs: false
    },
    {
      id: 'products-management',
      title: 'Products',
      type: 'item',
      url: '/dashboard/products',
      icon: icons.products
    },
    {
      id: 'categories-management',
      title: 'Categories',
      type: 'item',
      url: '/dashboard/categories',
      icon: icons.categories
    },
    {
      id: 'orders-management',
      title: 'Orders',
      type: 'item',
      url: '/dashboard/orders',
      icon: icons.orders
    },
    {
      id: 'inventory-management',
      title: 'Inventory',
      type: 'item',
      url: '/dashboard/inventory',
      icon: icons.inventory
    },
    {
      id: 'customers-management',
      title: 'Customers',
      type: 'item',
      url: '/dashboard/customers',
      icon: icons.customers
    },
    {
      id: 'reviews-management',
      title: 'Reviews',
      type: 'item',
      url: '/dashboard/reviews',
      icon: icons.reviews
    },
    {
      id: 'sales-reports',
      title: 'Sales Reports',
      type: 'item',
      url: '/dashboard/reports',
      icon: icons.reports
    },
    {
      id: 'contact-messages',
      title: 'Contact Messages',
      type: 'item',
      url: '/dashboard/contact-messages',
      icon: icons.contact
    },
    {
      id: 'newsletter-management',
      title: 'Newsletter',
      type: 'item',
      url: '/dashboard/newsletter',
      icon: icons.newsletter
    },
    {
      id: 'shipping-governorates',
      title: 'Shipping Costs',
      type: 'item',
      url: '/dashboard/shipping-governorates',
      icon: icons.shipping
    }
    // {
    //   id: 'settings',
    //   title: 'Settings',
    //   type: 'item',
    //   url: '/dashboard/settings',
    //   icon: icons.settings
    // }
  ]
};

export default admin;
