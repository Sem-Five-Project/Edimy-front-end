//"use client";


// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Progress } from "@/components/ui/progress";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   GraduationCap,
//   BookOpen,
//   Video,
//   FileText,
//   Download,
//   PlayCircle,
//   Clock,
//   ArrowLeft,
//   Star,
//   Users,
//   CreditCard,
//   Edit2,
//   DollarSign,
// } from "lucide-react";
// import Link from "next/link";

// interface ClassMaterial {
//   id: string;
//   title: string;
//   type: "video" | "document" | "assignment";
//   uploadDate: string;
//   size?: string;
//   duration?: string;
// }

// interface Review {
//   rating: number;
//   comment: string;
//   date: string;
// }

// interface ClassInfo {
//   id: string;
//   subject: string;
//   tutorName: string;
//   tutorImage: string;
//   progress: number;
//   totalSessions: number;
//   completedSessions: number;
//   nextSession: string;
//   pricing: {
//     type: "monthly" | "per_session";
//     amount: number;
//   };
//   review?: Review;
//   materials: ClassMaterial[];
// }

// export default function ClassesPage() {
//   const [activeTab, setActiveTab] = useState("ongoing");
//   const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
//   const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
//   const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
//   const [rating, setRating] = useState(0);
//   const [hoveredRating, setHoveredRating] = useState(0);
//   const [reviewComment, setReviewComment] = useState("");

//   const classes: ClassInfo[] = [
//     {
//       id: "1",
//       subject: "Advanced Mathematics",
//       tutorName: "Dr. Sarah Johnson",
//       tutorImage: "/placeholder.svg",
//       progress: 65,
//       totalSessions: 20,
//       completedSessions: 13,
//       nextSession: "2024-01-20 10:00 AM",
//       pricing: {
//         type: "monthly",
//         amount: 5000,
//       },
//       review: {
//         rating: 5,
//         comment: "Excellent teaching methods and very clear explanations!",
//         date: "2024-01-10",
//       },
//       materials: [
//         {
//           id: "1",
//           title: "Calculus Introduction",
//           type: "video",
//           uploadDate: "2024-01-10",
//           duration: "45 min",
//         },
//         {
//           id: "2",
//           title: "Practice Problems Set 1",
//           type: "document",
//           uploadDate: "2024-01-10",
//           size: "2.5 MB",
//         },
//         {
//           id: "3",
//           title: "Weekly Assignment",
//           type: "assignment",
//           uploadDate: "2024-01-12",
//           size: "1.2 MB",
//         },
//       ],
//     },
//     {
//       id: "2",
//       subject: "Physics - Mechanics",
//       tutorName: "Prof. Michael Chen",
//       tutorImage: "/placeholder.svg",
//       progress: 45,
//       totalSessions: 16,
//       completedSessions: 7,
//       nextSession: "2024-01-22 02:00 PM",
//       pricing: {
//         type: "per_session",
//         amount: 1500,
//       },
//       materials: [
//         {
//           id: "4",
//           title: "Newton's Laws Explained",
//           type: "video",
//           uploadDate: "2024-01-08",
//           duration: "60 min",
//         },
//         {
//           id: "5",
//           title: "Force and Motion Notes",
//           type: "document",
//           uploadDate: "2024-01-08",
//           size: "3.1 MB",
//         },
//       ],
//     },
//   ];

//   const totalClasses = classes.length;
//   const totalSessions = classes.reduce(
//     (sum, c) => sum + c.completedSessions,
//     0,
//   );

//   const handleOpenReview = (classInfo: ClassInfo) => {
//     setSelectedClass(classInfo);
//     if (classInfo.review) {
//       setRating(classInfo.review.rating);
//       setReviewComment(classInfo.review.comment);
//     } else {
//       setRating(0);
//       setReviewComment("");
//     }
//     setReviewDialogOpen(true);
//   };

//   const handleSubmitReview = () => {
//     console.log("Review submitted:", {
//       classId: selectedClass?.id,
//       rating,
//       comment: reviewComment,
//     });
//     setReviewDialogOpen(false);
//     setSelectedClass(null);
//     setRating(0);
//     setReviewComment("");
//   };

//   const handleOpenPayment = (classInfo: ClassInfo) => {
//     setSelectedClass(classInfo);
//     setPaymentDialogOpen(true);
//   };

//   const handlePayment = () => {
//     console.log("Payment processed for:", selectedClass?.id);
//     setPaymentDialogOpen(false);
//     setSelectedClass(null);
//   };

//   const getMaterialIcon = (type: ClassMaterial["type"]) => {
//     switch (type) {
//       case "video":
//         return <Video className="h-4 w-4 text-red-600" />;
//       case "document":
//         return <FileText className="h-4 w-4 text-blue-600" />;
//       case "assignment":
//         return <BookOpen className="h-4 w-4 text-purple-600" />;
//     }
//   };

//   const getMaterialBadge = (type: ClassMaterial["type"]) => {
//     switch (type) {
//       case "video":
//         return (
//           <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-300">
//             Video
//           </Badge>
//         );
//       case "document":
//         return (
//           <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300">
//             Document
//           </Badge>
//         );
//       case "assignment":
//         return (
//           <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300">
//             Assignment
//           </Badge>
//         );
//     }
//   };

//   const StarRating = ({
//     rating: currentRating,
//     onRate,
//     readonly = false,
//   }: {
//     rating: number;
//     onRate?: (rating: number) => void;
//     readonly?: boolean;
//   }) => {
//     return (
//       <div className="flex gap-1">
//         {[1, 2, 3, 4, 5].map((star) => (
//           <button
//             key={star}
//             type="button"
//             disabled={readonly}
//             onClick={() => !readonly && onRate?.(star)}
//             onMouseEnter={() => !readonly && setHoveredRating(star)}
//             onMouseLeave={() => !readonly && setHoveredRating(0)}
//             className={`transition-all ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
//           >
//             <Star
//               className={`h-6 w-6 ${
//                 star <= (hoveredRating || currentRating)
//                   ? "fill-yellow-400 text-yellow-400"
//                   : "text-slate-300"
//               }`}
//             />
//           </button>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//       <div className="container mx-auto px-4 py-8 max-w-7xl">
//         {/* Header */}
//         <div className="mb-8">
//           <Link href="/dashboard/student/profile">
//             <Button
//               variant="ghost"
//               className="mb-4 text-slate-700 hover:text-slate-900 hover:bg-slate-200"
//             >
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Profile
//             </Button>
//           </Link>
//           <h1 className="text-4xl font-bold text-slate-900 mb-2">My Classes</h1>
//           <p className="text-slate-600">
//             Access your enrolled classes and learning materials
//           </p>
//         </div>

//         {/* Stats Overview */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <Card className="border-blue-200 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg hover:shadow-xl transition-all">
//             <CardHeader className="pb-3">
//               <CardTitle className="text-white text-lg flex items-center gap-2">
//                 <GraduationCap className="h-5 w-5" />
//                 Total Classes Joined
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-4xl font-bold text-white">{totalClasses}</p>
//               <p className="text-blue-100 text-sm mt-1">Active enrollments</p>
//             </CardContent>
//           </Card>

//           <Card className="border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all">
//             <CardHeader className="pb-3">
//               <CardTitle className="text-slate-900 text-lg flex items-center gap-2">
//                 <Clock className="h-5 w-5 text-green-600" />
//                 Total Sessions Completed
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-4xl font-bold text-slate-900">
//                 {totalSessions}
//               </p>
//               <p className="text-slate-600 text-sm mt-1">
//                 Learning hours accumulated
//               </p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Classes List */}
//         <Tabs value={activeTab} onValueChange={setActiveTab}>
//           <TabsList className="bg-white border border-slate-200 shadow-sm mb-6">
//             <TabsTrigger
//               value="ongoing"
//               className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
//             >
//               Ongoing Classes
//             </TabsTrigger>
//             <TabsTrigger
//               value="completed"
//               className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
//             >
//               Completed
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="ongoing" className="space-y-6">
//             {classes.map((classInfo) => (
//               <Card
//                 key={classInfo.id}
//                 className="border-blue-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300"
//               >
//                 <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
//                   <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                     <div className="flex items-center gap-4">
//                       <Avatar className="h-16 w-16 border-4 border-white shadow-md">
//                         <AvatarImage
//                           src={classInfo.tutorImage}
//                           alt={classInfo.tutorName}
//                         />
//                         <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl">
//                           {classInfo.tutorName[0]}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <CardTitle className="text-slate-900 text-xl mb-1">
//                           {classInfo.subject}
//                         </CardTitle>
//                         <CardDescription className="text-slate-600 flex items-center gap-2 mb-2">
//                           <Users className="h-4 w-4" />
//                           {classInfo.tutorName}
//                         </CardDescription>
//                         {classInfo.review ? (
//                           <div className="flex items-center gap-2">
//                             <div className="flex items-center">
//                               <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
//                               <span className="text-sm font-semibold text-slate-900">
//                                 {classInfo.review.rating}.0
//                               </span>
//                             </div>
//                             <span className="text-xs text-slate-500">
//                               Your Rating
//                             </span>
//                           </div>
//                         ) : (
//                           <span className="text-xs text-slate-500">
//                             Not rated yet
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex flex-wrap gap-2">
//                       <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-300 text-sm">
//                         {classInfo.completedSessions}/{classInfo.totalSessions}{" "}
//                         Sessions
//                       </Badge>
//                       <Badge
//                         className={`text-sm ${
//                           classInfo.pricing.type === "monthly"
//                             ? "bg-purple-100 text-purple-700 border-purple-300"
//                             : "bg-orange-100 text-orange-700 border-orange-300"
//                         }`}
//                       >
//                         <DollarSign className="h-3 w-3 mr-1" />
//                         {classInfo.pricing.type === "monthly"
//                           ? "Monthly"
//                           : "Per Session"}
//                       </Badge>
//                     </div>
//                   </div>
//                 </CardHeader>

//                 <CardContent className="pt-6">
//                   {/* Action Buttons */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
//                     <Button
//                       onClick={() => handleOpenReview(classInfo)}
//                       className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white shadow-md"
//                     >
//                       {classInfo.review ? (
//                         <>
//                           <Edit2 className="h-4 w-4 mr-2" />
//                           Update Review & Rating
//                         </>
//                       ) : (
//                         <>
//                           <Star className="h-4 w-4 mr-2" />
//                           Add Review & Rating
//                         </>
//                       )}
//                     </Button>

//                     <Button
//                       onClick={() => handleOpenPayment(classInfo)}
//                       className="bg-green-600  hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
//                     >
//                       <CreditCard className="h-4 w-4 mr-2" />
//                       {classInfo.pricing.type === "monthly"
//                         ? "Pay for Next Month"
//                         : "Pay for Next Session"}
//                     </Button>
//                   </div>

//                   {/* Materials */}
//                   <div>
//                     <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//                       <BookOpen className="h-5 w-5 text-blue-600" />
//                       Learning Materials
//                     </h3>
//                     <div className="space-y-3">
//                       {classInfo.materials.map((material) => (
//                         <div
//                           key={material.id}
//                           className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
//                         >
//                           <div className="flex items-center gap-3 flex-1">
//                             <div className="p-2 rounded-lg bg-white shadow-sm">
//                               {getMaterialIcon(material.type)}
//                             </div>
//                             <div className="flex-1">
//                               <p className="font-semibold text-slate-900">
//                                 {material.title}
//                               </p>
//                               <div className="flex items-center gap-3 mt-1">
//                                 {getMaterialBadge(material.type)}
//                                 <span className="text-xs text-slate-600">
//                                   {new Date(
//                                     material.uploadDate,
//                                   ).toLocaleDateString()}
//                                 </span>
//                                 {material.duration && (
//                                   <span className="text-xs text-slate-600">
//                                     <Clock className="h-3 w-3 inline mr-1" />
//                                     {material.duration}
//                                   </span>
//                                 )}
//                                 {material.size && (
//                                   <span className="text-xs text-slate-600">
//                                     {material.size}
//                                   </span>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                           <div className="flex gap-2">
//                             {material.type === "video" && (
//                               <Button
//                                 size="sm"
//                                 className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
//                               >
//                                 <PlayCircle className="h-4 w-4 mr-1" />
//                                 Watch
//                               </Button>
//                             )}
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               className="border-slate-300 hover:bg-slate-100"
//                             >
//                               <Download className="h-4 w-4 mr-1" />
//                               Download
//                             </Button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </TabsContent>

//           <TabsContent value="completed">
//             <Card className="border-slate-200 bg-white shadow-lg">
//               <CardContent className="py-12 text-center">
//                 <GraduationCap className="h-16 w-16 mx-auto text-slate-400 mb-4" />
//                 <p className="text-slate-600 text-lg">
//                   No completed classes yet
//                 </p>
//                 <p className="text-slate-500 text-sm mt-2">
//                   Your finished courses will appear here
//                 </p>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>

//         {/* Review & Rating Dialog */}
//         <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
//           <DialogContent className="bg-white border-blue-200 shadow-2xl sm:max-w-lg">
//             <DialogHeader>
//               <DialogTitle className="text-slate-900 text-xl flex items-center gap-2">
//                 <Star className="h-6 w-6 text-blue-600" />
//                 {selectedClass?.review
//                   ? "Update Your Review"
//                   : "Add Your Review"}
//               </DialogTitle>
//               <DialogDescription className="text-slate-600">
//                 Share your experience with {selectedClass?.subject}
//               </DialogDescription>
//             </DialogHeader>

//             <div className="space-y-6 py-4">
//               <div>
//                 <label className="text-sm font-medium text-slate-700 mb-3 block">
//                   Your Rating
//                 </label>
//                 <div className="flex justify-center">
//                   <StarRating rating={rating} onRate={setRating} />
//                 </div>
//                 {rating > 0 && (
//                   <p className="text-center text-sm text-slate-600 mt-2">
//                     {rating === 5 && "Excellent!"}
//                     {rating === 4 && "Very Good!"}
//                     {rating === 3 && "Good"}
//                     {rating === 2 && "Fair"}
//                     {rating === 1 && "Needs Improvement"}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-700 mb-2 block">
//                   Your Comment
//                 </label>
//                 <Textarea
//                   placeholder="Share your thoughts about the class, tutor, and learning experience..."
//                   value={reviewComment}
//                   onChange={(e) => setReviewComment(e.target.value)}
//                   className="min-h-32 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setReviewDialogOpen(false)}
//                 className="border-slate-300 hover:bg-slate-100"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleSubmitReview}
//                 disabled={rating === 0}
//                 className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
//               >
//                 {selectedClass?.review ? "Update Review" : "Submit Review"}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* Payment Dialog */}
//         <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
//           <DialogContent className="bg-white border-green-200 shadow-2xl sm:max-w-lg">
//             <DialogHeader>
//               <DialogTitle className="text-slate-900 text-xl flex items-center gap-2">
//                 <CreditCard className="h-6 w-6 text-green-600" />
//                 Payment Confirmation
//               </DialogTitle>
//               <DialogDescription className="text-slate-600">
//                 Complete payment for {selectedClass?.subject}
//               </DialogDescription>
//             </DialogHeader>

//             <div className="space-y-4 py-4">
//               <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
//                 <div className="flex justify-between items-center mb-2">
//                   <span className="text-sm text-slate-600">Class</span>
//                   <span className="font-semibold text-slate-900">
//                     {selectedClass?.subject}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center mb-2">
//                   <span className="text-sm text-slate-600">Tutor</span>
//                   <span className="font-semibold text-slate-900">
//                     {selectedClass?.tutorName}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center mb-2">
//                   <span className="text-sm text-slate-600">Payment Type</span>
//                   <Badge
//                     className={
//                       selectedClass?.pricing.type === "monthly"
//                         ? "bg-purple-100 text-purple-700"
//                         : "bg-orange-100 text-orange-700"
//                     }
//                   >
//                     {selectedClass?.pricing.type === "monthly"
//                       ? "Monthly Subscription"
//                       : "Per Session"}
//                   </Badge>
//                 </div>
//                 <div className="pt-3 mt-3 border-t border-slate-200">
//                   <div className="flex justify-between items-center">
//                     <span className="text-base font-semibold text-slate-900">
//                       Total Amount
//                     </span>
//                     <span className="text-2xl font-bold text-green-600">
//                       Rs. {selectedClass?.pricing.amount.toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setPaymentDialogOpen(false)}
//                 className="border-slate-300 hover:bg-slate-100"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handlePayment}
//                 className="bg-green-600 hover:bg-green-700 text-white shadow-md"
//               >
//                 <CreditCard className="h-4 w-4 mr-2" />
//                 Proceed to Payment
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </div>
//   );
// }

"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
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
  DollarSign,
  Calendar,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  X
} from "lucide-react"
import { Languages, Layers } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useBooking } from "@/contexts/BookingContext";
import { studentAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert"

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

interface MyClassInfo {
  classId: number;
  className: string | null;
  tutorId: number;
  subjectId: number;
  tutorName?: string | null;
  subjectName?: string | null;
  languageName?: string | null;
  classType?: 'ONE_TIME' | 'MONTHLY' | string | null;
  monthlySlots?: Array<{ date: string; status: 'COMPLETED' | 'UPCOMING' | 'CANCELLED' | string }>;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  comment: string | null;
  linkForMeeting: string | null;
  docs: any[];
  languageId?: number;
  hourlyRate?: number;
  rating?: {
    rating_value: number;
    review_text: string;
  } | null;
}

export default function ClassesPage() {
  const queryClient = useQueryClient()
  const { effectiveStudentId } = useAuth();
  const [activeTab, setActiveTab] = useState("ongoing")
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [retryCount, setRetryCount] = useState(0)
const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
const [currentRating, setCurrentRating] = useState(0);
const [currentFeedback, setCurrentFeedback] = useState('');
const [currentClassForRating, setCurrentClassForRating] = useState<MyClassInfo | null>(null);
  const [ratingResponse, setRatingResponse] = useState<{ success: boolean; message: string } | null>(null);

const handleOpenRatingModal = (classInfo: MyClassInfo) => {
  setCurrentClassForRating(classInfo);
  setCurrentRating(classInfo.rating?.rating_value || 0);
  setCurrentFeedback(classInfo.rating?.review_text || '');
  setIsRatingModalOpen(true);
};

const handleCloseRatingModal = () => {
  setIsRatingModalOpen(false);
  setCurrentRating(0);
  setCurrentFeedback('');
  setCurrentClassForRating(null);
};

const handleSubmitRating = async () => {
  if (!currentClassForRating || !effectiveStudentId) return;

  try {
    const response = await studentAPI.setRating(Number(effectiveStudentId), {
      ratingValue: currentRating,
      tutorId: currentClassForRating.tutorId,
      class_id: currentClassForRating.classId,
      feedback: currentFeedback,
    });

    console.log("Rating response:", response);

    // Use the inner data.success to determine outcome
    if (response.success) {
      queryClient.invalidateQueries({ queryKey: ["myClasses", effectiveStudentId] });
      if(response.data?.message=="first need to attend the class"){
        alert("You need to attend the class before submitting a rating.");
        handleCloseRatingModal();
        return;
      }
      alert("Successfully added rating!");
      handleCloseRatingModal();
    } else {
      alert(response.data?.message || "Failed to add rating.");
    }
  } catch (error) {
    alert("Error setting rating.");
    console.error(error);
  }
};

  // Real-time upcoming classes (within next 30 minutes)
  const {
    data: upcomingData,
    isFetching: fetchingUpcoming,
    refetch: refetchUpcoming
  } = useQuery({
    queryKey: ["upcomingClasses", effectiveStudentId],
    queryFn: async () => {
      if (!effectiveStudentId) return { upcoming: false, classes: [] } as any
      const res = await studentAPI.getUpcomingClasses(Number(effectiveStudentId))
      if (res.success) return res.data
      return { upcoming: false, classes: [] }
    },
    enabled: !!effectiveStudentId,
    // No caching; always consult backend when we refetch
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // poll every minute to keep fresh near real-time
  })

  const { 
    data: classes = [], 
    isPending: loading, 
    error: queryError,
    refetch 
  } = useQuery<MyClassInfo[]>({
    queryKey: ["myClasses", effectiveStudentId, retryCount],
    queryFn: async () => {
      if (!effectiveStudentId) {
        throw new Error("Student ID not available")
      }

      console.log("Fetching classes for student:", effectiveStudentId);
      
      try {
        // Try the enriched details endpoint first
        const resDetails = await studentAPI.getAllClassDetails(Number(effectiveStudentId))
        console.log("resdetails :",resDetails)
        if (resDetails?.success && resDetails.data?.classes) {
          console.log("Got enriched class details:", resDetails.data.classes.length)
          return resDetails.data.classes as MyClassInfo[]
        }
      } catch (error) {
        console.warn("Enriched details endpoint failed, falling back to basic classes:", error)
      }

      // Fallback to basic classes endpoint
      console.log("Falling back to basic classes endpoint")
      const res = await studentAPI.getMyClasses(Number(effectiveStudentId))
      if (res.success) {
        console.log("Got basic classes:", res.data?.classes?.length || 0)
        return res.data?.classes || []
      }
      throw new Error(res.error || "Failed to load classes")
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  const error = queryError ? (queryError as Error)?.message || 'Failed to load classes' : null

  // Filter classes based on active tab
  const filteredClasses = useMemo(() => {
    if (activeTab === "ongoing") {
      return classes.filter(classInfo => 
        !classInfo.monthlySlots?.every(slot => 
          slot.status === 'COMPLETED' || slot.status === 'CANCELLED'
        )
      )
    }
    return classes.filter(classInfo => 
      classInfo.monthlySlots?.every(slot => 
        slot.status === 'COMPLETED' || slot.status === 'CANCELLED'
      )
    )
  }, [classes, activeTab])

  // Prefetch data on mount
  useEffect(() => {
    if (!effectiveStudentId) return;

    const prefetchClasses = async () => {
      try {
        await queryClient.prefetchQuery({
          queryKey: ["myClasses", effectiveStudentId],
          queryFn: async () => {
            const res = await studentAPI.getMyClasses(Number(effectiveStudentId))
            if (res.success) return res.data?.classes || []
            throw new Error(res.error || "Failed to load classes")
          },
        })
      } catch (error) {
        console.warn("Prefetch failed:", error)
      }
    }

    prefetchClasses()
  }, [effectiveStudentId, queryClient])
// A new skeleton component that mimics your actual card layout
const ClassCardSkeleton = () => (
  <Card className="border-0 bg-white shadow-lg rounded-2xl flex flex-col animate-pulse">
    {/* Decorative gradient bar */}
    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200"></div>

    <CardHeader className="pb-4 pt-6">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-3">
          <Skeleton className="h-5 w-48" />
          
          {/* Skeleton for Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4 pb-6 flex-1 flex flex-col">
      {/* Skeleton for Schedule Info */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Skeleton for Monthly Slots (simplified) */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Skeleton for Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Skeleton className="h-11 sm:h-10 w-full rounded-xl" />
        <Skeleton className="h-11 sm:h-10 w-full rounded-xl" />
        <Skeleton className="h-11 sm:h-10 w-full rounded-xl" />
      </div>

      {/* Skeleton for Rating Bar */}
      <div className="w-full border-t border-slate-100 mt-6 pt-4 flex items-center justify-between gap-3 bg-slate-50 rounded-b-2xl px-4 py-3">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </CardContent>
  </Card>
);
  const totalClasses = classes.length
  const totalSessions = classes.reduce((total, classInfo) => {
    return total + (classInfo.monthlySlots?.filter(slot => slot.status === 'COMPLETED').length || 0)
  }, 0)

  const router = useRouter();
  const { setSelectedClassId } = useBooking();

  const handleOpenReview = () => {
    setReviewDialogOpen(true)
  }

  const handleSubmitReview = () => {
    setReviewDialogOpen(false)
    setRating(0)
    setReviewComment("")
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    refetch()
  }

  // Map a slot status to tailwind color classes
  const getSlotStatusClasses = (status?: string) => {
    const s = (status || '').toUpperCase()
    if (s === 'COMPLETED') {
      return 'bg-green-100 text-green-700 border-green-200'
    }
    if (s === 'UPCOMING' || s === 'UPCOMMING' || s === 'SCHEDULED' || s === 'PENDING') {
      return 'bg-blue-100 text-blue-700 border-blue-200'
    }
    if (s === 'CANCELLED' || s === 'CANCELED') {
      return 'bg-red-100 text-red-700 border-red-200'
    }
    if (s === 'MISSED' || s === 'ABSENT') {
      return 'bg-orange-100 text-orange-700 border-orange-200'
    }
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const handleOpenPayment = (classInfo: MyClassInfo) => {
    const classIdNum = Number(classInfo.classId)
    setSelectedClassId(classIdNum)
    
    console.log("Opening payment for class:", classInfo)
    
    // Persist minimal class meta so the payment page can show accurate info immediately
    try {
      const meta = {
        classId: classInfo.classId,
        //linkForMeeting: classInfo.linkForMeeting || null,
        tutorName: classInfo.tutorName || null,
        subjectName: classInfo.subjectName || null,
        languageName: classInfo.languageName || null,
        classType: classInfo.classType || null,
        tutorId: classInfo.tutorId,
        subjectId: classInfo.subjectId,
        languageId: classInfo.languageId,
        hourlyRate: classInfo.hourlyRate
        //date: classInfo.date || null,
        //startTime: classInfo.startTime || null,
        //endTime: classInfo.endTime || null,
      }
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('payNextClassMeta', JSON.stringify(meta))
      }
    } catch {}

    // Invalidate classes query to ensure fresh data when returning
    queryClient.invalidateQueries({ queryKey: ["myClasses"] }).catch(console.error)
    
    // Navigate to payment page with class id in query
    router.push(`/dashboard/student/pay-for-next-month?classId=${classIdNum}`)
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">My Classes</h1>
              <p className="text-slate-600">Access your enrolled classes and learning materials</p>
            </div>

            {/* Upcoming class highlight (only when backend says upcoming=true) */}
            {error && (
              <Button 
                variant="outline" 
                onClick={handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
  {/* Total Classes Card */}
  <Card className="border-blue-200 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
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

  {/* Starting Soon Card - Enhanced Design */}
  {upcomingData?.upcoming && upcomingData?.classes?.length > 0 && (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200 rounded-full -translate-y-10 translate-x-10 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-200 rounded-full translate-y-8 -translate-x-8 opacity-40"></div>
      
      <CardHeader className="flex flex-row items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-emerald-900 text-lg">Starting Soon</CardTitle>
            <p className="text-emerald-600 text-sm">Your next class</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetchUpcoming()}
          disabled={fetchingUpcoming}
          className="border-emerald-300 bg-white/80 backdrop-blur-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 ${fetchingUpcoming ? 'animate-spin' : ''}`}
          />
        </Button>
      </CardHeader>
      
      <CardContent className="relative z-10">
        {upcomingData.classes.slice(0, 1).map((c: any) => (
          <div
            key={c.classId}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-emerald-200/60 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center border border-emerald-200/50">
                <BookOpen className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="flex-1">
                <div className="text-base font-semibold text-slate-800 line-clamp-1">
                  {c.subjectName || 'Class'}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                    {c.tutorName}
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-600">{c.languageName}</span>
                </div>
                {c.startTime && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-emerald-700 font-medium">
                    <Clock className="w-3 h-3" />
                    Starts in {c.startTime}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {c.linkForMeeting ? (
                <Button
                  size="sm"
                  className="bg-gradient-to-br from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-4 py-2"
                  onClick={() => window.open(c.linkForMeeting, '_blank')}
                >
                  <Video className="w-4 h-4 mr-2" /> 
                  Join Now
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                    No Link Available
                  </Badge>
                  <span className="text-xs text-slate-500">Check back later</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Additional upcoming classes indicator */}

      </CardContent>
    </Card>
  )}
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
            {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <ClassCardSkeleton key={i} />
              ))}
            </div>
            ) : filteredClasses.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredClasses.map((classInfo) => {
                  const docs = (classInfo as any).class_docs || (classInfo as any).docs || [];
                  // Always render the regular class card, but include docs if present
return (
  <React.Fragment key={classInfo.classId}>
  <Card className="group relative border-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl flex flex-col">
      {/* Decorative gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
      
      <CardHeader className="pb-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg font-bold text-gray-800 mb-3 line-clamp-2">
                {classInfo.className || `Class #${classInfo.classId}`}
              </CardTitle>
              
              {/* Enhanced Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tutor Information */}
                <div className="flex flex-col gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-blue-600 font-medium mb-0.5">Tutor</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {classInfo.tutorName || `Tutor #${classInfo.tutorId}`}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Responsive Full-Width Rating Section */}


                {/* Subject Information */}
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-600 font-medium mb-0.5">Subject</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {classInfo.subjectName || `Subject #${classInfo.subjectId}`}
                    </p>
                  </div>
                </div>

                {/* Language Information */}
                {classInfo.languageName && (
                  <div className="flex items-center gap-3 p-2 bg-violet-50 rounded-lg border border-violet-100">
                    <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Languages className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-violet-600 font-medium mb-0.5">Language</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {classInfo.languageName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Class Type Information */}
                {classInfo.classType && (
                  <div className="flex items-center gap-3 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Layers className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-emerald-600 font-medium mb-0.5">Class Type</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {String(classInfo.classType).toUpperCase() === 'MONTHLY' ? 'Monthly Package' : 'One-time Session'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

  <CardContent className="space-y-4 pb-6 flex-1 flex flex-col">
        {/* Schedule Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl border border-gray-100 gap-4 sm:gap-0">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Next Session</p>
              {classInfo.date ? (
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(classInfo.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              ) : (
                <p className="text-sm text-gray-400">Not scheduled</p>
              )}
            </div>
          </div>
          {classInfo.startTime && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-blue-200 rounded-lg shadow-sm w-fit">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold text-blue-600">
                {classInfo.startTime}{classInfo.endTime ? ` - ${classInfo.endTime}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Monthly Slots - Scrollable */}
        {String(classInfo.classType || '').toUpperCase() === 'MONTHLY' && 
         Array.isArray(classInfo.monthlySlots) && 
         classInfo.monthlySlots.length > 0 && (
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" /> Monthly Schedule
              </p>

            </div>
            
            {(() => {
              const groupedSlots: Record<string, Array<any & { dateObj: Date }>> = classInfo.monthlySlots.reduce((acc, slot) => {
                const date = new Date(slot.date);
                const monthYear = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                if (!acc[monthYear]) acc[monthYear] = [];
                acc[monthYear].push({ ...slot, dateObj: date });
                return acc;
              }, {} as Record<string, Array<any & { dateObj: Date }>>);
              
              const sortedMonths = Object.keys(groupedSlots).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
              
              // Reverse so most recent month is at the top
              const reversedMonths = [...sortedMonths].reverse();
              return (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {reversedMonths.map((monthYear) => {
                    const monthSlots = groupedSlots[monthYear].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
                    return (
                      <div key={monthYear} className="border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            {monthYear}
                          </h4>
                          <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-md border">
                            {monthSlots.length} session{monthSlots.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-2">
                          {monthSlots.map((slot, idx) => {
                            const day = slot.dateObj.getDate();
                            const dayName = slot.dateObj.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
                            return (
                              <div key={idx} className={`relative text-[10px] sm:text-xs px-1.5 py-1.5 rounded-lg border text-center ${getSlotStatusClasses(slot.status)} group`} title={`${slot.dateObj.toLocaleDateString()} • ${slot.status} • ${dayName}`}>
                                <div className="font-medium">{day}</div>
                                <div className="text-[8px] opacity-70 mt-0.5">{dayName}</div>
                                <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                                  slot.status === 'COMPLETED' ? 'bg-green-500' : slot.status === 'UPCOMING' ? 'bg-blue-500' : slot.status === 'CANCELLED' ? 'bg-red-500' : 'bg-slate-400'
                                }`} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Enhanced Documents Section */}
        {Array.isArray(classInfo.docs) && classInfo.docs.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-indigo-800 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Class Materials
                <Badge variant="secondary" className="ml-2 bg-indigo-100 text-indigo-700 border-indigo-200">
                  {classInfo.docs.length}
                </Badge>
              </div>
              <Download className="w-4 h-4 text-indigo-400" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
              {classInfo.docs.map((doc: any, idx: number) => {
                const isVideo = doc.link?.includes('youtube') || doc.link?.includes('vimeo') || doc.doc_type?.toLowerCase().includes('video');
                const isPDF = doc.link?.includes('.pdf') || doc.doc_type?.toLowerCase().includes('pdf');
                
                return (
                  <div key={idx} className="group/doc flex items-center justify-between p-3 bg-white border border-indigo-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isVideo ? 'bg-red-100' : isPDF ? 'bg-orange-100' : 'bg-indigo-100'}`}>
                        {isVideo ? <PlayCircle className="w-5 h-5 text-red-600" /> : <FileText className="w-5 h-5 text-indigo-600" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-800 truncate">{doc.title || doc.doc_type || 'Untitled Document'}</div>
                        {doc.link && <div className="text-xs text-gray-500 truncate">{new URL(doc.link).hostname}</div>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 px-3 border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={() => window.open(doc.link, '_blank')}>
                      {isVideo ? <>Play</> : <>View</>}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {classInfo.linkForMeeting ? (
            <Button size="sm" variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold transition-all h-11 sm:h-10" onClick={() => window.open(classInfo.linkForMeeting!, '_blank')}>
              <Video className="h-4 w-4 mr-2" /> Join Class
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled className="border-gray-300 text-gray-500 h-11 sm:h-10 bg-gray-50">
              <Video className="h-4 w-4 mr-2" /> No Meeting Link
            </Button>
          )}

          {/* <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-700 hover:bg-yellow-50 font-semibold transition-all h-11 sm:h-10" onClick={handleOpenRatingModal}>
            <Star className="h-4 w-4 mr-2" /> {classInfo.tutorRating ? 'Update Rating' : 'Add Rating'}
          </Button> */}

          <button onClick={() => handleOpenPayment(classInfo)} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 rounded-xl h-11 sm:h-10 flex items-center justify-center px-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
            <CreditCard className="h-4 w-4 mr-2" /> Pay Next Month
          </button>
        </div>

        {/* Additional Info */}
        {classInfo.comment && (
          <div className="p-3 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-xl">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <BookOpen className="w-3 h-3 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-blue-600 font-medium mb-1">Class Notes</p>
                <p className="text-sm text-blue-800 leading-relaxed">{classInfo.comment}</p>
              </div>
            </div>
          </div>
        )}

        {/* Horizontal Rating Bar at Bottom */}
        <div className="w-full border-t border-yellow-100 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-yellow-50 rounded-b-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-yellow-700">Rating:</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 sm:h-6 sm:w-6 ${i < (classInfo.rating?.rating_value || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-700 ml-1">{classInfo.rating ? `(${classInfo.rating.rating_value}.0)` : '(Not rated)'}</span>
            {classInfo.rating?.review_text && (
              <span className="text-xs text-gray-600 italic ml-2 max-w-xs truncate">"{classInfo.rating.review_text}"</span>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={() => handleOpenRatingModal(classInfo)}>
            {classInfo.rating ? 'Update Rating' : 'Set Rating'}
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Rating Modal */}
{isRatingModalOpen && (
  <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50 p-4">
<div className="bg-gradient-to-br from-white to-blue-50/80 border border-blue-400/80 rounded-3xl w-full max-w-md animate-scaleIn relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          Rate Your Class
        </h3>
        <button
          onClick={handleCloseRatingModal}
          className="p-2 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 mb-3">
            How was your experience?
          </p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setCurrentRating(value)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-9 h-9 ${
                    value <= currentRating
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="feedback"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Additional Feedback (Optional)
          </label>
          <textarea
            id="feedback"
            rows={4}
            className="block w-full rounded-xl border border-gray-300 bg-white/80 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition resize-none p-3 text-sm text-gray-700"
            value={currentFeedback}
            onChange={(e) => setCurrentFeedback(e.target.value)}
            placeholder="Tell us more about your experience..."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl">
        <button
          onClick={handleCloseRatingModal}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmitRating}
          disabled={currentRating === 0}
          className={`px-5 py-2 rounded-lg font-medium text-white shadow-md transition
            ${
              currentRating === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            }`}
        >
          Submit Rating
        </button>
      </div>
    </div>
  </div>
)}


    {/* Rating Response Message */}

  </React.Fragment>
);
                })}
              </div>
            ) : (
              <Card className="border-slate-200 bg-white shadow-lg">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-10 w-10 text-slate-400" />
                  </div>
                  <p className="text-slate-900 text-lg font-semibold mb-2">No ongoing classes found</p>
                  <p className="text-slate-500 text-sm mb-6">Start your learning journey by finding a tutor</p>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md" 
                    onClick={() => router.push('/dashboard/student/find-tutor')}
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Find Tutors
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {filteredClasses.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredClasses.map((classInfo) => (
                  <Card key={classInfo.classId} className="border-slate-200 bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg">{classInfo.className || `Class #${classInfo.classId}`}</CardTitle>
                      <CardDescription>
                        Completed with {classInfo.tutorName || `Tutor #${classInfo.tutorId}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-600">Subject: {classInfo.subjectName || `Subject #${classInfo.subjectId}`}</p>
                          <p className="text-sm text-slate-600">Completed sessions: {
                            classInfo.monthlySlots?.filter(slot => slot.status === 'COMPLETED').length || 0
                          }</p>
                        </div>

                        {/* Rating Display */}
                        {classInfo.rating && (
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm font-semibold text-yellow-800 mb-2">Your Rating</p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < classInfo.rating!.rating_value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              <span className="text-sm text-yellow-800 font-medium">({classInfo.rating.rating_value}.0)</span>
                            </div>
                            {classInfo.rating.review_text && (
                              <p className="text-sm text-yellow-700 mt-2 italic">"{classInfo.rating.review_text}"</p>
                            )}
                          </div>
                        )}

                        {/* Documents Section */}
                        {Array.isArray((classInfo as any).class_docs || (classInfo as any).docs) && ((classInfo as any).class_docs || (classInfo as any).docs).length > 0 && (
                          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                            <p className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Class Documents
                            </p>
                            <div className="space-y-1">
                              {((classInfo as any).class_docs || (classInfo as any).docs).map((d: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-white border border-indigo-200 rounded">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center">
                                      <FileText className="w-3 h-3 text-indigo-600" />
                                    </div>
                                    <div className="text-xs font-medium text-indigo-800">{d.doc_type ? `${d.doc_type}` : (d.title || d.link || 'Document')}</div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {d.link && (
                                      <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => window.open(d.link, '_blank')}>
                                        View
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button variant="outline" onClick={() => handleOpenRatingModal(classInfo)}>
                            <Star className="h-4 w-4 mr-2" />
                            {classInfo.rating ? 'Update Review' : 'Leave Review'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-slate-200 bg-white shadow-lg">
                <CardContent className="py-16 text-center">
                  <GraduationCap className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 text-lg">No completed classes yet</p>
                  <p className="text-slate-500 text-sm mt-2">Your finished courses will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Leave a Review</DialogTitle>
              <DialogDescription>
                Share your experience with this class to help other students.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Rating</p>
                <StarRating rating={rating} onRate={setRating} />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Comment</p>
                <Textarea
                  placeholder="Share your thoughts about the class..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReview}
                disabled={!rating || !reviewComment.trim()}
              >
                Submit Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}