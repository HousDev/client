import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  MapPin,
  Heart,
  Home,
  GraduationCap,
  CreditCard,
  Laptop,
  Edit,
  FileText,
  IdCard,
  Clock,
  CheckCircle,
  X,
  ChevronDown,
  Save,
  Upload,
  Check,
  Loader2,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import employeeAPI from "../lib/employeeApi";
import AddMoreDetailsModal from "../components/modals/AddMoreDetailsModal";
import { useAuth } from "../contexts/AuthContext";
import projectApi from "../lib/projectApi";
import companyApi from "../lib/companyApi";
import { SettingsApi } from "../lib/settingsApi";
import rolesApi from "../lib/rolesApi";
import { designationApi } from "../lib/designationApi";
import { departmentsApi } from "../lib/departmentApi";

interface EmployeeProfileProps {
  employeeId: string;
  onBack?: () => void;
}

export default function EmployeeProfile({
  employeeId,
  onBack,
}: EmployeeProfileProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showAddDetailsModal, setShowAddDetailsModal] = useState(false);
  const { user } = useAuth();

  // For attendance locations
  const [companies, setCompanies] = useState<any[]>([]);
  const [officeLocations, setOfficeLocations] = useState<any[]>([]);
  const [showAttendanceDropdown, setShowAttendanceDropdown] = useState(false);
  const [showWeekOffDropdown, setShowWeekOffDropdown] = useState(false);

  // Auto-close sections
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showMobileTabs, setShowMobileTabs] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Loading states for async data
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Department roles (like UsersMaster)
  const [departmentRoles, setDepartmentRoles] = useState<any[]>([]);
  const [loadingDepartmentRoles, setLoadingDepartmentRoles] = useState(false);
  const [employee, setEmployee] = useState<any>();

  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  )
    .toISOString()
    .split("T")[0];

  const [formData, setFormData] = useState({
    // Basic Details
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    role_id: "",
    department: "",
    department_id: "",
    designation: "",
    designation_id: "",
    joining_date: new Date().toISOString().split("T")[0],
    gender: "male",
    allotted_project: [] as number[],
    company_id: "",
    attendence_location: [] as string[],
    employee_status: "active",

    // Personal Details
    blood_group: "",
    date_of_birth: "",
    marital_status: "",
    emergency_contact: "",
    emergency_contact_relationship: "",
    emergency_contact_name: "",
    nationality: "Indian",

    // Address Details
    current_address: "",
    permanent_address: "",
    city: "",
    state: "",
    pincode: "",
    same_as_permanent: false,

    // Identification Details
    aadhar_number: "",
    pan_number: "",

    // Educational Details
    highest_qualification: "",
    university: "",
    passing_year: "",
    percentage: "",

    // Employment Details
    employee_type: "permanent",
    probation_period: "",
    work_mode: "office",
    date_of_leaving: "",
    notice_period: "30",
    salary: "",
    salary_type: "monthly",
    punch_in_time: "10:00:00",
    week_off_days: [0],

    // System Details
    laptop_assigned: "no",
    system_login_id: "",
    system_password: "",
    office_email_id: "",
    office_email_password: "",

    // Bank Details
    account_holder_name: "",
    bank_account_number: "",
    bank_name: "",
    ifsc_code: "",
    upi_id: "",
    user_id: "",
  });

  const [validationFormData, setValidationFormData] = useState({
    // Basic Details
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    role_id: "",
    department: "",
    department_id: "",
    designation: "",
    designation_id: "",
    joining_date: new Date().toISOString().split("T")[0],
    gender: "male",
    allotted_project: [] as number[],
    company_id: "",
    attendence_location: [] as string[],
    employee_status: "active",

    // Personal Details
    blood_group: "",
    date_of_birth: "",
    marital_status: "",
    emergency_contact: "",
    emergency_contact_relationship: "",
    emergency_contact_name: "",
    nationality: "Indian",

    // Address Details
    current_address: "",
    permanent_address: "",
    city: "",
    state: "",
    pincode: "",
    same_as_permanent: false,

    // Identification Details
    aadhar_number: "",
    pan_number: "",

    // Educational Details
    highest_qualification: "",
    university: "",
    passing_year: "",
    percentage: "",

    // Employment Details
    employee_type: "permanent",
    probation_period: "",
    work_mode: "office",
    date_of_leaving: "",
    notice_period: "30",
    salary: "",
    salary_type: "monthly",

    // System Details
    laptop_assigned: "no",
    system_login_id: "",
    system_password: "",
    office_email_id: "",
    office_email_password: "",

    // Bank Details
    account_holder_name: "",
    bank_account_number: "",
    bank_name: "",
    ifsc_code: "",
    upi_id: "",
  });

  useEffect(() => {
    console.log(validationFormData);
  }, [validationFormData]);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    let baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
    return `${baseUrl}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getTenure = (joiningDate: string) => {
    if (!joiningDate) return "0y 0m";
    const joinDate = new Date(joiningDate);
    const today = new Date();
    let years = today.getFullYear() - joinDate.getFullYear();
    let months = today.getMonth() - joinDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years}y ${months}m`;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
      active: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
      inactive: { bg: "bg-gray-100", text: "text-gray-600", icon: X },
      on_leave: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
      terminated: { bg: "bg-red-100", text: "text-red-700", icon: X },
    };
    const { bg, text, icon: Icon } = config[status] || config.inactive;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${bg} ${text}`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
      </span>
    );
  };

  const getAllottedProjects = () => {
    if (!employee?.allotted_project) return [];
    try {
      if (typeof employee.allotted_project === "string") {
        const parsed = JSON.parse(employee.allotted_project);
        return Array.isArray(parsed) ? parsed : [];
      }
      return Array.isArray(employee.allotted_project)
        ? employee.allotted_project
        : [];
    } catch {
      return [];
    }
  };

  const getAttendanceLocations = () => {
    if (!employee?.attendence_location) return [];
    try {
      if (typeof employee.attendence_location === "string") {
        const parsed = JSON.parse(employee.attendence_location);
        return Array.isArray(parsed) ? parsed : [];
      }
      return Array.isArray(employee.attendence_location)
        ? employee.attendence_location
        : [];
    } catch {
      return [];
    }
  };

  const getWeekOffDays = () => {
    if (!employee?.week_off_days) return [];
    try {
      if (typeof employee.week_off_days === "string") {
        const parsed = JSON.parse(employee.week_off_days);
        return Array.isArray(parsed) ? parsed : [];
      }
      return Array.isArray(employee.week_off_days)
        ? employee.week_off_days
        : [];
    } catch {
      return [];
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const tabs = [
    { id: "overview", label: "Overview", icon: Star },
    { id: "personal", label: "Personal", icon: User },
    { id: "employment", label: "Employment", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "system", label: "System", icon: Laptop },
    { id: "bank", label: "Bank", icon: CreditCard },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  // Load employee data
  const loadEmployee = async () => {
    try {
      const data: any = await employeeAPI.getEmployee(employeeId);

      // Parse allotted_project to array
      let allottedProjects: number[] = [];
      if (data.allotted_project) {
        if (typeof data.allotted_project === "string") {
          try {
            const parsed = JSON.parse(data.allotted_project);
            allottedProjects = Array.isArray(parsed)
              ? parsed.map((id: any) => parseInt(id)).filter(Boolean)
              : [parseInt(data.allotted_project)].filter(Boolean);
          } catch {
            if (!isNaN(parseInt(data.allotted_project))) {
              allottedProjects = [parseInt(data.allotted_project)];
            }
          }
        } else if (typeof data.allotted_project === "number") {
          allottedProjects = [data.allotted_project];
        } else if (Array.isArray(data.allotted_project)) {
          allottedProjects = data.allotted_project
            .map((id: any) => parseInt(id))
            .filter(Boolean);
        }
      }

      // Parse attendance location to array
      let attendanceLocations: string[] = [];
      if (data.attendence_location) {
        if (typeof data.attendence_location === "string") {
          try {
            attendanceLocations = JSON.parse(data.attendence_location);
          } catch {
            attendanceLocations = data.attendence_location
              .split(",")
              .filter(Boolean);
          }
        } else if (Array.isArray(data.attendence_location)) {
          attendanceLocations = data.attendence_location;
        }
      }

      // Set basic details
      const formDataUpdate = {
        first_name: data.first_name || "",
        middle_name: data.middle_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        role: data.role_name || "",
        role_id: data.role_id?.toString() || "",
        department: data.department_name || "",
        department_id: data.department_id?.toString() || "",
        designation: data.designation || "",
        designation_id: "",
        joining_date: data.joining_date
          ? new Date(data.joining_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        gender: data.gender || "male",
        allotted_project: allottedProjects,
        company_id: data.company_id || "",
        attendence_location: attendanceLocations,
        employee_status: data.employee_status || "active",

        // Personal Details
        blood_group: data.blood_group || "",
        date_of_birth: data.date_of_birth
          ? new Date(data.date_of_birth).toISOString().split("T")[0]
          : "",
        marital_status: data.marital_status || "",
        emergency_contact: data.emergency_contact || "",
        emergency_contact_relationship:
          data.emergency_contact_relationship || "",
        emergency_contact_name: data.emergency_contact_name || "",
        nationality: data.nationality || "Indian",

        // Address Details
        current_address: data.current_address || "",
        permanent_address: data.permanent_address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        same_as_permanent: data.same_as_permanent || false,

        // Identification
        aadhar_number: data.aadhar_number || "",
        pan_number: data.pan_number || "",

        // Educational Details
        highest_qualification: data.highest_qualification || "",
        university: data.university || "",
        passing_year: data.passing_year || "",
        percentage: data.percentage || "",

        // Employment Details
        employee_type: data.employee_type || "permanent",
        probation_period: data.probation_period || "",
        work_mode: data.work_mode || "office",
        date_of_leaving: data.date_of_leaving
          ? new Date(data.date_of_leaving).toISOString().split("T")[0]
          : "",
        notice_period: data.notice_period || "30",
        salary: data.salary || "",
        salary_type: data.salary_type || "monthly",
        punch_in_time: data.emp_punch_in_time || "10:00:00",
        week_off_days: data.week_off_days
          ? JSON.parse(data.week_off_days)
          : [0],

        // System Details
        laptop_assigned: data.laptop_assigned || "no",
        system_login_id: data.system_login_id || "",
        system_password: data.system_password || "",
        office_email_id: data.office_email_id || "",
        office_email_password: data.office_email_password || "",

        // Bank Details
        account_holder_name: data.account_holder_name || "",
        bank_account_number: data.bank_account_number || "",
        bank_name: data.bank_name || "",
        ifsc_code: data.ifsc_code || "",
        upi_id: data.upi_id || "",
        user_id: data.user_id || "",
      };

      setFormData(formDataUpdate);
      setValidationFormData(formDataUpdate);
      setEmployee(data);
      setImageError(false);

      if (data.profile_picture) {
        setExistingImage(data.profile_picture);
      }

      // Load company if exists for attendance locations
      if (data.company_id) {
        loadOfficeLocations(data.company_id);
      }

      // Load roles by department when employee data is loaded
      if (data.department_id) {
        await loadRolesByDepartment(
          data.department_id,
          data.role_id,
          data.role_name,
        );
      }

      // Set active section based on existing data
      if (
        data.blood_group ||
        data.date_of_birth ||
        data.marital_status ||
        data.emergency_contact
      ) {
        setActiveSection("personal");
      } else if (
        data.current_address ||
        data.permanent_address ||
        data.city ||
        data.state
      ) {
        setActiveSection("address");
      } else if (
        data.highest_qualification ||
        data.university ||
        data.passing_year
      ) {
        setActiveSection("educational");
      } else if (
        data.employee_type ||
        data.probation_period ||
        data.work_mode
      ) {
        setActiveSection("employment");
      } else if (
        data.laptop_assigned ||
        data.system_login_id ||
        data.office_email_id
      ) {
        setActiveSection("system");
      } else if (data.bank_account_number || data.bank_name || data.ifsc_code) {
        setActiveSection("bank");
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to load employee data");
    }
  };

  // Load projects
  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const data: any = await projectApi.getProjects();
      setProjects(data.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  };

  // Load all roles (fallback)
  const loadAllRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const rolesData: any = await rolesApi.getAllRoles();
      let rolesArray: any[] = [];

      if (Array.isArray(rolesData)) {
        rolesArray = rolesData;
      } else if (
        rolesData &&
        typeof rolesData === "object" &&
        Array.isArray(rolesData.data)
      ) {
        rolesArray = rolesData.data;
      } else if (rolesData && typeof rolesData === "object") {
        const tempArray = Object.values(rolesData);
        if (Array.isArray(tempArray)) {
          rolesArray = tempArray;
        }
      }

      const normalizedRoles = rolesArray.map((role) => ({
        ...role,
        name: role.name,
      }));
      setRoles(normalizedRoles);
    } catch (rolesErr: any) {
      console.error("Failed to load all roles:", rolesErr);
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  // Load roles by department
  const loadRolesByDepartment = useCallback(
    async (
      departmentId: string,
      existingRoleId?: string,
      existingRoleName?: string,
    ) => {
      if (!departmentId) {
        setDepartmentRoles([]);
        return;
      }

      setLoadingDepartmentRoles(true);
      try {
        const roles = await designationApi.getRolesByDepartment(departmentId);
        if (Array.isArray(roles) && roles.length > 0) {
          setDepartmentRoles(roles);

          if (existingRoleId && existingRoleName) {
            const foundRole = roles.find(
              (role: any) =>
                role.id.toString() === existingRoleId.toString() ||
                role.name === existingRoleName,
            );

            if (foundRole) {
              setFormData((prev) => ({
                ...prev,
                role: foundRole.name,
                role_id: foundRole.id.toString(),
              }));
              setValidationFormData((prev) => ({
                ...prev,
                role: foundRole.name,
                role_id: foundRole.id.toString(),
              }));
            }
          }
        } else {
          setDepartmentRoles([]);
        }
      } catch (error: any) {
        console.error("Failed to load department roles:", error);
        setDepartmentRoles([]);
      } finally {
        setLoadingDepartmentRoles(false);
      }
    },
    [],
  );

  // Load designations by department and role
  const loadDesignations = useCallback(
    async (departmentId: string, roleId: string) => {
      if (!departmentId || !roleId) {
        setDesignations([]);
        return;
      }

      setLoadingDesignations(true);
      try {
        const deptDesignations =
          await designationApi.getByDepartment(departmentId);
        const filteredDesignations = deptDesignations.filter(
          (designation: any) => designation.role_id.toString() === roleId,
        );

        setDesignations(filteredDesignations);

        if (!formData.designation_id && filteredDesignations.length > 0) {
          setFormData((prev) => ({
            ...prev,
            designation_id: filteredDesignations[0].id.toString(),
            designation: filteredDesignations[0].name,
          }));
          setValidationFormData((prev) => ({
            ...prev,
            designation_id: filteredDesignations[0].id.toString(),
            designation: filteredDesignations[0].name,
          }));
        }
      } catch (err: any) {
        console.error("Failed to load designations:", err);
        setDesignations([]);
      } finally {
        setLoadingDesignations(false);
      }
    },
    [formData.designation_id],
  );

  // Load departments
  const loadDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const departmentsData: any = await departmentsApi.getAll();
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
    } catch (err: any) {
      console.error("Failed to load departments:", err);
      toast.error(
        "Failed to load departments: " + (err.message || "Unknown error"),
      );
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await companyApi.getCompanies();
      const activeCompanies = data.filter((company: any) => company.is_active);
      setCompanies(activeCompanies);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load companies");
    }
  };

  const loadOfficeLocations = async (companyId: string) => {
    if (!companyId) {
      setOfficeLocations([]);
      return;
    }

    try {
      const locationsData = await companyApi.getCompanyLocations(companyId);
      const activeLocations = locationsData.filter(
        (location: any) => location.is_active,
      );
      setOfficeLocations(activeLocations);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load office locations");
    }
  };

  // Initial data load
  useEffect(() => {
    if (employeeId) {
      loadEmployee();
      loadProjects();
      loadAllRoles();
      loadDepartments();
      loadCompanies();
    }
  }, [employeeId, loadAllRoles]);

  // Load designations when role changes
  useEffect(() => {
    if (formData.department_id && formData.role_id) {
      loadDesignations(formData.department_id, formData.role_id);
    }
  }, [formData.department_id, formData.role_id, loadDesignations]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest(".project-dropdown")) {
        setShowProjectDropdown(false);
      }

      if (!target.closest(".attendance-dropdown")) {
        setShowAttendanceDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle department change
  const handleDepartmentChange = useCallback(
    (departmentName: string) => {
      const selectedDept = departments.find(
        (dept) => dept.name === departmentName,
      );
      if (selectedDept) {
        setFormData((prev) => ({
          ...prev,
          department: departmentName,
          department_id: selectedDept.id || "",
          role: "",
          role_id: "",
          designation: "",
          designation_id: "",
        }));

        if (selectedDept.id) {
          loadRolesByDepartment(selectedDept.id);
        }

        setDesignations([]);
      } else {
        setFormData((prev) => ({
          ...prev,
          department: "",
          department_id: "",
          role: "",
          role_id: "",
          designation: "",
          designation_id: "",
        }));
        setDepartmentRoles([]);
        setDesignations([]);
      }
    },
    [departments, loadRolesByDepartment],
  );

  // Handle role change
  const handleRoleChange = useCallback(
    (roleName: string) => {
      const selectedRole =
        departmentRoles.find((role) => role.name === roleName) ||
        roles.find((role) => role.name === roleName);

      setFormData((prev) => ({
        ...prev,
        role: roleName,
        role_id: selectedRole?.id?.toString() || "",
        designation: "",
        designation_id: "",
      }));
    },
    [departmentRoles, roles],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and WebP files are allowed");
        return;
      }

      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveProfilePicture = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setProfilePicture(null);
    setPreviewUrl(null);
    setExistingImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProjectToggle = (projectId: number) => {
    setFormData((prev) => {
      const currentProjects = [...prev.allotted_project];
      const index = currentProjects.indexOf(projectId);

      if (index > -1) {
        currentProjects.splice(index, 1);
      } else {
        currentProjects.push(projectId);
      }

      return { ...prev, allotted_project: currentProjects };
    });
  };

  const handleAttendanceToggle = (locationId: string) => {
    setFormData((prev) => {
      const currentLocations = [...prev.attendence_location];
      const index = currentLocations.indexOf(locationId);

      if (index > -1) {
        currentLocations.splice(index, 1);
      } else {
        currentLocations.push(locationId);
      }

      return { ...prev, attendence_location: currentLocations };
    });
  };

  const handleWeekOffToggle = (indx: number) => {
    setFormData((prev: any) => {
      const currentWeekOffs = [...prev.week_off_days];
      const index = currentWeekOffs.indexOf(indx);

      if (index > -1) {
        currentWeekOffs.splice(index, 1);
      } else {
        currentWeekOffs.push(indx);
      }

      return { ...prev, week_off_days: currentWeekOffs };
    });
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataObj = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value || value === false || Number(value) === 0) {
          if (Array.isArray(value)) {
            formDataObj.append(key, JSON.stringify(value));
          } else {
            formDataObj.append(key, value.toString());
          }
        }
      });

      if (profilePicture) {
        formDataObj.append("profile_picture", profilePicture);
      }

      await employeeAPI.updateEmployee(employeeId, formDataObj);

      const payload = {
        full_name: formData.first_name + " " + formData.last_name,
        email: formData.email,
        phone: formData.phone,
      };

      await SettingsApi.updateProfile(formData.user_id, payload);

      toast.success("Employee updated successfully!");

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast.error(error.message || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) {
      toast.warning("Mobile number must be 10 digits");
      return;
    }
    setFormData({ ...formData, phone: value });
  };

  const handleEmergencyContactChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) {
      toast.warning("Emergency contact must be 10 digits");
      return;
    }
    setFormData({ ...formData, emergency_contact: value });
  };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 12);
    setFormData({ ...formData, aadhar_number: value });
  };

  const handlePANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 10);
    setFormData({ ...formData, pan_number: value });
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    const numValue = parseFloat(value);
    if (numValue > 100) {
      toast.warning("Percentage cannot exceed 100");
      return;
    }
    setFormData({ ...formData, percentage: value });
  };

  const displayImage =
    previewUrl || (existingImage ? getImageUrl(existingImage) : null);
  const activeDepartments = departments.filter((dept) => dept.is_active);
  const profileImageUrl = employee
    ? getImageUrl(employee.profile_picture)
    : null;
  const employeeInitials = employee
    ? `${employee.first_name?.charAt(0) || ""}${employee.last_name?.charAt(0) || ""}`
    : "";

  if (loading && !employee) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-[#C62828]/20 border-t-[#C62828] rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-2xl shadow-lg border">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Employee Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The profile you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C62828] text-white font-medium rounded-lg hover:bg-red-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Desktop Header */}
      {user?.role === "admin" && (
        <div className="hidden md:block sticky top-16 z-20 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={onBack}
                  className="flex items-center gap-1 md:gap-2 text-gray-700 hover:text-[#C62828] transition-colors p-1 md:p-0"
                >
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm font-medium hidden sm:inline">
                    Employees
                  </span>
                  <span className="text-xs md:text-sm font-medium sm:hidden">
                    Back
                  </span>
                </button>
                <div className="h-4 md:h-6 w-px bg-gray-300 hidden md:block" />
                <span className="text-xs md:text-sm text-gray-500 hidden md:inline">
                  Profile
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        {/* Mobile Profile Header */}
        <div className="md:hidden bg-white rounded-xl shadow-lg border overflow-hidden mb-4">
          <div className="relative h-24 bg-gradient-to-r from-[#40423f] to-[#5a5d5a]" />

          <div className="px-4 pb-6">
            <div className="flex flex-col items-center -mt-12">
              <div className="relative mb-4">
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-[#40423f] to-[#5a5d5a] flex items-center justify-center text-white border-4 border-white shadow-lg overflow-hidden">
                  {displayImage && !imageError ? (
                    <img
                      src={displayImage}
                      alt={`${employee.first_name} ${employee.last_name}`}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="text-2xl font-bold">
                      {employeeInitials}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 right-2">
                  <StatusBadge status={employee.employee_status || "active"} />
                </div>
              </div>

              <div className="text-center mb-4">
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  {employee.first_name}{" "}
                  {employee.middle_name ? `${employee.middle_name} ` : ""}
                  {employee.last_name}
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  {employee.designation || "No designation"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <IdCard className="w-3 h-3" />
                  {employee.employee_code || "No ID"}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  <Building className="w-3 h-3" />
                  <span className="truncate max-w-[80px]">
                    {employee.department_name || "No dept"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <Clock className="w-3 h-3" />
                  {getTenure(employee.joining_date)}
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  id="profile-upload-edit"
                />
                <label
                  htmlFor="profile-upload-edit"
                  className="px-4 py-2 bg-[#C62828] text-white rounded-lg hover:bg-[#A62222] transition text-xs font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  {displayImage ? "Change Photo" : "Upload Photo"}
                </label>
                {displayImage && (
                  <button
                    type="button"
                    onClick={handleRemoveProfilePicture}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-xs font-medium"
                  >
                    Remove
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#C62828] to-red-600 text-white  text-xs py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Update Employee
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Profile Header */}
        <div className="hidden md:block bg-white rounded-xl md:rounded-2xl shadow-lg border overflow-hidden mb-4 md:mb-6">
          <div className="relative h-24 md:h-32 bg-gradient-to-r from-[#40423f] to-[#5a5d5a] z-0" />

          <div className="px-3 sm:px-4 md:px-6 pb-4 md:pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 -mt-12 md:-mt-20">
              <div className="relative">
                <div className="relative w-24 h-24 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-[#40423f] to-[#5a5d5a] flex items-center justify-center text-white border-4 border-white shadow-lg md:shadow-2xl overflow-hidden">
                  {displayImage && !imageError ? (
                    <img
                      src={displayImage}
                      alt={`${employee.first_name} ${employee.last_name}`}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="text-2xl md:text-4xl font-bold">
                      {employeeInitials}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 mt-2 sm:mt-0 z-10">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
                  <div className="space-y-2 md:space-y-3 w-full">
                    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3">
                      <div className="flex">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                          {(employee.first_name || "").charAt(0).toUpperCase() +
                            (employee.first_name || "").slice(1)}{" "}
                          {employee.middle_name &&
                            `${(employee.middle_name || "").charAt(0).toUpperCase() + (employee.middle_name || "").slice(1)} `}
                          {(employee.last_name || "").charAt(0).toUpperCase() +
                            (employee.last_name || "").slice(1)}
                        </h1>
                        <StatusBadge
                          status={employee.employee_status || "active"}
                        />
                      </div>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className=" bg-gradient-to-r from-[#C62828] to-red-600 text-white  text-xs py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Update
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-1 md:space-y-2 z-10">
                      <p className="text-base md:text-lg lg:text-lg text-white font-medium">
                        {employee.designation || "No designation"}
                      </p>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm">
                          <IdCard className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          {employee.employee_code || "No ID"}
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs md:text-sm">
                          <Building className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          <span className="truncate max-w-[100px] md:max-w-none">
                            {employee.department_name || "No dept"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-green-100 text-green-700 rounded-full text-xs md:text-sm">
                          <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          {getTenure(employee.joining_date)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        id="profile-upload-edit"
                      />
                      <label
                        htmlFor="profile-upload-edit"
                        className="px-4 py-2 bg-[#C62828] text-white rounded-lg hover:bg-[#A62222] transition text-sm font-medium flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        {displayImage ? "Change Photo" : "Upload Photo"}
                      </label>
                      {displayImage && (
                        <button
                          type="button"
                          onClick={handleRemoveProfilePicture}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row sm:hidden gap-2 w-full mt-3">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowAddDetailsModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#C62828] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Quick Contact Cards */}
        <div className="md:hidden grid grid-cols-2 gap-2 mb-4">
          <a
            href={`mailto:${employee.email}`}
            className="bg-white rounded-lg border p-3 flex items-center gap-3 hover:bg-blue-50 active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {employee.email || "N/A"}
              </p>
            </div>
          </a>

          <a
            href={`tel:${employee.phone}`}
            className="bg-white rounded-lg border p-3 flex items-center gap-3 hover:bg-green-50 active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {employee.phone || "N/A"}
              </p>
            </div>
          </a>
        </div>

        {/* Desktop Quick Stats */}
        <div className="hidden md:grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4 mb-4 md:mb-6">
          {[
            {
              icon: Mail,
              label: "Email",
              value: employee.email,
              color: "bg-blue-500",
            },
            {
              icon: Phone,
              label: "Phone",
              value: employee.phone,
              color: "bg-green-500",
            },
            {
              icon: Briefcase,
              label: "Role",
              value: employee.role_name,
              color: "bg-purple-500",
            },
            {
              icon: MapPin,
              label: "Company",
              value: employee.company_name,
              color: "bg-amber-500",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-lg md:rounded-xl border p-2 md:p-3 lg:p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div
                  className={`p-1.5 md:p-2 lg:p-2.5 ${item.color} rounded-lg`}
                >
                  <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] md:text-xs text-gray-500 font-medium">
                    {item.label}
                  </p>
                  <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">
                    {item.value || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Form - Hidden by default, shown when edit modal is open */}

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Details Grid */}
              <div className="p-4 bg-white border rounded-lg">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#C62828]" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* First Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          first_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="First name"
                      required
                    />
                  </div>

                  {/* Middle Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={formData.middle_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          middle_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="Middle name"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          last_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="Last name"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="email@company.com"
                      required
                    />
                  </div>

                  {/* Mobile */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={handleMobileChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="10-digit number"
                      maxLength={10}
                      required
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Department */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      required
                      disabled={loadingDepartments || user?.role !== "admin"}
                    >
                      <option value="">Select Department</option>
                      {loadingDepartments ? (
                        <option value="" disabled>
                          Loading departments...
                        </option>
                      ) : activeDepartments.length > 0 ? (
                        activeDepartments.map((dept) => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name}
                            {dept.code ? ` (${dept.code})` : ""}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No departments available
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Role */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      required
                      disabled={
                        !formData.department_id ||
                        loadingDepartmentRoles ||
                        user?.role !== "admin"
                      }
                    >
                      <option value="">Select Role</option>
                      {loadingDepartmentRoles ? (
                        <option value="" disabled>
                          Loading roles...
                        </option>
                      ) : departmentRoles.length > 0 ? (
                        departmentRoles.map((role) => (
                          <option key={role.id} value={role.name}>
                            {role.name}
                          </option>
                        ))
                      ) : formData.department_id ? (
                        roles.length > 0 ? (
                          roles.map((role) => (
                            <option key={role.id} value={role.name}>
                              {role.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No roles available
                          </option>
                        )
                      ) : (
                        <option value="" disabled>
                          Select a department first
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Designation */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.designation_id || formData.designation}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        if (selectedValue) {
                          const selectedDesignation = designations.find(
                            (d) => d.id.toString() === selectedValue,
                          );
                          if (selectedDesignation) {
                            setFormData((prev) => ({
                              ...prev,
                              designation_id: selectedDesignation.id.toString(),
                              designation: selectedDesignation.name,
                            }));
                          }
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      required
                      disabled={loadingDesignations || user?.role !== "admin"}
                    >
                      <option value="">Select Designation</option>
                      {loadingDesignations ? (
                        <option value="" disabled>
                          Loading designations...
                        </option>
                      ) : designations.length > 0 ? (
                        designations.map((designation) => (
                          <option
                            key={designation.id}
                            value={designation.id.toString()}
                          >
                            {designation.name} (Level{" "}
                            {designation.hierarchy_level})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          {formData.department_id && formData.role_id
                            ? "No designations available"
                            : "Select department and role first"}
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Blood Group
                    </label>
                    <select
                      value={formData.blood_group}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          blood_group: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  {/* Joining Date */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Joining Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.joining_date}
                      disabled={user?.role !== "admin"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          joining_date: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      required
                    />
                  </div>

                  {/* Allotted Project */}
                  <div className="space-y-1 project-dropdown">
                    <label className="block text-xs font-semibold text-gray-700">
                      Allotted Project
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setShowProjectDropdown(!showProjectDropdown)
                        }
                        disabled={user?.role !== "admin"}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white text-left flex justify-between items-center hover:bg-gray-50"
                      >
                        <span className="truncate">
                          {formData.allotted_project.length > 0
                            ? `${formData.allotted_project.length} project(s) selected`
                            : "Select project(s)"}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform ${showProjectDropdown ? "rotate-180" : ""}`}
                        />
                      </button>

                      {showProjectDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {loadingProjects ? (
                            <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading projects...
                            </div>
                          ) : projects.length > 0 ? (
                            projects.map((project) => (
                              <label
                                key={project.id}
                                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.allotted_project.includes(
                                    project.id,
                                  )}
                                  onChange={() =>
                                    handleProjectToggle(project.id)
                                  }
                                  className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  {project.name}
                                </span>
                              </label>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No projects available
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {formData.allotted_project.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {projects
                          .filter((project) =>
                            formData.allotted_project.includes(project.id),
                          )
                          .map((project) => (
                            <div
                              key={project.id}
                              className="inline-flex items-center gap-1 bg-[#C62828] text-white px-2 py-1 rounded text-xs font-medium"
                            >
                              <span className="truncate max-w-[120px]">
                                {project.name}
                              </span>
                              {user?.role === "admin" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleProjectToggle(project.id)
                                  }
                                  className="hover:bg-red-700 rounded-full p-0.5 flex-shrink-0"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Company */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Company
                    </label>
                    <select
                      value={formData.company_id}
                      disabled={user?.role !== "admin"}
                      onChange={(e) => {
                        const companyId = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          company_id: companyId,
                          attendence_location: [],
                        }));
                        loadOfficeLocations(companyId);
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Attendance Location */}
                  {formData.company_id && (
                    <div className="space-y-1 attendance-dropdown">
                      <label className="block text-xs font-semibold text-gray-700">
                        Attendance Location
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setShowAttendanceDropdown(!showAttendanceDropdown)
                          }
                          disabled={user?.role !== "admin"}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white text-left flex justify-between items-center hover:bg-gray-50"
                        >
                          <span className="truncate">
                            {formData.attendence_location.length > 0
                              ? `${formData.attendence_location.length} location(s) selected`
                              : "Select location(s)"}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform ${showAttendanceDropdown ? "rotate-180" : ""}`}
                          />
                        </button>

                        {showAttendanceDropdown && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {officeLocations.length > 0 ? (
                              officeLocations.map((location) => (
                                <label
                                  key={location.id}
                                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.attendence_location.includes(
                                      location.id,
                                    )}
                                    onChange={() =>
                                      handleAttendanceToggle(location.id)
                                    }
                                    className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">
                                    {location.name} - {location.city}
                                  </span>
                                </label>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500">
                                No office locations available
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {formData.attendence_location.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {officeLocations
                            .filter((location) =>
                              formData.attendence_location.includes(
                                location.id,
                              ),
                            )
                            .map((location) => (
                              <div
                                key={location.id}
                                className="inline-flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium"
                              >
                                <span className="truncate max-w-[120px]">
                                  {location.name}
                                </span>
                                {user?.role === "admin" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAttendanceToggle(location.id)
                                    }
                                    className="hover:bg-blue-700 rounded-full p-0.5 flex-shrink-0"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Employee Status */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Employee Status
                    </label>
                    <select
                      value={formData.employee_status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          employee_status: e.target.value,
                        })
                      }
                      disabled={user?.role !== "admin"}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on_leave">On Leave</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Details Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                  type="button"
                  onClick={() => toggleSection("personal")}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg border-2 transition-all relative ${
                    activeSection === "personal"
                      ? "bg-red-50 border-[#C62828] text-[#C62828]"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  <span className="text-xs font-semibold">Personal</span>
                  {(formData.blood_group ||
                    formData.date_of_birth ||
                    formData.emergency_contact) && (
                    <Check className="w-3 h-3 text-green-600 absolute top-1 right-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleSection("address")}
                  className={`flex  items-center justify-center px-4 py-2 rounded-lg border-2 transition-all relative ${
                    activeSection === "address"
                      ? "bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                >
                  <Home className="w-4 h-4 mr-1" />
                  <span className="text-xs font-semibold">Address</span>
                  {(formData.current_address || formData.permanent_address) && (
                    <Check className="w-3 h-3 text-green-600 absolute top-1 right-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleSection("educational")}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg border-2 transition-all relative ${
                    activeSection === "educational"
                      ? "bg-green-50 border-green-500 text-green-600"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                >
                  <GraduationCap className="w-4 h-4 mr-1" />
                  <span className="text-xs font-semibold">Education</span>
                  {(formData.highest_qualification || formData.university) && (
                    <Check className="w-3 h-3 text-green-600 absolute top-1 right-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleSection("employment")}
                  className={`flex  items-center justify-center px-4 py-2 rounded-lg border-2 transition-all relative ${
                    activeSection === "employment"
                      ? "bg-purple-50 border-purple-500 text-purple-600"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                >
                  <Briefcase className="w-4 h-4 mr-1" />
                  <span className="text-xs font-semibold">Employment</span>
                  {(formData.employee_type || formData.probation_period) && (
                    <Check className="w-3 h-3 text-green-600 absolute top-1 right-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleSection("system")}
                  className={`flex  items-center justify-center px-4 py-2  rounded-lg border-2 transition-all relative ${
                    activeSection === "system"
                      ? "bg-yellow-50 border-yellow-500 text-yellow-600"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                >
                  <Laptop className="w-4 h-4 mr-1" />
                  <span className="text-xs font-semibold">System</span>
                  {(formData.laptop_assigned === "yes" ||
                    formData.system_login_id) && (
                    <Check className="w-3 h-3 text-green-600 absolute top-1 right-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleSection("bank")}
                  className={`flex  items-center justify-center px-4 py-2 rounded-lg border-2 transition-all relative ${
                    activeSection === "bank"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-600"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  <span className="text-xs font-semibold">Bank</span>
                  {(formData.bank_account_number || formData.bank_name) && (
                    <Check className="w-3 h-3 text-green-600 absolute top-1 right-1" />
                  )}
                </button>
              </div>

              {/* Personal Details Section */}
              {activeSection === "personal" && (
                <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      Personal Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        disabled={
                          user.role !== "admin" &&
                          (validationFormData.date_of_birth || "").length !== 0
                        }
                        max={maxDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            date_of_birth: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      />
                      {formData.date_of_birth && (
                        <p className="text-xs text-gray-500 mt-1">
                          Age: {calculateAge(formData.date_of_birth)} years
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Marital Status
                      </label>
                      <select
                        value={formData.marital_status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            marital_status: e.target.value,
                          })
                        }
                        disabled={
                          user.role !== "admin" &&
                          (validationFormData.marital_status || "").length !== 0
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="">Select</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        value={formData.emergency_contact}
                        disabled={
                          user.role !== "admin" &&
                          (validationFormData.emergency_contact || "")
                            .length !== 0
                        }
                        onChange={handleEmergencyContactChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="10-digit number"
                        maxLength={10}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Relationship
                      </label>
                      <select
                        value={formData.emergency_contact_relationship}
                        disabled={
                          user.role !== "admin" &&
                          (
                            validationFormData.emergency_contact_relationship ||
                            ""
                          ).length !== 0
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergency_contact_relationship: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="">Select</option>
                        <option value="father">Father</option>
                        <option value="mother">Mother</option>
                        <option value="spouse">Spouse</option>
                        <option value="sibling">Sibling</option>
                        <option value="friend">Friend</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.emergency_contact_name}
                        disabled={
                          user.role !== "admin" &&
                          (validationFormData.emergency_contact_name || "")
                            .length !== 0
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergency_contact_name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="Full name"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Nationality
                      </label>
                      <input
                        type="text"
                        value={formData.nationality}
                        disabled={
                          user.role !== "admin" &&
                          (validationFormData.nationality || "").length !== 0
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nationality: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="e.g. Indian"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Aadhar Number
                      </label>
                      <input
                        type="text"
                        value={formData.aadhar_number}
                        disabled={
                          user.role !== "admin" &&
                          (validationFormData.aadhar_number || "").length !== 0
                        }
                        onChange={handleAadharChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="12-digit Aadhar"
                        maxLength={12}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        value={formData.pan_number}
                        disabled={
                          user.role !== "admin" &&
                          (validationFormData.pan_number || "").length !== 0
                        }
                        onChange={handlePANChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="ABCDE1234F"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Address Details Section */}
              {activeSection === "address" && (
                <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Home className="w-4 h-4 text-blue-500" />
                      Address Details
                    </h4>
                  </div>

                  <div className="mb-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          Permanent Address
                        </label>
                        <textarea
                          value={formData.permanent_address}
                          disabled={
                            user.role !== "admin" &&
                            (validationFormData.permanent_address || "")
                              .length !== 0
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              permanent_address: value,
                              current_address: prev.same_as_permanent
                                ? value
                                : prev.current_address,
                            }));
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                          placeholder="Full permanent address"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-700">
                            City
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            disabled={
                              user.role !== "admin" &&
                              (validationFormData.city || "").length !== 0
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                city: value,
                              }));
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                            placeholder="City"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-700">
                            State
                          </label>
                          <input
                            type="text"
                            value={formData.state}
                            disabled={
                              user.role !== "admin" &&
                              (validationFormData.state || "").length !== 0
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                state: value,
                              }));
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                            placeholder="State"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-700">
                            Pincode
                          </label>
                          <input
                            type="text"
                            value={formData.pincode}
                            disabled={
                              user.role !== "admin" &&
                              (validationFormData.pincode || "").length !== 0
                            }
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6);
                              setFormData((prev) => ({
                                ...prev,
                                pincode: value,
                              }));
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                            placeholder="6-digit pincode"
                            maxLength={6}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.same_as_permanent}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData((prev) => ({
                            ...prev,
                            same_as_permanent: checked,
                            current_address: checked
                              ? prev.permanent_address
                              : prev.current_address,
                          }));
                        }}
                        className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Current address same as permanent address
                      </span>
                    </label>
                  </div>

                  {!formData.same_as_permanent && (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Current Address (if different)
                      </label>
                      <textarea
                        value={formData.current_address}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            current_address: e.target.value,
                          })
                        }
                        disabled={
                          user.role !== "admin" &&
                          (validationFormData.current_address || "").length !==
                            0
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="Full current address (if different from permanent)"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Educational Details Section */}
              {activeSection === "educational" && (
                <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-green-500" />
                      Educational Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Highest Qualification
                      </label>
                      <select
                        value={formData.highest_qualification}
                        disabled={
                          user.role !== "admin" &&
                          (validationFormData.highest_qualification || "")
                            .length !== 0
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            highest_qualification: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="">Select</option>
                        <option value="10th">10th</option>
                        <option value="12th">12th</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Bachelor's">Bachelor's Degree</option>
                        <option value="Master's">Master's Degree</option>
                        <option value="PhD">PhD</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700">
                        University/College
                      </label>
                      <input
                        type="text"
                        value={formData.university}
                        disabled={
                          user.role !== "admin" &&
                          (validationFormData.university || "").length !== 0
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            university: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="University/College name"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Passing Year
                      </label>
                      <input
                        type="number"
                        value={formData.passing_year}
                        disabled={
                          user.role !== "admin" &&
                          (validationFormData.passing_year || "").length !== 0
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            passing_year: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="YYYY"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Percentage/CGPA
                      </label>
                      <input
                        type="text"
                        value={formData.percentage}
                        disabled={
                          user.role !== "admin" &&
                          (validationFormData.percentage || "").length !== 0
                        }
                        onChange={handlePercentageChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="e.g. 85.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Employment Details Section */}
              {activeSection === "employment" && (
                <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-500" />
                      Employment Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Employee Type
                      </label>
                      <select
                        value={formData.employee_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            employee_type: e.target.value,
                          })
                        }
                        disabled={user?.role !== "admin"}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="permanent">Permanent</option>
                        <option value="contract">Contract</option>
                        <option value="intern">Intern</option>
                        <option value="trainee">Trainee</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Work Mode
                      </label>
                      <select
                        value={formData.work_mode}
                        disabled={user?.role !== "admin"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            work_mode: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="office">Office</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Probation Period
                      </label>
                      <select
                        value={formData.probation_period}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            probation_period: e.target.value,
                          })
                        }
                        disabled={user?.role !== "admin"}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="">Select</option>
                        <option value="3">3 months</option>
                        <option value="6">6 months</option>
                        <option value="12">12 months</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Date of Leaving
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_leaving}
                        disabled={user?.role !== "admin"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            date_of_leaving: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Notice Period (days)
                      </label>
                      <select
                        value={formData.notice_period}
                        disabled={user?.role !== "admin"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notice_period: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="15">15 days</option>
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Salary (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.salary}
                        disabled={user?.role !== "admin"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            salary: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="Enter salary"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Salary Type
                      </label>
                      <select
                        value={formData.salary_type}
                        disabled={user?.role !== "admin"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            salary_type: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Punch In Time
                      </label>
                      <input
                        type="time"
                        step={1}
                        value={formData.punch_in_time}
                        disabled={user?.role !== "admin"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            punch_in_time: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      />
                    </div>

                    <div className="space-y-1 attendance-dropdown">
                      <label className="block text-xs font-semibold text-gray-700">
                        Week Off Days
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setShowWeekOffDropdown(!showWeekOffDropdown)
                          }
                          disabled={user?.role !== "admin"}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white text-left flex justify-between items-center hover:bg-gray-50"
                        >
                          <span className="truncate">
                            {formData.week_off_days.length > 0
                              ? `${formData.week_off_days.length} Week Off Day(s) selected`
                              : "Select Week Off Day(s)"}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform ${showWeekOffDropdown ? "rotate-180" : ""}`}
                          />
                        </button>

                        {showWeekOffDropdown && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {weekDays.map((day, indx) => (
                              <label
                                key={day}
                                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.week_off_days.includes(
                                    indx,
                                  )}
                                  onChange={() => handleWeekOffToggle(indx)}
                                  className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  {day}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      {formData.week_off_days.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {formData.week_off_days.map((day) => (
                            <div
                              key={weekDays[day]}
                              className="inline-flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium"
                            >
                              <span className="truncate max-w-[120px]">
                                {weekDays[day]}
                              </span>
                              {user?.role === "admin" && (
                                <button
                                  type="button"
                                  onClick={() => handleWeekOffToggle(day)}
                                  className="hover:bg-blue-700 rounded-full p-0.5 flex-shrink-0"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* System Details Section */}
              {activeSection === "system" && (
                <div className="p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-yellow-500" />
                      System Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Laptop Assigned
                      </label>
                      <select
                        value={formData.laptop_assigned}
                        disabled={user?.role !== "admin"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            laptop_assigned: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        System Login ID
                      </label>
                      <input
                        type="text"
                        value={formData.system_login_id}
                        disabled={user?.role !== "admin"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            system_login_id: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="Login ID"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        System Password
                      </label>
                      <input
                        type="password"
                        value={formData.system_password}
                        disabled={user?.role !== "admin"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            system_password: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="Password"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Office Email ID
                      </label>
                      <input
                        type="email"
                        value={formData.office_email_id}
                        disabled={user?.role !== "admin"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            office_email_id: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="office@company.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Office Email Password
                      </label>
                      <input
                        type="password"
                        value={formData.office_email_password}
                        disabled={user?.role !== "admin"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            office_email_password: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="Email password"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Details Section */}
              {activeSection === "bank" && (
                <div className="p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-500" />
                      Bank Details
                    </h4>
                  </div>

                  <div className="mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          value={formData.account_holder_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              account_holder_name: e.target.value,
                            })
                          }
                          disabled={
                            user.role !== "admin" &&
                            (validationFormData.account_holder_name || "")
                              .length !== 0
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                          placeholder="Account holder name"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={formData.bank_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bank_name: e.target.value,
                            })
                          }
                          disabled={
                            user.role !== "admin" &&
                            (validationFormData.bank_name || "").length !== 0
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                          placeholder="Bank name"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={formData.bank_account_number}
                          onChange={(e) => {
                            if (
                              e.target.value.length > 18 ||
                              !/^\d*$/.test(e.target.value)
                            )
                              return;
                            setFormData({
                              ...formData,
                              bank_account_number: e.target.value,
                            });
                          }}
                          disabled={
                            user.role !== "admin" &&
                            (validationFormData.bank_account_number || "")
                              .length !== 0
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                          placeholder="Account number"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          value={formData.ifsc_code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ifsc_code: e.target.value.toUpperCase(),
                            })
                          }
                          disabled={
                            user.role !== "admin" &&
                            (validationFormData.ifsc_code || "").length !== 0
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                          placeholder="IFSC code"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-gray-700 mb-3">
                      UPI Details (Optional)
                    </h5>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        value={formData.upi_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            upi_id: e.target.value,
                          })
                        }
                        disabled={
                          user.role !== "admin" &&
                          (validationFormData.upi_id || "").length !== 0
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="upi@bank"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4 bg-gray-50 flex justify-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className=" bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2 text-xs px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {showAddDetailsModal && (
        <AddMoreDetailsModal
          isOpen={showAddDetailsModal}
          onClose={() => {
            setShowAddDetailsModal(false);
            loadEmployee();
          }}
          employeeId={employee.id}
          onSuccess={() => {
            loadEmployee();
            toast.success("Details added successfully!");
          }}
        />
      )}
    </div>
  );
}
