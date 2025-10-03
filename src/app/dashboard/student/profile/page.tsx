"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, BookOpen, Calendar, Edit, GraduationCap, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { EDUCATION_LEVELS, STREAMS, type StudentProfile } from "@/types"

export default function ProfilePage() {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [profile, setProfile] = useState<StudentProfile>({
    id: "1",
    firstName: "Anika",
    lastName: "Perera",
    username: "anika_p",
    profilePicture: "/diverse-student-profiles.png",
    educationLevel: "highschool_advanced_level",
    stream: "mathematics",
    totalClassesAttended: 24,
    totalSessionsAttended: 156,
  })

  const [editForm, setEditForm] = useState(profile)

  const handleSaveProfile = () => {
    setProfile(editForm)
    setIsEditOpen(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditForm({ ...editForm, profilePicture: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Student Profile</h1>
          <p className="text-slate-600">Manage your learning journey</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-8 border-blue-200 bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Basic Information</CardTitle>
            <CardDescription className="text-blue-100">Your personal details and academic information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Picture */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                    <AvatarImage src={profile.profilePicture || "/placeholder.svg"} alt={profile.firstName} />
                    {/* AVATAR FALLBACK FIX: Changed from pink/rose gradient to blue/indigo gradient */}
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                      {profile.firstName[0]}
                      {profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full shadow-lg bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-white border-blue-200 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-slate-900 text-xl">Edit Profile</DialogTitle>
                        <DialogDescription className="text-slate-600">Update your profile information</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="picture" className="text-slate-700 font-medium">Profile Picture</Label>
                          <Input
                            id="picture"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName" className="text-slate-700 font-medium">First Name</Label>
                            <Input
                              id="firstName"
                              value={editForm.firstName}
                              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                              className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName" className="text-slate-700 font-medium">Last Name</Label>
                            <Input
                              id="lastName"
                              value={editForm.lastName}
                              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                              className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="username" className="text-slate-700 font-medium">Username</Label>
                          <Input
                            id="username"
                            value={editForm.username}
                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                            className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="education" className="text-slate-700 font-medium">Education Level</Label>
                          <Select
                            value={editForm.educationLevel}
                            onValueChange={(value) => setEditForm({ ...editForm, educationLevel: value })}
                          >
                            <SelectTrigger className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200">
                              {EDUCATION_LEVELS.map((level) => (
                                <SelectItem key={level.value} value={level.value} className="hover:bg-blue-50">
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="stream" className="text-slate-700 font-medium">Stream</Label>
                          <Select
                            value={editForm.stream}
                            onValueChange={(value) => setEditForm({ ...editForm, stream: value })}
                          >
                            <SelectTrigger className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200">
                              {STREAMS.map((stream) => (
                                <SelectItem key={stream.value} value={stream.value} className="hover:bg-blue-50">
                                  {stream.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleSaveProfile} className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-blue-100 text-sm">First Name</Label>
                    <p className="text-lg font-semibold text-white mt-1">{profile.firstName}</p>
                  </div>
                  <div>
                    <Label className="text-blue-100 text-sm">Last Name</Label>
                    <p className="text-lg font-semibold text-white mt-1">{profile.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-blue-100 text-sm">Username</Label>
                    <p className="text-lg font-semibold text-white mt-1">@{profile.username}</p>
                  </div>
                  <div>
                    <Label className="text-blue-100 text-sm">Education Level</Label>
                    <p className="text-lg font-semibold text-white mt-1">
                      {EDUCATION_LEVELS.find((l) => l.value === profile.educationLevel)?.label}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-blue-100 text-sm">Stream</Label>
                    <p className="text-lg font-semibold text-white mt-1">
                      {STREAMS.find((s) => s.value === profile.stream)?.label}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-400">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white/20 backdrop-blur-sm shadow-md hover:bg-white/30 transition-all">
                    <div className="p-2 rounded-full bg-white/30">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{profile.totalClassesAttended}</p>
                      <p className="text-sm text-blue-100">Classes Attended</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white/20 backdrop-blur-sm shadow-md hover:bg-white/30 transition-all">
                    <div className="p-2 rounded-full bg-white/30">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{profile.totalSessionsAttended}</p>
                      <p className="text-sm text-blue-100">Sessions Attended</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/student/profile/payments">
            <Card className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-slate-200 bg-white shadow-md group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 group-hover:from-green-200 group-hover:to-emerald-200 transition-all">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-600 text-white hover:bg-green-700 shadow-sm">
                    View All
                  </Badge>
                </div>
                <CardTitle className="text-slate-900 mt-4 text-xl">Payment History</CardTitle>
                <CardDescription className="text-slate-600">View all your payment transactions and billing details</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/student/profile/classes">
            <Card className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-slate-200 bg-white shadow-md group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
                    Manage
                  </Badge>
                </div>
                <CardTitle className="text-slate-900 mt-4 text-xl">Current Classes</CardTitle>
                <CardDescription className="text-slate-600">Access your enrolled classes, materials, and recorded videos</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/student/profile/bookings">
            <Card className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-slate-200 bg-white shadow-md group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200 transition-all">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-600 text-white hover:bg-purple-700 shadow-sm">
                    Schedule
                  </Badge>
                </div>
                <CardTitle className="text-slate-900 mt-4 text-xl">My Bookings</CardTitle>
                <CardDescription className="text-slate-600">View and manage your upcoming class bookings</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}