/**
 * You Want Services - Admin Jobs View
 * Phase 1 Architecture
 */

import React from 'react';
import { INITIAL_JOBS } from '../../services/mockData';
import { Card, Badge, Button } from '../../components/common/UIComponents';

export const AdminJobsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Contractor Jobs & Dispatch
        </h2>
        <p className="text-xs text-slate-500">
          Supervise active service work orders, scheduled appointments, and completions.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Job ID</th>
                <th className="py-3.5 px-4">Work Scope</th>
                <th className="py-3.5 px-4">Contractor</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Agreed Amount</th>
                <th className="py-3.5 px-4 text-right">Scheduled Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INITIAL_JOBS.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{job.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{job.title}</td>
                  <td className="py-3.5 px-4 text-slate-600">Apex HVAC & Mechanical</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={job.status === 'COMPLETED' ? 'success' : 'info'}>
                      {job.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-700">
                    ${job.agreedPrice?.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500">
                    {new Date(job.scheduledDate || '').toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
