// material-ui
import { useTheme } from '@mui/material/styles';

import imgLogo from 'assets/ESC-Icon-Black-Trans.png';

// ==============================|| LOGO SVG ||============================== //

export default function LogoMain() {
  const theme = useTheme();

  return (
    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     *
     * <img src={theme.palette.mode === ThemeMode.DARK ? logoDark : logo} alt="icon logo" width="100" />
     *
     */
    <img src={imgLogo} alt="ESC Wear Logo" width="100" />
  );
}
