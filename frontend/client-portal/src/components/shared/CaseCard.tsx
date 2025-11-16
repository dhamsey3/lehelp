import React from 'react';
import { Card, CardContent, CardActions, Typography, Box } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import { Case } from '../../types/case.types';
import { StatusBadge } from './StatusBadge';
import { UrgencyBadge } from './UrgencyBadge';
import { format } from 'date-fns';

interface CaseCardProps {
  case: Case;
  onClick?: () => void;
  showUrgency?: boolean;
}

export const CaseCard: React.FC<CaseCardProps> = ({ 
  case: caseData, 
  onClick,
  showUrgency = false,
}) => {
  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-2px)',
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              {caseData.caseNumber}
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {caseData.title}
            </Typography>
          </Box>
          {onClick && (
            <ChevronRight size={20} color="#6B7280" />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <StatusBadge status={caseData.status} />
          {showUrgency && <UrgencyBadge urgency={caseData.urgency} />}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {caseData.description.substring(0, 120)}
          {caseData.description.length > 120 ? '...' : ''}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(caseData.createdAt), 'MMM dd, yyyy')}
          </Typography>
          {caseData.documentsCount !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {caseData.documentsCount} documents
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
