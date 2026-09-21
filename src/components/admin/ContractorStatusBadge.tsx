/**
 * You Want Services - Contractor Status Badge Component
 * Phase 6 Architecture
 */

import React from 'react';
import { Badge } from '../common/UIComponents';
import {
  ContractorOnboardingStatus,
  VerificationCategoryStatus,
  DocumentReviewStatus,
} from '../../types/database';

interface ContractorStatusBadgeProps {
  status?: ContractorOnboardingStatus | VerificationCategoryStatus | DocumentReviewStatus | string;
  type?: 'onboarding' | 'verification' | 'document';
  className?: string;
}

export const ContractorStatusBadge: React.FC<ContractorStatusBadgeProps> = ({
  status = 'PENDING_REVIEW',
  type = 'onboarding',
  className = '',
}) => {
  const norm = String(status).toUpperCase();

  // Onboarding statuses
  if (type === 'onboarding') {
    switch (norm) {
      case 'APPROVED':
        return <Badge variant="success" className={className}>Approved</Badge>;
      case 'PENDING_REVIEW':
      case 'SUBMITTED':
        return <Badge variant="warning" className={className}>Pending Review</Badge>;
      case 'ACTION_REQUIRED':
        return <Badge variant="danger" className={className}>Action Required</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="info" className={className}>In Progress</Badge>;
      case 'NOT_STARTED':
        return <Badge variant="neutral" className={className}>Not Started</Badge>;
      case 'REJECTED':
        return <Badge variant="danger" className={className}>Rejected</Badge>;
      case 'SUSPENDED':
        return <Badge variant="danger" className={className}>Suspended</Badge>;
      case 'DEACTIVATED':
        return <Badge variant="neutral" className={className}>Deactivated</Badge>;
      default:
        return <Badge variant="neutral" className={className}>{norm}</Badge>;
    }
  }

  // Document review statuses
  if (type === 'document') {
    switch (norm) {
      case 'ACCEPTED':
      case 'VERIFIED':
        return <Badge variant="success" className={className}>Accepted</Badge>;
      case 'REJECTED':
        return <Badge variant="danger" className={className}>Rejected</Badge>;
      case 'UNDER_REVIEW':
      case 'PENDING':
        return <Badge variant="warning" className={className}>Under Review</Badge>;
      case 'EXPIRED':
        return <Badge variant="danger" className={className}>Expired</Badge>;
      case 'UPLOADED':
        return <Badge variant="info" className={className}>Uploaded</Badge>;
      default:
        return <Badge variant="neutral" className={className}>{norm}</Badge>;
    }
  }

  // Verification category statuses
  switch (norm) {
    case 'VERIFIED':
      return <Badge variant="success" className={className}>Verified</Badge>;
    case 'PENDING_REVIEW':
    case 'SUBMITTED':
    case 'PENDING':
      return <Badge variant="warning" className={className}>Pending Audit</Badge>;
    case 'FAILED':
      return <Badge variant="danger" className={className}>Failed</Badge>;
    case 'EXPIRED':
      return <Badge variant="danger" className={className}>Expired</Badge>;
    case 'NOT_STARTED':
    case 'NOT_VERIFIED':
      return <Badge variant="neutral" className={className}>Not Verified</Badge>;
    case 'NOT_APPLICABLE':
      return <Badge variant="neutral" className={className}>N/A</Badge>;
    default:
      return <Badge variant="neutral" className={className}>{norm}</Badge>;
  }
};
