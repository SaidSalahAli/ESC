// src/layout/Dashboard/Header/HeaderContent/UserMenuDropdown.jsx
import { useRef, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Profile, Setting2, ShoppingCart, Logout } from 'iconsax-react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Transitions from 'components/@extended/Transitions';

import useAuth from 'hooks/useAuth';

// ==============================|| DASHBOARD HEADER - USER MENU DROPDOWN ||============================== //

export default function UserMenuDropdown() {
  const navigate = useNavigate();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const { isLoggedIn, user, logout } = useAuth();

  const handleToggle = () => setOpen((prev) => !prev);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login');
  };

  if (!isLoggedIn) {
    return (
      <RouterLink to="/login" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
        <Profile size={22} />
      </RouterLink>
    );
  }

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      {/* Avatar / Trigger Button */}
      <Tooltip title="Account">
        <ButtonBase
          ref={anchorRef}
          onClick={handleToggle}
          aria-controls={open ? 'user-menu-grow' : undefined}
          aria-haspopup="true"
          sx={{
            p: 0.25,
            borderRadius: 1,
            '&:hover': { bgcolor: 'secondary.lighter' },
            '&:focus-visible': { outline: '2px solid', outlineColor: 'secondary.dark', outlineOffset: 2 }
          }}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.first_name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background:
                  user?.role === 'admin'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              {user?.first_name?.[0]?.toUpperCase() || 'U'}
            </Box>
          )}
        </ButtonBase>
      </Tooltip>

      {/* Dropdown Popper */}
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper
              elevation={4}
              sx={{
                width: 260,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  {/* Header */}
                  <Box sx={{ px: 2.5, py: 2, bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.first_name}
                          style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            background:
                              user?.role === 'admin'
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            flexShrink: 0
                          }}
                        >
                          {user?.first_name?.[0]?.toUpperCase() || 'U'}
                        </Box>
                      )}
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {user?.first_name} {user?.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {user?.email}
                        </Typography>
                        {user?.role === 'admin' && (
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-block',
                              mt: 0.3,
                              px: 1,
                              py: 0.1,
                              bgcolor: 'primary.lighter',
                              color: 'primary.main',
                              borderRadius: 1,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              letterSpacing: 0.5,
                              textTransform: 'uppercase'
                            }}
                          >
                            Admin
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Menu Items */}
                  <Box sx={{ py: 1 }}>
                    <MenuItem
                      icon={<Profile size={18} />}
                      label={<FormattedMessage id="my-profile" defaultMessage="My Profile" />}
                      to="/profile"
                      onClick={() => setOpen(false)}
                    />

                    <MenuItem
                      icon={<ShoppingCart size={18} />}
                      label={<FormattedMessage id="cart" defaultMessage="Cart" />}
                      to="/card"
                      onClick={() => setOpen(false)}
                    />

                    {user?.role === 'admin' && (
                      <MenuItem
                        icon={<Setting2 size={18} />}
                        label={<FormattedMessage id="dashboard" defaultMessage="Dashboard" />}
                        to="/dashboard"
                        onClick={() => setOpen(false)}
                      />
                    )}
                  </Box>

                  <Divider />

                  {/* Logout */}
                  <Box sx={{ py: 1 }}>
                    <Box
                      component="button"
                      onClick={handleLogout}
                      sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 2.5,
                        py: 1,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: 'error.main',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        textAlign: 'left',
                        transition: 'background 0.15s',
                        '&:hover': { bgcolor: 'error.lighter' }
                      }}
                    >
                      <Logout size={18} />
                      <FormattedMessage id="logout" defaultMessage="Logout" />
                    </Box>
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}

// ── Internal helper ──────────────────────────────────────────────
function MenuItem({ icon, label, to, onClick }) {
  return (
    <RouterLink to={to} onClick={onClick} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 1,
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'text.primary',
          cursor: 'pointer',
          transition: 'background 0.15s',
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        {icon}
        {label}
      </Box>
    </RouterLink>
  );
}
