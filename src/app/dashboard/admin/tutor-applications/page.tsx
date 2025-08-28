"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TutorApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Tutor Applications</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Review and approve tutor registration requests
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>
            Review tutor applications with resume uploads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Tutor application review functionality would be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}