import React from "react";
import ClassCard from "./ClassCard";
import { Class, Subject, ClassDoc, TutorSubject } from "@/types";

interface ClassesSectionProps {
  classes: Class[];
  classTypes: { id: number; name: string; icon: string; color: string }[];
  subjects: TutorSubject[];
  classDocs: Record<number, ClassDoc[]>;
  classAPI: any;
  tutorId: number;
  setSelectedDocClass: (id: number) => void;
  setShowAddDocModal: (show: boolean) => void;
  classDocAPI: any;
  setShowAddClassModal: (show: boolean) => void;
}

const ClassesSection: React.FC<ClassesSectionProps> = ({
  classes,
  classTypes,
  subjects,
  classDocs,
  classAPI,
  tutorId,
  setSelectedDocClass,
  setShowAddDocModal,
  classDocAPI,
  setShowAddClassModal,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Classes</h2>
        {/* <button
          onClick={() => setShowAddClassModal(true)}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
        >
          Create Class
        </button> */}
      </div>
      {classes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {classes.map((cls) => (
            <ClassCard
              key={cls.classId}
              cls={cls}
              classTypes={classTypes}
              subjects={subjects}
              classDocs={classDocs}
              classAPI={classAPI}
              tutorId={tutorId}
              setSelectedDocClass={setSelectedDocClass}
              setShowAddDocModal={setShowAddDocModal}
              classDocAPI={classDocAPI}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Classes Yet</h3>
          <p className="text-gray-500 mb-6">Create your first class to get started with teaching!</p>
          <button
            onClick={() => setShowAddClassModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            Create Your First Class
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassesSection;
