// import { useEffect, useState } from "react";
// import { toast } from "sonner";
// import projectApi from "../../lib/projectApi";
// import logo from "../../assets/images/Nayash Logo.png";
// import { Building, Calendar, Locate, MapPin } from "lucide-react";
// import AreaTasksApi from "../../lib/areaTasksApi";

// const TaskProject = ({
//   setSelectedProjectId,
// }: {
//   setSelectedProjectId: React.Dispatch<React.SetStateAction<number | null>>;
// }) => {
//   const [projects, setProjects] = useState<any>([]);

//   const fetchProjects = async () => {
//     try {
//       const projectRes: any = await projectApi.getProjects();
//       // const areaTasks: any = await AreaTasksApi.getAreaTasks();

//       const projects = Array.isArray(projectRes.data) ? projectRes.data : [];

//       // const tasks = Array.isArray(areaTasks.data) ? areaTasks.data : [];

//       // 🔹 Build project-wise task status counts
//       // const taskCountMap = new Map<number, any>();

//       // tasks.forEach((task: any) => {
//       //   if (!taskCountMap.has(task.project_id)) {
//       //     taskCountMap.set(task.project_id, {
//       //       total_tasks: 0,
//       //       not_started: 0,
//       //       in_progress: 0,
//       //       completed: 0,
//       //       delayed: 0,
//       //     });
//       //   }

//       //   const counter = taskCountMap.get(task.project_id);

//       //   counter.total_tasks++;

//       //   if (task.status === "not_started") counter.not_started++;
//       //   if (task.status === "in_progress") counter.in_progress++;
//       //   if (task.status === "completed") counter.completed++;
//       //   if (task.status === "delayed") counter.delayed++;
//       // });

//       // 🔹 Merge counts into projects
//       // const updatedProjects = projects.map((project: any) => {
//       //   const taskSummary = taskCountMap.get(project.id) || {
//       //     total_tasks: 0,
//       //     not_started: 0,
//       //     in_progress: 0,
//       //     completed: 0,
//       //     delayed: 0,
//       //   };

//       //   return {
//       //     ...project,
//       //     task_summary: taskSummary,
//       //   };
//       // });

//       console.log("projects with task summary", projects);
//       setProjects(projects);
//     } catch (error) {
//       console.log(error);
//       toast.error("Error while fetching projects.");
//     }
//   };

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   const getStatusColor = (status: string) => {
//     const styles: Record<string, string> = {
//       pending: "bg-yellow-100 text-yellow-700",
//       completed: "bg-green-100 text-green-700",
//       approved: "bg-green-100 text-green-700",
//       rejected: "bg-red-100 text-red-700",
//       processing: "bg-blue-100 text-blue-700",
//     };
//     return styles[status.toLowerCase()] || "bg-gray-100 text-gray-700";
//   };

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
//       {projects.map((project: any) => {
//         return (
//           <button
//             onClick={() => {
//               setSelectedProjectId(project.id);
//             }}
//             className="text-start bg-white shadow-xl p-3 rounded-lg hover:scale-[1.02] transition ease-in-out border-1 border-slate-300"
//           >
//             <div className="h-[30vh] flex items-center rounded-lg border border-slate-400 mb-3 overflow-hidden">
//               <img
//                 src={logo}
//                 alt=""
//                 className="select-none hover:scale-[1.03] transition ease-in-out"
//               />
//             </div>
//             <div>
//               <h1 className=" font-semibold mb-1 flex items-center">
//                 <Building className="w-5 h-5" />
//                 <span className="text-lg mr-3">{project.name}</span>{" "}
//                 <span
//                   className={`${getStatusColor(project.status)} text-[0.8rem]  px-3 py-1 rounded-full`}
//                 >
//                   {project.status.toUpperCase()}
//                 </span>
//               </h1>
//               <address className="mb-2 text-start flex items-start text-[0.8rem]">
//                 <MapPin className="w-4 h-4 mr-1" />
//                 {project.location}
//               </address>
//               <div className="flex justify-between">
//                 <h1 className="text-[0.9rem] flex items-center">
//                   <Calendar className="w-4 h-4 mr-1" />
//                   <span className="font-semibold">Start Date :</span>{" "}
//                   {new Date(project.start_date).toLocaleDateString()}
//                 </h1>
//                 <h1 className="text-[0.9rem] flex items-center">
//                   <Calendar className="w-4 h-4 mr-1" />{" "}
//                   <span className="font-semibold">End Date :</span>{" "}
//                   {new Date(project.end_date).toLocaleDateString()}
//                 </h1>
//               </div>
//               {/* <div className="grid grid-cols-3 mt-5 gap-2 border-t border-slate-300 pt-3">
//                 <div
//                   className={`font-semibold  text-[0.8rem]  px-3 py-1 rounded-full`}
//                 >
//                   Total Tasks : {project.task_summary.total_tasks}
//                 </div>
//                 <div
//                   className={`font-semibold  text-[0.8rem]  px-3 py-1 rounded-full`}
//                 >
//                   Pending : {project.task_summary.not_started}
//                 </div>
//                 <div
//                   className={` font-semibold  text-[0.8rem]  px-3 py-1 rounded-full`}
//                 >
//                   In Progress : {project.task_summary.in_progress}
//                 </div>
//                 <div
//                   className={`font-semibold  text-[0.8rem]  px-3 py-1 rounded-full`}
//                 >
//                   Completed : {project.task_summary.completed}
//                 </div>
//                 <div
//                   className={`font-semibold  text-[0.8rem]  px-3 py-1 rounded-full`}
//                 >
//                   Delayed : {project.task_summary.delayed}
//                 </div>
//               </div> */}
//             </div>
//           </button>
//         );
//       })}
//     </div>
//   );
// };

// export default TaskProject;


import { useEffect, useState } from "react";
import { toast } from "sonner";
import projectApi from "../../lib/projectApi";
import logo from "../../assets/images/Nayash Logo.png";
import { Building, Calendar, MapPin, ArrowRight } from "lucide-react";

const TaskProject = ({
  setSelectedProjectId,
}: {
  setSelectedProjectId: React.Dispatch<React.SetStateAction<number | null>>;
}) => {
  const [projects, setProjects] = useState<any>([]);

  const fetchProjects = async () => {
    try {
      const projectRes: any = await projectApi.getProjects();
      const projects = Array.isArray(projectRes.data) ? projectRes.data : [];
      console.log("projects with task summary", projects);
      setProjects(projects);
    } catch (error) {
      console.log(error);
      toast.error("Error while fetching projects.");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getStatusColor = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-gradient-to-r from-red-400 to-red-500 text-white",
      completed: "bg-gradient-to-r from-green-400 to-green-500 text-white",
      approved: "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white",
      rejected: "bg-gradient-to-r from-red-400 to-red-500 text-white",
      processing: "bg-gradient-to-r from-blue-400 to-blue-500 text-white",
    };
    return styles[status.toLowerCase()] || "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: "⏳",
      completed: "✅",
      approved: "✓",
      rejected: "✗",
      processing: "⚙️",
    };
    return icons[status.toLowerCase()] || "•";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-2 md:p-4">
      {projects.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <Building className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">No projects found</p>
          <p className="text-gray-400 text-sm mt-2">No projects available at the moment</p>
        </div>
      ) : (
        projects.map((project: any) => {
          return (
            <button
              key={project.id}
              onClick={() => {
                setSelectedProjectId(project.id);
              }}
              className="group relative text-start bg-white shadow-lg hover:shadow-2xl rounded-2xl 
              overflow-hidden transition-all duration-300 ease-out
              hover:scale-[1.02] hover:-translate-y-1
              border border-gray-200 hover:border-[#C62828]/30
              focus:outline-none focus:ring-2 focus:ring-[#C62828]/50"
            >
              {/* Status Badge - Top Right */}
              <div className="absolute top-3 right-3 z-10">
                <span
                  className={`${getStatusColor(project.status)} 
                  text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full
                  shadow-lg backdrop-blur-sm
                  flex items-center gap-1`}
                >
                  <span>{getStatusIcon(project.status)}</span>
                  <span className="hidden sm:inline">{project.status.toUpperCase()}</span>
                  <span className="sm:hidden">{project.status.charAt(0).toUpperCase()}</span>
                </span>
              </div>

              {/* Image Container with Gradient Overlay */}
              <div className="relative h-32 sm:h-36 md:h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-[1]" />
                
                <img
                  src={logo}
                  alt={project.name}
                  className="w-full h-full object-cover select-none 
                  group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                
                {/* Animated Corner Accent */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-[#C62828] 
                group-hover:w-full transition-all duration-500 ease-out" />
              </div>

              {/* Content Section */}
              <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
                {/* Project Name */}
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 p-1.5 sm:p-2 bg-[#C62828]/10 rounded-lg shrink-0
                  group-hover:bg-[#C62828]/20 transition-colors duration-300">
                    <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#C62828]" />
                  </div>
                  <h1 className="font-bold text-sm sm:text-base md:text-lg text-gray-800 
                  line-clamp-2 group-hover:text-[#C62828] transition-colors duration-300">
                    {project.name}
                  </h1>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mt-0.5 shrink-0" />
                  <address className="not-italic text-xs sm:text-sm line-clamp-2">
                    {project.location || "Location not specified"}
                  </address>
                </div>

                {/* Dates Section */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  {/* Start Date */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500 shrink-0" />
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-700">Start:</span>
                      <span className="text-[10px] sm:text-xs text-gray-600 truncate">
                        {new Date(project.start_date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 shrink-0" />
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-700">End:</span>
                      <span className="text-[10px] sm:text-xs text-gray-600 truncate">
                        {new Date(project.end_date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* View Details Button */}
                <div className="pt-2 flex items-center justify-between text-[#C62828] 
                font-semibold text-xs sm:text-sm
                group-hover:translate-x-1 transition-transform duration-300">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 
                  group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>

              {/* Hover Effect - Bottom Border */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r 
              from-[#C62828] via-red-500 to-[#C62828] 
              transform scale-x-0 group-hover:scale-x-100 
              transition-transform duration-500 ease-out origin-left" />
            </button>
          );
        })
      )}
    </div>
  );
};

export default TaskProject;