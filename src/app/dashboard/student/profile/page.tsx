"use client";
import React, { useState } from 'react';
import { User, Edit2, Save, X, Camera, Mail, Phone, MapPin, Calendar, Book, Clock, CreditCard, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';

const ProfilePage = () => {
  const { actualTheme } = useTheme();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe123',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    dateOfBirth: '1995-06-15',
    bio: 'Passionate student focused on mathematics and computer science. Always eager to learn new concepts and apply them in real-world scenarios.',
    profileImage: '/api/placeholder/150/150',
    preferences: {
      subject: 'Mathematics',
      age: 28,
      learningStyle: 'Visual',
      availability: 'Evenings',
      timezone: 'EST'
    }
  });

  const [tempData, setTempData] = useState(profileData);

  const handleEdit = () => {
    setTempData(profileData);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData(tempData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setTempData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: string | number) => {
    setTempData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const quickStats = [
    { label: 'Classes Completed', value: '24', icon: Book, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Hours', value: '48', icon: Clock, color: 'from-green-500 to-green-600' },
    { label: 'Average Rating', value: '4.8', icon: Star, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Total Spent', value: '$1,200', icon: CreditCard, color: 'from-purple-500 to-purple-600' }
  ];

  const quickActions = [
    {
      title: 'Previous Classes',
      description: 'View and rate your completed classes',
      icon: Book,
      color: 'from-blue-500 to-blue-600',
      action: () => router.push('/dashboard/student/profile/previous-classes')
    },
    {
      title: 'Payment History',
      description: 'Check your transaction history',
      icon: CreditCard,
      color: 'from-green-500 to-green-600',
      action: () => router.push('/dashboard/student/profile/payments')
    }
  ];

  return (
    <div className={`min-h-screen ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50'} p-4`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <Card className="rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={profileData.profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
                />
                {isEditing && (
                  <Button className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${actualTheme === 'dark' ? 'text-white' : 'bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'}`}>
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className={`font-medium ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>@{profileData.username}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className={`flex items-center ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}><Mail className="w-4 h-4 mr-1" />{profileData.email}</span>
                  <span className={`flex items-center ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}><MapPin className="w-4 h-4 mr-1" />{profileData.location}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className={`text-2xl font-bold mb-1 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
              <p className={`text-sm font-medium ${actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Personal Information */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h2 className={`text-xl font-bold mb-6 flex items-center ${actualTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>First Name</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={tempData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  ) : (
                    <p className={`px-4 py-3 rounded-xl font-medium ${actualTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'}`}>{profileData.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Last Name</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={tempData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  ) : (
                    <p className={`px-4 py-3 rounded-xl font-medium ${actualTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'}`}>{profileData.lastName}</p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={tempData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                    />
                  ) : (
                    <p className={`px-4 py-3 rounded-xl font-medium ${actualTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'}`}>@{profileData.username}</p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={tempData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  ) : (
                    <p className={`px-4 py-3 rounded-xl font-medium ${actualTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'}`}>{profileData.email}</p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={tempData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  ) : (
                    <p className={`px-4 py-3 rounded-xl font-medium ${actualTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'}`}>{profileData.phone}</p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Date of Birth</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={tempData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  ) : (
                    <p className={`px-4 py-3 rounded-xl font-medium ${actualTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'}`}>
                      {new Date(profileData.dateOfBirth).toLocaleDateString()} ({calculateAge(profileData.dateOfBirth)} years)
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <label className={`block text-sm font-semibold mb-2 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
                {isEditing ? (
                  <Textarea
                    value={tempData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                  />
                ) : (
                  <p className={`px-4 py-3 rounded-xl ${actualTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'}`}>{profileData.bio}</p>
                )}
              </div>
            </Card>
          </div>

          {/* Learning Preferences & Quick Actions */}
          <div className="space-y-6">
            
            {/* Learning Preferences */}
            <Card className="rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h3 className={`text-lg font-bold mb-4 flex items-center ${actualTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                <Book className="w-5 h-5 mr-2 text-purple-500" />
                Learning Preferences
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Subject</label>
                  {isEditing ? (
                    <Select value={tempData.preferences.subject} onValueChange={(value) => handlePreferenceChange('subject', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className={`px-4 py-3 rounded-xl font-medium ${actualTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-purple-50 text-gray-800'}`}>{profileData.preferences.subject}</p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Learning Style</label>
                  {isEditing ? (
                    <Select value={tempData.preferences.learningStyle} onValueChange={(value) => handlePreferenceChange('learningStyle', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select learning style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Visual">Visual</SelectItem>
                        <SelectItem value="Auditory">Auditory</SelectItem>
                        <SelectItem value="Kinesthetic">Kinesthetic</SelectItem>
                        <SelectItem value="Reading/Writing">Reading/Writing</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className={`px-4 py-3 rounded-xl font-medium ${actualTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-purple-50 text-gray-800'}`}>{profileData.preferences.learningStyle}</p>
                  )}
                </div>
                
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Availability</label>
                  {isEditing ? (
                    <Select value={tempData.preferences.availability} onValueChange={(value) => handlePreferenceChange('availability', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mornings">Mornings</SelectItem>
                        <SelectItem value="Afternoons">Afternoons</SelectItem>
                        <SelectItem value="Evenings">Evenings</SelectItem>
                        <SelectItem value="Weekends">Weekends</SelectItem>
                        <SelectItem value="Flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className={`px-4 py-3 rounded-xl font-medium ${actualTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-purple-50 text-gray-800'}`}>{profileData.preferences.availability}</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h3 className={`text-lg font-bold mb-4 ${actualTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Quick Actions</h3>
              
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.action}
                    variant="outline"
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group ${actualTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} shadow-md`}>
                        <action.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className={`font-semibold ${actualTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{action.title}</p>
                        <p className={`text-sm ${actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{action.description}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${actualTheme === 'dark' ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;