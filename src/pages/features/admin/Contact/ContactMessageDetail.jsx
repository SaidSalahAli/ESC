import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  TextField
} from '@mui/material';
import { ArrowLeft2, Trash, User, Calendar } from 'iconsax-react';
import { contactService } from 'api/contact';
import { openSnackbar } from 'api/snackbar';

export default function ContactMessageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchMessage();
  }, [id]);

  useEffect(() => {
    if (message) {
      setReplySubject('Re: ' + message.subject);
    }
  }, [message]);

  const fetchMessage = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactService.getMessageById(id);

      if (response.success) {
        setMessage(response.data);
      } else {
        setError('Message not found');
      }
    } catch (err) {
      console.error('Error fetching message:', err);
      setError(err.response?.data?.message || 'Failed to load message');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await contactService.updateStatus(message.id, newStatus);

      if (response.success) {
        setMessage((prev) => ({ ...prev, status: newStatus }));
        openSnackbar({
          open: true,
          message: 'Status updated successfully',
          variant: 'alert',
          alert: { color: 'success' }
        });
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      openSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update status',
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await contactService.deleteMessage(message.id);

      if (response.success) {
        openSnackbar({
          open: true,
          message: 'Message deleted successfully',
          variant: 'alert',
          alert: { color: 'success' }
        });
        navigate('/dashboard/contact-messages');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      openSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete message',
        variant: 'alert',
        alert: { color: 'error' }
      });
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      openSnackbar({ open: true, message: 'Reply message is required', variant: 'alert', alert: { color: 'error' } });
      return;
    }

    try {
      setSendingReply(true);
      const response = await contactService.reply(message.id, { subject: replySubject, message: replyMessage });
      if (response.success) {
        openSnackbar({ open: true, message: 'Reply sent successfully', variant: 'alert', alert: { color: 'success' } });
        setMessage((prev) => ({ ...prev, status: 'replied' }));
        setReplyMessage('');
      } else {
        throw new Error(response.message || 'Failed to send reply');
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      openSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to send reply',
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'primary',
      read: 'default',
      replied: 'success',
      archived: 'warning'
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !message) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Message not found'}
        </Alert>
        <Button startIcon={<ArrowLeft2 />} onClick={() => navigate('/dashboard/contact-messages')}>
          Back to Messages
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowLeft2 />} onClick={() => navigate('/dashboard/contact-messages')} sx={{ mb: 3 }}>
        Back to Messages
      </Button>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {message.subject}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <Chip label={message.status.toUpperCase()} color={getStatusColor(message.status)} size="small" />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(message.created_at)}
                </Typography>
              </Stack>
            </Box>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select value={message.status} label="Status" onChange={(e) => handleStatusChange(e.target.value)} disabled={updating}>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="read">Read</MenuItem>
                  <MenuItem value="replied">Replied</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
              <Button variant="outlined" color="error" startIcon={<Trash />} onClick={handleDelete}>
                Delete
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Sender Information */}
          <Stack spacing={2} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Sender Information
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <User size={20} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {message.name}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                {/* <Mail size={20} /> */}
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {message.email}
                  </Typography>
                </Box>
              </Stack>
              {message.phone && (
                <Stack direction="row" spacing={2} alignItems="center">
                  {/* <Phone size={20} /> */}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {message.phone}
                    </Typography>
                  </Box>
                </Stack>
              )}
              <Stack direction="row" spacing={2} alignItems="center">
                <Calendar size={20} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Received
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatDate(message.created_at)}
                  </Typography>
                </Box>
              </Stack>
              {message.user_id && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {message.user_id}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Message Content */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Message
            </Typography>
            <Box
              sx={{
                p: 3,
                bgcolor: 'background.default',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                mt: 2
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.message}
              </Typography>
            </Box>
          </Box>

          {/* Reply Form (Admin) */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Reply to Message
            </Typography>
            <Box sx={{ mt: 2 }}>
              <TextField label="Subject" fullWidth value={replySubject} onChange={(e) => setReplySubject(e.target.value)} sx={{ mb: 2 }} />
              <TextField
                label="Reply"
                fullWidth
                multiline
                minRows={4}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={handleSendReply} disabled={sendingReply}>
                  {sendingReply ? 'Sending...' : 'Send Reply'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setReplyMessage('');
                    setReplySubject('Re: ' + message.subject);
                  }}
                >
                  Reset
                </Button>
              </Stack>
            </Box>
          </Box>

          {/* Additional Info */}
          {(message.ip_address || message.user_agent) && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {message.ip_address && (
                    <Typography variant="body2" color="text.secondary">
                      IP Address: {message.ip_address}
                    </Typography>
                  )}
                  {message.user_agent && (
                    <Typography variant="body2" color="text.secondary">
                      User Agent: {message.user_agent}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
