"use client";

import React from "react";
import { Star, Clock, Users, GraduationCap, MapPin, Globe, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tutor } from "@/types";

interface TutorInfoCardProps {
  tutor: Tutor;
  className?: string;
  experienceFormatter?: (totalMonths: number) => string;
}

export function TutorInfoCard({ tutor, className = "", experienceFormatter = (months: number) => {
  if (!months || months < 1) return "New Tutor";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years && rem) return `${years}y ${rem}m experience`;
  if (years) return `${years}y experience`;
  return `${rem}m experience`;
} }: TutorInfoCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-5 h-5">
            <Star className="w-5 h-5 text-gray-300 fill-gray-300" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300 fill-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <Card className={`relative border-0 overflow-hidden rounded-2xl shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md ${className}`}>
      {/* Subtle Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-900/30 dark:to-blue-900/20 rounded-2xl"></div>
      
      {/* Accent Border */}
      <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-blue-500 to-indigo-600 rounded-l-2xl"></div>

      <CardContent className="relative p-6 pl-8 space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Enhanced Avatar */}
          <div className="flex-shrink-0 relative">
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg ring-2 ring-white/20 overflow-hidden group hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-white text-2xl font-bold flex items-center justify-center h-full">
                {
                  (() => {
                    const displayName = tutor.firstName ? `${tutor.firstName}${tutor.lastName ? ' ' + tutor.lastName : ''}` : (typeof (tutor as any).name === 'string' ? (tutor as any).name : 'Tutor');
                    return displayName?.[0] || 'T';
                  })()
                }
              </span>
            </div>
          </div>

          {/* Main Info Section */}
          <div className="flex-1 space-y-4">
            {/* Name, Rating & Verification */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {
                    (() => {
                      const displayName = tutor.firstName ? `${tutor.firstName}${tutor.lastName ? ' ' + tutor.lastName : ''}` : (typeof (tutor as any).name === 'string' ? (tutor as any).name : 'Tutor');
                      return displayName;
                    })()
                  }
                </h3>
                {tutor.isVerified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border-green-200 dark:border-green-800/50">
                    <Award className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              
              {/* Rating with Reviews */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {renderStars(tutor.rating || 0)}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {tutor.rating?.toFixed(1) || "New"} ({(tutor as any).reviews ?? 0} reviews)
                </span>
                <div className="flex items-center gap-1 ml-auto text-xs text-gray-500 dark:text-gray-400">
                  <Users className="w-3 h-3" />
                  {tutor.totalClasses || 0} sessions
                </div>
              </div>
            </div>

            {/* Professional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 dark:bg-gray-900/20 rounded-xl p-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {experienceFormatter((tutor as any).experienceMonths ?? tutor.experience ?? 0)}
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Experience</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">{tutor.completedClasses || 0}+</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
              </div>
            </div>

            {/* Bio */}
            {tutor.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                {tutor.bio}
              </p>
            )}

            {/* Subjects with Rates */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                Subjects
              </div>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects?.map((subject, index) => (
                  <div
                    key={index}
                    className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 text-blue-700 dark:text-blue-300 rounded-lg px-4 py-2 text-sm font-medium shadow-sm border border-blue-200/50 dark:border-blue-800/50 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex-1">{(subject as any).name ?? subject.subjectName}</span>
                      <span className="ml-2 font-semibold text-xs bg-white/50 dark:bg-gray-900/50 px-2 py-1 rounded">
                        Rs. {subject.hourlyRate}/hr
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/10 group-hover:from-blue-500/5 group-hover:to-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </div>
                )) || (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No subjects available
                  </div>
                )}
              </div>
            </div>

            {/* Languages - Fixed for string array */}
            {tutor.languages && tutor.languages.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Languages
                </div>
                <div className="flex flex-wrap gap-2">
                  {tutor.languages.slice(0, 3).map((language, index) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className="border-gray-300/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 text-xs px-3 py-1"
                    >
                      {typeof language === 'string' ? language : language.languageName}
                    </Badge>
                  ))}
                  {tutor.languages.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{tutor.languages.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}