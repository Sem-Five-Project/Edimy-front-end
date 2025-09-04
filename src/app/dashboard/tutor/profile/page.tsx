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
import { 
  Calendar, Clock, BookOpen, FileText, Plus, Edit, Trash2, User, Mail, Tag, X, 
  ChevronLeft, ChevronRight, Star, Users, Award, TrendingUp, Activity,
  Download, Eye, Upload, MapPin, Phone, Globe
} from "lucide-react";

export default function TutorProfilePage() {
  const { user } = useAuth();
  const tutorId = 1; // replace with user.userId when backend ready

  // States
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

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
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

  const renderInteractiveCalendar = () => {
    const weekDates = getWeekDates(currentWeek);
    
    return (
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 border border-blue-100">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
              <Calendar className="mr-3 text-blue-600" size={28} />
              Weekly Schedule
            </h3>
            <p className="text-gray-600">
              {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {' '}
              {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:bg-blue-50"
            >
              <ChevronLeft className="text-blue-600" size={20} />
            </button>
            <button
              onClick={() => setCurrentWeek(new Date())}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Today
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:bg-blue-50"
            >
              <ChevronRight className="text-blue-600" size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const dayName = daysOfWeek[index];
            const daySlots = availableTimeSlots.filter(slot => slot.dayOfWeek === dayName);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-48 rounded-xl border-2 transition-all duration-200 p-4 cursor-pointer hover:shadow-lg ${
                  isToday 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : selectedDay === dayName
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
                onClick={() => setSelectedDay(selectedDay === dayName ? null : dayName)}
              >
                <div className="text-center mb-4">
                  <div className={`font-bold text-lg ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                    {dayName}
                  </div>
                  <div className={`text-sm ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                    {formatDate(date)}
                  </div>
                  {isToday && (
                    <div className="inline-block px-2 py-1 bg-blue-500 text-white text-xs rounded-full mt-1">
                      Today
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {daySlots.map((slot, slotIndex) => (
                    <div
                      key={slot.availabilityId || slotIndex}
                      className="group relative bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-3 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {slot.startTime} - {slot.endTime}
                          </div>
                          {slot.recurring && (
                            <div className="flex items-center mt-1 text-blue-100">
                              <Clock size={12} className="mr-1" />
                              <span className="text-xs">Weekly</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(slot);
                            }}
                            className="p-1 rounded hover:bg-blue-400 transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              tutorAvailabilityAPI.deleteAvailability(slot.availabilityId!);
                            }}
                            className="p-1 rounded hover:bg-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {daySlots.length === 0 && (
                    <div className="text-center text-gray-400 py-4">
                      <Clock size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No availability</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBeautifulClassCard = (cls: Class) => {
    const classType = classTypes.find(type => type.id === cls.classTypeId) || classTypes[0];
    const subject = subjects.find(s => s.subjectId === cls.subjectId);
    const classDocs_ = classDocs[cls.classId!] || [];
    
    return (
      <div
        key={cls.classId}
        className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
              {cls.className.charAt(0).toUpperCase()}
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
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-gray-700 flex items-center">
              <FileText size={16} className="mr-2 text-blue-600" />
              Documents ({classDocs_.length})
            </h4>
            <button
              onClick={() => {
                setSelectedDocClass(cls.classId!);
                setShowAddDocModal(true);
              }}
              className="flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus size={14} className="mr-1" />
              Add
            </button>
          </div>
          
          {classDocs_.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {classDocs_.map((doc) => (
                <div
                  key={doc.docId}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText size={14} className="text-orange-600" />
                    </div>
                    <div>
                      <a
                        href={doc.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 hover:text-blue-600 transition-colors font-medium text-sm"
                      >
                        {doc.docType}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-blue-50 rounded text-blue-600">
                      <Eye size={12} />
                    </button>
                    <button className="p-1 hover:bg-green-50 rounded text-green-600">
                      <Download size={12} />
                    </button>
                    <button
                      onClick={() => classDocAPI.deleteClassDoc(doc.docId!)}
                      className="p-1 hover:bg-red-50 rounded text-red-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <FileText size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">No documents uploaded yet</p>
              <button
                onClick={() => {
                  setSelectedDocClass(cls.classId!);
                  setShowAddDocModal(true);
                }}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Upload your first document
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-purple-400 animate-pulse mx-auto"></div>
          </div>
          <p className="text-blue-600 font-medium">Loading your dashboard...</p>
          <p className="text-gray-500 text-sm mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-8xl mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-white via-blue-50 to-white rounded-3xl shadow-xl p-8 border border-blue-100">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tutor Dashboard
            </h1>
            <div className="flex items-center space-x-3">
              <div className="flex bg-white rounded-xl shadow-md p-1">
                {['schedule', 'classes', 'analytics'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium capitalize ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Enhanced User Info */}
          {user ? (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-6">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-20 h-20 rounded-2xl border-4 border-white/20 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border-4 border-white/20">
                    <User className="text-white" size={32} />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Welcome back, {user.username}!</h2>
                  <div className="flex items-center space-x-6 text-blue-100">
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2" />
                      {user.email}
                    </div>
                    <div className="flex items-center">
                      <Tag size={16} className="mr-2" />
                      {user.role}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center bg-white/20 rounded-lg px-3 py-1">
                      <Star className="text-yellow-300 mr-1" size={16} />
                      <span className="text-sm font-medium">4.9 Rating</span>
                    </div>
                    <div className="flex items-center bg-white/20 rounded-lg px-3 py-1">
                      <Users className="mr-1" size={16} />
                      <span className="text-sm font-medium">124 Students</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-blue-600 bg-blue-50 rounded-2xl">
              <User size={48} className="mx-auto mb-4 text-blue-400" />
              <p className="text-lg font-medium">Please log in to view your profile</p>
            </div>
          )}
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-green-600">
                  <TrendingUp size={14} className="mr-1" />
                  <span className="text-sm font-medium">+12% this week</span>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 text-red-700 shadow-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <X size={16} className="text-red-600" />
              </div>
              {error}
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-8">
            {/* Interactive Calendar */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Schedule Management</h2>
              <button
                onClick={() => setShowAddTimeSlotModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <Plus size={18} className="mr-2" />
                Add Time Slot
              </button>
            </div>
            
            {renderInteractiveCalendar()}
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="space-y-8">
            {/* Classes Section */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">My Classes</h2>
              <button
                onClick={() => setShowAddClassModal(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <Plus size={18} className="mr-2" />
                Create Class
              </button>
            </div>

            {classes.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {classes.map((cls) => renderBeautifulClassCard(cls))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl border border-gray-100">
                <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Classes Yet</h3>
                <p className="text-gray-500 mb-6">Create your first class to get started with teaching!</p>
                <button
                  onClick={() => setShowAddClassModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  <Plus size={18} className="mr-2" />
                  Create Your First Class
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Teaching Subjects */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl p-6 border border-purple-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Award className="mr-3 text-purple-600" size={24} />
                  Teaching Subjects
                </h2>
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
                  <Activity className="mr-3 text-blue-600" size={24} />
                  Performance Overview
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-700">Weekly Hours</h3>
                      <Clock className="text-blue-600" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">24.5</p>
                    <p className="text-sm text-green-600 mt-1">+3.2 from last week</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-700">Student Satisfaction</h3>
                      <Star className="text-yellow-500" size={20} />
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
        )}

        {/* Enhanced Modals */}
        {(showAddTimeSlotModal || showEditModal || showAddClassModal || showAddDocModal) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              
              {/* Add Time Slot Modal */}
              {showAddTimeSlotModal && (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Add Time Slot</h2>
                      <p className="text-gray-500 mt-1">Create a new availability window</p>
                    </div>
                    <button 
                      onClick={closeModal} 
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <X size={24} className="text-gray-400" />
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
                      onClick={closeModal} 
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <X size={24} className="text-gray-400" />
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
                      onClick={closeModal} 
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <X size={24} className="text-gray-400" />
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
                      onClick={closeModal} 
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <X size={24} className="text-gray-400" />
                    </button>
                  </div>
                  
                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Document Title</label>
                      <input
                        type="text"
                        className="w-full border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., Lesson Notes, Assignment Sheet"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Document</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                        <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600 mb-2">Drag and drop your file here, or</p>
                        <input
                          type="file"
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-colors inline-block"
                        >
                          Browse Files
                        </label>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
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