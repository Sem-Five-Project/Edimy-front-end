import React from "react";
import { BookOpen, Trash2, Calendar, Clock, Activity, FileText } from "lucide-react";
import { Class, Subject, ClassDoc } from "@/types";
import DocumentsSection from "./DocumentsSection";

interface ClassCardProps {
  cls: Class;
  classTypes: { id: number; name: string; icon: string; color: string }[];
  subjects: Subject[];
  classDocs: Record<number, ClassDoc[]>;
  classAPI: any;
  tutorId: number;
  setSelectedDocClass: (id: number) => void;
  setShowAddDocModal: (show: boolean) => void;
  classDocAPI: any;
}

const ClassCard: React.FC<ClassCardProps> = ({
  cls,
  classTypes,
  subjects,
  classDocs,
  classAPI,
  tutorId,
  setSelectedDocClass,
  setShowAddDocModal,
  classDocAPI,
}) => {
  const classType = classTypes.find((type) => type.id === cls.classTypeId) || classTypes[0];
  const subject = subjects.find((s) => s.subjectId === cls.subjectId);
  const classDocs_ = classDocs[cls.classId!] || [];

  // Fallback for className
  const classNameInitial = cls.className && typeof cls.className === 'string' && cls.className.length > 0
    ? cls.className.charAt(0).toUpperCase()
    : <span className="text-xs">N/A</span>;

  console.log('Rendering ClassCard for class:***************', cls);

  return (
    <div
      key={cls.classId}
      className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
            {classNameInitial}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
              {cls.className}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${classType.color}`}>
                {classType.icon} {classType.name}
              </span>
              {subject && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {subject.subjectName}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => classAPI.deleteClass(cls.classId, tutorId)}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-50 text-red-500 hover:text-red-700 transition-all duration-200"
        >
          <Trash2 size={16} />
        </button>
      </div>
      {/* Time and Date */}
      <div className="bg-blue-50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-blue-700">
              <Calendar size={16} className="mr-2" />
              <span className="font-semibold">{cls.date}</span>
            </div>
            <div className="flex items-center text-blue-700">
              <Clock size={16} className="mr-2" />
              <span className="font-medium">{cls.startTime} - {cls.endTime}</span>
            </div>
          </div>
          <div className="flex items-center text-blue-600">
            <Activity size={16} className="mr-1" />
            <span className="text-sm font-medium">Active</span>
          </div>
        </div>
      </div>
      {/* Comment */}
      {cls.comment && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-gray-600 italic leading-relaxed">"{cls.comment}"</p>
        </div>
      )}
      {/* Documents Section */}
      <DocumentsSection
        classDocs={classDocs_}
        onAdd={() => {
          setSelectedDocClass(cls.classId!);
          setShowAddDocModal(true);
        }}
        classDocAPI={classDocAPI}
        classId={cls.classId!}
      />
    </div>
  );
};

export default ClassCard;
