// lib/recruitmentApi.ts
import { api, unwrap } from "./Api";

export type JobPosting = {
    id: number;
    job_title: string;
    department_id?: number;
    department_name?: string;
    openings: number;
    employment_type: 'full_time' | 'part_time' | 'contract' | 'internship';
    experience_required?: string;
    salary_min?: number;
    salary_max?: number;
    location: string;
    description: string;
    requirements?: string;
    responsibilities?: string;
    status: 'open' | 'closed' | 'on_hold';
    total_applications: number;
    shortlisted: number;
    interviews: number;
    selected: number;
    offers_sent: number;
    hired: number;
    share_link_hash?: string;
    share_link_views: number;
    share_link_applications: number;
    created_by?: number;
    created_by_name?: string;
    created_at: string;
    updated_at: string;
};

export type JobApplication = {
    id: number;
    job_id: number;
    job_title?: string;
    applicant_name: string;
    applicant_email: string;
    applicant_phone?: string;
    experience_years: number;
    current_company?: string;
    current_ctc?: number;
    expected_ctc?: number;
    notice_period: number;
    resume_path?: string;
    cover_letter?: string;
    interview_stage: 'applied' | 'screening' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'selected' | 'rejected';
    interview_round_number: number;
    interview_feedback?: any;
    interview_dates?: any;
    interviewers?: any;
    overall_rating?: number;
    offer_status: 'no_offer' | 'offer_sent' | 'offer_accepted' | 'offer_declined' | 'offer_withdrawn';
    offered_ctc?: number;
    offer_date?: string;
    joining_date?: string;
    offer_letter_path?: string;
    source: 'career_site' | 'referral' | 'linkedin' | 'naukri' | 'indeed' | 'other';
    referred_by?: number;
    referred_by_name?: string;
    referral_notes?: string;
    applied_via_share_link: boolean;
    share_link_hash?: string;
    status: 'active' | 'archived' | 'withdrawn';
    applied_date: string;
    stage_changed_date?: string;
    created_at: string;
    updated_at: string;
};

export type JobReferral = {
    id: number;
    job_id: number;
    job_title?: string;
    referrer_id: number;
    referrer_name?: string;
    referrer_email?: string;
    candidate_name: string;
    candidate_email: string;
    candidate_phone?: string;
    resume_path?: string;
    notes?: string;
    status: 'pending' | 'contacted' | 'applied' | 'hired' | 'rejected';
    application_id?: number;
    application_status?: string;
    referral_bonus_amount?: number;
    bonus_status: 'pending' | 'eligible' | 'paid';
    created_at: string;
    updated_at: string;
};

export type ShareLink = {
    hash: string;
    link: string;
    job_title: string;
};

export type RecruitmentStats = {
    open_positions: number;
    total_postings: number;
    in_interview: number;
    offers_made: number;
    total_applications: number;
    referrals_hired: number;
};

export const recruitmentApi = {
    // JOBS
    createJob: async (jobData: Omit<JobPosting, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<JobPosting> => {
        const response = await api.post("/recruitment/jobs", jobData);
        return unwrap(response);
    },

    getJobs: async (filters?: {
        status?: string;
        department_id?: number;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<JobPosting[]> => {
        const response = await api.get("/recruitment/jobs", { params: filters });
        return unwrap(response);
    },

    getJobById: async (id: number): Promise<JobPosting> => {
        const response = await api.get(`/recruitment/jobs/${id}`);
        return unwrap(response);
    },

    updateJobStatus: async (id: number, status: 'open' | 'closed' | 'on_hold'): Promise<{ success: boolean; message: string }> => {
        const response = await api.patch(`/recruitment/jobs/${id}/status`, { status });
        return unwrap(response);
    },

    // APPLICATIONS
    getJobApplications: async (
        jobId: number,
        filters?: {
            interview_stage?: string;
            offer_status?: string;
            search?: string;
            page?: number;
            limit?: number;
        }
    ): Promise<JobApplication[]> => {
        const response = await api.get(`/recruitment/jobs/${jobId}/applications`, { params: filters });
        return unwrap(response);
    },

    createApplication: async (formData: FormData): Promise<JobApplication> => {
        const response = await api.post("/recruitment/applications", formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return unwrap(response);
    },

    updateApplicationStage: async (
        id: number,
        interview_stage: JobApplication['interview_stage']
    ): Promise<{ success: boolean; message: string }> => {
        const response = await api.patch(`/recruitment/applications/${id}/stage`, { interview_stage });
        return unwrap(response);
    },

    sendOffer: async (
        id: number,
        offerData: { offered_ctc: number; joining_date?: string }
    ): Promise<{ success: boolean; message: string }> => {
        const response = await api.post(`/recruitment/applications/${id}/offer`, offerData);
        return unwrap(response);
    },

    // REFERRALS
    createReferral: async (formData: FormData): Promise<JobReferral> => {
        const response = await api.post("/recruitment/referrals", formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return unwrap(response);
    },

    getJobReferrals: async (jobId: number): Promise<JobReferral[]> => {
        const response = await api.get(`/recruitment/jobs/${jobId}/referrals`);
        return unwrap(response);
    },

    // SHARE LINKS
    generateShareLink: async (jobId: number): Promise<ShareLink> => {
        const response = await api.get(`/recruitment/jobs/${jobId}/share-link`);
        return unwrap(response);
    },

    // PUBLIC API
    getJobByShareLink: async (hash: string): Promise<JobPosting> => {
        const response = await api.get(`/recruitment/public/jobs/${hash}`);
        return unwrap(response);
    },

    createPublicApplication: async (formData: FormData): Promise<JobApplication> => {
        const response = await api.post("/recruitment/public/applications", formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return unwrap(response);
    },

    // STATISTICS
    getStats: async (): Promise<RecruitmentStats> => {
        const response = await api.get("/recruitment/stats");
        return unwrap(response);
    }
};

export default recruitmentApi;