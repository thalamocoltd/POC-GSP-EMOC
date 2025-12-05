import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { PersonOption } from "../../types/task-cards";
import { cn } from "./utils";

interface PeoplePickerProps {
  label?: string;
  value: string | null;
  onChange: (personId: string) => void;
  options: PersonOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const PeoplePicker = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select a person",
  disabled = false,
  required = false,
  className,
}: PeoplePickerProps) => {
  const selectedPerson = options.find((opt) => opt.id === value);
  const displayValue = selectedPerson?.name || placeholder;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider block">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            "w-full bg-white border border-gray-300 rounded-md text-sm font-medium text-[#1C1C1E]",
            disabled && "opacity-50 cursor-not-allowed bg-gray-50"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((person) => (
            <SelectItem key={person.id} value={person.id}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{person.name}</span>
                {person.role && (
                  <span className="text-xs text-gray-500">({person.role})</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
