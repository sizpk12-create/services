/**
 * You Want Services - Contractor Lead History & Archive View
 * Phase 7 Architecture
 *
 * Implements:
 * - Historical lead interaction log (Accepted, Completed, Declined, Expired)
 * - Search and filtering by status, category, date, and keyword
 * - Historical performance indicators (conversion rate, completed jobs, archived value)
 * - Direct lead detail viewing
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { leadService } from '../../services/leadService';
import { Lead, LeadStatus } from '../../types/database';
import { Card, Badge, Button, Input } from '../../components/common/UIComponents';
import {
  History,
  Search,
  Filter,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Download,
  Eye,
  FileText,
} from 'lucide-react';

export const ContractorLeadHistoryView: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate } = useNavigation();

  const contractorId = currentUser?.id || 'demo-usr-contractor-1';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    loadHistory();
  }, [contractorId, statusFilter, searchQuery]);

  const loadHistory = () => {
    // Get all leads for contractor
    const all = leadService.getLeadsForContractor(contractorId, { tab: 'all', search: searchQuery });
    // Filter history to non-available leads (or all if specified)
    const filtered = all.filter((l) => {
      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'COMPLETED' && l.status === 'COMPLETED') return true;
      if (statusFilter === 'ACCEPTED' && ['ACCEPTED', 'CONTACTED', 'SCHEDULED', 'IN_PROGRESS'].includes(l.status)) return true;
      if (statusFilter === 'DECLINED' && l.status === 'DECLINED') return true;
      if (statusFilter === 'EXPIRED' && (l.status === 'EXPIRED' || l.status === 'CLOSED')) return true;
      return false;
    });

    setLeads(filtered);
  };

  const stats = useMemo(() => {
    const all = leadService.getLeadsForContractor(contractorId, { tab: 'all' });
    const acceptedCount = all.filter((l) =>
      ['ACCEPTED', 'CONTACTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(l.status)
    ).length;
    const completedCount = all.filter((l) => l.status === 'COMPLETED').length;
    const declinedCount = all.filter((l) => l.status === 'DECLINED').length;
    const totalInteracted = acceptedCount + declinedCount;
    const winRate = totalInteracted > 0 ? Math.round((acceptedCount / totalInteracted) * 100) : 0;

    return {
      total: all.length,
      acceptedCount,
      completedCount,
      declinedCount,
      winRate,
    };
  }, [contractorId, leads]);

  const handleViewLead = (leadId: string) => {
    sessionStorage.setItem('yws_current_lead_id', leadId);
    navigate('contractor-lead-detail');
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'ACCEPTED':
      case 'CONTACTED':
      case 'SCHEDULED':
      case 'IN_PROGRESS':
        return <Badge variant="info">{status.replace(/_/g, ' ')}</Badge>;
      case 'DECLINED':
        return <Badge variant="danger">Declined</Badge>;
      case 'AVAILABLE':
        return <Badge variant="neutral">Available</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Lead History & Activity Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete historical record of all dispatched, claimed, and closed service leads.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('contractor-leads')}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Active Leads Marketplace
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Leads Logged
          </span>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Claimed / Accepted
          </span>
          <p className="text-2xl font-black text-blue-600">{stats.acceptedCount}</p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Jobs Completed
          </span>
          <p className="text-2xl font-black text-emerald-600">{stats.completedCount}</p>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Claim Win Rate
          </span>
          <p className="text-2xl font-black text-purple-600">{stats.winRate}%</p>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search archive by Lead ID, service, city, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-56 py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="ALL">All Records</option>
          <option value="ACCEPTED">Accepted / Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="DECLINED">Declined</option>
          <option value="EXPIRED">Expired / Closed</option>
        </select>
      </div>

      {/* History Table / List */}
      <Card className="p-0 overflow-hidden border-slate-200">
        {leads.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-medium">No historical lead records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Lead #</th>
                  <th className="py-3 px-4">Service & Scope</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Homeowner</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {l.leadNumber}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900">{l.serviceSubcategory}</div>
                      <div className="text-[11px] text-slate-500 truncate">{l.projectDescription}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {l.city}, {l.state} ({l.zipCode})
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(l.status)}
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      {['ACCEPTED', 'CONTACTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(l.status)
                        ? l.customerName || 'David Miller'
                        : 'Masked (Unclaimed)'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewLead(l.id)}
                        rightIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
