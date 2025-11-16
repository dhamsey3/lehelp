import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, Paper } from '@mui/material';
import { Shield, Lock, Globe, CheckCircle, Zap, Users, Scale, MessageSquare, FileText, UserCheck, AlertTriangle, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Footer } from '../components/shared';
import { caseCategoryLabels } from '../types/case.types';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: 'Anonymous Protection',
      items: ['No email required', 'Encrypted communications', 'Identity protection'],
    },
    {
      icon: Zap,
      title: 'AI-Powered Matching',
      items: ['Automatic classification', 'Expert matching', 'Multilingual support'],
    },
    {
      icon: Lock,
      title: 'Maximum Security',
      items: ['End-to-end encryption', 'Secure storage', 'GDPR compliant'],
    },
  ];

  const caseTypes = [
    { icon: Users, label: caseCategoryLabels.asylum_refugee, color: '#3B82F6' },
    { icon: AlertTriangle, label: caseCategoryLabels.torture, color: '#EF4444' },
    { icon: Lock, label: caseCategoryLabels.arbitrary_detention, color: '#F59E0B' },
    { icon: UserCheck, label: caseCategoryLabels.enforced_disappearance, color: '#8B5CF6' },
    { icon: Scale, label: caseCategoryLabels.discrimination, color: '#10B981' },
    { icon: Megaphone, label: caseCategoryLabels.freedom_expression, color: '#EC4899' },
  ];

  const trustIndicators = [
    { icon: Lock, text: 'End-to-End Encrypted' },
    { icon: Shield, text: 'Anonymous Access' },
    { icon: Globe, text: '24/7 Available' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  fontWeight: 700,
                  mb: 3,
                  lineHeight: 1.2,
                }}
              >
                Secure Legal Aid for Human Rights
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  opacity: 0.95,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  fontWeight: 400,
                }}
              >
                Anonymous, encrypted platform connecting vulnerable individuals with expert lawyers
                and human rights activists worldwide.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  Submit Case Anonymously
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Join as Lawyer
                </Button>
              </Box>

              {/* Trust Indicators */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {trustIndicators.map((indicator, index) => {
                  const Icon = indicator.icon;
                  return (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon size={20} />
                      <Typography variant="body2">{indicator.text}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 3,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      500+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cases Resolved
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                      150+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expert Lawyers
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h2"
          sx={{
            textAlign: 'center',
            mb: 2,
            fontSize: { xs: '1.75rem', md: '2.25rem' },
          }}
        >
          Why Choose LEHELP?
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 6, maxWidth: 600, mx: 'auto' }}
        >
          Our platform provides secure, anonymous legal assistance with cutting-edge security
          and AI-powered case matching.
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                      }}
                    >
                      <Icon size={28} color="white" />
                    </Box>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {feature.items.map((item, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle size={16} color="#10B981" />
                          <Typography variant="body2" color="text.secondary">
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* Case Types Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              mb: 2,
              fontSize: { xs: '1.75rem', md: '2.25rem' },
            }}
          >
            Case Types We Handle
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: 'center', mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Our network of expert lawyers specializes in various human rights cases worldwide.
          </Typography>

          <Grid container spacing={3}>
            {caseTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: `${type.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={24} color={type.color} />
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {type.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
          color: 'white',
          py: 10,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
            Need Legal Help?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9, fontSize: '1.125rem' }}>
            Submit your case anonymously and get connected with expert lawyers who can help.
            Your privacy and security are our top priorities.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              bgcolor: 'white',
              color: 'text.primary',
              px: 5,
              py: 2,
              fontSize: '1rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
