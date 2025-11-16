import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

// Simple layout wrapper for protected routes
// Individual pages (dashboards) now handle their own navigation
const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Outlet />
    </Box>
  );
};

export default Layout;
