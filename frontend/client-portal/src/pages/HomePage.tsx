import { Container, Typography, Button, Box, Grid, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Security, Language, Cloud } from '@mui/icons-material';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Legal Aid for Human Rights
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Secure, accessible platform connecting lawyers with those seeking justice
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            sx={{ mr: 2 }}
          >
            Get Started
          </Button>
          <Button
            component={RouterLink}
            to="/login"
            variant="outlined"
            size="large"
          >
            Sign In
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ my: 8 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
            <Security sx={{ fontSize: 60, color: 'primary.main' }} />
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Secure & Private
              </Typography>
              <Typography color="text.secondary">
                End-to-end encryption ensures your communications and documents
                remain confidential
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
            <Language sx={{ fontSize: 60, color: 'primary.main' }} />
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Multilingual Support
              </Typography>
              <Typography color="text.secondary">
                Platform available in 50+ languages to serve communities worldwide
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
            <Cloud sx={{ fontSize: 60, color: 'primary.main' }} />
            <CardContent>
              <Typography variant="h5" gutterBottom>
                AI-Powered Matching
              </Typography>
              <Typography color="text.secondary">
                Intelligent case triage connects you with the right legal expertise
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
