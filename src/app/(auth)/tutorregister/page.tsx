"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { authAPI } from '@/lib/api';

interface TutorRegistrationData {
  resume: File | null;
  qualifications: string;
  experience: string;
}

export default function TutorRegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<TutorRegistrationData>({
    resume: null,
    qualifications: '',
    experience: '',
  });
  
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Get email from localStorage (set during registration)
  const pendingEmail = typeof window !== 'undefined' ? localStorage.getItem('pendingEmail') : null;

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    setFormData(prev => ({ ...prev, resume: file }));
    setFileName(file.name);
    setError('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.resume) {
      setError('Please upload your resume');
      return false;
    }
    
    if (!formData.qualifications.trim()) {
      setError('Please enter your qualifications');
      return false;
    }
    
    if (!formData.experience.trim()) {
      setError('Please enter your teaching experience');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!pendingEmail) {
      setError('Registration session expired. Please register again.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Create FormData for file upload
      const uploadFormData = new FormData();
      if (formData.resume) {
        uploadFormData.append('resume', formData.resume);
      }
      uploadFormData.append('qualifications', formData.qualifications);
      uploadFormData.append('experience', formData.experience);
      uploadFormData.append('email', pendingEmail || '');
      
      // Upload resume and other data to backend
      const response = await authAPI.uploadTutorResume(uploadFormData);
      
      if (response.success) {
        // Successful submission
        setSuccess(true);
        
        // Redirect to idle page after a delay
        setTimeout(() => {
          router.push('/dashboard/tutor/idle');
        }, 3000);
      } else {
        setError(response.error || 'Failed to submit tutor registration. Please try again.');
      }
    } catch (err) {
      setError('Failed to submit tutor registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRegister = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4">
      <div className="flex items-center justify-center min-h-screen py-8">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg dark:bg-gray-900/80">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Tutor Registration
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                Complete your tutor profile with resume upload
              </CardDescription>
              {pendingEmail && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Registering as: {pendingEmail}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {success ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Registration Submitted!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your tutor registration has been submitted successfully. Our team will review your application and notify you via email.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      You will be redirected to your account review page shortly...
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Resume Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="resume" className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      Resume/CV
                    </Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-gray-300 hover:border-indigo-400 dark:border-gray-600'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={triggerFileInput}
                    >
                      <Input
                        ref={fileInputRef}
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleFileInput}
                      />
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, DOC, DOCX (max 5MB)
                      </p>
                      {fileName && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 truncate">
                          {fileName}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Qualifications */}
                  <div className="space-y-2">
                    <Label htmlFor="qualifications" className="text-sm font-medium">
                      Qualifications
                    </Label>
                    <Input
                      id="qualifications"
                      name="qualifications"
                      type="text"
                      value={formData.qualifications}
                      onChange={handleInputChange}
                      placeholder="e.g., B.Sc. in Mathematics, TEFL Certificate"
                      className="h-11 border-2 focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  
                  {/* Experience */}
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-sm font-medium">
                      Teaching Experience
                    </Label>
                    <Input
                      id="experience"
                      name="experience"
                      type="text"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="e.g., 3 years of online tutoring experience"
                      className="h-11 border-2 focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBackToRegister}
                      className="flex-1 h-11"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit for Review'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}