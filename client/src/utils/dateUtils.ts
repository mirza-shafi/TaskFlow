export const getSystemTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Returns the YYYY-MM-DD string for a given date in a specific timezone.
 */
export const getDateStringInTimezone = (dateStr: Date | string | null, timezone: string): string | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

  try {
    // en-CA gives YYYY-MM-DD format
    return date.toLocaleDateString('en-CA', { timeZone: timezone });
  } catch (err) {
    console.error(`Invalid timezone: ${timezone}`, err);
    return date.toLocaleDateString('en-CA'); // Fallback to system
  }
};

export const isSameDayInTimezone = (
  dateA: Date | string,
  dateB: Date | string,
  timezone: string
): boolean => {
  const strA = getDateStringInTimezone(dateA, timezone);
  const strB = getDateStringInTimezone(dateB, timezone);
  return strA !== null && strB !== null && strA === strB;
};

export const isOverdueInTimezone = (
  dueDate: Date | string,
  referenceDate: Date | string,
  timezone: string
): boolean => {
  const dueStr = getDateStringInTimezone(dueDate, timezone);
  const refStr = getDateStringInTimezone(referenceDate, timezone);

  if (!dueStr || !refStr) return false;
  return dueStr < refStr;
};

export const isUpcomingInTimezone = (
  dueDate: Date | string,
  referenceDate: Date | string,
  timezone: string
): boolean => {
  const dueStr = getDateStringInTimezone(dueDate, timezone);
  const refStr = getDateStringInTimezone(referenceDate, timezone);

  if (!dueStr || !refStr) return false;
  return dueStr > refStr;
};

export const formatDisplayDate = (date: Date | string, timezone: string): string => {
   const d = new Date(date);
   return new Intl.DateTimeFormat('en-US', {
     month: 'short',
     day: 'numeric',
     timeZone: timezone
   }).format(d);
};

export const formatDisplayDateTime = (
  date: Date | string, 
  timezone: string, 
  timeFormat: '12h' | '24h'
): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: timeFormat === '12h',
    timeZone: timezone
  }).format(d);
};

export const formatTime = (
  date: Date | string, 
  timezone: string, 
  timeFormat: '12h' | '24h'
): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: timeFormat === '12h',
    timeZone: timezone
  }).format(d);
};
