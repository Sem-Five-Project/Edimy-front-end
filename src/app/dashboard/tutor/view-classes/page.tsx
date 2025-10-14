"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, BookOpen, Video } from "lucide-react";

// Sample data structure for class sessions
interface ClassSession {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  students: number;
  maxStudents: number;
  status: "upcoming" | "completed" | "cancelled";
  isOnline: boolean;
}

export default function TutorViewClasses() {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch with some delay
    const timer = setTimeout(() => {
      const mockClasses: ClassSession[] = [
        {
          id: "cls-001",
          title: "Introduction to Algebra",
          subject: "Mathematics",
          date: "2025-10-16",
          time: "14:00",
          duration: 60,
          students: 8,
          maxStudents: 12,
          status: "upcoming",
          isOnline: true
        },
        {
          id: "cls-002",
          title: "Advanced Calculus",
          subject: "Mathematics",
          date: "2025-10-15",
          time: "10:30",
          duration: 90,
          students: 5,
          maxStudents: 10,
          status: "upcoming",
          isOnline: false
        },
        {
          id: "cls-003",
          title: "English Literature Basics",
          subject: "English",
          date: "2025-10-14",
          time: "09:00",
          duration: 60,
          students: 12,
          maxStudents: 12,
          status: "completed",
          isOnline: true
        },
        {
          id: "cls-004",
          title: "Physics Fundamentals",
          subject: "Physics",
          date: "2025-10-12",
          time: "15:30",
          duration: 120,
          students: 7,
          maxStudents: 15,
          status: "completed",
          isOnline: false
        },
        {
          id: "cls-005",
          title: "Chemistry Lab Preparation",
          subject: "Chemistry",
          date: "2025-10-11",
          time: "13:00",
          duration: 90,
          students: 0,
          maxStudents: 8,
          status: "cancelled",
          isOnline: true
        }
      ];
      
      setClasses(mockClasses);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: ClassSession["status"]) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Upcoming</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Classes</h1>
      
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upcoming Classes</CardTitle>
            <CardDescription>Classes scheduled in the future</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {classes.filter(c => c.status === "upcoming").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed Classes</CardTitle>
            <CardDescription>Successfully conducted classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {classes.filter(c => c.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Students</CardTitle>
            <CardDescription>Across all classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {classes.reduce((sum, c) => sum + c.students, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Classes Schedule</CardTitle>
          <CardDescription>View and manage your scheduled classes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-slate-600 mb-4"></div>
              <p className="text-slate-500">Loading your classes...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Details</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell>
                      <div className="font-medium">{cls.title}</div>
                      <div className="flex items-center text-sm text-slate-500 mt-1">
                        <BookOpen className="h-3.5 w-3.5 mr-1" />
                        <span>{cls.subject}</span>
                        {cls.isOnline && (
                          <span className="ml-2 flex items-center">
                            <Video className="h-3.5 w-3.5 mr-1" />
                            Online
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{formatDate(cls.date)}</span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-slate-500">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>{cls.time} · {cls.duration} mins</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-slate-400" />
                        <span>
                          {cls.students}/{cls.maxStudents}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(cls.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {cls.status === "upcoming" && (
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button size="sm">Start</Button>
                        </div>
                      )}
                      {cls.status === "completed" && (
                        <Button variant="outline" size="sm">View Records</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
