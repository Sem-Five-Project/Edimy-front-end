"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Option {
  value: string;
  label: string;
  sublabel?: string; // will be shown as badge (price)
  badge?: string;
}

interface StyledSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Option[];
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function StyledSelect({
  value,
  onValueChange,
  placeholder,
  options,
  label,
  icon,
  className = '',
  disabled = false
}: StyledSelectProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 group">
          {icon && (
            <span className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
              {icon}
            </span>
          )}
          <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:transition-all after:duration-300 group-hover:after:w-full">
            {label}
          </span>
        </label>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className="h-12 w-full bg-white/90 dark:bg-gray-800/90 border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-between px-4 py-2"
        >
          <div className="flex items-center gap-3 flex-1 truncate">
            {icon && (
              <span className="text-gray-500 dark:text-gray-400 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400">
                {icon}
              </span>
            )}
            <SelectValue
              placeholder={placeholder}
              className="text-gray-900 dark:text-gray-100 truncate text-base font-medium"
            />
          </div>
        </SelectTrigger>
        <SelectContent
          className="bg-white/95 dark:bg-gray-800/95 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl mt-1 backdrop-blur-sm animate-fade-in"
          align="start"
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="h-12 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 focus:bg-gradient-to-r focus:from-blue-100 focus:to-indigo-100 dark:focus:from-blue-900/30 dark:focus:to-indigo-900/30 transition-all duration-300 rounded-lg"
            >
              <div className="flex items-center justify-between w-full px-4 py-2 relative">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-base">
                    {option.label}
                  </span>
                  {option.sublabel && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full shadow-inner">
                      {option.sublabel}
                    </span>
                  )}
                </div>
                {option.badge && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full shadow-inner">
                    {option.badge}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
