import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Loader2, MapPin, RefreshCw, SwitchCamera } from "lucide-react";
import attendanceApi from "../../lib/attendanceApi";
import { useAuth } from "../../contexts/AuthContext";
import securityApi from "../../lib/securityApi";
import HrmsEmployeesApi from "../../lib/employeeApi";
import companyApi from "../../lib/companyApi";
import { toast } from "sonner";

// Types
export enum PunchStatus {
  IN = "In",
  OUT = "Out",
}

export type FacingMode = "user" | "environment";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface AttendanceRecord {
  id: string;
  timestamp: Date;
  type: PunchStatus;
  location: Coordinates;
  address: string;
  selfie: string;
  workType: string;
  shiftInfo?: string;
}

export interface PunchData {
  user_id: number;
  latitude: number;
  longitude: number;
  work_type?: string;
  selfie: string;
  project_id?: number;
}

export interface AttendanceStatus {
  can_punch_in: boolean;
  can_punch_out: boolean;
  current_cycle: "in" | "out";
  last_punch_in?: string;
  last_punch_out?: string;
  work_type?: string;
}

export interface AttendanceLog {
  id: string;
  type: "in" | "out";
  timestamp: string;
  latitude: number;
  longitude: number;
  work_type: string;
  address: string;
  selfie: string;
  shift_info?: string;
}

// Geo utilities
export const OFFICE_LOCATION = {
  latitude: 18.6055756,
  longitude: 73.7842205,
};

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Mock service
const STORAGE_KEY = "attendance_dynamic_db";

const getMockData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) return JSON.parse(data);

  return {
    status: {
      can_punch_in: true,
      can_punch_out: false,
      current_cycle: "out",
    },
    history: [],
  };
};

const saveMockData = (data: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const attendanceService = {
  async getStatus(userId: number): Promise<AttendanceStatus> {
    await new Promise((r) => setTimeout(r, 200));
    return getMockData().status;
  },

  async getHistory(userId: number): Promise<AttendanceLog[]> {
    await new Promise((r) => setTimeout(r, 200));
    const data = getMockData();
    return [...data.history].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  },

  async markAttendance(
    data: PunchData,
    type: "in" | "out",
  ): Promise<{ success: boolean; message?: string; data: any }> {
    await new Promise((r) => setTimeout(r, 600));
    const mock = getMockData();

    const newLog: AttendanceLog = {
      id: Math.random().toString(36).substr(2, 9),
      type: type,
      timestamp: new Date().toISOString(),
      latitude: data.latitude,
      longitude: data.longitude,
      work_type: data.work_type || "office",
      address:
        "BLOCK-G, GK ROSE E MEHAR-1, Survey No. 48/4-10, नखाते वस्ती, मधुबन कॉलनी, रहाटणी, पिंपरी चिंचवड, पुणे, महाराष्ट्र 411017, India",
      selfie: data.selfie,
      shift_info: "No Shift",
    };

    const newStatus: AttendanceStatus = {
      can_punch_in: type === "out",
      can_punch_out: type === "in",
      last_punch_in:
        type === "in" ? newLog.timestamp : mock.status.last_punch_in,
      last_punch_out:
        type === "out" ? newLog.timestamp : mock.status.last_punch_out,
      current_cycle: type,
      work_type: data.work_type,
    };

    mock.status = newStatus;
    mock.history.push(newLog);
    saveMockData(mock);

    return {
      success: true,
      message: `Punch ${type} successful`,
      data: newStatus,
    };
  },
};

// CameraView Component
interface CameraViewProps {
  canvasRef: any;
  videoRef: any;
  facingMode: FacingMode;
  isOpen: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  canvasRef,
  facingMode,
  isOpen,
}) => {
  // const videoRef = useRef<HTMLVideoElement>(null);
  // const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // ⛔ modal closed → stop camera immediately
    if (!isOpen) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return;
    }

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: 720, height: 720 },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    }

    setupCamera();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [facingMode, isOpen]);

  return (
    <div className="w-full h-full relative group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${
          facingMode === "user" ? "scale-x-[-1]" : ""
        }`}
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

// AttendanceTracker Component
interface AttendanceTrackerProps {
  isOpen: boolean;
  currentStatus: PunchStatus;
  onSuccess: () => void;
  lastRecordSelfie?: string;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  isOpen,
  currentStatus,
  onSuccess,
  lastRecordSelfie,
}) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [attendanceBranch, setAttendanceBranch] = useState<any>();
  const [showCamera, setShowCamera] = useState(true);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const { user } = useAuth();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const checkLocation = useCallback(async () => {
    const securityRes = await securityApi.getPunchRadiusSettings();
    const employeeData = await HrmsEmployeesApi.getEmployeeByEmail(user.email);

    const MAX_DISTANCE_METERS = Number(securityRes.max_punch_distance_meters);

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };

        setLocation(coords);

        let nearestBranch: any = null;
        let minDistance = Infinity;

        for (const branchId of employeeData.attendence_location) {
          const [empBranch] =
            await companyApi.getCompanyLocationsById(branchId);

          const d = calculateDistance(
            Number(coords.latitude),
            Number(coords.longitude),
            Number(empBranch.latitude),
            Number(empBranch.longitude),
          );
          console.log(
            Number(coords.latitude),
            Number(coords.longitude),
            Number(empBranch.latitude),
            Number(empBranch.longitude),
            d,
          );

          console.log(d <= MAX_DISTANCE_METERS, d < minDistance);

          if (d <= MAX_DISTANCE_METERS && d < minDistance) {
            minDistance = d;
            nearestBranch = empBranch;
          }
        }

        if (nearestBranch) {
          console.log("branch", nearestBranch);
          setAttendanceBranch(nearestBranch);
          setDistance(Math.round(minDistance));
          setIsWithinRange(true);
        } else {
          setAttendanceBranch({});
          setDistance(null);
          setIsWithinRange(false);
        }
      },
      (err) => console.error("Location error", err),
      { enableHighAccuracy: true },
    );
  }, []);

  // const checkLocation = useCallback(async () => {
  //   const securityRes = await securityApi.getPunchRadiusSettings();
  //   const employeeData = await HrmsEmployeesApi.getEmployeeByEmail(user.email);
  //   const MAX_DISTANCE_METERS = securityRes.max_punch_distance_meters;
  //   for (let i = 0; employeeData.attendence_location.length > i; i++) {
  //     const [empBranch] = await companyApi.getCompanyLocationsById(
  //       employeeData.attendence_location[i],
  //     );

  //     if (!navigator.geolocation) return;

  //     navigator.geolocation.getCurrentPosition(
  //       (pos) => {
  //         const coords = {
  //           latitude: pos.coords.latitude,
  //           longitude: pos.coords.longitude,
  //         };

  //         setLocation(coords);

  //         const d = calculateDistance(
  //           coords.latitude,
  //           coords.longitude,
  //           empBranch.latitude,
  //           empBranch.longitude,
  //         );
  //         console.log(d <= MAX_DISTANCE_METERS);
  //         console.log("selected branch", empBranch);
  //         setDistance(Math.round(d));
  //         setAttendanceBranch(d <= MAX_DISTANCE_METERS ? empBranch : {});
  //         setIsWithinRange(d <= MAX_DISTANCE_METERS);
  //       },
  //       (err) => console.error("Location error", err),
  //       { enableHighAccuracy: true },
  //     );
  //   }
  // }, []);

  useEffect(() => {
    checkLocation();
    const interval = setInterval(checkLocation, 30000);
    return () => clearInterval(interval);
  }, [checkLocation]);

  const toggleCamera = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setSelfie(null);
    setShowCamera(true);
  };

  const handleSubmit = async () => {
    if (!selfie) {
      toast.error("Please capture a photo first!");
      return;
    }
    if (!location) {
      toast.error("Waiting for GPS coordinates...");
      return;
    }

    setLoading(true);
    try {
      const type = currentStatus === PunchStatus.IN ? "in" : "out";
      const payload = {
        user_id: user.id,
        latitude: location.latitude,
        longitude: location.longitude,
        selfie: selfie, // base64 string
        punch_in_address:
          currentStatus === PunchStatus.IN ? attendanceBranch.address : null,
        punch_out_address:
          currentStatus === PunchStatus.OUT ? attendanceBranch.address : null,
      };
      console.log("address : ", attendanceBranch.address);
      console.log("in address : ", payload.punch_in_address);
      console.log("out address : ", payload.punch_out_address);
      console.log("this is my payload : ", payload);
      let result: any;
      if (type === "in") {
        result = await attendanceApi.punchIn(payload);
      } else {
        result = await attendanceApi.punchOut(payload);
      }

      if (result.data.success) {
        onSuccess();
        setSelfie(null);
        setShowCamera(true);
      }
    } catch (err) {
      toast.error("Submission failed. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelfie(null);
      setShowCamera(true);
    }
  }, [isOpen]);

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    if (facingMode === "user") {
      ctx.translate(canvasRef.current.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(videoRef.current, 0, 0);
    setSelfie(canvasRef.current.toDataURL("image/jpeg", 0.8));
    setShowCamera(false);
  };

  return (
    <div className="w-full flex flex-col items-center pt-6">
      <div className="relative w-72 h-72 rounded-full border-4 border-slate-50 overflow-hidden shadow-2xl bg-slate-900 mb-8 ">
        {showCamera && !selfie ? (
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            facingMode={facingMode}
            isOpen={isOpen}
          />
        ) : (
          <div className="w-full h-full relative">
            <img
              src={
                selfie ||
                lastRecordSelfie ||
                "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop"
              }
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <button
          onClick={toggleCamera}
          className="absolute top-8 right-8 text-white/70 hover:text-white p-2 bg-black/20 rounded-full backdrop-blur-sm transition-colors"
        >
          <SwitchCamera size={20} />
        </button>
      </div>

      <div className="w-full px-4">
        {!selfie && (
          <button
            onClick={capture}
            className={`w-full py-5 text-white font-black text-xl shadow-lg transition-all active:scale-[0.98] rounded-2xl ${
              currentStatus === PunchStatus.IN ? "bg-[#12e5b1]" : "bg-[#f14641]"
            } disabled:opacity-50`}
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : currentStatus === PunchStatus.IN ? (
              "Punch In"
            ) : (
              "Punch Out"
            )}
          </button>
        )}
        {selfie && (
          <div className="flex  space-x-3">
            <button
              onClick={handleSubmit}
              disabled={
                loading || (!selfie && currentStatus === PunchStatus.OUT)
              }
              className={`w-full py-5 bg-green-500 text-white  font-black text-xl shadow-lg transition-all active:scale-[0.98] rounded-2xl  disabled:opacity-50`}
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Confirm"
              )}
            </button>
            <button
              onClick={() => {
                setSelfie(null);
                setShowCamera(true);
              }}
              disabled={
                loading || (!selfie && currentStatus === PunchStatus.OUT)
              }
              className={`w-full py-5  bg-slate-500 text-white font-black text-xl shadow-lg transition-all active:scale-[0.98] rounded-2xl  disabled:opacity-50`}
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Retake"
              )}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center gap-1">
        <div
          className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.1em] ${isWithinRange ? "text-slate-300" : "text-red-500"}`}
        >
          <MapPin size={10} />
          {isWithinRange ? `Secure Zone (${distance}m)` : "Outside Zone"}
        </div>
      </div>
    </div>
  );
};

// Main Modal Component
interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [lastUserAttendance, setLastUserAttendance] = useState<any>();

  const [currentStatus, setCurrentStatus] = useState<PunchStatus>(
    PunchStatus.OUT,
  );

  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const lastAttendance: any =
        await attendanceApi.getUserLastAttendance(userId);
      console.log("last attendance data : ", lastAttendance);

      if (lastAttendance.data.data) {
        setCurrentStatus(
          lastAttendance.data.data.punch_out_time
            ? PunchStatus.IN
            : PunchStatus.OUT,
        );
      } else {
        setCurrentStatus(PunchStatus.IN);
      }

      setLastUserAttendance(lastAttendance);
    } catch (err) {
      console.error("Data loading failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handlePunchSuccess = () => {
    loadData();
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Mark Attendance
              </h2>
              <p className="text-sm text-slate-500">
                Take a selfie to punch{" "}
                {currentStatus === PunchStatus.OUT ? "in" : "out"}
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-300">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-200" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Loading...
                </span>
              </div>
            ) : (
              <>
                <AttendanceTracker
                  isOpen={isOpen}
                  currentStatus={currentStatus}
                  onSuccess={handlePunchSuccess}
                  lastRecordSelfie={records[0]?.selfie}
                />
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>Ensure you're within office premises</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendanceModal;
