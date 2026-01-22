import { X } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterField {
  name: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'multi-select';
  options?: FilterOption[];
}

interface FilterModalProps {
  title: string;
  filters: FilterField[];
  onClose: () => void;
  onApply: (filterValues: Record<string, string | string[]>) => void;
  currentFilters: Record<string, string | string[]>;
}

export default function FilterModal({
  title,
  filters,
  onClose,
  onApply,
  currentFilters,
}: FilterModalProps) {
  const [filterValues, setFilterValues] = React.useState(currentFilters);

  const handleChange = (name: string, value: string | string[]) => {
    setFilterValues({ ...filterValues, [name]: value });
  };

  const handleApply = () => {
    onApply(filterValues);
    onClose();
  };

  const handleReset = () => {
    const reset: Record<string, string | string[]> = {};
    filters.forEach((f) => {
      reset[f.name] = f.type === 'multi-select' ? [] : '';
    });
    setFilterValues(reset);
  };

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {filters.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-slate-700 mb-2">{field.label}</label>

              {field.type === 'select' && (
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterValues[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                >
                  <option value="">All</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {field.type === 'multi-select' && (
                <div className="space-y-2 border border-slate-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {field.options?.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          Array.isArray(filterValues[field.name]) &&
                          filterValues[field.name].includes(opt.value)
                        }
                        onChange={(e) => {
                          const current = Array.isArray(filterValues[field.name])
                            ? filterValues[field.name]
                            : [];
                          const updated = e.target.checked
                            ? [...current, opt.value]
                            : current.filter((v) => v !== opt.value);
                          handleChange(field.name, updated);
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-slate-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {field.type === 'text' && (
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  value={filterValues[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              )}

              {field.type === 'date' && (
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterValues[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 p-6 flex gap-3">
          <Button variant="secondary" onClick={handleReset} className="flex-1">
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import React from 'react';
