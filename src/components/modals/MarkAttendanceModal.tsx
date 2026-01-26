import { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
// import { attendanceAPI } from '../../api/attendance.api';
import projectApi from '../../lib/projectApi'; // Import project API
import { Clock, MapPin, AlertCircle, CheckCircle, Camera, RefreshCw } from 'lucide-react';

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Project interface (from projectApi.ts)
interface Project {
  id: string | number;
  name: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  is_active?: boolean;
}

const OFFICE_LOCATION: Coordinates = {
  latitude: 18.6055756,
  longitude: 73.7842205
};

const MAX_DISTANCE_METERS = 500;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function MarkAttendanceModal({ isOpen, onClose, onSuccess }: MarkAttendanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<string>('Office');
  const [projectLocation, setProjectLocation] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [distance, setDistance] = useState<number>(0);
  const [showCamera, setShowCamera] = useState(false);
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [fetchingProjects, setFetchingProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | number>('');
  const [projectsError, setProjectsError] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      getCurrentLocation();
      fetchProjects();
    }
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelfieData(null);
      setSelectedProjectId('');
      setProjectLocation('');
      setShowCamera(false);
      setProjectsError('');
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    try {
      setFetchingProjects(true);
      setProjectsError('');

      const projectsData = await projectApi.getProjects();

      // Handle different response formats
      let projectsArray: Project[] = [];

      if (Array.isArray(projectsData)) {
        projectsArray = projectsData;
      } else if (projectsData && typeof projectsData === 'object') {
        // Check if data is nested in a property
        if (Array.isArray(projectsData.data)) {
          projectsArray = projectsData.data;
        } else if (Array.isArray(projectsData.projects)) {
          projectsArray = projectsData.projects;
        } else if (Array.isArray(projectsData.results)) {
          projectsArray = projectsData.results;
        } else {
          // Try to convert object to array
          projectsArray = Object.values(projectsData);
        }
      }

      // Filter active projects (only if is_active property exists)
      const activeProjects = projectsArray.filter(project =>
        project && project.name && (project.is_active === undefined || project.is_active === true)
      );

      setProjects(activeProjects);

      if (activeProjects.length === 0) {
        setProjectsError('No active projects found');
      }

    } catch (error: any) {
      console.error('Error fetching projects:', error);
      setProjects(mockProjects);
      setProjectsError('Using demo projects. Check API connection.');

    } finally {
      setFetchingProjects(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCurrentLocation(coords);

        const dist = calculateDistance(
          coords.latitude,
          coords.longitude,
          OFFICE_LOCATION.latitude,
          OFFICE_LOCATION.longitude
        );

        setDistance(Math.round(dist));
        setIsWithinRange(dist <= MAX_DISTANCE_METERS);
        setLocationError('');
        setLoading(false);
      },
      (error) => {
        setLocationError('Unable to retrieve your location. Please enable location access.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please grant camera permissions.');
    }
  };

  const captureSelfie = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setSelfieData(imageData);
        setShowCamera(false);
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const retakeSelfie = () => {
    setSelfieData(null);
    startCamera();
  };

  const uploadSelfie = async (base64Data: string): Promise<string | null> => {
    try {
      // Here you would upload to your server
      // For now, return base64 data
      return base64Data;
    } catch (error) {
      console.error('Error uploading selfie:', error);
      return null;
    }
  };

  const getProjectLocationText = () => {
    if (selectedProjectId) {
      const selectedProject = projects.find(project => project.id === selectedProjectId);
      if (selectedProject) {
        return selectedProject.location || selectedProject.name;
      }
    }
    return projectLocation;
  };

  const handlePunchIn = async () => {
    if (!isWithinRange) {
      alert('You must be within 500 meters of the office to mark attendance');
      return;
    }

    if (!selfieData) {
      alert('Please capture your selfie first');
      return;
    }

    setLoading(true);
    try {
      const selfieUrl = await uploadSelfie(selfieData);

      // Get project location text
      const projectLocationText = getProjectLocationText();

      // For now, simulate API call
      console.log('Punch In Data:', {
        latitude: currentLocation?.latitude || 0,
        longitude: currentLocation?.longitude || 0,
        selfie_url: selfieUrl,
        location: location,
        project_location: projectLocationText || null,
        project_id: selectedProjectId || null,
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Punch in successful!');
      setSelfieData(null);
      setSelectedProjectId('');
      setProjectLocation('');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error punching in:', error);
      alert(error.message || 'Failed to punch in');
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    if (!isWithinRange) {
      alert('You must be within 500 meters of the office to punch out');
      return;
    }

    if (!selfieData) {
      alert('Please capture your selfie first');
      return;
    }

    setLoading(true);
    try {
      const selfieUrl = await uploadSelfie(selfieData);

      // Uncomment when attendanceAPI is available
      // await attendanceAPI.punchOut({
      //   latitude: currentLocation?.latitude || 0,
      //   longitude: currentLocation?.longitude || 0,
      //   selfie_url: selfieUrl,
      // });

      // For now, simulate API call
      console.log('Punch Out Data:', {
        latitude: currentLocation?.latitude || 0,
        longitude: currentLocation?.longitude || 0,
        selfie_url: selfieUrl,
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Punch out successful!');
      setSelfieData(null);
      setSelectedProjectId('');
      setProjectLocation('');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error punching out:', error);
      alert(error.message || 'Failed to punch out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark Attendance" size="lg">
      <div className="space-y-4">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">
            {new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </h3>
          <p className="text-sm text-slate-600">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </p>
        </div>

        {locationError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Location Access Required</p>
              <p className="text-xs text-red-600 mt-1">{locationError}</p>
              <button
                onClick={getCurrentLocation}
                className="text-xs text-red-700 underline mt-2"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : currentLocation ? (
          <div className={`border rounded-lg p-3 ${isWithinRange ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-2">
              {isWithinRange ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${isWithinRange ? 'text-green-800' : 'text-red-800'}`}>
                  {isWithinRange ? 'Within Office Range' : 'Outside Office Range'}
                </p>
                <p className={`text-xs mt-1 ${isWithinRange ? 'text-green-600' : 'text-red-600'}`}>
                  Distance from office: {distance}m
                  {!isWithinRange && ` (Max allowed: ${MAX_DISTANCE_METERS}m)`}
                </p>
                {currentLocation && (
                  <p className="text-xs text-slate-600 mt-1">
                    Lat: {currentLocation.latitude.toFixed(6)}, Long: {currentLocation.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-sm text-blue-800">Getting your location...</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <MapPin className="h-4 w-4 inline mr-1" />
              Work Location
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="Office">Office</option>
              <option value="Home">Work From Home</option>
              <option value="Client Site">Client Site</option>
              <option value="Field">Field Work</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <MapPin className="h-4 w-4 inline mr-1" />
              Project Location
            </label>

            {/* Projects Error Message */}
            {projectsError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">Note</p>
                    <p className="text-xs text-yellow-600 mt-1">{projectsError}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={fetchProjects}
                        className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Reload Projects
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Project Select Dropdown */}
            <div className="mb-2">
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm mb-2"
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setProjectLocation('');
                }}
                disabled={fetchingProjects}
              >
                {projects.length === 0 && !fetchingProjects ? (
                  <option value="" disabled>No projects available</option>
                ) : (
                  projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} {project.location ? `- ${project.location}` : ''}
                    </option>
                  ))
                )}
              </select>

              {fetchingProjects && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                  Loading projects...
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Camera className="h-4 w-4 inline mr-1" />
            Capture Selfie
          </label>

          {showCamera ? (
            <div className="space-y-3">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={captureSelfie} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCamera(false);
                    if (cameraStream) {
                      cameraStream.getTracks().forEach(track => track.stop());
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : selfieData ? (
            <div className="space-y-3">
              <div className="relative bg-slate-100 rounded-lg overflow-hidden">
                <img src={selfieData} alt="Captured selfie" className="w-full h-64 object-cover" />
              </div>
              <Button onClick={retakeSelfie} variant="secondary" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Retake Selfie
              </Button>
            </div>
          ) : (
            <Button onClick={startCamera} variant="secondary" className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Open Camera
            </Button>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handlePunchIn}
            disabled={loading || !isWithinRange || !currentLocation || !selfieData}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Punch In'}
          </Button>
          <Button
            onClick={handlePunchOut}
            disabled={loading || !isWithinRange || !currentLocation || !selfieData}
            variant="secondary"
            className="w-full"
          >
            {loading ? 'Processing...' : 'Punch Out'}
          </Button>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600">
          <p className="font-medium mb-1.5">Important:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Must be within {MAX_DISTANCE_METERS}m of office location</li>
            <li>Selfie capture is mandatory for attendance</li>
            <li>Punch in before 9:15 AM to avoid late marking</li>
            <li>Remember to punch out at end of day</li>
            <li>Select project from dropdown or enter manually</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}