// import { useState, useEffect, useRef } from 'react';
// import Modal from '../ui/Modal';
// import Button from '../ui/Button';
// import attendanceApi from '../../lib/attendanceApi';
// import projectApi from '../../lib/projectApi';
// import { Clock, MapPin, AlertCircle, CheckCircle, Camera, Loader2, Briefcase } from 'lucide-react';
// import { toast } from 'sonner';

// interface MarkAttendanceModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
//   userId: number;
// }

// interface Coordinates {
//   latitude: number;
//   longitude: number;
// }

// interface Project {
//   id: string | number;
//   name: string;
//   description?: string;
//   location?: string;
//   start_date?: string;
//   end_date?: string;
//   status: string;
//   is_active?: boolean;
// }

// const OFFICE_LOCATION: Coordinates = {
//   latitude: 18.6055756,
//   longitude: 73.7842205
// };

// const MAX_DISTANCE_METERS = 500;

// function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
//   const R = 6371e3;
//   const φ1 = lat1 * Math.PI / 180;
//   const φ2 = lat2 * Math.PI / 180;
//   const Δφ = (lat2 - lat1) * Math.PI / 180;
//   const Δλ = (lon2 - lon1) * Math.PI / 180;

//   const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//     Math.cos(φ1) * Math.cos(φ2) *
//     Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   return R * c;
// }

// export default function MarkAttendanceModal({
//   isOpen,
//   onClose,
//   onSuccess,
//   userId
// }: MarkAttendanceModalProps) {
//   console.log("user id", userId)
//   const [loading, setLoading] = useState(false);
//   const [location, setLocation] = useState<string>('Office');
//   const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
//   const [locationError, setLocationError] = useState<string>('');
//   const [isWithinRange, setIsWithinRange] = useState(false);
//   const [distance, setDistance] = useState<number>(0);
//   const [showCamera, setShowCamera] = useState(false);
//   const [selfieData, setSelfieData] = useState<string | null>(null);
//   const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
//   const [fetchingProjects, setFetchingProjects] = useState(false);
//   const [selectedProjectId, setSelectedProjectId] = useState<string | number>('');
//   const [projectsError, setProjectsError] = useState<string>('');
//   const [attendanceStatus, setAttendanceStatus] = useState<{
//     can_punch_in: boolean;
//     can_punch_out: boolean;
//     last_punch_in?: string;
//     work_type?: string;
//   } | null>(null);

//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     if (isOpen) {
//       getCurrentLocation();
//       fetchProjects();
//       checkAttendanceStatus();
//     }
//     return () => {
//       if (cameraStream) {
//         cameraStream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, [isOpen]);

//   useEffect(() => {
//     if (!isOpen) {
//       setSelfieData(null);
//       setSelectedProjectId('');
//       setShowCamera(false);
//       setProjectsError('');
//       setAttendanceStatus(null);
//     }
//   }, [isOpen]);

//   const fetchProjects = async () => {
//     try {
//       setFetchingProjects(true);
//       setProjectsError('');

//       console.log('Fetching projects...');
//       const projectsData = await projectApi.getProjects();
//       console.log('Projects data received:', projectsData);

//       // Ensure it's an array
//       let projectsArray: Project[] = [];

//       if (Array.isArray(projectsData)) {
//         projectsArray = projectsData;
//       } else if (projectsData && typeof projectsData === 'object') {
//         // Try to extract array from response
//         if (Array.isArray(projectsData.data)) {
//           projectsArray = projectsData.data;
//         } else if (Array.isArray(projectsData.projects)) {
//           projectsArray = projectsData.projects;
//         } else if (Array.isArray(projectsData.results)) {
//           projectsArray = projectsData.results;
//         } else {
//           // Convert object values to array
//           projectsArray = Object.values(projectsData);
//         }
//       }

//       console.log('Processed projects array:', projectsArray);

//       // Filter active projects
//       const activeProjects = projectsArray.filter(project => {
//         if (!project || !project.name) return false;

//         // Include if active or status not specified
//         const isActive = project.is_active === undefined ||
//           project.is_active === true ||
//           project.status === 'active' ||
//           project.status === undefined;

//         return isActive;
//       });

//       console.log('Active projects:', activeProjects);

//       setProjects(activeProjects);
//       setFilteredProjects(activeProjects);

//       if (activeProjects.length === 0) {
//         setProjectsError('No active projects available');
//       }

//     } catch (error: any) {
//       console.error('Error fetching projects:', error);
//       setProjectsError('Unable to load projects. Please try again.');

//       setProjects(mockProjects);
//       setFilteredProjects(mockProjects);
//     } finally {
//       setFetchingProjects(false);
//     }
//   };

//   const checkAttendanceStatus = async () => {
//     try {
//       const response = await attendanceApi.checkAttendance(userId);
//       console.log('Attendance status response:', response);

//       if (response && response.success) {
//         setAttendanceStatus(response.data);
//         if (response.data.work_type) {
//           setLocation(response.data.work_type);
//         }
//       }
//     } catch (error) {
//       console.error('Error checking attendance status:', error);
//     }
//   };

//   const getCurrentLocation = () => {
//     if (!navigator.geolocation) {
//       setLocationError('Geolocation is not supported by your browser');
//       return;
//     }

//     setLoading(true);
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const coords: Coordinates = {
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude
//         };
//         setCurrentLocation(coords);

//         const dist = calculateDistance(
//           coords.latitude,
//           coords.longitude,
//           OFFICE_LOCATION.latitude,
//           OFFICE_LOCATION.longitude
//         );

//         setDistance(Math.round(dist));
//         setIsWithinRange(dist <= MAX_DISTANCE_METERS);
//         setLocationError('');
//         setLoading(false);
//       },
//       (error) => {
//         setLocationError('Unable to retrieve your location. Please enable location access.');
//         setLoading(false);
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0
//       }
//     );
//   };
//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: 'user' },
//         audio: false
//       });

//       setCameraStream(stream);

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.muted = true;
//         videoRef.current.playsInline = true;
//         await videoRef.current.play();   // <<< required
//       }

//       setShowCamera(true);
//     } catch (error) {
//       console.error('Error accessing camera:', error);
//       alert('Unable to access camera. Please grant camera permissions.');
//     }
//   };

//   const captureSelfie = () => {
//     if (canvasRef.current && videoRef.current) {
//       const context = canvasRef.current.getContext('2d');
//       if (context) {
//         canvasRef.current.width = videoRef.current.videoWidth;
//         canvasRef.current.height = videoRef.current.videoHeight;
//         context.drawImage(videoRef.current, 0, 0);
//         const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
//         setSelfieData(imageData);
//         setShowCamera(false);
//         if (cameraStream) {
//           cameraStream.getTracks().forEach(track => track.stop());
//         }
//       }
//     }
//   };

//   const retakeSelfie = () => {
//     setSelfieData(null);
//     startCamera();
//   };

//   const getProjectLocationText = () => {
//     if (selectedProjectId) {
//       const selectedProject = projects.find(project => project.id.toString() === selectedProjectId.toString());
//       if (selectedProject) {
//         return selectedProject.location || selectedProject.name;
//       }
//     }
//     return '';
//   };

//   const handlePunchIn = async () => {
//     if (!isWithinRange && location === 'Office') {
//       alert('You must be within 500 meters of the office to mark attendance');
//       return;
//     }

//     if (!selfieData) {
//       alert('Please capture your selfie first');
//       return;
//     }

//     // Validate selfie data
//     if (!selfieData.startsWith('data:image')) {
//       alert('Invalid selfie image. Please capture again.');
//       return;
//     }

//     if (!currentLocation) {
//       alert('Unable to get your current location');
//       return;
//     }

//     setLoading(true);
//     try {
//       const projectLocationText = getProjectLocationText();

//       const response: any = await attendanceApi.punchIn({
//         user_id: userId,
//         latitude: currentLocation.latitude,
//         longitude: currentLocation.longitude,
//         work_type: location.toLowerCase() as any,
//         project_id: selectedProjectId ? Number(selectedProjectId) : undefined,
//         project_location: projectLocationText || undefined,
//         selfie: selfieData
//       });

//       if (response.data.success) {
//         toast.success('Punch in successful!');
//         onSuccess();
//         onClose();
//       } else {
//         throw new Error(response.message || 'Failed to punch in');
//       }
//     } catch (error: any) {
//       console.error('Error punching in:', error);
//       toast.error(error.message || 'Failed to punch in');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePunchOut = async () => {
//     if (!isWithinRange && location === 'Office') {
//       alert('You must be within 500 meters of the office to punch out');
//       return;
//     }

//     if (!selfieData) {
//       alert('Please capture your selfie first');
//       return;
//     }

//     if (!currentLocation) {
//       alert('Unable to get your current location');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response: any = await attendanceApi.punchOut({
//         user_id: userId,
//         latitude: currentLocation.latitude,
//         longitude: currentLocation.longitude,
//         selfie: selfieData
//       });

//       if (response.data.success) {
//         toast.success('Punch out successful!');
//         onSuccess();
//         onClose();
//       } else {
//         throw new Error(response.message || 'Failed to punch out');
//       }
//     } catch (error: any) {
//       console.error('Error punching out:', error);
//       toast.error(error.message || 'Failed to punch out');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isPunchInDisabled = () => {
//     return loading ||
//       (location === 'Office' && !isWithinRange) ||
//       !currentLocation ||
//       !selfieData ||
//       (attendanceStatus && !attendanceStatus.can_punch_in);
//   };

//   const isPunchOutDisabled = () => {
//     return loading ||
//       (location === 'Office' && !isWithinRange) ||
//       !currentLocation ||
//       !selfieData ||
//       (attendanceStatus && !attendanceStatus.can_punch_out);
//   };

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} title="Mark Attendance" size="lg">
//       <div className="space-y-4">
//         <div className="text-center py-4">
//           <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
//             <Clock className="h-8 w-8 text-red-600" />
//           </div>
//           <h3 className="text-xl font-bold text-slate-900 mb-1">
//             {new Date().toLocaleTimeString('en-IN', {
//               hour: '2-digit',
//               minute: '2-digit',
//               hour12: true
//             })}
//           </h3>
//           <p className="text-sm text-slate-600">
//             {new Date().toLocaleDateString('en-IN', {
//               weekday: 'long',
//               day: 'numeric',
//               month: 'short',
//               year: 'numeric'
//             })}
//           </p>

//           {attendanceStatus && (
//             <div className="mt-3 p-2 bg-blue-50 rounded-lg">
//               <p className="text-sm text-blue-700">
//                 {attendanceStatus.can_punch_in ? '✅ You can punch in now' : '✅ Already punched in'}
//                 {attendanceStatus.last_punch_in && (
//                   <span className="block text-xs mt-1">
//                     Last punch in: {new Date(attendanceStatus.last_punch_in).toLocaleTimeString()}
//                   </span>
//                 )}
//               </p>
//             </div>
//           )}
//         </div>

//         {locationError ? (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
//             <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
//             <div>
//               <p className="text-sm font-medium text-red-800">Location Access Required</p>
//               <p className="text-xs text-red-600 mt-1">{locationError}</p>
//               <button
//                 onClick={getCurrentLocation}
//                 className="text-xs text-red-700 underline mt-2"
//                 disabled={loading}
//               >
//                 {loading ? 'Getting location...' : 'Try Again'}
//               </button>
//             </div>
//           </div>
//         ) : currentLocation ? (
//           <div className={`border rounded-lg p-3 ${isWithinRange ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
//             <div className="flex items-start gap-2">
//               {isWithinRange ? (
//                 <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
//               ) : (
//                 <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
//               )}
//               <div className="flex-1">
//                 <p className={`text-sm font-medium ${isWithinRange ? 'text-green-800' : 'text-red-800'}`}>
//                   {isWithinRange ? 'Within Office Range' : 'Outside Office Range'}
//                 </p>
//                 <p className={`text-xs mt-1 ${isWithinRange ? 'text-green-600' : 'text-red-600'}`}>
//                   Distance from office: {distance}m
//                   {!isWithinRange && ` (Max allowed: ${MAX_DISTANCE_METERS}m)`}
//                 </p>
//                 {currentLocation && (
//                   <p className="text-xs text-slate-600 mt-1">
//                     Lat: {currentLocation.latitude.toFixed(6)}, Long: {currentLocation.longitude.toFixed(6)}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
//             <p className="text-sm text-blue-800">Getting your location...</p>
//           </div>
//         )}

//         <div className="grid grid-cols-2 gap-3">
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-1.5">
//               <MapPin className="h-4 w-4 inline mr-1" />
//               Work Location
//             </label>
//             <select
//               className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
//               value={location}
//               onChange={(e) => setLocation(e.target.value)}
//               disabled={loading}
//             >
//               <option value="Office">Office</option>
//               <option value="Home">Work From Home</option>
//               <option value="Client Site">Client Site</option>
//               <option value="Field">Field Work</option>
//             </select>
//           </div>

//           <div>
//             <div className="flex items-center justify-between mb-1.5">
//               <label className="block text-sm font-medium text-slate-700">
//                 <Briefcase className="h-4 w-4 inline mr-1" />
//                 Project
//               </label>
//               {projects.length > 0 && (
//                 <span className="text-xs text-slate-500">
//                   {filteredProjects.length} available
//                 </span>
//               )}
//             </div>

//             {fetchingProjects ? (
//               <div className="flex items-center justify-center p-3 border border-slate-300 rounded-lg bg-slate-50">
//                 <Loader2 className="h-4 w-4 mr-2 animate-spin text-slate-400" />
//                 <span className="text-sm text-slate-500">Loading projects...</span>
//               </div>
//             ) : (
//               <>
//                 <select
//                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
//                     value={selectedProjectId}
//                     onChange={(e) => setSelectedProjectId(e.target.value)}
//                     disabled={loading}
//                   >
//                     <option value="">Select a project (Optional)</option>
//                     {filteredProjects.length === 0 ? (
//                       <option value="" disabled>No projects available</option>
//                     ) : (
//                       filteredProjects.map((project) => (
//                         <option key={project.id} value={project.id}>
//                           {project.name} {project.location ? `- ${project.location}` : ''}
//                         </option>
//                       ))
//                     )}
//                   </select>

//                   {projectsError && (
//                     <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
//                       <p className="font-medium">{projectsError}</p>
//                       <p className="mt-1">Using sample projects for demonstration.</p>
//                     </div>
//                   )}

//                   {selectedProjectId && (
//                     <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
//                       <p className="font-medium">Selected Project:</p>
//                       <p>{getProjectLocationText()}</p>
//                     </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-slate-700 mb-2">
//             <Camera className="h-4 w-4 inline mr-1" />
//             Capture Selfie
//           </label>
//           {showCamera ? (
//             <div className="space-y-3">
//               <div className="relative bg-black rounded-lg overflow-hidden">
//                 <video
//                   ref={videoRef}
//                   autoPlay
//                   playsInline
//                   className="w-full h-64 object-cover"
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <Button onClick={captureSelfie} className="flex-1">
//                   <Camera className="h-4 w-4 mr-2" />
//                   Capture
//                 </Button>
//                 <Button
//                   variant="secondary"
//                   onClick={() => {
//                     setShowCamera(false);
//                     if (cameraStream) {
//                       cameraStream.getTracks().forEach(track => track.stop());
//                     }
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               </div>
//             </div>
//           ) : selfieData ? (
//             <div className="space-y-3">
//               <div className="relative bg-slate-100 rounded-lg overflow-hidden">
//                   <img
//                     src={selfieData}
//                     alt="Captured selfie"
//                     className="w-full h-64 object-cover"
//                   />
//               </div>
//               <Button onClick={retakeSelfie} variant="secondary" className="w-full">
//                 <Camera className="h-4 w-4 mr-2" />
//                 Retake Selfie
//               </Button>
//             </div>
//           ) : (
//                 <Button onClick={() => { setShowCamera(true); startCamera() }} variant="secondary" className="w-full" disabled={loading}>
//               <Camera className="h-4 w-4 mr-2" />
//               Open Camera
//             </Button>
//           )}

//           <canvas ref={canvasRef} style={{ display: 'none' }} />
//         </div>

//         <div className="grid grid-cols-2 gap-3">
//           <Button
//             onClick={handlePunchIn}
//             disabled={isPunchInDisabled()}
//             className="w-full"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                 Processing...
//               </>
//             ) : (
//               'Punch In'
//             )}
//           </Button>
//           <Button
//             onClick={handlePunchOut}
//             disabled={isPunchOutDisabled()}
//             variant="secondary"
//             className="w-full"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                 Processing...
//               </>
//             ) : (
//               'Punch Out'
//             )}
//           </Button>
//         </div>

//         <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600">
//           <p className="font-medium mb-1.5">Important:</p>
//           <ul className="list-disc list-inside space-y-0.5">
//             <li>Must be within {MAX_DISTANCE_METERS}m of office location for office work</li>
//             <li>Selfie capture is mandatory for attendance</li>
//             <li>Punch in before 9:15 AM to avoid late marking</li>
//             <li>Remember to punch out at end of day</li>
//             <li>Project selection is optional but recommended</li>
//           </ul>
//         </div>
//       </div>
//     </Modal>
//   );
// }