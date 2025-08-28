'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, BookOpen, UserCheck } from 'lucide-react';

export default function TutorIdlePage() {
  const { user } = useAuth();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Account Under Review</CardTitle>
          <CardDescription>
            Your tutor application is currently being reviewed by our admin team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Thank you for submitting your application, {user?.firstName} {user?.lastName}. 
              We'll review your credentials and resume shortly.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <BookOpen className="h-5 w-5 text-purple-500" />
              <div>
                <h4 className="font-medium">Application Submitted</h4>
                <p className="text-sm text-muted-foreground">We've received your tutor application</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <UserCheck className="h-5 w-5 text-purple-500" />
              <div>
                <h4 className="font-medium">Review in Progress</h4>
                <p className="text-sm text-muted-foreground">Admin team is reviewing your credentials</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <h4 className="font-medium">Approval Pending</h4>
                <p className="text-sm text-muted-foreground">You'll be notified once approved</p>
              </div>
            </div>
          </div>
          
          <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}