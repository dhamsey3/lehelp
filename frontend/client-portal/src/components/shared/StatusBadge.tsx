import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { CaseStatus, caseStatusColors } from '../../types/case.types';

interface StatusBadgeProps extends Omit<ChipProps, 'label' | 'color'> {
  status: CaseStatus;
}

const statusLabels: Record<CaseStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  resolved: 'Resolved',
  closed: 'Closed',
  urgent: 'Urgent',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, ...props }) => {
  const color = caseStatusColors[status];
  const label = statusLabels[status];

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
