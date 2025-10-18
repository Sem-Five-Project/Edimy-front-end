import React, { useState } from "react";
import { Award, Star, TrendingUp } from "lucide-react";
import { Subject, TutorSubject } from "@/types";

interface AnalyticsSectionProps {
  subjects: TutorSubject[];
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ subjects }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewSubject("");
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewSubject(e.target.value);
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add logic to update subjects list
    handleCloseModal();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Teaching Subjects */}
      <div className="lg:col-span-1">
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl p-6 border border-purple-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Award className="mr-3 text-purple-600" size={24} />
            Teaching Subjects
          </h2>
          {/* add a button to open modal to add subjects */}
          <button
            className="mb-2 bg-purple-600 text-white rounded-md px-4 py-2 hover:bg-purple-700 transition"
            onClick={handleOpenModal}
          >
            Add Subject
          </button>
          {/* Modal for adding subject */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-gray-200 relative">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-purple-700">
                      Add New Subject
                    </h2>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      onClick={handleCloseModal}
                      aria-label="Close"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-x text-gray-400"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleAddSubject}>
                    <input
                      type="text"
                      value={newSubject}
                      onChange={handleInputChange}
                      placeholder="Enter subject name"
                      className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {subjects.length > 0 ? (
            <div className="space-y-3">
              {subjects.map((subject, idx) => (
                <div
                  key={idx}
                  className="group bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-purple-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                        {subject.subjectName ?? subject}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {Math.floor(Math.random() * 20) + 5} students enrolled
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      {(subject.subjectName ?? subject).charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center text-green-600">
                      <TrendingUp size={14} className="mr-1" />
                      <span className="text-sm font-medium">
                        +{Math.floor(Math.random() * 15) + 1}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={
                            star <= 4
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-2">4.8</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No subjects assigned yet</p>
            </div>
          )}
        </div>
      </div>
      {/* Performance Metrics */}
      {/* <div className="lg:col-span-2">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-6 border border-blue-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            Performance Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Weekly Hours</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">24.5</p>
              <p className="text-sm text-green-600 mt-1">+3.2 from last week</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">
                  Student Satisfaction
                </h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">4.9/5</p>
              <p className="text-sm text-green-600 mt-1">Excellent rating</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <h3 className="font-semibold text-gray-700 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                {
                  action: "Class completed",
                  subject: "Mathematics",
                  time: "2 hours ago",
                  type: "success",
                },
                {
                  action: "Document uploaded",
                  subject: "Physics",
                  time: "5 hours ago",
                  type: "info",
                },
                {
                  action: "New student enrolled",
                  subject: "Chemistry",
                  time: "1 day ago",
                  type: "success",
                },
                {
                  action: "Schedule updated",
                  subject: "Biology",
                  time: "2 days ago",
                  type: "warning",
                },
              ].map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "success"
                        ? "bg-green-500"
                        : activity.type === "info"
                          ? "bg-blue-500"
                          : activity.type === "warning"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.subject} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        {/* </div> */}
      {/* </div> */}
    </div>
  );
};

export default AnalyticsSection;
