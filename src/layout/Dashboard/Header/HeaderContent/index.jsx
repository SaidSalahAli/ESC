// src/layout/Dashboard/Header/HeaderContent/index.jsx
import { useMemo } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project-imports
import FullScreen from './FullScreen';
import Localization from './Localization';
import MobileSection from './MobileSection';
import Notification from './Notification';
import UserMenuDropdown from './UserMenuDropdown';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import DrawerHeader from 'layout/Dashboard/Drawer/DrawerHeader';
import Search from './Search';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const { menuOrientation } = useConfig();
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const localization = useMemo(() => <Localization />, []);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: 1 }}>
      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      {!downLG && <Search />}
      {!downLG && localization}
      {downLG && <Box sx={{ width: 1, ml: 1 }} />}

      <Notification />
      {!downLG && <FullScreen />}

      {!downLG && <UserMenuDropdown />}

      {downLG && <MobileSection />}
    </Box>
  );
}
