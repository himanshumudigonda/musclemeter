import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function generateUPILink(
  vpa: string,
  recipientName: string,
  amount: number,
  transactionNote: string
): string {
  const encodedName = encodeURIComponent(recipientName);
  const encodedNote = encodeURIComponent(transactionNote);
  return `upi://pay?pa=${vpa}&pn=${encodedName}&am=${amount}&tn=${encodedNote}&cu=INR`;
}

export function getCrowdLevel(
  currentCount: number,
  maxCapacity: number
): "low" | "medium" | "high" {
  const percentage = (currentCount / maxCapacity) * 100;
  if (percentage < 40) return "low";
  if (percentage < 70) return "medium";
  return "high";
}

export function getCrowdPercentage(
  currentCount: number,
  maxCapacity: number
): number {
  return Math.min(Math.round((currentCount / maxCapacity) * 100), 100);
}

export function getCrowdLabel(
  currentCount: number,
  maxCapacity: number
): string {
  const percentage = getCrowdPercentage(currentCount, maxCapacity);
  const level = getCrowdLevel(currentCount, maxCapacity);

  const labels = {
    low: "Low Traffic — Great Time to Visit!",
    medium: "Moderate Traffic",
    high: "High Traffic — Consider Off-Peak Hours",
  };

  return `${percentage}% Full — ${labels[level]}`;
}

export function generateBookingId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `GS-${timestamp}-${randomPart}`.toUpperCase();
}

export function validateUTR(utr: string): boolean {
  // UTR format: 12-digit numeric for most banks
  // Can be alphanumeric for some banks
  const utrRegex = /^[A-Za-z0-9]{12,22}$/;
  return utrRegex.test(utr.trim());
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
