/**
 * You Want Services - Admin Audit Logs & Compliance Trail
 * Prompt #10 Architecture
 *
 * Implements:
 * - Immutable Activity & Compliance Audit Stream
 * - Security Event Filtering (Role, Action Type, Search)
 * - JSON Payload Details Inspection Modal
 * - Audit Trail CSV Export for Compliance
 */

import React, { useState, useMemo } from 'react';
import { auditLogger } from '../../services/auditLogger';
import { AuditLog, UserRole } from '../../types/database';
import { Card, Badge, Button, Input } from '../../components/common/UIComponents';
import {
  ShieldAlert,
  Search,
  Download,
  Filter,
  Eye,
  X,
  Clock,
  Terminal,
  User,
  Layers,
  Key,
} from 'lucide-react';

export const AdminAuditLogsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Live logs
  const logs = useMemo(() => {
    return auditLogger.getAllLogs();
  }, []);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (roleFilter !== 'ALL' && log.actorRole !== roleFilter) return false;
      if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const detailsStr = JSON.stringify(log.details || {}).toLowerCase();
        const matches =
          log.id.toLowerCase().includes(term) ||
          log.action.toLowerCase().includes(term) ||
          log.actorId.toLowerCase().includes(term) ||
          log.entityType.toLowerCase().includes(term) ||
          log.entityId.toLowerCase().includes(term) ||
          detailsStr.includes(term);

        if (!matches) return false;
      }

      return true;
    });
  }, [logs, roleFilter, actionFilter, searchTerm]);

  // Unique actions list for filter
  const uniqueActions = useMemo(() => {
    const set = new Set(logs.map((l) => l.action));
    return Array.from(set);
  }, [logs]);

  // CSV Export
  const handleExportCSV = () => {
    const csvContent = auditLogger.exportLogsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `yws-audit-trail-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Security & Compliance Audit Logs
          </h1>
          <p className="text-xs text-slate-500">
            Immutable system activity trail, authorization events, administrative overrides, and compliance records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export Audit Trail CSV
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Input
              placeholder="Search by action, actor, entity ID, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Actor Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="CONTRACTOR">CONTRACTOR</option>
              <option value="CUSTOMER">CUSTOMER</option>
            </select>
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Action Events ({uniqueActions.length})</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Log ID</th>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">Actor Role & ID</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No audit records match filter parameters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {log.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md text-[11px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            log.actorRole === 'ADMIN' || log.actorRole === 'SUPER_ADMIN'
                              ? 'info'
                              : log.actorRole === 'CONTRACTOR'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {log.actorRole}
                        </Badge>
                        <span className="font-mono text-slate-500 text-[11px]">{log.actorId}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="font-bold text-slate-900">{log.entityType}</span>
                      <span className="font-mono text-slate-400 text-[11px] ml-1.5">
                        ({log.entityId})
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Audit Log Record</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Action</span>
                <span className="font-mono font-bold text-slate-900">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Actor</span>
                <span className="font-mono text-slate-900">
                  {selectedLog.actorRole} ({selectedLog.actorId})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Target Entity</span>
                <span className="font-mono text-slate-900">
                  {selectedLog.entityType}: {selectedLog.entityId}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Origin IP</span>
                <span className="font-mono text-slate-700">{selectedLog.ipAddress}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Timestamp</span>
                <span className="text-slate-900">
                  {new Date(selectedLog.createdAt).toISOString()}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Payload Metadata (JSON)
              </span>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed">
                {JSON.stringify(selectedLog.details || {}, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
