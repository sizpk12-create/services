/**
 * You Want Services - Admin Refunds & Disputes Operations View
 * Prompt #10 Architecture
 *
 * Implements:
 * - Dispute & Refund Request Inspection Queue
 * - Status Filter (Pending, Approved, Rejected)
 * - Contractor Dispute Statement & Associated Lead / Payment Details
 * - Administrative Approval with automatic credit & status sync
 * - Administrative Rejection with mandatory justification audit notes
 */

import React, { useState, useMemo } from 'react';
import { marketplaceFinanceService } from '../../services/marketplaceFinanceService';
import { RefundRequest, RefundStatus } from '../../types/database';
import { Card, Badge, Button, Input } from '../../components/common/UIComponents';
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Building,
  User,
  Eye,
  X,
  FileText,
  ShieldAlert,
} from 'lucide-react';

export const AdminRefundsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);

  // Resolution inputs
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rejectReasonNotes, setRejectReasonNotes] = useState('');
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  // Live refunds
  const [refunds, setRefunds] = useState<RefundRequest[]>(
    marketplaceFinanceService.getAllRefunds()
  );

  const refreshRefunds = () => {
    setRefunds([...marketplaceFinanceService.getAllRefunds()]);
  };

  // KPIs
  const kpis = useMemo(() => {
    const total = refunds.length;
    const pending = refunds.filter((r) => r.status === 'PENDING').length;
    const approved = refunds.filter((r) => r.status === 'APPROVED').length;
    const rejected = refunds.filter((r) => r.status === 'REJECTED').length;
    const pendingAmount = refunds
      .filter((r) => r.status === 'PENDING')
      .reduce((sum, r) => sum + r.amount, 0);

    return { total, pending, approved, rejected, pendingAmount };
  }, [refunds]);

  // Filtered refunds
  const filteredRefunds = useMemo(() => {
    return refunds.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matches =
          r.id.toLowerCase().includes(term) ||
          r.contractorName.toLowerCase().includes(term) ||
          (r.businessName && r.businessName.toLowerCase().includes(term)) ||
          (r.leadNumber && r.leadNumber.toLowerCase().includes(term)) ||
          r.reason.toLowerCase().includes(term);

        if (!matches) return false;
      }

      return true;
    });
  }, [refunds, statusFilter, searchTerm]);

  // Handle open modal
  const handleInspectRefund = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setResolutionNotes('');
    setRejectReasonNotes('');
    setIsRejectMode(false);
    setActionSuccessMessage(null);
    setActionErrorMessage(null);
  };

  // Handle Approve
  const handleApprove = () => {
    if (!selectedRefund) return;

    const res = marketplaceFinanceService.approveRefund(
      selectedRefund.id,
      'admin-usr-1',
      'System Administrator',
      resolutionNotes || 'Refund approved upon administrative review.'
    );

    if (res.success) {
      refreshRefunds();
      const updated = marketplaceFinanceService
        .getAllRefunds()
        .find((r) => r.id === selectedRefund.id);
      if (updated) setSelectedRefund(updated);
      setActionSuccessMessage('Refund approved. Amount has been credited to contractor balance.');
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  // Handle Reject
  const handleReject = () => {
    if (!selectedRefund) return;
    if (!rejectReasonNotes.trim()) {
      setActionErrorMessage('Please provide a mandatory administrative justification for rejection.');
      return;
    }

    const res = marketplaceFinanceService.rejectRefund(
      selectedRefund.id,
      'admin-usr-1',
      'System Administrator',
      rejectReasonNotes
    );

    if (res.success) {
      refreshRefunds();
      const updated = marketplaceFinanceService
        .getAllRefunds()
        .find((r) => r.id === selectedRefund.id);
      if (updated) setSelectedRefund(updated);
      setIsRejectMode(false);
      setActionSuccessMessage('Refund request declined and contractor notified.');
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Refunds & Dispute Resolution
          </h1>
          <p className="text-xs text-slate-500">
            Contractor lead disputes, bad contact claims, administrative evaluations, and reversals.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Reviews</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{kpis.pending}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Exposure</div>
            <div className="text-2xl font-black text-slate-900 mt-1">${kpis.pendingAmount.toFixed(2)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Approved Refunds</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{kpis.approved}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Declined Disputes</div>
            <div className="text-2xl font-black text-slate-700 mt-1">{kpis.rejected}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Search by dispute ID, contractor, lead #, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Dispute Statuses</option>
              <option value="PENDING">PENDING (Action Required)</option>
              <option value="APPROVED">APPROVED (Credited)</option>
              <option value="REJECTED">REJECTED (Declined)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Refunds Queue Table */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Dispute ID</th>
                <th className="py-3.5 px-4">Contractor / Business</th>
                <th className="py-3.5 px-4">Lead & Reason</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Requested Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No dispute or refund requests found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {refund.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {refund.businessName || refund.contractorName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Contact: {refund.contractorName}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900">
                        {refund.reason.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[11px] text-blue-600 font-mono">
                        Lead: {refund.leadNumber || 'N/A'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ${refund.amount.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          refund.status === 'PENDING'
                            ? 'warning'
                            : refund.status === 'APPROVED'
                            ? 'success'
                            : 'danger'
                        }
                      >
                        {refund.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(refund.requestedAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInspectRefund(refund)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Evaluate
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Evaluate & Resolve Modal */}
      {selectedRefund && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">
                    Dispute Assessment
                  </h3>
                  <Badge
                    variant={
                      selectedRefund.status === 'PENDING'
                        ? 'warning'
                        : selectedRefund.status === 'APPROVED'
                        ? 'success'
                        : 'danger'
                    }
                  >
                    {selectedRefund.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Case ID: {selectedRefund.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedRefund(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {actionErrorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{actionErrorMessage}</span>
                </div>
              )}

              {/* Amount Banner */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Disputed Amount
                  </span>
                  <div className="text-xl font-black text-slate-900">
                    ${selectedRefund.amount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Associated Lead
                  </span>
                  <div className="font-mono font-bold text-blue-600 text-xs">
                    {selectedRefund.leadNumber || selectedRefund.leadId || 'Direct Payment'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Transaction ID
                  </span>
                  <div className="font-mono text-slate-700 text-xs">
                    {selectedRefund.paymentId}
                  </div>
                </div>
              </div>

              {/* Contractor & Reason Statement */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Contractor Claim
                  </span>
                  <span className="font-bold text-slate-900">{selectedRefund.businessName}</span>
                </div>
                <div className="font-bold text-slate-900 text-xs">
                  Reason: {selectedRefund.reason.replace(/_/g, ' ')}
                </div>
                <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {selectedRefund.reasonDetails || 'No additional contractor comments provided.'}
                </p>
              </div>

              {/* Previous Resolution Notes if already resolved */}
              {selectedRefund.status !== 'PENDING' && (
                <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Administrative Decision Record
                  </span>
                  <div className="text-slate-900 font-medium">
                    Resolved by {selectedRefund.resolvedByName || selectedRefund.resolvedBy || 'Administrator'} on{' '}
                    {selectedRefund.resolvedAt
                      ? new Date(selectedRefund.resolvedAt).toLocaleString()
                      : 'Recently'}
                  </div>
                  <div className="text-slate-600 italic">
                    "{selectedRefund.resolutionNotes}"
                  </div>
                </div>
              )}

              {/* Administrative Resolution Controls if PENDING */}
              {selectedRefund.status === 'PENDING' && (
                <div className="space-y-4 pt-2">
                  {!isRejectMode ? (
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                        Approve Refund & Credit Contractor
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Approving will immediately credit ${selectedRefund.amount.toFixed(2)} to the contractor balance and update transaction logs.
                      </p>
                      <Input
                        placeholder="Optional approval note for contractor..."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleApprove}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Approve Refund (${selectedRefund.amount.toFixed(2)})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsRejectMode(true)}
                          leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-600" />}
                        >
                          Decline Dispute
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 space-y-3">
                      <h4 className="font-bold text-rose-900 uppercase tracking-wider text-[10px]">
                        Decline Refund Request
                      </h4>
                      <p className="text-[11px] text-rose-700">
                        Contractor will receive an administrative notice explaining why this lead fee refund was rejected.
                      </p>
                      <Input
                        placeholder="Mandatory administrative justification..."
                        value={rejectReasonNotes}
                        onChange={(e) => setRejectReasonNotes(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={handleReject}
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        >
                          Confirm Decline
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsRejectMode(false)}
                        >
                          Back
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <Button variant="outline" size="sm" onClick={() => setSelectedRefund(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
