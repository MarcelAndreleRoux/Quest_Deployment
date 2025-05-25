"use client";

import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "./DatePickerWithRange";

type QuestInfoProps = {
  title: string;
  description: string;
  dateRange?: DateRange;
  validationErrors: Record<string, string>;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
};

export const QuestInfo = ({
  title,
  description,
  dateRange,
  validationErrors,
  onTitleChange,
  onDescriptionChange,
  onDateRangeChange,
}: QuestInfoProps) => (
  <div className="space-y-4 mb-8">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Quest Title
      </label>
      <input
        type="text"
        className={`w-full p-3 border rounded-lg ${
          validationErrors.title ? "border-red-500" : "border-gray-300"
        }`}
        placeholder="Enter an epic quest title..."
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
      />
      {validationErrors.title && (
        <p className="mt-1 text-sm text-red-500">{validationErrors.title}</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Quest Description
      </label>
      <textarea
        className={`w-full p-3 border rounded-lg h-32 ${
          validationErrors.description ? "border-red-500" : "border-gray-300"
        }`}
        placeholder="Describe the quest story and objectives..."
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
      />
      {validationErrors.description && (
        <p className="mt-1 text-sm text-red-500">
          {validationErrors.description}
        </p>
      )}
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Quest Duration
      </label>
      <DatePickerWithRange
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
      />
      {validationErrors.dateRange && (
        <p className="mt-1 text-sm text-red-500">
          {validationErrors.dateRange}
        </p>
      )}
    </div>
  </div>
);
