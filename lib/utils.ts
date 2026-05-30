import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0');
}

export function formatDuree(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${pad(m)}min`;
  if (m > 0) return `${m}min ${pad(s)}s`;
  return `${s}s`;
}

export function normaliserReponse(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.,;]+$/, '');
}
