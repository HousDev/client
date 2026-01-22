import { useEffect, useState } from "react";
import AreaTasks from "../components/taskManagement/AreaTask";
import TaskProject from "../components/taskManagement/TaskProject";

const TaskManagement = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    setSelectedProjectId(null);
  }, []);
  return (
    <div>
      {!selectedProjectId && (
        <TaskProject setSelectedProjectId={setSelectedProjectId} />
      )}
      {selectedProjectId && (
        <AreaTasks
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
        />
      )}
    </div>
  );
};

export default TaskManagement;
