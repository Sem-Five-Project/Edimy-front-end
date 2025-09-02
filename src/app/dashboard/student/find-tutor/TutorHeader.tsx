"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Tutor } from "@/types";

interface TutorHeaderProps {
  tutor: Tutor;
}

export const TutorHeader: React.FC<TutorHeaderProps> = ({ tutor }) => (
  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {/* Avatar */}
      <div className="relative">
        <Avatar className="h-20 w-20 ring-2 ring-blue-100 dark:ring-blue-900">
          <AvatarImage src={tutor.profileImage} className="object-cover" />
          <AvatarFallback className="text-lg font-semibold bg-blue-600 text-white">
            {tutor.firstName[0]}
            {tutor.lastName[0]}
          </AvatarFallback>
        </Avatar>
        
        {/* Rating badge */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-1 shadow-sm">
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(tutor.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                ({tutor.rating.toFixed(1)})
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tutor Info */}
      <div className="flex-1 text-center sm:text-left space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {tutor.firstName} {tutor.lastName}
          </h3>
          <div className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg">
            <span className="text-lg font-bold">${tutor.hourlyRate}</span>
            <span className="text-sm ml-1">/hour</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span>{tutor.experience} years exp</span>
          <span>•</span>
          <span>{tutor.completedClasses}+ classes</span>
          <span>•</span>
          <span>{tutor.classCompletionRate.toFixed(0)}% completion</span>
        </div>
        
        {/* Subjects */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-1 mt-2">
          {tutor.subjects.slice(0, 3).map((subject, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs">
              {subject}
            </span>
          ))}
          {tutor.subjects.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs">
              +{tutor.subjects.length - 3}
            </span>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
          View Profile
        </Button>
        <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50">
          Reviews
        </Button>
      </div>
    </div>
  </div>
);