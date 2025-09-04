"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Globe } from "lucide-react";
import { Tutor, BookingPreferences, CURRENCIES } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";

interface TutorHeaderProps {
  tutor: Tutor;
  bookingPreferences?: BookingPreferences;
}

export const TutorHeader: React.FC<TutorHeaderProps> = ({ tutor, bookingPreferences }) => {
  const { selectedCurrency, setCurrency, formatPrice } = useCurrency();
  
  // Calculate display price based on selected subject or default to tutor's hourly rate
  const getDisplayPrice = () => {
    if (bookingPreferences?.selectedSubject) {
      return bookingPreferences.selectedSubject.hourlyRate;
    }
    return tutor.hourlyRate;
  };

  const displayPrice = getDisplayPrice();
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800 p-6 shadow-lg">
      {/* Currency Selector */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <Select
            value={selectedCurrency.code}
            onValueChange={(code) => {
              const currency = CURRENCIES.find(c => c.code === code);
              if (currency) setCurrency(currency);
            }}
          >
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-1">
                    <span>{currency.symbol}</span>
                    <span>{currency.code}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-24 w-24 ring-4 ring-blue-100 dark:ring-blue-900 shadow-lg">
            <AvatarImage src={tutor.profileImage} className="object-cover" />
            <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              {tutor.firstName[0]}
              {tutor.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          {/* Rating badge */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 shadow-md">
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
                <span className="text-xs text-gray-600 dark:text-gray-400 ml-1 font-medium">
                  {tutor.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tutor Info */}
        <div className="flex-1 text-center lg:text-left space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {tutor.firstName} {tutor.lastName}
              </h3>
              {bookingPreferences?.selectedSubject && (
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Teaching: {bookingPreferences.selectedSubject.subjectName}
                </p>
              )}
              {bookingPreferences?.selectedLanguage && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Language: {bookingPreferences.selectedLanguage.languageName}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-xl shadow-sm">
                <span className="text-2xl font-bold">{formatPrice(displayPrice)}</span>
                <span className="text-sm ml-1">/hour</span>
              </div>
              
              {bookingPreferences?.selectedClassType && (
                <div className="flex justify-center lg:justify-end">
                  <div className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs font-medium">
                    {bookingPreferences.selectedClassType.name}
                    {bookingPreferences.selectedClassType.priceMultiplier < 1.0 && (
                      <span className="ml-1">
                        ({Math.round((1 - bookingPreferences.selectedClassType.priceMultiplier) * 100)}% OFF)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <span className="font-medium">{tutor.experience}</span>
              <span>years exp</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{tutor.completedClasses || 0}+</span>
              <span>classes</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{tutor.classCompletionRate.toFixed(0)}%</span>
              <span>completion</span>
            </div>
          </div>
          
          {/* Subjects */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-3">
            {tutor.subjects.slice(0, 4).map((subject, index) => (
              <div key={index} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                bookingPreferences?.selectedSubject?.subjectId === subject.subjectId
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}>
                {subject.subjectName}
                <span className="ml-1 text-xs opacity-75">
                  {formatPrice(subject.hourlyRate)}/hr
                </span>
              </div>
            ))}
            {tutor.subjects.length > 4 && (
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                +{tutor.subjects.length - 4} more
              </span>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/20">
            View Profile
          </Button>
          <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/20">
            Reviews
          </Button>
        </div>
      </div>
    </div>
  );
};