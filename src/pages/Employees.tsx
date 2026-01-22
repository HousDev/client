// import { useState, useEffect } from 'react';
// import { Users, Plus, Search, Filter, Download, Edit, Trash2, Eye } from 'lucide-react';

// export default function Employees() {
//     const [searchTerm, setSearchTerm] = useState('');
//     const [employees, setEmployees] = useState([
//         {
//             id: '1',
//             employee_code: 'EMP001',
//             first_name: 'John',
//             last_name: 'Doe',
//             email: 'john.doe@company.com',
//             employee_status: 'active',
//             role: { name: 'Software Developer' },
//             department: { name: 'Engineering' }
//         },
//         {
//             id: '2',
//             employee_code: 'EMP002',
//             first_name: 'Jane',
//             last_name: 'Smith',
//             email: 'jane.smith@company.com',
//             employee_status: 'active',
//             role: { name: 'HR Manager' },
//             department: { name: 'Human Resources' }
//         },
//         {
//             id: '3',
//             employee_code: 'EMP003',
//             first_name: 'Robert',
//             last_name: 'Johnson',
//             email: 'robert.j@company.com',
//             employee_status: 'on_leave',
//             role: { name: 'Project Manager' },
//             department: { name: 'Operations' }
//         },
//         {
//             id: '4',
//             employee_code: 'EMP004',
//             first_name: 'Sarah',
//             last_name: 'Williams',
//             email: 'sarah.w@company.com',
//             employee_status: 'active',
//             role: { name: 'UI/UX Designer' },
//             department: { name: 'Design' }
//         },
//         {
//             id: '5',
//             employee_code: 'EMP005',
//             first_name: 'Michael',
//             last_name: 'Brown',
//             email: 'michael.b@company.com',
//             employee_status: 'active',
//             role: { name: 'DevOps Engineer' },
//             department: { name: 'Engineering' }
//         },
//         {
//             id: '6',
//             employee_code: 'EMP006',
//             first_name: 'Lisa',
//             last_name: 'Davis',
//             email: 'lisa.d@company.com',
//             employee_status: 'active',
//             role: { name: 'Marketing Executive' },
//             department: { name: 'Marketing' }
//         },
//         {
//             id: '7',
//             employee_code: 'EMP007',
//             first_name: 'David',
//             last_name: 'Wilson',
//             email: 'david.w@company.com',
//             employee_status: 'inactive',
//             role: { name: 'Accountant' },
//             department: { name: 'Finance' }
//         },
//         {
//             id: '8',
//             employee_code: 'EMP008',
//             first_name: 'Emily',
//             last_name: 'Taylor',
//             email: 'emily.t@company.com',
//             employee_status: 'active',
//             role: { name: 'Business Analyst' },
//             department: { name: 'Business Development' }
//         }
//     ]);
//     const [loading, setLoading] = useState(false);
//     const [showAddModal, setShowAddModal] = useState(false);
//     const [stats, setStats] = useState({
//         total: 0,
//         active: 0,
//         onLeave: 0,
//         newThisMonth: 0,
//     });

//     useEffect(() => {
//         // Calculate stats from employee data
//         const total = employees.length;
//         const active = employees.filter(emp => emp.employee_status === 'active').length;
//         const onLeave = employees.filter(emp => emp.employee_status === 'on_leave').length;
//         const newThisMonth = 3; // Static for demo

//         setStats({
//             total,
//             active,
//             onLeave,
//             newThisMonth
//         });
//     }, [employees]);

//     const filteredEmployees = employees.filter(emp =>
//         emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const getStatusBadge = (status: string) => {
//         switch (status) {
//             case 'active':
//                 return (
//                     <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
//                         Active
//                     </span>
//                 );
//             case 'on_leave':
//                 return (
//                     <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
//                         On Leave
//                     </span>
//                 );
//             case 'inactive':
//                 return (
//                     <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
//                         Inactive
//                     </span>
//                 );
//             default:
//                 return (
//                     <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
//                         {status}
//                     </span>
//                 );
//         }
//     };

//     const getRoleBadge = (role: string) => {
//         const roleColors: Record<string, string> = {
//             'Software Developer': 'bg-blue-100 text-blue-800',
//             'HR Manager': 'bg-purple-100 text-purple-800',
//             'Project Manager': 'bg-orange-100 text-orange-800',
//             'UI/UX Designer': 'bg-pink-100 text-pink-800',
//             'DevOps Engineer': 'bg-indigo-100 text-indigo-800',
//             'Marketing Executive': 'bg-teal-100 text-teal-800',
//             'Accountant': 'bg-cyan-100 text-cyan-800',
//             'Business Analyst': 'bg-lime-100 text-lime-800'
//         };

//         return (
//             <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
//                 {role}
//             </span>
//         );
//     };

//     const handleExport = () => {
//         const exportData = filteredEmployees.map(emp => ({
//             Code: emp.employee_code,
//             'First Name': emp.first_name,
//             'Last Name': emp.last_name,
//             Email: emp.email,
//             Department: emp.department?.name || 'N/A',
//             Role: emp.role?.name || 'N/A',
//             Status: emp.employee_status,
//         }));

//         // Create CSV content
//         const headers = Object.keys(exportData[0] || {}).join(',');
//         const rows = exportData.map(row => Object.values(row).join(','));
//         const csvContent = [headers, ...rows].join('\n');

//         // Create and download file
//         const blob = new Blob([csvContent], { type: 'text/csv' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = 'employees.csv';
//         a.click();
//         window.URL.revokeObjectURL(url);
//     };

//     return (
//         <div className="p-6">
//             <div className="flex items-center justify-between mb-6">
//                 <button
//                     onClick={() => setShowAddModal(true)}
//                     className="bg-[#C62828] text-white px-4 py-2 rounded-lg hover:bg-[#A62222] flex items-center gap-2"
//                 >
//                     <Plus className="h-4 w-4" />
//                     Add Employee
//                 </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//                 <div className="bg-white rounded-lg shadow p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-gray-600 font-medium">Total Employees</p>
//                             <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
//                         </div>
//                         <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                             <Users className="h-5 w-5 text-blue-600" />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-gray-600 font-medium">Active</p>
//                             <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
//                         </div>
//                         <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
//                             <Users className="h-5 w-5 text-green-600" />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-gray-600 font-medium">On Leave</p>
//                             <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.onLeave}</p>
//                         </div>
//                         <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
//                             <Users className="h-5 w-5 text-yellow-600" />
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-gray-600 font-medium">New This Month</p>
//                             <p className="text-2xl font-bold text-blue-600 mt-1">{stats.newThisMonth}</p>
//                         </div>
//                         <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                             <Users className="h-5 w-5 text-blue-600" />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="bg-white rounded-lg shadow">
//                 <div className="p-4 border-b border-gray-200">
//                     <div className="flex items-center justify-between gap-3">
//                         <div className="flex-1 max-w-md">
//                             <div className="relative">
//                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search employees..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828] text-sm"
//                                 />
//                             </div>
//                         </div>
//                         <div className="flex gap-2">
//                             <button className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-1.5 text-sm">
//                                 <Filter className="h-4 w-4" />
//                                 Filter
//                             </button>
//                             <button
//                                 onClick={handleExport}
//                                 className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-1.5 text-sm"
//                             >
//                                 <Download className="h-4 w-4" />
//                                 Export
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-gray-50 border-b border-gray-200">
//                             <tr>
//                                 <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
//                                 <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
//                                 <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
//                                 <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//                                 <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                                 <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-200">
//                             {filteredEmployees.map((employee) => (
//                                 <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
//                                     <td className="px-6 py-4">
//                                         <div>
//                                             <p className="text-sm font-medium text-gray-900">{employee.first_name} {employee.last_name}</p>
//                                             <p className="text-xs text-gray-600">{employee.email}</p>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">{employee.employee_code}</span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className="text-sm text-gray-900">{employee.department?.name || 'N/A'}</span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         {getRoleBadge(employee.role?.name || 'N/A')}
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         {getStatusBadge(employee.employee_status)}
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <div className="flex items-center justify-end gap-2">
//                                             <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="View">
//                                                 <Eye className="h-4 w-4 text-gray-600" />
//                                             </button>
//                                             <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Edit">
//                                                 <Edit className="h-4 w-4 text-gray-600" />
//                                             </button>
//                                             <button className="p-1.5 hover:bg-gray-100 rounded transition-colors" title="Delete">
//                                                 <Trash2 className="h-4 w-4 text-red-600" />
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {showAddModal && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
//                         <div className="p-6">
//                             <div className="flex items-center justify-between mb-4">
//                                 <h3 className="text-lg font-semibold text-gray-900">Add Employee</h3>
//                                 <button
//                                     onClick={() => setShowAddModal(false)}
//                                     className="text-gray-400 hover:text-gray-600"
//                                 >
//                                     ✕
//                                 </button>
//                             </div>

//                             <div className="space-y-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         First Name
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
//                                         placeholder="Enter first name"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Last Name
//                                     </label>
//                                     <input
//                                         type="text"
//                                         className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
//                                         placeholder="Enter last name"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Email
//                                     </label>
//                                     <input
//                                         type="email"
//                                         className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
//                                         placeholder="Enter email address"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Department
//                                     </label>
//                                     <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]">
//                                         <option value="">Select Department</option>
//                                         <option value="engineering">Engineering</option>
//                                         <option value="hr">Human Resources</option>
//                                         <option value="marketing">Marketing</option>
//                                         <option value="finance">Finance</option>
//                                         <option value="operations">Operations</option>
//                                     </select>
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Role
//                                     </label>
//                                     <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]">
//                                         <option value="">Select Role</option>
//                                         <option value="developer">Software Developer</option>
//                                         <option value="manager">Manager</option>
//                                         <option value="designer">UI/UX Designer</option>
//                                         <option value="analyst">Business Analyst</option>
//                                         <option value="executive">Executive</option>
//                                     </select>
//                                 </div>
//                             </div>

//                             <div className="flex justify-end gap-3 mt-6">
//                                 <button
//                                     onClick={() => setShowAddModal(false)}
//                                     className="px-4 py-2 border rounded-lg hover:bg-gray-50"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button className="px-4 py-2 bg-[#C62828] text-white rounded-lg hover:bg-[#A62222]">
//                                     Add Employee
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

import { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Download, Edit, Trash2, Eye } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
// import { employeeAPI } from '../api/employee.api';
import AddEmployeeModal from '../components/modals/AddEmployeeModal';
import { exportToCSV } from '../utils/export';

interface Employee {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    role: { name: string } | null;
    department: { name: string } | null;
    employee_status: string;
}

export default function Employees() {
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        onLeave: 0,
        newThisMonth: 0,
    });

    useEffect(() => {
        loadEmployees();
        loadStats();
    }, []);

    const loadEmployees = async () => {
        try {
            const data = await employeeAPI.getAll();
            setEmployees(data.map((emp: any) => ({
                id: emp.id,
                employee_code: emp.employee_code,
                first_name: emp.first_name,
                last_name: emp.last_name,
                email: emp.email,
                employee_status: emp.employee_status || 'active',
                role: emp.role_name ? { name: emp.role_name } : null,
                department: emp.department_name ? { name: emp.department_name } : null,
            })));
        } catch (error) {
            console.error('Error loading employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await employeeAPI.getStats();
            setStats({
                total: data.total || 0,
                active: data.active || 0,
                onLeave: data.onLeave || 0,
                newThisMonth: data.newThisMonth || 0,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
                    <p className="text-sm text-slate-600 mt-0.5">Manage your workforce</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="text-sm">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Employee
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Total Employees</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-600 font-medium">Active</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-600 font-medium">On Leave</p>
                            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.onLeave}</p>
                        </div>
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-600 font-medium">New This Month</p>
                            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.newThisMonth}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="p-4 border-b border-slate-200">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 text-sm h-9"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" className="text-sm h-9">
                                <Filter className="h-4 w-4 mr-1.5" />
                                Filter
                            </Button>
                            <Button
                                variant="secondary"
                                className="text-sm h-9"
                                onClick={() => {
                                    const exportData = filteredEmployees.map(emp => ({
                                        Code: emp.employee_code,
                                        'First Name': emp.first_name,
                                        'Last Name': emp.last_name,
                                        Email: emp.email,
                                        Department: emp.department?.name || 'N/A',
                                        Role: emp.role?.name || 'N/A',
                                        Status: emp.employee_status,
                                    }));
                                    exportToCSV(exportData, 'employees');
                                }}
                            >
                                <Download className="h-4 w-4 mr-1.5" />
                                Export
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Employee</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Code</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Department</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Role</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Status</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{employee.first_name} {employee.last_name}</p>
                                            <p className="text-xs text-slate-600">{employee.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">{employee.employee_code}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-slate-900">{employee.department?.name || 'N/A'}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="info">{employee.role?.name || 'N/A'}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="success">Active</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="View">
                                                <Eye className="h-4 w-4 text-slate-600" />
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Edit">
                                                <Edit className="h-4 w-4 text-slate-600" />
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Delete">
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <AddEmployeeModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    loadEmployees();
                    loadStats();
                }}
            />
        </div>
    );
}
