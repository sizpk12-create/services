/**
 * You Want Services - Customer My Requests View
 * Phase 4 Architecture
 *
 * Implements:
 * - Real data from serviceRequestService with customer ownership scoping
 * - Search by title and Public Request ID (e.g. YS-2026-000101)
 * - Filtering by status (All, Submitted, Matching, Scheduled, Completed, Cancelled, Draft)
 * - Desktop data table & responsive mobile cards
 * - Detail view navigation with route params
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { serviceRequestService } from '../../services/serviceRequestService';
import { INITIAL_SERVICE_CATEGORIES, INITIAL_SERVICE_SUBCATEGORIES } from '../../config/categories';
import { Button, Badge, Card, Input } from '../../components/common/UIComponents';
import { EmptyState } from '../../components/common/StateViews';
import {
  PlusCircle,
  Calendar,
  MapPin,
  Search,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ServiceRequestStatus } from '../../types/database';

export const MyRequestsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate } = useNavigation();

  // Load customer scoped requests
  const customerId = currentUser?.id || 'demo-usr-customer-1';
  const requests = serviceRequestService.getRequestsForCustomer(customerId);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'ACTIVE') {
          if (['CANCELLED', 'COMPLETED', 'DRAFT'].includes(req.status)) return false;
        } else if (req.status !== statusFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = req.title.toLowerCase().includes(query);
        const matchesId = req.publicRequestId?.toLowerCase().includes(query);
        const matchesDesc = req.description.toLowerCase().includes(query);
        const cat = INITIAL_SERVICE_CATEGORIES.find((c) => c.id === req.categoryId);
        const matchesCat = cat?.name.toLowerCase().includes(query);

        if (!matchesTitle && !matchesId && !matchesDesc && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [requests, searchQuery, statusFilter]);

  const getStatusBadge = (status: ServiceRequestStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge variant="info">SUBMITTED</Badge>;
      case 'MATCHING':
        return <Badge variant="warning">MATCHING</Badge>;
      case 'SCHEDULED':
      case 'IN_PROGRESS':
        return <Badge variant="primary">{status.replace('_', ' ')}</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">COMPLETED</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">CANCELLED</Badge>;
      case 'DRAFT':
        return <Badge variant="default">DRAFT</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            My Service Requests
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track submission status, scheduled appointments, and project timelines.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('customer-request-service')}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          New Request
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Request ID (e.g. YS-2026-000101) or project keywords..."
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            {[
              { id: 'ALL', label: 'All' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'SUBMITTED', label: 'Submitted' },
              { id: 'MATCHING', label: 'Matching' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'CANCELLED', label: 'Cancelled' },
              { id: 'DRAFT', label: 'Drafts' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-3">
          {/* Desktop Table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Request ID</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Project Title</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Preferred Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => {
                  const cat = INITIAL_SERVICE_CATEGORIES.find((c) => c.id === req.categoryId);
                  const subcat = INITIAL_SERVICE_SUBCATEGORIES.find((s) => s.id === req.serviceSubcategoryId);
                  return (
                    <tr
                      key={req.id}
                      onClick={() => navigate('customer-request-detail', { id: req.id })}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {req.publicRequestId || req.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{cat?.name || 'Service'}</span>
                        {subcat && (
                          <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                            {subcat.name}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-bold text-slate-900 block truncate">{req.title}</span>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {req.city}, {req.state} {req.zipCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {req.preferredDate || req.preferredScheduleDate || 'Flexible'}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(req.status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('customer-request-detail', { id: req.id });
                          }}
                          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredRequests.map((req) => {
              const cat = INITIAL_SERVICE_CATEGORIES.find((c) => c.id === req.categoryId);
              return (
                <Card
                  key={req.id}
                  onClick={() => navigate('customer-request-detail', { id: req.id })}
                  className="p-4 space-y-3 active:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700 text-xs">
                      {req.publicRequestId || req.id}
                    </span>
                    {getStatusBadge(req.status)}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {cat?.name || 'Service'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">{req.title}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{req.city}, {req.state}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{req.preferredDate || 'Flexible'}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          title={searchQuery ? 'No matching requests found' : "You don't have any service requests yet"}
          description={
            searchQuery
              ? 'Try changing your search terms or adjusting the status filter.'
              : 'Submit a request to connect with licensed local plumbers, electricians, HVAC techs, and more.'
          }
          actionLabel="Request a Service"
          onAction={() => navigate('customer-request-service')}
        />
      )}
    </div>
  );
};
