import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Badge from '@mui/material/Badge';
import CardContent from '@mui/material/CardContent';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';

// project-imports
import Avatar from 'components/@extended/Avatar';
import Transitions from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import { notificationService } from 'api/notifications';

// assets
import { ShoppingCart, MessageText1, Notification as NotificationIcon, Trash } from 'iconsax-react';

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

export default function NotificationPage() {
  const navigate = useNavigate();
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getAll({ limit: 10 });
      if (response.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count only (lighter request)
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  // Load notifications when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchNotifications(); // Initial load

    const interval = setInterval(() => {
      if (!open) {
        // Only fetch unread count when dropdown is closed (lighter request)
        fetchUnreadCount();
      } else {
        // Fetch full notifications when dropdown is open
        fetchNotifications();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [open]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }

    // Navigate to link if exists
    if (notification.link) {
      try {
        // If backend provided link like /dashboard/orders/{id}, transform to /dashboard/orders?orderId={id}
        const orderMatch = notification.link.match(/^\/dashboard\/orders\/(\d+)/);
        if (orderMatch) {
          const orderId = orderMatch[1];
          navigate(`/dashboard/orders?orderId=${orderId}`);
        } else {
          navigate(notification.link);
        }
      } catch (err) {
        console.error('Failed to navigate to notification link:', err);
      }
      setOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await notificationService.delete(notificationId);
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingCart size={20} variant="Bold" />;
      case 'contact':
        return <MessageText1 size={20} variant="Bold" />;
      default:
        return <NotificationIcon size={20} variant="Bold" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return 'primary';
      case 'contact':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.5 }}>
      <Tooltip title="Notifications">
        <IconButton
          color="secondary"
          variant="light"
          aria-label="open notifications"
          ref={anchorRef}
          aria-controls={open ? 'notification-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          size="large"
          sx={(theme) => ({
            p: 1,
            color: 'secondary.main',
            bgcolor: open ? 'secondary.200' : 'secondary.100',
            ...theme.applyStyles('dark', { bgcolor: open ? 'background.paper' : 'background.default' })
          })}
        >
          <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { top: 2, right: 4 } }}>
            <NotificationIcon variant="Bold" />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [downMD ? -5 : 0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper sx={(theme) => ({ boxShadow: theme.customShadows.z1, borderRadius: 1.5, width: { xs: 320, sm: 420 } })}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} content={false}>
                  <CardContent>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h5">Notifications</Typography>
                      {unreadCount > 0 && (
                        <Link
                          href="#"
                          variant="body2"
                          color="primary"
                          onClick={(e) => {
                            e.preventDefault();
                            handleMarkAllAsRead();
                          }}
                          sx={{ cursor: 'pointer' }}
                        >
                          Mark all read
                        </Link>
                      )}
                    </Stack>
                    {loading && notifications.length === 0 ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : notifications.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No notifications
                        </Typography>
                      </Box>
                    ) : (
                      <SimpleBar style={{ maxHeight: 'calc(100vh - 180px)' }}>
                        <List
                          component="nav"
                          sx={(theme) => ({
                            '& .MuiListItemButton-root': {
                              p: 1.5,
                              my: 0.5,
                              border: `1px solid ${theme.palette.divider}`,
                              bgcolor: 'background.paper',
                              '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.light' },
                              '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                            },
                            '& .MuiListItemButton-root.unread': {
                              bgcolor: 'action.selected',
                              borderColor: 'primary.main',
                              '&:hover': { bgcolor: 'primary.lighter' }
                            }
                          })}
                        >
                          {notifications.map((notification) => (
                            <ListItem
                              key={notification.id}
                              component={ListItemButton}
                              className={!notification.is_read ? 'unread' : ''}
                              onClick={() => handleNotificationClick(notification)}
                              secondaryAction={
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                                    {formatTime(notification.created_at)}
                                  </Typography>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      edge="end"
                                      size="small"
                                      onClick={(e) => handleDelete(e, notification.id)}
                                      sx={{ color: 'text.secondary' }}
                                    >
                                      <Trash size={16} />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              }
                            >
                              <ListItemAvatar>
                                <Avatar
                                  type={!notification.is_read ? 'filled' : 'outlined'}
                                  color={getNotificationColor(notification.type)}
                                >
                                  {getNotificationIcon(notification.type)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="subtitle1">{notification.title}</Typography>
                                    {!notification.is_read && (
                                      <Chip label="New" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem' }} />
                                    )}
                                  </Stack>
                                }
                                secondary={
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {notification.message}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </SimpleBar>
                    )}
                    {notifications.length > 0 && (
                      <Stack direction="row" sx={{ justifyContent: 'center', mt: 1.5 }}>
                        <Link
                          href="#"
                          variant="body2"
                          color="primary"
                          onClick={(e) => {
                            e.preventDefault();
                            navigate('/dashboard');
                            setOpen(false);
                          }}
                          sx={{ cursor: 'pointer' }}
                        >
                          View all
                        </Link>
                      </Stack>
                    )}
                  </CardContent>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
