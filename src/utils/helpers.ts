import { format, parse } from 'date-fns';
import Decimal from 'decimal.js';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseAmount(value: string): string {
  // Handle both comma and dot as decimal separators
  // First normalize: replace comma with dot, remove thousands separators
  const normalized = value
    .replace(/\./g, '') // Remove thousands separators (dots)
    .replace(',', '.'); // Replace decimal comma with dot
    
  const cleaned = normalized.replace(/[^\d.-]/g, '');
  
  try {
    const decimal = new Decimal(cleaned || '0');
    return decimal.toFixed(2); // Always return with 2 decimal places
  } catch (error) {
    return '0.00';
  }
}

// Import the new validation function
export { validateAmount, validateAmountInput, formatAmountInput } from './validation';

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}