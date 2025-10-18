# React Query Caching Implementation

## Overview
The Student Dashboard (`src/app/dashboard/student/page.tsx`) has been upgraded to use React Query for data fetching with intelligent caching.

## Benefits

### 1. **Performance Improvements**
- ⚡ Reduced API calls - data is cached for 5 minutes
- 🚀 Faster page loads - cached data is shown instantly
- 📉 Lower server load - fewer unnecessary requests

### 2. **Better User Experience**
- ⏱️ Instant data display from cache
- 🔄 Background updates keep data fresh
- 🎯 Smart refetching on window focus
- 💾 Persistent cache during navigation

### 3. **Developer Benefits**
- 🧹 Cleaner code - no manual state management
- 🐛 Better error handling
- 🔧 Easy to configure and maintain

## Cache Configuration

```typescript
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

useQuery({
  queryKey: ['dataKey', dependencies],
  queryFn: async () => { /* fetch data */ },
  enabled: !!condition,           // Only fetch when condition is true
  staleTime: CACHE_TIME,          // Data fresh for 5 minutes
  gcTime: CACHE_TIME,             // Cache persists for 5 minutes
})
```

## Implemented Queries

### 1. **Student Bookings & Stats**
- **Query Key**: `['studentBookings', effectiveStudentId]`
- **Fetches**: Booking details + Profile statistics
- **Invalidates**: When `effectiveStudentId` changes

### 2. **Suggested Tutors**
- **Query Key**: `['suggestedTutors', educationLevel, stream]`
- **Fetches**: Filtered tutors based on student's education
- **Invalidates**: When education level or stream changes

### 3. **Popular Subjects**
- **Query Key**: `['popularSubjects', educationLevel, stream]`
- **Fetches**: Subjects filtered by education level/stream
- **Invalidates**: When education level or stream changes

### 4. **My Classes**
- **Query Key**: `['myClasses', effectiveStudentId]`
- **Fetches**: Student's enrolled classes
- **Invalidates**: When `effectiveStudentId` changes

## How Caching Works

### Initial Load
```
User visits dashboard → React Query fetches data → Data cached for 5 min
```

### Within 5 Minutes
```
User returns to dashboard → Cached data shown instantly → No API call
```

### After 5 Minutes (Stale)
```
User returns to dashboard → Cached data shown → Background refetch → UI updates
```

### Window Focus
```
User switches back to tab → Automatic background refetch (if stale)
```

## Cache Invalidation

You can manually invalidate cache when needed:

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['studentBookings'] });

// Refetch specific query
queryClient.refetchQueries({ queryKey: ['myClasses'] });

// Clear all cache
queryClient.clear();
```

## Testing Cache Behavior

### View Cache in DevTools
1. Install React Query DevTools (already configured)
2. Look for floating DevTools icon in development
3. Click to see all cached queries and their states

### Verify Caching
1. Load the dashboard (observe network requests)
2. Navigate away and back within 5 minutes
3. No new network requests should appear
4. After 5 minutes, background refetch occurs

## Best Practices

### ✅ Do
- Use descriptive query keys
- Include all dependencies in query keys
- Set appropriate cache times based on data volatility
- Enable queries conditionally when dependencies are ready

### ❌ Don't
- Set cache time too low (defeats purpose)
- Set cache time too high (stale data risk)
- Forget to include dependencies in query keys
- Fetch data when dependencies are undefined

## Customization

### Adjust Cache Duration
```typescript
// Shorter cache (2 minutes)
const CACHE_TIME = 2 * 60 * 1000;

// Longer cache (10 minutes)
const CACHE_TIME = 10 * 60 * 1000;

// No cache (always fresh)
const CACHE_TIME = 0;
```

### Disable Auto-Refetch on Focus
```typescript
useQuery({
  // ... other options
  refetchOnWindowFocus: false,
  refetchOnMount: false,
})
```

### Background Polling
```typescript
useQuery({
  // ... other options
  refetchInterval: 30000, // Refetch every 30 seconds
})
```

## Migration Notes

### Before (useState + useEffect)
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.getData();
      setData(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [dependency]);
```

### After (React Query)
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['dataKey', dependency],
  queryFn: async () => {
    const res = await api.getData();
    return res.data;
  },
  staleTime: CACHE_TIME,
  gcTime: CACHE_TIME,
});
```

## Performance Metrics

### Expected Improvements
- **Initial Load**: Same as before (~500-1000ms)
- **Subsequent Loads**: 10-50ms (from cache)
- **API Requests**: Reduced by ~80% during typical usage
- **User Perception**: Near-instant page loads

## Troubleshooting

### Cache Not Working
1. Check query keys are consistent
2. Verify cache time is set correctly
3. Check if `enabled` condition is true
4. Look for errors in React Query DevTools

### Data Not Updating
1. Check if cache time is too long
2. Manually invalidate query after mutations
3. Verify query key dependencies are correct

### Memory Issues
1. Reduce cache time if needed
2. Limit number of cached queries
3. Use `gcTime` to control cache persistence

## Future Enhancements

- [ ] Implement optimistic updates for mutations
- [ ] Add pagination support with infinite queries
- [ ] Implement prefetching for predicted navigation
- [ ] Add retry logic for failed requests
- [ ] Implement request deduplication
