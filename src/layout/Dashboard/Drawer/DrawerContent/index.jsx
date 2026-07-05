// material-ui
import Box from '@mui/material/Box';

// project-imports
import Navigation from './Navigation';
import { useGetMenuMaster } from 'api/menu';
import { HEADER_HEIGHT } from 'config';

// ==============================|| DRAWER CONTENT ||============================== //

export default function DrawerContent() {
  const { menuMaster } = useGetMenuMaster();

  return (
    <Box
      sx={{
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        overflowY: 'auto',
        overflowX: 'hidden',
        // Thin custom scrollbar
        '&::-webkit-scrollbar': { width: 5 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.18)',
          borderRadius: 4
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(0,0,0,0.32)'
        }
      }}
    >
      <Navigation />
    </Box>
  );
}
