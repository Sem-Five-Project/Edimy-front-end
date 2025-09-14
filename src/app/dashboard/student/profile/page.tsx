"use client"

import React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Camera
} from "lucide-react"

interface StudentData {
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  age: string
  grade: string
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

const STREAMS = [
  { value: "mathematics", label: "Mathematics" },
  { value: "biology", label: "Biology" },
  { value: "arts", label: "Arts" },
  { value: "commerce", label: "Commerce" },
  { value: "technology", label: "Technology" },
]

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English Literature",
  "History",
  "Geography",
  "Economics",
  "Computer Science",
  "Art & Design",
  "Music",
  "Physical Education",
  "Psychology",
  "Philosophy",
]

const ACHIEVEMENTS = [
  "Honor Roll Student",
  "Perfect Attendance",
  "Mathematics Excellence",
  "Science Fair Winner",
  "Community Service Award",
  "Leadership Award",
  "Academic Excellence",
  "Creative Writing Winner"
]

export default function StudentProfileEnhanced() {
  const [isEditing, setIsEditing] = useState(false)
  const [studentData, setStudentData] = useState<StudentData>({
    username: "alex_chen_2024",
    firstName: "Alexandra",
    lastName: "Chen",
    email: "alexandra.chen@student.edu",
    phone: "+1 (555) 123-4567",
    age: "17",
    grade: "Grade 12",
    stream: "mathematics",
    preferredSubjects: ["Mathematics", "Physics", "Computer Science", "Chemistry"],
    bio: "Passionate mathematics and science student with a deep love for problem-solving and technology. I enjoy exploring complex mathematical concepts, coding in Python and JavaScript, and participating in science competitions. My goal is to pursue computer engineering and contribute to innovative technological solutions that can make a positive impact on society.",
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616c667bdf4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    address: "123 Oak Street, Springfield, IL 62701",
    gpa: "3.95",
    totalLessons: 142,
    completedAssignments: 89,
    achievements: ["Honor Roll Student", "Mathematics Excellence", "Science Fair Winner", "Perfect Attendance"],
    joinedDate: "September 2023"
  })

  const [editData, setEditData] = useState<StudentData>(studentData)

  const handleEdit = () => {
    setEditData(studentData)
    setIsEditing(true)
  }

  const handleSave = () => {
    setStudentData(editData)
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

  const handleAchievementToggle = (achievement: string) => {
    setEditData((prev) => ({
      ...prev,
      achievements: prev.achievements.includes(achievement)
        ? prev.achievements.filter((a) => a !== achievement)
        : [...prev.achievements, achievement],
    }))
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Student Profile
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">Manage your academic journey and achievements</p>
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
            <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white/90 via-blue-50/80 to-purple-50/90 dark:from-slate-800/90 dark:via-blue-900/80 dark:to-purple-900/90 backdrop-blur-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-indigo-400/10"></div>
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
                    <p className="text-slate-600 dark:text-slate-300">
                      {currentData.grade} • {STREAMS.find(s => s.value === currentData.stream)?.label}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                      <div className="relative z-10">
                        <div className="text-2xl font-bold">{currentData.gpa}</div>
                        <div className="text-xs opacity-90 font-medium">GPA</div>
                      </div>
                    </div>
                    <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                      <div className="relative z-10">
                        <div className="text-2xl font-bold">{currentData.totalLessons}</div>
                        <div className="text-xs opacity-90 font-medium">Lessons</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="w-full space-y-3">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100 border-2 border-blue-200 hover:border-purple-300 text-blue-700 hover:text-purple-700 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Schedule
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

            {/* Achievements */}
            <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white/90 via-yellow-50/80 to-orange-50/90 dark:from-slate-800/90 dark:via-yellow-900/20 dark:to-orange-900/20 backdrop-blur-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-red-400/10"></div>
              <CardHeader className="pb-3 relative z-10">
                <CardTitle className="text-lg font-semibold flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 relative z-10">
                {isEditing ? (
                  <div className="space-y-2">
                    {ACHIEVEMENTS.map((achievement) => (
                      <button
                        key={achievement}
                        onClick={() => handleAchievementToggle(achievement)}
                        className={`w-full p-3 text-sm rounded-xl border-2 transition-all duration-300 text-left font-medium ${
                          editData.achievements.includes(achievement)
                            ? "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300 shadow-md"
                            : "bg-gradient-to-r from-slate-50 to-gray-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-md"
                        }`}
                      >
                        {achievement}
                      </button>
                    ))}
                  </div>
                ) : (
                  currentData.achievements.map((achievement) => (
                    <Badge key={achievement} variant="secondary" className="w-full justify-center p-3 bg-gradient-to-r from-yellow-100 via-orange-100 to-amber-100 hover:from-yellow-200 hover:via-orange-200 hover:to-amber-200 text-yellow-800 border-2 border-yellow-200 shadow-md hover:shadow-lg transition-all duration-300">
                      <Star className="h-3 w-3 mr-2" />
                      {achievement}
                    </Badge>
                  ))
                )}
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
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-500" />
                      Phone
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                        className="border-2 border-blue-200 focus:border-purple-400 bg-white/80 backdrop-blur-sm rounded-xl shadow-md focus:shadow-lg transition-all duration-300"
                      />
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-blue-800 rounded-xl px-4 py-3 shadow-md border border-slate-200 dark:border-slate-600">{currentData.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      Age
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.age}
                        onChange={(e) => setEditData((prev) => ({ ...prev, age: e.target.value }))}
                        placeholder="Enter age"
                        className="border-2 border-blue-200 focus:border-purple-400 bg-white/80 backdrop-blur-sm rounded-xl shadow-md focus:shadow-lg transition-all duration-300"
                      />
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-blue-800 rounded-xl px-4 py-3 shadow-md border border-slate-200 dark:border-slate-600">
                        {currentData.age} years old
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Grade</label>
                    {isEditing ? (
                      <Input
                        value={editData.grade}
                        onChange={(e) => setEditData((prev) => ({ ...prev, grade: e.target.value }))}
                        placeholder="Enter grade"
                        className="border-2 border-blue-200 focus:border-purple-400 bg-white/80 backdrop-blur-sm rounded-xl shadow-md focus:shadow-lg transition-all duration-300"
                      />
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-blue-800 rounded-xl px-4 py-3 shadow-md border border-slate-200 dark:border-slate-600">{currentData.grade}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    Address
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={editData.address}
                      onChange={(e) => setEditData((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter address"
                      className="border-2 border-blue-200 focus:border-purple-400 bg-white/80 backdrop-blur-sm rounded-xl shadow-md focus:shadow-lg transition-all duration-300 min-h-[100px]"
                    />
                  ) : (
                    <p className="text-slate-700 dark:text-slate-300 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-blue-800 rounded-xl px-4 py-3 shadow-md border border-slate-200 dark:border-slate-600">{currentData.address}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white/95 via-purple-50/80 to-indigo-50/90 dark:from-slate-800/95 dark:via-purple-900/20 dark:to-indigo-900/30 backdrop-blur-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 via-indigo-400/5 to-blue-400/10"></div>
              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="text-xl font-semibold flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  <GraduationCap className="h-5 w-5 text-purple-500" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Stream</label>
                    {isEditing ? (
                      <Select
                        value={editData.stream}
                        onValueChange={(value) => setEditData((prev) => ({ ...prev, stream: value }))}
                      >
                        <SelectTrigger className="border-2 border-purple-200 focus:border-indigo-400 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                          <SelectValue placeholder="Select your stream" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-lg border-purple-200 shadow-xl rounded-xl">
                          {STREAMS.map((stream) => (
                            <SelectItem key={stream.value} value={stream.value} className="hover:bg-purple-50 rounded-lg">
                              {stream.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl px-4 py-3 shadow-md border border-purple-200 dark:border-purple-700">
                        {STREAMS.find((s) => s.value === currentData.stream)?.label}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">GPA</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        value={editData.gpa}
                        onChange={(e) => setEditData((prev) => ({ ...prev, gpa: e.target.value }))}
                        placeholder="Enter GPA"
                        className="border-2 border-purple-200 focus:border-indigo-400 bg-white/80 backdrop-blur-sm rounded-xl shadow-md focus:shadow-lg transition-all duration-300"
                      />
                    ) : (
                      <p className="text-slate-700 dark:text-slate-300 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl px-4 py-3 shadow-md border border-purple-200 dark:border-purple-700">{currentData.gpa}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Preferred Subjects</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {SUBJECTS.map((subject) => (
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
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t-2 border-gradient-to-r from-purple-200 to-blue-200">
                  <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-blue-800/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-sm font-semibold">Total Lessons</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">{currentData.totalLessons}</div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-emerald-900/30 dark:via-green-900/30 dark:to-emerald-800/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 mb-2">
                        <Target className="h-5 w-5" />
                        <span className="text-sm font-semibold">Completed</span>
                      </div>
                      <div className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">{currentData.completedAssignments}</div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-purple-800/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-2">
                        <Clock className="h-5 w-5" />
                        <span className="text-sm font-semibold">Joined</span>
                      </div>
                      <div className="text-lg font-bold text-purple-800 dark:text-purple-200">{currentData.joinedDate}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bio Section */}
            <Card className="relative overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white/95 via-green-50/80 to-emerald-50/90 dark:from-slate-800/95 dark:via-green-900/20 dark:to-emerald-900/30 backdrop-blur-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 via-emerald-400/5 to-teal-400/10"></div>
              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="text-xl font-semibold flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  <FileText className="h-5 w-5 text-green-500" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-2">
                  {isEditing ? (
                    <Textarea
                      value={editData.bio}
                      onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself, your goals, and interests..."
                      rows={6}
                      className="border-2 border-green-200 focus:border-emerald-400 bg-white/80 backdrop-blur-sm rounded-xl shadow-md focus:shadow-lg transition-all duration-300 resize-none min-h-[150px]"
                    />
                  ) : (
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <p className="text-slate-700 dark:text-slate-300 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl px-6 py-4 leading-relaxed border-l-4 border-green-400 shadow-md">
                        {currentData.bio}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}