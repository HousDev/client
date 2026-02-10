import { useState, useEffect } from 'react';
import { X, Edit2, Save, Check, AlertCircle, Clock, Calendar as CalendarIcon } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { toast } from 'sonner';

interface AttendanceDay {
  date: string;
  day_type: 'present' | 'absent' | 'half_day' | 'week_off' | 'holiday' | 'paid_leave' | 'unpaid_leave';
  punch_in_time?: string;
  punch_out_time?: string;
  notes?: string;
  is_edited: boolean;
  has_issue?: boolean;
}

interface AttendanceSummary {
  id: string;
  present_days: number;
  absent_days: number;
  half_days: number;
  week_offs: number;
  holidays: number;
  paid_leave_days: number;
  unpaid_leave_days: number;
  total_days: number;
  days: AttendanceDay[];
}

interface VerifyAttendanceModalProps {
  payrollItem: any;
  payrollRun: any;
  onClose: () => void;
  onUpdate: () => void;
}

const generateAttendanceData = (startDate: string, endDate: string): AttendanceDay[] => {
  const days: AttendanceDay[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();

    let dayData: AttendanceDay;

    if (dayOfWeek === 0) {
      dayData = {
        date: dateStr,
        day_type: 'week_off',
        is_edited: false
      };
    } else if (Math.random() < 0.05) {
      dayData = {
        date: dateStr,
        day_type: 'absent',
        notes: 'Unplanned absence',
        is_edited: false
      };
    } else if (Math.random() < 0.08) {
      dayData = {
        date: dateStr,
        day_type: 'paid_leave',
        notes: 'Casual leave',
        is_edited: false
      };
    } else if (Math.random() < 0.1) {
      const hasIssue = Math.random() < 0.5;
      dayData = {
        date: dateStr,
        day_type: 'present',
        punch_in_time: '09:15',
        punch_out_time: hasIssue ? undefined : '18:30',
        is_edited: false,
        has_issue: hasIssue,
        notes: hasIssue ? 'Missing punch out - Server issue' : undefined
      };
    } else {
      dayData = {
        date: dateStr,
        day_type: 'present',
        punch_in_time: `09:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}`,
        punch_out_time: `18:${String(Math.floor(Math.random() * 45)).padStart(2, '0')}`,
        is_edited: false
      };
    }

    days.push(dayData);
  }

  return days;
};

const calculateSummary = (days: AttendanceDay[]): Omit<AttendanceSummary, 'id' | 'days'> => {
  const present_days = days.filter(d => d.day_type === 'present').length;
  const absent_days = days.filter(d => d.day_type === 'absent').length;
  const half_days = days.filter(d => d.day_type === 'half_day').length;
  const week_offs = days.filter(d => d.day_type === 'week_off').length;
  const holidays = days.filter(d => d.day_type === 'holiday').length;
  const paid_leave_days = days.filter(d => d.day_type === 'paid_leave').length;
  const unpaid_leave_days = days.filter(d => d.day_type === 'unpaid_leave').length;

  return {
    present_days,
    absent_days,
    half_days,
    week_offs,
    holidays,
    paid_leave_days,
    unpaid_leave_days,
    total_days: days.length
  };
};

export default function VerifyAttendanceModal({
  payrollItem,
  payrollRun,
  onClose,
  onUpdate
}: VerifyAttendanceModalProps) {
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const days = generateAttendanceData(
      payrollRun.cycle_start_date,
      payrollRun.cycle_end_date
    );

    const summary = calculateSummary(days);

    setAttendance({
      id: `ATT-${payrollItem.id}`,
      ...summary,
      days
    });

    setLoading(false);
  };

  const handleEditDay = (day: AttendanceDay) => {
    setEditingDate(day.date);
    setEditData({
      dayType: day.day_type,
      punchInTime: day.punch_in_time || '',
      punchOutTime: day.punch_out_time || '',
      notes: day.notes || ''
    });
  };

  const handleSaveDay = () => {
    if (!editingDate || !attendance) return;

    const updatedDays = attendance.days.map(day => {
      if (day.date === editingDate) {
        return {
          ...day,
          day_type: editData.dayType,
          punch_in_time: editData.punchInTime || undefined,
          punch_out_time: editData.punchOutTime || undefined,
          notes: editData.notes || undefined,
          is_edited: true,
          has_issue: false
        };
      }
      return day;
    });

    const summary = calculateSummary(updatedDays);

    setAttendance({
      ...attendance,
      ...summary,
      days: updatedDays
    });

    setEditingDate(null);
    setEditData({});
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    onUpdate();
    onClose();
    toast.error('Attendance updated successfully! Salary will be recalculated.');
  };

  const getDayTypeColor = (dayType: string) => {
    switch (dayType) {
      case 'present':
        return 'success';
      case 'absent':
        return 'danger';
      case 'half_day':
        return 'warning';
      case 'week_off':
        return 'secondary';
      case 'holiday':
        return 'info';
      case 'paid_leave':
        return 'success';
      case 'unpaid_leave':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getDayTypeLabel = (dayType: string) => {
    return dayType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getDayOfWeek = (dateStr: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(dateStr).getDay()];
  };

  const issueCount = attendance?.days.filter(d => d.has_issue).length || 0;
  const editedCount = attendance?.days.filter(d => d.is_edited).length || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Manage Attendance</h2>
            <p className="text-sm text-slate-600 mt-1">
              {payrollItem.employee_name} - {payrollRun.pay_month} {payrollRun.pay_year}
            </p>
            {issueCount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600 font-medium">
                  {issueCount} day{issueCount > 1 ? 's' : ''} with attendance issues
                </p>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-600">Loading attendance data...</div>
        ) : !attendance ? (
          <div className="p-6 text-center text-slate-600">No attendance data found</div>
        ) : (
          <>
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700 font-medium">Present Days</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{attendance.present_days}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-700 font-medium">Absent Days</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">{attendance.absent_days}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-700 font-medium">Half Days</p>
                  <p className="text-2xl font-bold text-yellow-900 mt-1">{attendance.half_days}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 font-medium">Paid Leaves</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{attendance.paid_leave_days}</p>
                </div>
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-3">
                  <p className="text-xs text-slate-700 font-medium">Week Offs</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{attendance.week_offs}</p>
                </div>
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-3">
                  <p className="text-xs text-slate-700 font-medium">Holidays</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{attendance.holidays}</p>
                </div>
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-3">
                  <p className="text-xs text-slate-700 font-medium">Unpaid Leaves</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{attendance.unpaid_leave_days}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-700 font-medium">Payable Days</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {attendance.present_days + attendance.half_days * 0.5 + attendance.paid_leave_days + attendance.week_offs + attendance.holidays}
                  </p>
                </div>
              </div>

              {editedCount > 0 && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <Edit2 className="h-4 w-4 inline mr-1" />
                    {editedCount} day{editedCount > 1 ? 's' : ''} manually edited
                  </p>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Daily Attendance Record
                </h3>
                <p className="text-xs text-slate-500">
                  Click the edit icon to modify any day's attendance
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {attendance.days?.map((day) => (
                  <div
                    key={day.date}
                    className={`border rounded-lg p-3 transition-all ${
                      editingDate === day.date
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : day.has_issue
                        ? 'border-red-300 bg-red-50'
                        : day.is_edited
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {editingDate === day.date ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-slate-900 text-sm">
                              {new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                            <p className="text-xs text-slate-500">{getDayOfWeek(day.date)}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={handleSaveDay}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                              title="Save changes"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingDate(null);
                                setEditData({});
                              }}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Day Status
                          </label>
                          <select
                            value={editData.dayType}
                            onChange={(e) => setEditData({ ...editData, dayType: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                        {(editData.dayType === 'present' || editData.dayType === 'half_day') && (
                          <>
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                Punch In Time
                              </label>
                              <input
                                type="time"
                                value={editData.punchInTime}
                                onChange={(e) =>
                                  setEditData({ ...editData, punchInTime: e.target.value })
                                }
                                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                Punch Out Time
                              </label>
                              <input
                                type="time"
                                value={editData.punchOutTime}
                                onChange={(e) =>
                                  setEditData({ ...editData, punchOutTime: e.target.value })
                                }
                                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Notes (Optional)
                          </label>
                          <textarea
                            value={editData.notes}
                            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="Reason or remarks..."
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-slate-900 text-sm">
                              {new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                            <p className="text-xs text-slate-500">{getDayOfWeek(day.date)}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {day.has_issue && (
                              <AlertCircle className="h-3.5 w-3.5 text-red-600" title="Has attendance issue" />
                            )}
                            {day.is_edited && (
                              <Edit2 className="h-3.5 w-3.5 text-blue-600" title="Manually edited" />
                            )}
                            <button
                              onClick={() => handleEditDay(day)}
                              className="p-1 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                              title="Edit attendance"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <Badge variant={getDayTypeColor(day.day_type)} className="text-xs">
                          {getDayTypeLabel(day.day_type)}
                        </Badge>

                        {(day.day_type === 'present' || day.day_type === 'half_day') && (
                          <div className="mt-2 space-y-1">
                            {day.punch_in_time ? (
                              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Clock className="h-3 w-3" />
                                <span>In: {day.punch_in_time}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs text-red-600">
                                <AlertCircle className="h-3 w-3" />
                                <span>Missing punch in</span>
                              </div>
                            )}
                            {day.punch_out_time ? (
                              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Clock className="h-3 w-3" />
                                <span>Out: {day.punch_out_time}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs text-red-600">
                                <AlertCircle className="h-3 w-3" />
                                <span>Missing punch out</span>
                              </div>
                            )}
                          </div>
                        )}

                        {day.notes && (
                          <p className="text-xs text-slate-600 mt-2 bg-slate-100 p-2 rounded">
                            {day.notes}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex justify-between items-center bg-slate-50">
              <div className="text-sm text-slate-600">
                {hasChanges ? (
                  <span className="text-blue-600 font-medium">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    You have unsaved changes
                  </span>
                ) : (
                  <span>Make changes to attendance records and save</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                {hasChanges && (
                  <Button onClick={handleSaveChanges}>
                    <Save className="h-4 w-4 mr-2" />
                    Save & Recalculate Salary
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
