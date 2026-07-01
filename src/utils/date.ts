/**
 * Date utility functions
 */

/**
 * Gets the current date in YYYY-MM-DD format
 */
export const getCurrentDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Formats a Date object to YYYY-MM-DD
 */
export const formatDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Formats a YYYY-MM-DD string into a readable format (e.g., "Jan 1, 2024")
 */
export const getReadableDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
