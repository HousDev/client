import {
  Calendar,
  CalendarOff,
  ClipboardCheck,
  Clock,
  FileCheck,
  History,
  ScanFace,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { SetStateAction, useState } from "react";
import attendanceApi from "../../lib/attendanceApi";
import { toast } from "sonner";
import { LeaveApi } from "../../lib/leaveApi";

const ViewTodayAttendanceModal = ({
  dayData,
  loadAttendance,
  setDayData,
  setShowAttendanceDetails,
}: {
  dayData: any;
  loadAttendance: any;
  setDayData: any;
  setShowAttendanceDetails: React.Dispatch<SetStateAction<boolean>>;
}) => {
  console.log("selected options", dayData);
  const { user } = useAuth();
  const [showViewSelfieModal, setShowViewSelfieModal] =
    useState<boolean>(false);
  const [status, setStatus] = useState(dayData?.status || "");
  const [leaveStatus, setLeaveStatus] = useState("");
  const [attendanceNote, setAttendanceNote] = useState(dayData?.note || "");
  const [selectedAttendance, setSelectedAttendance] = useState<any>();
  const [selectedAttendanceImage, setSelectedAttendanceImage] =
    useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDecimalToHourMinute = (decimalHours: number | string): string => {
    const value = Number(decimalHours);
    if (isNaN(value)) return "0:00h";
    const totalMinutes = Math.round(value * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}h`;
  };

  const handleAttendanceNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayData?.id) {
      toast.error("No attendance record found to add note");
      return;
    }

    setIsUpdating(true);
    try {
      const attendanceRes: any = await attendanceApi.addNote(
        dayData.id,
        attendanceNote,
      );

      if (attendanceRes.success) {
        await loadAttendance();
        toast.success(attendanceRes.message);
      } else {
        toast.error(attendanceRes.message || "Failed to add note.");
      }
    } catch (error: any) {
      console.log("Error : ", error);
      toast.error(error?.response?.data?.message || "Error adding note");
    } finally {
      setIsUpdating(false);
    }
  };

  const markAttendanceByAdmin = async (status: string) => {
    if (!dayData?.user_id || !dayData?.punch_in_time) {
      toast.error("Missing required data to update attendance");
      return;
    }

    setIsUpdating(true);
    try {
      // Format the date correctly
      let formattedPunchTime = dayData.punch_in_time;
      if (formattedPunchTime.includes("T")) {
        formattedPunchTime = formattedPunchTime.replace("T", " ");
      }
      if (formattedPunchTime.includes("Z")) {
        formattedPunchTime = formattedPunchTime.replace("Z", "");
      }

      const payload = {
        status: status,
        user_id: dayData.user_id,
        punch_in_time: formattedPunchTime.slice(0, 19),
      };

      console.log("Sending payload for attendance update:", payload);

      const attendanceRes: any = await attendanceApi.adminMarkPunchIn(payload);

      // Check response structure (depends on your API)
      if (attendanceRes.success || attendanceRes.data?.success) {
        const message =
          attendanceRes.message ||
          attendanceRes.data?.message ||
          "Attendance updated successfully";
        await loadAttendance();
        toast.success(message);
        setShowAttendanceDetails(false);
      } else {
        const errorMsg =
          attendanceRes.message ||
          attendanceRes.data?.message ||
          "Failed to update attendance";
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Error updating attendance:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Error updating attendance";
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const markLeaveByAdmin = async (leaveType: string) => {
    if (!dayData?.user_id || !dayData?.punch_in_time) {
      toast.error("Missing required data to mark leave");
      return;
    }

    setIsUpdating(true);
    try {
      // Format the date correctly
      let formattedDate = dayData.punch_in_time;
      if (formattedDate.includes("T")) {
        formattedDate = formattedDate.split("T")[0];
      }

      const payload = {
        employee_id: dayData.user_id,
        leave_type: leaveType,
        from_date: formattedDate,
        to_date: formattedDate,
        reason: "Admin marked leave.",
        total_days: 1,
        is_half_day: leaveType === "Half Day Leave" ? 1 : 0,
      };

      console.log("Sending payload for leave:", payload);

      const leaveRes: any = await LeaveApi.applyLeave(payload);

      console.log("leave res : ", leaveRes);

      if (leaveRes.success || leaveRes.data?.success) {
        const message =
          leaveRes.message ||
          leaveRes.data?.message ||
          "Leave marked successfully";
        await loadAttendance();
        toast.success(message);
        setShowAttendanceDetails(false);
      } else {
        const errorMsg =
          leaveRes.message || leaveRes.data?.message || "Failed to mark leave";
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Error marking leave:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Error marking leave";
      toast.error("Error : " + errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-[70] p-2 md:p-4">
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/30 w-full max-w-lg border border-gray-300/50 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ClipboardCheck className="w-4 h-4 md:w-5 md:h-5 text-gray-100" />
            </div>
            <div>
              {dayData && (
                <h3 className="font-bold text-white text-sm md:text-base">
                  {dayData.user_name ?? user?.full_name} Attendance
                </h3>
              )}
              <p className="text-xs text-gray-300/80 hidden md:block">
                View Attendance
              </p>
            </div>
          </div>
          <div className="flex">
            <button
              onClick={() => {
                setDayData();
                setShowAttendanceDetails(false);
              }}
              className="text-gray-200 hover:bg-gray-700/40 rounded-xl p-2 transition-all duration-200"
              disabled={isUpdating}
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-scroll flex-grow min-h-32 max-h-[70vh]">
          <h1 className="pl-3 font-semibold mb-3">Employee Details : </h1>
          <div className="grid grid-col-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center mb-2">
              <User className="w-4 h-4 bg-green-100 mx-2 text-green-600" />
              <span className="font-semibold">Name :</span>
              {dayData && (
                <span className="text-slate-700 mx-3">
                  {dayData.user_name ?? user?.full_name}
                </span>
              )}
            </div>
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 bg-orange-100 mx-2 text-orange-600" />
              <span className="font-semibold">Date :</span>
              {dayData && (
                <span className="text-slate-700 mx-3">
                  {dayData.date ?? new Date().toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex items-center mb-2">
              <Clock className="w-4 h-4 bg-violet-100 mx-2 text-violet-600" />
              <span className={`font-semibold`}>Working Hours :</span>
              {dayData && (
                <span className="text-slate-700 mx-3">
                  {formatDecimalToHourMinute(Number(dayData.total_hours)) ??
                    "0:00h"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ScanFace className="w-4 h-4 bg-yellow-100 ml-2 text-yellow-600" />
              <span className={`font-semibold`}>Status</span>
              <div className="relative group">
                <select
                  value={status}
                  required
                  onChange={async (e: any) => {
                    const atStatus = e.target.value;
                    setStatus(atStatus);
                    await markAttendanceByAdmin(atStatus);
                  }}
                  disabled={user?.role !== "admin" || isUpdating}
                  className="w-full pl-6 pr-10 py-1 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                >
                  <option value="" className="text-gray-400 text-xs">
                    Select
                  </option>
                  {["present", "absent", "half_day", "week_off", "holiday"].map(
                    (work: any) => (
                      <option key={work} value={work} className="text-xs">
                        {work.replaceAll("_", " ").toUpperCase()}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarOff className="ml-2 w-4 h-4 bg-red-100 text-red-600" />
              <span className={`font-semibold`}>Leave</span>
              <div className="relative group">
                <select
                  value={leaveStatus}
                  required
                  onChange={async (e: any) => {
                    const atLeaveStatus = e.target.value;
                    setLeaveStatus(atLeaveStatus);
                    await markLeaveByAdmin(atLeaveStatus);
                  }}
                  disabled={user?.role !== "admin" || isUpdating}
                  className="w-full pl-6 pr-10 py-1 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                >
                  <option value="" className="text-gray-400 text-xs">
                    Select
                  </option>
                  {["Paid Leave", "Unpaid Leave", "Half Day Leave"].map(
                    (work: any) => (
                      <option key={work} value={work} className="text-xs">
                        {work.replaceAll("_", " ").toUpperCase()}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          </div>

          {isUpdating && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80]">
              <div className="bg-white rounded-lg p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C62828] mx-auto"></div>
                <p className="mt-2 text-sm">Updating...</p>
              </div>
            </div>
          )}

          {dayData?.trackingHistory &&
            dayData.trackingHistory[0]?.punch_in_selfie && (
              <div className="mt-10 border-t border-slate-300 py-3">
                <div className="flex items-center mb-2">
                  <History className="w-4 h-4 bg-yellow-100 mx-2 text-yellow-600" />
                  <span className={`font-semibold`}>Track :</span>
                </div>
                <div>
                  {dayData.trackingHistory.map((track: any, idx: number) => (
                    <div key={idx}>
                      {track.punch_out_time && (
                        <div className="px-2 py-3 border-t border-b border-gray-300 flex">
                          <button
                            onClick={() => {
                              setSelectedAttendance({
                                ...track,
                                type: "out",
                              });
                              setSelectedAttendanceImage(
                                `${import.meta.env.VITE_API_URL}/uploads/${
                                  track.punch_out_selfie
                                }`,
                              );
                              setShowViewSelfieModal(true);
                            }}
                            className="mr-3 sm:mr-6 flex-shrink-0"
                          >
                            <img
                              src={`${import.meta.env.VITE_API_URL}/uploads/${
                                track.punch_out_selfie
                              }`}
                              alt="view selfie"
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                            />
                          </button>
                          <div className="text-xs sm:text-sm">
                            <h1 className="font-medium flex items-center text-xs sm:text-sm">
                              {new Date(
                                track.punch_out_time,
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                              <div className="w-2 h-2 rounded-full bg-red-400 ml-3 mr-1"></div>
                              Out
                            </h1>
                            <p className="flex items-center text-xs">
                              {track.punch_out_location}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="px-2 py-3 border-t border-b border-gray-300 flex">
                        <button
                          onClick={() => {
                            setSelectedAttendance({
                              ...track,
                              type: "in",
                            });
                            setSelectedAttendanceImage(
                              `${import.meta.env.VITE_API_URL}/uploads/${
                                track.punch_in_selfie
                              }`,
                            );
                            setShowViewSelfieModal(true);
                          }}
                          className="mr-3 sm:mr-6 flex-shrink-0"
                        >
                          <img
                            src={`${import.meta.env.VITE_API_URL}/uploads/${
                              track.punch_in_selfie
                            }`}
                            alt="view selfie"
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                          />
                        </button>
                        <div className="">
                          <h1 className="font-semibold flex items-center text-xs sm:text-sm">
                            {new Date(track.punch_in_time).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              },
                            )}
                            <div className="w-2 h-2 rounded-full bg-green-400 ml-3 mr-1"></div>
                            In
                          </h1>
                          <p className="flex items-center text-xs">
                            {track.punch_in_location}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <form onSubmit={handleAttendanceNote}>
                    <div className="w-full mt-3">
                      <textarea
                        value={attendanceNote}
                        onChange={(e) => {
                          setAttendanceNote(e.target.value);
                        }}
                        rows={3}
                        placeholder="Enter your message..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition mb-3"
                      ></textarea>
                      {attendanceNote && (
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-2.5 md:px-8 md:py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow text-sm md:text-base order-1 sm:order-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save Note
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}

          {showViewSelfieModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-2xl h-[40rem] overflow-hidden">
                <div className="bg-[#C62828] px-6 py-3 flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {selectedAttendance?.type === "out"
                      ? "Check Out"
                      : "Check In"}{" "}
                    Attendance Selfie
                  </h2>
                  <button
                    onClick={() => setShowViewSelfieModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="overflow-y-auto h-[40rem] py-16">
                  {selectedAttendanceImage ? (
                    <div className="flex items-center justify-center h-64 pt-36">
                      <img
                        src={selectedAttendanceImage}
                        alt="Attendance Image Not Available."
                        className=""
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                          Attendance Image Not Available
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTodayAttendanceModal;
