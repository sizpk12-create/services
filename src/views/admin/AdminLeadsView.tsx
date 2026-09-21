/**
 * You Want Services - Admin Leads Marketplace Oversight View
 * Phase 7 Architecture
 *
 * Implements:
 * - Central admin lead registry across all service trades and geographies
 * - Real-time marketplace KPIs (total volume, available pool, assignment rate, completion)
 * - Powerful search & multi-dimensional filtering
 * - Lead Inspection Drawer with full audit trail and customer contact data
 * - Manual contractor assignment and territory dispatch override
 * - Status override capabilities with mandatory admin action logging
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { leadService } from '../../services/leadService';
import { contractorService } from '../../services/contractorService';
import {
  Lead,
  LeadStatus,
  LeadActivity,
  ContractorProfile,
} from '../../types/database';
import { Card, Badge, Button, Modal, Alert } from '../../components/common/UIComponents';
import { ContractorStatusBadge } from '../../components/admin/ContractorStatusBadge';
import {
  Inbox,
  Search,
  Filter,
  Users,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  UserCheck,
  UserX,
  Eye,
  RefreshCw,
  Sliders,
  Sparkles,
  Phone,
  Mail,
  Home,
  Check,
  X,
  History,
} from 'lucide-react';

export const AdminLeadsView: React.FC = () => {
  const { currentUser } = useAuth();
  const adminName = `${currentUser?.firstName || 'Admin'} ${currentUser?.lastName || 'Compliance'}`.trim();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [contractors, setContractors] = useState<ContractorProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');

  // Selected lead for inspection drawer/modal
  const [inspectedLead, setInspectedLead] = useState<Lead | null>(null);
  const [leadActivities, setLeadActivities] = useState<LeadActivity[]>([]);

  // Manual Assignment Modal
  const [assignModalLead, setAssignModalLead] = useState<Lead | null>(null);
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');

  // Status Override Modal
  const [statusModalLead, setStatusModalLead] = useState<Lead | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<LeadStatus>('AVAILABLE');
  const [overrideNotes, setOverrideNotes] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLeads(leadService.getAllLeads());
    setContractors(contractorService.getAllProfiles());
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (statusFilter !== 'ALL' && lead.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && lead.serviceCategoryId !== categoryFilter) return false;
      if (urgencyFilter !== 'ALL' && lead.urgency !== urgencyFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = lead.leadNumber.toLowerCase().includes(q);
        const matchCustomer = (lead.customerName || '').toLowerCase().includes(q);
        const matchSub = (lead.serviceSubcategory || '').toLowerCase().includes(q);
        const matchCity = (lead.city || '').toLowerCase().includes(q);
        const matchZip = (lead.zipCode || '').toLowerCase().includes(q);
        const matchDesc = (lead.projectDescription || '').toLowerCase().includes(q);
        if (!matchNumber && !matchCustomer && !matchSub && !matchCity && !matchZip && !matchDesc) {
          return false;
        }
      }

      return true;
    });
  }, [leads, statusFilter, categoryFilter, urgencyFilter, searchQuery]);

  // Marketplace metrics
  const metrics = useMemo(() => {
    const total = leads.length;
    const available = leads.filter((l) => l.status === 'AVAILABLE' || l.status === 'NEW').length;
    const active = leads.filter((l) => ['ACCEPTED', 'CONTACTED', 'SCHEDULED', 'IN_PROGRESS'].includes(l.status)).length;
    const completed = leads.filter((l) => l.status === 'COMPLETED').length;
    const declined = leads.filter((l) => l.status === 'DECLINED').length;
    const leadFeesTotal = active * 20 + completed * 20;

    return { total, available, active, completed, declined, leadFeesTotal };
  }, [leads]);

  const handleInspectLead = (lead: Lead) => {
    setInspectedLead(lead);
    setLeadActivities(leadService.getActivitiesForLead(lead.id));
  };

  const handleOpenAssignModal = (lead: Lead) => {
    setAssignModalLead(lead);
    setSelectedContractorId(lead.contractorId || '');
    setAssignNotes('');
  };

  const handleConfirmAssign = () => {
    if (!assignModalLead || !selectedContractorId) return;

    const res = leadService.assignLeadToContractor(
      assignModalLead.id,
      selectedContractorId,
      adminName,
      assignNotes || 'Administrator manually assigned lead to contractor.'
    );

    if (res.success) {
      setFeedback({ type: 'success', message: `Lead #${assignModalLead.leadNumber} assigned successfully!` });
      setAssignModalLead(null);
      loadData();
      if (inspectedLead && inspectedLead.id === assignModalLead.id) {
        const updated = leadService.getAllLeads().find((l) => l.id === assignModalLead.id);
        if (updated) handleInspectLead(updated);
      }
      setTimeout(() => setFeedback(null), 5000);
    } else {
      setFeedback({ type: 'error', message: res.message || 'Assignment failed.' });
    }
  };

  const handleOpenStatusModal = (lead: Lead) => {
    setStatusModalLead(lead);
    setOverrideStatus(lead.status);
    setOverrideNotes('');
  };

  const handleConfirmStatusOverride = () => {
    if (!statusModalLead) return;

    const res = leadService.updateLeadStatus(
      statusModalLead.id,
      overrideStatus as LeadStatus,
      currentUser?.id || 'admin-1',
      adminName,
      `[ADMIN OVERRIDE] ${overrideNotes || `Status updated to ${overrideStatus}`}`
    );

    if (res.success) {
      setFeedback({ type: 'success', message: `Status updated to ${overrideStatus}.` });
      setStatusModalLead(null);
      loadData();
      if (inspectedLead && inspectedLead.id === statusModalLead.id) {
        const updated = leadService.getAllLeads().find((l) => l.id === statusModalLead.id);
        if (updated) handleInspectLead(updated);
      }
      setTimeout(() => setFeedback(null), 5000);
    } else {
      setFeedback({ type: 'error', message: res.message || 'Status override failed.' });
    }
  };

  const getContractorName = (cId?: string) => {
    if (!cId) return 'Unassigned (Open Lead)';
    const c = contractors.find((item) => item.id === cId);
    return c?.businessName || cId;
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'AVAILABLE':
      case 'NEW':
        return <Badge variant="warning">Available</Badge>;
      case 'ACCEPTED':
      case 'CONTACTED':
      case 'SCHEDULED':
      case 'IN_PROGRESS':
        return <Badge variant="info">{status.replace(/_/g, ' ')}</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'DECLINED':
        return <Badge variant="danger">Declined</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Lead Marketplace Administration
            </h1>
            <Badge variant="info">Phase 7 Oversight</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dispatch monitor, manual territory matching, lead claim overrides, and customer request routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Feed
          </Button>
        </div>
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Leads
          </span>
          <p className="text-2xl font-black text-slate-900">{metrics.total}</p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Available / Unclaimed
          </span>
          <p className="text-2xl font-black text-amber-600">{metrics.available}</p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active / In Progress
          </span>
          <p className="text-2xl font-black text-blue-600">{metrics.active}</p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Completed Jobs
          </span>
          <p className="text-2xl font-black text-emerald-600">{metrics.completed}</p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Standard Lead Value
          </span>
          <p className="text-2xl font-black text-slate-900">${metrics.leadFeesTotal}</p>
        </Card>
      </div>

      {/* Search & Filter Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search leads by ID, customer name, trade, city, ZIP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available (Open)</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="CONTACTED">Contacted</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="DECLINED">Declined</option>
            <option value="EXPIRED">Expired / Closed</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">All Trades</option>
            <option value="cat-plumbing">Plumbing</option>
            <option value="cat-hvac">HVAC</option>
            <option value="cat-electrical">Electrical</option>
            <option value="cat-roofing">Roofing</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">All Urgencies</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="WITHIN_24_HOURS">Within 24h</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="FLEXIBLE">Flexible</option>
          </select>
        </div>
      </div>

      {/* Main Leads Table */}
      <Card className="p-0 overflow-hidden border-slate-200">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Inbox className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-medium">No service leads found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Lead #</th>
                  <th className="py-3.5 px-4">Customer & Property</th>
                  <th className="py-3.5 px-4">Service Scope</th>
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Assigned Contractor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {lead.leadNumber}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900">{lead.customerName || 'Customer'}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {lead.city}, {lead.state} ({lead.zipCode})
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900">{lead.serviceSubcategory}</div>
                      <div className="text-[11px] text-slate-500 truncate">{lead.projectDescription}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant={lead.urgency === 'EMERGENCY' ? 'danger' : 'neutral'}>
                        {lead.urgency.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {lead.contractorId ? (
                        <div className="font-semibold text-slate-900">
                          {getContractorName(lead.contractorId)}
                        </div>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium text-[11px]">
                          Unassigned (Open)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleInspectLead(lead)}
                          title="Inspect full details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAssignModal(lead)}
                          title="Assign or reassign contractor"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenStatusModal(lead)}
                          title="Override status"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* LEAD INSPECTION MODAL */}
      {inspectedLead && (
        <Modal
          isOpen={true}
          onClose={() => setInspectedLead(null)}
          title={`Lead Inspection: #${inspectedLead.leadNumber}`}
        >
          <div className="space-y-5 text-xs sm:text-sm">
            {/* Header info */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  Service Request
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {inspectedLead.serviceSubcategory}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(inspectedLead.status)}
                <Badge variant={inspectedLead.urgency === 'EMERGENCY' ? 'danger' : 'neutral'}>
                  {inspectedLead.urgency}
                </Badge>
              </div>
            </div>

            {/* Customer & Location Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-xs text-slate-700 block uppercase">
                  Homeowner Details
                </span>
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">{inspectedLead.customerName}</div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {inspectedLead.customerPhone || 'N/A'}
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {inspectedLead.customerEmail || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-xs text-slate-700 block uppercase">
                  Property & Schedule
                </span>
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">{inspectedLead.fullAddress || `${inspectedLead.city}, ${inspectedLead.state} ${inspectedLead.zipCode}`}</div>
                  <div className="text-slate-600">Type: {inspectedLead.propertyType || 'Residential'}</div>
                  <div className="text-slate-600">Target Date: {inspectedLead.requestedDate || 'Flexible'}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-xs text-slate-700 block uppercase">
                Project Scope
              </span>
              <p className="text-slate-800 leading-relaxed text-xs whitespace-pre-line">
                {inspectedLead.projectDescription}
              </p>
            </div>

            {/* Assigned Contractor */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700 uppercase">
                  Assigned Contractor
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenAssignModal(inspectedLead)}
                >
                  Change Contractor
                </Button>
              </div>
              <p className="text-slate-900 font-bold text-sm">
                {getContractorName(inspectedLead.contractorId)}
              </p>
            </div>

            {/* Audit Activities Trail */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="font-bold text-xs text-slate-900 uppercase">Audit Trail & Timeline</h4>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {leadActivities.length === 0 ? (
                  <p className="text-slate-400 italic py-2 text-xs">No activity records logged.</p>
                ) : (
                  leadActivities.map((act) => (
                    <div key={act.id} className="py-2 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{act.action.replace(/_/g, ' ')}</span>
                        <p className="text-slate-600 text-[11px]">{act.details}</p>
                        <span className="text-[10px] text-slate-400">By: {act.actorName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(act.timestamp || act.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={() => setInspectedLead(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ASSIGN CONTRACTOR MODAL */}
      {assignModalLead && (
        <Modal
          isOpen={true}
          onClose={() => setAssignModalLead(null)}
          title={`Assign Contractor: #${assignModalLead.leadNumber}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-xs text-slate-600">
              Select an approved contractor to claim or receive dispatch for this lead.
            </p>

            <div className="space-y-1">
              <label className="font-bold text-xs text-slate-700 block">
                Target Contractor:
              </label>
              <select
                value={selectedContractorId}
                onChange={(e) => setSelectedContractorId(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="">-- Choose Contractor --</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName || `${c.primaryContact?.firstName || 'Contractor'} ${c.primaryContact?.lastName || ''}`.trim()} ({c.city || 'Sacramento'}, {c.state || 'CA'} - {c.onboardingStatus})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-xs text-slate-700 block">
                Admin Assignment Note:
              </label>
              <textarea
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                placeholder="Reason for assignment / manual dispatch override..."
                rows={3}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={() => setAssignModalLead(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedContractorId}
                onClick={handleConfirmAssign}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Confirm Assignment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* OVERRIDE STATUS MODAL */}
      {statusModalLead && (
        <Modal
          isOpen={true}
          onClose={() => setStatusModalLead(null)}
          title={`Override Status: #${statusModalLead.leadNumber}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-xs text-slate-600">
              Directly override the lifecycle status of this lead. All overrides are recorded in the audit log.
            </p>

            <div className="space-y-1">
              <label className="font-bold text-xs text-slate-700 block">
                New Status:
              </label>
              <select
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value as LeadStatus)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white"
              >
                <option value="AVAILABLE">AVAILABLE (Open to all matching)</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="DECLINED">DECLINED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-xs text-slate-700 block">
                Reason / Administrative Notes:
              </label>
              <textarea
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="Reason for overriding lead status..."
                rows={3}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={() => setStatusModalLead(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmStatusOverride}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Apply Override
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
