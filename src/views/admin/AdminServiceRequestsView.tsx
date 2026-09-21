/**
 * You Want Services - Admin Service Requests Control Center
 * Prompt #10 Architecture
 *
 * Implements:
 * - Service Requests Operations Queue
 * - Multi-criteria Filters (Status, Urgency, Category, Search)
 * - Matching Status & Assigned Contractor Tracking
 * - Administrative Status Override Controls
 * - Direct Bridge to Associated Marketplace Lead
 */

import React, { useState, useMemo } from 'react';
import { serviceRequestService } from '../../services/serviceRequestService';
import { leadService } from '../../services/leadService';
import { accountService } from '../../services/accountService';
import { ServiceRequest, ServiceRequestStatus, ServiceRequestUrgency } from '../../types/database';
import { Card, Badge, Button, Input } from '../../components/common/UIComponents';
import { useNavigation } from '../../context/NavigationContext';
import {
  ClipboardList,
  Search,
  Filter,
  MapPin,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Inbox,
  User,
  ArrowRight,
  Eye,
  X,
  ExternalLink,
  Zap,
} from 'lucide-react';

export const AdminServiceRequestsView: React.FC = () => {
  const { navigate } = useNavigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<ServiceRequestStatus | ''>('');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Live requests
  const [requests, setRequests] = useState<ServiceRequest[]>(serviceRequestService.getAllRequests());
  const allLeads = leadService.getAllLeads();

  const refreshRequests = () => {
    setRequests([...serviceRequestService.getAllRequests()]);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = requests.length;
    const matching = requests.filter((r) => r.status === 'MATCHING').length;
    const assigned = requests.filter((r) => r.status === 'ASSIGNED' || r.status === 'CONTRACTOR_ACCEPTED' || r.status === 'IN_PROGRESS').length;
    const completed = requests.filter((r) => r.status === 'COMPLETED').length;
    const emergency = requests.filter((r) => r.urgency === 'EMERGENCY').length;

    return { total, matching, assigned, completed, emergency };
  }, [requests]);

  // Filtered list
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (urgencyFilter !== 'ALL' && r.urgency !== urgencyFilter) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const customer = accountService.getUserById(r.customerId);
        const custName = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : '';

        const matches =
          r.id.toLowerCase().includes(term) ||
          r.publicRequestId.toLowerCase().includes(term) ||
          r.title.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term) ||
          r.city.toLowerCase().includes(term) ||
          r.zipCode.toLowerCase().includes(term) ||
          custName.includes(term);

        if (!matches) return false;
      }

      return true;
    });
  }, [requests, statusFilter, urgencyFilter, searchTerm]);

  // Handle status override
  const handleApplyOverride = () => {
    if (!selectedRequest || !overrideStatus) return;

    const success = serviceRequestService.updateStatus(
      selectedRequest.id,
      overrideStatus,
      'System Admin',
      overrideNotes || `Status manually overridden to ${overrideStatus} by administration`
    );

    if (success) {
      refreshRequests();
      const updated = serviceRequestService.getRequestById(selectedRequest.id);
      if (updated && updated.request) setSelectedRequest(updated.request);
      setActionSuccessMessage(`Service request status updated to ${overrideStatus}.`);
      setOverrideStatus('');
      setOverrideNotes('');
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Service Requests & Intake Queue
          </h1>
          <p className="text-xs text-slate-500">
            Real homeowner inquiries, algorithmic contractor matching, and lifecycle dispatch oversight.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Requests</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Matching Queue</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{metrics.matching}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigned / In Progress</div>
            <div className="text-2xl font-black text-indigo-600 mt-1">{metrics.assigned}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Completed Jobs</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.completed}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Emergency Rush</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{metrics.emergency}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Search by ID, title, homeowner, city, or ZIP..."
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
              <option value="ALL">All Lifecycle Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="MATCHING">MATCHING</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="CONTRACTOR_ACCEPTED">CONTRACTOR ACCEPTED</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Urgency Levels</option>
              <option value="EMERGENCY">EMERGENCY</option>
              <option value="WITHIN_24_HOURS">WITHIN 24 HOURS</option>
              <option value="THIS_WEEK">THIS WEEK</option>
              <option value="FLEXIBLE">FLEXIBLE</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Service Requests Table */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Service Details</th>
                <th className="py-3.5 px-4">Homeowner</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Urgency</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Associated Lead</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No service requests match current filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const customer = accountService.getUserById(req.customerId);
                  const linkedLead = allLeads.find((l) => l.serviceRequestId === req.id);

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {req.publicRequestId}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{req.title}</div>
                        <div className="text-[11px] text-slate-400">Category: {req.categoryId}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {customer ? (
                          <div>
                            <div className="font-medium text-slate-900">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-[11px] text-slate-400">{customer.phone}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">{req.customerId}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {req.city}, {req.state} {req.zipCode}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            req.urgency === 'EMERGENCY'
                              ? 'danger'
                              : req.urgency === 'WITHIN_24_HOURS'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {req.urgency}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            req.status === 'COMPLETED'
                              ? 'success'
                              : req.status === 'CANCELLED'
                              ? 'danger'
                              : req.status === 'MATCHING'
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {req.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        {linkedLead ? (
                          <button
                            onClick={() => navigate('admin-leads')}
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100 transition"
                          >
                            <span>#{linkedLead.leadNumber}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Not Dispatched</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(req);
                            setActionSuccessMessage(null);
                          }}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Request Inspection & Status Override Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">
                    Request {selectedRequest.publicRequestId}
                  </h3>
                  <Badge variant="info">{selectedRequest.status}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedRequest.title}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {actionSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMessage}</span>
                </div>
              )}

              {/* Description */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Work Description
                </span>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {selectedRequest.description || 'No detailed description provided.'}
                </p>
              </div>

              {/* Grid: Location & Scheduling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Site Location
                  </span>
                  <div className="text-slate-700 font-medium">
                    {selectedRequest.address} {selectedRequest.unit || ''}
                  </div>
                  <div className="text-slate-500">
                    {selectedRequest.city}, {selectedRequest.state} {selectedRequest.zipCode}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Timeline & Flexibility
                  </span>
                  <div className="text-slate-700 font-medium">
                    Urgency: <span className="font-bold">{selectedRequest.urgency}</span>
                  </div>
                  <div className="text-slate-500">
                    Target Date: {selectedRequest.preferredDate || 'Earliest available'}
                  </div>
                </div>
              </div>

              {/* Admin Status Override Form */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Administrative Status Override
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Force override request status if matching failed or contractor needs reassignment.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value as ServiceRequestStatus)}
                    className="h-9 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select New Status...</option>
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="MATCHING">MATCHING</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="CONTRACTOR_ACCEPTED">CONTRACTOR ACCEPTED</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>

                  <Input
                    placeholder="Reason or override audit note..."
                    value={overrideNotes}
                    onChange={(e) => setOverrideNotes(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!overrideStatus}
                    onClick={handleApplyOverride}
                  >
                    Save Status Override
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <Button variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
