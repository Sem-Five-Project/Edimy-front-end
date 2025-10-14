import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateTimeSelectorComponent from "./DateTimeSelectorComponent";
import { SubjectDto } from "@/types/index";
import { ExtendedFilterOptions } from "@/types/index";
import { DateTimeFilters } from "@/types/index";
import { filterAPI } from "@/lib/api";

// Education and Subject Data
const EDUCATION_LEVELS = [
  { value: "primary_grade_1_5", label: "primary/grade 1-5" },
  { value: "secondary_grade_6_11", label: "secondary/grade 6-11" },
  { value: "highschool_advanced_level", label: "highschool/advanced level" },
  { value: "undergraduate", label: "undergraduate" },
  { value: "postgraduate", label: "postgraduate" },
  { value: "doctorate", label: "doctorate" },
];

const STREAMS = [
  { value: "mathematics", label: "Mathematics Stream" },
  { value: "biology", label: "Biology Stream" },
  { value: "commerce", label: "Commerce Stream" },
  { value: "arts", label: "Arts Stream" },
  { value: "technology", label: "Technology Stream" },
];

interface BasicFiltersProps {
  filters: ExtendedFilterOptions;
  onFilterChange: (key: string, value: any) => void;
}

const BasicFiltersComponent: React.FC<BasicFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const [availableSubjects, setAvailableSubjects] = useState<SubjectDto[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Fetch subjects from backend only when dropdown is opened and education level is set

  const handleDropdownOpen = (open: boolean) => {
    setDropdownOpen(open);
    if (open) {
      fetchSubjects();
    }
  };

  const handleSubjectChange = (value: string) => {
    if (value === "none") {
      onFilterChange("subjects", []); // reset to empty
    } else {
      onFilterChange("subjects", [value]); // store subjectName directly
    }
  };

  const getSelectedSubjectLabel = () => {
    if (!filters.subjects || filters.subjects.length === 0)
      return "Any Subject";
    return filters.subjects[0]; // subjectName is stored directly
  };

  const fetchSubjects = async () => {
    // Reset on fetch
    setSubjectsError(null);

    if (!filters.educationLevel) {
      setAvailableSubjects([]);
      return;
    }

    // Abort previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setSubjectsLoading(true);

    try {
      const payload = {
        educationLevel: mapEducationLevelToBackend(filters.educationLevel),
        stream: filters.stream ? mapStreamToBackend(filters.stream) : null,
      };
      //console.log('Fetching subjects with payload:', payload);

      const response = await filterAPI.getAllSubjects(
        payload,
        controller.signal,
      );
      //console.log('Fetched subjects:', response.data);
      setAvailableSubjects(response.data);
    } catch (err: any) {
      if (err?.name === "AbortError") return; // ignore abort errors
      setSubjectsError(err.message || "Failed to load subjects");
      setAvailableSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  };
  useEffect(() => {
    console.log("availableSubjects s", availableSubjects);
  }, [availableSubjects]);
  // Also fetch subjects when education level or stream changes (if dropdown was already opened)
  useEffect(() => {
    if (dropdownOpen && filters.educationLevel) {
      fetchSubjects();
    } else {
      // Reset subjects when education level is cleared
      if (!filters.educationLevel) {
        setAvailableSubjects([]);
        onFilterChange("subjects", []);
      }
    }
  }, [filters.educationLevel, filters.stream]);

  // Mapping helpers to backend enum values
  const mapEducationLevelToBackend = (level: string): string => {
    switch (level) {
      case "primary_grade_1_5":
        return "PRIMARY_GRADE_1_5";
      case "secondary_grade_6-11":
        return "SECONDARY_GRADE_6_11";
      case "highschool_advanced_level":
        return "HIGHSCHOOL_ADVANCED_LEVEL";
      case "undergraduate":
        return "UNDERGRADUATE";
      case "postgraduate":
        return "POSTGRADUATE";
      case "doctorate":
        return "DOCTORATE";
      default:
        return level.toUpperCase();
    }
  };

  const mapStreamToBackend = (stream: string): string => {
    switch (stream) {
      case "mathematics":
        return "MATHS";
      case "biology":
        return "BIO";
      case "technology":
        return "TECHNOLOGY";
      case "commerce":
        return "COMMERSE";
      case "arts":
        return "ARTS";
      case "agri":
        return "AGRI";
      case "ict":
        return "ICT";
      default:
        return stream.toUpperCase();
    }
  };

  return (
    <Card className="border-2 border-gray-100 shadow-sm">
      <CardContent className="p-6 space-y-6">
        <div className="border-b pb-4">
          <p className="text-sm text-gray-600 mt-1">
            Select education level, stream, and subjects
          </p>
        </div>

        {/* Education Level */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800">
            Education Level
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
        {filters.educationLevel === "highschool_advanced_level" && (
          <div className="">
            <label className="block text-sm font-semibold text-gray-800">
              Stream (Advanced Level)
            </label>
            <Select
              value={filters.stream || "none"}
              onValueChange={(value) =>
                onFilterChange("stream", value === "none" ? null : value)
              }
            >
              <SelectTrigger className="w-full h-12 focus:border-blue-500 bg-white">
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

        {/* Subjects Dropdown */}
        {filters.educationLevel && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
              Subject
              {subjectsLoading && (
                <span className="text-xs font-normal text-blue-500">
                  Loading...
                </span>
              )}
              {subjectsError && (
                <span className="text-xs font-normal text-red-500">
                  {subjectsError}
                </span>
              )}
            </label>
            <Select
              value={
                filters.subjects.length > 0
                  ? String(filters.subjects[0])
                  : "none"
              }
              onValueChange={handleSubjectChange}
              onOpenChange={handleDropdownOpen}
              disabled={subjectsLoading}
            >
              <SelectTrigger className="w-full h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg">
                <SelectValue
                  placeholder={
                    subjectsLoading ? "Loading subjects..." : "Select subject"
                  }
                >
                  {getSelectedSubjectLabel()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[60] max-h-60 overflow-y-auto">
                <SelectItem value="none" className="py-3">
                  Any Subject
                </SelectItem>

                {availableSubjects.length > 0
                  ? availableSubjects.map((subject) => (
                      <SelectItem
                        key={subject.subjectId}
                        value={subject.subjectName} // ✅ send NAME not ID
                        className="py-3"
                      >
                        {subject.subjectName}
                      </SelectItem>
                    ))
                  : !subjectsLoading && (
                      <SelectItem
                        value="no-subjects"
                        disabled
                        className="py-3 text-gray-400"
                      >
                        No subjects available
                      </SelectItem>
                    )}

                {subjectsLoading && (
                  <SelectItem
                    value="loading"
                    disabled
                    className="py-3 text-gray-400"
                  >
                    Loading subjects...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {/* Show selected subject as a tag */}
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
          <DateTimeSelectorComponent
            filters={filters}
            onFilterChange={onFilterChange}
          />
          {/* <DateTimeSelectorComponent 
            filters={{
              classType: filters.classType,
              selectedDate: filters.selectedDate || null,
              selectedWeekdays: filters.selectedWeekdays || [],
              timePeriods: filters.timePeriods || {},
              tempTimeSelection: filters.tempTimeSelection || {},
              //addingNewSlot: filters.addingNewSlot || false,
            }} 
            onFilterChange={onFilterChange} 
          /> */}
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicFiltersComponent;
