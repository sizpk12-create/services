/**
 * You Want Services - Admin Contractors View
 * Phase 6 Architecture
 *
 * Implements Section 12: Admin Contractor Dashboard & Directory
 * - Dedicated Pending Reviews Queue
 * - Full Contractor Search & Filtering (Name, Business, Email, Phone, ID, License)
 * - Multi-criteria Filters (Onboarding Status, Verification Status, Category, State, ZIP)
 * - Metrics Summary (Total, Pending, Action Required, Approved, Suspended/Rejected)
 * - Direct navigation into Contractor Verification Review Interface
 */

import React, { useState, useMemo } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { contractorService } from '../../services/contractorService';
import { accountService } from '../../services/accountService';
import { evaluateExpirationStanding } from '../../services/contractorVerificationService';
import { ContractorProfile, ContractorOnboardingStatus } from '../../types/database';
import { ContractorStatusBadge } from '../../components/admin/ContractorStatusBadge';
import { Card, Badge, Button, Input } from '../../components/common/UIComponents';
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  ArrowRight,
  UserCheck,
  Users,
  FileCheck,
  RefreshCw,
  Eye,
} from 'lucide-react';

export const AdminContractorsView: React.FC = () => {
  const { navigate } = useNavigation();

  // Load profiles from service
  const profiles = contractorService.getAllProfiles();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [zipFilter, setZipFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'queue' | 'all'>('queue');

  // Compute metrics
  const metrics = useMemo(() => {
    const total = profiles.length;
    const pending = profiles.filter(
      (p) => p.onboardingStatus === 'PENDING_REVIEW' || p.onboardingStatus === 'SUBMITTED'
    ).length;
    const actionRequired = profiles.filter((p) => p.onboardingStatus === 'ACTION_REQUIRED').length;
    const approved = profiles.filter((p) => p.onboardingStatus === 'APPROVED').length;
    const suspended = profiles.filter(
      (p) => p.onboardingStatus === 'SUSPENDED' || p.onboardingStatus === 'REJECTED'
    ).length;

    return { total, pending, actionRequired, approved, suspended };
  }, [profiles]);

  // Extract unique states and categories for filter dropdowns
  const availableStates = useMemo(() => {
    const states = new Set<string>();
    profiles.forEach((p) => {
      if (p.state) states.add(p.state);
      if (p.licenseState) states.add(p.licenseState);
    });
    return Array.from(states).sort();
  }, [profiles]);

  // Filtered Contractors List
  const filteredContractors = useMemo(() => {
    return profiles.filter((p) => {
      // Tab filter
      if (activeTab === 'queue') {
        const isQueueItem =
          p.onboardingStatus === 'PENDING_REVIEW' ||
          p.onboardingStatus === 'SUBMITTED' ||
          p.onboardingStatus === 'ACTION_REQUIRED';
        if (!isQueueItem) return false;
      }

      // Search term matching (Name, business, email, phone, id, license)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const user = accountService.getUserById(p.userId);
        const nameMatch = user
          ? `${user.firstName} ${user.lastName}`.toLowerCase().includes(term)
          : false;
        const businessMatch = p.businessName?.toLowerCase().includes(term) || false;
        const emailMatch = p.contactEmail?.toLowerCase().includes(term) || false;
        const phoneMatch = p.contactPhone?.toLowerCase().includes(term) || false;
        const idMatch = p.id?.toLowerCase().includes(term) || false;
        const licenseMatch = p.licenseNumber?.toLowerCase().includes(term) || false;

        if (!nameMatch && !businessMatch && !emailMatch && !phoneMatch && !idMatch && !licenseMatch) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'ALL' && p.onboardingStatus !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL') {
        if (!p.serviceCategories || !p.serviceCategories.includes(categoryFilter)) {
          return false;
        }
      }

      // State filter
      if (stateFilter !== 'ALL') {
        if (p.state !== stateFilter && p.licenseState !== stateFilter) {
          return false;
        }
      }

      // ZIP filter
      if (zipFilter.trim()) {
        if (!p.zipCode?.includes(zipFilter.trim()) && !p.primaryServiceZip?.includes(zipFilter.trim())) {
          return false;
        }
      }

      return true;
    });
  }, [profiles, activeTab, searchTerm, statusFilter, categoryFilter, stateFilter, zipFilter]);

  const handleReviewContractor = (contractorId: string) => {
    navigate('admin-contractor-review', { contractorId });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Contractor Directory & Verification Review
          </h1>
          <p className="text-xs text-slate-500">
            Audit trade credentials, inspect liability policies, review documents, and manage marketplace eligibility.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1.5 rounded-lg font-medium">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>Section 12: Zero Fake Approvals Enforced</span>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Registered</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across all territories</div>
        </div>

        <div
          onClick={() => {
            setActiveTab('queue');
            setStatusFilter('ALL');
          }}
          className={`p-4 rounded-xl border shadow-xs cursor-pointer transition ${
            activeTab === 'queue'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-900">{metrics.pending}</div>
          <div className="text-[10px] text-amber-700/80 mt-0.5">Requires audit action</div>
        </div>

        <div
          onClick={() => {
            setActiveTab('all');
            setStatusFilter('ACTION_REQUIRED');
          }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-orange-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Action Required</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-orange-700">{metrics.actionRequired}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting contractor fix</div>
        </div>

        <div
          onClick={() => {
            setActiveTab('all');
            setStatusFilter('APPROVED');
          }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Approved Active</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{metrics.approved}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Marketplace eligible</div>
        </div>

        <div
          onClick={() => {
            setActiveTab('all');
            setStatusFilter('SUSPENDED');
          }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Suspended / Rejected</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-700">{metrics.suspended}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Blocked from dispatch</div>
        </div>
      </div>

      {/* Tabs: Pending Queue vs All Contractors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'queue'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review Queue ({metrics.pending + metrics.actionRequired})</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Contractors Directory ({metrics.total})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredContractors.length} contractor profile(s)
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4 bg-slate-50/70 border-slate-200 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Main Search Input (6 cols) */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by contractor name, business name, email, phone, ID, or license..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Onboarding Status Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="ACTION_REQUIRED">Action Required</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DEACTIVATED">Deactivated</option>
            </select>
          </div>

          {/* State Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All States</option>
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* ZIP Code Search (2 cols) */}
          <div className="md:col-span-2">
            <input
              type="text"
              value={zipFilter}
              onChange={(e) => setZipFilter(e.target.value)}
              placeholder="ZIP Code..."
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Clear Filters Reset */}
        {(searchTerm || statusFilter !== 'ALL' || stateFilter !== 'ALL' || zipFilter) && (
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span>Filters active</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setStateFilter('ALL');
                setZipFilter('');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </Card>

      {/* Contractors Table */}
      <Card className="p-0 overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Business & Principal</th>
                <th className="py-3 px-4">Trades & Territory</th>
                <th className="py-3 px-4">Trade License</th>
                <th className="py-3 px-4">Insurance Policy</th>
                <th className="py-3 px-4">Docs</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContractors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">No matching contractor profiles found</p>
                    <p className="text-[11px] text-slate-400">Try adjusting your search criteria or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredContractors.map((c) => {
                  const user = accountService.getUserById(c.userId);
                  const licenseExp = evaluateExpirationStanding(c.licenseExpiration);
                  const insuranceExp = evaluateExpirationStanding(c.insuranceExpiration);
                  const docCount = contractorService.getDocuments(c.id).length;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 transition group cursor-pointer"
                      onClick={() => handleReviewContractor(c.id)}
                    >
                      {/* Business & Principal */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                          {c.businessName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {user ? `${user.firstName} ${user.lastName}` : 'Registered Principal'} • {c.contactEmail}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: {c.id}
                        </div>
                      </td>

                      {/* Trades & Territory */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-semibold text-slate-800">
                          {c.serviceCategories && c.serviceCategories.length > 0
                            ? c.serviceCategories[0].replace('cat-', '').toUpperCase() +
                              (c.serviceCategories.length > 1 ? ` (+${c.serviceCategories.length - 1})` : '')
                            : 'General Trade'}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {c.city}, {c.state} {c.zipCode} • {c.serviceRadiusMiles || 25} mi
                        </div>
                      </td>

                      {/* Trade License */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="font-bold text-slate-900">
                          {c.licenseNumber ? `${c.licenseState}-${c.licenseNumber}` : 'None'}
                        </div>
                        <div className="text-[10px]">
                          <Badge variant={licenseExp.badgeVariant} className="text-[10px] py-0 px-1.5">
                            {licenseExp.formattedText}
                          </Badge>
                        </div>
                      </td>

                      {/* Insurance Policy */}
                      <td className="py-3.5 px-4 text-[11px]">
                        <div className="font-semibold text-slate-800 truncate max-w-[130px]">
                          {c.insuranceProvider || 'No policy'}
                        </div>
                        <div className="text-[10px]">
                          <Badge variant={insuranceExp.badgeVariant} className="text-[10px] py-0 px-1.5">
                            {insuranceExp.formattedText}
                          </Badge>
                        </div>
                      </td>

                      {/* Documents */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {docCount}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <ContractorStatusBadge status={c.onboardingStatus} type="onboarding" />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant={c.onboardingStatus === 'PENDING_REVIEW' ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handleReviewContractor(c.id)}
                          className={
                            c.onboardingStatus === 'PENDING_REVIEW'
                              ? 'bg-blue-700 hover:bg-blue-800'
                              : ''
                          }
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          Review
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
    </div>
  );
};
