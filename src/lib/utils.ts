import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a readable string
 * @param date Date to format
 * @returns Formatted date string (e.g., "Monday, January 1, 2024")
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Format a time string to 12-hour format
 * @param time Time string in HH:mm format
 * @returns Formatted time string (e.g., "9:00 AM")
 */
export const formatTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return time; // Return original time if parsing fails
  }
};

/**
 * Format date and time together
 * @param date Date object
 * @param time Time string in HH:mm format
 * @returns Formatted date and time string (e.g., "Monday, January 1, 2024 at 9:00 AM")
 */
export const formatDateTime = (date: Date, time: string): string => {
  return `${formatDate(date)} at ${formatTime(time)}`;
};