"use client";

import { useEffect, useState } from "react";
import { getCurrentAdmin, AdminUser } from "@/lib/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

export default function AdminProfilePage() {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdminDetails = async () => {
            try {
                setIsLoading(true);
                const adminData = await getCurrentAdmin();
                setAdmin(adminData);
            } catch (err: any) {
                setError(err.message || "Failed to load admin details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminDetails();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-dark-5 dark:text-dark-6">Loading admin details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="p-8 text-center max-w-md">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">Error Loading Profile</h3>
                    <p className="text-dark-5 dark:text-dark-6">{error}</p>
                </Card>
            </div>
        );
    }

    if (!admin) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="p-8 text-center max-w-md">
                    <p className="text-dark-5 dark:text-dark-6">No admin data found</p>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">
                    Admin Profile
                </h1>
                <p className="text-lg text-dark-5 dark:text-dark-6">
                    View and manage your administrator account details
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Overview Card */}
                <Card className="lg:col-span-1 p-6">
                    <div className="text-center">
                        <div className="mb-4">
                            <Avatar className="w-24 h-24 mx-auto">
                                {admin.profileImage ? (
                                    <img src={admin.profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                                        {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
                                    </div>
                                )}
                            </Avatar>
                        </div>
                        
                        <h2 className="text-xl font-bold text-dark dark:text-white mb-1">
                            {admin.firstName} {admin.lastName}
                        </h2>
                        
                        <p className="text-dark-5 dark:text-dark-6 mb-3">@{admin.username}</p>
                        
                        <Badge variant={admin.role === 'ADMIN' ? 'default' : 'secondary'} className="mb-4">
                            {admin.role}
                        </Badge>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${admin.enabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="text-dark-5 dark:text-dark-6">
                                    {admin.enabled ? 'Account Active' : 'Account Disabled'}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Account Details Card */}
                <Card className="lg:col-span-2 p-6">
                    <h3 className="text-xl font-bold text-dark dark:text-white mb-6">Account Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark dark:text-white mb-1">
                                    User ID
                                </label>
                                <p className="text-dark-5 dark:text-dark-6">#{admin.id}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark dark:text-white mb-1">
                                    Email Address
                                </label>
                                <p className="text-dark-5 dark:text-dark-6">{admin.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark dark:text-white mb-1">
                                    Username
                                </label>
                                <p className="text-dark-5 dark:text-dark-6">{admin.username}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark dark:text-white mb-1">
                                    Role
                                </label>
                                <Badge variant="outline">{admin.role}</Badge>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark dark:text-white mb-1">
                                    Account Created
                                </label>
                                <p className="text-dark-5 dark:text-dark-6">{formatDate(admin.createdAt)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark dark:text-white mb-1">
                                    Last Updated
                                </label>
                                <p className="text-dark-5 dark:text-dark-6">{formatDate(admin.updatedAt)}</p>
                            </div>

                            {admin.lastLogin && (
                                <div>
                                    <label className="block text-sm font-medium text-dark dark:text-white mb-1">
                                        Last Login
                                    </label>
                                    <p className="text-dark-5 dark:text-dark-6">{formatDate(admin.lastLogin)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Account Status Card */}
                <Card className="lg:col-span-3 p-6">
                    <h3 className="text-xl font-bold text-dark dark:text-white mb-6">Account Status</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className={`w-3 h-3 rounded-full ${admin.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                                <p className="text-sm font-medium text-dark dark:text-white">Account Enabled</p>
                                <p className="text-xs text-dark-5 dark:text-dark-6">{admin.enabled ? 'Yes' : 'No'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className={`w-3 h-3 rounded-full ${admin.accountNonExpired ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                                <p className="text-sm font-medium text-dark dark:text-white">Account Non-Expired</p>
                                <p className="text-xs text-dark-5 dark:text-dark-6">{admin.accountNonExpired ? 'Yes' : 'No'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className={`w-3 h-3 rounded-full ${admin.accountNonLocked ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                                <p className="text-sm font-medium text-dark dark:text-white">Account Non-Locked</p>
                                <p className="text-xs text-dark-5 dark:text-dark-6">{admin.accountNonLocked ? 'Yes' : 'No'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className={`w-3 h-3 rounded-full ${admin.credentialsNonExpired ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                                <p className="text-sm font-medium text-dark dark:text-white">Credentials Non-Expired</p>
                                <p className="text-xs text-dark-5 dark:text-dark-6">{admin.credentialsNonExpired ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
