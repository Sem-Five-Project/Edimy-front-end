"use client";

import MonthlyClassBookingFlow from '@/components/MonthlyClassBookingFlow';

export default function MonthlyBookingTest() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Monthly Booking Test Page</h1>
      <MonthlyClassBookingFlow 
        tutorId="tutor123"
        subjectId="math101"
        languageId="en"
        studentId="student456"
        tutorName="John Doe"
        subjectName="Mathematics"
      />
    </div>
  );
}
