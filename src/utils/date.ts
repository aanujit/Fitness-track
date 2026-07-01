/**
 * Date utility functions
 *
 * IMPORTANT: All date strings use LOCAL time, not UTC.
 * Using UTC (via toISOString) would cause dates to shift
 * for users in timezones ahead of UTC (e.g., IST, JST).
 */

/**
 * Formats a Date object to YYYY-MM-DD in LOCAL time.
 */
const toLocalDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Gets the current date in YYYY-MM-DD format (local time)
 */
export const getCurrentDateString = (): string => {
  return toLocalDateString(new Date());
};

/**
 * Formats a Date object to YYYY-MM-DD (local time)
 */
export const formatDateString = (date: Date): string => {
  return toLocalDateString(date);
};

/**
 * Formats a YYYY-MM-DD string into a readable format (e.g., "Jan 1, 2024")
 */
export const getReadableDate = (dateString: string): string => {
  // Parse as local date by splitting to avoid timezone shift
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
