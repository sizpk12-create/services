/**
 * You Want Services - Admin Customers Management View
 * Prompt #10 Architecture
 *
 * Implements:
 * - Live Customer Directory from Account Service
 * - Search & Multi-criteria Filtering (Name, Email, Phone, Status)
 * - Customer Account Inspection Modal
 * - Associated Service Requests & Leads History
 * - Account Status Controls (Suspend / Activate / Mark Inactive)
 */

import React, { useState, useMemo } from 'react';
import { accountService } from '../../services/accountService';
import { serviceRequestService } from '../../services/serviceRequestService';
import { leadService } from '../../services/leadService';
import { User, CustomerProfile, UserStatus, ServiceRequest, Lead } from '../../types/database';
import { Card, Badge, Button, Input } from '../../components/common/UIComponents';
import { useNavigation } from '../../context/NavigationContext';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ClipboardList,
  Inbox,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  X,
  AlertTriangle,
  ArrowRight,
  Eye,
  UserX,
  UserCheck,
} from 'lucide-react';

export const AdminCustomersView: React.FC = () => {
  const { navigate } = useNavigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<CustomerProfile | null>(null);
  const [userRequests, setUserRequests] = useState<ServiceRequest[]>([]);
  const [userLeads, setUserLeads] = useState<Lead[]>([]);
  const [statusActionNote, setStatusActionNote] = useState('');
  const [statusUpdateMessage, setStatusUpdateMessage] = useState<string | null>(null);

  // Load live customers
  const [allUsers, setAllUsers] = useState<User[]>(accountService.getAllUsers());
  const customers = useMemo(() => {
    return allUsers.filter((u) => u.role === 'CUSTOMER');
  }, [allUsers]);

  // Metrics
  const metrics = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.status === 'ACTIVE').length;
    const suspended = customers.filter((c) => c.status === 'SUSPENDED').length;
    const allRequests = serviceRequestService.getAllRequests();
    return { total, active, suspended, totalRequests: allRequests.length };
  }, [customers]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const profile = accountService.getProfile(c.id);
        const nameMatch = `${c.firstName} ${c.lastName}`.toLowerCase().includes(term);
        const emailMatch = c.email.toLowerCase().includes(term);
        const phoneMatch = c.phone.toLowerCase().includes(term);
        const cityMatch = profile?.city?.toLowerCase().includes(term) || false;
        const zipMatch = profile?.zipCode?.toLowerCase().includes(term) || false;
        const idMatch = c.id.toLowerCase().includes(term);

        if (!nameMatch && !emailMatch && !phoneMatch && !cityMatch && !zipMatch && !idMatch) {
          return false;
        }
      }

      return true;
    });
  }, [customers, statusFilter, searchTerm]);

  // Open modal
  const handleInspectCustomer = (user: User) => {
    setSelectedUser(user);
    const profile = accountService.getProfile(user.id) || null;
    setSelectedProfile(profile);

    const requests = serviceRequestService.getRequestsForCustomer(user.id);
    setUserRequests(requests);

    const allLeads = leadService.getAllLeads();
    const leads = allLeads.filter((l) => l.customerId === user.id);
    setUserLeads(leads);

    setStatusActionNote('');
    setStatusUpdateMessage(null);
  };

  // Change account status
  const handleUpdateStatus = (newStatus: UserStatus) => {
    if (!selectedUser) return;
    const result = accountService.updateUserStatus(
      selectedUser.id,
      newStatus,
      'admin-usr-1',
      statusActionNote || `Status changed to ${newStatus} by administrator`
    );

    if (result.success && result.user) {
      setSelectedUser(result.user);
      setAllUsers([...accountService.getAllUsers()]);
      setStatusUpdateMessage(`Account status updated to ${newStatus}.`);
      setTimeout(() => setStatusUpdateMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Directory & Accounts
          </h1>
          <p className="text-xs text-slate-500">
            Registered homeowners, service request activity, and account standing controls.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Homeowners</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Accounts</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.active}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Suspended Accounts</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{metrics.suspended}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Platform Requests</div>
            <div className="text-2xl font-black text-indigo-600 mt-1">{metrics.totalRequests}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Search by customer name, email, phone, city, or ID..."
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
              <option value="ALL">All Account Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING_VERIFICATION">PENDING VERIFICATION</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Customer Table */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Customer Name & ID</th>
                <th className="py-3.5 px-4">Contact Information</th>
                <th className="py-3.5 px-4">Primary Address</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No customer accounts matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((user) => {
                  const profile = accountService.getProfile(user.id);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: {user.id}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{user.phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {profile ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>
                              {profile.city}, {profile.state} {profile.zipCode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No address on file</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            user.status === 'ACTIVE'
                              ? 'success'
                              : user.status === 'SUSPENDED'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {user.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInspectCustomer(user)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Inspect Record
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

      {/* Customer Record Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <Badge
                    variant={
                      selectedUser.status === 'ACTIVE'
                        ? 'success'
                        : selectedUser.status === 'SUSPENDED'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {selectedUser.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Account ID: {selectedUser.id}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {statusUpdateMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{statusUpdateMessage}</span>
                </div>
              )}

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Contact Info</span>
                  <div className="space-y-1 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedUser.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Residence Location</span>
                  <div className="space-y-1 text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedProfile?.address || 'Street not recorded'}</span>
                    </div>
                    <div className="text-slate-500 pl-5">
                      {selectedProfile?.city || 'Springfield'}, {selectedProfile?.state || 'IL'} {selectedProfile?.zipCode || '62701'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Request History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-indigo-600" />
                    Service Requests ({userRequests.length})
                  </h4>
                </div>

                {userRequests.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No service requests submitted yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900">{req.title}</div>
                          <div className="text-[11px] text-slate-500">
                            Category: {req.categoryId} • Urgency: {req.urgency}
                          </div>
                        </div>
                        <Badge variant="info">{req.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Leads Created History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Inbox className="w-4 h-4 text-amber-600" />
                    Generated Marketplace Leads ({userLeads.length})
                  </h4>
                </div>

                {userLeads.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No leads generated for this customer.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900">Lead #{lead.leadNumber}</div>
                          <div className="text-[11px] text-slate-500">
                            Assigned to: {lead.assignedBusinessName || 'Unassigned / Open Pool'}
                          </div>
                        </div>
                        <Badge variant="neutral">{lead.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Administrative Status Actions */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Account Standing Controls
                </h4>
                <p className="text-[11px] text-slate-500">
                  Change customer standing. Suspending prevents new service requests from being submitted.
                </p>

                <Input
                  placeholder="Optional admin justification note..."
                  value={statusActionNote}
                  onChange={(e) => setStatusActionNote(e.target.value)}
                />

                <div className="flex items-center gap-3 pt-1">
                  {selectedUser.status !== 'ACTIVE' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateStatus('ACTIVE')}
                      leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                    >
                      Activate Account
                    </Button>
                  )}

                  {selectedUser.status !== 'SUSPENDED' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleUpdateStatus('SUSPENDED')}
                      leftIcon={<UserX className="w-3.5 h-3.5" />}
                    >
                      Suspend Account
                    </Button>
                  )}

                  {selectedUser.status !== 'INACTIVE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus('INACTIVE')}
                    >
                      Mark Inactive
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
