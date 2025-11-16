import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: 'grey.900',
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
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
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              LEHELP
            </Typography>
            <Typography variant="caption" sx={{ color: 'grey.400' }}>
              Legal Aid Platform for Human Rights
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: 'grey.400', mb: 2 }}>
          Secure, anonymous legal assistance for human rights cases. End-to-end encrypted communications
          protecting vulnerable individuals worldwide.
        </Typography>

        <Box
          sx={{
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'grey.800',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            © {new Date().getFullYear()} LEHELP. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            Privacy-First • End-to-End Encrypted • GDPR Compliant
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
