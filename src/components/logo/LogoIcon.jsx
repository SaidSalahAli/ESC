// material-ui
import { useTheme } from '@mui/material/styles';
import imgIcon from 'assets/ESC-Icon-Black-Trans.png';
/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoIconDark from 'assets/images/logo-icon-dark.svg';
 * import logoIcon from 'assets/images/logo-icon.svg';
 *
 */

// ==============================|| LOGO ICON SVG ||============================== //

export default function LogoIcon() {
  const theme = useTheme();

  return <img src={imgIcon} alt="ESC Wear Logo" width="100" />;
}
