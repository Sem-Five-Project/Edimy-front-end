"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Globe, Crown, Award, Zap, Sparkles, Trophy, Gem, User } from "lucide-react";
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
    <div className="relative overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-3xl rounded-3xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl"></div>
      
      <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
        {/* Currency Selector */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
            <Globe className="h-5 w-5 text-cyan-400" />
            <Select
              value={selectedCurrency.code}
              onValueChange={(code) => {
                const currency = CURRENCIES.find(c => c.code === code);
                if (currency) setCurrency(currency);
              }}
            >
              <SelectTrigger className="bg-white/10 backdrop-blur-md border-white/20 text-white h-10 rounded-xl hover:bg-white/20 transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white">
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code} className="hover:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{currency.symbol}</span>
                      <span className="font-medium">{currency.code}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Enhanced Avatar Section */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full opacity-75 group-hover:opacity-100 animate-pulse blur-lg"></div>
            <Avatar className="relative h-32 w-32 ring-4 ring-white/30 shadow-2xl group-hover:scale-105 transition-transform duration-300">
              <AvatarImage src={tutor.profileImage} className="object-cover" />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 text-white">
                {tutor.firstName[0]}
                {tutor.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            {/* Floating Rating Badge */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl px-4 py-2 shadow-2xl border border-yellow-300/50">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-yellow-900" />
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(tutor.rating)
                          ? "fill-yellow-900 text-yellow-900"
                          : "text-yellow-700"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-yellow-900 font-black">
                    {tutor.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Tutor Info */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-3">
                <h3 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent leading-tight">
                  {tutor.firstName} {tutor.lastName}
                </h3>
                
                {bookingPreferences?.selectedSubject && (
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <Crown className="h-5 w-5 text-purple-400" />
                    <span className="text-lg font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                      Teaching: {bookingPreferences.selectedSubject.subjectName}
                    </span>
                  </div>
                )}
                
                {bookingPreferences?.selectedLanguage && (
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <Globe className="h-4 w-4 text-cyan-400" />
                    <span className="text-white font-medium">
                      Language: {bookingPreferences.selectedLanguage.languageName}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Enhanced Price Display */}
              <div className="space-y-4">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 backdrop-blur-xl rounded-2xl group-hover:from-green-400/30 group-hover:to-emerald-400/30 transition-all duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl border border-green-400/30 rounded-2xl px-6 py-4 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                    <div className="text-center">
                      <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        {formatPrice(displayPrice)}
                      </div>
                      <div className="text-sm text-green-300 font-semibold">per hour</div>
                    </div>
                  </div>
                </div>
                
                {bookingPreferences?.selectedClassType && (
                  <div className="flex justify-center lg:justify-end">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 backdrop-blur-xl rounded-xl"></div>
                      <div className="relative bg-emerald-500/20 backdrop-blur-md rounded-xl px-4 py-2 border border-emerald-400/30">
                        <div className="flex items-center gap-2">
                          <Gem className="h-4 w-4 text-emerald-400" />
                          <span className="text-emerald-100 font-bold text-sm">
                            {bookingPreferences.selectedClassType.name}
                          </span>
                          {bookingPreferences.selectedClassType.priceMultiplier < 1.0 && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1">
                              {Math.round((1 - bookingPreferences.selectedClassType.priceMultiplier) * 100)}% OFF
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Enhanced Stats Section */}
            <div className="grid grid-cols-3 gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl"></div>
                <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center group-hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl font-black text-white">{tutor.experience}</div>
                  <div className="text-sm text-purple-300 font-medium">Years Experience</div>
                  <Award className="h-5 w-5 text-blue-400 mx-auto mt-2" />
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl"></div>
                <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center group-hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl font-black text-white">{tutor.completedClasses || 0}+</div>
                  <div className="text-sm text-emerald-300 font-medium">Classes Taught</div>
                  <Sparkles className="h-5 w-5 text-emerald-400 mx-auto mt-2" />
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl"></div>
                <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center group-hover:scale-105 transition-transform duration-300">
                  <div className="text-2xl font-black text-white">{tutor.classCompletionRate.toFixed(0)}%</div>
                  <div className="text-sm text-orange-300 font-medium">Success Rate</div>
                  <Zap className="h-5 w-5 text-orange-400 mx-auto mt-2" />
                </div>
              </div>
            </div>
            
            {/* Enhanced Subjects Display */}
            <div className="space-y-3">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <Gem className="h-5 w-5 text-purple-400" />
                <span className="text-white font-semibold">Available Subjects</span>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                {tutor.subjects.slice(0, 4).map((subject, index) => (
                  <div 
                    key={index} 
                    className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${
                      bookingPreferences?.selectedSubject?.subjectId === subject.subjectId
                        ? "scale-105"
                        : ""
                    }`}
                  >
                    <div className={`absolute inset-0 backdrop-blur-xl rounded-2xl ${
                      bookingPreferences?.selectedSubject?.subjectId === subject.subjectId
                        ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30"
                        : "bg-gradient-to-r from-white/10 to-white/20 group-hover:from-purple-500/20 group-hover:to-pink-500/20"
                    }`}></div>
                    <div className={`relative px-4 py-3 rounded-2xl border transition-all duration-300 ${
                      bookingPreferences?.selectedSubject?.subjectId === subject.subjectId
                        ? "border-purple-400/50 shadow-lg shadow-purple-500/25"
                        : "border-white/20 group-hover:border-purple-400/30"
                    }`}>
                      <div className="flex items-center gap-2">
                        {bookingPreferences?.selectedSubject?.subjectId === subject.subjectId && (
                          <Crown className="h-4 w-4 text-yellow-400" />
                        )}
                        <span className={`font-bold text-sm ${
                          bookingPreferences?.selectedSubject?.subjectId === subject.subjectId
                            ? "text-purple-200"
                            : "text-white group-hover:text-purple-200"
                        }`}>
                          {subject.subjectName}
                        </span>
                      </div>
                      <div className={`text-xs mt-1 font-semibold ${
                        bookingPreferences?.selectedSubject?.subjectId === subject.subjectId
                          ? "text-green-300"
                          : "text-green-400 group-hover:text-green-300"
                      }`}>
                        {formatPrice(subject.hourlyRate)}/hour
                      </div>
                    </div>
                  </div>
                ))}
                {tutor.subjects.length > 4 && (
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-gray-600/20 backdrop-blur-xl rounded-2xl group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all duration-300"></div>
                    <div className="relative px-4 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 group-hover:border-purple-400/30 transition-all duration-300">
                      <span className="text-white font-bold text-sm group-hover:text-purple-200">
                        +{tutor.subjects.length - 4} more subjects
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="flex flex-col gap-4">
            <Button className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl shadow-2xl px-6 py-3 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/20 group-hover:from-white/10 group-hover:to-white/30 transition-all duration-300"></div>
              <div className="relative flex items-center gap-2">
                <User className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                <span className="font-bold">View Profile</span>
              </div>
            </Button>
            
            <Button className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-2xl px-6 py-3 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/20 group-hover:from-white/10 group-hover:to-white/30 transition-all duration-300"></div>
              <div className="relative flex items-center gap-2">
                <Star className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                <span className="font-bold">Reviews</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};