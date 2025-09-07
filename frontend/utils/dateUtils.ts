/**
 * Utility functions for consistent date handling across the application
 * Addresses serialization issues when dates are converted to/from JSON
 */

/**
 * Safely converts a value to a Date object with fallback handling
 * @param dateValue - Can be Date, string, number, or null/undefined
 * @param fallbackDate - Fallback date if conversion fails (default: epoch time)
 * @returns Valid Date object
 */
export function safeToDate(dateValue: any, fallbackDate: Date = new Date(0)): Date {
  // Already a valid Date object
  if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
    return dateValue;
  }
  
  // String or number that can be converted
  if ((typeof dateValue === 'string' && dateValue) || typeof dateValue === 'number') {
    const converted = new Date(dateValue);
    if (!isNaN(converted.getTime())) {
      return converted;
    }
  }
  
  // Fallback for null/undefined/invalid values
  return fallbackDate;
}

/**
 * Safely gets toDateString() with proper error handling
 * @param dateValue - Can be Date, string, number, or null/undefined  
 * @param fallbackString - Fallback string if conversion fails
 * @returns Date string in format "Mon Jan 01 1970"
 */
export function safeToDateString(dateValue: any, fallbackString: string = '1970-01-01'): string {
  const date = safeToDate(dateValue);
  return date.toDateString();
}

/**
 * Converts user data from API/localStorage to ensure dates are proper Date objects
 * @param user - User object that may have serialized dates
 * @returns User object with properly converted Date objects
 */
export function normalizeUserDates(user: any): any {
  if (!user) return user;
  
  return {
    ...user,
    lastActiveDate: user.lastActiveDate ? safeToDate(user.lastActiveDate) : new Date(0),
    createdAt: user.createdAt ? safeToDate(user.createdAt) : new Date(),
  };
}

/**
 * Checks if two dates are the same day (ignoring time)
 * @param date1 - First date (any format)
 * @param date2 - Second date (any format) 
 * @returns true if same day
 */
export function isSameDay(date1: any, date2: any): boolean {
  const d1 = safeToDate(date1);
  const d2 = safeToDate(date2);
  
  return d1.toDateString() === d2.toDateString();
}

/**
 * Checks if user can claim daily bonus (not claimed today)
 * @param lastActiveDate - User's last active date (any format)
 * @returns true if daily bonus can be claimed
 */
export function canClaimDailyBonus(lastActiveDate: any): boolean {
  const today = new Date();
  const lastActive = safeToDate(lastActiveDate, new Date(0)); // Use epoch as fallback to allow bonus
  
  return !isSameDay(today, lastActive);
}