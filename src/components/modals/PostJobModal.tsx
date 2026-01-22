import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PostJobModal({ isOpen, onClose, onSuccess }: PostJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    department_id: '',
    openings: '1',
    employment_type: 'full_time',
    experience_required: '',
    salary_min: '',
    salary_max: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
    }
  }, [isOpen]);

  const loadDepartments = async () => {
    try {
      // Mock departments data
      setDepartments([
        { id: '1', name: 'IT' },
        { id: '2', name: 'HR' },
        { id: '3', name: 'Finance' },
        { id: '4', name: 'Sales' },
        { id: '5', name: 'Marketing' },
      ]);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock submission with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Job posted:', {
        ...formData,
        openings: parseInt(formData.openings),
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
      });

      alert('Job posted successfully!');

      // Reset form
      setFormData({
        title: '',
        department_id: '',
        openings: '1',
        employment_type: 'full_time',
        experience_required: '',
        salary_min: '',
        salary_max: '',
        location: '',
        description: '',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error posting job:', error);
      alert(error.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post New Job">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Job Title *
          </label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Senior Software Engineer"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Department *
            </label>
            <Select
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              required
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Number of Openings *
            </label>
            <Input
              type="number"
              min="1"
              value={formData.openings}
              onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Employment Type *
            </label>
            <Select
              value={formData.employment_type}
              onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
              required
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Experience Required
            </label>
            <Input
              type="text"
              value={formData.experience_required}
              onChange={(e) => setFormData({ ...formData, experience_required: e.target.value })}
              placeholder="e.g. 3-5 years"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Min Salary (₹/year)
            </label>
            <Input
              type="number"
              value={formData.salary_min}
              onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
              placeholder="e.g. 600000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Max Salary (₹/year)
            </label>
            <Input
              type="number"
              value={formData.salary_max}
              onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
              placeholder="e.g. 1200000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Location *
          </label>
          <Input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Mumbai, Bangalore, Remote"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Job Description *
          </label>
          <textarea
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter job description, requirements, and responsibilities..."
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post Job'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}