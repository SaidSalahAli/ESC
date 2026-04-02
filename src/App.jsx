import { RouterProvider } from 'react-router-dom';

// project-imports
import router from 'routes';
import ThemeCustomization from 'themes';

import Locales from 'components/Locales';
import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import LoadingScreen from 'components/LoadingScreen';

// auth-provider
import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
import { CartDrawerProvider } from 'contexts/CartDrawerContext';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

export default function App() {
  return (
    <>
      <LoadingScreen />
      <ThemeCustomization>
        <RTLLayout>
          <Locales>
            <ScrollTop>
              <AuthProvider>
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
