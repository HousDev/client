import { useState } from 'react';
import { X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (leaveData: any) => void;
}

export default function ApplyLeaveModal({ isOpen, onClose, onSuccess }: ApplyLeaveModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leave_type_id: '',
    leave_type: '',
    from_date: '',
    to_date: '',
    reason: '',
  });

  const leaveTypes = [
    { id: '1', name: 'Casual Leave' },
    { id: '2', name: 'Sick Leave' },
    { id: '3', name: 'Privilege Leave' },
    { id: '4', name: 'Maternity Leave' },
    { id: '5', name: 'Paternity Leave' },
    { id: '6', name: 'Annual Leave' },
  ];

  const calculateDays = (fromDate: string, toDate: string) => {
    if (!fromDate || !toDate) return 1;

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const timeDiff = to.getTime() - from.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    return daysDiff > 0 ? daysDiff : 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Mock API call simulation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const selectedLeaveType = leaveTypes.find(type => type.id === formData.leave_type_id);
      const totalDays = calculateDays(formData.from_date, formData.to_date);

      const leaveData = {
        leave_type_id: formData.leave_type_id,
        leave_type: selectedLeaveType?.name || 'Casual Leave',
        from_date: formData.from_date,
        to_date: formData.to_date,
        reason: formData.reason,
        total_days: totalDays,
      };

      console.log('Leave application submitted:', leaveData);

      alert('Leave application submitted successfully! It is now pending approval.');

      // Reset form
      setFormData({
        leave_type_id: '',
        leave_type: '',
        from_date: '',
        to_date: '',
        reason: '',
      });

      onSuccess(leaveData);
      onClose();
    } catch (error) {
      console.error('Error submitting leave application:', error);
      alert('Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply for Leave">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Leave Type *
          </label>
          <Select
            value={formData.leave_type_id}
            onChange={(e) => {
              const selectedType = leaveTypes.find(type => type.id === e.target.value);
              setFormData({
                ...formData,
                leave_type_id: e.target.value,
                leave_type: selectedType?.name || ''
              });
            }}
            required
          >
            <option value="">Select leave type</option>
            {leaveTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              From Date *
            </label>
            <Input
              type="date"
              value={formData.from_date}
              onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              To Date *
            </label>
            <Input
              type="date"
              value={formData.to_date}
              onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
              min={formData.from_date || new Date().toISOString().split('T')[0]}
              required
              disabled={!formData.from_date}
            />
          </div>
        </div>

        {formData.from_date && formData.to_date && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              Total Leave Days: <span className="font-semibold">
                {calculateDays(formData.from_date, formData.to_date)} day(s)
              </span>
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Reason *
          </label>
          <textarea
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Enter reason for leave..."
            required
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-700">
            <span className="font-semibold">Note:</span> Your leave application will be reviewed and approved by your manager. You'll be notified once a decision is made.
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
            disabled={loading || !formData.leave_type_id || !formData.from_date || !formData.to_date || !formData.reason}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}