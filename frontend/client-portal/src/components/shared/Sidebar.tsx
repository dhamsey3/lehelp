import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, useMediaQuery, useTheme } from '@mui/material';
import { Home, Briefcase, MessageSquare, FileText, User, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '../../types/user.types';

interface SidebarProps {
  role: UserRole;
  open?: boolean;
  onClose?: () => void;
}

const clientMenuItems = [
  { label: 'My Cases', path: '/cases', icon: Briefcase },
  { label: 'Messages', path: '/messages', icon: MessageSquare },
  { label: 'Documents', path: '/documents', icon: FileText },
  { label: 'Profile', path: '/profile', icon: User },
];

const lawyerMenuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'My Cases', path: '/cases', icon: Briefcase },
  { label: 'Messages', path: '/messages', icon: MessageSquare },
  { label: 'Documents', path: '/documents', icon: FileText },
  { label: 'Profile', path: '/profile', icon: User },
];

const activistMenuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Cases', path: '/cases', icon: Briefcase },
  { label: 'Messages', path: '/messages', icon: MessageSquare },
  { label: 'Profile', path: '/profile', icon: User },
];

export const Sidebar: React.FC<SidebarProps> = ({ role, open = true, onClose }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = React.useMemo(() => {
    switch (role) {
      case 'client':
        return clientMenuItems;
      case 'lawyer':
        return lawyerMenuItems;
      case 'activist':
        return activistMenuItems;
      default:
        return [];
    }
  }, [role]);

  const sidebarContent = (
    <Box sx={{ width: 240, pt: 2 }}>
      {isMobile && onClose && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pb: 2 }}>
          <Box sx={{ cursor: 'pointer' }} onClick={onClose}>
            <X size={24} />
          </Box>
        </Box>
      )}
      <List>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderLeft: isActive ? '3px solid' : '3px solid transparent',
                  borderLeftColor: isActive ? 'primary.main' : 'transparent',
                  bgcolor: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(79, 70, 229, 0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'text.secondary' }}>
                  <Icon size={20} />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'primary.main' : 'text.primary',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {sidebarContent}
    </Box>
  );
};
