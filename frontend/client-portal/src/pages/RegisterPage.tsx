import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Link as MuiLink,
} from '@mui/material';
import { Eye, EyeOff, Shield, ArrowLeft, User, Scale, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user.types';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>('client');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [organization, setOrganization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'client' as UserRole, label: 'Client', icon: User, description: 'Seeking legal help' },
    { value: 'lawyer' as UserRole, label: 'Lawyer', icon: Scale, description: 'Provide legal aid' },
    { value: 'activist' as UserRole, label: 'Activist', icon: Heart, description: 'Support causes' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: username || `user_${Date.now()}`,
        password,
        role,
        displayName: displayName || undefined,
        organization: organization || undefined,
        anonymous: !displayName,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
      }}
    >
      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 4 }}>
        <Card sx={{ width: '100%', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}>
          <CardContent sx={{ p: 5 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Shield size={32} color="white" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join LEHELP - Secure and Anonymous
              </Typography>
            </Box>

            {/* Security Notice */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                🔒 No email required. Your identity remains anonymous and protected.
              </Typography>
            </Alert>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              {/* Role Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                  I am a:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const isSelected = role === r.value;
                    return (
                      <Button
                        key={r.value}
                        onClick={() => setRole(r.value)}
                        variant={isSelected ? 'contained' : 'outlined'}
                        sx={{
                          flex: 1,
                          minWidth: 120,
                          py: 2,
                          flexDirection: 'column',
                          gap: 1,
                          bgcolor: isSelected ? 'primary.main' : 'transparent',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          '&:hover': {
                            bgcolor: isSelected ? 'primary.dark' : 'rgba(79, 70, 229, 0.04)',
                          },
                        }}
                      >
                        <Icon size={24} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {r.label}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {r.description}
                          </Typography>
                        </Box>
                      </Button>
                    );
                  })}
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Username (Optional - will generate anonymous ID)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2.5 }}
                autoComplete="username"
                helperText="Leave empty for automatic anonymous username"
              />

              <TextField
                fullWidth
                label="Display Name (Optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                sx={{ mb: 2.5 }}
                helperText="Optional - only visible to you"
              />

              {(role === 'lawyer' || role === 'activist') && (
                <TextField
                  fullWidth
                  label="Organization (Optional)"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  sx={{ mb: 2.5 }}
                  helperText="Your firm or organization name"
                />
              )}

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 2.5 }}
                autoComplete="new-password"
                helperText="Minimum 8 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                autoComplete="new-password"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mb: 2,
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  py: 1.5,
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account Securely'}
              </Button>

              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <MuiLink component={Link} to="/login" sx={{ fontWeight: 600 }}>
                    Sign In
                  </MuiLink>
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  component={Link}
                  to="/"
                  startIcon={<ArrowLeft size={16} />}
                  sx={{ color: 'text.secondary' }}
                >
                  Back to Home
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
