import React, { useEffect, useMemo, useState } from 'react';
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
import AddIcon from '@mui/icons-material/Add';
import GavelIcon from '@mui/icons-material/Gavel';
import { apiService } from '../services/api.service';
import { Case, CaseUrgency, CaseStatus } from '../types/case.types';
import { useAuth } from '../contexts/AuthContext';

type DashboardCase = Case & {
  lawyer_name?: string;
  case_type?: string;
  created_at?: string;
};

export const CaseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cases, setCases] = useState<DashboardCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchCases = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await apiService.cases.getAll();
        if (!isMounted) return;

        const caseData = response.data.data ?? [];
        setCases(caseData);
      } catch (err: any) {
        if (!isMounted) return;
        const message =
          err?.response?.data?.message || err?.message || 'Failed to load cases';
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCases();

    return () => {
      isMounted = false;
    };
  }, []);

  const getUrgencyColor = (urgency: CaseUrgency) => {
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

  const getStatusColor = (status: CaseStatus) => {
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

  const role = user?.role ?? 'client';

  const emptyStateCta = useMemo(
    () =>
      role === 'client' && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/cases/new')}
          sx={{ mt: 2 }}
        >
          Submit Your First Case
        </Button>
      ),
    [navigate, role]
  );

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
          {role === 'lawyer' ? 'My Cases' : 'My Legal Cases'}
        </Typography>

        {role === 'client' && (
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
            {emptyStateCta}
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
                    Type:{' '}
                    {(caseItem.category || caseItem.case_type || 'unknown')
                      .replaceAll('_', ' ')
                      .toUpperCase()}
                  </Typography>

                  {(caseItem.lawyer_name || (caseItem as any).assignedLawyerId) && (
                    <Typography variant="body2" color="text.secondary">
                      Assigned to: {caseItem.lawyer_name || (caseItem as any).assignedLawyerId}
                    </Typography>
                  )}

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Created: {new Date(caseItem.createdAt || caseItem.created_at || new Date()).toLocaleDateString()}
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
