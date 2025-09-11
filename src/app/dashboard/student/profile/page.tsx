"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button-enhanced"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProfileCard } from "@/components/ui/profile-card"
import { ProfileSection } from "@/components/ui/profile-section"
import { ProfileAvatar } from "@/components/ui/profile-avatar"
import { useTheme } from "next-themes"
import { Edit3, Save, X, BookOpen, CreditCard, User, GraduationCap, Calendar, FileText } from "lucide-react"

interface StudentData {
  username: string
  firstName: string
  lastName: string
  age: string
  stream: string
  preferredSubjects: string[]
  bio: string
  profilePicture: string
}

const STREAMS = [
  { value: "maths", label: "Mathematics" },
  { value: "bio", label: "Biology" },
  { value: "art", label: "Arts" },
  { value: "commerce", label: "Commerce" },
]

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Economics",
  "Computer Science",
  "Art",
  "Music",
  "Physical Education",
]

export default function StudentProfileEnhanced() {
  const { theme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [studentData, setStudentData] = useState<StudentData>({
    username: "john_doe_2024",
    firstName: "John",
    lastName: "Doe",
    age: "18",
    stream: "maths",
    preferredSubjects: ["Mathematics", "Physics", "Computer Science"],
    bio: "Passionate about mathematics and technology. Love solving complex problems and exploring new concepts in computer science.",
    profilePicture: "/student-profile.png",
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Profile</h1>
            <p className="text-muted-foreground">Manage your academic information and preferences</p>
          </div>

          {!isEditing ? (
            <Button onClick={handleEdit} variant="outline" size="lg">
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="lg">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="outline" size="lg">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <ProfileCard variant="elevated" className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <ProfileAvatar
                  src={isEditing ? editData.profilePicture : studentData.profilePicture}
                  size="xl"
                  variant="glow"
                  editable={isEditing}
                  onEdit={() => document.getElementById("profile-upload")?.click()}
                />

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
                  <h2 className="text-xl font-semibold text-foreground">
                    @{isEditing ? editData.username : studentData.username}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {isEditing
                      ? `${editData.firstName} ${editData.lastName}`
                      : `${studentData.firstName} ${studentData.lastName}`}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="w-full space-y-3 pt-4">
                  <Button variant="outline" size="lg" className="w-full bg-transparent">
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Class Details
                  </Button>
                  <Button variant="outline" size="lg" className="w-full bg-transparent">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment History
                  </Button>
                </div>
              </div>
            </ProfileCard>
          </div>

          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <ProfileCard variant="gradient">
              <ProfileSection title="Personal Information" titleVariant="primary" variant="bordered">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Username
                    </label>
                    {isEditing ? (
                      <Input
                        value={editData.username}
                        onChange={(e) => setEditData((prev) => ({ ...prev, username: e.target.value }))}
                        placeholder="Enter username"
                      />
                    ) : (
                      <p className="text-muted-foreground bg-muted/50 rounded-md px-3 py-2">{studentData.username}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Age
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.age}
                        onChange={(e) => setEditData((prev) => ({ ...prev, age: e.target.value }))}
                        placeholder="Enter age"
                      />
                    ) : (
                      <p className="text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                        {studentData.age} years old
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">First Name</label>
                    {isEditing ? (
                      <Input
                        value={editData.firstName}
                        onChange={(e) => setEditData((prev) => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter first name"
                      />
                    ) : (
                      <p className="text-muted-foreground bg-muted/50 rounded-md px-3 py-2">{editData.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Last Name</label>
                    {isEditing ? (
                      <Input
                        value={editData.lastName}
                        onChange={(e) => setEditData((prev) => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter last name"
                      />
                    ) : (
                      <p className="text-muted-foreground bg-muted/50 rounded-md px-3 py-2">{editData.lastName}</p>
                    )}
                  </div>
                </div>
              </ProfileSection>

              {/* Academic Information */}
              <ProfileSection title="Academic Information" titleVariant="primary" variant="bordered">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Stream
                    </label>
                    {isEditing ? (
                      <Select
                        value={editData.stream}
                        onValueChange={(value) => setEditData((prev) => ({ ...prev, stream: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your stream" />
                        </SelectTrigger>
                        <SelectContent>
                          {STREAMS.map((stream) => (
                            <SelectItem key={stream.value} value={stream.value}>
                              {stream.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                        {STREAMS.find((s) => s.value === studentData.stream)?.label}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Preferred Subjects</label>
                    {isEditing ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {SUBJECTS.map((subject) => (
                          <button
                            key={subject}
                            onClick={() => handleSubjectToggle(subject)}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                              editData.preferredSubjects.includes(subject)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-foreground border-border hover:bg-accent"
                            }`}
                          >
                            {subject}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {studentData.preferredSubjects.map((subject) => (
                          <span
                            key={subject}
                            className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded-full border border-border"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ProfileSection>

              {/* Bio Section */}
              <ProfileSection title="About Me" titleVariant="primary">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Bio
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={editData.bio}
                      onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-muted-foreground bg-muted/50 rounded-md px-3 py-3 leading-relaxed">
                      {studentData.bio}
                    </p>
                  )}
                </div>
              </ProfileSection>
            </ProfileCard>
          </div>
        </div>
      </div>
    </div>
  )
}
