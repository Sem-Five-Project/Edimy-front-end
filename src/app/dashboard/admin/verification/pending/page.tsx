"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getPendingTutorApprovals } from "@/lib/adminTutor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  UserPlus,
  FileText,
  Calendar,
  DollarSign,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function PendingApprovalsPage() {
  const [pendingTutors, setPendingTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTutors, setTotalTutors] = useState(0);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<any[]>([]);

  useEffect(() => {
    fetchPendingTutors();
  }, [currentPage]);

  const fetchPendingTutors = async () => {
    setLoading(true);
    try {
      const tutors = await getPendingTutorApprovals();
      setPendingTutors(tutors);
      setTotalTutors(tutors.length);
    } catch (error) {
      console.error("Error fetching pending tutors:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalTutors / ITEMS_PER_PAGE);

  return (
    <>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Pending Tutor Approvals</h1>
            <p className="text-muted-foreground mt-1">
              Review and approve tutor verification requests
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-muted-foreground">
                  Loading applications...
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="p-4 text-center"></th>
                      <th className="p-4 text-center font-medium">Applicant</th>
                      <th className="p-4 text-center font-medium">Subjects</th>
                      <th className="p-4 text-center font-medium">
                        Submission Date
                      </th>
                      <th className="p-4 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTutors.map((tutor: any) => (
                      <tr
                        key={tutor.tutorId || tutor.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-4 text-center"></td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div>
                              <div className="font-medium">
                                {tutor.userName || "N/A"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {tutor.tutorId || tutor.id || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="space-y-1">
                            {(
                              tutor.subjects ||
                              tutor.subjectsInfo ||
                              tutor.subjectsDto ||
                              tutor.subjectsList ||
                              tutor.subjectsArray ||
                              tutor.subjectsData ||
                              tutor.subjectsField ||
                              tutor.subjectsName ||
                              tutor.subjects
                            )
                              ?.slice(0, 2)
                              .map((subject: any, index: number) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">
                                    {subject.name || subject.subject}
                                  </span>
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    (ID:{" "}
                                    {subject.id || subject.subjectId || "N/A"})
                                  </span>
                                </div>
                              ))}
                            {tutor.subjects && tutor.subjects.length > 2 && (
                              <div className="text-sm text-muted-foreground">
                                +{tutor.subjects.length - 2} more subjects
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="text-sm">
                            {new Date(
                              tutor.submissionDate,
                            ).toLocaleDateString()}
                            <div className="text-muted-foreground">
                              {new Date(
                                tutor.submissionDate,
                              ).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDocs(tutor.subjects || []);
                              setShowDocsModal(true);
                            }}
                          >
                            View Documents
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalTutors)} of{" "}
                  {totalTutors} applications
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ),
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Modal for viewing docs - use React Portal for full overlay */}
      {showDocsModal &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-70">
            <div className="bg-zinc-900 text-white rounded-lg shadow-2xl p-6 w-full max-w-lg relative border border-zinc-700">
              {/* Close X button */}
              <button
                className="absolute top-3 right-3 text-zinc-400 hover:text-white text-xl font-bold focus:outline-none"
                onClick={() => setShowDocsModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">
                Verification Documents
              </h2>
              <ul className="space-y-4">
                {selectedDocs.map((subject: any, idx: number) => (
                  <li key={idx} className="border-b border-zinc-700 pb-3">
                    <div className="font-semibold text-lg flex items-center justify-between">
                      <span>
                        {subject.name || subject.subject}{" "}
                        <span className="text-xs text-zinc-400">
                          (ID: {subject.id || subject.subjectId || "N/A"})
                        </span>
                      </span>
                    </div>
                    <div className="text-sm mt-2 break-all">
                      {subject.verificationDocs ? (
                        /^https?:\/\//.test(subject.verificationDocs) ? (
                          <a
                            href={subject.verificationDocs}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline"
                          >
                            View Document
                          </a>
                        ) : (
                          <span>{subject.verificationDocs}</span>
                        )
                      ) : (
                        <span className="text-zinc-400">
                          No document available
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6">
                <Button
                  variant="default"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    /* TODO: Implement make tutor active */
                  }}
                >
                  Make Tutor Active
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
