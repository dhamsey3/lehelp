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
  CardActions,
} from '@mui/material';
import { Menu, LogOut, Shield, TrendingUp, Inbox, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar, UrgencyBadge } from '../components/shared';
import { Case } from '../types/case.types';
import { LawyerStats } from '../types/lawyer.types';
import axios from 'axios';
import { format } from 'date-fns';

export default function LawyerDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newCases, setNewCases] = useState<Case[]>([]);
  const [stats, setStats] = useState<LawyerStats>({
    activeCases: 0,
    newRequests: 0,
    totalResolved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch new case requests (pending cases)
      const casesResponse = await axios.get('/api/v1/cases?status=pending');
      setNewCases(casesResponse.data.data || []);

      // Fetch lawyer stats (you may need to create this endpoint)
      const statsResponse = await axios.get('/api/v1/lawyers/stats');
      setStats(statsResponse.data.data || stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCase = async (caseId: string) => {
    try {
      await axios.post(`/api/v1/cases/${caseId}/accept`);
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error('Error accepting case:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const statsCards = [
    {
      title: 'Active Cases',
      value: stats.activeCases,
      icon: TrendingUp,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
    },
    {
      title: 'New Requests',
      value: stats.newRequests,
      icon: Inbox,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
    },
    {
      title: 'Total Resolved',
      value: stats.totalResolved,
      icon: CheckCircle2,
      color: '#10B981',
      bgColor: '#F0FDF4',
    },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Sidebar */}
      <Sidebar
        role="lawyer"
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
                    Lawyer Portal
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
                    Lawyer
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
            {/* Welcome Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Welcome back, {user?.displayName || user?.username}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Here's an overview of your cases and new requests
              </Typography>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {statsCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Grid item xs={12} sm={4} key={index}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {stat.title}
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 700, color: stat.color }}>
                              {stat.value}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              bgcolor: stat.bgColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon size={24} color={stat.color} />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* New Case Requests */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                New Case Requests
              </Typography>

              {loading ? (
                <Typography color="text.secondary">Loading cases...</Typography>
              ) : newCases.length === 0 ? (
                <Card>
                  <CardContent sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No new case requests
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Check back later for new cases that match your expertise
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {newCases.map((caseData) => (
                    <Grid item xs={12} md={6} key={caseData.id}>
                      <Card
                        sx={{
                          height: '100%',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                          },
                        }}
                      >
                        <CardContent>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              {caseData.caseNumber}
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                              {caseData.title}
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <UrgencyBadge urgency={caseData.urgency} />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {caseData.description.substring(0, 150)}
                              {caseData.description.length > 150 ? '...' : ''}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Posted {format(new Date(caseData.createdAt), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                        </CardContent>
                        <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleAcceptCase(caseData.id)}
                            sx={{
                              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                            }}
                          >
                            Accept Case
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/cases/${caseData.id}`)}
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
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
