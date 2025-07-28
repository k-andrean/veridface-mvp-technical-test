import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility to capitalize the first letter of a string
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const venues = [
    'BIL Workshop Room',
    'BIL Amphitheatre',
    'Executive Boardroom',
    'Yayasan An-Naura Hall',
    'Innovation Lab'
];