import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (ticketData: any) => void;
}

export default function CreateTicketModal({ isOpen, onClose, onSuccess }: CreateTicketModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    category_name: '',
    subject: '',
    description: '',
    priority: 'medium',
  });

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const categories = [
    { id: '1', name: 'HR Query' },
    { id: '2', name: 'IT Support' },
    { id: '3', name: 'Payroll' },
    { id: '4', name: 'Leave Management' },
    { id: '5', name: 'Expense Claim' },
    { id: '6', name: 'Recruitment' },
    { id: '7', name: 'General Query' },
    { id: '8', name: 'Other' },
  ];

  const generateTicketNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TKT-${year}${month}${day}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Mock API call simulation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const selectedCategory = categories.find(cat => cat.id === formData.category_id);
      const ticketNumber = generateTicketNumber();

      const ticketData = {
        ticket_number: ticketNumber,
        title: formData.subject,
        description: formData.description,
        category: selectedCategory?.name || 'Other',
        category_id: formData.category_id,
        priority: formData.priority,
        status: 'open',
        created_at: new Date().toISOString(),
      };

      console.log('Ticket created:', ticketData);

      alert(`Ticket created successfully! Your ticket number is: ${ticketNumber}`);

      // Reset form
      setFormData({
        category_id: '',
        category_name: '',
        subject: '',
        description: '',
        priority: 'medium',
      });

      onSuccess(ticketData);
      onClose();
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Support Ticket" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Subject *
          </label>
          <Input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Brief summary of your issue..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Priority *
            </label>
            <Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              required
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <Select
              value={formData.category_id}
              onChange={(e) => {
                const selectedCat = categories.find(cat => cat.id === e.target.value);
                setFormData({
                  ...formData,
                  category_id: e.target.value,
                  category_name: selectedCat?.name || ''
                });
              }}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {formData.priority === 'critical' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-700">
              <span className="font-semibold">Critical Priority:</span> This indicates a system-wide issue affecting multiple users or a production outage. The support team will respond within 15 minutes.
            </p>
          </div>
        )}

        {formData.priority === 'high' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-700">
              <span className="font-semibold">High Priority:</span> This indicates an issue affecting your work significantly. The support team will respond within 1 hour.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description *
          </label>
          <textarea
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Please describe your issue in detail. Include steps to reproduce, error messages, and any relevant information..."
            required
          />
          <p className="text-xs text-slate-500 mt-1">
            Tip: The more details you provide, the faster we can help you.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">What to expect:</span> After submitting, you'll receive a ticket number. Our support team will review your ticket and respond based on the priority level. You can track the status in the Support section.
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
            disabled={loading || !formData.subject || !formData.description}
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}