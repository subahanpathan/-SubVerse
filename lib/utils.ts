import { ClassValue, clsx } from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeToNow(date: Date | string | number): string {
  const parsedDate = new Date(date);
  return formatDistanceToNowStrict(parsedDate, {
    addSuffix: true,
  });
}

export function formatKarma(karma: number): string {
  if (Math.abs(karma) >= 1000000) {
    return (karma / 1000000).toFixed(1) + "M";
  }
  if (Math.abs(karma) >= 1000) {
    return (karma / 1000).toFixed(1) + "k";
  }
  return karma.toString();
}

/**
 * Server-side string sanitization to prevent XSS before DB persistence.
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
