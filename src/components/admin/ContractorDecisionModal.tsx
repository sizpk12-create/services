/**
 * You Want Services - Contractor Decision Modal Component
 * Phase 6 Architecture
 *
 * Implements Administrative Decision Workflows:
 * - Approve Contractor (with requirements validation)
 * - Request Correction (with multi-select checklist & instructions)
 * - Reject Contractor (with structured reason & notes)
 * - Suspend Contractor (with reason & marketplace deactivation)
 * - Deactivate Contractor (with reason & confirmation)
 */

import React, { useState } from 'react';
import {
  ContractorProfile,
  ContractorRejectionReason,
} from '../../types/database';
import { contractorVerificationService } from '../../services/contractorVerificationService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/UIComponents';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  PauseCircle,
  PowerOff,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';

export type DecisionType = 'APPROVE' | 'REQUEST_CORRECTION' | 'REJECT' | 'SUSPEND' | 'DEACTIVATE';

interface ContractorDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisionType: DecisionType | null;
  contractor: ContractorProfile | null;
  onDecisionCompleted: (updatedProfile?: ContractorProfile) => void;
}

const REJECTION_REASONS: ContractorRejectionReason[] = [
  'Missing information',
  'Invalid information',
  'Required documentation missing',
  'Documentation unacceptable',
  'License issue',
  'Insurance issue',
  'Business information incomplete',
  'Other',
];

const CORRECTION_ITEMS = [
  'Business Information & Legal Entity',
  'Service Categories & Trades Selection',
  'Service Area & Dispatch Territory',
  'Trade License Information',
  'Certificate of Liability Insurance',
  'Uploaded Credentials Documents',
  'Business Hours & Contact Methods',
  'Business Description & Details',
];

export const ContractorDecisionModal: React.FC<ContractorDecisionModalProps> = ({
  isOpen,
  onClose,
  decisionType,
  contractor,
  onDecisionCompleted,
}) => {
  const { currentUser: user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Approve State
  const [approvalNotes, setApprovalNotes] = useState('All verification requirements satisfied. Contractor is approved for marketplace distribution.');

  // Request Correction State
  const [selectedCorrectionItems, setSelectedCorrectionItems] = useState<string[]>([
    'Trade License Information',
  ]);
  const [correctionInstructions, setCorrectionInstructions] = useState('');

  // Reject State
  const [rejectionReason, setRejectionReason] = useState<ContractorRejectionReason>('Documentation unacceptable');
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Suspend State
  const [suspensionReason, setSuspensionReason] = useState('');

  // Deactivate State
  const [deactivationReason, setDeactivationReason] = useState('');
  const [confirmDeactivation, setConfirmDeactivation] = useState(false);

  if (!isOpen || !decisionType || !contractor) return null;

  const toggleCorrectionItem = (item: string) => {
    setSelectedCorrectionItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorMessage('Active administrator session required.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      if (decisionType === 'APPROVE') {
        const res = contractorVerificationService.approveContractor(contractor.id, {
          reviewer: user,
          approvalNotes,
        });
        if (res.success) {
          onDecisionCompleted(res.contractor);
          onClose();
        } else {
          setErrorMessage(res.message);
        }
      } else if (decisionType === 'REQUEST_CORRECTION') {
        if (selectedCorrectionItems.length === 0) {
          setErrorMessage('Please select at least one item requiring correction.');
          setIsProcessing(false);
          return;
        }
        if (!correctionInstructions.trim()) {
          setErrorMessage('Please provide specific instructions to the contractor.');
          setIsProcessing(false);
          return;
        }
        const res = contractorVerificationService.requestCorrection(contractor.id, {
          reviewer: user,
          items: selectedCorrectionItems,
          instructions: correctionInstructions,
        });
        if (res.success) {
          onDecisionCompleted(res.contractor);
          onClose();
        } else {
          setErrorMessage(res.message);
        }
      } else if (decisionType === 'REJECT') {
        if (!rejectionNotes.trim()) {
          setErrorMessage('Please provide explanatory notes for the rejection.');
          setIsProcessing(false);
          return;
        }
        const res = contractorVerificationService.rejectContractor(contractor.id, {
          reviewer: user,
          reason: rejectionReason,
          notes: rejectionNotes,
        });
        if (res.success) {
          onDecisionCompleted(res.contractor);
          onClose();
        } else {
          setErrorMessage(res.message);
        }
      } else if (decisionType === 'SUSPEND') {
        if (!suspensionReason.trim()) {
          setErrorMessage('A specific reason for account suspension is required.');
          setIsProcessing(false);
          return;
        }
        const res = contractorVerificationService.suspendContractor(contractor.id, {
          reviewer: user,
          reason: suspensionReason,
        });
        if (res.success) {
          onDecisionCompleted(res.contractor);
          onClose();
        } else {
          setErrorMessage(res.message);
        }
      } else if (decisionType === 'DEACTIVATE') {
        if (!confirmDeactivation) {
          setErrorMessage('Please confirm that you intend to deactivate this contractor account.');
          setIsProcessing(false);
          return;
        }
        if (!deactivationReason.trim()) {
          setErrorMessage('Please provide a reason for deactivation.');
          setIsProcessing(false);
          return;
        }
        const res = contractorVerificationService.deactivateContractor(contractor.id, {
          reviewer: user,
          reason: deactivationReason,
        });
        if (res.success) {
          onDecisionCompleted(res.contractor);
          onClose();
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while processing decision.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 text-center">
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-xl p-6 border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              {decisionType === 'APPROVE' && <CheckCircle className="w-6 h-6 text-emerald-600" />}
              {decisionType === 'REQUEST_CORRECTION' && <AlertTriangle className="w-6 h-6 text-amber-600" />}
              {decisionType === 'REJECT' && <XCircle className="w-6 h-6 text-rose-600" />}
              {decisionType === 'SUSPEND' && <PauseCircle className="w-6 h-6 text-orange-600" />}
              {decisionType === 'DEACTIVATE' && <PowerOff className="w-6 h-6 text-slate-600" />}

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {decisionType === 'APPROVE' && 'Approve Contractor Application'}
                  {decisionType === 'REQUEST_CORRECTION' && 'Request Application Correction'}
                  {decisionType === 'REJECT' && 'Reject Contractor Application'}
                  {decisionType === 'SUSPEND' && 'Suspend Contractor Account'}
                  {decisionType === 'DEACTIVATE' && 'Deactivate Contractor Account'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {contractor.businessName} (ID: {contractor.id})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
              {errorMessage}
            </div>
          )}

          {/* Decision Body */}
          <div className="space-y-4 text-xs">
            {/* 1. APPROVE WORKFLOW */}
            {decisionType === 'APPROVE' && (
              <div className="space-y-4">
                <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Marketplace Eligibility Confirmation
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-800">
                    Approving this contractor marks their profile as <strong>APPROVED</strong> and enables them to receive customer leads and quote on service requests in their dispatch territory.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Approval Audit Notes
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={3}
                    placeholder="Enter compliance confirmation notes..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400">
                    Recorded in immutable verification audit log with your admin identity.
                  </span>
                </div>
              </div>
            )}

            {/* 2. REQUEST CORRECTION WORKFLOW */}
            {decisionType === 'REQUEST_CORRECTION' && (
              <div className="space-y-4">
                <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl text-amber-950">
                  <p className="text-[11px] leading-relaxed text-amber-900">
                    Select the sections that need attention. The contractor will receive an in-app notice and an Action Required banner in their dashboard with these instructions.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Items Requiring Correction *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CORRECTION_ITEMS.map((item) => {
                      const isChecked = selectedCorrectionItems.includes(item);
                      return (
                        <label
                          key={item}
                          className={`flex items-start gap-2 p-2.5 rounded-lg border text-[11px] cursor-pointer transition ${
                            isChecked
                              ? 'border-amber-400 bg-amber-50/60 font-semibold text-amber-900'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCorrectionItem(item)}
                            className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span>{item}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Detailed Instructions for Contractor *
                  </label>
                  <textarea
                    value={correctionInstructions}
                    onChange={(e) => setCorrectionInstructions(e.target.value)}
                    rows={3}
                    placeholder="e.g. Please upload an updated Certificate of Insurance showing active general liability coverage through 2027..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            {/* 3. REJECT WORKFLOW */}
            {decisionType === 'REJECT' && (
              <div className="space-y-4">
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-rose-950">
                  <p className="text-[11px] leading-relaxed text-rose-900">
                    Rejecting this application will transition the status to <strong>REJECTED</strong>. All previous logs, documents, and notes are preserved for historical audit.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Structured Rejection Reason *
                  </label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value as ContractorRejectionReason)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-rose-500"
                  >
                    {REJECTION_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Explanatory Audit Notes *
                  </label>
                  <textarea
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    rows={3}
                    placeholder="Detailed explanation of rejection reasons for internal compliance records..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}

            {/* 4. SUSPEND WORKFLOW */}
            {decisionType === 'SUSPEND' && (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-xl text-orange-950 space-y-1">
                  <div className="font-bold text-orange-900">Account Suspension Notice</div>
                  <p className="text-[11px] leading-relaxed text-orange-800">
                    Suspending this contractor immediately halts their eligibility for job matching and leads. Used for expired licenses, lapses in insurance, or compliance investigations.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Reason for Suspension *
                  </label>
                  <textarea
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. Trade license expired on 2026-01-15. Suspended pending proof of renewal..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}

            {/* 5. DEACTIVATE WORKFLOW */}
            {decisionType === 'DEACTIVATE' && (
              <div className="space-y-4">
                <div className="bg-slate-100 border border-slate-300 p-3.5 rounded-xl text-slate-800 space-y-1">
                  <div className="font-bold text-slate-900">Account Deactivation Confirmation</div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Deactivating this contractor permanently closes their active account while keeping historical audit traces and past customer service requests intact.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Reason for Deactivation *
                  </label>
                  <textarea
                    value={deactivationReason}
                    onChange={(e) => setDeactivationReason(e.target.value)}
                    rows={2}
                    placeholder="Reason for deactivation..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={confirmDeactivation}
                    onChange={(e) => setConfirmDeactivation(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <span className="text-[11px] font-semibold text-slate-700">
                    I confirm this contractor account should be deactivated.
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>

            {decisionType === 'APPROVE' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                isLoading={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                Confirm Approval
              </Button>
            )}

            {decisionType === 'REQUEST_CORRECTION' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                isLoading={isProcessing}
                className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
                leftIcon={<AlertTriangle className="w-4 h-4" />}
              >
                Send Correction Request
              </Button>
            )}

            {decisionType === 'REJECT' && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleSubmit}
                isLoading={isProcessing}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Confirm Rejection
              </Button>
            )}

            {decisionType === 'SUSPEND' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                isLoading={isProcessing}
                className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
                leftIcon={<PauseCircle className="w-4 h-4" />}
              >
                Suspend Account
              </Button>
            )}

            {decisionType === 'DEACTIVATE' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSubmit}
                isLoading={isProcessing}
                leftIcon={<PowerOff className="w-4 h-4" />}
              >
                Deactivate Account
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
