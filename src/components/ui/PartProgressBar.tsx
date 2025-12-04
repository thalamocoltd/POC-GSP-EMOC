import React from "react";
import { cn } from "./utils";

interface PartProgressBarProps {
  currentPart: "Initiation" | "Review" | "Implementation" | "Closeout";
}

const parts = ["Initiation", "Review", "Implementation", "Closeout"];

export const PartProgressBar = ({ currentPart }: PartProgressBarProps) => {
  const currentIndex = parts.indexOf(currentPart);

  return (
    <div className="flex items-center justify-between mb-8 px-4">
      {parts.map((part, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const isPending = index > currentIndex;

        return (
          <React.Fragment key={part}>
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all",
                isActive && "bg-[#006699] text-white shadow-lg scale-110",
                isCompleted && "bg-green-600 text-white",
                isPending && "bg-gray-200 text-gray-500"
              )}>
                {index + 1}
              </div>
              <span className={cn(
                "mt-3 text-sm font-semibold transition-colors",
                isActive && "text-[#006699]",
                isCompleted && "text-green-600",
                isPending && "text-gray-500"
              )}>
                {part}
              </span>
            </div>
            {index < parts.length - 1 && (
              <div className={cn(
                "flex-1 h-1.5 mx-2 transition-colors",
                index < currentIndex ? "bg-green-600" : "bg-gray-200"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
