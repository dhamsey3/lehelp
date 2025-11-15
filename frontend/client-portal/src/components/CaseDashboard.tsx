import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import GavelIcon from '@mui/icons-material/Gavel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface Case {
  id: string;
  title: string;
  case_type: string;
  status: string;
  urgency: string;
  created_at: string;
  lawyer_name?: string;
}

export const CaseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/cases`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCases(response.data.data.cases);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'success';
      case 'pending_assignment':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {user.role === 'lawyer' ? 'My Cases' : 'My Legal Cases'}
        </Typography>
        
        {user.role === 'client' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/cases/new')}
          >
            Submit New Case
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {cases.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <GavelIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No cases yet
            </Typography>
            {user.role === 'client' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/cases/new')}
                sx={{ mt: 2 }}
              >
                Submit Your First Case
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {cases.map((caseItem) => (
            <Grid item xs={12} md={6} key={caseItem.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => navigate(`/cases/${caseItem.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip
                      label={caseItem.urgency.toUpperCase()}
                      color={getUrgencyColor(caseItem.urgency)}
                      size="small"
                    />
                    <Chip
                      label={caseItem.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(caseItem.status)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="h6" component="h2" gutterBottom>
                    {caseItem.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Type: {caseItem.case_type.replace('_', ' ')}
                  </Typography>

                  {caseItem.lawyer_name && (
                    <Typography variant="body2" color="text.secondary">
                      Assigned to: {caseItem.lawyer_name}
                    </Typography>
                  )}

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Created: {new Date(caseItem.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CaseDashboard;
