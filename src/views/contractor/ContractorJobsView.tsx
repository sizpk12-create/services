/**
 * You Want Services - Contractor Jobs Management
 * Phase 1 Architecture
 */

import React, { useState } from 'react';
import { INITIAL_JOBS } from '../../services/mockData';
import { Card, Badge, Button } from '../../components/common/UIComponents';
import { Briefcase, Calendar, MapPin, DollarSign, CheckCircle } from 'lucide-react';
import { Job } from '../../types/database';

export const ContractorJobsView: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);

  const handleMarkComplete = (jobId: string) => {
    setJobs(
      jobs.map((j) =>
        j.id === jobId
          ? { ...j, status: 'COMPLETED', completedDate: new Date().toISOString() }
          : j
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Assigned & Active Jobs
          </h2>
          <p className="text-xs text-slate-500">
            Track confirmed appointments, access instructions, and agreed pricing.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => {
          const isComplete = job.status === 'COMPLETED';
          return (
            <Card key={job.id} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Badge variant={isComplete ? 'success' : 'info'}>{job.status}</Badge>
                  <span className="text-xs font-bold text-slate-900">Job #{job.id}</span>
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  Agreed Rate: ${job.agreedPrice?.toFixed(2)}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                {job.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg mt-2 border border-slate-200">
                    <strong>Site Notes:</strong> {job.notes}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    Scheduled: {new Date(job.scheduledDate || '').toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Springfield, IL</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                {!isComplete ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleMarkComplete(job.id)}
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                  >
                    Mark Job Completed
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Finished & Archived
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
