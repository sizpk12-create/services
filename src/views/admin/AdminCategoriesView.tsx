/**
 * You Want Services - Admin Service Categories Management
 * Phase 1 Architecture
 *
 * "The categories should be data-driven so administrators can add/edit categories later."
 */

import React, { useState } from 'react';
import { INITIAL_SERVICE_CATEGORIES } from '../../config/categories';
import { ServiceCategory } from '../../types/database';
import { Card, Button, Input, Badge } from '../../components/common/UIComponents';
import { Plus, Edit3, Check, Layers, AlertCircle } from 'lucide-react';
import { auditLogger } from '../../services/auditLogger';

export const AdminCategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>(INITIAL_SERVICE_CATEGORIES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCat: ServiceCategory = {
      id: `cat-${newName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: newName,
      slug: newName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: newDesc || 'Specialized home service trade.',
      icon: 'Layers',
      active: true,
      displayOrder: categories.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCategories([...categories, newCat]);
    auditLogger.log({
      actorId: 'admin',
      actorRole: 'ADMIN',
      action: 'ADD_SERVICE_CATEGORY',
      entityType: 'SERVICE_CATEGORY',
      entityId: newCat.id,
      details: { name: newCat.name },
      isDemo: true,
    });

    setNewName('');
    setNewDesc('');
    setShowAddForm(false);
    setNotice(`Category "${newCat.name}" added successfully.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const toggleCategoryStatus = (catId: string) => {
    setCategories(
      categories.map((c) => (c.id === catId ? { ...c, active: !c.active } : c))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Service Categories
          </h2>
          <p className="text-xs text-slate-500">
            Data-driven trade taxonomies. Add, reorder, or toggle active status across the marketplace.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {showAddForm ? 'Cancel' : 'Add Category'}
        </Button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
          {notice}
        </div>
      )}

      {/* Add Category Form Drawer */}
      {showAddForm && (
        <Card className="border-blue-200 bg-blue-50/30">
          <form onSubmit={handleAddCategory} className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create New Trade Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Category Name"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Solar & Clean Energy / Insulation"
              />
              <Input
                label="Description"
                required
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief summary of work scope..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Category
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Categories Table / List */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat, idx) => (
                <tr key={cat.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 text-slate-400 font-mono font-semibold">
                    0{idx + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {cat.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-md truncate">
                    {cat.description}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={cat.active ? 'success' : 'neutral'}>
                      {cat.active ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategoryStatus(cat.id)}
                    >
                      {cat.active ? 'Deactivate' : 'Activate'}
                    </Button>
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
