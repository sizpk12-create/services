/**
 * You Want Services - Admin Business Intelligence & Reporting Center
 * Prompt #10 Architecture
 *
 * Implements:
 * - Production-Grade CSV Exporters for Revenue, Leads, Contractors, Customers, and Service Requests
 * - Actual Database Records & Real Marketplace Metrics
 * - Interactive Dataset Previewer before downloading
 * - Summary Financial & Conversion Metrics
 */

import React, { useState, useMemo } from 'react';
import { marketplaceFinanceService } from '../../services/marketplaceFinanceService';
import { Card, Badge, Button } from '../../components/common/UIComponents';
import {
  Download,
  FileSpreadsheet,
  DollarSign,
  TrendingUp,
  Users,
  Building,
  ClipboardList,
  CheckCircle2,
  Table,
  Eye,
  Layers,
} from 'lucide-react';

type ReportDatasetKey = 'REVENUE' | 'LEADS' | 'CONTRACTORS' | 'CUSTOMERS' | 'REQUESTS';

export const AdminReportsView: React.FC = () => {
  const [activePreview, setActivePreview] = useState<ReportDatasetKey>('REVENUE');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Live KPIs from database
  const kpis = useMemo(() => {
    return marketplaceFinanceService.getMarketplaceKPIs();
  }, []);

  // CSV Downloader Helper
  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccessMessage(`Generated and downloaded ${filename}.csv successfully.`);
    setTimeout(() => setDownloadSuccessMessage(null), 4000);
  };

  // Preview Data Generator
  const previewData = useMemo(() => {
    let csvString = '';
    switch (activePreview) {
      case 'REVENUE':
        csvString = marketplaceFinanceService.exportRevenueCSV();
        break;
      case 'LEADS':
        csvString = marketplaceFinanceService.exportLeadsCSV();
        break;
      case 'CONTRACTORS':
        csvString = marketplaceFinanceService.exportContractorsCSV();
        break;
      case 'CUSTOMERS':
        csvString = marketplaceFinanceService.exportCustomersCSV();
        break;
      case 'REQUESTS':
        csvString = marketplaceFinanceService.exportServiceRequestsCSV();
        break;
    }

    const lines = csvString.trim().split('\n');
    if (lines.length === 0) return { headers: [], rows: [] };

    // Simple CSV parser for preview table
    const parseCSVLine = (line: string) => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(cur);
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur);
      return result;
    };

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1, 11).map(parseCSVLine); // Top 10 preview rows
    const totalCount = Math.max(0, lines.length - 1);

    return { headers, rows, totalCount };
  }, [activePreview]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Reporting Center & Data Exports
          </h1>
          <p className="text-xs text-slate-500">
            Real database audit records, platform revenues, lead conversion rates, and regulatory CSV exports.
          </p>
        </div>
      </div>

      {downloadSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccessMessage}</span>
        </div>
      )}

      {/* KPI Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Settled Revenue</div>
            <div className="text-2xl font-black text-slate-900 mt-1">${kpis.totalMarketplaceRevenue.toFixed(2)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Monthly Rec. Revenue</div>
            <div className="text-2xl font-black text-blue-600 mt-1">${kpis.monthlyRecurringRevenue}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lead Claim Rate</div>
            <div className="text-2xl font-black text-indigo-600 mt-1">{kpis.leadConversionRate}%</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Verified Pros</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{kpis.verifiedContractors}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Customers</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{kpis.totalCustomers}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Report Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue Report */}
        <Card className="p-5 border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="font-black text-slate-900 text-sm">Marketplace Revenue Ledger</h3>
            </div>
            <p className="text-xs text-slate-500">
              Detailed transaction records including lead fee purchases, recurring subscriptions, and refunds.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() =>
                downloadCSV(marketplaceFinanceService.exportRevenueCSV(), 'yws-revenue-ledger')
              }
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivePreview('REVENUE')}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Preview
            </Button>
          </div>
        </Card>

        {/* Leads Report */}
        <Card className="p-5 border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
              <h3 className="font-black text-slate-900 text-sm">Leads & Claims Performance</h3>
            </div>
            <p className="text-xs text-slate-500">
              Complete log of all generated service leads, pricing, zip codes, and contractor claiming outcomes.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() =>
                downloadCSV(marketplaceFinanceService.exportLeadsCSV(), 'yws-leads-report')
              }
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivePreview('LEADS')}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Preview
            </Button>
          </div>
        </Card>

        {/* Contractors Report */}
        <Card className="p-5 border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
              <h3 className="font-black text-slate-900 text-sm">Contractors & Credentials</h3>
            </div>
            <p className="text-xs text-slate-500">
              Contractor roster with onboarding statuses, license numbers, insurance providers, and contact details.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() =>
                downloadCSV(marketplaceFinanceService.exportContractorsCSV(), 'yws-contractors-roster')
              }
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivePreview('CONTRACTORS')}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Preview
            </Button>
          </div>
        </Card>

        {/* Customers Report */}
        <Card className="p-5 border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-black text-slate-900 text-sm">Registered Customers</h3>
            </div>
            <p className="text-xs text-slate-500">
              Full directory of verified customers, registration timestamps, and contact records.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() =>
                downloadCSV(marketplaceFinanceService.exportCustomersCSV(), 'yws-customers-directory')
              }
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivePreview('CUSTOMERS')}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Preview
            </Button>
          </div>
        </Card>

        {/* Service Requests Stream */}
        <Card className="p-5 border-slate-200 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="font-black text-slate-900 text-sm">Service Requests Stream</h3>
            </div>
            <p className="text-xs text-slate-500">
              All submitted homeowner requests, locations, urgencies, and lifecycle statuses.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() =>
                downloadCSV(marketplaceFinanceService.exportServiceRequestsCSV(), 'yws-requests-stream')
              }
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivePreview('REQUESTS')}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Preview
            </Button>
          </div>
        </Card>
      </div>

      {/* Dataset Live Preview Section */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-slate-600" />
            <h3 className="font-black text-slate-900 text-sm">
              Live Preview: {activePreview} Dataset ({previewData.totalCount} total records)
            </h3>
          </div>
          <div className="text-xs text-slate-500">
            Showing top {previewData.rows.length} sample records
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                {previewData.headers.map((h, i) => (
                  <th key={i} className="py-3 px-4 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewData.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={previewData.headers.length || 1}
                    className="py-8 text-center text-slate-400 text-xs"
                  >
                    No records found in this dataset.
                  </td>
                </tr>
              ) : (
                previewData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/80 transition">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-3 px-4 whitespace-nowrap text-slate-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
