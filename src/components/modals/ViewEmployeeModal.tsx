import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
} from "lucide-react";
interface ViewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    designation?: string;
    gender?: string;
    joining_date?: string;
    role: { name: string } | null;
    department: { name: string } | null;
    project?: { name: string } | null;
    office_location?: string;
    attendance_location?: string;
    employee_status: string;
    profile_picture?: string;

    // Personal Details
    blood_group?: string;
    date_of_birth?: string;
    marital_status?: string;
    emergency_contact?: string;
    nationality?: string;

    // Address Details
    current_address?: string;
    permanent_address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    same_as_permanent?: boolean;

    // Identification
    aadhar_number?: string;
    pan_number?: string;

    // Educational Details
    highest_qualification?: string;
    university?: string;
    passing_year?: string;
    percentage?: string;

    // Employment Details
    employee_type?: string;
    branch?: string;
    probation_period?: string;
    work_mode?: string;
    job_title?: string;
    notice_period?: string;

    // System Details
    laptop_assigned?: string;
    system_login_id?: string;
    system_password?: string;
    office_email_id?: string;
    office_email_password?: string;

    // Bank Details
    bank_account_number?: string;
    bank_name?: string;
    ifsc_code?: string;
    upi_id?: string;
    salary?: string;
    salary_type?: string;
  };
}

export default function ViewEmployeeModal({
  isOpen,
  onClose,
  employee,
}: ViewEmployeeModalProps) {
  console.log("form data emp. ", employee);
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: string; label: string }> = {
      active: { variant: "success", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      on_leave: { variant: "warning", label: "On Leave" },
      terminated: { variant: "danger", label: "Terminated" },
    };
    const statusConfig = statusMap[status.toLowerCase()] || {
      variant: "secondary",
      label: status,
    };
    return (
      <Badge variant={statusConfig.variant as any}>{statusConfig.label}</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Employee Details" size="lg">
      <div className="space-y-6">
        {/* Header with basic info */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-lg">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h3 className="text-lg font-bold text-slate-900">
                {employee.first_name} {employee.last_name}
              </h3>
              {getStatusBadge(employee.employee_status)}
            </div>
            <p className="text-sm text-slate-600 mb-2">
              {employee.designation}
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                {employee.employee_code || "EMP" + employee.id}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-700 border-b pb-2">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Mail className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-medium text-slate-900">
                  {employee.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Phone className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm font-medium text-slate-900">
                  {employee.phone || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-700 border-b pb-2">
            Professional Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Briefcase className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Role</p>
                <p className="text-sm font-medium text-slate-900">
                  {employee.role?.name || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Building className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Department</p>
                <p className="text-sm font-medium text-slate-900">
                  {employee.department?.name || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Users className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Project</p>
                <p className="text-sm font-medium text-slate-900">
                  {employee.project?.name || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Calendar className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Date of Joining</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDate(employee?.joining_date || "")}
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <IndianRupee className="h-4 w-4 text-slate-500" />{" "}
                {/* or IndianRupee */}
                <div>
                  <p className="text-xs text-slate-500">Salary</p>
                  <p className="text-sm font-medium text-slate-900">
                    {employee.salary ? (
                      <>
                        ₹{employee.salary}{" "}
                        <span className="text-xs text-slate-500">
                          ({employee?.salary_type || "monthly"})
                        </span>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-700 border-b pb-2">
            Location Information
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <MapPin className="h-4 w-4 text-slate-500 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Office Location</p>
                <p className="text-sm font-medium text-slate-900">
                  {employee.office_location || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <MapPin className="h-4 w-4 text-slate-500 mt-1" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Attendance Location</p>
                <p className="text-sm font-medium text-slate-900">
                  {employee.attendance_location || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-700 border-b pb-2">
            Personal Information
          </h4>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Gender</p>
            <p className="text-sm font-medium text-slate-900 capitalize">
              {employee.gender}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
