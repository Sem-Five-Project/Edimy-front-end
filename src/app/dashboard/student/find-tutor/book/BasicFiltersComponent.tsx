import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Education and Subject Data
const EDUCATION_LEVELS = [
  { value: "grade1-5", label: "Grade 1-5" },
  { value: "grade6-9", label: "Grade 6-9" },
  { value: "ordinary-level", label: "Ordinary Level" },
  { value: "advanced-level", label: "Advanced Level" },
];

const STREAMS = [
  { value: "mathematics", label: "Mathematics Stream" },
  { value: "biology", label: "Biology Stream" },
  { value: "commerce", label: "Commerce Stream" },
  { value: "arts", label: "Arts Stream" },
  { value: "technology", label: "Technology Stream" },
];

const SUBJECTS = {
  "advanced-level": {
    mathematics: ["Combined Mathematics", "Physics", "Chemistry", "ICT"],
    biology: ["Biology", "Chemistry", "Physics", "Agricultural Science"],
    commerce: ["Economics", "Accounting", "Business Studies", "Mathematics"],
    arts: ["History", "Geography", "English Literature", "Political Science"],
    technology: [
      "Engineering Technology",
      "Science for Technology",
      "Mathematics",
    ],
  },
  "ordinary-level": [
    "Mathematics",
    "Science",
    "English",
    "Sinhala",
    "Tamil",
    "History",
    "Geography",
  ],
  "grade6-9": [
    "Mathematics",
    "Science",
    "English",
    "Environmental Studies",
    "Sinhala",
    "Tamil",
  ],
  "grade1-5": [
    "Mathematics",
    "Science",
    "English",
    "Environmental Studies",
    "Sinhala",
    "Tamil",
  ],
};

interface BasicFiltersProps {
  filters: {
    educationLevel: string | null;
    stream: string | null;
    subjects: string[];
    classType: "one-time" | "monthly-recurring" | null;
  };
  onFilterChange: (key: string, value: any) => void;
}

const BasicFiltersComponent: React.FC<BasicFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Update available subjects when education level or stream changes
  useEffect(() => {
    let subjects: string[] = [];

    if (filters.educationLevel) {
      if (filters.educationLevel === "advanced-level" && filters.stream) {
        subjects =
          SUBJECTS["advanced-level"][
            filters.stream as keyof (typeof SUBJECTS)["advanced-level"]
          ] || [];
      } else {
        subjects =
          (SUBJECTS[
            filters.educationLevel as keyof typeof SUBJECTS
          ] as string[]) || [];
      }
    }

    setAvailableSubjects(subjects);

    // Clear subjects if they're no longer valid
    if (subjects.length > 0) {
      const validSubjects = filters.subjects.filter((subject) =>
        subjects.includes(subject),
      );
      if (validSubjects.length !== filters.subjects.length) {
        onFilterChange("subjects", validSubjects);
      }
    }
  }, [
    filters.educationLevel,
    filters.stream,
    filters.subjects,
    onFilterChange,
  ]);

  const handleSubjectChange = (subject: string, checked: boolean) => {
    const newSubjects = checked
      ? [...filters.subjects, subject]
      : filters.subjects.filter((s) => s !== subject);
    onFilterChange("subjects", newSubjects);
  };

  return (
    <Card className="border-2 border-gray-100">
      <CardContent className="p-6 space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            Basic Informationnn
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Select education level, stream, and subjects
          </p>
        </div>

        {/* Education Level */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800">
            Education Level..
          </label>
          <Select
            value={filters.educationLevel || "none"}
            onValueChange={(value) =>
              onFilterChange("educationLevel", value === "none" ? null : value)
            }
          >
            <SelectTrigger className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg">
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent className="z-[60]">
              <SelectItem value="none" className="py-3">
                Any Level
              </SelectItem>
              {EDUCATION_LEVELS.map((level) => (
                <SelectItem
                  key={level.value}
                  value={level.value}
                  className="py-3"
                >
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stream - Only for Advanced Level */}
        {filters.educationLevel === "advanced-level" && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="block text-sm font-semibold text-blue-800">
              Stream (Advanced Level)
            </label>
            <Select
              value={filters.stream || "none"}
              onValueChange={(value) =>
                onFilterChange("stream", value === "none" ? null : value)
              }
            >
              <SelectTrigger className="w-full h-12 border-2 border-blue-300 focus:border-blue-500 bg-white">
                <SelectValue placeholder="Select stream" />
              </SelectTrigger>
              <SelectContent className="z-[60]">
                <SelectItem value="none" className="py-3">
                  Any Stream
                </SelectItem>
                {STREAMS.map((stream) => (
                  <SelectItem
                    key={stream.value}
                    value={stream.value}
                    className="py-3"
                  >
                    {stream.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Subjects */}
        {availableSubjects.length > 0 && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800">
              Subjects ({filters.subjects.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="space-y-3">
                {availableSubjects.map((subject) => (
                  <div
                    key={subject}
                    className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <Checkbox
                      id={subject}
                      checked={filters.subjects.includes(subject)}
                      onCheckedChange={(checked) =>
                        handleSubjectChange(subject, checked as boolean)
                      }
                      className="w-5 h-5"
                    />
                    <label
                      htmlFor={subject}
                      className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                    >
                      {subject}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            {filters.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Class Type */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800">
            Class Type
          </label>
          <Select
            value={filters.classType || "none"}
            onValueChange={(value) =>
              onFilterChange("classType", value === "none" ? null : value)
            }
          >
            <SelectTrigger className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg">
              <SelectValue placeholder="Select class type" />
            </SelectTrigger>
            <SelectContent className="z-[60]">
              <SelectItem value="none" className="py-3">
                Any Type
              </SelectItem>
              <SelectItem value="one-time" className="py-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>One-time Class</span>
                </div>
              </SelectItem>
              <SelectItem value="monthly-recurring" className="py-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Monthly Recurring</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {filters.classType && (
            <div className="mt-2 p-3 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-600">
                {filters.classType === "one-time"
                  ? "Perfect for trial sessions or specific topics"
                  : "Regular weekly sessions for consistent learning"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicFiltersComponent;
