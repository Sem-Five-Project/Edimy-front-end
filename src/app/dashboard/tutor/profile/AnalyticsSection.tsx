import React from "react";
import { Award, Star, TrendingUp } from "lucide-react";
import { Subject } from "@/types";
import Modal from "@mui/material/Modal";
import {
  tutorAvailabilityAPI,
  classAPI,
  classDocAPI,
  subjectAPI,
} from "@/lib/api";

interface AnalyticsSectionProps {
  subjects: Subject[];
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ subjects }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newSubject, setNewSubject] = React.useState<number | undefined>();

  const closeModal = () => {
    setIsModalOpen(false);
    setNewSubject(undefined);
  };

  const tutorId = 1;

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add subject creation logic here
    await subjectAPI.addSubjectsForTutor(tutorId, newSubject);
    closeModal();

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
          <div className="mb-4">
            <button
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              Add New Subject
            </button>
          </div>
      {/*add a modal for adding new subjects */}
      <Modal open={isModalOpen} onClose={closeModal}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
            padding: "32px",
            minWidth: "320px",
            outline: "none",
          }}
        >
          <h3 className="text-lg font-bold mb-4">Add New Subject</h3>
          <form onSubmit={handleAddSubject}>
            <input
              type="number"
              placeholder="Subject ID"
              value={newSubject}
              onChange={(e) => setNewSubject(Number(e.target.value) || undefined)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Subject
            </button>
          </form>
        </div>
      </Modal>

          {subjects.length > 0 ? (
            <div className="space-y-3">
              {subjects.map((subject, idx) => (
                <div key={idx} className="group bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-purple-500">
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
                      <span className="text-sm font-medium">+{Math.floor(Math.random() * 15) + 1}%</span>
                    </div>
                    <div className="flex items-center">
                      {[1,2,3,4,5].map((star) => (
                        <Star 
                          key={star} 
                          size={12} 
                          className={star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"} 
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
      <div className="lg:col-span-2">
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
                <h3 className="font-semibold text-gray-700">Student Satisfaction</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">4.9/5</p>
              <p className="text-sm text-green-600 mt-1">Excellent rating</p>
            </div>
          </div>
          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <h3 className="font-semibold text-gray-700 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: "Class completed", subject: "Mathematics", time: "2 hours ago", type: "success" },
                { action: "Document uploaded", subject: "Physics", time: "5 hours ago", type: "info" },
                { action: "New student enrolled", subject: "Chemistry", time: "1 day ago", type: "success" },
                { action: "Schedule updated", subject: "Biology", time: "2 days ago", type: "warning" },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'info' ? 'bg-blue-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.subject} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
