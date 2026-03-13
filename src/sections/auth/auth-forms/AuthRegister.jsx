import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { Formik } from 'formik';
import * as Yup from 'yup';

// project-imports
import { openSnackbar } from 'api/snackbar';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import GoogleLoginButton from 'components/GoogleLoginButton';
import AuthDivider from 'sections/auth/AuthDivider';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';
import { strengthColor, strengthIndicator } from 'utils/password-strength';
import { authService } from 'api/auth';
import { preload } from 'swr';
import { fetcher } from 'utils/axios';

// assets
import { Eye, EyeSlash } from 'iconsax-react';

// ============================|| JWT - REGISTER ||============================ //

export default function AuthRegister() {
  const { register, googleLogin } = useAuth();
  const scriptedRef = useScriptRef();
  const navigate = useNavigate();

  const [level, setLevel] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const changePassword = (value) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  useEffect(() => {
    changePassword('');
  }, []);

  const handleGoogleSuccess = async (credential) => {
    try {
      setGoogleLoading(true);
      await googleLogin(credential);
      
      // Show success message
      openSnackbar({
        open: true,
        message: 'Successfully registered with Google',
        variant: 'alert',
        alert: { color: 'success' }
      });
      
      // Navigate to dashboard or home
      preload('api/menu/dashboard', fetcher);
      navigate('/dashboard');
    } catch (err) {
      console.error('Google registration error:', err);
      openSnackbar({
        open: true,
        message: err.message || 'Failed to register with Google',
        variant: 'alert',
        alert: { color: 'error' }
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google registration error:', error);
    openSnackbar({
      open: true,
      message: error.message || 'Google Sign-In failed',
      variant: 'alert',
      alert: { color: 'error' }
    });
  };

  return (
    <>
      <Formik
        initialValues={{
          firstname: '',
          lastname: '',
          email: '',
          phone: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          firstname: Yup.string().max(255).required('First Name is required'),
          lastname: Yup.string().max(255).required('Last Name is required'),
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          phone: Yup.string()
            .required('Phone number is required')
            .matches(/^[0-9+\-\s()]+$/, 'Phone number is not valid')
            .min(10, 'Phone number must be at least 10 digits'),
          password: Yup.string()
            .required('Password is required')
            .test('no-leading-trailing-whitespace', 'Password can not start or end with spaces', (value) => value === value.trim())
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password must not exceed 128 characters')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            const trimmedEmail = values.email.trim();
            const trimmedPhone = values.phone.trim();
            await register(trimmedEmail, values.password, values.firstname, values.lastname, trimmedPhone);
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
              openSnackbar({
                open: true,
                message: 'Your registration has been successfully completed.',
                variant: 'alert',

                alert: {
                  color: 'success'
                }
              });

              setTimeout(() => {
                navigate('/login', { replace: true });
              }, 1500);
            }
          } catch (err) {
            console.error(err);
            if (scriptedRef.current) {
              setStatus({ success: false });
              
              // Extract errors from API response
              const formErrors = {};
              
              if (err.errors) {
                // Map backend field names to form field names
                Object.keys(err.errors).forEach((field) => {
                  const fieldName = field === 'first_name' ? 'firstname' : 
                                   field === 'last_name' ? 'lastname' : 
                                   field;
                  
                  // Get first error message from array
                  const errorMessage = Array.isArray(err.errors[field]) 
                    ? err.errors[field][0] 
                    : err.errors[field];
                  
                  formErrors[fieldName] = errorMessage;
                });
              }
              
              // If no field-specific errors, show general error message
              if (Object.keys(formErrors).length === 0) {
                formErrors.submit = err.message || 'Registration failed. Please try again.';
              } else {
                // Show snackbar with general message if there are field errors
                openSnackbar({
                  open: true,
                  message: err.message || 'Please fix the errors below',
                  variant: 'alert',
                  alert: { color: 'error' }
                });
              }
              
              setErrors(formErrors);
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="firstname-signup">First Name*</InputLabel>
                  <OutlinedInput
                    id="firstname-login"
                    type="firstname"
                    value={values.firstname}
                    name="firstname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="John"
                    fullWidth
                    error={Boolean(touched.firstname && errors.firstname)}
                  />
                </Stack>
                {touched.firstname && errors.firstname && (
                  <FormHelperText error id="helper-text-firstname-signup">
                    {errors.firstname}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="lastname-signup">Last Name*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.lastname && errors.lastname)}
                    id="lastname-signup"
                    type="lastname"
                    value={values.lastname}
                    name="lastname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Doe"
                    inputProps={{}}
                  />
                </Stack>
                {touched.lastname && errors.lastname && (
                  <FormHelperText error id="helper-text-lastname-signup">
                    {errors.lastname}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="email-signup">Email Address*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="demo@company.com"
                    inputProps={{}}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="helper-text-email-signup">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="phone-signup">Phone Number*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.phone && errors.phone)}
                    id="phone-signup"
                    type="tel"
                    value={values.phone}
                    name="phone"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="+20 123 456 7890"
                    inputProps={{}}
                  />
                </Stack>
                {touched.phone && errors.phone && (
                  <FormHelperText error id="helper-text-phone-signup">
                    {errors.phone}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="password-signup">Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-signup"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      changePassword(e.target.value);
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <Eye /> : <EyeSlash />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="******"
                    inputProps={{}}
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="helper-text-password-signup">
                    {errors.password}
                  </FormHelperText>
                )}
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                    <Grid>
                      <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                    </Grid>
                    <Grid>
                      <Typography variant="subtitle1" sx={{ fontSize: '0.75rem' }}>
                        {level?.label}
                      </Typography>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <Typography variant="body2">
                  By Signing up, you agree to our &nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="#">
                    Terms of Service
                  </Link>
                  &nbsp; and &nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="#">
                    Privacy Policy
                  </Link>
                </Typography>
              </Grid>
              {errors.submit && (
                <Grid size={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid size={12}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting || googleLoading} fullWidth size="large" type="submit" variant="contained" color="primary">
                    Create Account
                  </Button>
                </AnimateButton>
              </Grid>
              
              <Grid size={12}>
                <AuthDivider>
                  <Typography variant="caption">OR</Typography>
                </AuthDivider>
              </Grid>
              
              <Grid size={12}>
                <GoogleLoginButton 
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  disabled={isSubmitting || googleLoading}
                />
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}
