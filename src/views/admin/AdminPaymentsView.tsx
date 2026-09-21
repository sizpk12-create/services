/**
 * You Want Services - Admin Payments & Financial Ledger
 * Prompt #10 Architecture
 *
 * Implements:
 * - Live Platform Payment & Transaction Ledger from marketplaceFinanceService
 * - Multi-criteria Filters (Payment Type, Status, Search)
 * - Financial KPIs (Total Processed, Lead Fees, Subscriptions, Refunds)
 * - Transaction Inspection & Receipt Modal
 * - Administrative Refund / Dispute Initiation
 * - Real CSV Export
 */

import React, { useState, useMemo } from 'react';
import { marketplaceFinanceService } from '../../services/marketplaceFinanceService';
import { Payment, PaymentType, PaymentStatus, RefundReason } from '../../types/database';
import { Card, Badge, Button, Input } from '../../components/common/UIComponents';
import {
  CreditCard,
  DollarSign,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Eye,
  X,
  FileText,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const AdminPaymentsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Refund modal state
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState<RefundReason>('INVALID_CONTACT_INFO');
  const [refundDetails, setRefundDetails] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Live payments
  const [payments, setPayments] = useState<Payment[]>(marketplaceFinanceService.getAllPayments());

  const refreshPayments = () => {
    setPayments([...marketplaceFinanceService.getAllPayments()]);
  };

  // KPIs
  const kpis = useMemo(() => {
    const totalProcessed = payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    const leadSales = payments
      .filter((p) => p.status === 'COMPLETED' && p.type === 'LEAD_FEE')
      .reduce((sum, p) => sum + p.amount, 0);

    const subscriptionFees = payments
      .filter((p) => p.status === 'COMPLETED' && p.type === 'MEMBERSHIP')
      .reduce((sum, p) => sum + p.amount, 0);

    const refundedAmount = payments
      .filter((p) => p.status === 'REFUNDED')
      .reduce((sum, p) => sum + p.amount, 0);

    return { totalProcessed, leadSales, subscriptionFees, refundedAmount };
  }, [payments]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return marketplaceFinanceService.getAllPayments({
      type: typeFilter,
      status: statusFilter,
      search: searchTerm,
    });
  }, [payments, typeFilter, statusFilter, searchTerm]);

  // CSV Exporter
  const handleExportCSV = () => {
    const csvContent = marketplaceFinanceService.exportRevenueCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `yws-payments-ledger-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Request Refund
  const handleInitiateRefund = () => {
    if (!selectedPayment) return;

    marketplaceFinanceService.requestRefund({
      paymentId: selectedPayment.id,
      contractorId: selectedPayment.payerId,
      leadId: selectedPayment.leadId,
      reason: refundReason,
      reasonDetails: refundDetails || 'Admin initiated refund request',
    });

    refreshPayments();
    setIsRefundModalOpen(false);
    setActionSuccessMessage('Refund request initiated and submitted to refunds queue.');
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Payments & Financial Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Real transactions, lead fee payments, membership billings, and settlement records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Ledger CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Settled Revenue</div>
            <div className="text-2xl font-black text-slate-900 mt-1">${kpis.totalProcessed.toFixed(2)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lead Purchase Volume</div>
            <div className="text-2xl font-black text-blue-600 mt-1">${kpis.leadSales.toFixed(2)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Membership Billings</div>
            <div className="text-2xl font-black text-indigo-600 mt-1">${kpis.subscriptionFees.toFixed(2)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Refunded</div>
            <div className="text-2xl font-black text-rose-600 mt-1">${kpis.refundedAmount.toFixed(2)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Input
              placeholder="Search by ID, payer, receipt #, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Payment Types</option>
              <option value="LEAD_FEE">Lead Purchase Fee</option>
              <option value="MEMBERSHIP">Membership Subscription</option>
              <option value="SERVICE_PAYMENT">Customer Direct Service Payment</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="COMPLETED">COMPLETED (Settled)</option>
              <option value="PENDING">PENDING</option>
              <option value="REFUNDED">REFUNDED</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Ledger Table */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Type & Description</th>
                <th className="py-3.5 px-4">Payer / Contractor</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No transactions match filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {payment.id}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900">{payment.type}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {payment.description || 'Payment Transaction'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-medium text-slate-900">
                        {payment.payerName || 'Unknown Entity'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {payment.payerId}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900">
                      <span
                        className={
                          payment.status === 'REFUNDED'
                            ? 'text-rose-600 line-through'
                            : payment.status === 'COMPLETED'
                            ? 'text-emerald-700'
                            : 'text-slate-700'
                        }
                      >
                        ${payment.amount.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          payment.status === 'COMPLETED'
                            ? 'success'
                            : payment.status === 'REFUNDED'
                            ? 'danger'
                            : payment.status === 'FAILED'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(payment.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPayment(payment)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transaction & Receipt Inspection Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">
                    Transaction Receipt
                  </h3>
                  <Badge
                    variant={
                      selectedPayment.status === 'COMPLETED'
                        ? 'success'
                        : selectedPayment.status === 'REFUNDED'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {selectedPayment.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  Receipt #{selectedPayment.receiptNumber || selectedPayment.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Receipt Total */}
              <div className="p-5 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Transaction Amount
                  </span>
                  <div className="text-2xl font-black">${selectedPayment.amount.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Method
                  </span>
                  <div className="text-xs font-semibold text-slate-200">
                    {selectedPayment.paymentMethod || 'Simulated Card'}
                  </div>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Transaction Type</span>
                  <span className="font-bold text-slate-900">{selectedPayment.type}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Payer Entity</span>
                  <span className="font-bold text-slate-900">{selectedPayment.payerName || 'N/A'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Payer Account ID</span>
                  <span className="font-mono text-slate-700">{selectedPayment.payerId}</span>
                </div>

                {selectedPayment.leadId && (
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Associated Lead</span>
                    <span className="font-mono font-bold text-blue-600">
                      {selectedPayment.leadId}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Settled At</span>
                  <span className="text-slate-700">
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Line Item Description
                </span>
                {selectedPayment.description}
              </div>

              {/* Refund Action if completed */}
              {selectedPayment.status === 'COMPLETED' && (
                <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-rose-900 text-xs">Initiate Refund / Dispute</h4>
                      <p className="text-[11px] text-rose-700">
                        Create a formal refund request against this transaction.
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setIsRefundModalOpen(true)}
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    >
                      Refund
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <Button variant="outline" size="sm" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Initiate Refund Modal */}
      {isRefundModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Confirm Refund Request</h3>
              <button
                onClick={() => setIsRefundModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600">
              You are initiating a refund of{' '}
              <strong className="text-slate-900">${selectedPayment.amount.toFixed(2)}</strong> for{' '}
              {selectedPayment.payerName}.
            </p>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Reason Code
              </label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value as RefundReason)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="INVALID_CONTACT_INFO">Invalid Contact Info</option>
                <option value="OUTSIDE_SERVICE_AREA">Outside Service Area</option>
                <option value="CUSTOMER_CANCELLED">Customer Cancelled Immediately</option>
                <option value="DUPLICATE_PURCHASE">Duplicate Purchase</option>
                <option value="SYSTEM_ERROR">System Error</option>
                <option value="OTHER">Other Administrative Reason</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Explanation Details
              </label>
              <Input
                placeholder="Detailed reason for refund record..."
                value={refundDetails}
                onChange={(e) => setRefundDetails(e.target.value)}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRefundModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleInitiateRefund}
              >
                Submit Refund Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
