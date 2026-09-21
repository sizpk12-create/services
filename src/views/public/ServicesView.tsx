/**
 * You Want Services - Public Services Catalog View
 * Phase 1 Architecture
 */

import React, { useState } from 'react';
import { INITIAL_SERVICE_CATEGORIES } from '../../config/categories';
import { CategoryCard } from '../../components/home/CategoryCard';
import { useNavigation } from '../../context/NavigationContext';
import { ServiceCategory } from '../../types/database';
import { Search } from 'lucide-react';
import { Button } from '../../components/common/UIComponents';

export const ServicesView: React.FC = () => {
  const { navigate } = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = INITIAL_SERVICE_CATEGORIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (category: ServiceCategory) => {
    navigate('customer-request-service', { categoryId: category.id });
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Marketplace Trades
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
            All Home Service Categories
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            From heating & AC repair to roofing, electrical, and full renovations. Select any service to request quotes from licensed, verified local specialists.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services (e.g. plumbing, AC, roofing)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium w-full sm:w-auto text-right">
            Showing <strong className="text-slate-800">{filtered.length}</strong> categories
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((cat) => (
            <CategoryCard key={cat.id} category={cat} onSelect={handleSelect} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-600 text-sm">No services matched &quot;{searchTerm}&quot;.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm('')}
              className="mt-3"
            >
              Reset Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
