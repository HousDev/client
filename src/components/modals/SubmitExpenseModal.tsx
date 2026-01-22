import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface SubmitExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (expenseData: any) => void;
}

export default function SubmitExpenseModal({ isOpen, onClose, onSuccess }: SubmitExpenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    category_name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    merchant_name: '',
  });

  const expenseCategories = [
    { id: '1', name: 'Travel' },
    { id: '2', name: 'Meals' },
    { id: '3', name: 'Accommodation' },
    { id: '4', name: 'Office Supplies' },
    { id: '5', name: 'Software/Subscriptions' },
    { id: '6', name: 'Training/Conference' },
    { id: '7', name: 'Transportation' },
    { id: '8', name: 'Others' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Mock API call simulation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const selectedCategory = expenseCategories.find(cat => cat.id === formData.category_id);

      const expenseData = {
        category_id: formData.category_id,
        category_name: selectedCategory?.name || 'Others',
        amount: parseFloat(formData.amount) || 0,
        date: formData.date,
        description: formData.description,
        merchant_name: formData.merchant_name,
      };

      console.log('Expense submitted:', expenseData);

      alert('Expense claim submitted successfully! It is now pending approval.');

      // Reset form
      setFormData({
        category_id: '',
        category_name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        merchant_name: '',
      });

      onSuccess(expenseData);
      onClose();
    } catch (error) {
      console.error('Error submitting expense:', error);
      alert('Failed to submit expense claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Expense Claim" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Category *
          </label>
          <Select
            value={formData.category_id}
            onChange={(e) => {
              const selectedCat = expenseCategories.find(cat => cat.id === e.target.value);
              setFormData({
                ...formData,
                category_id: e.target.value,
                category_name: selectedCat?.name || ''
              });
            }}
            required
          >
            <option value="">Select category</option>
            {expenseCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Amount (₹) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="1"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date *
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Merchant/Vendor Name *
          </label>
          <Input
            type="text"
            value={formData.merchant_name}
            onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
            placeholder="Enter merchant name..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description *
          </label>
          <textarea
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter expense description (purpose, details, etc.)..."
            required
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-700">
            <span className="font-semibold">Important:</span> Please attach supporting documents (receipts/invoices) after submission for verification. Claims without supporting documents may be rejected.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.category_id || !formData.amount || !formData.date || !formData.merchant_name || !formData.description}
          >
            {loading ? 'Submitting...' : 'Submit Claim'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}