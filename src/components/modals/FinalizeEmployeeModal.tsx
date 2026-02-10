// import { useState } from 'react';
// import { X, Calendar, DollarSign, FileText, CheckCircle, Upload, Plus, Trash2, Clock, AlertCircle, Save, ChevronRight, ChevronLeft } from 'lucide-react';
// import Button from '../ui/Button';
// import Badge from '../ui/Badge';
// import Input from '../ui/Input';

// interface FinalizeEmployeeModalProps {
//   employee: any;
//   payrollRun: any;
//   onClose: () => void;
//   onFinalize: () => void;
// }

// interface AttendanceDay {
//   date: string;
//   status: 'present' | 'absent' | 'half_day' | 'week_off' | 'holiday' | 'paid_leave' | 'unpaid_leave';
//   punch_in?: string;
//   punch_out?: string;
//   notes?: string;
// }

// interface SalaryComponent {
//   id: string;
//   type: 'earning' | 'deduction';
//   category: string;
//   amount: number;
//   notes?: string;
// }

// const generateMonthAttendance = (year: number, month: number): AttendanceDay[] => {
//   const days: AttendanceDay[] = [];
//   const daysInMonth = new Date(year, month, 0).getDate();

//   for (let day = 1; day <= daysInMonth; day++) {
//     const date = new Date(year, month - 1, day);
//     const dayOfWeek = date.getDay();
//     const dateStr = date.toISOString().split('T')[0];

//     if (dayOfWeek === 0) {
//       days.push({ date: dateStr, status: 'week_off' });
//     } else if (Math.random() < 0.05) {
//       days.push({ date: dateStr, status: 'absent', notes: 'Unplanned absence' });
//     } else if (Math.random() < 0.08) {
//       days.push({ date: dateStr, status: 'paid_leave', notes: 'Casual leave' });
//     } else if (Math.random() < 0.05) {
//       const missingPunchOut = Math.random() < 0.5;
//       days.push({
//         date: dateStr,
//         status: 'present',
//         punch_in: '09:15',
//         punch_out: missingPunchOut ? undefined : '18:30',
//         notes: missingPunchOut ? 'Missing punch out - server issue' : undefined
//       });
//     } else {
//       days.push({
//         date: dateStr,
//         status: 'present',
//         punch_in: `09:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}`,
//         punch_out: `18:${String(Math.floor(Math.random() * 45)).padStart(2, '0')}`
//       });
//     }
//   }

//   return days;
// };

// export default function FinalizeEmployeeModal({ employee, payrollRun, onClose, onFinalize }: FinalizeEmployeeModalProps) {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>(() =>
//     generateMonthAttendance(payrollRun.pay_year, new Date(`${payrollRun.pay_month} 1`).getMonth() + 1)
//   );
//   const [selectedDate, setSelectedDate] = useState<string | null>(null);
//   const [editingDay, setEditingDay] = useState<AttendanceDay | null>(null);

//   const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>([
//     { id: '1', type: 'earning', category: 'Work Basis Pay', amount: employee.gross_salary || 80000, notes: 'Basic salary' },
//     { id: '2', type: 'deduction', category: 'Tax Deduction', amount: 12000, notes: 'TDS' },
//     { id: '3', type: 'deduction', category: 'PF', amount: 3000, notes: 'Provident Fund' }
//   ]);

//   const [newComponent, setNewComponent] = useState({
//     type: 'earning' as 'earning' | 'deduction',
//     category: '',
//     amount: 0,
//     notes: ''
//   });

//   const [documents, setDocuments] = useState<Array<{ name: string; type: string; uploaded: Date }>>([]);

//   const stats = {
//     present: attendanceDays.filter(d => d.status === 'present').length,
//     absent: attendanceDays.filter(d => d.status === 'absent').length,
//     halfDay: attendanceDays.filter(d => d.status === 'half_day').length,
//     paidLeave: attendanceDays.filter(d => d.status === 'paid_leave').length,
//     unpaidLeave: attendanceDays.filter(d => d.status === 'unpaid_leave').length,
//     weekOff: attendanceDays.filter(d => d.status === 'week_off').length,
//     holiday: attendanceDays.filter(d => d.status === 'holiday').length
//   };

//   const payableDays = stats.present + stats.halfDay * 0.5 + stats.paidLeave + stats.weekOff + stats.holiday;

//   const totalEarnings = salaryComponents
//     .filter(c => c.type === 'earning')
//     .reduce((sum, c) => sum + c.amount, 0);

//   const totalDeductions = salaryComponents
//     .filter(c => c.type === 'deduction')
//     .reduce((sum, c) => sum + c.amount, 0);

//   const netSalary = totalEarnings - totalDeductions;

//   const handleDayClick = (day: AttendanceDay) => {
//     setSelectedDate(day.date);
//     setEditingDay({ ...day });
//   };

//   const handleSaveDay = () => {
//     if (!editingDay) return;

//     setAttendanceDays(days =>
//       days.map(d => d.date === editingDay.date ? { ...editingDay } : d)
//     );
//     setSelectedDate(null);
//     setEditingDay(null);
//   };

//   const handleAddComponent = () => {
//     if (!newComponent.category || newComponent.amount <= 0) {
//       alert('Please fill all fields');
//       return;
//     }

//     setSalaryComponents([
//       ...salaryComponents,
//       {
//         id: Date.now().toString(),
//         ...newComponent
//       }
//     ]);

//     setNewComponent({
//       type: 'earning',
//       category: '',
//       amount: 0,
//       notes: ''
//     });
//   };

//   const handleRemoveComponent = (id: string) => {
//     setSalaryComponents(salaryComponents.filter(c => c.id !== id));
//   };

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files) return;

//     const newDocs = Array.from(files).map(file => ({
//       name: file.name,
//       type: file.type,
//       uploaded: new Date()
//     }));

//     setDocuments([...documents, ...newDocs]);
//   };

//   const handleFinalize = () => {
//     onFinalize();
//     alert('Employee salary finalized successfully!');
//     onClose();
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'present': return 'bg-green-500';
//       case 'absent': return 'bg-red-500';
//       case 'half_day': return 'bg-yellow-500';
//       case 'week_off': return 'bg-gray-400';
//       case 'holiday': return 'bg-blue-500';
//       case 'paid_leave': return 'bg-green-400';
//       case 'unpaid_leave': return 'bg-orange-500';
//       default: return 'bg-gray-300';
//     }
//   };

//   const getStatusLabel = (status: string) => {
//     return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
//   };

//   const issuesCount = attendanceDays.filter(d =>
//     (d.status === 'present' || d.status === 'half_day') && (!d.punch_in || !d.punch_out)
//   ).length;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
//         {/* Header */}
//         <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 z-10">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold">Finalize Salary</h2>
//               <p className="text-blue-100 mt-1">
//                 {employee.name} • {employee.employee_code} • {payrollRun.pay_month} {payrollRun.pay_year}
//               </p>
//             </div>
//             <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
//               <X className="h-6 w-6" />
//             </button>
//           </div>

//           {/* Progress Steps */}
//           <div className="flex items-center justify-center mt-6 space-x-4">
//             <div className={`flex items-center ${currentStep >= 1 ? 'text-white' : 'text-blue-300'}`}>
//               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-white text-blue-600' : 'bg-blue-800'} font-bold`}>
//                 1
//               </div>
//               <span className="ml-2 font-medium">Attendance</span>
//             </div>
//             <ChevronRight className="h-5 w-5 text-blue-300" />
//             <div className={`flex items-center ${currentStep >= 2 ? 'text-white' : 'text-blue-300'}`}>
//               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-white text-blue-600' : 'bg-blue-800'} font-bold`}>
//                 2
//               </div>
//               <span className="ml-2 font-medium">Salary Components</span>
//             </div>
//             <ChevronRight className="h-5 w-5 text-blue-300" />
//             <div className={`flex items-center ${currentStep >= 3 ? 'text-white' : 'text-blue-300'}`}>
//               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-white text-blue-600' : 'bg-blue-800'} font-bold`}>
//                 3
//               </div>
//               <span className="ml-2 font-medium">Review & Finalize</span>
//             </div>
//           </div>
//         </div>

//         {/* Step 1: Attendance */}
//         {currentStep === 1 && (
//           <div className="p-6 space-y-6">
//             {/* Stats */}
//             <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
//               <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
//                 <p className="text-xs text-green-700 font-medium">Present</p>
//                 <p className="text-2xl font-bold text-green-900">{stats.present}</p>
//               </div>
//               <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
//                 <p className="text-xs text-red-700 font-medium">Absent</p>
//                 <p className="text-2xl font-bold text-red-900">{stats.absent}</p>
//               </div>
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
//                 <p className="text-xs text-yellow-700 font-medium">Half Day</p>
//                 <p className="text-2xl font-bold text-yellow-900">{stats.halfDay}</p>
//               </div>
//               <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
//                 <p className="text-xs text-green-700 font-medium">Paid Leave</p>
//                 <p className="text-2xl font-bold text-green-900">{stats.paidLeave}</p>
//               </div>
//               <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
//                 <p className="text-xs text-orange-700 font-medium">Unpaid Leave</p>
//                 <p className="text-2xl font-bold text-orange-900">{stats.unpaidLeave}</p>
//               </div>
//               <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 text-center">
//                 <p className="text-xs text-slate-700 font-medium">Week Off</p>
//                 <p className="text-2xl font-bold text-slate-900">{stats.weekOff}</p>
//               </div>
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
//                 <p className="text-xs text-blue-700 font-medium">Holiday</p>
//                 <p className="text-2xl font-bold text-blue-900">{stats.holiday}</p>
//               </div>
//               <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-3 text-center">
//                 <p className="text-xs text-blue-700 font-medium">Payable</p>
//                 <p className="text-2xl font-bold text-blue-900">{payableDays.toFixed(1)}</p>
//               </div>
//             </div>

//             {issuesCount > 0 && (
//               <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
//                 <AlertCircle className="h-5 w-5 text-red-600" />
//                 <p className="text-sm text-red-800">
//                   <strong>{issuesCount}</strong> day(s) have attendance issues (missing punch in/out). Please review and fix.
//                 </p>
//               </div>
//             )}

//             {/* Calendar */}
//             <div className="border border-slate-200 rounded-lg p-4">
//               <div className="grid grid-cols-7 gap-2 mb-3">
//                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
//                   <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
//                     {day}
//                   </div>
//                 ))}
//               </div>

//               <div className="grid grid-cols-7 gap-2">
//                 {attendanceDays.map((day, index) => {
//                   const date = new Date(day.date);
//                   const dayOfMonth = date.getDate();
//                   const dayOfWeek = date.getDay();
//                   const hasIssue = (day.status === 'present' || day.status === 'half_day') && (!day.punch_in || !day.punch_out);

//                   if (index === 0 && dayOfWeek > 0) {
//                     return (
//                       <>
//                         {Array.from({ length: dayOfWeek }).map((_, i) => (
//                           <div key={`empty-${i}`} className="aspect-square" />
//                         ))}
//                         <button
//                           key={day.date}
//                           onClick={() => handleDayClick(day)}
//                           className={`aspect-square ${getStatusColor(day.status)} ${hasIssue ? 'ring-2 ring-red-500' : ''} rounded-lg p-2 flex flex-col items-center justify-center text-white hover:opacity-80 transition-opacity relative`}
//                         >
//                           <span className="text-sm font-bold">{dayOfMonth}</span>
//                           {hasIssue && <AlertCircle className="h-3 w-3 absolute top-1 right-1" />}
//                         </button>
//                       </>
//                     );
//                   }

//                   return (
//                     <button
//                       key={day.date}
//                       onClick={() => handleDayClick(day)}
//                       className={`aspect-square ${getStatusColor(day.status)} ${hasIssue ? 'ring-2 ring-red-500' : ''} rounded-lg p-2 flex flex-col items-center justify-center text-white hover:opacity-80 transition-opacity relative`}
//                     >
//                       <span className="text-sm font-bold">{dayOfMonth}</span>
//                       {hasIssue && <AlertCircle className="h-3 w-3 absolute top-1 right-1" />}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Legend */}
//             <div className="flex flex-wrap gap-3 justify-center">
//               {[
//                 { status: 'present', label: 'Present' },
//                 { status: 'absent', label: 'Absent' },
//                 { status: 'half_day', label: 'Half Day' },
//                 { status: 'week_off', label: 'Week Off' },
//                 { status: 'holiday', label: 'Holiday' },
//                 { status: 'paid_leave', label: 'Paid Leave' },
//                 { status: 'unpaid_leave', label: 'Unpaid Leave' }
//               ].map(({ status, label }) => (
//                 <div key={status} className="flex items-center gap-2">
//                   <div className={`w-4 h-4 ${getStatusColor(status)} rounded`} />
//                   <span className="text-xs text-slate-600">{label}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Edit Day Modal */}
//         {selectedDate && editingDay && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold text-slate-900">
//                   Edit Attendance - {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
//                 </h3>
//                 <button onClick={() => { setSelectedDate(null); setEditingDay(null); }} className="text-slate-400 hover:text-slate-600">
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Day Status</label>
//                   <select
//                     value={editingDay.status}
//                     onChange={(e) => setEditingDay({ ...editingDay, status: e.target.value as any })}
//                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="present">Present</option>
//                     <option value="absent">Absent</option>
//                     <option value="half_day">Half Day</option>
//                     <option value="week_off">Week Off</option>
//                     <option value="holiday">Holiday</option>
//                     <option value="paid_leave">Paid Leave</option>
//                     <option value="unpaid_leave">Unpaid Leave</option>
//                   </select>
//                 </div>

//                 {(editingDay.status === 'present' || editingDay.status === 'half_day') && (
//                   <>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-700 mb-2">Punch In Time</label>
//                       <input
//                         type="time"
//                         value={editingDay.punch_in || ''}
//                         onChange={(e) => setEditingDay({ ...editingDay, punch_in: e.target.value })}
//                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-slate-700 mb-2">Punch Out Time</label>
//                       <input
//                         type="time"
//                         value={editingDay.punch_out || ''}
//                         onChange={(e) => setEditingDay({ ...editingDay, punch_out: e.target.value })}
//                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                   </>
//                 )}

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
//                   <textarea
//                     value={editingDay.notes || ''}
//                     onChange={(e) => setEditingDay({ ...editingDay, notes: e.target.value })}
//                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     rows={3}
//                     placeholder="Reason or remarks..."
//                   />
//                 </div>
//               </div>

//               <div className="flex gap-2 mt-6">
//                 <Button variant="secondary" onClick={() => { setSelectedDate(null); setEditingDay(null); }} className="flex-1">
//                   Cancel
//                 </Button>
//                 <Button onClick={handleSaveDay} className="flex-1">
//                   <Save className="h-4 w-4 mr-2" />
//                   Save Changes
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Step 2: Salary Components */}
//         {currentStep === 2 && (
//           <div className="p-6 space-y-6">
//             {/* Summary Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                 <p className="text-sm text-green-700 font-medium mb-1">Total Earnings</p>
//                 <p className="text-3xl font-bold text-green-900">₹{totalEarnings.toLocaleString()}</p>
//               </div>
//               <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                 <p className="text-sm text-red-700 font-medium mb-1">Total Deductions</p>
//                 <p className="text-3xl font-bold text-red-900">₹{totalDeductions.toLocaleString()}</p>
//               </div>
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                 <p className="text-sm text-blue-700 font-medium mb-1">Net Salary</p>
//                 <p className="text-3xl font-bold text-blue-900">₹{netSalary.toLocaleString()}</p>
//               </div>
//             </div>

//             {/* Add New Component */}
//             <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
//               <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
//                 <Plus className="h-5 w-5" />
//                 Add Salary Component
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
//                 <select
//                   value={newComponent.type}
//                   onChange={(e) => setNewComponent({ ...newComponent, type: e.target.value as any })}
//                   className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="earning">Earning</option>
//                   <option value="deduction">Deduction</option>
//                 </select>
//                 <input
//                   type="text"
//                   placeholder="Category name"
//                   value={newComponent.category}
//                   onChange={(e) => setNewComponent({ ...newComponent, category: e.target.value })}
//                   className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Amount"
//                   value={newComponent.amount || ''}
//                   onChange={(e) => setNewComponent({ ...newComponent, amount: parseFloat(e.target.value) || 0 })}
//                   className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <input
//                   type="text"
//                   placeholder="Notes (optional)"
//                   value={newComponent.notes}
//                   onChange={(e) => setNewComponent({ ...newComponent, notes: e.target.value })}
//                   className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <Button onClick={handleAddComponent} className="whitespace-nowrap">
//                   <Plus className="h-4 w-4 mr-1" />
//                   Add
//                 </Button>
//               </div>
//             </div>

//             {/* Earnings */}
//             <div>
//               <h3 className="font-semibold text-slate-900 mb-3">Earnings</h3>
//               <div className="space-y-2">
//                 {salaryComponents.filter(c => c.type === 'earning').map(component => (
//                   <div key={component.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
//                     <div className="flex-1">
//                       <p className="font-medium text-slate-900">{component.category}</p>
//                       {component.notes && <p className="text-xs text-slate-600">{component.notes}</p>}
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <p className="font-bold text-green-700">₹{component.amount.toLocaleString()}</p>
//                       <button
//                         onClick={() => handleRemoveComponent(component.id)}
//                         className="text-red-600 hover:bg-red-100 p-1.5 rounded transition-colors"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Deductions */}
//             <div>
//               <h3 className="font-semibold text-slate-900 mb-3">Deductions</h3>
//               <div className="space-y-2">
//                 {salaryComponents.filter(c => c.type === 'deduction').map(component => (
//                   <div key={component.id} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3">
//                     <div className="flex-1">
//                       <p className="font-medium text-slate-900">{component.category}</p>
//                       {component.notes && <p className="text-xs text-slate-600">{component.notes}</p>}
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <p className="font-bold text-red-700">-₹{component.amount.toLocaleString()}</p>
//                       <button
//                         onClick={() => handleRemoveComponent(component.id)}
//                         className="text-red-600 hover:bg-red-100 p-1.5 rounded transition-colors"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Document Upload */}
//             <div>
//               <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
//                 <Upload className="h-5 w-5" />
//                 Upload Supporting Documents
//               </h3>
//               <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
//                 <input
//                   type="file"
//                   multiple
//                   onChange={handleFileUpload}
//                   className="hidden"
//                   id="file-upload"
//                 />
//                 <label htmlFor="file-upload" className="cursor-pointer">
//                   <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
//                   <p className="text-slate-600 mb-1">Click to upload documents</p>
//                   <p className="text-xs text-slate-500">PDF, Images, or any document</p>
//                 </label>
//               </div>

//               {documents.length > 0 && (
//                 <div className="mt-3 space-y-2">
//                   {documents.map((doc, index) => (
//                     <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3">
//                       <div className="flex items-center gap-2">
//                         <FileText className="h-4 w-4 text-slate-600" />
//                         <span className="text-sm text-slate-900">{doc.name}</span>
//                       </div>
//                       <Badge variant="success">Uploaded</Badge>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Step 3: Review */}
//         {currentStep === 3 && (
//           <div className="p-6 space-y-6">
//             <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-6 text-center">
//               <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-3" />
//               <h3 className="text-2xl font-bold text-slate-900 mb-2">Ready to Finalize</h3>
//               <p className="text-slate-600">Review the summary below and finalize the salary</p>
//             </div>

//             {/* Summary */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Attendance Summary */}
//               <div className="border border-slate-200 rounded-lg p-4">
//                 <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
//                   <Calendar className="h-5 w-5" />
//                   Attendance Summary
//                 </h4>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-slate-600">Present Days</span>
//                     <span className="font-medium">{stats.present}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-slate-600">Paid Leaves</span>
//                     <span className="font-medium">{stats.paidLeave}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-slate-600">Half Days</span>
//                     <span className="font-medium">{stats.halfDay}</span>
//                   </div>
//                   <div className="flex justify-between border-t pt-2">
//                     <span className="font-semibold text-slate-900">Payable Days</span>
//                     <span className="font-bold text-blue-600">{payableDays.toFixed(1)}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Salary Summary */}
//               <div className="border border-slate-200 rounded-lg p-4">
//                 <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
//                   <DollarSign className="h-5 w-5" />
//                   Salary Breakdown
//                 </h4>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-slate-600">Total Earnings</span>
//                     <span className="font-medium text-green-600">₹{totalEarnings.toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-slate-600">Total Deductions</span>
//                     <span className="font-medium text-red-600">-₹{totalDeductions.toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between border-t pt-2">
//                     <span className="font-semibold text-slate-900">Net Salary</span>
//                     <span className="font-bold text-blue-600">₹{netSalary.toLocaleString()}</span>
//                   </div>
//                   {documents.length > 0 && (
//                     <div className="flex justify-between text-sm pt-2">
//                       <span className="text-slate-600">Documents</span>
//                       <span className="font-medium">{documents.length} file(s)</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Final Confirmation */}
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//               <div className="flex items-start gap-3">
//                 <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
//                 <div>
//                   <p className="font-medium text-yellow-900">Important Notice</p>
//                   <p className="text-sm text-yellow-800 mt-1">
//                     Once finalized, this salary cannot be edited. Please ensure all information is correct before proceeding.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Footer */}
//         <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center">
//           <div>
//             {currentStep === 3 && (
//               <div className="text-sm text-slate-600">
//                 <span className="font-medium">Net Payable:</span>{' '}
//                 <span className="text-xl font-bold text-green-600">₹{netSalary.toLocaleString()}</span>
//               </div>
//             )}
//           </div>
//           <div className="flex gap-2">
//             {currentStep > 1 && (
//               <Button variant="secondary" onClick={() => setCurrentStep(currentStep - 1)}>
//                 <ChevronLeft className="h-4 w-4 mr-1" />
//                 Previous
//               </Button>
//             )}
//             {currentStep < 3 ? (
//               <Button onClick={() => setCurrentStep(currentStep + 1)}>
//                 Next Step
//                 <ChevronRight className="h-4 w-4 ml-1" />
//               </Button>
//             ) : (
//               <Button onClick={handleFinalize} className="bg-green-600 hover:bg-green-700">
//                 <CheckCircle className="h-4 w-4 mr-2" />
//                 Finalize Salary
//               </Button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from 'react';
import { X, Calendar, FileText, CheckCircle, Upload, Plus, Trash2, Clock, AlertCircle, Save, ChevronRight, ChevronLeft, Users, Award, TrendingUp, IndianRupee } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import { toast } from 'sonner';

interface FinalizeEmployeeModalProps {
  employee: any;
  payrollRun: any;
  onClose: () => void;
  onFinalize: () => void;
}

interface AttendanceDay {
  date: string;
  status: 'present' | 'absent' | 'half_day' | 'week_off' | 'holiday' | 'paid_leave' | 'unpaid_leave';
  punch_in?: string;
  punch_out?: string;
  notes?: string;
}

interface SalaryComponent {
  id: string;
  type: 'earning' | 'deduction';
  category: string;
  amount: number;
  notes?: string;
}

const generateMonthAttendance = (year: number, month: number): AttendanceDay[] => {
  const days: AttendanceDay[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];

    if (dayOfWeek === 0) {
      days.push({ date: dateStr, status: 'week_off' });
    } else if (Math.random() < 0.05) {
      days.push({ date: dateStr, status: 'absent', notes: 'Unplanned absence' });
    } else if (Math.random() < 0.08) {
      days.push({ date: dateStr, status: 'paid_leave', notes: 'Casual leave' });
    } else if (Math.random() < 0.05) {
      const missingPunchOut = Math.random() < 0.5;
      days.push({
        date: dateStr,
        status: 'present',
        punch_in: '09:15',
        punch_out: missingPunchOut ? undefined : '18:30',
        notes: missingPunchOut ? 'Missing punch out - server issue' : undefined
      });
    } else {
      days.push({
        date: dateStr,
        status: 'present',
        punch_in: `09:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}`,
        punch_out: `18:${String(Math.floor(Math.random() * 45)).padStart(2, '0')}`
      });
    }
  }

  return days;
};

export default function FinalizeEmployeeModal({ employee, payrollRun, onClose, onFinalize }: FinalizeEmployeeModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>(() =>
    generateMonthAttendance(payrollRun.pay_year, new Date(`${payrollRun.pay_month} 1`).getMonth() + 1)
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingDay, setEditingDay] = useState<AttendanceDay | null>(null);

  const [salaryComponents, setSalaryComponents] = useState<SalaryComponent[]>([
    { id: '1', type: 'earning', category: 'Work Basis Pay', amount: employee.gross_salary || 80000, notes: 'Basic salary' },
    { id: '2', type: 'deduction', category: 'Tax Deduction', amount: 12000, notes: 'TDS' },
    { id: '3', type: 'deduction', category: 'PF', amount: 3000, notes: 'Provident Fund' }
  ]);

  const [newComponent, setNewComponent] = useState({
    type: 'earning' as 'earning' | 'deduction',
    category: '',
    amount: 0,
    notes: ''
  });

  const [documents, setDocuments] = useState<Array<{ name: string; type: string; uploaded: Date }>>([]);

  const stats = {
    present: attendanceDays.filter(d => d.status === 'present').length,
    absent: attendanceDays.filter(d => d.status === 'absent').length,
    halfDay: attendanceDays.filter(d => d.status === 'half_day').length,
    paidLeave: attendanceDays.filter(d => d.status === 'paid_leave').length,
    unpaidLeave: attendanceDays.filter(d => d.status === 'unpaid_leave').length,
    weekOff: attendanceDays.filter(d => d.status === 'week_off').length,
    holiday: attendanceDays.filter(d => d.status === 'holiday').length
  };

  const payableDays = stats.present + stats.halfDay * 0.5 + stats.paidLeave + stats.weekOff + stats.holiday;

  const totalEarnings = salaryComponents
    .filter(c => c.type === 'earning')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalDeductions = salaryComponents
    .filter(c => c.type === 'deduction')
    .reduce((sum, c) => sum + c.amount, 0);

  const netSalary = totalEarnings - totalDeductions;

  const handleDayClick = (day: AttendanceDay) => {
    setSelectedDate(day.date);
    setEditingDay({ ...day });
  };

  const handleSaveDay = () => {
    if (!editingDay) return;

    setAttendanceDays(days =>
      days.map(d => d.date === editingDay.date ? { ...editingDay } : d)
    );
    setSelectedDate(null);
    setEditingDay(null);
  };

  const handleAddComponent = () => {
    if (!newComponent.category || newComponent.amount <= 0) {
      toast.error('Please fill all fields');
      return;
    }

    setSalaryComponents([
      ...salaryComponents,
      {
        id: Date.now().toString(),
        ...newComponent
      }
    ]);

    setNewComponent({
      type: 'earning',
      category: '',
      amount: 0,
      notes: ''
    });
  };

  const handleRemoveComponent = (id: string) => {
    setSalaryComponents(salaryComponents.filter(c => c.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newDocs = Array.from(files).map(file => ({
      name: file.name,
      type: file.type,
      uploaded: new Date()
    }));

    setDocuments([...documents, ...newDocs]);
  };

  const handleFinalize = () => {
    onFinalize();
    toast.error('Employee salary finalized successfully!');
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500';
      case 'absent': return 'bg-red-500';
      case 'half_day': return 'bg-yellow-500';
      case 'week_off': return 'bg-gray-400';
      case 'holiday': return 'bg-blue-500';
      case 'paid_leave': return 'bg-green-400';
      case 'unpaid_leave': return 'bg-orange-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const issuesCount = attendanceDays.filter(d =>
    (d.status === 'present' || d.status === 'half_day') && (!d.punch_in || !d.punch_out)
  ).length;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-6xl h-[90vh] flex flex-col border border-gray-200 overflow-hidden">
        {/* Header - Compact */}
        <div className="bg-gradient-to-r from-[#C62828] to-red-600 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center border-b border-gray-700/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <IndianRupee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Finalize Salary</h2>
              <p className="text-xs text-white/90 font-medium">
                {employee.name} • {employee.employee_code} • {payrollRun.pay_month} {payrollRun.pay_year}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps - Compact */}
        <div className="px-4 md:px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-[#C62828] to-red-600 text-white shadow-lg shadow-red-500/30' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-8 h-0.5 transition-all duration-300 ${
                    currentStep > step ? 'bg-gradient-to-r from-[#C62828] to-red-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
            <div className="flex-1" />
            <div className="text-xs font-medium text-gray-700">
              Step {currentStep} of 3
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium text-gray-700">
            <span>Attendance</span>
            <span>Salary</span>
            <span>Review</span>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4">
          
          {/* Step 1: Attendance */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* Stats Grid - Compact */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-green-700 font-medium">Present</p>
                      <p className="text-xl font-bold text-green-900">{stats.present}</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-red-700 font-medium">Absent</p>
                      <p className="text-xl font-bold text-red-900">{stats.absent}</p>
                    </div>
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-yellow-700 font-medium">Half Day</p>
                      <p className="text-xl font-bold text-yellow-900">{stats.halfDay}</p>
                    </div>
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-400 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-blue-700 font-medium">Payable Days</p>
                      <p className="text-xl font-bold text-blue-900">{payableDays.toFixed(1)}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {issuesCount > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-white border border-red-200 rounded-xl p-3 flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-xs text-red-800">
                    <strong>{issuesCount}</strong> day(s) have attendance issues. Please review.
                  </p>
                </div>
              )}

              {/* Calendar - Compact */}
              <div className="border border-gray-200 rounded-xl p-3 bg-white">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {attendanceDays.map((day, index) => {
                    const date = new Date(day.date);
                    const dayOfMonth = date.getDate();
                    const dayOfWeek = date.getDay();
                    const hasIssue = (day.status === 'present' || day.status === 'half_day') && (!day.punch_in || !day.punch_out);

                    if (index === 0 && dayOfWeek > 0) {
                      return (
                        <>
                          {Array.from({ length: dayOfWeek }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                          ))}
                          <button
                            key={day.date}
                            onClick={() => handleDayClick(day)}
                            className={`aspect-square ${getStatusColor(day.status)} ${hasIssue ? 'ring-2 ring-red-500 ring-offset-1' : ''} rounded-lg flex flex-col items-center justify-center text-white hover:opacity-80 transition-all duration-200 relative group`}
                            title={getStatusLabel(day.status)}
                          >
                            <span className="text-xs font-bold">{dayOfMonth}</span>
                            {hasIssue && <AlertCircle className="w-2 h-2 absolute top-1 right-1" />}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
                          </button>
                        </>
                      );
                    }

                    return (
                      <button
                        key={day.date}
                        onClick={() => handleDayClick(day)}
                        className={`aspect-square ${getStatusColor(day.status)} ${hasIssue ? 'ring-2 ring-red-500 ring-offset-1' : ''} rounded-lg flex flex-col items-center justify-center text-white hover:opacity-80 transition-all duration-200 relative group`}
                        title={getStatusLabel(day.status)}
                      >
                        <span className="text-xs font-bold">{dayOfMonth}</span>
                        {hasIssue && <AlertCircle className="w-2 h-2 absolute top-1 right-1" />}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend - Compact */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { status: 'present', label: 'P', color: 'bg-green-500' },
                  { status: 'absent', label: 'A', color: 'bg-red-500' },
                  { status: 'half_day', label: 'HD', color: 'bg-yellow-500' },
                  { status: 'week_off', label: 'WO', color: 'bg-gray-400' },
                  { status: 'holiday', label: 'H', color: 'bg-blue-500' },
                  { status: 'paid_leave', label: 'PL', color: 'bg-green-400' },
                  { status: 'unpaid_leave', label: 'UL', color: 'bg-orange-500' }
                ].map(({ status, label, color }) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 ${color} rounded`} />
                    <span className="text-xs text-gray-600 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Salary Components */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Summary Cards - Compact */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-700 font-medium">Earnings</p>
                      <p className="text-xl font-bold text-green-900">₹{totalEarnings.toLocaleString()}</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-red-700 font-medium">Deductions</p>
                      <p className="text-xl font-bold text-red-900">₹{totalDeductions.toLocaleString()}</p>
                    </div>
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-400 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Net Salary</p>
                      <p className="text-xl font-bold text-blue-900">₹{netSalary.toLocaleString()}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <IndianRupee className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Add New Component - Compact */}
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#C62828]" />
                  Add Component
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <select
                    value={newComponent.type}
                    onChange={(e) => setNewComponent({ ...newComponent, type: e.target.value as any })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                  >
                    <option value="earning">Earning</option>
                    <option value="deduction">Deduction</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Category"
                    value={newComponent.category}
                    onChange={(e) => setNewComponent({ ...newComponent, category: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newComponent.amount || ''}
                    onChange={(e) => setNewComponent({ ...newComponent, amount: parseFloat(e.target.value) || 0 })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Notes"
                    value={newComponent.notes}
                    onChange={(e) => setNewComponent({ ...newComponent, notes: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                  />
                  <Button 
                    onClick={handleAddComponent} 
                    className="bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              {/* Earnings */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Earnings</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {salaryComponents.filter(c => c.type === 'earning').map(component => (
                    <div key={component.id} className="flex items-center justify-between bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-xl p-3 hover:shadow-sm transition-shadow">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{component.category}</p>
                        {component.notes && <p className="text-xs text-gray-500">{component.notes}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-bold text-green-700">₹{component.amount.toLocaleString()}</p>
                        <button
                          onClick={() => handleRemoveComponent(component.id)}
                          className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Deductions</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {salaryComponents.filter(c => c.type === 'deduction').map(component => (
                    <div key={component.id} className="flex items-center justify-between bg-gradient-to-r from-red-50 to-white border border-red-200 rounded-xl p-3 hover:shadow-sm transition-shadow">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{component.category}</p>
                        {component.notes && <p className="text-xs text-gray-500">{component.notes}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-bold text-red-700">-₹{component.amount.toLocaleString()}</p>
                        <button
                          onClick={() => handleRemoveComponent(component.id)}
                          className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#C62828]" />
                  Upload Documents
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center bg-gradient-to-b from-gray-50 to-white">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Click to upload</p>
                    <p className="text-xs text-gray-500">PDF, Images, Documents</p>
                  </label>
                </div>

                {documents.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-800 truncate max-w-[200px]">{doc.name}</span>
                        </div>
                        <Badge variant="success" className="text-xs">Uploaded</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Success Banner */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Ready to Finalize</h3>
                <p className="text-sm text-gray-600">Review summary and complete salary processing</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Attendance Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C62828]" />
                    Attendance Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Present Days</span>
                      <span className="text-sm font-medium text-gray-800">{stats.present}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Paid Leaves</span>
                      <span className="text-sm font-medium text-gray-800">{stats.paidLeave}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Half Days</span>
                      <span className="text-sm font-medium text-gray-800">{stats.halfDay}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-800">Payable Days</span>
                        <span className="text-lg font-bold text-[#C62828]">{payableDays.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Salary Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-[#C62828]" />
                    Salary Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Earnings</span>
                      <span className="text-sm font-medium text-green-600">₹{totalEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Deductions</span>
                      <span className="text-sm font-medium text-red-600">-₹{totalDeductions.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-800">Net Salary</span>
                        <span className="text-lg font-bold text-[#C62828]">₹{netSalary.toLocaleString()}</span>
                      </div>
                    </div>
                    {documents.length > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Documents</span>
                        <span className="font-medium">{documents.length} file(s)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Important Notice</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Once finalized, this salary cannot be edited. Please verify all information is correct.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              {currentStep === 3 && (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">Net Payable:</div>
                  <div className="text-lg font-bold text-[#C62828]">₹{netSalary.toLocaleString()}</div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="border border-gray-300 hover:border-gray-400"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinalize}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalize Salary
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Day Modal - Compact */}
      {selectedDate && editingDay && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#C62828] to-red-600 px-4 py-3 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Edit Attendance</h3>
              <button onClick={() => { setSelectedDate(null); setEditingDay(null); }} className="text-white hover:bg-white/20 p-1.5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="text-center mb-2">
                <p className="text-sm text-gray-600">Date:</p>
                <p className="font-medium text-gray-800">{new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Day Status</label>
                <select
                  value={editingDay.status}
                  onChange={(e) => setEditingDay({ ...editingDay, status: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half_day">Half Day</option>
                  <option value="week_off">Week Off</option>
                  <option value="holiday">Holiday</option>
                  <option value="paid_leave">Paid Leave</option>
                  <option value="unpaid_leave">Unpaid Leave</option>
                </select>
              </div>

              {(editingDay.status === 'present' || editingDay.status === 'half_day') && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Punch In</label>
                      <input
                        type="time"
                        value={editingDay.punch_in || ''}
                        onChange={(e) => setEditingDay({ ...editingDay, punch_in: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Punch Out</label>
                      <input
                        type="time"
                        value={editingDay.punch_out || ''}
                        onChange={(e) => setEditingDay({ ...editingDay, punch_out: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={editingDay.notes || ''}
                  onChange={(e) => setEditingDay({ ...editingDay, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                  rows={2}
                  placeholder="Reason or remarks..."
                />
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 flex gap-2">
              <Button
                variant="secondary"
                onClick={() => { setSelectedDate(null); setEditingDay(null); }}
                className="flex-1 border border-gray-300 hover:border-gray-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveDay}
                className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700"
              >
                <Save className="w-4 h-4 mr-1" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}