"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  GraduationCap,
  BookOpen,
  Video,
  FileText,
  Download,
  PlayCircle,
  Clock,
  ArrowLeft,
  Star,
  Users,
  CreditCard,
  Edit2,
  DollarSign
} from "lucide-react"
import Link from "next/link"

interface ClassMaterial {
  id: string
  title: string
  type: "video" | "document" | "assignment"
  uploadDate: string
  size?: string
  duration?: string
}

interface Review {
  rating: number
  comment: string
  date: string
}

interface ClassInfo {
  id: string
  subject: string
  tutorName: string
  tutorImage: string
  progress: number
  totalSessions: number
  completedSessions: number
  nextSession: string
  pricing: {
    type: "monthly" | "per_session"
    amount: number
  }
  review?: Review
  materials: ClassMaterial[]
}

export default function ClassesPage() {
  const [activeTab, setActiveTab] = useState("ongoing")
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")

  const classes: ClassInfo[] = [
    {
      id: "1",
      subject: "Advanced Mathematics",
      tutorName: "Dr. Sarah Johnson",
      tutorImage: "/placeholder.svg",
      progress: 65,
      totalSessions: 20,
      completedSessions: 13,
      nextSession: "2024-01-20 10:00 AM",
      pricing: {
        type: "monthly",
        amount: 5000
      },
      review: {
        rating: 5,
        comment: "Excellent teaching methods and very clear explanations!",
        date: "2024-01-10"
      },
      materials: [
        { id: "1", title: "Calculus Introduction", type: "video", uploadDate: "2024-01-10", duration: "45 min" },
        { id: "2", title: "Practice Problems Set 1", type: "document", uploadDate: "2024-01-10", size: "2.5 MB" },
        { id: "3", title: "Weekly Assignment", type: "assignment", uploadDate: "2024-01-12", size: "1.2 MB" },
      ]
    },
    {
      id: "2",
      subject: "Physics - Mechanics",
      tutorName: "Prof. Michael Chen",
      tutorImage: "/placeholder.svg",
      progress: 45,
      totalSessions: 16,
      completedSessions: 7,
      nextSession: "2024-01-22 02:00 PM",
      pricing: {
        type: "per_session",
        amount: 1500
      },
      materials: [
        { id: "4", title: "Newton's Laws Explained", type: "video", uploadDate: "2024-01-08", duration: "60 min" },
        { id: "5", title: "Force and Motion Notes", type: "document", uploadDate: "2024-01-08", size: "3.1 MB" },
      ]
    },
  ]

  const totalClasses = classes.length
  const totalSessions = classes.reduce((sum, c) => sum + c.completedSessions, 0)

  const handleOpenReview = (classInfo: ClassInfo) => {
    setSelectedClass(classInfo)
    if (classInfo.review) {
      setRating(classInfo.review.rating)
      setReviewComment(classInfo.review.comment)
    } else {
      setRating(0)
      setReviewComment("")
    }
    setReviewDialogOpen(true)
  }

  const handleSubmitReview = () => {
    console.log("Review submitted:", { classId: selectedClass?.id, rating, comment: reviewComment })
    setReviewDialogOpen(false)
    setSelectedClass(null)
    setRating(0)
    setReviewComment("")
  }

  const handleOpenPayment = (classInfo: ClassInfo) => {
    setSelectedClass(classInfo)
    setPaymentDialogOpen(true)
  }

  const handlePayment = () => {
    console.log("Payment processed for:", selectedClass?.id)
    setPaymentDialogOpen(false)
    setSelectedClass(null)
  }

  const getMaterialIcon = (type: ClassMaterial["type"]) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-red-600" />
      case "document":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "assignment":
        return <BookOpen className="h-4 w-4 text-purple-600" />
    }
  }

  const getMaterialBadge = (type: ClassMaterial["type"]) => {
    switch (type) {
      case "video":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-300">Video</Badge>
      case "document":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300">Document</Badge>
      case "assignment":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300">Assignment</Badge>
    }
  }

  const StarRating = ({ 
    rating: currentRating, 
    onRate, 
    readonly = false 
  }: { 
    rating: number
    onRate?: (rating: number) => void
    readonly?: boolean 
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRate?.(star)}
            onMouseEnter={() => !readonly && setHoveredRating(star)}
            onMouseLeave={() => !readonly && setHoveredRating(0)}
            className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoveredRating || currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/student/profile">
            <Button variant="ghost" className="mb-4 text-slate-700 hover:text-slate-900 hover:bg-slate-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Classes</h1>
          <p className="text-slate-600">Access your enrolled classes and learning materials</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Total Classes Joined
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{totalClasses}</p>
              <p className="text-blue-100 text-sm mt-1">Active enrollments</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-900 text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Total Sessions Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-slate-900">{totalSessions}</p>
              <p className="text-slate-600 text-sm mt-1">Learning hours accumulated</p>
            </CardContent>
          </Card>
        </div>

        {/* Classes List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 shadow-sm mb-6">
            <TabsTrigger value="ongoing" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              Ongoing Classes
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ongoing" className="space-y-6">
            {classes.map((classInfo) => (
              <Card key={classInfo.id} className="border-blue-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-4 border-white shadow-md">
                        <AvatarImage src={classInfo.tutorImage} alt={classInfo.tutorName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl">
                          {classInfo.tutorName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-slate-900 text-xl mb-1">{classInfo.subject}</CardTitle>
                        <CardDescription className="text-slate-600 flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4" />
                          {classInfo.tutorName}
                        </CardDescription>
                        {classInfo.review ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                              <span className="text-sm font-semibold text-slate-900">{classInfo.review.rating}.0</span>
                            </div>
                            <span className="text-xs text-slate-500">Your Rating</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Not rated yet</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-300 text-sm">
                        {classInfo.completedSessions}/{classInfo.totalSessions} Sessions
                      </Badge>
                      <Badge className={`text-sm ${
                        classInfo.pricing.type === "monthly" 
                          ? "bg-purple-100 text-purple-700 border-purple-300" 
                          : "bg-orange-100 text-orange-700 border-orange-300"
                      }`}>
                        <DollarSign className="h-3 w-3 mr-1" />
                        {classInfo.pricing.type === "monthly" ? "Monthly" : "Per Session"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">


                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    <Button
                      onClick={() => handleOpenReview(classInfo)}
                      className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white shadow-md"
                    >
                      {classInfo.review ? (
                        <>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Update Review & Rating
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-2" />
                          Add Review & Rating
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => handleOpenPayment(classInfo)}
                      className="bg-green-600  hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {classInfo.pricing.type === "monthly" 
                        ? "Pay for Next Month" 
                        : "Pay for Next Session"}
                    </Button>
                  </div>

                  {/* Materials */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      Learning Materials
                    </h3>
                    <div className="space-y-3">
                      {classInfo.materials.map((material) => (
                        <div
                          key={material.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-white shadow-sm">
                              {getMaterialIcon(material.type)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900">{material.title}</p>
                              <div className="flex items-center gap-3 mt-1">
                                {getMaterialBadge(material.type)}
                                <span className="text-xs text-slate-600">
                                  {new Date(material.uploadDate).toLocaleDateString()}
                                </span>
                                {material.duration && (
                                  <span className="text-xs text-slate-600">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    {material.duration}
                                  </span>
                                )}
                                {material.size && (
                                  <span className="text-xs text-slate-600">{material.size}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {material.type === "video" && (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                                <PlayCircle className="h-4 w-4 mr-1" />
                                Watch
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="border-slate-300 hover:bg-slate-100">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed">
            <Card className="border-slate-200 bg-white shadow-lg">
              <CardContent className="py-12 text-center">
                <GraduationCap className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 text-lg">No completed classes yet</p>
                <p className="text-slate-500 text-sm mt-2">Your finished courses will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review & Rating Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="bg-white border-blue-200 shadow-2xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-slate-900 text-xl flex items-center gap-2">
                <Star className="h-6 w-6 text-blue-600" />
                {selectedClass?.review ? "Update Your Review" : "Add Your Review"}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Share your experience with {selectedClass?.subject}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-3 block">
                  Your Rating
                </label>
                <div className="flex justify-center">
                  <StarRating rating={rating} onRate={setRating} />
                </div>
                {rating > 0 && (
                  <p className="text-center text-sm text-slate-600 mt-2">
                    {rating === 5 && "Excellent!"}
                    {rating === 4 && "Very Good!"}
                    {rating === 3 && "Good"}
                    {rating === 2 && "Fair"}
                    {rating === 1 && "Needs Improvement"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Your Comment
                </label>
                <Textarea
                  placeholder="Share your thoughts about the class, tutor, and learning experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="min-h-32 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReviewDialogOpen(false)}
                className="border-slate-300 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={rating === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              >
                {selectedClass?.review ? "Update Review" : "Submit Review"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="bg-white border-green-200 shadow-2xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-slate-900 text-xl flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-green-600" />
                Payment Confirmation
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Complete payment for {selectedClass?.subject}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Class</span>
                  <span className="font-semibold text-slate-900">{selectedClass?.subject}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Tutor</span>
                  <span className="font-semibold text-slate-900">{selectedClass?.tutorName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Payment Type</span>
                  <Badge className={
                    selectedClass?.pricing.type === "monthly" 
                      ? "bg-purple-100 text-purple-700" 
                      : "bg-orange-100 text-orange-700"
                  }>
                    {selectedClass?.pricing.type === "monthly" ? "Monthly Subscription" : "Per Session"}
                  </Badge>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-slate-900">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      Rs. {selectedClass?.pricing.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPaymentDialogOpen(false)}
                className="border-slate-300 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}