"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import {
  tutorAvailabilityAPI,
  classAPI,
  classDocAPI,
  subjectAPI,
} from "@/lib/api";
import {
  Class,
  ClassDoc,
  Subject,
  TutorAvailability,
} from "@/types";
import InteractiveCalendar from "./InteractiveCalendar";
import StatsCard from "./StatsCard";
import UserInfo from "./UserInfo";
import ErrorCard from "./ErrorCard";
import HeaderTabs from "./HeaderTabs";
import ClassesSection from "./ClassesSection";
import AnalyticsSection from "./AnalyticsSection";
import LoadingScreen from "./LoadingScreen";
import { BookOpen, Clock, Award, FileText, Calendar, ChevronLeft, ChevronRight, Edit, Trash2, Activity, Eye, Download, Plus } from "lucide-react";

export default function TutorProfilePage() {
  // State for selected file in document upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();
  const tutorId = 1; // replace with user.userId when backend ready

  // States
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TutorAvailability[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classDocs, setClassDocs] = useState<Record<number, ClassDoc[]>>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showAddTimeSlotModal, setShowAddTimeSlotModal] = useState(false);
  const [selectedDocClass, setSelectedDocClass] = useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('schedule');
  
  const [newTimeSlot, setNewTimeSlot] = useState<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    recurring: boolean;
  }>({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    recurring: false,
  });
  const [editTimeSlot, setEditTimeSlot] = useState<TutorAvailability | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClass, setNewClass] = useState<Class>({
    className: "",
    tutorId: tutorId!,
    date: "",
    startTime: "",
    endTime: "",
    comment: "",
    subjectId: 1,
    classTypeId: 1,
  });

  const classTypes = [
    { id: 1, name: "Single Lesson", icon: "📝", color: "bg-blue-100 text-blue-800" },
    { id: 2, name: "Regular Classes", icon: "🔄", color: "bg-green-100 text-green-800" },
    { id: 3, name: "Monthly Recurring", icon: "📅", color: "bg-purple-100 text-purple-800" },
  ];

  const daysOfWeek = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const fullDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Mock stats for beautiful dashboard
  const stats = [
    { label: "Total Classes", value: classes.length, icon: BookOpen, color: "bg-blue-500" },
    { label: "Available Slots", value: availableTimeSlots.length, icon: Clock, color: "bg-green-500" },
    { label: "Subjects", value: subjects.length, icon: Award, color: "bg-purple-500" },
    { label: "Documents", value: Object.values(classDocs).flat().length, icon: FileText, color: "bg-orange-500" },
  ];

  useEffect(() => {
    if (!tutorId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [slotsRes, classesRes, subjectsRes] = await Promise.all([
          tutorAvailabilityAPI.getAvailabilityByTutorId(tutorId),
          classAPI.getClassesByTutorId(tutorId),
          subjectAPI.getSubjectsByTutorId(tutorId),
        ]);

        setAvailableTimeSlots(slotsRes);
        setClasses(classesRes);
        console.log('Classes data:*************', classesRes);
        setSubjects(subjectsRes);

        // Fetch docs for each class
        if (classesRes.length) {
          const docsByClass: Record<number, ClassDoc[]> = {};
          for (const c of classesRes) {
            const docsRes = await classDocAPI.getClassDocsByClassId(c.classId!);
            docsByClass[c.classId!] = docsRes;
          }
          setClassDocs(docsByClass);
        }
      } catch (err) {
        setError("Error loading tutor profile data. Please try again.");
        console.error("Error loading tutor profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tutorId]);

  const addTimeSlot = async (startTime: string, endTime: string, dayOfWeek: string, recurring: boolean) => {
    if (!tutorId) return;
    const newSlot: TutorAvailability = {
      tutorId,
      startTime,
      endTime,
      dayOfWeek,
      recurring,
    };
    try {
      await tutorAvailabilityAPI.createAvailability(newSlot);
      setAvailableTimeSlots((prev) => [...prev, newSlot]);
      setShowAddTimeSlotModal(false);
      setNewTimeSlot({ dayOfWeek: "", startTime: "", endTime: "", recurring: false });
    } catch (err) {
      setError("Error adding time slot. Please try again.");
      console.error("Error adding time slot:", err);
    }
  };

  const handleAddTimeSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const { dayOfWeek, startTime, endTime, recurring } = newTimeSlot;
    addTimeSlot(startTime, endTime, dayOfWeek, recurring);
  };

  const openEditModal = (slot: TutorAvailability) => {
    setEditTimeSlot(slot);
    setShowEditModal(true);
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorId) return;
    const classToAdd: Class = {
      ...newClass,
      tutorId,
    };
    try {
      await classAPI.createClass(classToAdd);
      setClasses((prev) => [...prev, classToAdd]);
      setShowAddClassModal(false);
      setNewClass({
        className: "",
        tutorId: tutorId!,
        date: "",
        startTime: "",
        endTime: "",
        comment: "",
        subjectId: 1,
        classTypeId: 1,
      });
    } catch (err) {
      setError("Error adding class. Please try again.");
      console.error("Error adding class:", err);
    }
  };

  const closeModal = () => {
    setShowAddDocModal(false);
    setShowAddTimeSlotModal(false);
    setShowEditModal(false);
    setShowAddClassModal(false);
    setEditTimeSlot(null);
    setSelectedDocClass(null);
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const start = new Date(date);
    const diff = start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1);
    start.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };
  
  // Document upload handler
const handleUploadDocument = async () => {
  if (!selectedFile || !selectedDocClass) {
    setError("Please select a class and a file before uploading.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("classId", String(selectedDocClass));
    formData.append("docType", "Lesson Notes"); // you can make this dynamic from form

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to upload document");
    }

    const data = await res.json();

   

    // Save document info to backend
    await classDocAPI.addClassDoc({
      classId: selectedDocClass,
      docType: "PDF",
      link: data.url,
    });

    // Update state with uploaded document
    setClassDocs((prev) => ({
      ...prev,
      [selectedDocClass]: [
        ...(prev[selectedDocClass] || []),
        data, // assuming your API returns the new document object
      ],
    }));

    setShowAddDocModal(false);
    setSelectedFile(null);
  } catch (err) {
    console.error("Error uploading document:", err);
    setError("Error uploading document. Please try again.");
  }
};




  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-8xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-white via-blue-50 to-white rounded-3xl shadow-xl p-8 border border-blue-100">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tutor Dashboard
            </h1>
            <HeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <UserInfo user={user} />
        </div>
        {/* Stats */}
        <StatsCard stats={stats} />
        {/* Error */}
        <ErrorCard error={error} />
        {/* Content based on active tab */}
        {activeTab === "schedule" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Schedule Management</h2>
              <button
                onClick={() => setShowAddTimeSlotModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                Add Time Slot
              </button>
            </div>
            <InteractiveCalendar
              currentWeek={currentWeek}
              daysOfWeek={daysOfWeek}
              availableTimeSlots={availableTimeSlots}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              getWeekDates={getWeekDates}
              formatDate={formatDate}
              navigateWeek={navigateWeek}
              openEditModal={openEditModal}
              tutorAvailabilityAPI={tutorAvailabilityAPI}
            />
          </div>
        )}
        {activeTab === "classes" && (
          <ClassesSection
            classes={classes}
            classTypes={classTypes}
            subjects={subjects}
            classDocs={classDocs}
            classAPI={classAPI}
            tutorId={tutorId}
            setSelectedDocClass={setSelectedDocClass}
            setShowAddDocModal={setShowAddDocModal}
            classDocAPI={classDocAPI}
            setShowAddClassModal={setShowAddClassModal}
          />
        )}
        {activeTab === "analytics" && <AnalyticsSection subjects={subjects} />}
        {/* Modals (unchanged, keep inline for now) */}
        {(showAddTimeSlotModal || showEditModal || showAddClassModal || showAddDocModal) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              {/* ...existing code for modals... */}
              {/* Add Time Slot Modal */}
              {showAddTimeSlotModal && (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Add Time Slot</h2>
                      <p className="text-gray-500 mt-1">Create a new availability window</p>
                    </div>
                    <button 
                      type="button"
                      onClick={closeModal} 
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x text-gray-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                  <form onSubmit={handleAddTimeSlot} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Day of Week</label>
                      <select
                        value={newTimeSlot.dayOfWeek}
                        onChange={(e) => setNewTimeSlot({ ...newTimeSlot, dayOfWeek: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="">Select a day</option>
                        {daysOfWeek.map((day, idx) => (
                          <option key={day} value={day}>{fullDays[idx]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                        <input
                          type="time"
                          value={newTimeSlot.startTime}
                          onChange={(e) => setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                        <input
                          type="time"
                          value={newTimeSlot.endTime}
                          onChange={(e) => setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center bg-blue-50 rounded-xl p-4">
                      <input
                        type="checkbox"
                        id="recurring"
                        checked={newTimeSlot.recurring}
                        onChange={(e) => setNewTimeSlot({ ...newTimeSlot, recurring: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded-lg mr-3"
                      />
                      <div>
                        <label htmlFor="recurring" className="text-sm font-semibold text-gray-800">Recurring weekly</label>
                        <p className="text-xs text-gray-600">This time slot will repeat every week</p>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Add Time Slot
                    </button>
                  </form>
                </div>
              )}
              {/* Edit Time Slot Modal */}
              {showEditModal && editTimeSlot && (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Edit Time Slot</h2>
                      <p className="text-gray-500 mt-1">Modify your availability</p>
                    </div>
                    <button 
                      type="button"
                      onClick={closeModal} 
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x text-gray-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editTimeSlot.availabilityId) {
                        tutorAvailabilityAPI.updateAvailability(editTimeSlot)
                          .then(() => {
                            setShowEditModal(false);
                            setEditTimeSlot(null);
                          })
                          .catch((error) => {
                            console.error("Error updating time slot:", error);
                          });
                      }
                    }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                        <input
                          type="time"
                          value={editTimeSlot.startTime}
                          onChange={(e) => setEditTimeSlot({ ...editTimeSlot, startTime: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                        <input
                          type="time"
                          value={editTimeSlot.endTime}
                          onChange={(e) => setEditTimeSlot({ ...editTimeSlot, endTime: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="flex items-center bg-blue-50 rounded-xl p-4">
                      <input
                        type="checkbox"
                        checked={editTimeSlot.recurring}
                        onChange={(e) => setEditTimeSlot({ ...editTimeSlot, recurring: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded-lg mr-3"
                      />
                      <div>
                        <label className="text-sm font-semibold text-gray-800">Recurring weekly</label>
                        <p className="text-xs text-gray-600">This time slot will repeat every week</p>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Save Changes
                    </button>
                  </form>
                </div>
              )}
              {/* Add Class Modal */}
              {showAddClassModal && (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Create New Class</h2>
                      <p className="text-gray-500 mt-1">Add a new class to your schedule</p>
                    </div>
                    <button 
                      type="button"
                      onClick={closeModal} 
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x text-gray-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                  <form onSubmit={handleAddClass} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Class Name</label>
                      <input
                        type="text"
                        value={newClass.className}
                        onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., Advanced Mathematics"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={newClass.date}
                        onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                        <input
                          type="time"
                          value={newClass.startTime}
                          onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                        <input
                          type="time"
                          value={newClass.endTime}
                          onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                        <select
                          value={newClass.subjectId}
                          onChange={(e) => setNewClass({ ...newClass, subjectId: Number(e.target.value) })}
                          className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Select subject</option>
                          {subjects.map((subject) => (
                            <option key={subject.subjectId} value={subject.subjectId}>
                              {subject.subjectName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Class Type</label>
                        <select
                          value={newClass.classTypeId}
                          onChange={(e) => setNewClass({ ...newClass, classTypeId: Number(e.target.value) })}
                          className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Select type</option>
                          {classTypes.map((classType) => (
                            <option key={classType.id} value={classType.id}>
                              {classType.icon} {classType.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Comment (Optional)</label>
                      <textarea
                        value={newClass.comment}
                        onChange={(e) => setNewClass({ ...newClass, comment: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        rows={3}
                        placeholder="Add any additional notes about this class..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Create Class
                    </button>
                  </form>
                </div>
              )}
              {/* Add Document Modal */}
              {showAddDocModal && (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Upload Document</h2>
                      <p className="text-gray-500 mt-1">Add learning materials to your class</p>
                    </div>
                    <button 
                      type="button"
                      onClick={closeModal} 
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x text-gray-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type</label>
                      <input
                        type="text"
                        name="docType"
                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., Lesson Notes, Assignment Sheet"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Document</label>
                      <input
                        type="file"
                        name="file"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {selectedFile && (
                        <div className="mt-2 text-green-700 text-sm">
                          Selected: {selectedFile.name}
                        </div>
                      )}
                    </div>
                    <button            
                      type="button"
                      onClick={handleUploadDocument}
                      className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Upload Document
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}