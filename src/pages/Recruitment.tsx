import { useState, useEffect } from 'react';
import {
    UserPlus,
    Plus,
    Search,
    Eye,
    Share2,
    Users,
    Briefcase,
    CheckCircle,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import PostJobModal from '../components/modals/PostJobModal';
import ShareJobModal from '../components/modals/ShareJobModal';
import JobApplicationsModal from '../components/modals/JobApplicationsModal';
import ReferralModal from '../components/modals/ReferralModal';

interface JobPosting {
    id: string;
    title: string;
    status: string;
    employment_type: string;
    openings: number;
    location: string;
}

const mockJobPostings: JobPosting[] = [
    {
        id: '1',
        title: 'Senior Frontend Developer',
        status: 'open',
        employment_type: 'Full-time',
        openings: 2,
        location: 'Remote',
    },
    {
        id: '2',
        title: 'Backend Engineer',
        status: 'open',
        employment_type: 'Full-time',
        openings: 1,
        location: 'New York, NY',
    },
    {
        id: '3',
        title: 'UX Designer',
        status: 'on_hold',
        employment_type: 'Contract',
        openings: 1,
        location: 'San Francisco, CA',
    },
    {
        id: '4',
        title: 'DevOps Engineer',
        status: 'closed',
        employment_type: 'Full-time',
        openings: 3,
        location: 'Remote',
    },
    {
        id: '5',
        title: 'Product Manager',
        status: 'open',
        employment_type: 'Full-time',
        openings: 1,
        location: 'Boston, MA',
    },
];

export default function Recruitment() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showPostJobModal, setShowPostJobModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showApplicationsModal, setShowApplicationsModal] = useState(false);
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
    const [jobPostings, setJobPostings] = useState<JobPosting[]>(mockJobPostings);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Mock loading simulation
        const timer = setTimeout(() => {
            setJobPostings(mockJobPostings);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const loadJobPostings = () => {
        setLoading(true);
        setTimeout(() => {
            setJobPostings(mockJobPostings);
            setLoading(false);
        }, 500);
    };

    const handleOpenShare = (job: JobPosting) => {
        setSelectedJob(job);
        setShowShareModal(true);
    };

    const handleOpenApplications = (job: JobPosting) => {
        setSelectedJob(job);
        setShowApplicationsModal(true);
    };

    const handleOpenReferral = (job: JobPosting) => {
        setSelectedJob(job);
        setShowReferralModal(true);
    };

    const handleStatusChange = async (jobId: string, newStatus: 'open' | 'closed' | 'on_hold') => {
        setJobPostings(prev =>
            prev.map(job =>
                job.id === jobId ? { ...job, status: newStatus } : job
            )
        );
        alert('Job status updated successfully');
    };

    const filteredJobs = jobPostings.filter((job) => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        open: jobPostings.filter((j) => j.status === 'open').length,
        total: jobPostings.length,
        interview: 8,
        offers: 3,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button onClick={() => setShowPostJobModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Job
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Open Positions</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.open}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Total Postings</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                            <UserPlus className="h-6 w-6 text-slate-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">In Interview</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.interview}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Offers Made</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{stats.offers}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Job Postings</h2>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-64 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search jobs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                            <option value="on_hold">On Hold</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="p-6 text-center text-slate-600">Loading jobs...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Position</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Type</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Openings</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Location</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredJobs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-600">
                                            No jobs found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredJobs.map((job) => (
                                        <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-900">{job.title}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600">{job.employment_type}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-900">{job.openings}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600">{job.location}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={
                                                            job.status === 'open'
                                                                ? 'success'
                                                                : job.status === 'on_hold'
                                                                    ? 'warning'
                                                                    : 'secondary'
                                                        }
                                                    >
                                                        {job.status}
                                                    </Badge>
                                                    <select
                                                        value={job.status}
                                                        onChange={(e) =>
                                                            handleStatusChange(job.id, e.target.value as any)
                                                        }
                                                        className="text-xs px-2 py-1 border border-slate-300 rounded bg-white hover:border-slate-400"
                                                    >
                                                        <option value="open">Open</option>
                                                        <option value="closed">Closed</option>
                                                        <option value="on_hold">On Hold</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleOpenApplications(job)}
                                                        title="View Applications"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleOpenShare(job)}
                                                        title="Share Job"
                                                    >
                                                        <Share2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleOpenReferral(job)}
                                                        title="Refer Candidate"
                                                    >
                                                        <Users className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <PostJobModal
                isOpen={showPostJobModal}
                onClose={() => setShowPostJobModal(false)}
                onSuccess={() => {
                    loadJobPostings();
                    setShowPostJobModal(false);
                }}
            />

            {selectedJob && (
                <>
                    <ShareJobModal
                        jobId={selectedJob.id}
                        jobTitle={selectedJob.title}
                        isOpen={showShareModal}
                        onClose={() => {
                            setShowShareModal(false);
                            setSelectedJob(null);
                        }}
                    />

                    <JobApplicationsModal
                        jobId={selectedJob.id}
                        jobTitle={selectedJob.title}
                        isOpen={showApplicationsModal}
                        onClose={() => {
                            setShowApplicationsModal(false);
                            setSelectedJob(null);
                        }}
                    />

                    <ReferralModal
                        jobId={selectedJob.id}
                        jobTitle={selectedJob.title}
                        isOpen={showReferralModal}
                        onClose={() => {
                            setShowReferralModal(false);
                            setSelectedJob(null);
                        }}
                        onSuccess={() => loadJobPostings()}
                    />
                </>
            )}
        </div>
    );
}