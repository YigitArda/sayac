// Safe localStorage operations with error handling

// Date reviver for JSON.parse - converts ISO date strings back to Date objects
const dateReviver = (key: string, value: unknown): unknown => {
  // List of known date fields
  const dateFields = [
    'createdAt', 'updatedAt', 'completedAt', 'date', 'startedAt', 'endedAt',
    'earnedAt', 'lastCompleted', 'completedAt', 'joinedAt', 'exportedAt',
    'lastTriggered'
  ];
  
  if (typeof value === 'string' && dateFields.includes(key)) {
    // Check if it looks like an ISO date string
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (dateRegex.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  return value;
};

export function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item, dateReviver) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

export function safeSetItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
}

export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
    return false;
  }
}
