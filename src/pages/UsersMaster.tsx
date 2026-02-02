
// src/components/UsersMaster.tsx
import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  X,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  Building,
  XCircle,
  Briefcase,
  Calendar,
  MapPin,
  User as UserIcon,
  Check,
  ChevronDown,
  Camera,
  Upload,
  CheckCircle,
  EyeIcon,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import MySwal from "../utils/swal";

// Import APIs
import { UsersApi } from "../lib/Api";
import { getAllRoles } from "../lib/rolesApi";
import { departmentsApi } from "../lib/departmentApi";
import projectApi from "../lib/projectApi";
import HrmsEmployeesApi from "../lib/employeeApi";
import companyApi, { Company, OfficeLocation } from "../lib/companyApi";
import { designationApi, Designation } from "../lib/designationApi";

// Types
interface Permissions {
  [key: string]: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: string;
  department?: string;
  department_id?: string;
  is_active: boolean;
  profile_picture?: string;
  permissions?: Permissions;
}

interface Project {
  id: string;
  name: string;
  code?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permissions;
  is_active: boolean;
}

interface UserFormData {
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone: string;
  role: string;
  role_id: string;
  department: string;
  department_id: string;
  password: string;
  confirm_password: string;
  is_active: boolean;
  profile_picture?: string;
  permissions: Permissions;

  // Employee fields
  is_employee: boolean;
  designation: string;
  designation_id: string;
  joining_date: string;
  gender: string;
  allotted_project: string[];
  company_id: string;
  attendance_location: string; // Change this to attendence_location
  attendance_location_id: string; // Change this to attendence_location_id
}

export default function UsersMaster() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [officeLocations, setOfficeLocations] = useState<OfficeLocation[]>([]);
  const [loadingOfficeLocations, setLoadingOfficeLocations] = useState(false);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  // Handle view user
  const handleView = useCallback((user: UserProfile) => {
    setViewingUser(user);
    setShowViewModal(true);
  }, []);
  // Department roles
  const [departmentRoles, setDepartmentRoles] = useState<Role[]>([]);
  const [loadingDepartmentRoles, setLoadingDepartmentRoles] = useState(false);

  // Profile picture states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadingProfile, setUploadingProfile] = useState(false);

  // Search states
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  // Bulk selection
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    phone: "",
    role: "USER",
    role_id: "",
    department: "",
    department_id: "",
    password: "",
    confirm_password: "",
    is_active: true,
    profile_picture: "",
    permissions: {},

    // Employee fields
    is_employee: false,
    designation: "",
    designation_id: "",
    joining_date: new Date().toISOString().split("T")[0],
    gender: "male",
    allotted_project: [],
    company_id: "",
    attendance_location: "", // Change this to attendence_location
    attendance_location_id: "", // Change this to attendence_location_id
  });

  // Load users
  // In loadUsers function, add this logging:
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersData = await UsersApi.list();
      console.log("RAW USER DATA:", usersData); // 👈 Add this

      const normalized = usersData.map((u: any) => ({
        id: u.id || u._id,
        email: u.email || "",
        full_name: u.full_name || u.name || "",
        phone: u.phone || "",
        role: u.role || "user",
        department: u.department || "",
        department_id: u.department_id || "", // 👈 This might be empty!
        is_active: u.is_active,
        profile_picture: u.profile_picture || "",
        permissions: u.permissions || {},
      })) as UserProfile[];

      console.log("NORMALIZED USERS:", normalized); // 👈 Add this
      setUsers(normalized);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      toast.error("Failed to load users: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load projects
  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const projectsData = await projectApi.getProjects();
      setProjects(projectsData.data || []);
    } catch (err: any) {
      console.error("Failed to load projects:", err);
      toast.error(
        "Failed to load projects: " + (err.message || "Unknown error"),
      );
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  // Load companies
  const loadCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    try {
      const companiesData = await companyApi.getCompanies();
      const activeCompanies = companiesData.filter(
        (company: Company) => company.is_active,
      );
      setCompanies(activeCompanies);
    } catch (err: any) {
      console.error("Failed to load companies:", err);
      toast.error(
        "Failed to load companies: " + (err.message || "Unknown error"),
      );
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  // Load office locations
  const loadOfficeLocations = useCallback(async (companyId: string) => {
    if (!companyId) {
      setOfficeLocations([]);
      return;
    }

    setLoadingOfficeLocations(true);
    try {
      const locationsData = await companyApi.getCompanyLocations(companyId);
      const activeLocations = locationsData.filter(
        (location: OfficeLocation) => location.is_active,
      );
      setOfficeLocations(activeLocations);
    } catch (err: any) {
      console.error("Failed to load office locations:", err);
      toast.error("Failed to load branches");
    } finally {
      setLoadingOfficeLocations(false);
    }
  }, []);

  // Load designations
  // Load designations - FIXED to accept parameters
  const loadDesignations = useCallback(
    async (departmentId: string, roleId: string) => {
      if (!departmentId || !roleId) {
        setDesignations([]);
        return;
      }

      setLoadingDesignations(true);
      try {
        console.log("Loading designations for:", { departmentId, roleId });
        const deptDesignations =
          await designationApi.getByDepartment(departmentId);
        console.log("All designations for department:", deptDesignations);

        const filteredDesignations = deptDesignations.filter(
          (designation: Designation) =>
            designation.role_id.toString() === roleId,
        );

        console.log("Filtered designations:", filteredDesignations);
        setDesignations(filteredDesignations);

        // Only auto-select if it's a new user AND no designation is set
        if (
          !editingId &&
          filteredDesignations.length > 0 &&
          !formData.designation_id
        ) {
          const firstDesignation = filteredDesignations[0];
          setFormData((prev) => ({
            ...prev,
            designation: firstDesignation.name,
            designation_id: firstDesignation.id,
          }));
        }
      } catch (err: any) {
        console.error("Failed to load designations:", err);
        setDesignations([]);
      } finally {
        setLoadingDesignations(false);
      }
    },
    [formData.designation_id, editingId],
  ); // Add editingId as dependency

  // Load all roles (for fallback)
  const loadAllRoles = useCallback(async () => {
    try {
      const rolesData = await getAllRoles();
      let rolesArray: Role[] = [];

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
      setAllRoles(normalizedRoles);
    } catch (rolesErr: any) {
      console.error("Failed to load all roles:", rolesErr);
      setAllRoles([]);
    }
  }, []);

  // Load roles by department
  // ✅ NEW (add editingId as dependency):
  // ✅ NEW (add editingId as dependency):
  const loadRolesByDepartment = useCallback(
    async (departmentId: string) => {
      if (!departmentId) {
        console.log("No department ID provided");
        setDepartmentRoles([]);
        setFormData((prev) => ({ ...prev, role: "USER", role_id: "" }));
        return;
      }

      setLoadingDepartmentRoles(true);
      try {
        console.log("Loading roles for department:", departmentId);
        // Try to get roles by department from designation API
        const roles = await designationApi.getRolesByDepartment(departmentId);
        console.log("Department roles from API:", roles);

        if (Array.isArray(roles) && roles.length > 0) {
          setDepartmentRoles(roles);

          // Don't auto-select first role when editing
          // Only pre-select if it's a new user (not editing)
          if (!editingId) {
            console.log("New user, auto-selecting first role");
            const firstRole = roles[0];
            setFormData((prev) => ({
              ...prev,
              role: firstRole.name,
              role_id: firstRole.id.toString(),
            }));
          } else {
            console.log("Editing user, not auto-selecting role");
          }
        } else {
          console.warn("No roles found for department, using all roles");
          setDepartmentRoles([]);
        }
      } catch (error: any) {
        console.error("Failed to load department roles:", error);
        setDepartmentRoles([]);
      } finally {
        setLoadingDepartmentRoles(false);
      }
    },
    [editingId],
  ); // ✅ Add editingId as dependency

  // Export users data

  // Load all data
  useEffect(() => {
    console.log("from use effect");
    let mounted = true;

    const loadData = async () => {
      try {
        await loadUsers();
        if (!mounted) return;

        await loadProjects();
        await loadCompanies();
        await loadAllRoles();

        // Load departments
        try {
          setLoadingDepartments(true);
          const departmentsData: any = await departmentsApi.getAll();
          console.log(mounted);
          if (mounted) {
            setDepartments(
              Array.isArray(departmentsData) ? departmentsData : [],
            );
          }
        } catch (deptErr: any) {
          console.error("Failed to load departments:", deptErr);
          if (mounted) {
            toast.error(
              "Failed to load departments: " +
                (deptErr.message || "Unknown error"),
            );
            setDepartments([]);
          }
        } finally {
          if (mounted) {
            setLoadingDepartments(false);
          }
        }
      } catch (err: any) {
        console.error("Failed to load data:", err);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [loadUsers, loadProjects, loadCompanies, loadAllRoles]);

  useEffect(() => {
    console.log(departments, "for test");
  }, [departments]);

  // Load office locations when company changes
  useEffect(() => {
    if (formData.company_id) {
      loadOfficeLocations(formData.company_id);
      setFormData((prev) => ({
        ...prev,
        attendance_location: "",
        attendance_location_id: "",
      }));
    } else {
      setOfficeLocations([]);
    }
  }, [formData.company_id, loadOfficeLocations]);

  // Load designations when department or role changes
  useEffect(() => {
    if (formData.department_id && formData.role_id) {
      loadDesignations(formData.department_id, formData.role_id);
    } else {
      setDesignations([]);
      setFormData((prev) => ({
        ...prev,
        designation: "",
        designation_id: "",
      }));
    }
  }, [formData.department_id, formData.role_id, loadDesignations]);

  // Load roles when department changes
  useEffect(() => {
    if (formData.department_id) {
      loadRolesByDepartment(formData.department_id);
    } else {
      setDepartmentRoles([]);
      setFormData((prev) => ({ ...prev, role: "USER", role_id: "" }));
    }
  }, [formData.department_id, loadRolesByDepartment]);

  // Close project dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProjectDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // File upload handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, WebP)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Upload profile picture
  const uploadProfilePicture = useCallback(
    async (userId: string): Promise<string | null> => {
      if (!selectedFile) return null;

      setUploadingProfile(true);
      try {
        const response = await UsersApi.uploadProfilePicture(
          userId,
          selectedFile,
        );

        if (
          response.success &&
          response.data &&
          response.data.profile_picture
        ) {
          toast.success("Profile picture uploaded successfully");
          return response.data.profile_picture;
        } else {
          toast.error(response.error || "Failed to upload profile picture");
          return null;
        }
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error("Profile picture upload failed");
        return null;
      } finally {
        setUploadingProfile(false);
      }
    },
    [selectedFile],
  );

  // Create employee record
  // Create employee record
  // Create employee record - FIXED VERSION
  // const createEmployeeRecord = useCallback(async (userId: string, profilePictureUrl: string | null) => {
  //   try {
  //     if (!formData.department_id) throw new Error("Department ID is required");
  //     if (!formData.role_id) throw new Error("Role ID is required");
  //     if (!formData.designation) throw new Error("Designation is required for employees");
  //     if (!formData.joining_date) throw new Error("Date of joining is required for employees");
  //     if (!formData.attendance_location_id) throw new Error("Attendance location is required for employees");

  //     // Get the selected office location name
  //     const selectedLocation = officeLocations.find(loc => loc.id === formData.attendance_location_id);
  //     const officeLocationName = selectedLocation ? `${selectedLocation.name} - ${selectedLocation.city}` : '';

  //     // Get the selected company name
  //     const selectedCompany = companies.find(comp => comp.id === formData.company_id);
  //     const companyName = selectedCompany ? selectedCompany.name : '';

  //     const employeeData = {
  //       // Basic Info
  //       first_name: formData.first_name,
  //       last_name: formData.last_name || '',
  //       email: formData.email,
  //       phone: formData.phone || '',

  //       // Employment Info
  //       role_id: parseInt(formData.role_id) || 0,
  //       department_id: formData.department_id,
  //       designation: formData.designation,
  //       joining_date: formData.joining_date,
  //       gender: formData.gender || 'male',

  //       // Company & Location - FIXED: Add office_location
  //       company_id: formData.company_id,
  //       allotted_project: formData.allotted_project.length > 0 ? formData.allotted_project[0] : 0, // First project or 0
  //       office_location: officeLocationName, // REQUIRED: Add this field
  //       attendence_location: formData.attendance_location_id, // ✅ THIS IS THE KEY FIX

  //       // Profile
  //       profile_picture: profilePictureUrl || '',

  //       // Status
  //       employee_status: formData.is_active ? 'active' : 'inactive',
  //       employee_code: `EMP${Date.now().toString().slice(-6)}`, // Auto-generate

  //       // User relationship
  //       user_id: userId,

  //       // Set default values for other required fields
  //       blood_group: '',
  //       date_of_birth: null,
  //       marital_status: '',
  //       emergency_contact: '',
  //       nationality: 'Indian',
  //       current_address: '',
  //       permanent_address: '',
  //       city: '',
  //       state: '',
  //       pincode: '',
  //       same_as_permanent: 0,
  //       aadhar_number: '',
  //       pan_number: '',
  //       highest_qualification: '',
  //       university: '',
  //       passing_year: '',
  //       percentage: '',
  //       employee_type: 'permanent',
  //       branch: companyName,
  //       probation_period: '',
  //       work_mode: 'office',
  //       job_title: formData.designation,
  //       notice_period: '30',
  //       laptop_assigned: 'no',
  //       system_login_id: '',
  //       system_password: '',
  //       office_email_id: '',
  //       office_email_password: '',
  //       bank_account_number: '',
  //       bank_name: '',
  //       ifsc_code: '',
  //       upi_id: '',
  //       date_of_leaving: null,
  //       salary: 0.00,
  //       salary_type: 'monthly'
  //     };

  //     console.log("Sending employee data with all required fields:", employeeData);

  //     const response = await HrmsEmployeesApi.createFromUser(employeeData);
  //     return response;
  //   } catch (error: any) {
  //     console.error("Failed to create employee record:", error);
  //     console.error("Error details:", error.response?.data);
  //     throw error;
  //   }
  // }, [formData, officeLocations, companies]);

  // Create employee record - FIXED VERSION
  const createEmployeeRecord = useCallback(
    async (userId: string, profilePictureUrl: string | null) => {
      try {
        if (!formData.department_id)
          throw new Error("Department ID is required");
        if (!formData.role_id) throw new Error("Role ID is required");
        if (!formData.designation)
          throw new Error("Designation is required for employees");
        if (!formData.joining_date)
          throw new Error("Date of joining is required for employees");
        if (!formData.attendance_location_id)
          throw new Error("Attendance location is required for employees");

        // Get the selected office location name
        const selectedLocation = officeLocations.find(
          (loc) => loc.id === formData.attendance_location_id,
        );
        const officeLocationName = selectedLocation
          ? `${selectedLocation.name} - ${selectedLocation.city}`
          : "";

        // Get the selected company name
        const selectedCompany = companies.find(
          (comp) => comp.id === formData.company_id,
        );
        const companyName = selectedCompany ? selectedCompany.name : "";

        // Handle allotted projects properly
        let allottedProjects: any = null;
        if (formData.allotted_project && formData.allotted_project.length > 0) {
          allottedProjects = formData.allotted_project;
        }

        // Handle attendance location properly
        let attendanceLocations: any = null;
        if (formData.attendance_location_id) {
          attendanceLocations = [formData.attendance_location_id];
        }

        const employeeData = {
          // Basic Info
          first_name: formData.first_name,
          last_name: formData.last_name || "",
          email: formData.email,
          phone: formData.phone || "",

          // Employment Info
          role_id: parseInt(formData.role_id) || 0,
          department_id: formData.department_id,
          designation: formData.designation,
          joining_date: formData.joining_date,
          gender: formData.gender || "male",

          // Company & Location
          company_id: formData.company_id,
          allotted_project: allottedProjects, // Send as array
          office_location: officeLocationName,
          attendence_location: attendanceLocations, // Send as array

          // Profile
          profile_picture: profilePictureUrl || "",

          // Status
          employee_status: formData.is_active ? "active" : "inactive",
          employee_code: `EMP${Date.now().toString().slice(-6)}`,

          // User relationship
          user_id: userId,

          // Set default values for other required fields
          blood_group: "",
          date_of_birth: null,
          marital_status: "",
          emergency_contact: "",
          nationality: "Indian",
          current_address: "",
          permanent_address: "",
          city: "",
          state: "",
          pincode: "",
          same_as_permanent: 0,
          aadhar_number: "",
          pan_number: "",
          highest_qualification: "",
          university: "",
          passing_year: "",
          percentage: "",
          employee_type: "permanent",
          branch: companyName,
          probation_period: "",
          work_mode: "office",
          job_title: formData.designation,
          notice_period: "30",
          laptop_assigned: "no",
          system_login_id: "",
          system_password: "",
          office_email_id: "",
          office_email_password: "",
          bank_account_number: "",
          bank_name: "",
          ifsc_code: "",
          upi_id: "",
          date_of_leaving: null,
          salary: 0.0,
          salary_type: "monthly",
        };

        console.log("Sending employee data with arrays:", {
          allotted_project: employeeData.allotted_project,
          attendence_location: employeeData.attendence_location,
        });

        const response = await HrmsEmployeesApi.createFromUser(employeeData);
        return response;
      } catch (error: any) {
        console.error("Failed to create employee record:", error);
        console.error("Error details:", error.response?.data);
        throw error;
      }
    },
    [formData, officeLocations, companies],
  );

  // Handle form submission
 // Updated handleSubmit function - Phone check ONLY on create
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validation
  if (!formData.email.trim()) {
    toast.error("Email is required");
    return;
  }

  if (!editingId) {
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }
  }

  if (!formData.first_name.trim()) {
    toast.error("First name is required");
    return;
  }

  if (formData.phone && formData.phone.length !== 10) {
    toast.error("Phone number must be 10 digits");
    return;
  }

  if (!formData.department_id) {
    toast.error("Please select a department");
    return;
  }

  if (!formData.role_id) {
    toast.error("Please select a role");
    return;
  }

  // ✅ ONLY CHECK PHONE DUPLICATE ON CREATE (not on update)
  if (!editingId && formData.phone && formData.phone.trim() !== "") {
    try {
      // Check in existing users
      const existingUserWithPhone = users.find(
        (user) => user.phone === formData.phone
      );

      if (existingUserWithPhone) {
        toast.error("This phone number is already in use by another user");
        return;
      }

      // Also check in employees table to prevent cross-table duplicates
      try {
        const employees = await HrmsEmployeesApi.getEmployees();
        const existingEmployeeWithPhone = employees.find(
          (emp: any) => emp.phone === formData.phone
        );

        if (existingEmployeeWithPhone) {
          toast.error("This phone number is already in use by an employee");
          return;
        }
      } catch (empError) {
        console.warn("Could not check employee phone duplicates:", empError);
        // Continue with user check only
      }
    } catch (error) {
      console.error("Error checking phone duplicate:", error);
      // Continue with submission if check fails
    }
  }

  // Validate employee fields
  if (formData.is_employee) {
    if (!formData.designation.trim()) {
      toast.error("Designation is required for employees");
      return;
    }
    if (!formData.joining_date) {
      toast.error("Date of joining is required for employees");
      return;
    }
    if (!formData.company_id) {
      toast.error("Company is required for employees");
      return;
    }
    if (!formData.attendance_location_id) {
      toast.error("Attendance location (branch) is required for employees");
      return;
    }
  }

  setSubmitting(true);

  try {
    const fullName = [
      formData.first_name,
      formData.middle_name,
      formData.last_name,
    ]
      .filter((name) => name.trim())
      .join(" ");

    const payload: any = {
      email: formData.email.trim(),
      full_name: fullName,
      phone: formData.phone,
      role: formData.role,
      department: formData.department,
      department_id: formData.department_id,
      is_active: formData.is_active,
      permissions: formData.permissions || {},
    };

    if (formData.password && formData.password.length > 0 && !editingId) {
      payload.password = formData.password;
    }

    if (editingId) {
      // Update existing user
      const response = await UsersApi.update(editingId, payload);

      let result: UserProfile;

      if (response.success && response.data) {
        result = response.data;
      } else if (response.id) {
        result = response;
      } else {
        throw new Error("Invalid response format");
      }

      if (selectedFile) {
        const profilePicUrl = await uploadProfilePicture(editingId);
        if (profilePicUrl) {
          result = { ...result, profile_picture: profilePicUrl };
        }
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === editingId ? { ...u, ...result } : u)),
      );
      toast.success("User updated successfully!");
    } else {
      // Create new user
      if (
        users.some(
          (u) => u.email.toLowerCase() === formData.email.toLowerCase(),
        )
      ) {
        toast.error("A user with this email already exists");
        setSubmitting(false);
        return;
      }

      const response = await UsersApi.create(payload);

      let newUser: UserProfile;
      let userId: string;

      if (response.success && response.data) {
        newUser = response.data;
        userId = newUser.id || newUser._id;
      } else if (response.id || response._id) {
        newUser = response;
        userId = response.id || response._id;
      } else {
        throw new Error("Invalid response format from server");
      }

      if (!userId) {
        throw new Error("User ID not found in response");
      }

      let finalUser = newUser;
      let profilePicUrl: string | null = null;

      if (selectedFile && userId) {
        profilePicUrl = await uploadProfilePicture(userId);
        if (profilePicUrl) {
          finalUser = {
            ...newUser,
            profile_picture: profilePicUrl,
          };
        }
      }

      // Create employee record if needed
      if (formData.is_employee && userId) {
        try {
          await createEmployeeRecord(userId, profilePicUrl);
          toast.success("Employee record created successfully!");
        } catch (empError: any) {
          console.error("Failed to create employee record:", empError);
          toast.warning(
            "User created but employee record creation failed: " +
              (empError.message || "Unknown error"),
          );
        }
      }

      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      if (!finalUser.id) {
        finalUser = { ...finalUser, id: userId };
      }

      setUsers((prev) => [...prev, finalUser]);
      toast.success("User created successfully!");
    }

    setShowModal(false);
    resetForm();
  } catch (err: any) {
    console.error("Submit error:", err);
    
    // Handle phone duplicate error from backend
    if (err?.message?.toLowerCase().includes("phone")) {
      toast.error(err.message);
    } else {
      toast.error(err?.message || "Operation failed");
    }
  } finally {
    setSubmitting(false);
  }
};
  // Reset form
  const resetForm = useCallback(() => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setFormData({
      email: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      phone: "",
      role: "USER",
      role_id: "",
      department: "",
      department_id: "",
      password: "",
      confirm_password: "",
      is_active: true,
      profile_picture: "",
      permissions: {},
      is_employee: false,
      designation: "",
      designation_id: "",
      joining_date: new Date().toISOString().split("T")[0],
      gender: "male",
      allotted_project: [],
      company_id: "",
      attendance_location: "",
      attendance_location_id: "",
    });
    setEditingId(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setSelectedFile(null);
    setPreviewUrl("");
    setIsProjectDropdownOpen(false);
    setDepartmentRoles([]);
  }, [previewUrl]);

  // Get profile picture URL
  const getProfilePictureUrl = useCallback(
    (profilePicture: string | undefined) => {
      if (!profilePicture) return "";
      if (profilePicture.startsWith("blob:")) return "";
      if (profilePicture.includes("http")) return profilePicture;
      if (profilePicture.startsWith("/uploads/")) {
        return `${import.meta.env.VITE_API_URL}${profilePicture}`;
      }
      return `${import.meta.env.VITE_API_URL}/uploads/${profilePicture}`;
    },
    [],
  );
  // Handle edit user
  // Handle edit user
  // Handle edit user
  const handleEdit = useCallback(
    async (user: UserProfile) => {
      console.log("Starting edit for user:", user);
      setEditingId(user.id);

      const nameParts = (user.full_name || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts[nameParts.length - 1] || "";
      const middleName = nameParts.slice(1, -1).join(" ") || "";

      // Get department info from department name
      let departmentId = user.department_id || "";
      const departmentName = user.department || "";

      // If department_id is empty but department name exists, try to find the department
      if ((!departmentId || departmentId === "") && departmentName) {
        console.log("Looking up department by name:", departmentName);
        const foundDept = departments.find(
          (dept) => dept.name === departmentName,
        );
        if (foundDept) {
          departmentId = foundDept.id;
          console.log("Found department ID:", departmentId);
        }
      }

      // Initial form data
      const initialFormData = {
        email: user.email,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        phone: user.phone || "",
        role: user.role,
        role_id: "",
        department: departmentName || "",
        department_id: departmentId || "",
        password: "",
        confirm_password: "",
        is_active: user.is_active !== false,
        profile_picture: user.profile_picture || "",
        permissions: user.permissions || {},
        is_employee: false,
        designation: "",
        designation_id: "",
        joining_date: new Date().toISOString().split("T")[0],
        gender: "male",
        allotted_project: [],
        company_id: "",
        attendance_location: "",
        attendance_location_id: "",
      };

      console.log("Initial form data:", initialFormData);
      setFormData(initialFormData);

      // Clean up old preview
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      // Set profile picture preview
      if (user.profile_picture && !user.profile_picture.startsWith("blob:")) {
        const fullUrl = getProfilePictureUrl(user.profile_picture);
        setPreviewUrl(fullUrl);
      } else {
        setPreviewUrl("");
      }

      setSelectedFile(null);

      // If we have a valid department ID, load roles for it
      if (departmentId && departmentId !== "") {
        console.log("Loading roles for department ID:", departmentId);

        try {
          // Clear existing roles
          setDepartmentRoles([]);

          // Try to get roles from designation API
          const roles = await designationApi.getRolesByDepartment(departmentId);
          console.log("API roles response:", roles);

          if (Array.isArray(roles) && roles.length > 0) {
            setDepartmentRoles(roles);

            // Find matching role
            const matchedRole = roles.find((r) => r.name === user.role);

            if (matchedRole) {
              console.log("Found matching role:", matchedRole);
              setFormData((prev) => ({
                ...prev,
                role: matchedRole.name,
                role_id: matchedRole.id.toString(),
              }));

              // Load designations for this role
              console.log(
                "Loading designations for role:",
                matchedRole.id.toString(),
              );
              await loadDesignations(departmentId, matchedRole.id.toString());
            } else {
              console.log("No exact match found, using available roles");
              // Use first available role
              const firstRole = roles[0];
              setFormData((prev) => ({
                ...prev,
                role: firstRole.name,
                role_id: firstRole.id.toString(),
              }));

              // Load designations for first role
              await loadDesignations(departmentId, firstRole.id.toString());
            }
          } else {
            console.log("No roles from API for this department");
          }
        } catch (rolesError) {
          console.error("Error loading department roles:", rolesError);
        }
      } else {
        console.log("No valid department ID found for user");
      }

      // Open modal
      setShowModal(true);
    },
    [previewUrl, getProfilePictureUrl, departments, loadDesignations],
  );

  // Handle delete user
  const handleDelete = async (id: string) => {
    const result: any = await MySwal.fire({
      title: "Delete User?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    try {
      await UsersApi.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete user");
    }
  };

  // Handle project toggle
  const handleProjectToggle = useCallback((projectId: string) => {
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
  }, []);

  // Get selected projects
  const getSelectedProjects = useCallback(() => {
    return projects.filter((project) =>
      formData.allotted_project.includes(project.id),
    );
  }, [projects, formData.allotted_project]);

  // Get role color
  // Get role color - Lowercase support
  const getRoleColor = useCallback((role: string) => {
    if (!role) return "bg-gray-100 text-gray-700";

    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-700",
      manager: "bg-blue-100 text-blue-700",
      purchaser: "bg-green-100 text-green-700",
      store_keeper: "bg-purple-100 text-purple-700",
      employee: "bg-orange-100 text-orange-700", // Add employee color
      user: "bg-gray-100 text-gray-700",
    };

    const lowerRole = role.toLowerCase();
    return colors[lowerRole] || "bg-gray-100 text-gray-700";
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesName =
        !searchName ||
        (user.full_name || "").toLowerCase().includes(searchName.toLowerCase());

      const matchesEmail =
        !searchEmail ||
        (user.email || "").toLowerCase().includes(searchEmail.toLowerCase());

      const matchesDepartment =
        !searchDepartment ||
        (user.department || "")
          .toLowerCase()
          .includes(searchDepartment.toLowerCase());

      const matchesRole =
        !searchRole ||
        (user.role || "").toLowerCase().includes(searchRole.toLowerCase());

      const matchesPhone =
        !searchPhone || (user.phone || "").includes(searchPhone);

      const matchesStatus =
        !searchStatus ||
        (user.is_active ? "active" : "inactive").includes(
          searchStatus.toLowerCase(),
        );

      return (
        matchesName &&
        matchesEmail &&
        matchesDepartment &&
        matchesRole &&
        matchesPhone &&
        matchesStatus
      );
    });
  }, [
    users,
    searchName,
    searchEmail,
    searchDepartment,
    searchRole,
    searchPhone,
    searchStatus,
  ]);

  const exportUsers = useCallback(() => {
    try {
      const dataToExport = filteredUsers.map((user) => ({
        Name: user.full_name || "",
        Email: user.email,
        Role: user.role,
        Department: user.department || "",
        Phone: user.phone || "",
        Status: user.is_active ? "Active" : "Inactive",
        "Profile Picture": user.profile_picture || "No",
        "Created Date": new Date().toLocaleDateString(),
      }));

      // Convert to CSV
      const headers = Object.keys(dataToExport[0] || {});
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((row) =>
          headers
            .map(
              (header) =>
                `"${String(row[header as keyof typeof row] || "").replace(/"/g, '""')}"`,
            )
            .join(","),
        ),
      ].join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `users_export_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${dataToExport.length} users successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export users");
    }
  }, [filteredUsers]);
  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) {
      toast.error("Please select at least one user to delete");
      return;
    }

    const result: any = await MySwal.fire({
      title: "Delete Users?",
      text: `Are you sure you want to delete ${selectedUsers.size} user(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);
    try {
      for (const id of Array.from(selectedUsers)) {
        await UsersApi.remove(id);
      }

      setUsers((prev) => prev.filter((u) => !selectedUsers.has(u.id)));
      setSelectedUsers(new Set());
      setSelectAll(false);
      toast.success(`Successfully deleted ${selectedUsers.size} user(s)!`);
    } catch (err) {
      console.error("Bulk delete error:", err);
      toast.error("Failed to delete users");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle active status - FIXED VERSION
  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      console.log("Toggling user status:", { id, currentStatus });

      // Call API
      const response = await UsersApi.toggleActive(id);
      console.log("Toggle response:", response);

      // Extract the updated user from response
      let updatedUser;
      if (response.success && response.data) {
        updatedUser = response.data;
      } else if (response.id) {
        updatedUser = response;
      } else {
        throw new Error("Invalid response format");
      }

      // Update the users state with the actual response data
      loadUsers();

      toast.success(
        `User ${updatedUser.is_active ? "activated" : "deactivated"} successfully`,
      );
    } catch (err: any) {
      console.error("Toggle error:", err);
      toast.error("Failed to update status");

      // Reload users to get correct state
      await loadUsers();
    }
  };

  // Bulk toggle active
  // Bulk toggle active - UPDATED
  const handleBulkToggleActive = async (activate: boolean) => {
    if (selectedUsers.size === 0) {
      toast.error("Please select at least one user");
      return;
    }

    setSubmitting(true);
    try {
      // First update the UI optimistically
      setUsers((prev) =>
        prev.map((u) =>
          selectedUsers.has(u.id) ? { ...u, is_active: activate } : u,
        ),
      );

      // Then make API calls
      const promises = Array.from(selectedUsers).map(async (id) => {
        const user = users.find((u) => u.id === id);
        if (user && user.is_active !== activate) {
          try {
            await UsersApi.toggleActive(id);
          } catch (err) {
            console.error(`Failed to toggle user ${id}:`, err);
            // Revert this user's status on error
            setUsers((prev) =>
              prev.map((u) =>
                u.id === id ? { ...u, is_active: !activate } : u,
              ),
            );
            throw err;
          }
        }
      });

      await Promise.all(promises);
      toast.success(
        `${selectedUsers.size} user(s) ${activate ? "activated" : "deactivated"} successfully!`,
      );
    } catch (err) {
      console.error("Bulk toggle error:", err);
      toast.error("Failed to update some users status");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle role change
  const handleRoleChange = useCallback(
    (roleName: string) => {
      const selectedRole = departmentRoles.find(
        (role) => role.name === roleName,
      );
      setFormData((prev) => ({
        ...prev,
        role: roleName, // यहाँ uppercase न करें
        role_id: selectedRole?.id?.toString() || "",
      }));
    },
    [departmentRoles],
  );

  // Handle department change
  // ✅ Update handleDepartmentChange to clear roles properly:
  const handleDepartmentChange = useCallback(
    (departmentName: string) => {
      const selectedDept = departments.find(
        (dept) => dept.name === departmentName,
      );
      if (selectedDept) {
        // Clear role fields first
        setFormData((prev) => ({
          ...prev,
          department: departmentName,
          department_id: selectedDept.id || "",
          role: "",
          role_id: "",
          designation: "",
          designation_id: "",
        }));

        // Load roles for this department
        if (selectedDept.id) {
          loadRolesByDepartment(selectedDept.id);
        }
      } else {
        // Clear everything if no department selected
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
      }
    },
    [departments, loadRolesByDepartment],
  );

  // Handle select user
  const handleSelectUser = useCallback(
    (id: string) => {
      const newSelected = new Set(selectedUsers);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedUsers(newSelected);
      setSelectAll(newSelected.size === filteredUsers.length);
    },
    [selectedUsers, filteredUsers],
  );

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedUsers(new Set());
    } else {
      const allIds = new Set(filteredUsers.map((user) => user.id));
      setSelectedUsers(allIds);
    }
    setSelectAll(!selectAll);
  }, [selectAll, filteredUsers]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchName("");
    setSearchEmail("");
    setSearchDepartment("");
    setSearchRole("");
    setSearchPhone("");
    setSearchStatus("");
  }, []);

  // Active departments
  const activeDepartments = useMemo(() => {
    return departments.filter((dept) => dept.is_active);
  }, [departments]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  function checkPhoneDuplicate(phone: string, arg1: string | undefined) {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="p-4 md:p-6 -mt-9 md:-mt-12 px-0 md:px-0 bg-gray-50 min-h-screen">
      {/* Header */}
      {/* Header */}
      <div className="mt-0 mb-1 px-0 py-1 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-3">
        <div></div>

        <div className="flex items-center gap-1 md:gap-2 flex-nowrap md:flex-wrap w-full md:w-auto">
          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center gap-0.5 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-md shadow-sm px-1.5 py-0.5 md:px-2 md:py-2 whitespace-nowrap">
              <div className="flex items-center gap-0.5">
                <div className="bg-red-100 p-0.5 rounded">
                  <Trash2 className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-red-600" />
                </div>
                <p className="font-medium text-[9px] md:text-xs text-gray-800">
                  {selectedUsers.size} selected
                </p>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => handleBulkToggleActive(true)}
                  disabled={submitting}
                  className="bg-green-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs disabled:opacity-50"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkToggleActive(false)}
                  disabled={submitting}
                  className="bg-yellow-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs disabled:opacity-50"
                >
                  Deactivate
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={submitting}
                  className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="hidden md:block h-6 border-l border-gray-300 mx-1"></div>

          {/* Export Button */}
          <button
            onClick={exportUsers}
            disabled={filteredUsers.length === 0}
            className="flex items-center gap-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2.5 py-1 md:px-4 md:py-2 rounded-lg text-[10px] md:text-sm font-medium shadow-sm whitespace-nowrap disabled:opacity-50"
          >
            <Download className="w-3 h-3 md:w-4 md:h-4" />
            Export
          </button>

          <div className="hidden md:block h-6 border-l border-gray-300 mx-1"></div>

          {/* Add User Button */}
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white px-2.5 py-1 md:px-4 md:py-2 rounded-lg text-[10px] md:text-sm font-medium shadow-sm whitespace-nowrap ml-auto md:ml-0"
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl px-0 shadow-sm border border-gray-200 overflow-hidden mx-0 md:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-200 border-b border-gray-200">
              {/* Header Row */}
              <tr>
                <th className="px-3 md:px-4 py-2 text-center w-12">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Select
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Department
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Phone
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </div>
                </th>
              </tr>

              {/* Search Row */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <td className="px-3 md:px-4 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                  />
                </td>

                {/* Name Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Email Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Role Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search role..."
                    value={searchRole}
                    onChange={(e) => setSearchRole(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Department Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search department..."
                    value={searchDepartment}
                    onChange={(e) => setSearchDepartment(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Phone Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search phone..."
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Status Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search status..."
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Clear Filter Button */}
                <td className="px-3 md:px-4 py-1 text-center">
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                    title="Clear Filters"
                  >
                    <XCircle className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                    Clear
                  </button>
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isSelected = selectedUsers.has(user.id);
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 transition ${
                        isSelected
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                    >
                      <td className="px-3 md:px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectUser(user.id)}
                          className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                        />
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {user.profile_picture ? (
                              <img
                                src={getProfilePictureUrl(user.profile_picture)}
                                alt={user.full_name}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    const defaultIcon =
                                      parent.querySelector(".default-icon");
                                    if (defaultIcon) {
                                      (
                                        defaultIcon as HTMLElement
                                      ).style.display = "flex";
                                    }
                                  }
                                }}
                              />
                            ) : (
                              <div className="default-icon w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                              </div>
                            )}
                            <div
                              className={`absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white ${
                                user.is_active ? "bg-green-500" : "bg-gray-400"
                              }`}
                            ></div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-800 text-xs md:text-sm block">
                              {user.full_name || "N/A"}
                            </span>
                            <span className="text-xs text-gray-500 hidden md:block">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
                        {user.email}
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <span
                          className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getRoleColor(
                            user.role || "user",
                          )}`}
                        >
                          {user.role || "user"}{" "}
                          {/* यहाँ .toUpperCase() हटाएं */}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
                        {user.department || "-"}
                      </td>
                      <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
                        {user.phone || "-"}
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <button
                          onClick={() => toggleActive(user.id, user.is_active)}
                          className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                            user.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.is_active ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5 md:gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => handleView(user)}
                            className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
                          >
                            <EyeIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm md:text-lg font-medium">
                      {users.length === 0
                        ? "No users found"
                        : "No matching users found"}
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">
                      {searchName ||
                      searchEmail ||
                      searchDepartment ||
                      searchRole ||
                      searchPhone ||
                      searchStatus
                        ? "Try a different search term"
                        : 'Click "Add User" to create your first user'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden mx-2 border border-gray-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-sm">
                    {editingId ? "Edit User" : "Add New User"}
                  </h2>
                  <p className="text-xs text-white/90">
                    {editingId
                      ? "Update user details"
                      : "Create new user account"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 rounded-lg p-1.5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col h-[calc(85vh-64px)]"
            >
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Profile Preview"
                            className="w-full h-full object-cover"
                            onError={() => {
                              // Handle error
                            }}
                          />
                        ) : (
                          <UserIcon className="w-8 h-8 text-blue-500" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full shadow">
                        <Camera className="w-3 h-3" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-800 mb-1">
                        Profile Picture
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        JPG, PNG, WebP (Max 5MB)
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          id="profile_picture"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <label
                          htmlFor="profile_picture"
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {selectedFile ? "Change Photo" : "Upload Photo"}
                        </label>
                        {selectedFile && (
                          <span className="px-2 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                        placeholder="John"
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="(Optional)"
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Doe"
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
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="john@example.com"
                        required
                        disabled={!!editingId}
                      />
                    </div>

                    {/* Phone */}
                 <div className="space-y-1">
  <label className="block text-xs font-semibold text-gray-700">
    Phone
  </label>
  <input
    type="tel"
    value={formData.phone}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, phone: value });
    }}
    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
    placeholder="9876543210"
    maxLength={10}
  />
</div>

                    {/* Password (only for new users) */}
                    {!editingId && (
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Min 6 characters"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Confirm Password (only for new users) */}
                    {!editingId && (
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-700">
                          Confirm Password{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirm_password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                confirm_password: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="Confirm password"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {formData.password &&
                          formData.confirm_password &&
                          formData.password !== formData.confirm_password && (
                            <p className="text-xs text-red-600 mt-1">
                              Passwords do not match
                            </p>
                          )}
                      </div>
                    )}
                  </div>

                  {/* Role and Department */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Department */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                        required
                        disabled={loadingDepartments}
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
                    {/* Role */}
                    {/* Role */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                        required
                        disabled={
                          !formData.department_id || loadingDepartmentRoles
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
                              {" "}
                              {/* यहाँ .toUpperCase() हटाएं */}
                              {role.name} {/* यहाँ .toUpperCase() हटाएं */}
                            </option>
                          ))
                        ) : formData.department_id &&
                          !loadingDepartmentRoles ? (
                          <option value="" disabled>
                            No roles available for this department
                          </option>
                        ) : (
                          <option value="" disabled>
                            Select a department first
                          </option>
                        )}
                      </select>
                      {!formData.department_id && (
                        <p className="text-xs text-gray-500 mt-1">
                          Select a department first to see available roles
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Designation */}
                  {formData.department_id && formData.role_id && (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Designation
                      </label>
                      <select
                        value={formData.designation_id}
                        onChange={(e) => {
                          const selectedDesignation = designations.find(
                            (d) => d.id === e.target.value,
                          );
                          setFormData((prev) => ({
                            ...prev,
                            designation_id: e.target.value,
                            designation: selectedDesignation?.name || "",
                          }));
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                        disabled={
                          loadingDesignations || designations.length === 0
                        }
                      >
                        <option value="">Select Designation</option>
                        {loadingDesignations ? (
                          <option value="" disabled>
                            Loading designations...
                          </option>
                        ) : designations.length > 0 ? (
                          designations.map((designation) => (
                            <option key={designation.id} value={designation.id}>
                              {designation.name} (Level{" "}
                              {designation.hierarchy_level})
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No designations available for this department/role
                          </option>
                        )}
                      </select>
                    </div>
                  )}

                  {/* Is Employee Checkbox */}
                  {!editingId && (
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        id="is_employee"
                        checked={formData.is_employee}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_employee: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="is_employee"
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Briefcase className="w-4 h-4 text-blue-500" />
                        This user is an employee (will create employee record)
                      </label>
                    </div>
                  )}

                  {/* Employee Fields */}
                  {formData.is_employee && (
                    <>
                      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                          Employee Information
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Company */}
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-700">
                              Company <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.company_id}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  company_id: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                              required={formData.is_employee}
                            >
                              <option value="">Select Company</option>
                              {companies.length > 0 ? (
                                companies.map((company) => (
                                  <option key={company.id} value={company.id}>
                                    {company.name}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>
                                  No companies available
                                </option>
                              )}
                            </select>
                          </div>

                          {/* Attendance Location (Branch) */}
                          {/* Attendance Location (Branch) */}
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-700">
                              Attendance Location (Branch){" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.attendance_location_id}
                              onChange={(e) => {
                                const selectedLocation = officeLocations.find(
                                  (loc) => loc.id === e.target.value,
                                );
                                setFormData((prev) => ({
                                  ...prev,
                                  attendance_location_id: e.target.value,
                                  attendance_location:
                                    selectedLocation?.name || "",
                                }));
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                              required={formData.is_employee}
                              disabled={
                                !formData.company_id ||
                                officeLocations.length === 0
                              }
                            >
                              <option value="">Select Branch</option>
                              {officeLocations.length > 0 ? (
                                officeLocations.map((location) => (
                                  <option key={location.id} value={location.id}>
                                    {location.name} - {location.city}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>
                                  {formData.company_id
                                    ? "Loading branches..."
                                    : "Select company first"}
                                </option>
                              )}
                            </select>
                          </div>

                          {/* Date of Joining */}
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-700">
                              Date of Joining{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={formData.joining_date}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  joining_date: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                              required={formData.is_employee}
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
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                              required={formData.is_employee}
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          {/* Allotted Projects */}
                          <div className="space-y-1 md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700">
                              Allotted Projects
                            </label>
                            <div className="flex gap-2">
                              <div
                                className="relative flex-shrink-0"
                                style={{ width: "200px" }}
                                ref={projectDropdownRef}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setIsProjectDropdownOpen(
                                      !isProjectDropdownOpen,
                                    )
                                  }
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-left flex items-center justify-between"
                                >
                                  <span className="text-gray-700 truncate">
                                    {formData.allotted_project.length > 0
                                      ? `${formData.allotted_project.length} selected`
                                      : "Select projects"}
                                  </span>
                                  <ChevronDown
                                    className={`w-4 h-4 text-gray-400 transition-transform ${isProjectDropdownOpen ? "rotate-180" : ""}`}
                                  />
                                </button>

                                {isProjectDropdownOpen && (
                                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {projects.length > 0 ? (
                                      projects.map((project) => (
                                        <label
                                          key={project.id}
                                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={formData.allotted_project.includes(
                                              project.id,
                                            )}
                                            onChange={() =>
                                              handleProjectToggle(project.id)
                                            }
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                          />
                                          <span className="text-sm text-gray-700 truncate">
                                            {project.name}
                                          </span>
                                        </label>
                                      ))
                                    ) : (
                                      <div className="px-3 py-2 text-sm text-gray-500">
                                        Loading projects...
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Selected Projects Preview */}
                              {formData.allotted_project.length > 0 && (
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap gap-1">
                                    {getSelectedProjects().map((project) => (
                                      <div
                                        key={project.id}
                                        className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium"
                                      >
                                        <span className="truncate max-w-[120px]">
                                          {project.name}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleProjectToggle(project.id)
                                          }
                                          className="hover:bg-blue-700 rounded-full p-0.5"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Active Status */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="is_active"
                      className="text-sm font-medium text-gray-700"
                    >
                      Active User
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 bg-gray-50 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 px-4 rounded-lg hover:from-black hover:to-black transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update User"
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create User
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Modal */}
      {showViewModal && viewingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden mx-2 border border-gray-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-sm">User Details</h2>
                  <p className="text-xs text-white/90">View user information</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingUser(null);
                }}
                className="text-white hover:bg-white/20 rounded-lg p-1.5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col h-[calc(85vh-64px)]">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Profile Picture */}
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                        {viewingUser.profile_picture ? (
                          <img
                            src={getProfilePictureUrl(
                              viewingUser.profile_picture,
                            )}
                            alt={viewingUser.full_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const defaultIcon =
                                  parent.querySelector(".default-icon");
                                if (defaultIcon) {
                                  (defaultIcon as HTMLElement).style.display =
                                    "flex";
                                }
                              }
                            }}
                          />
                        ) : (
                          <div className="default-icon w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <UserIcon className="w-12 h-12 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div
                        className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white ${
                          viewingUser.is_active ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-gray-800">
                        {viewingUser.full_name || "N/A"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {viewingUser.email}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Role */}
                      {/* Role in View Modal */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase">
                          Role
                        </label>
                        <div
                          className={`px-3 py-1.5 rounded-lg ${getRoleColor(viewingUser.role)}`}
                        >
                          <span className="text-sm font-medium">
                            {viewingUser.role || "user"}{" "}
                            {/* यहाँ .toUpperCase() हटाएं */}
                          </span>
                        </div>
                      </div>

                      {/* Department */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase">
                          Department
                        </label>
                        <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">
                            {viewingUser.department || "-"}
                          </span>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase">
                          Phone
                        </label>
                        <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">
                            {viewingUser.phone || "-"}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase">
                          Status
                        </label>
                        <div
                          className={`px-3 py-1.5 rounded-lg ${
                            viewingUser.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <span className="text-sm font-medium">
                            {viewingUser.is_active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    {viewingUser.permissions &&
                      Object.keys(viewingUser.permissions).length > 0 && (
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase">
                            Permissions
                          </label>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(viewingUser.permissions).map(
                              ([key, value]) =>
                                value && (
                                  <span
                                    key={key}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                                  >
                                    {key.replace(/_/g, " ")}
                                  </span>
                                ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Created Date */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase">
                        Account Information
                      </label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            User ID:
                          </span>
                          <span className="text-sm font-medium text-gray-800 font-mono">
                            {viewingUser.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 bg-gray-50 flex gap-2">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingUser(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 px-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleEdit(viewingUser);
                    setShowViewModal(false);
                  }}
                  className="px-4 py-2.5 text-sm border border-red-600 text-red-600 rounded-lg hover:bg-blue-50 transition font-medium"
                >
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
