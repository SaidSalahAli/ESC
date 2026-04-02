// src/components/Header/Header.jsx
import { useState, useRef, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { CloseCircle, ShoppingCart, LanguageSquare, Profile } from 'iconsax-react';
import logoSrc from 'assets/ESC-Icon-Black-Trans.png';
import logoWhite from 'assets/ESC-Icon-White-Trans.png';
import logoBlack from 'assets/ESC-Icon-Black-Trans.png';
import useConfig from 'hooks/useConfig';
import useAuth from 'hooks/useAuth';
import { cartService } from 'api/cart';
import { getGuestCartCount } from 'utils/guestCart';
import { useCartDrawer } from 'contexts/CartDrawerContext';
import CartDrawer from 'components/CartDrawer/CartDrawer';
import './header.css';
import UserMenuDropdown from '../Dashboard/Header/HeaderContent/UserMenuDropdown';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const langMenuRef = useRef(null);

  const { i18n, onChangeLocalization } = useConfig();
  const { isLoggedIn, user, logout } = useAuth();
  const { cartDrawerOpen, openCartDrawer, closeCartDrawer } = useCartDrawer();
  const intl = useIntl();

  const isHomePage = location.pathname === '/';

  // Fetch cart count
  useEffect(() => {
    const updateCartCount = async () => {
      if (isLoggedIn) {
        try {
          const response = await cartService.getCartCount();
          if (response.success) setCartCount(response.data?.count || 0);
        } catch (err) {
          console.error('Error fetching cart count:', err);
        }
      } else {
        setCartCount(getGuestCartCount());
      }
    };

    updateCartCount();

    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);

    let interval;
    if (isLoggedIn) interval = setInterval(updateCartCount, 30000);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      if (interval) clearInterval(interval);
    };
  }, [isLoggedIn]);

  // Handle scroll for transparent header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    };

    if (langMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [langMenuOpen]);

  const handleLanguageChange = (lang) => {
    onChangeLocalization(lang);
    setLangMenuOpen(false);

    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <>
      <header className={`header ${isScrolled && isHomePage ? 'scrolled' : ''} ${!isHomePage ? 'always-scrolled' : ''}`}>
        <nav className="container">
          <div className="nav-container">
            {/* Logo */}
            <div className="left-section">
              <div className="logo">
                <RouterLink to="/">
                  <img src={isHomePage ? (isScrolled ? logoBlack : logoWhite) : logoBlack} alt="ESC Wear Logo" className="header-logo" />
                </RouterLink>
              </div>
            </div>

            {/* Nav Links */}
            <div>
              <ul className={`nav-links ${isHomePage ? 'home-page-links' : ''} ${isHomePage && !isScrolled ? 'nav-white' : 'nav-dark'}`}>
                <li>
                  <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                    <FormattedMessage id="home" />
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/collections" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <FormattedMessage id="collections" />
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <FormattedMessage id="about" />
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <FormattedMessage id="contact" />
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Right Section */}
            <div className={`right-section ${isHomePage && !isScrolled ? 'right-white' : 'right-dark'}`}>
              {/* Language Selector */}
              <div className="language-selector" ref={langMenuRef}>
                <button className="language-btn" aria-label="Change language" onClick={() => setLangMenuOpen(!langMenuOpen)}>
                  <LanguageSquare size="20" />
                </button>
                {langMenuOpen && (
                  <div className="language-dropdown">
                    <button className={`language-option ${i18n === 'en' ? 'active' : ''}`} onClick={() => handleLanguageChange('en')}>
                      <span>
                        <FormattedMessage id="english" />
                      </span>
                      <span className="lang-code">(EN)</span>
                    </button>
                    <button className={`language-option ${i18n === 'ar' ? 'active' : ''}`} onClick={() => handleLanguageChange('ar')}>
                      <span>
                        <FormattedMessage id="arabic" />
                      </span>
                      <span className="lang-code">(AR)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button className="cart-btn" onClick={openCartDrawer} aria-label="Open cart">
                <ShoppingCart size="20" backgroundColor="#ffff" />
                <span style={{ marginLeft: 11 }}>{cartCount ? ` ${cartCount}` : 0}</span>
              </button>

              {/* ===== User Menu ===== */}
              {isLoggedIn ? (
                <UserMenuDropdown cartCount={cartCount} onClose={() => setMobileOpen(false)} />
              ) : (
                <RouterLink to="/login" className="login-btn" onClick={() => setMobileOpen(false)}>
                  <Profile size="20" />
                </RouterLink>
              )}

              {/* Mobile menu toggle */}
              <button className="mobile-menu-btn" aria-label="Toggle menu" onClick={() => setMobileOpen(true)}>
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'active' : ''}`} role="dialog" aria-hidden={!mobileOpen}>
        <div className="mobile-menu-header">
          <div className="logo">
            <RouterLink to="/" onClick={() => setMobileOpen(false)}>
              <img src={logoSrc} alt="ESC Wear Logo" className="header-logo" />
            </RouterLink>
          </div>
          <button className="close-menu-btn" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
            ×
          </button>
        </div>

        <ul className="mobile-nav-links">
          <li>
            <RouterLink to="/" onClick={() => setMobileOpen(false)} className="active">
              <FormattedMessage id="home" />
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/collections" onClick={() => setMobileOpen(false)}>
              <FormattedMessage id="collections" />
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/about" onClick={() => setMobileOpen(false)}>
              <FormattedMessage id="about" />
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/contact" onClick={() => setMobileOpen(false)}>
              <FormattedMessage id="contact" />
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/chatbot" onClick={() => setMobileOpen(false)}>
              <FormattedMessage id="chatbot" />
            </RouterLink>
          </li>
        </ul>

        <div className="mobile-nav-buttons">


          {isLoggedIn ? (
            <>
              {user?.role === 'admin' && (
                <RouterLink to="/dashboard" className="dashboard-btn" onClick={() => setMobileOpen(false)}>
                  <FormattedMessage id="dashboard" />
                </RouterLink>
              )}
              <RouterLink to="/profile" className="profile-btn" onClick={() => setMobileOpen(false)}>
                <Profile size="20" />
                <span style={{ marginLeft: 6 }}>{user?.first_name || <FormattedMessage id="profile" />}</span>
              </RouterLink>
            </>
          ) : (
            <>
              <RouterLink to="/register" className="register-btn" onClick={() => setMobileOpen(false)}>
                <FormattedMessage id="sign-up" />
              </RouterLink>
              <RouterLink to="/login" className="login-btn" onClick={() => setMobileOpen(false)}>
                <FormattedMessage id="login" />
              </RouterLink>
            </>
          )}
        </div>
      </div>

      {/* Overlay */}
      <div className={`menu-overlay ${mobileOpen ? 'active' : ''}`} onClick={() => setMobileOpen(false)} />

      {/* Cart Drawer */}
      <CartDrawer open={cartDrawerOpen} onClose={closeCartDrawer} />

      {/* Search Overlay */}
      <div className={`search-overlay ${searchOpen ? 'active' : ''}`}>
        <div className="search-container">
          <div className="search-header">
            <h2>
              <FormattedMessage id="search" />
            </h2>
            <button className="search-close" onClick={() => setSearchOpen(false)} aria-label={intl.formatMessage({ id: 'search' })}>
              <CloseCircle size="24" />
            </button>
          </div>
          <form className="search-form" onSubmit={(e) => e.preventDefault()}>
            <input className="search-input" placeholder={intl.formatMessage({ id: 'search-products' })} />
          </form>
          <div className="search-results">
            <p>
              <FormattedMessage id="search-results" />
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
