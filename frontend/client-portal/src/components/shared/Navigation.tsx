import React from 'react';
import { AppBar, Toolbar, Box, Button, IconButton, useMediaQuery, useTheme, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Menu, X, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Navigation: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Cases', path: '/cases' },
    { label: 'Lawyers', path: '/lawyers' },
    { label: 'Resources', path: '/resources' },
    { label: 'About', path: '/about' },
  ];

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pb: 2 }}>
        <IconButton onClick={handleDrawerToggle}>
          <X size={24} />
        </IconButton>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        {isAuthenticated ? (
          <>
            <ListItem
              component={Link}
              to="/dashboard"
              onClick={handleDrawerToggle}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem
              onClick={() => {
                handleLogout();
                handleDrawerToggle();
              }}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemText primary="Sign Out" />
            </ListItem>
          </>
        ) : (
          <ListItem
            component={Link}
            to="/login"
            onClick={handleDrawerToggle}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemText primary="Sign In" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'white' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shield size={24} color="white" />
            </Box>
            <Box>
              <Box sx={{ fontWeight: 700, fontSize: '1.25rem', color: 'text.primary' }}>
                LEHELP
              </Box>
              <Box sx={{ fontSize: '0.625rem', color: 'text.secondary', mt: -0.5 }}>
                Legal Aid Platform
              </Box>
            </Box>
          </Box>

          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <Menu size={24} />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{ color: 'text.primary', textTransform: 'none' }}
                >
                  {item.label}
                </Button>
              ))}
              {isAuthenticated ? (
                <>
                  <Button
                    component={Link}
                    to="/dashboard"
                    sx={{ color: 'text.primary', textTransform: 'none' }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outlined"
                    sx={{ textTransform: 'none' }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    sx={{ textTransform: 'none' }}
                  >
                    Sign In
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                      textTransform: 'none',
                    }}
                  >
                    Get Help Now
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};
