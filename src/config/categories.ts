/**
 * You Want Services - Initial Data-Driven Service Categories
 * Phase 1 Architecture
 */

import { ServiceCategory, ServiceSubcategory } from '../types/database';

export const INITIAL_SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-hvac',
    name: 'HVAC',
    slug: 'hvac',
    description: 'Heating, ventilation, air conditioning repair, installation, and seasonal tune-ups.',
    icon: 'ThermometerSnowflake',
    active: true,
    displayOrder: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-plumbing',
    name: 'Plumbing',
    slug: 'plumbing',
    description: 'Pipe repairs, leak detection, water heaters, drain cleaning, and fixture installs.',
    icon: 'Wrench',
    active: true,
    displayOrder: 2,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-electrical',
    name: 'Electrical',
    slug: 'electrical',
    description: 'Wiring, circuit panels, lighting, EV chargers, ceiling fans, and safety inspections.',
    icon: 'Zap',
    active: true,
    displayOrder: 3,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-cleaning',
    name: 'Cleaning',
    slug: 'cleaning',
    description: 'Deep residential cleaning, move-out turnover, recurring maid services, and disinfection.',
    icon: 'Sparkles',
    active: true,
    displayOrder: 4,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-lawn-care',
    name: 'Lawn Care',
    slug: 'lawn-care',
    description: 'Mowing, edging, weed treatment, aeration, seasonal yard cleanup, and landscaping.',
    icon: 'Flower2',
    active: true,
    displayOrder: 5,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-concrete',
    name: 'Concrete',
    slug: 'concrete',
    description: 'Driveway pouring, patio slabs, sidewalk repair, decorative stamping, and foundations.',
    icon: 'Layers',
    active: true,
    displayOrder: 6,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-roofing',
    name: 'Roofing',
    slug: 'roofing',
    description: 'Shingle replacement, storm damage inspections, leak patches, and full roof replacements.',
    icon: 'Home',
    active: true,
    displayOrder: 7,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-handyman',
    name: 'Handyman',
    slug: 'handyman',
    description: 'Drywall patching, door hanging, furniture assembly, caulking, and general repairs.',
    icon: 'Hammer',
    active: true,
    displayOrder: 8,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-appliance-repair',
    name: 'Appliance Repair',
    slug: 'appliance-repair',
    description: 'Refrigerators, ovens, dishwashers, washing machines, dryers, and disposal units.',
    icon: 'Tv',
    active: true,
    displayOrder: 9,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-painting',
    name: 'Painting',
    slug: 'painting',
    description: 'Interior room painting, exterior siding, trim, cabinet refinishing, and deck staining.',
    icon: 'Paintbrush',
    active: true,
    displayOrder: 10,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_SERVICE_SUBCATEGORIES: ServiceSubcategory[] = [
  // HVAC
  { id: 'sub-hvac-heating', categoryId: 'cat-hvac', name: 'Heating & Furnace', slug: 'heating', active: true, displayOrder: 1 },
  { id: 'sub-hvac-ac', categoryId: 'cat-hvac', name: 'Air Conditioning', slug: 'air-conditioning', active: true, displayOrder: 2 },
  { id: 'sub-hvac-heatpump', categoryId: 'cat-hvac', name: 'Heat Pump', slug: 'heat-pump', active: true, displayOrder: 3 },
  { id: 'sub-hvac-thermostat', categoryId: 'cat-hvac', name: 'Thermostat & Smart Controls', slug: 'thermostat', active: true, displayOrder: 4 },
  { id: 'sub-hvac-maintenance', categoryId: 'cat-hvac', name: 'Tune-Up & Maintenance', slug: 'maintenance', active: true, displayOrder: 5 },
  { id: 'sub-hvac-other', categoryId: 'cat-hvac', name: 'Other HVAC Service', slug: 'other-hvac', active: true, displayOrder: 6 },

  // Plumbing
  { id: 'sub-plumb-leak', categoryId: 'cat-plumbing', name: 'Leak Detection & Pipe Repair', slug: 'leak', active: true, displayOrder: 1 },
  { id: 'sub-plumb-drain', categoryId: 'cat-plumbing', name: 'Drain Cleaning & Clog Removal', slug: 'drain', active: true, displayOrder: 2 },
  { id: 'sub-plumb-waterheater', categoryId: 'cat-plumbing', name: 'Water Heater Repair & Replace', slug: 'water-heater', active: true, displayOrder: 3 },
  { id: 'sub-plumb-faucet', categoryId: 'cat-plumbing', name: 'Faucet & Fixture Install', slug: 'faucet', active: true, displayOrder: 4 },
  { id: 'sub-plumb-toilet', categoryId: 'cat-plumbing', name: 'Toilet Repair & Install', slug: 'toilet', active: true, displayOrder: 5 },
  { id: 'sub-plumb-sewer', categoryId: 'cat-plumbing', name: 'Sewer Line Inspection & Repair', slug: 'sewer', active: true, displayOrder: 6 },
  { id: 'sub-plumb-other', categoryId: 'cat-plumbing', name: 'Other Plumbing Service', slug: 'other-plumbing', active: true, displayOrder: 7 },

  // Electrical
  { id: 'sub-elec-outlet', categoryId: 'cat-electrical', name: 'Outlets & Switches', slug: 'outlet', active: true, displayOrder: 1 },
  { id: 'sub-elec-lighting', categoryId: 'cat-electrical', name: 'Lighting & Ceiling Fans', slug: 'lighting', active: true, displayOrder: 2 },
  { id: 'sub-elec-panel', categoryId: 'cat-electrical', name: 'Electrical Panel & Breaker Upgrade', slug: 'panel', active: true, displayOrder: 3 },
  { id: 'sub-elec-wiring', categoryId: 'cat-electrical', name: 'Rewiring & Circuit Repair', slug: 'wiring', active: true, displayOrder: 4 },
  { id: 'sub-elec-install', categoryId: 'cat-electrical', name: 'EV Charger & Appliance Wiring', slug: 'installation', active: true, displayOrder: 5 },
  { id: 'sub-elec-other', categoryId: 'cat-electrical', name: 'Other Electrical Service', slug: 'other-electrical', active: true, displayOrder: 6 },

  // Cleaning
  { id: 'sub-clean-deep', categoryId: 'cat-cleaning', name: 'Deep House Cleaning', slug: 'deep-cleaning', active: true, displayOrder: 1 },
  { id: 'sub-clean-move', categoryId: 'cat-cleaning', name: 'Move-in / Move-out Turnover', slug: 'move-cleaning', active: true, displayOrder: 2 },
  { id: 'sub-clean-recurring', categoryId: 'cat-cleaning', name: 'Recurring Maid Service', slug: 'recurring', active: true, displayOrder: 3 },
  { id: 'sub-clean-carpet', categoryId: 'cat-cleaning', name: 'Carpet & Upholstery Cleaning', slug: 'carpet', active: true, displayOrder: 4 },
  { id: 'sub-clean-window', categoryId: 'cat-cleaning', name: 'Window Washing', slug: 'window', active: true, displayOrder: 5 },
  { id: 'sub-clean-other', categoryId: 'cat-cleaning', name: 'Other Cleaning Service', slug: 'other-cleaning', active: true, displayOrder: 6 },

  // Lawn Care
  { id: 'sub-lawn-mowing', categoryId: 'cat-lawn-care', name: 'Mowing, Edging & Trimming', slug: 'mowing', active: true, displayOrder: 1 },
  { id: 'sub-lawn-aeration', categoryId: 'cat-lawn-care', name: 'Aeration, Seeding & Fertilizing', slug: 'aeration', active: true, displayOrder: 2 },
  { id: 'sub-lawn-cleanup', categoryId: 'cat-lawn-care', name: 'Seasonal Yard Cleanup', slug: 'yard-cleanup', active: true, displayOrder: 3 },
  { id: 'sub-lawn-tree', categoryId: 'cat-lawn-care', name: 'Tree & Shrub Trimming', slug: 'tree-trimming', active: true, displayOrder: 4 },
  { id: 'sub-lawn-landscaping', categoryId: 'cat-lawn-care', name: 'Landscape Bedding & Mulch', slug: 'landscaping', active: true, displayOrder: 5 },
  { id: 'sub-lawn-other', categoryId: 'cat-lawn-care', name: 'Other Lawn Care Service', slug: 'other-lawn', active: true, displayOrder: 6 },

  // Concrete
  { id: 'sub-conc-driveway', categoryId: 'cat-concrete', name: 'Driveway Pouring & Repair', slug: 'driveway', active: true, displayOrder: 1 },
  { id: 'sub-conc-patio', categoryId: 'cat-concrete', name: 'Patio Slab & Walkways', slug: 'patio', active: true, displayOrder: 2 },
  { id: 'sub-conc-sidewalk', categoryId: 'cat-concrete', name: 'Sidewalk & Step Repair', slug: 'sidewalk', active: true, displayOrder: 3 },
  { id: 'sub-conc-stamping', categoryId: 'cat-concrete', name: 'Decorative Stamped Concrete', slug: 'stamping', active: true, displayOrder: 4 },
  { id: 'sub-conc-foundation', categoryId: 'cat-concrete', name: 'Foundation & Footing Work', slug: 'foundation', active: true, displayOrder: 5 },
  { id: 'sub-conc-other', categoryId: 'cat-concrete', name: 'Other Concrete Service', slug: 'other-concrete', active: true, displayOrder: 6 },

  // Roofing
  { id: 'sub-roof-shingle', categoryId: 'cat-roofing', name: 'Shingle Repair & Replacement', slug: 'shingle', active: true, displayOrder: 1 },
  { id: 'sub-roof-leak', categoryId: 'cat-roofing', name: 'Emergency Leak Patching', slug: 'leak-repair', active: true, displayOrder: 2 },
  { id: 'sub-roof-inspection', categoryId: 'cat-roofing', name: 'Roof Inspection & Storm Damage', slug: 'inspection', active: true, displayOrder: 3 },
  { id: 'sub-roof-gutter', categoryId: 'cat-roofing', name: 'Gutter Installation & Guards', slug: 'gutters', active: true, displayOrder: 4 },
  { id: 'sub-roof-full', categoryId: 'cat-roofing', name: 'Full Roof Replacement', slug: 'replacement', active: true, displayOrder: 5 },
  { id: 'sub-roof-other', categoryId: 'cat-roofing', name: 'Other Roofing Service', slug: 'other-roofing', active: true, displayOrder: 6 },

  // Handyman
  { id: 'sub-handy-drywall', categoryId: 'cat-handyman', name: 'Drywall Patch & Texture', slug: 'drywall', active: true, displayOrder: 1 },
  { id: 'sub-handy-door', categoryId: 'cat-handyman', name: 'Door & Window Hardware Repair', slug: 'doors-windows', active: true, displayOrder: 2 },
  { id: 'sub-handy-furniture', categoryId: 'cat-handyman', name: 'Furniture Assembly & TV Mounting', slug: 'assembly', active: true, displayOrder: 3 },
  { id: 'sub-handy-caulking', categoryId: 'cat-handyman', name: 'Caulking, Grout & Weatherstripping', slug: 'caulking', active: true, displayOrder: 4 },
  { id: 'sub-handy-general', categoryId: 'cat-handyman', name: 'General Home Maintenance', slug: 'general-repairs', active: true, displayOrder: 5 },
  { id: 'sub-handy-other', categoryId: 'cat-handyman', name: 'Other Handyman Service', slug: 'other-handyman', active: true, displayOrder: 6 },

  // Appliance Repair
  { id: 'sub-app-fridge', categoryId: 'cat-appliance-repair', name: 'Refrigerator & Freezer', slug: 'refrigerator', active: true, displayOrder: 1 },
  { id: 'sub-app-dishwasher', categoryId: 'cat-appliance-repair', name: 'Dishwasher Repair', slug: 'dishwasher', active: true, displayOrder: 2 },
  { id: 'sub-app-oven', categoryId: 'cat-appliance-repair', name: 'Oven, Stove & Range', slug: 'oven', active: true, displayOrder: 3 },
  { id: 'sub-app-washer', categoryId: 'cat-appliance-repair', name: 'Washing Machine & Dryer', slug: 'washer-dryer', active: true, displayOrder: 4 },
  { id: 'sub-app-disposal', categoryId: 'cat-appliance-repair', name: 'Garbage Disposal', slug: 'disposal', active: true, displayOrder: 5 },
  { id: 'sub-app-other', categoryId: 'cat-appliance-repair', name: 'Other Appliance Service', slug: 'other-appliance', active: true, displayOrder: 6 },

  // Painting
  { id: 'sub-paint-interior', categoryId: 'cat-painting', name: 'Interior Room Painting', slug: 'interior', active: true, displayOrder: 1 },
  { id: 'sub-paint-exterior', categoryId: 'cat-painting', name: 'Exterior Siding & Trim', slug: 'exterior', active: true, displayOrder: 2 },
  { id: 'sub-paint-cabinet', categoryId: 'cat-painting', name: 'Cabinet Refinishing & Painting', slug: 'cabinets', active: true, displayOrder: 3 },
  { id: 'sub-paint-deck', categoryId: 'cat-painting', name: 'Deck & Fence Staining', slug: 'deck-staining', active: true, displayOrder: 4 },
  { id: 'sub-paint-wallpaper', categoryId: 'cat-painting', name: 'Wallpaper Removal & Prep', slug: 'wallpaper', active: true, displayOrder: 5 },
  { id: 'sub-paint-other', categoryId: 'cat-painting', name: 'Other Painting Service', slug: 'other-painting', active: true, displayOrder: 6 },
];

/**
 * Returns all active subcategories for a given category ID.
 * Returns an empty array if category has no subcategories.
 */
export function getSubcategoriesForCategory(categoryId: string): ServiceSubcategory[] {
  return INITIAL_SERVICE_SUBCATEGORIES.filter(
    (sub) => sub.categoryId === categoryId && sub.active
  ).sort((a, b) => a.displayOrder - b.displayOrder);
}

