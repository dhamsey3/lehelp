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
  Link as MuiLink,
} from '@mui/material';
import { Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to access your secure account
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

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username (Anonymous ID)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                sx={{ mb: 2.5 }}
                autoComplete="username"
                helperText="Use your generated anonymous username"
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                autoComplete="current-password"
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
                {loading ? 'Signing In...' : 'Sign In Securely'}
              </Button>

              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <MuiLink component={Link} to="/register" sx={{ fontWeight: 600 }}>
                    Create New Account
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
