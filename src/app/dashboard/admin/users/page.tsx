"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">User Management</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Manage all users in the system
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            View and manage all registered users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            User management functionality would be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}