import { useEffect, useState } from "react";
import { toast } from "sonner";
import projectApi from "../../lib/projectApi";
import logo from "../../assets/images/Nayash Logo.png";
import { Building, Calendar, Locate, MapPin } from "lucide-react";
import AreaTasksApi from "../../lib/areaTasksApi";

const TaskProject = ({
  setSelectedProjectId,
}: {
  setSelectedProjectId: React.Dispatch<React.SetStateAction<number | null>>;
}) => {
  const [projects, setProjects] = useState<any>([]);

  const fetchProjects = async () => {
    try {
      const projectRes: any = await projectApi.getProjects();
      // const areaTasks: any = await AreaTasksApi.getAreaTasks();

      const projects = Array.isArray(projectRes.data) ? projectRes.data : [];

      // const tasks = Array.isArray(areaTasks.data) ? areaTasks.data : [];

      // 🔹 Build project-wise task status counts
      // const taskCountMap = new Map<number, any>();

      // tasks.forEach((task: any) => {
      //   if (!taskCountMap.has(task.project_id)) {
      //     taskCountMap.set(task.project_id, {
      //       total_tasks: 0,
      //       not_started: 0,
      //       in_progress: 0,
      //       completed: 0,
      //       delayed: 0,
      //     });
      //   }

      //   const counter = taskCountMap.get(task.project_id);

      //   counter.total_tasks++;

      //   if (task.status === "not_started") counter.not_started++;
      //   if (task.status === "in_progress") counter.in_progress++;
      //   if (task.status === "completed") counter.completed++;
      //   if (task.status === "delayed") counter.delayed++;
      // });

      // 🔹 Merge counts into projects
      // const updatedProjects = projects.map((project: any) => {
      //   const taskSummary = taskCountMap.get(project.id) || {
      //     total_tasks: 0,
      //     not_started: 0,
      //     in_progress: 0,
      //     completed: 0,
      //     delayed: 0,
      //   };

      //   return {
      //     ...project,
      //     task_summary: taskSummary,
      //   };
      // });

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
      pending: "bg-yellow-100 text-yellow-700",
      completed: "bg-green-100 text-green-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      processing: "bg-blue-100 text-blue-700",
    };
    return styles[status.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {projects.map((project: any) => {
        return (
          <button
            onClick={() => {
              setSelectedProjectId(project.id);
            }}
            className="text-start bg-white shadow-xl p-3 rounded-lg hover:scale-[1.02] transition ease-in-out border-1 border-slate-300"
          >
            <div className="h-[30vh] flex items-center rounded-lg border border-slate-400 mb-3 overflow-hidden">
              <img
                src={logo}
                alt=""
                className="select-none hover:scale-[1.03] transition ease-in-out"
              />
            </div>
            <div>
              <h1 className=" font-semibold mb-1 flex items-center">
                <Building className="w-5 h-5" />
                <span className="text-lg mr-3">{project.name}</span>{" "}
                <span
                  className={`${getStatusColor(project.status)} text-[0.8rem]  px-3 py-1 rounded-full`}
                >
                  {project.status.toUpperCase()}
                </span>
              </h1>
              <address className="mb-2 text-start flex items-start text-[0.8rem]">
                <MapPin className="w-4 h-4 mr-1" />
                {project.location}
              </address>
              <div className="flex justify-between">
                <h1 className="text-[0.9rem] flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="font-semibold">Start Date :</span>{" "}
                  {new Date(project.start_date).toLocaleDateString()}
                </h1>
                <h1 className="text-[0.9rem] flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />{" "}
                  <span className="font-semibold">End Date :</span>{" "}
                  {new Date(project.end_date).toLocaleDateString()}
                </h1>
              </div>
              {/* <div className="grid grid-cols-3 mt-5 gap-2 border-t border-slate-300 pt-3">
                <div
                  className={`font-semibold  text-[0.8rem]  px-3 py-1 rounded-full`}
                >
                  Total Tasks : {project.task_summary.total_tasks}
                </div>
                <div
                  className={`font-semibold  text-[0.8rem]  px-3 py-1 rounded-full`}
                >
                  Pending : {project.task_summary.not_started}
                </div>
                <div
                  className={` font-semibold  text-[0.8rem]  px-3 py-1 rounded-full`}
                >
                  In Progress : {project.task_summary.in_progress}
                </div>
                <div
                  className={`font-semibold  text-[0.8rem]  px-3 py-1 rounded-full`}
                >
                  Completed : {project.task_summary.completed}
                </div>
                <div
                  className={`font-semibold  text-[0.8rem]  px-3 py-1 rounded-full`}
                >
                  Delayed : {project.task_summary.delayed}
                </div>
              </div> */}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default TaskProject;
