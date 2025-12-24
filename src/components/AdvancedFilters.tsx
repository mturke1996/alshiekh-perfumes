import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  DollarSign,
  Star,
  Tag,
  Sparkles,
  Package
} from 'lucide-react';
import { ProductFilters } from '../types/perfume-shop';
import MaterialRipple from './MaterialRipple';

interface AdvancedFiltersProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  categories: Array<{ id: string; name: string; nameAr: string }>;
  brands: Array<{ id: string; name: string; nameAr: string }>;
  onClose?: () => void;
}

export default function AdvancedFilters({ 
  filters, 
  onFilterChange, 
  categories, 
  brands,
  onClose 
}: AdvancedFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'category', 
    'price', 
    'brand'
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const FilterSection = ({ 
    id, 
    title, 
    icon: Icon, 
    children 
  }: { 
    id: string; 
    title: string; 
    icon: any; 
    children: React.ReactNode;
  }) => {
    const isExpanded = expandedSections.includes(id);

    return (
      <div className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon size={18} className="text-gray-600" />
            <span className="font-semibold text-gray-900">{title}</span>
          </div>
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 space-y-2">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const CheckboxOption = ({ 
    label, 
    checked, 
    onChange 
  }: { 
    label: string; 
    checked: boolean; 
    onChange: (checked: boolean) => void;
  }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
      />
      <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
    </label>
  );

  const RadioOption = ({ 
    label, 
    value, 
    currentValue, 
    onChange 
  }: { 
    label: string; 
    value: string; 
    currentValue?: string; 
    onChange: (value: string) => void;
  }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="radio"
        checked={currentValue === value}
        onChange={() => onChange(value)}
        className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
      />
      <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
    </label>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Filter size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">تصفية المنتجات</h3>
            {hasActiveFilters && (
              <p className="text-xs text-gray-600">
                {Object.keys(filters).length} فلتر نشط
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <MaterialRipple>
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                مسح الكل
              </button>
            </MaterialRipple>
          )}
          {onClose && (
            <MaterialRipple>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </MaterialRipple>
          )}
        </div>
      </div>

      {/* Filters Content */}
      <div className="max-h-[600px] overflow-y-auto">
        {/* Category Filter */}
        <FilterSection id="category" title="الفئات" icon={Package}>
          <div className="space-y-2">
            {categories.map(category => (
              <CheckboxOption
                key={category.id}
                label={category.nameAr}
                checked={filters.category === category.id}
                onChange={(checked) => 
                  updateFilter('category', checked ? category.id : undefined)
                }
              />
            ))}
          </div>
        </FilterSection>

        {/* Brand Filter */}
        <FilterSection id="brand" title="العلامات التجارية" icon={Tag}>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {brands.map(brand => (
              <CheckboxOption
                key={brand.id}
                label={brand.nameAr}
                checked={filters.brand === brand.id}
                onChange={(checked) => 
                  updateFilter('brand', checked ? brand.id : undefined)
                }
              />
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection id="price" title="نطاق السعر" icon={DollarSign}>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">من</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => updateFilter('priceRange', {
                    ...filters.priceRange,
                    min: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">إلى</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={filters.priceRange?.max || ''}
                  onChange={(e) => updateFilter('priceRange', {
                    ...filters.priceRange,
                    max: Number(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Quick Price Ranges */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'أقل من 50', max: 50 },
                { label: '50 - 100', min: 50, max: 100 },
                { label: '100 - 200', min: 100, max: 200 },
                { label: 'أكثر من 200', min: 200 }
              ].map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => updateFilter('priceRange', {
                    min: range.min || 0,
                    max: range.max
                  })}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                    filters.priceRange?.min === (range.min || 0) && 
                    filters.priceRange?.max === range.max
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}$
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* Rating Filter */}
        <FilterSection id="rating" title="التقييم" icon={Star}>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <RadioOption
                key={rating}
                label={
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(rating)].map((_, i) => (
                        <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                      ))}
                      {[...Array(5 - rating)].map((_, i) => (
                        <Star key={i} size={16} className="text-gray-300" />
                      ))}
                    </div>
                    <span>وأكثر</span>
                  </div>
                }
                value={rating.toString()}
                currentValue={filters.rating?.toString()}
                onChange={(value) => updateFilter('rating', Number(value))}
              />
            ))}
          </div>
        </FilterSection>

        {/* Product Type */}
        <FilterSection id="type" title="نوع المنتج" icon={Sparkles}>
          <div className="space-y-2">
            {[
              { value: 'perfume', label: 'عطور' },
              { value: 'makeup', label: 'مكياج' },
              { value: 'skincare', label: 'العناية بالبشرة' },
              { value: 'haircare', label: 'العناية بالشعر' },
              { value: 'bodycare', label: 'العناية بالجسم' },
              { value: 'gift-set', label: 'مجموعات هدايا' },
              { value: 'accessory', label: 'إكسسوارات' }
            ].map(type => (
              <CheckboxOption
                key={type.value}
                label={type.label}
                checked={filters.productType === type.value}
                onChange={(checked) => 
                  updateFilter('productType', checked ? type.value : undefined)
                }
              />
            ))}
          </div>
        </FilterSection>

        {/* Gender Filter (for perfumes) */}
        {(!filters.productType || filters.productType === 'perfume') && (
          <FilterSection id="gender" title="الجنس" icon={Package}>
            <div className="space-y-2">
              {[
                { value: 'women', label: 'نسائي' },
                { value: 'men', label: 'رجالي' },
                { value: 'unisex', label: 'للجنسين' }
              ].map(gender => (
                <RadioOption
                  key={gender.value}
                  label={gender.label}
                  value={gender.value}
                  currentValue={filters.gender}
                  onChange={(value) => updateFilter('gender', value)}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Availability */}
        <FilterSection id="availability" title="التوفر" icon={Package}>
          <div className="space-y-2">
            <CheckboxOption
              label="المنتجات المتوفرة فقط"
              checked={filters.inStock === true}
              onChange={(checked) => updateFilter('inStock', checked || undefined)}
            />
            <CheckboxOption
              label="المنتجات المخفضة"
              checked={filters.onSale === true}
              onChange={(checked) => updateFilter('onSale', checked || undefined)}
            />
            <CheckboxOption
              label="المنتجات الجديدة"
              checked={filters.isNew === true}
              onChange={(checked) => updateFilter('isNew', checked || undefined)}
            />
            <CheckboxOption
              label="الأكثر مبيعاً"
              checked={filters.isBestSeller === true}
              onChange={(checked) => updateFilter('isBestSeller', checked || undefined)}
            />
          </div>
        </FilterSection>
      </div>

      {/* Footer with Apply Button (Mobile) */}
      {onClose && (
        <div className="p-4 border-t border-gray-200 lg:hidden">
          <MaterialRipple className="w-full">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              تطبيق الفلاتر
            </button>
          </MaterialRipple>
        </div>
      )}
    </div>
  );
}

