import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Plus, Menu, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar, CaseCard } from '../components/shared';
import { Case } from '../types/case.types';
import axios from 'axios';

export default function ClientDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await axios.get('/api/v1/cases');
      setCases(response.data.data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Sidebar */}
      <Sidebar
        role="client"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Navigation Bar */}
        <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'white' }}>
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setSidebarOpen(true)}
                sx={{ mr: 2 }}
              >
                <Menu size={24} />
              </IconButton>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
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
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  LEHELP
                </Typography>
                {!isMobile && (
                  <Typography variant="caption" color="text.secondary">
                    Client Portal
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {!isMobile && user && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user.displayName || user.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.anonymous ? 'Anonymous User' : 'Verified User'}
                  </Typography>
                </Box>
              )}
              <IconButton onClick={handleLogout} color="error">
                <LogOut size={20} />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
          <Container maxWidth="lg">
            {/* Hero CTA Card */}
            <Card
              sx={{
                mb: 4,
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(79, 70, 229, 0.3)',
                },
              }}
              onClick={() => navigate('/cases/new')}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      Submit a New Case
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Get connected with expert lawyers who can help with your human rights case
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                  >
                    New Case
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Active Cases Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Your Active Cases
              </Typography>

              {loading ? (
                <Typography color="text.secondary">Loading cases...</Typography>
              ) : cases.length === 0 ? (
                <Card>
                  <CardContent sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No cases yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Submit your first case to get started with legal assistance
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Plus size={20} />}
                      onClick={() => navigate('/cases/new')}
                    >
                      Submit Case
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {cases.map((caseData) => (
                    <Grid item xs={12} md={6} key={caseData.id}>
                      <CaseCard
                        case={caseData}
                        onClick={() => navigate(`/cases/${caseData.id}`)}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
