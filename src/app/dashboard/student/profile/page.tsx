"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext" // Import your useAuth hook
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Edit3, 
  Save, 
  X, 
  BookOpen, 
  CreditCard, 
  User, 
  GraduationCap, 
  Calendar, 
  FileText,
  Award,
  Target,
  Clock,
  TrendingUp,
  Star,
  Mail,
  Phone,
  MapPin,
  Camera,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle
} from "lucide-react"

interface StudentData {
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  age: string
  grade: string
  educationLevel: string
  stream: string
  preferredSubjects: string[]
  bio: string
  profilePicture: string
  address: string
  gpa: string
  totalLessons: number
  completedAssignments: number
  achievements: string[]
  joinedDate: string
}

interface EducationLevel {
  value: string
  label: string
}

interface Stream {
  value: string
  label: string
}

interface OngoingClass {
  id: string
  subject: string
  tutor: string
  classType: 'monthly' | 'one-time'
  nextSession: string
  time: string
  isPaid: boolean
  monthlyFee?: number
}

interface BookedClass {
  id: string
  subject: string
  tutor: string
  classType: 'monthly' | 'one-time'
  scheduledDate: string
  time: string
  fee: number
  isPaid: boolean
  canCancel: boolean
}

// API Mock Functions
const fetchEducationLevels = async () => {
  // Simulate API call
  try {
    // Replace with actual API call
    // const response = await fetch('/api/education-levels')
    // return response.json()
    
    // Return dummy data if API fails
    return [
      { value: "grade-1-5", label: "Grade 1-5" },
      { value: "grade-6-11", label: "Grade 6-11" },
      { value: "ordinary-level", label: "Ordinary Level" },
      { value: "advanced-level", label: "Advanced Level" }
    ]
  } catch (error) {
    console.error('Failed to fetch education levels:', error)
    return [
      { value: "grade-1-5", label: "Grade 1-5" },
      { value: "grade-6-11", label: "Grade 6-11" },
      { value: "ordinary-level", label: "Ordinary Level" },
      { value: "advanced-level", label: "Advanced Level" }
    ]
  }
}

const fetchStreams = async (educationLevel: string) => {
  try {
    // Replace with actual API call
    // const response = await fetch(`/api/streams?educationLevel=${educationLevel}`)
    // return response.json()
    
    // Return dummy data if API fails
    if (educationLevel === "advanced-level") {
      return [
        { value: "mathematics", label: "Mathematics" },
        { value: "biology", label: "Biology" },
        { value: "arts", label: "Arts" },
        { value: "commerce", label: "Commerce" },
        { value: "technology", label: "Technology" }
      ]
    }
    return []
  } catch (error) {
    console.error('Failed to fetch streams:', error)
    if (educationLevel === "advanced-level") {
      return [
        { value: "mathematics", label: "Mathematics" },
        { value: "biology", label: "Biology" },
        { value: "arts", label: "Arts" },
        { value: "commerce", label: "Commerce" },
        { value: "technology", label: "Technology" }
      ]
    }
    return []
  }
}

const fetchSubjects = async (educationLevel: string, stream?: string) => {
  try {
    // Replace with actual API call
    // const response = await fetch(`/api/subjects?educationLevel=${educationLevel}&stream=${stream}`)
    // return response.json()
    
    // Return dummy data based on education level and stream
    if (educationLevel === "advanced-level" && stream === "mathematics") {
      return ["Combined Mathematics", "Physics", "Chemistry", "ICT"]
    } else if (educationLevel === "advanced-level" && stream === "biology") {
      return ["Biology", "Chemistry", "Physics", "Agricultural Science"]
    } else if (educationLevel === "ordinary-level") {
      return ["Mathematics", "Science", "English", "Sinhala", "History", "Geography", "Health & Physical Education", "Art", "ICT"]
    } else if (educationLevel === "grade-6-11") {
      return ["Mathematics", "Science", "English", "Sinhala", "Social Studies", "Health & Physical Education", "Art", "ICT"]
    } else {
      return ["Mathematics", "English", "Sinhala", "Environmental Studies", "Health & Physical Education", "Art"]
    }
  } catch (error) {
    console.error('Failed to fetch subjects:', error)
    return ["Mathematics", "Science", "English", "Sinhala"]
  }
}

// OngoingClassCard Component
const OngoingClassCard = ({ classData, onClick }: { classData: OngoingClass, onClick: () => void }) => (
  <Card className="relative overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white/95 to-blue-50/90 hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={onClick}>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-purple-400/10 group-hover:from-blue-400/10 group-hover:to-purple-400/15 transition-all duration-300"></div>
    <CardContent className="p-4 relative z-10">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-slate-800 group-hover:text-blue-700 transition-colors">{classData.subject}</h3>
          <p className="text-sm text-slate-600">with {classData.tutor}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={classData.isPaid ? "default" : "destructive"} className="text-xs">
            {classData.isPaid ? "Paid" : "Unpaid"}
          </Badge>
          <Badge variant={classData.classType === "monthly" ? "secondary" : "outline"} className="text-xs">
            {classData.classType === "monthly" ? "Monthly" : "One-time"}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>Next: {classData.nextSession}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="h-4 w-4 text-purple-500" />
          <span>{classData.time}</span>
        </div>
        {classData.classType === "monthly" && classData.monthlyFee && (
          <div className="flex items-center gap-2 text-slate-600">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span>Rs. {classData.monthlyFee}/month</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <Button variant="outline" size="sm" className="text-xs">
          <Eye className="h-3 w-3 mr-1" />
          View Details
        </Button>
        {!classData.isPaid && classData.classType === "monthly" && (
          <Button size="sm" className="text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
            Pay Now
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
)

// BookedClassCard Component
const BookedClassCard = ({ bookingData, onClick }: { bookingData: BookedClass, onClick: () => void }) => (
  <Card className="relative overflow-hidden shadow-lg border-0 bg-gradient-to-br from-white/95 to-purple-50/90 hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={onClick}>
    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-pink-400/10 group-hover:from-purple-400/10 group-hover:to-pink-400/15 transition-all duration-300"></div>
    <CardContent className="p-4 relative z-10">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-slate-800 group-hover:text-purple-700 transition-colors">{bookingData.subject}</h3>
          <p className="text-sm text-slate-600">with {bookingData.tutor}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={bookingData.isPaid ? "default" : "destructive"} className="text-xs">
            {bookingData.isPaid ? "Paid" : "Unpaid"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {bookingData.classType}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="h-4 w-4 text-purple-500" />
          <span>{bookingData.scheduledDate}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="h-4 w-4 text-pink-500" />
          <span>{bookingData.time}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <DollarSign className="h-4 w-4 text-green-500" />
          <span>Rs. {bookingData.fee}</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <Button variant="outline" size="sm" className="text-xs">
          <Eye className="h-3 w-3 mr-1" />
          View Details
        </Button>
        {bookingData.canCancel && (
          <Button variant="destructive" size="sm" className="text-xs">
            <XCircle className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
)

export default function StudentProfileEnhanced() {
  const { user, isLoading: isAuthLoading, updateUser } = useAuth() // Add this line to use AuthContext

  const [isEditing, setIsEditing] = useState(false)
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([])
  const [streams, setStreams] = useState<Stream[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const [studentData, setStudentData] = useState<StudentData>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "+1 (555) 123-4567",
    age: "17",
    grade: "Grade 12",
    educationLevel: "advanced-level",
    stream: "mathematics",
    preferredSubjects: ["Combined Mathematics", "Physics", "Chemistry", "ICT"],
    bio: "Passionate mathematics and science student with a deep love for problem-solving and technology.",
    profilePicture: "",
    address: "123 Oak Street, Springfield, IL 62701",
    gpa: "3.95",
    totalLessons: 142,
    completedAssignments: 89,
    achievements: ["Honor Roll Student", "Mathematics Excellence", "Science Fair Winner"],
    joinedDate: "September 2023"
  })

  const [editData, setEditData] = useState<StudentData>(studentData)

  // Effect to sync user data from AuthContext to local state
  useEffect(() => {
    if (user) {
      const profileData = {
        ...studentData, // Keep existing mock data for fields not in auth response
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        profilePicture: user.profileImage || "https://images.unsplash.com/photo-1494790108755-2616c667bdf4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
      }
      setStudentData(profileData)
      if (!isEditing) {
        setEditData(profileData)
      }
    }
  }, [user, isEditing])

  // Dummy data for ongoing and booked classes
  const [ongoingClasses] = useState<OngoingClass[]>([
    {
      id: "1",
      subject: "Combined Mathematics",
      tutor: "Dr. Sarah Johnson",
      classType: "monthly",
      nextSession: "2025-09-25",
      time: "2:00 PM - 4:00 PM",
      isPaid: true,
      monthlyFee: 5000
    },
    {
      id: "2",
      subject: "Physics",
      tutor: "Prof. Michael Chen",
      classType: "monthly",
      nextSession: "2025-09-26",
      time: "10:00 AM - 12:00 PM",
      isPaid: false,
      monthlyFee: 4500
    }
  ])

  const [bookedClasses] = useState<BookedClass[]>([
    {
      id: "1",
      subject: "Chemistry",
      tutor: "Dr. Emma Wilson",
      classType: "one-time",
      scheduledDate: "2025-09-28",
      time: "3:00 PM - 5:00 PM",
      fee: 2000,
      isPaid: true,
      canCancel: true
    },
    {
      id: "2",
      subject: "ICT",
      tutor: "Mr. David Kumar",
      classType: "one-time",
      scheduledDate: "2025-09-30",
      time: "1:00 PM - 3:00 PM",
      fee: 1500,
      isPaid: false,
      canCancel: true
    }
  ])

  useEffect(() => {
    loadEducationLevels()
  }, [])

  const loadEducationLevels = async () => {
    setLoading(true)
    try {
      const levels = await fetchEducationLevels()
      setEducationLevels(levels)
    } catch (error) {
      console.error('Error loading education levels:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEducationLevelChange = async (value: string) => {
    setEditData(prev => ({ ...prev, educationLevel: value, stream: "", preferredSubjects: [] }))
    
    if (value === "advanced-level") {
      const streamsData = await fetchStreams(value)
      setStreams(streamsData)
    } else {
      setStreams([])
    }
    
    const subjectsData = await fetchSubjects(value)
    setSubjects(subjectsData)
  }

  const handleStreamChange = async (value: string) => {
    setEditData(prev => ({ ...prev, stream: value, preferredSubjects: [] }))
    
    const subjectsData = await fetchSubjects(editData.educationLevel, value)
    setSubjects(subjectsData)
  }

  const handleEdit = async () => {
    setEditData(studentData)
    setIsEditing(true)
    
    // Load initial data for editing
    const levels = await fetchEducationLevels()
    setEducationLevels(levels)
    
    if (studentData.educationLevel === "advanced-level") {
      const streamsData = await fetchStreams(studentData.educationLevel)
      setStreams(streamsData)
    }
    
    const subjectsData = await fetchSubjects(studentData.educationLevel, studentData.stream)
    setSubjects(subjectsData)
  }

  const handleSave = () => {
    // Here you would call an API to save the profile data in `editData`
    // e.g., await userAPI.updateProfile(editData);
    
    // On success, update the local state and AuthContext
    setStudentData(editData)
    
    // Update the AuthContext with the new user data
    if (user) {
      updateUser({
        ...user,
        firstName: editData.firstName,
        lastName: editData.lastName,
        email: editData.email,
        username: editData.username,
        profileImage: editData.profilePicture || null,
      })
    }
    
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(studentData)
    setIsEditing(false)
  }

  const handleSubjectToggle = (subject: string) => {
    setEditData((prev) => ({
      ...prev,
      preferredSubjects: prev.preferredSubjects.includes(subject)
        ? prev.preferredSubjects.filter((s) => s !== subject)
        : [...prev.preferredSubjects, subject],
    }))
  }

  const handleClassClick = (classId: string) => {
    // Navigate to class detail page
    console.log('Navigate to ongoing class detail:', classId)
    // Here you would typically use router.push('/class-detail/' + classId)
  }

  const handleBookingClick = (bookingId: string) => {
    // Navigate to booking detail page
    console.log('Navigate to booking detail:', bookingId)
    // Here you would typically use router.push('/booking-detail/' + bookingId)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setEditData((prev) => ({ ...prev, profilePicture: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const currentData = isEditing ? editData : studentData

  // Show loading state while authentication is being checked
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Your Profile
            </h1>
          </div>

          {!isEditing ? (
            <Button 
              onClick={handleEdit} 
              variant="outline" 
              size="lg" 
              className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-blue-200 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 text-blue-700 hover:text-purple-700"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button 
                onClick={handleCancel} 
                variant="outline" 
                size="lg" 
                className="bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border-2 border-slate-300 hover:border-slate-400 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Picture & Basic Info */}
            <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white/95 via-blue-50/80 to-indigo-50/90 dark:from-slate-800/95 dark:via-blue-900/20 dark:to-indigo-900/30 backdrop-blur-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-indigo-400/10"></div>
              <CardContent className="pt-6 relative z-10">
                <div className="flex flex-col items-center space-y-6 text-center">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                    <Avatar className="relative w-32 h-32 border-4 border-white shadow-2xl">
                      <AvatarImage src={currentData.profilePicture} alt="Profile" />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {currentData.firstName[0]}{currentData.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                           onClick={() => document.getElementById("profile-upload")?.click()}>
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  )}

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                      {currentData.firstName} {currentData.lastName}
                    </h2>
                    <p className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-medium">
                      @{currentData.username}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="w-full space-y-3">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100 border-2 border-blue-200 hover:border-purple-300 text-blue-700 hover:text-purple-700 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Previous Sessions
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 hover:from-emerald-100 hover:via-green-100 hover:to-teal-100 border-2 border-emerald-200 hover:border-teal-300 text-emerald-700 hover:text-teal-700 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Personal Information */}
            <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white/95 via-blue-50/80 to-indigo-50/90 dark:from-slate-800/95 dark:via-blue-900/20 dark:to-indigo-900/30 backdrop-blur-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-indigo-400/10"></div>
              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="text-xl font-semibold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <User className="h-5 w-5 text-blue-500" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      First Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.firstName}
                        onChange={(e) => setEditData((prev) => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter first name"
                        className="border-2 border-blue-200 focus:border-purple-400 bg-white/80 backdrop-blur-sm rounded-xl shadow-md focus:shadow-lg transition-all duration-300"
                      />
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-blue-800 rounded-xl px-4 py-3 shadow-md border border-slate-200 dark:border-slate-600">{currentData.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                    {isEditing ? (
                      <Input
                        value={editData.lastName}
                        onChange={(e) => setEditData((prev) => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter last name"
                        className="border-2 border-blue-200 focus:border-purple-400 bg-white/80 backdrop-blur-sm rounded-xl shadow-md focus:shadow-lg transition-all duration-300"
                      />
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-blue-800 rounded-xl px-4 py-3 shadow-md border border-slate-200 dark:border-slate-600">{currentData.lastName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-purple-500" />
                      Email
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.email}
                        onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email"
                        type="email"
                        className="border-2 border-blue-200 focus:border-purple-400 bg-white/80 backdrop-blur-sm rounded-xl shadow-md focus:shadow-lg transition-all duration-300"
                      />
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-blue-800 rounded-xl px-4 py-3 shadow-md border border-slate-200 dark:border-slate-600">{currentData.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                    {isEditing ? (
                      <Input
                        value={editData.username}
                        onChange={(e) => setEditData((prev) => ({ ...prev, username: e.target.value }))}
                        placeholder="Enter username"
                        className="border-2 border-blue-200 focus:border-purple-400 bg-white/80 backdrop-blur-sm rounded-xl shadow-md focus:shadow-lg transition-all duration-300"
                      />
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-blue-800 rounded-xl px-4 py-3 shadow-md border border-slate-200 dark:border-slate-600">{currentData.username}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white/95 via-blue-50/80 to-indigo-50/90 dark:from-slate-800/95 dark:via-blue-900/20 dark:to-indigo-900/30 backdrop-blur-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-indigo-400/10"></div>
              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="text-xl font-semibold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Education Level</label>
                    {isEditing ? (
                      <Select
                        value={editData.educationLevel}
                        onValueChange={handleEducationLevelChange}
                        disabled={loading}
                      >
                        <SelectTrigger className="border-2 border-purple-200 focus:border-indigo-400 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                          <SelectValue placeholder="Select education level" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-lg border-purple-200 shadow-xl rounded-xl">
                          {educationLevels.map((level: any) => (
                            <SelectItem key={level.value} value={level.value} className="hover:bg-purple-50 rounded-lg">
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl px-4 py-3 shadow-md border border-purple-200 dark:border-purple-700">
                        {educationLevels.find((l: any) => l.value === currentData.educationLevel)?.label || currentData.educationLevel}
                      </p>
                    )}
                  </div>

                  {(editData.educationLevel === "advanced-level" || currentData.educationLevel === "advanced-level") && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Stream</label>
                      {isEditing ? (
                        <Select
                          value={editData.stream}
                          onValueChange={handleStreamChange}
                          disabled={loading || streams.length === 0}
                        >
                          <SelectTrigger className="border-2 border-purple-200 focus:border-indigo-400 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                            <SelectValue placeholder="Select stream" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-lg border-purple-200 shadow-xl rounded-xl">
                            {streams.map((stream: any) => (
                              <SelectItem key={stream.value} value={stream.value} className="hover:bg-purple-50 rounded-lg">
                                {stream.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-slate-700 dark:text-slate-300 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl px-4 py-3 shadow-md border border-purple-200 dark:border-purple-700">
                          {streams.find((s: any) => s.value === currentData.stream)?.label || currentData.stream}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Preferred Subjects</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {subjects.map((subject) => (
                        <button
                          key={subject}
                          onClick={() => handleSubjectToggle(subject)}
                          className={`px-3 py-2 text-sm rounded-xl border-2 transition-all duration-300 font-medium ${
                            editData.preferredSubjects.includes(subject)
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-500 shadow-lg transform scale-105"
                              : "bg-white/80 text-slate-700 border-slate-200 hover:border-purple-300 hover:shadow-md hover:bg-purple-50"
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {currentData.preferredSubjects.map((subject) => (
                        <Badge
                          key={subject}
                          variant="secondary"
                          className="px-3 py-2 bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 text-blue-800 border-2 border-blue-200 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div> */}

                {/* Progress Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t-2 border-gradient-to-r from-purple-200 to-blue-200">
                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-blue-800/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-sm font-semibold">Total Classes</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">{currentData.totalLessons}</div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-emerald-900/30 dark:via-green-900/30 dark:to-emerald-800/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 mb-2">
                        <Target className="h-5 w-5" />
                        <span className="text-sm font-semibold">Attended Sessions</span>
                      </div>
                      <div className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">{currentData.completedAssignments}</div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-900/30 dark:via-amber-900/30 dark:to-yellow-800/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 mb-2">
                        <Star className="h-5 w-5" />
                        <span className="text-sm font-semibold">Achievements</span>
                      </div>
                      <div className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">{currentData.achievements.length}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ongoing Classes Section */}
            <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white/95 via-blue-50/80 to-indigo-50/90 dark:from-slate-800/95 dark:via-blue-900/20 dark:to-indigo-900/30 backdrop-blur-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-indigo-400/10"></div>
              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="text-xl font-semibold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Ongoing Classes ({ongoingClasses.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                {ongoingClasses.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {ongoingClasses.map((classData) => (
                      <OngoingClassCard 
                        key={classData.id} 
                        classData={classData} 
                        onClick={() => handleClassClick(classData.id)} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No ongoing classes found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booked Classes Section */}
            <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white/95 via-purple-50/80 to-pink-50/90 dark:from-slate-800/95 dark:via-purple-900/20 dark:to-pink-900/30 backdrop-blur-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 via-pink-400/5 to-purple-400/10"></div>
              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="text-xl font-semibold flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Booked Classes ({bookedClasses.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                {bookedClasses.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {bookedClasses.map((bookingData) => (
                      <BookedClassCard 
                        key={bookingData.id} 
                        bookingData={bookingData} 
                        onClick={() => handleBookingClick(bookingData.id)} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No booked classes found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bio Section */}
            <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white/95 via-blue-50/80 to-indigo-50/90 dark:from-slate-800/95 dark:via-blue-900/20 dark:to-indigo-900/30 backdrop-blur-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-indigo-400/10"></div>
              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="text-xl font-semibold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <FileText className="h-5 w-5 text-blue-500" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                {isEditing ? (
                  <Textarea
                    value={editData.bio}
                    onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="border-2 border-blue-200 focus:border-purple-400 bg-white/80 backdrop-blur-sm rounded-xl shadow-md focus:shadow-lg transition-all duration-300 resize-none"
                  />
                ) : (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-blue-800 rounded-xl px-6 py-4 shadow-md border border-slate-200 dark:border-slate-600">
                    {currentData.bio}
                  </p>
                )}

                {/* Achievements */}
                {!isEditing && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      Achievements
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentData.achievements.map((achievement) => (
                        <Badge
                          key={achievement}
                          variant="outline"
                          className="px-3 py-2 bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-100 text-yellow-800 border-2 border-yellow-200 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}