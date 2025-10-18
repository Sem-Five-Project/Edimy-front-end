import { useEffect, useState } from "react";
import { getBookingCache, BookingCache } from "@/utils/bookingCache";
import { TimeSlot, BookingPreferences } from "@/types";

/**
 * Example usage of booking cache in a slot selection page
 * This shows how to retrieve and pre-populate cached booking data
 */
export const useBookingCacheExample = () => {
  const [cachedData, setCachedData] = useState<BookingCache | null>(null);

  useEffect(() => {
    // Load cached data when component mounts
    const cache = getBookingCache();
    if (cache) {
      setCachedData(cache);
      console.log("Found cached booking data:", cache);

      // You can pre-populate form fields or UI with cached data:
      // - Set selected tutor: cache.tutorId
      // - Set selected date: new Date(cache.selectedDate)
      // - Set selected slot: cache.selectedSlot
      // - Set booking preferences: cache.bookingPreferences

      // Example of how you might use it:
      // setSelectedTutor(tutors.find(t => t.id === cache.tutorId));
      // setSelectedDate(new Date(cache.selectedDate));
      // setSelectedSlot(cache.selectedSlot);
      // setBookingPreferences(cache.bookingPreferences);
    }
  }, []);

  return cachedData;
};

/**
 * Example hook for checking if current selection matches cache
 */
export const useCacheValidation = (
  tutorId: number,
  selectedDate: Date,
  selectedSlot: TimeSlot | null,
) => {
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    if (!selectedSlot) return;

    const cache = getBookingCache();
    if (cache) {
      const matches =
        cache.tutorId === tutorId &&
        cache.selectedDate === selectedDate.toISOString() &&
        cache.selectedSlot.slotId === selectedSlot.slotId;
      setIsFromCache(matches);
    }
  }, [tutorId, selectedDate, selectedSlot]);

  return isFromCache;
};

/**
 * Example component showing how to integrate cache into slot selection
 */
const SlotSelectionExample = () => {
  const cachedData = useBookingCacheExample();

  return (
    <div>
      {cachedData && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-blue-800">
            Previous Selection Restored
          </h3>
          <p className="text-blue-600 text-sm">
            We found your previous booking selection from{" "}
            {new Date(cachedData.selectedDate).toLocaleDateString()}
          </p>
          <p className="text-blue-600 text-sm">
            Slot: {cachedData.selectedSlot.startTime} -{" "}
            {cachedData.selectedSlot.endTime}
          </p>
          <p className="text-blue-600 text-sm">
            Subject:{" "}
            {cachedData.bookingPreferences.selectedSubject?.subjectName}
          </p>
        </div>
      )}
      {/* Rest of your slot selection UI */}
    </div>
  );
};

export default SlotSelectionExample;
