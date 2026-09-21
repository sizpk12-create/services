/**
 * You Want Services - Public Home View
 * Phase 1 Architecture
 */

import React, { useState } from 'react';
import { HeroSection } from '../../components/home/HeroSection';
import { CategoryCard } from '../../components/home/CategoryCard';
import { HowItWorksSection } from '../../components/home/HowItWorksSection';
import { ContractorCtaSection } from '../../components/home/ContractorCtaSection';
import { INITIAL_SERVICE_CATEGORIES } from '../../config/categories';
import { useNavigation } from '../../context/NavigationContext';
import { ServiceCategory } from '../../types/database';
import { Button } from '../../components/common/UIComponents';
import { Sparkles, ArrowRight } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { navigate } = useNavigation();
  const [categories] = useState<ServiceCategory[]>(INITIAL_SERVICE_CATEGORIES);

  const handleCategorySelect = (category: ServiceCategory) => {
    navigate('customer-request-service', { categoryId: category.id });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Service Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore Trade Categories</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Popular Home Services
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                Browse our core trade specialties or request customized service for your residence.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('services')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View All Services
            </Button>
          </div>

          {/* 10 Initial Service Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onSelect={handleCategorySelect}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Contractor CTA Section */}
      <ContractorCtaSection />
    </div>
  );
};
