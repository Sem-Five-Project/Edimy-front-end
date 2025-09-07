'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getTutorById,
  getSubjectsList,
  type Tutor,
  type TutorSubject,
  type AvailabilitySlot
} from '@/lib/tutorsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2,
  User,
  BookOpen,
  Clock,
  Shield,
  DollarSign
} from 'lucide-react';

interface TutorEditPageProps {
  params: {
    id: string;
  };
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function TutorEditPage({ params }: TutorEditPageProps) {
  const router = useRouter();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    notes: '',
    isVerified: false,
    subjects: [] as TutorSubject[],
    availability: [] as AvailabilitySlot[],
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tutorData, subjectsList] = await Promise.all([
        getTutorById(params.id),
        getSubjectsList()
      ]);

      if (tutorData) {
        setTutor(tutorData);
        setFormData({
          name: tutorData.name,
          email: tutorData.email,
          phone: tutorData.phone || '',
          bio: tutorData.bio || '',
          notes: tutorData.notes || '',
          isVerified: tutorData.isVerified,
          subjects: [...tutorData.subjects],
          availability: [...tutorData.availability],
        });
      }
      setSubjects(subjectsList);
    } catch (error) {
      console.error('Error fetching tutor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubjectAdd = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [
        ...prev.subjects,
        { subject: '', hourlyRate: 0, experienceLevel: 'Beginner' as const }
      ]
    }));
  };

  const handleSubjectUpdate = (index: number, field: keyof TutorSubject, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map((subject, i) => 
        i === index ? { ...subject, [field]: value } : subject
      )
    }));
  };

  const handleSubjectRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }));
  };

  const handleAvailabilityAdd = () => {
    setFormData(prev => ({
      ...prev,
      availability: [
        ...prev.availability,
        { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true }
      ]
    }));
  };

  const handleAvailabilityUpdate = (index: number, field: keyof AvailabilitySlot, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const handleAvailabilityRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving tutor data:', formData);
      router.push(`/dashboard/admin/users/tutors/${params.id}`);
    } catch (error) {
      console.error('Error saving tutor:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Tutor Not Found</h2>
          <p className="text-gray-600 mt-2">The tutor you're trying to edit doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/admin/users/tutors">Back to Tutors</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/admin/users/tutors/${params.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Tutor</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Verification Status
                </Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified"
                    checked={formData.isVerified}
                    onCheckedChange={(checked) => handleInputChange('isVerified', checked as boolean)}
                  />
                  <label htmlFor="verified" className="text-sm font-medium">
                    Verified Tutor
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Enter tutor bio..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Internal notes for admin use..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Subjects & Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Subjects & Hourly Rates
              </div>
              <Button onClick={handleSubjectAdd} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.subjects.map((subject, index) => (
                <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Label>Subject</Label>
                    <Select
                      value={subject.subject}
                      onValueChange={(value) => handleSubjectUpdate(index, 'subject', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subjectName) => (
                          <SelectItem key={subjectName} value={subjectName}>
                            {subjectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-32 space-y-2">
                    <Label>Hourly Rate</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={subject.hourlyRate}
                        onChange={(e) => handleSubjectUpdate(index, 'hourlyRate', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="w-40 space-y-2">
                    <Label>Experience Level</Label>
                    <Select
                      value={subject.experienceLevel}
                      onValueChange={(value) => handleSubjectUpdate(index, 'experienceLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSubjectRemove(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {formData.subjects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No subjects added yet. Click "Add Subject" to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Weekly Availability
              </div>
              <Button onClick={handleAvailabilityAdd} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Time Slot
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.availability.map((slot, index) => (
                <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
                  <div className="w-40 space-y-2">
                    <Label>Day</Label>
                    <Select
                      value={slot.day}
                      onValueChange={(value) => handleAvailabilityUpdate(index, 'day', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-32 space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleAvailabilityUpdate(index, 'startTime', e.target.value)}
                    />
                  </div>

                  <div className="w-32 space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleAvailabilityUpdate(index, 'endTime', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`available-${index}`}
                      checked={slot.isAvailable}
                      onCheckedChange={(checked) => handleAvailabilityUpdate(index, 'isAvailable', checked as boolean)}
                    />
                    <label htmlFor={`available-${index}`} className="text-sm font-medium">
                      Available
                    </label>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAvailabilityRemove(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {formData.availability.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No availability slots added yet. Click "Add Time Slot" to set up the schedule.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/admin/users/tutors/${params.id}`}>
              Cancel
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
