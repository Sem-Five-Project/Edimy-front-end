"use client";

  import type React from "react";
  import { useEffect, useMemo, useState } from "react";
  import { useQuery, useQueryClient } from "@tanstack/react-query";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { CreditCard, BookOpen, Calendar, Edit, GraduationCap, CheckCircle2, Loader2 } from "lucide-react";
  import Link from "next/link";
  import { EDUCATION_LEVELS, STREAMS } from "@/types";
  import {studentAPI } from "@/lib/api";
  import { useAuth } from "@/contexts/AuthContext";

  type AcademicInfo = {
    educationLevel: string | null;
    stream: string | null;
    classCount?: number | 0;
    sessionCount?: number | 0;
  };

  export default function ProfilePage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Base profile from auth context (no network fetch)
    const firstName = user?.firstName ?? "";
    const lastName = user?.lastName ?? "";
    const username = user?.username ?? "";
    const profilePicture = user?.profilePicture ?? "";
    const userId = user?.id ?? "";

    // Academic info via React Query (cached across navigations)
    const {
      data: academic,
      isPending,
      isFetching,
      isError,
      error,
    } = useQuery<AcademicInfo>({
      queryKey: ["studentProfileInfo", userId],
      enabled: Boolean(userId),
      queryFn: async () => {
        const res = await studentAPI.loadStudentProfileInfo(userId);
        // The org API returns: { educationLevel, stream, classCount, sessionCount }
        return res.data;
      },
      // Extra safety; also configured in provider defaults
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    });

    const isAcademicLoading = isPending || isFetching;

    // Local edit state for academic fields only
    const [editForm, setEditForm] = useState<Pick<AcademicInfo, "educationLevel" | "stream">>({
      educationLevel: "",
      stream: "",
    });
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
      if (academic) {
        setEditForm({
          educationLevel: academic.educationLevel ?? "",
          stream: academic.stream ?? "",
        });
      }
    }, [academic]);

    const educationLevelLabel = useMemo(
      () => EDUCATION_LEVELS.find((l) => l.value === (academic?.educationLevel ?? ""))?.label ?? "Not set",
      [academic?.educationLevel]
    );
    const streamLabel = useMemo(
      () => STREAMS.find((s) => s.value === (academic?.stream ?? ""))?.label ?? "Not set",
      [academic?.stream]
    );

    // const handleSaveProfile = async () => {
    //   if (!userId) return;
    //   try {
    //     // Save to backend
    //     await studentAPI.updateStudentProfile(userId, {
    //       educationLevel: editForm.educationLevel,
    //       stream: editForm.stream,
    //     });

    //     // Optimistically update cached query data so we don't refetch
    //     queryClient.setQueryData<AcademicInfo>(["studentProfileInfo", userId], (prev) => ({
    //       educationLevel: editForm.educationLevel,
    //       stream: editForm.stream,
    //       classCount: prev?.classCount ?? 0,
    //       sessionCount: prev?.sessionCount ?? 0,
    //     }));

    //     setIsEditOpen(false);
    //   } catch (e) {
    //     console.error("Failed to update profile:", e);
    //   }
    // };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Only local preview; not persisted
        const reader = new FileReader();
        reader.onloadend = () => {
          // In this page we only preview; if you want to persist, add API + cache update
        };
        reader.readAsDataURL(file);
      }
    };

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
                      <AvatarImage src={profilePicture || "/placeholder.svg"} alt={firstName} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                        {firstName?.[0] || ""}
                        {lastName?.[0] || ""}
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
                                value={firstName}
                                disabled
                                className="mt-2 border-slate-300 bg-slate-100 cursor-not-allowed"
                              />
                              <p className="text-xs text-slate-500 mt-1">From account</p>
                            </div>
                            <div>
                              <Label htmlFor="lastName" className="text-slate-700 font-medium">Last Name</Label>
                              <Input
                                id="lastName"
                                value={lastName}
                                disabled
                                className="mt-2 border-slate-300 bg-slate-100 cursor-not-allowed"
                              />
                              <p className="text-xs text-slate-500 mt-1">From account</p>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="username" className="text-slate-700 font-medium">Username</Label>
                            <Input
                              id="username"
                              value={username}
                              disabled
                              className="mt-2 border-slate-300 bg-slate-100 cursor-not-allowed"
                            />
                            <p className="text-xs text-slate-500 mt-1">From account</p>
                          </div>
                          <div>
                            <Label htmlFor="education" className="text-slate-700 font-medium">Education Level</Label>
                            <Select
                              value={editForm.educationLevel ?? ""}
                              onValueChange={(value) => setEditForm((p) => ({ ...p, educationLevel: value }))}
                            >
                              <SelectTrigger className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Select education level" />
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
                              value={editForm.stream ?? ""}
                              onValueChange={(value) => setEditForm((p) => ({ ...p, stream: value }))}
                            >
                              <SelectTrigger className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Select stream" />
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
                          {/* <Button onClick={handleSaveProfile} className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                            Save Changes
                          </Button> */}
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
                      <p className="text-lg font-semibold text-white mt-1">{firstName || "Not set"}</p>
                    </div>
                    <div>
                      <Label className="text-blue-100 text-sm">Last Name</Label>
                      <p className="text-lg font-semibold text-white mt-1">{lastName || "Not set"}</p>
                    </div>
                    <div>
                      <Label className="text-blue-100 text-sm">Username</Label>
                      <p className="text-lg font-semibold text-white mt-1">@{username || "Not set"}</p>
                    </div>
                    <div>
                      <Label className="text-blue-100 text-sm">Education Level</Label>
                      {isAcademicLoading ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-200" />
                          <span className="text-sm text-blue-200">Loading...</span>
                        </div>
                      ) : isError ? (
                        <p className="text-lg font-semibold text-white mt-1">Failed to load</p>
                      ) : (
                        <p className="text-lg font-semibold text-white mt-1">{educationLevelLabel}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-blue-100 text-sm">Stream</Label>
                      {isAcademicLoading ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-200" />
                          <span className="text-sm text-blue-200">Loading...</span>
                        </div>
                      ) : isError ? (
                        <p className="text-lg font-semibold text-white mt-1">Failed to load</p>
                      ) : (
                        <p className="text-lg font-semibold text-white mt-1">{streamLabel}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-400">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-white/20 backdrop-blur-sm shadow-md hover:bg-white/30 transition-all">
                      <div className="p-2 rounded-full bg-white/30">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        {isAcademicLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                          </div>
                        ) : isError ? (
                          <p className="text-white">—</p>
                        ) : (
                          <p className="text-2xl font-bold text-white">{academic?.classCount ?? 0}</p>
                        )}
                        <p className="text-sm text-blue-100">Classes Attended</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-white/20 backdrop-blur-sm shadow-md hover:bg-white/30 transition-all">
                      <div className="p-2 rounded-full bg-white/30">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        {isAcademicLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                          </div>
                        ) : isError ? (
                          <p className="text-white">—</p>
                        ) : (
                          <p className="text-2xl font-bold text-white">{academic?.sessionCount ?? 0}</p>
                        )}
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
            {/* Payment History Card */}
            <Link href="/dashboard/student/profile/payments">
              <div className="relative cursor-pointer group">
                <Card className="relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-slate-200 bg-white shadow-md overflow-hidden">
                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 group-hover:from-green-100 group-hover:to-emerald-100 transition-all duration-300">
                        <div className="relative">
                          <CreditCard className="h-7 w-7 text-green-600" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-sm transition-all duration-300 hover:scale-105 px-3 py-1">
                        View All
                      </Badge>
                    </div>
                    <CardTitle className="text-slate-900 text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Payment History
                    </CardTitle>
                    <CardDescription className="text-slate-600 mt-2 text-base leading-relaxed">
                      Track all your payment transactions, invoices, and billing details in one place
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </Link>

            {/* Current Classes Card */}
            <Link href="/dashboard/student/profile/classes">
              <div className="relative cursor-pointer group">
                <Card className="relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-slate-200 bg-white shadow-md overflow-hidden">
                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300 shadow-inner border border-blue-100">
                        <GraduationCap className="h-7 w-7 text-blue-600" />
                      </div>
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-sm transition-all duration-300 hover:scale-105 px-3 py-1">
                        Manage
                      </Badge>
                    </div>
                    <CardTitle className="text-slate-900 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Current Classes
                    </CardTitle>
                    <CardDescription className="text-slate-600 mt-2 text-base leading-relaxed">
                      Access your enrolled classes, study materials, and recorded lecture videos
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </Link>

            {/* My Bookings Card */}
            <Link href="/dashboard/student/profile/bookings">
              <div className="relative cursor-pointer group">
                <Card className="relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-slate-200 bg-white shadow-md overflow-hidden">
                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 group-hover:from-purple-100 group-hover:to-pink-100 transition-all duration-300 shadow-inner border border-purple-100">
                        <Calendar className="h-7 w-7 text-purple-600" />
                      </div>
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 shadow-sm transition-all duration-300 hover:scale-105 px-3 py-1">
                        Schedule
                      </Badge>
                    </div>
                    <CardTitle className="text-slate-900 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      My Bookings
                    </CardTitle>
                    <CardDescription className="text-slate-600 mt-2 text-base leading-relaxed">
                      View and manage your upcoming class schedules and appointment bookings
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }