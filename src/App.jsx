import { RouterProvider } from 'react-router-dom';

// project-imports
import router from 'routes';
import ThemeCustomization from 'themes';

import Locales from 'components/Locales';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';

// auth-provider (MUST be before LoadingScreen to provide context)
import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
import LoadingScreen from 'components/LoadingScreen';
import { CartDrawerProvider } from 'contexts/CartDrawerContext';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

export default function App() {
  return (
    <>
      <ThemeCustomization>
        <RTLLayout>
          <Locales>
            <ScrollTop>
              <AuthProvider>
                {/* LoadingScreen now accesses JWTContext through provider */}
                <LoadingScreen />
                <CartDrawerProvider>
                  <>
                    <RouterProvider router={router} />
                    <Snackbar />
                  </>
                </CartDrawerProvider>
              </AuthProvider>
            </ScrollTop>
          </Locales>
        </RTLLayout>
      </ThemeCustomization>
    </>
  );
}
