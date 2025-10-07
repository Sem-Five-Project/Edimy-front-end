"use client";

import { useState } from "react";
import { registerAdmin, RegisterAdminRequest } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function CreateAdminPage() {
    const [formData, setFormData] = useState<RegisterAdminRequest>({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "ADMIN"
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError(null);
    };

    const validateForm = (): string | null => {
        if (!formData.firstName.trim()) return "First name is required";
        if (!formData.lastName.trim()) return "Last name is required";
        if (!formData.username.trim()) return "Username is required";
        if (!formData.email.trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(formData.email)) return "Please enter a valid email";
        if (!formData.password) return "Password is required";
        if (formData.password.length < 8) return "Password must be at least 8 characters";
        if (formData.password.length > 120) return "Password must be no more than 120 characters";
        if (!/[A-Z]/.test(formData.password)) return "Password must contain at least one uppercase letter";
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) return "Password must contain at least one special character";
        if (formData.password !== formData.confirmPassword) return "Passwords do not match";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await registerAdmin(formData);
            setSuccess(true);
            // Reset form
            setFormData({
                firstName: "",
                lastName: "",
                username: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "ADMIN"
            });
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create admin account. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">
                    Create Admin Account
                </h1>
                <p className="text-lg text-dark-5 dark:text-dark-6">
                    Add a new administrator to the system
                </p>
            </div>

            <div className="mx-auto max-w-2xl flex justify-center items-center min-h-[60vh]">
                <Card className="p-7.5 w-full">
                {success && (
                    <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        <p className="font-medium">Admin account created successfully!</p>
                        <p className="text-sm">The new admin can now log in with their credentials.</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="mb-2.5 block text-body-sm font-medium text-dark dark:text-white">
                                First Name
                            </label>
                            <Input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="Enter first name"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2.5 block text-body-sm font-medium text-dark dark:text-white">
                                Last Name
                            </label>
                            <Input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder="Enter last name"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2.5 block text-body-sm font-medium text-dark dark:text-white">
                            Username
                        </label>
                        <Input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2.5 block text-body-sm font-medium text-dark dark:text-white">
                            Email Address
                        </label>
                        <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email address"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="mb-2.5 block text-body-sm font-medium text-dark dark:text-white">
                                Password
                            </label>
                            <Input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter password"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-2.5 block text-body-sm font-medium text-dark dark:text-white">
                                Confirm Password
                            </label>
                            <Input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm password"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setFormData({
                                    firstName: "",
                                    lastName: "",
                                    username: "",
                                    email: "",
                                    password: "",
                                    confirmPassword: "",
                                    role: "ADMIN"
                                });
                                setError(null);
                                setSuccess(false);
                            }}
                        >
                            Clear Form
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating..." : "Create Admin"}
                        </Button>
                    </div>
                </form>
            </Card>
            </div>
        </div>
    );
}
