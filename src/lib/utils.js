import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 


export const isIframe = window.self !== window.top;

/**
 * Parses a date string from the backend, ensuring it's treated as UTC.
 * The backend returns ISO strings sometimes without a timezone suffix,
 * which JS would otherwise interpret as local time — breaking "há X minutos".
 */
export function parseServerDate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  // If the string has no timezone info (no Z and no +/- offset after the T),
  // append Z to treat it as UTC.
  const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(dateStr);
  return new Date(hasTz ? dateStr : dateStr + 'Z');
}