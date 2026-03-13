import { lazy } from 'react';

// project-imports
import Loadable from 'components/Loadable';
import { SimpleLayoutType } from 'config';
import DashboardLayout from 'layout/Dashboard';
import PagesLayout from 'layout/Pages';
import SimpleLayout from 'layout/Simple';
import AuthGuard from 'utils/route-guard/AuthGuard';
import AdminGuard from 'utils/route-guard/AdminGuard';

// pages routing
const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/error/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction/under-construction')));
const MaintenanceUnderConstruction2 = Loadable(lazy(() => import('pages/maintenance/under-construction/under-construction2')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon/coming-soon')));
const MaintenanceComingSoon2 = Loadable(lazy(() => import('pages/maintenance/coming-soon/coming-soon2')));
const Home = Loadable(lazy(() => import('pages/features/gest/Home/HomePage.jsx')));
const Collections = Loadable(lazy(() => import('pages/features/gest/Collections/Collections.jsx')));
const About = Loadable(lazy(() => import('pages/features/gest/AboutUs/AboutUs.jsx')));
const Contact = Loadable(lazy(() => import('pages/features/gest/ContactUs/ContactUs.jsx')));
const ReturnsPolicy = Loadable(lazy(() => import('pages/features/gest/Policy/ReturnsPolicy.jsx')));
const ChatBot = Loadable(lazy(() => import('pages/features/gest/Chatbot/Chatbot.jsx')));
const Card = Loadable(lazy(() => import('pages/features/gest/Cart/Cart.jsx')));
const ProductDetails = Loadable(lazy(() => import('pages/features/gest/ProductDetails/ProductDetails.jsx')));
const OrderDetails = Loadable(lazy(() => import('pages/features/gest/OrderDetails/OrderDetails.jsx')));
const Profile = Loadable(lazy(() => import('pages/features/gest/Profile/Profile.jsx')));
const Checkout = Loadable(lazy(() => import('pages/features/gest/Checkout/Checkout.jsx')));
const PaymentForm = Loadable(lazy(() => import('pages/features/gest/Payment/PaymentForm.jsx')));
const PaymentSuccess = Loadable(lazy(() => import('pages/features/gest/Payment/PaymentSuccess.jsx')));
const PaymentFailed = Loadable(lazy(() => import('pages/features/gest/Payment/PaymentFailed.jsx')));
const PaymentCancelled = Loadable(lazy(() => import('pages/features/gest/Payment/PaymentCancelled.jsx')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const ContactUS = Loadable(lazy(() => import('pages/contact-us')));
const AdminDashboard = Loadable(lazy(() => import('pages/features/admin/Dashboard')));
const ProductsList = Loadable(lazy(() => import('pages/features/admin/Products/ProductsList')));
const CategoriesList = Loadable(lazy(() => import('pages/features/admin/Categories/CategoriesList')));
const OrdersList = Loadable(lazy(() => import('pages/features/admin/Orders/OrdersList')));
const OrderFulfillment = Loadable(lazy(() => import('pages/features/admin/Orders/OrderFulfillment')));
const OrderBarcodeScanner = Loadable(lazy(() => import('pages/features/admin/Orders/OrderBarcodeScanner')));
const InventoryManagement = Loadable(lazy(() => import('pages/features/admin/Inventory/InventoryManagement')));
const CustomersList = Loadable(lazy(() => import('pages/features/admin/Customers/CustomersList')));
const ReviewsList = Loadable(lazy(() => import('pages/features/admin/Reviews/ReviewsList')));
const SalesReports = Loadable(lazy(() => import('pages/features/admin/Reports/SalesReports')));
const ContactMessages = Loadable(lazy(() => import('pages/features/admin/Contact/ContactMessages')));
const ContactMessageDetail = Loadable(lazy(() => import('pages/features/admin/Contact/ContactMessageDetail')));
const NewsletterManagement = Loadable(lazy(() => import('pages/features/admin/Newsletter/NewsletterManagement')));
const OrderDetailsAdmin = Loadable(lazy(() => import('pages/features/admin/Orders/OrderDetails')));
const SettingsPage = Loadable(lazy(() => import('pages/admin/SettingsPage')));
const ShippingGovernoratesAdmin = Loadable(lazy(() => import('pages/admin/ShippingGovernoratesAdmin')));

// ==============================|| MAIN ROUTES ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <SimpleLayout layout={SimpleLayoutType.SIMPLE} />,
      children: [
        {
          index: true, // This makes it the default route for '/'
          element: <Home />
        },
        {
          path: 'Home',
          element: <Home />
        },
        {
          path: 'collections',
          element: <Collections />
        },
        {
          path: 'about',
          element: <About />
        },
        {
          path: 'contact',
          element: <Contact />
        },
        {
          path: 'returns-policy',
          element: <ReturnsPolicy />
        },
        {
          path: 'chatbot',
          element: <ChatBot />
        },
        {
          path: 'card',
          element: <Card />
        },
        {
          path: 'products/:id',
          element: <ProductDetails />
        },
        {
          path: 'orders/:orderId',
          element: <OrderDetails />
        },
        {
          path: 'profile',
          element: (
            <AuthGuard>
              <Profile />
            </AuthGuard>
          )
        },
        {
          path: 'checkout',
          element: <Checkout />
        },
        {
          path: 'payment/:orderId',
          element: <PaymentForm />
        },
        {
          path: 'payment/success',
          element: <PaymentSuccess />
        },
        {
          path: 'payment/failed',
          element: <PaymentFailed />
        },
        {
          path: 'payment/cancelled',
          element: <PaymentCancelled />
        }
      ]
    },
    {
      path: 'dashboard',
      element: (
        <AdminGuard>
          <DashboardLayout />
        </AdminGuard>
      ),
      children: [
        {
          index: true,
          element: <AdminDashboard />
        },
        {
          path: 'products',
          element: <ProductsList />
        },
        {
          path: 'categories',
          element: <CategoriesList />
        },
        {
          path: 'orders',
          element: <OrdersList />
        },
        {
          path: 'orders/:orderId/fulfillment',
          element: <OrderFulfillment />
        },
        {
          path: 'orders/scan-barcode',
          element: <OrderBarcodeScanner />
        },
        {
          path: 'inventory',
          element: <InventoryManagement />
        },
        {
          path: 'customers',
          element: <CustomersList />
        },
        {
          path: 'reviews',
          element: <ReviewsList />
        },
        {
          path: 'reports',
          element: <SalesReports />
        },
        {
          path: 'contact-messages',
          element: <ContactMessages />
        },
        {
          path: 'contact-messages/:id',
          element: <ContactMessageDetail />
        },
        {
          path: 'newsletter',
          element: <NewsletterManagement />
        },
        {
          path: 'settings',
          element: <SettingsPage />
        },
        {
          path: 'shipping-governorates',
          element: <ShippingGovernoratesAdmin />
        },
        {
          path: 'sample-page',
          element: <SamplePage />
        },
        {
          path: 'orders/:orderId',
          element: <OrderDetailsAdmin />
        }
      ]
    },
    {
      path: '/maintenance',
      element: <PagesLayout />,
      children: [
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '500',
          element: <MaintenanceError500 />
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction />
        },
        {
          path: 'under-construction2',
          element: <MaintenanceUnderConstruction2 />
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon />
        },
        {
          path: 'coming-soon-2',
          element: <MaintenanceComingSoon2 />
        }
      ]
    },
    { path: '*', element: <MaintenanceError /> }
  ]
};

export default MainRoutes;
