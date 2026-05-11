import { lazy } from 'react';
import Loadable from 'components/Loadable';

const AuthLayout = Loadable(lazy(() => import('layout/Auth')));

const AuthLogin = Loadable(lazy(() => import('pages/auth/auth1/login')));
const AuthRegister = Loadable(lazy(() => import('pages/auth/auth1/register')));
const AuthForgotPassword = Loadable(lazy(() => import('pages/auth/auth1/forgot-password')));
const AuthCheckMail = Loadable(lazy(() => import('pages/auth/auth1/check-mail')));
const AuthResetPassword = Loadable(lazy(() => import('pages/auth/auth1/reset-password')));
const AuthCodeVerification = Loadable(lazy(() => import('pages/auth/auth1/code-verification')));

const LoginRoutes = {
  path: '/auth',
  children: [
    {
      path: '/auth',
      element: <AuthLayout />,
      children: [
        { index: true, element: <AuthLogin /> },
        { path: 'login', element: <AuthLogin /> },
        { path: 'register', element: <AuthRegister /> },
        { path: 'forgot-password', element: <AuthForgotPassword /> },
        { path: 'check-mail', element: <AuthCheckMail /> },
        { path: 'reset-password', element: <AuthResetPassword /> },
        { path: 'code-verification', element: <AuthCodeVerification /> }
      ]
    }
  ]
};

export default LoginRoutes;
