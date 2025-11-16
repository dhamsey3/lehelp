import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CaseCategory, CaseUrgency, caseCategoryLabels } from '../types/case.types';
import { apiService } from '../services/api.service';

export default function NewCasePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CaseCategory>('other');
  const [urgency, setUrgency] = useState<CaseUrgency>('medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories: { value: CaseCategory; label: string }[] = Object.entries(caseCategoryLabels).map(
    ([value, label]) => ({
      value: value as CaseCategory,
      label,
    })
  );

  const urgencyLevels: { value: CaseUrgency; label: string }[] = [
    { value: 'low', label: 'Low - No immediate threat' },
    { value: 'medium', label: 'Medium - Needs attention' },
    { value: 'high', label: 'High - Urgent situation' },
    { value: 'critical', label: 'Critical - Life-threatening' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await apiService.cases.create({
        title,
        category,
        urgency,
        description,
        location: location || undefined,
        anonymous: user?.anonymous,
      });

      navigate('/cases');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'white' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowLeft size={24} />
          </IconButton>

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
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Submit New Case
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Form Content */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Case Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Provide details about your case. All information is encrypted and secure.
            </Typography>

            {/* Security Notice */}
            <Alert severity="info" sx={{ mb: 4 }}>
              <Typography variant="body2">
                🔒 Your case will be submitted anonymously and reviewed by our AI system to match
                you with the most suitable lawyer.
              </Typography>
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Case Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                sx={{ mb: 3 }}
                helperText="Brief summary of your case"
              />

              <TextField
                fullWidth
                select
                label="Case Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CaseCategory)}
                required
                sx={{ mb: 3 }}
              >
                {categories.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                label="Urgency Level"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as CaseUrgency)}
                required
                sx={{ mb: 3 }}
              >
                {urgencyLevels.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Location (Optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                sx={{ mb: 3 }}
                helperText="City, country, or region"
              />

              <TextField
                fullWidth
                label="Case Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                multiline
                rows={8}
                sx={{ mb: 4 }}
                helperText="Provide detailed information about your situation"
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    px: 4,
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Case'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
