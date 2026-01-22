import { useState, useEffect } from 'react';
import { X, Eye, Download, CheckCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface JobApplication {
  id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  experience_years: number;
  applied_date: string;
  status: string;
  cover_letter?: string;
  resume_url?: string;
}

interface JobApplicationsModalProps {
  jobId: string;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

// Mock applications data
const mockApplications: JobApplication[] = [
  {
    id: '1',
    applicant_name: 'John Doe',
    applicant_email: 'john@example.com',
    applicant_phone: '+91 98765 43210',
    experience_years: 5,
    applied_date: '2024-01-15',
    status: 'shortlisted',
    cover_letter: 'I have 5 years of experience in React development...',
    resume_url: '#',
  },
  {
    id: '2',
    applicant_name: 'Jane Smith',
    applicant_email: 'jane@example.com',
    applicant_phone: '+91 98765 43211',
    experience_years: 3,
    applied_date: '2024-01-16',
    status: 'applied',
    cover_letter: 'Passionate about frontend development...',
    resume_url: '#',
  },
  {
    id: '3',
    applicant_name: 'Robert Johnson',
    applicant_email: 'robert@example.com',
    applicant_phone: '+91 98765 43212',
    experience_years: 7,
    applied_date: '2024-01-14',
    status: 'interview_scheduled',
    cover_letter: 'Extensive experience in full-stack development...',
    resume_url: '#',
  },
];

export default function JobApplicationsModal({
  jobId,
  jobTitle,
  isOpen,
  onClose
}: JobApplicationsModalProps) {
  const [applications, setApplications] = useState<JobApplication[]>(mockApplications);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen, jobId]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      // Mock loading with timeout
      await new Promise(resolve => setTimeout(resolve, 500));
      setApplications(mockApplications.filter(app => app.id !== '999')); // Filter to show mock data
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      // Mock status update
      await new Promise(resolve => setTimeout(resolve, 300));

      setApplications(
        applications.map((app) =>
          app.id === appId ? { ...app, status: newStatus as any } : app
        )
      );

      if (selectedApp?.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }

      alert('Application status updated successfully');
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selected':
        return 'success';
      case 'rejected':
        return 'error';
      case 'interview_scheduled':
      case 'interviewed':
        return 'info';
      case 'shortlisted':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Job Applications</h2>
              <p className="text-slate-600 mt-1">{jobTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-slate-600 py-8">Loading applications...</p>
          ) : applications.length === 0 ? (
            <p className="text-center text-slate-600 py-8">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{app.applicant_name}</h3>
                        <Badge variant={getStatusColor(app.status)}>
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 mb-3">
                        <p>Email: {app.applicant_email}</p>
                        <p>Phone: {app.applicant_phone}</p>
                        <p>Experience: {app.experience_years} years</p>
                        <p>Applied: {new Date(app.applied_date).toLocaleDateString()}</p>
                      </div>
                      {app.cover_letter && (
                        <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded mt-2">
                          {app.cover_letter.substring(0, 100)}
                          {app.cover_letter.length > 100 ? '...' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {app.resume_url && (
                        <a
                          href={app.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            alert('Mock resume download - In real app, this would download the resume');
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedApp(app)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Application Details</h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700">Name</p>
                <p className="text-slate-900">{selectedApp.applicant_name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">Email</p>
                <p className="text-slate-900">{selectedApp.applicant_email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">Phone</p>
                <p className="text-slate-900">{selectedApp.applicant_phone}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">Experience</p>
                <p className="text-slate-900">{selectedApp.experience_years} years</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">Cover Letter</p>
                <p className="text-slate-700 text-sm bg-slate-50 p-3 rounded-lg">
                  {selectedApp.cover_letter || 'No cover letter provided'}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">Update Status</p>
                <div className="space-y-2">
                  {[
                    'applied',
                    'screening',
                    'shortlisted',
                    'interview_scheduled',
                    'interviewed',
                    'selected',
                    'rejected',
                  ].map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedApp.status === status ? 'primary' : 'secondary'}
                      className="w-full text-left"
                      onClick={() =>
                        handleStatusChange(selectedApp.id, status)
                      }
                    >
                      {status === selectedApp.status && (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}