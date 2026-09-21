/**
 * You Want Services - Secure Contractor Document Viewer Modal
 * Phase 6 Architecture
 */

import React, { useState } from 'react';
import { ContractorDocument, DocumentRejectionReason } from '../../types/database';
import { contractorVerificationService } from '../../services/contractorVerificationService';
import { useAuth } from '../../context/AuthContext';
import { ContractorStatusBadge } from './ContractorStatusBadge';
import { Button } from '../common/UIComponents';
import {
  FileText,
  CheckCircle,
  XCircle,
  Calendar,
  HardDrive,
  User,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Download,
} from 'lucide-react';

interface ContractorDocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ContractorDocument | null;
  contractorId: string;
  onDocumentUpdated?: (updatedDoc: ContractorDocument) => void;
}

const REJECTION_REASONS: DocumentRejectionReason[] = [
  'Document unreadable',
  'Missing information',
  'Expired',
  'Incorrect document type',
  'Information does not match',
  'Other',
];

export const ContractorDocumentViewerModal: React.FC<ContractorDocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  contractorId,
  onDocumentUpdated,
}) => {
  const { currentUser: user } = useAuth();
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<DocumentRejectionReason>('Missing information');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen || !document) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleAccept = async () => {
    if (!user) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = contractorVerificationService.reviewDocument(contractorId, document.id, {
        action: 'ACCEPT',
        reviewNotes: reviewNotes || 'Document verified and accepted by administrator.',
        reviewer: user,
      });

      if (res.success && res.document) {
        setFeedback({ type: 'success', message: 'Document accepted successfully.' });
        onDocumentUpdated?.(res.document);
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to accept document.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!user) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = contractorVerificationService.reviewDocument(contractorId, document.id, {
        action: 'REJECT',
        rejectionReason,
        reviewNotes,
        reviewer: user,
      });

      if (res.success && res.document) {
        setFeedback({ type: 'success', message: 'Document has been rejected with recorded reason.' });
        onDocumentUpdated?.(res.document);
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to reject document.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const isImage =
    document.fileType.includes('image') ||
    document.fileReference.startsWith('data:image') ||
    document.fileName.match(/\.(png|jpg|jpeg|webp)$/i);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-6 text-center">
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-4xl border border-slate-200 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{document.fileName}</h3>
                  <ContractorStatusBadge status={document.status || document.verificationStatus} type="document" />
                </div>
                <div className="text-xs text-slate-500">
                  {document.documentType.replace(/_/g, ' ')} • Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`px-6 py-3 text-xs font-semibold ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-b border-rose-200'
              }`}
            >
              {feedback.message}
            </div>
          )}

          {/* Body: Split View (Preview + Metadata/Actions) */}
          <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto flex-1">
            {/* Left: Document Viewport (7 cols) */}
            <div className="md:col-span-7 bg-slate-900 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[360px] relative">
              <div className="absolute top-3 left-3 bg-slate-800/90 text-slate-300 text-[11px] px-2.5 py-1 rounded-md border border-slate-700 font-mono">
                SECURE DOCUMENT VIEWER
              </div>

              {isImage ? (
                <div className="max-w-full max-h-[460px] overflow-hidden rounded-lg border border-slate-700 bg-slate-950 flex items-center justify-center">
                  <img
                    src={document.fileReference}
                    alt={document.fileName}
                    className="max-h-[440px] w-auto object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                /* PDF / Document High-Fidelity Rendering Canvas */
                <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 text-slate-900 border border-slate-200 relative overflow-hidden font-sans">
                  {/* Subtle Security Watermark */}
                  <div className="absolute -right-12 -top-12 opacity-5 pointer-events-none text-slate-900 text-9xl font-black">
                    YWS
                  </div>
                  <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-xs tracking-wider uppercase text-slate-700">Official Document Preview</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{document.fileType}</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Document Title</div>
                      <div className="font-bold text-slate-800 text-sm">{document.fileName}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Classification</span>
                        <span className="font-semibold text-slate-700">{document.documentType.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">File Size</span>
                        <span className="font-semibold text-slate-700">{formatFileSize(document.fileSize)}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
                      <strong>Audit Verification Note:</strong> This document reference has been securely quarantined in application storage. Verify registration details, business name, and expiration match before accepting.
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>You Want Services Compliance</span>
                    <span>Demo Mode Storage</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Metadata & Audit Controls (5 cols) */}
            <div className="md:col-span-5 p-6 flex flex-col justify-between space-y-6 bg-white">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Document Metadata
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5" /> Size:
                      </span>
                      <span className="font-medium text-slate-800">{formatFileSize(document.fileSize)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Uploaded:
                      </span>
                      <span className="font-medium text-slate-800">
                        {new Date(document.uploadedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Document Type:</span>
                      <span className="font-mono text-slate-800 text-[11px]">
                        {document.documentType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audit Review Details if available */}
                {document.reviewedAt && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Previous Audit Record
                    </h4>
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Audited By:</span>
                        <span className="font-semibold text-slate-800">{document.reviewedByName || 'Administrator'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Timestamp:</span>
                        <span className="text-slate-600">{new Date(document.reviewedAt).toLocaleString()}</span>
                      </div>
                      {document.rejectionReason && (
                        <div className="pt-1 text-rose-700">
                          <span className="font-semibold">Rejection Reason:</span> {document.rejectionReason}
                        </div>
                      )}
                      {document.reviewNotes && (
                        <div className="pt-1 text-slate-600 italic">
                          "{document.reviewNotes}"
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rejection Form view when toggled */}
                {rejecting ? (
                  <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Document Rejection Details
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Reason for Rejection *
                      </label>
                      <select
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value as DocumentRejectionReason)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-rose-500"
                      >
                        {REJECTION_REASONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Auditor Notes to Contractor
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Explain specifically what needs correction (e.g., certificate expired, seal not visible)..."
                        rows={3}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleReject}
                        isLoading={isProcessing}
                        className="flex-1"
                      >
                        Confirm Rejection
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRejecting(false)}
                        disabled={isProcessing}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Reviewer Notes (Optional)
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Enter verification notes for the audit log..."
                      rows={2}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!rejecting && (
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRejecting(true)}
                    className="border-rose-200 text-rose-700 hover:bg-rose-50"
                    leftIcon={<XCircle className="w-4 h-4" />}
                  >
                    Reject Document
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAccept}
                    isLoading={isProcessing}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                  >
                    Accept Document
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
