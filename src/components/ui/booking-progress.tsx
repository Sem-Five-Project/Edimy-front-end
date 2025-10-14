"use client";

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { BookingStep } from '@/contexts/BookingContext';

interface BookingProgressProps {
  currentStep: BookingStep;
  className?: string;
}

const steps = [
  { id: 'slot-selection', label: 'Select Slot', number: 1 },
  { id: 'payment', label: 'Payment', number: 2 },
  { id: 'confirmation', label: 'Confirmation', number: 3 }
];

export function BookingProgress({ currentStep, className = '' }: BookingProgressProps) {
  const getCurrentStepNumber = () => {
    switch (currentStep) {
      case 'slot-selection': return 1;
      case 'payment': return 2;
      case 'confirmation': return 3;
      default: return 1;
    }
  };

  const currentStepNumber = getCurrentStepNumber();

  return (
    <div className={`w-full bg-gradient-to-b from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-950/90 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => {
            const isCompleted = step.number < currentStepNumber;
            const isCurrent = step.number === currentStepNumber;
            const isUpcoming = step.number > currentStepNumber;

            return (
              <div key={step.id} className="flex items-center flex-1 group relative">
                <div className="flex items-center z-10">
                  {/* Animated Step Circle with Glow */}
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 ease-out
                      ${isCompleted 
                        ? 'bg-blue-600 border-blue-600 text-white scale-105 animate-glow-completed' 
                        : isCurrent 
                        ? 'bg-white border-blue-600 text-blue-600 shadow-xl ring-4 ring-blue-100/50 dark:ring-blue-900/50 animate-bounce-glow' 
                        : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200 group-hover:scale-105'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 animate-check-spin" />
                    ) : (
                      <span className="text-sm font-semibold animate-number-fade">{step.number}</span>
                    )}
                  </div>

                  {/* Animated Step Label with Underline */}
                  <div className="ml-4 relative">
                    <p
                      className={`
                        text-sm font-medium transition-all duration-500 ease-out relative
                        ${isCompleted || isCurrent 
                          ? 'text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 after:animate-underline' 
                          : 'text-gray-500 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gray-300 group-hover:after:w-full after:transition-all after:duration-300'
                        }
                      `}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>

                {/* Animated Connector Line with Dash Animation */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-6 relative overflow-hidden">
                    <div
                      className={`
                        h-1 rounded-full transition-all duration-700 ease-in-out
                        ${step.number < currentStepNumber 
                          ? 'bg-blue-600 animate-dash-progress' 
                          : 'bg-gray-200'
                        }
                      `}
                    />
                    <div className="absolute inset-0 h-1 rounded-full bg-gradient-to-r from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-gradient-flow"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}