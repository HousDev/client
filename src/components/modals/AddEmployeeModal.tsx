import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
// import { employeeAPI } from '../../api/employee.api';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    role_id: '',
    department_id: '',
    designation: '',
    date_of_joining: new Date().toISOString().split('T')[0],
    gender: 'male',
    project_id: '',
    office_location: '',
    attendance_location: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadRolesAndDepartments();
    }
  }, [isOpen]);

  const loadRolesAndDepartments = async () => {
    try {
      setRoles([
        { id: '1', name: 'Admin' },
        { id: '2', name: 'Manager' },
        { id: '3', name: 'Employee' },
      ]);
      setDepartments([
        { id: '1', name: 'IT' },
        { id: '2', name: 'HR' },
        { id: '3', name: 'Finance' },
      ]);
      setProjects([]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await employeeAPI.create({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        mobile: formData.mobile,
        role_id: formData.role_id,
        department_id: formData.department_id,
        designation: formData.designation,
        date_of_joining: formData.date_of_joining,
        gender: formData.gender,
        project_id: formData.project_id || null,
        office_location: formData.office_location || null,
        attendance_location: formData.attendance_location || null,
      });

      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        role_id: '',
        department_id: '',
        designation: '',
        date_of_joining: new Date().toISOString().split('T')[0],
        gender: 'male',
        project_id: '',
        office_location: '',
        attendance_location: '',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding employee:', error);
      alert(error.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Employee">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              First Name *
            </label>
            <Input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="Enter first name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Last Name *
            </label>
            <Input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="Enter last name"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mobile *
            </label>
            <Input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="+91 XXXXX XXXXX"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role *
            </label>
            <Select
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
              required
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
          </div>

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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Designation *
            </label>
            <Input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g. Software Engineer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date of Joining *
            </label>
            <Input
              type="date"
              value={formData.date_of_joining}
              onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Gender *
          </label>
          <Select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Allotted Project
            </label>
            <Select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_name} ({project.project_code})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Office Location
            </label>
            <Input
              type="text"
              value={formData.office_location}
              onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
              placeholder="e.g. Mumbai Office"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Attendance Location
          </label>
          <Input
            type="text"
            value={formData.attendance_location}
            onChange={(e) => setFormData({ ...formData, attendance_location: e.target.value })}
            placeholder="e.g. Head Office, Branch A"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
