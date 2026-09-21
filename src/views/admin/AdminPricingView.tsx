/**
 * You Want Services - Admin Pricing Engine & Dynamic Multipliers
 * Prompt #10 Architecture
 *
 * Implements:
 * - Category-Based Lead Pricing Table (Base Price, Rush 1.25x, Emergency 1.5x)
 * - Dynamic Pricing Simulator & Calculator (Category + Urgency + Membership Tier)
 * - Administrative Rule Editing Modal (Base price, multipliers, activation toggle)
 * - Automatic Audit Logging on Rule Updates
 */

import React, { useState, useMemo } from 'react';
import { marketplaceFinanceService } from '../../services/marketplaceFinanceService';
import { CategoryPricingRule, MembershipTier } from '../../types/database';
import { Card, Badge, Button, Input } from '../../components/common/UIComponents';
import {
  DollarSign,
  TrendingUp,
  Sliders,
  Calculator,
  Edit,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Flame,
  Clock,
  Shield,
  X,
  Layers,
} from 'lucide-react';

export const AdminPricingView: React.FC = () => {
  // Live pricing rules
  const [rules, setRules] = useState<CategoryPricingRule[]>(
    marketplaceFinanceService.getAllPricingRules()
  );

  const refreshRules = () => {
    setRules([...marketplaceFinanceService.getAllPricingRules()]);
  };

  // Editing Rule Modal State
  const [selectedRule, setSelectedRule] = useState<CategoryPricingRule | null>(null);
  const [editBasePrice, setEditBasePrice] = useState<number>(25.0);
  const [editRushMultiplier, setEditRushMultiplier] = useState<number>(1.25);
  const [editEmergencyMultiplier, setEditEmergencyMultiplier] = useState<number>(1.5);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Interactive Simulator State
  const [simCategory, setSimCategory] = useState<string>(
    rules.length > 0 ? rules[0].categoryId : 'cat-hvac'
  );
  const [simUrgency, setSimUrgency] = useState<string>('STANDARD');
  const [simTier, setSimTier] = useState<MembershipTier>('PRO');

  // Simulator calculation
  const simResult = useMemo(() => {
    const selectedRuleObj = rules.find((r) => r.categoryId === simCategory);
    const base = selectedRuleObj ? selectedRuleObj.basePrice : 25.0;

    let multiplier = 1.0;
    if (simUrgency === 'EMERGENCY') {
      multiplier = selectedRuleObj ? selectedRuleObj.emergencyMultiplier : 1.5;
    } else if (simUrgency === 'WITHIN_24_HOURS' || simUrgency === 'RUSH') {
      multiplier = selectedRuleObj ? selectedRuleObj.rushMultiplier : 1.25;
    }

    let discountPercent = 0;
    if (simTier === 'PRO') discountPercent = 15;
    if (simTier === 'ELITE') discountPercent = 30;

    const subtotal = base * multiplier;
    const discountAmount = subtotal * (discountPercent / 100);
    const finalPrice = Math.max(0, subtotal - discountAmount);

    return {
      basePrice: base,
      multiplier,
      subtotal,
      discountPercent,
      discountAmount,
      finalPrice,
    };
  }, [rules, simCategory, simUrgency, simTier]);

  // Open Edit Modal
  const handleOpenEdit = (rule: CategoryPricingRule) => {
    setSelectedRule(rule);
    setEditBasePrice(rule.basePrice);
    setEditRushMultiplier(rule.rushMultiplier);
    setEditEmergencyMultiplier(rule.emergencyMultiplier);
    setEditIsActive(rule.isActive);
    setActionSuccessMessage(null);
  };

  // Save Rule
  const handleSaveRule = () => {
    if (!selectedRule) return;

    marketplaceFinanceService.updatePricingRule(
      selectedRule.categoryId,
      {
        basePrice: Number(editBasePrice),
        rushMultiplier: Number(editRushMultiplier),
        emergencyMultiplier: Number(editEmergencyMultiplier),
        isActive: editIsActive,
      },
      'admin-usr-1',
      'System Administrator'
    );

    refreshRules();
    setActionSuccessMessage(`Pricing rule for ${selectedRule.categoryName} updated successfully.`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
    setSelectedRule(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Lead Pricing Engine & Dynamic Multipliers
          </h1>
          <p className="text-xs text-slate-500">
            Base lead fees by trade, surge urgency multipliers, tier discounts, and real-time simulator.
          </p>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Interactive Simulator Section */}
      <Card className="p-6 border-blue-200 bg-linear-to-r from-blue-50/50 via-indigo-50/30 to-white space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm">
              Real-Time Dynamic Pricing Simulator
            </h3>
            <p className="text-xs text-slate-500">
              Calculate exact contractor lead price given trade category, urgency factor, and membership tier.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Category Select */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Service Trade / Category
            </label>
            <select
              value={simCategory}
              onChange={(e) => setSimCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {rules.map((r) => (
                <option key={r.categoryId} value={r.categoryId}>
                  {r.categoryName} (Base: ${r.basePrice.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Factor */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Request Urgency Factor
            </label>
            <select
              value={simUrgency}
              onChange={(e) => setSimUrgency(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="STANDARD">Standard Scheduling (1.0x)</option>
              <option value="RUSH">Rush / Within 24 Hours (1.25x)</option>
              <option value="EMERGENCY">Emergency Immediate (1.5x)</option>
            </select>
          </div>

          {/* Contractor Tier */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Contractor Membership Tier
            </label>
            <select
              value={simTier}
              onChange={(e) => setSimTier(e.target.value as MembershipTier)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="STARTER">Starter Tier (0% Discount)</option>
              <option value="PRO">Pro Tier (15% Discount)</option>
              <option value="ELITE">Elite Tier (30% Discount)</option>
            </select>
          </div>
        </div>

        {/* Calculation Result Breakdown Bar */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Trade Base</span>
            <div className="font-bold text-slate-900 text-base">
              ${simResult.basePrice.toFixed(2)}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Multiplier</span>
            <div className="font-bold text-slate-900 text-base">
              {simResult.multiplier}x
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Tier Discount</span>
            <div className="font-bold text-emerald-600 text-base">
              -{simResult.discountPercent}% (${simResult.discountAmount.toFixed(2)})
            </div>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
            <span className="text-[10px] uppercase font-bold text-blue-600">Calculated Lead Fee</span>
            <div className="text-2xl font-black text-slate-900">
              ${simResult.finalPrice.toFixed(2)}
            </div>
          </div>
        </div>
      </Card>

      {/* Rules Table */}
      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-600" />
            <h3 className="font-black text-slate-900 text-sm">Category Base Pricing & Multipliers</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Service Trade / Category</th>
                <th className="py-3.5 px-4">Base Lead Price</th>
                <th className="py-3.5 px-4">Rush Multiplier (24hr)</th>
                <th className="py-3.5 px-4">Emergency Multiplier</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((rule) => (
                <tr key={rule.categoryId} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{rule.categoryName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {rule.categoryId}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-black text-slate-900">
                    ${rule.basePrice.toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      {rule.rushMultiplier}x (${(rule.basePrice * rule.rushMultiplier).toFixed(2)})
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                      {rule.emergencyMultiplier}x ($
                      {(rule.basePrice * rule.emergencyMultiplier).toFixed(2)})
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={rule.isActive ? 'success' : 'neutral'}>
                      {rule.isActive ? 'ACTIVE' : 'PAUSED'}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(rule.updatedAt).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(rule)}
                      leftIcon={<Edit className="w-3.5 h-3.5" />}
                    >
                      Edit Rule
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Rule Modal */}
      {selectedRule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Edit Category Pricing</h3>
                <p className="text-xs text-slate-500">{selectedRule.categoryName}</p>
              </div>
              <button
                onClick={() => setSelectedRule(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Base Price */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Base Lead Price ($)
                </label>
                <Input
                  type="number"
                  step="0.50"
                  min="5"
                  max="500"
                  value={editBasePrice}
                  onChange={(e) => setEditBasePrice(parseFloat(e.target.value) || 0)}
                  leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
                />
              </div>

              {/* Rush Multiplier */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Rush (24-hour) Multiplier
                </label>
                <Input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="3.0"
                  value={editRushMultiplier}
                  onChange={(e) => setEditRushMultiplier(parseFloat(e.target.value) || 1.0)}
                  leftIcon={<Zap className="w-4 h-4 text-slate-400" />}
                />
              </div>

              {/* Emergency Multiplier */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Emergency Multiplier
                </label>
                <Input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="4.0"
                  value={editEmergencyMultiplier}
                  onChange={(e) => setEditEmergencyMultiplier(parseFloat(e.target.value) || 1.0)}
                  leftIcon={<Flame className="w-4 h-4 text-slate-400" />}
                />
              </div>

              {/* Activation Switch */}
              <div className="pt-2 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">Rule Active</span>
                  <span className="text-[11px] text-slate-500">Enable lead sales in this trade category</span>
                </div>
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRule(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveRule}
              >
                Save Pricing Rule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
