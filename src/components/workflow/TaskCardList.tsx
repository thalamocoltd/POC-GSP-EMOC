import React from "react";
import { TaskCard } from "./TaskCard";
import { Task, TaskCardStage } from "../../types/workflow";

interface TaskCardListProps {
  tasks: Task[];
  partName?: string;
  stage?: TaskCardStage;
  showItemNumbers?: boolean;
}

export const TaskCardList = ({ tasks, partName, stage, showItemNumbers = true }: TaskCardListProps) => {
  const getStage = (task: Task): TaskCardStage => {
    // If stage is explicitly provided, use it for all tasks
    if (stage) return stage;

    // Otherwise, determine stage based on task status
    if (task.status === "In Progress") return "editable";
    if (task.status === "Completed" || task.status === "Rejected") return "readonly";
    return "disabled";
  };

  return (
    <div className="space-y-4">
      {partName && (
        <h3 className="text-lg font-semibold text-[#1C1C1E] flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-[#1d3654] to-[#006699] rounded-full"></span>
          {partName} Tasks
        </h3>
      )}
      <div className="space-y-4">
        {tasks.map((task, idx) => (
          <TaskCard
            key={task.id}
            task={task}
            stage={getStage(task)}
            itemNumber={showItemNumbers ? idx + 1 : undefined}
          />
        ))}
      </div>
    </div>
  );
};
