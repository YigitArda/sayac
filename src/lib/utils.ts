import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as dateFnsFormat } from "date-fns"
import { tr } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utility with Turkish locale
export function format(date: Date | string | number, formatStr: string): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  // date-fns doesn't support EEEE, use eeee instead (ISO day of week)
  // Replace common format tokens
  const mappedFormat = formatStr
    .replace(/EEEE/g, 'eeee')  // Full day name
    .replace(/MMM/g, 'MMM')    // Short month name
    .replace(/MMMM/g, 'MMMM'); // Full month name
  
  try {
    return dateFnsFormat(d, mappedFormat, { locale: tr })
  } catch {
    // Fallback to basic formatting
    const pad = (n: number) => n.toString().padStart(2, '0');
    const tokens: Record<string, string> = {
      'yyyy': d.getFullYear().toString(),
      'MM': pad(d.getMonth() + 1),
      'dd': pad(d.getDate()),
      'HH': pad(d.getHours()),
      'mm': pad(d.getMinutes()),
      'ss': pad(d.getSeconds()),
    };
    
    let result = formatStr;
    Object.entries(tokens).forEach(([key, value]) => {
      result = result.replace(key, value);
    });
    return result;
  }
}

// Time formatting utility
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}s ${mins}dk`;
  }
  return `${mins}dk`;
}

// Relative time formatting
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} gün önce`;
  if (hours > 0) return `${hours} saat önce`;
  if (minutes > 0) return `${minutes} dakika önce`;
  return 'az önce';
}
