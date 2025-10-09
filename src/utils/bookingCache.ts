import { TimeSlot, BookingPreferences } from '@/types';

export interface BookingCache {
  tutorId: number;
  selectedDate: string;
  selectedSlot: TimeSlot;
  bookingPreferences: BookingPreferences;
  timestamp: number;
}

/**
 * Save booking data to localStorage cache for 30 minutes
 */
export const saveBookingCache = (
  tutorId: number,
  selectedDate: Date,
  selectedSlot: TimeSlot,
  bookingPreferences: BookingPreferences
): void => {
  const cacheData: BookingCache = {
    tutorId,
    selectedDate: selectedDate.toISOString(),
    selectedSlot,
    bookingPreferences,
    timestamp: Date.now(),
  };
  localStorage.setItem('booking_cache', JSON.stringify(cacheData));
};

/**
 * Get cached booking data if still valid (within 30 minutes)
 */
export const getBookingCache = (): BookingCache | null => {
  try {
    const cached = localStorage.getItem('booking_cache');
    if (!cached) return null;
    
    const cacheData: BookingCache = JSON.parse(cached);
    const thirtyMinutes = 30 * 60 * 1000;
    
    // Check if cache is still valid (30 minutes)
    if (Date.now() - cacheData.timestamp > thirtyMinutes) {
      localStorage.removeItem('booking_cache');
      return null;
    }
    
    return cacheData;
  } catch {
    return null;
  }
};

/**
 * Clear booking cache
 */
export const clearBookingCache = (): void => {
  localStorage.removeItem('booking_cache');
};

/**
 * Check if cached data matches current selection
 */
export const isCacheValid = (
  tutorId: number,
  selectedDate: Date,
  selectedSlot: TimeSlot
): boolean => {
  const cache = getBookingCache();
  if (!cache) return false;
  
  return (
    cache.tutorId === tutorId &&
    cache.selectedDate === selectedDate.toISOString() &&
    cache.selectedSlot.slotId === selectedSlot.slotId
  );
};
