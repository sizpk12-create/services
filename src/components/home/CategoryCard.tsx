/**
 * You Want Services - Reusable Service Category Card Component
 * Phase 1 Architecture
 */

import React from 'react';
import { ServiceCategory } from '../../types/database';
import {
  ThermometerSnowflake,
  Wrench,
  Zap,
  Sparkles,
  Flower2,
  Layers,
  Home,
  Hammer,
  Tv,
  Paintbrush,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface CategoryCardProps {
  category: ServiceCategory;
  onSelect?: (category: ServiceCategory) => void;
  selected?: boolean;
  compact?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ThermometerSnowflake,
  Wrench,
  Zap,
  Sparkles,
  Flower2,
  Layers,
  Home,
  Hammer,
  Tv,
  Paintbrush,
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onSelect,
  selected = false,
  compact = false,
}) => {
  const IconComponent = iconMap[category.icon] || HelpCircle;

  if (compact) {
    return (
      <div
        id={`cat-card-${category.slug}`}
        onClick={() => onSelect?.(category)}
        className={`p-3.5 rounded-xl border flex items-center gap-3 transition cursor-pointer ${
          selected
            ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm text-slate-800'
        }`}
      >
        <div className="w-10 h-10 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold truncate">{category.name}</p>
          <p className="text-xs text-slate-500 truncate">{category.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`cat-card-${category.slug}`}
      onClick={() => onSelect?.(category)}
      className="group bg-white rounded-xl border border-slate-200 hover:border-blue-400 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
    >
      <div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200 shadow-xs">
          <IconComponent className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1.5">
          {category.name}
        </h3>
        <p className="text-xs text-slate-550 leading-relaxed line-clamp-2">
          {category.description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
        <span>Find Pros</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};
