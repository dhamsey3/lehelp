import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { CaseUrgency, caseUrgencyColors } from '../../types/case.types';

interface UrgencyBadgeProps extends Omit<ChipProps, 'label' | 'color'> {
  urgency: CaseUrgency;
}

const urgencyLabels: Record<CaseUrgency, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency, ...props }) => {
  const color = caseUrgencyColors[urgency];
  const label = urgencyLabels[urgency];

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        backgroundColor: color,
        color: '#fff',
        fontWeight: 500,
        fontSize: '0.75rem',
        height: 24,
        ...props.sx,
      }}
      {...props}
    />
  );
};
