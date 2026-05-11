import { lazy } from 'react';
import Loadable from 'components/Loadable';
import { SimpleLayoutType } from 'config';
import AuthGuard from 'utils/route-guard/AuthGuard';
import AdminGuard from 'utils/route-guard/AdminGuard';

// =====================
// 🔥 LAZY LAYOUTS (IMPORTANT FIX)
// =====================
const SimpleLayout = Loadable(lazy(() => import('layout/Simple')));
const DashboardLayout = Loadable(lazy(() => import('layout/Dashboard')));
const PagesLayout = Loadable(lazy(() => import('layout/Pages')));

// =====================
// PUBLIC PAGES
// =====================
const Home = Loadable(lazy(() => import('pages/features/gest/Home/HomePage.jsx')));
const Collections = Loadable(lazy(() => import('pages/features/gest/Collections/Collections.jsx')));
const About = Loadable(lazy(() => import('pages/features/gest/AboutUs/AboutUs.jsx')));
const Contact = Loadable(lazy(() => import('pages/features/gest/ContactUs/ContactUs.jsx')));
const ReturnsPolicy = Loadable(lazy(() => import('pages/features/gest/Policy/ReturnsPolicy.jsx')));
const ChatBot = Loadable(lazy(() => import('pages/features/gest/Chatbot/Chatbot.jsx')));

// =====================
// USER PAGES
// =====================
const ProductDetails = Loadable(lazy(() => import('pages/features/gest/ProductDetails')));
const OrderDetails = Loadable(lazy(() => import('pages/features/gest/OrderDetails/OrderDetails.jsx')));
const Profile = Loadable(lazy(() => import('pages/features/gest/Profile/Profile.jsx')));
const Checkout = Loadable(lazy(() => import('pages/features/gest/Checkout/Checkout.jsx')));
const GuestOrderConfirmation = Loadable(lazy(() => import('pages/features/gest/Checkout/GuestOrderConfirmation.jsx')));
const PaymentForm = Loadable(lazy(() => import('pages/features/gest/Payment/PaymentForm.jsx')));
const PaymentSuccess = Loadable(lazy(() => import('pages/features/gest/Payment/PaymentSuccess.jsx')));
const PaymentFailed = Loadable(lazy(() => import('pages/features/gest/Payment/PaymentFailed.jsx')));
const PaymentCancelled = Loadable(lazy(() => import('pages/features/gest/Payment/PaymentCancelled.jsx')));

// =====================
// ADMIN (HEAVY - KEEP ISOLATED)
// =====================
const AdminDashboard = Loadable(lazy(() => import('pages/features/admin/Dashboard')));
const ProductsList = Loadable(lazy(() => import('pages/features/admin/Products/ProductsList')));
const CategoriesList = Loadable(lazy(() => import('pages/features/admin/Categories/CategoriesList')));
const OrdersList = Loadable(lazy(() => import('pages/features/admin/Orders/OrdersList')));
const InventoryManagement = Loadable(lazy(() => import('pages/features/admin/Inventory/InventoryManagement')));
const CustomersList = Loadable(lazy(() => import('pages/features/admin/Customers/CustomersList')));
const ReviewsList = Loadable(lazy(() => import('pages/features/admin/Reviews/ReviewsList')));
const SalesReports = Loadable(lazy(() => import('pages/features/admin/Reports/SalesReports')));

// =====================
// MAINTENANCE
// =====================
const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/error/500')));

// ==============================|| MAIN ROUTES ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    // ================= PUBLIC =================
    {
      path: '/',
      element: <SimpleLayout layout={SimpleLayoutType.SIMPLE} />,
      children: [
        { index: true, element: <Home /> },
        { path: 'home', element: <Home /> },
        { path: 'collections', element: <Collections /> },
        { path: 'about', element: <About /> },
        { path: 'contact', element: <Contact /> },
        { path: 'returns-policy', element: <ReturnsPolicy /> },
        { path: 'chatbot', element: <ChatBot /> }
      ]
    },

    // ================= USER =================
    {
      path: '/',
      element: <SimpleLayout layout={SimpleLayoutType.SIMPLE} />,
      children: [
        { path: 'products/:id', element: <ProductDetails /> },
        { path: 'orders/:orderId', element: <OrderDetails /> },
        {
          path: 'profile',
          element: (
            <AuthGuard>
              <Profile />
            </AuthGuard>
          )
        },
        { path: 'checkout', element: <Checkout /> },
        { path: 'guest-checkout/orders/:orderNumber', element: <GuestOrderConfirmation /> },
        { path: 'payment/:orderId', element: <PaymentForm /> },
        { path: 'payment/success', element: <PaymentSuccess /> },
        { path: 'payment/failed', element: <PaymentFailed /> },
        { path: 'payment/cancelled', element: <PaymentCancelled /> }
      ]
    },

    // ================= ADMIN (ISOLATED HEAVY CHUNK) =================
    {
      path: 'dashboard',
      element: (
        <AdminGuard>
          <DashboardLayout />
        </AdminGuard>
      ),
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: 'products', element: <ProductsList /> },
        { path: 'categories', element: <CategoriesList /> },
        { path: 'orders', element: <OrdersList /> },
        { path: 'inventory', element: <InventoryManagement /> },
        { path: 'customers', element: <CustomersList /> },
        { path: 'reviews', element: <ReviewsList /> },
        { path: 'reports', element: <SalesReports /> }
      ]
    },

    // ================= MAINTENANCE =================
    {
      path: '/maintenance',
      element: <PagesLayout />,
      children: [
        { path: '404', element: <MaintenanceError /> },
        { path: '500', element: <MaintenanceError500 /> }
      ]
    },

    { path: '*', element: <MaintenanceError /> }
  ]
};

export default MainRoutes;
