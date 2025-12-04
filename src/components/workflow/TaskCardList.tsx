import React from "react";
import { TaskCard } from "./TaskCard";
import { Task } from "../../types/workflow";

interface TaskCardListProps {
  tasks: Task[];
  partName: string;
}

export const TaskCardList = ({ tasks, partName }: TaskCardListProps) => {
  const getStage = (task: Task) => {
    if (task.status === "In Progress") return "editable" as const;
    if (task.status === "Completed" || task.status === "Rejected") return "readonly" as const;
    return "disabled" as const;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <span className="w-1 h-6 bg-[#006699] rounded-full"></span>
        {partName} Tasks
      </h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} stage={getStage(task)} />
        ))}
      </div>
    </div>
  );
};
