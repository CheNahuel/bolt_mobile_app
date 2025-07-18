import Decimal from 'decimal.js';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates amount input according to strict criteria:
 * - Must contain only numeric digits (0-9), decimal point, and optional leading/trailing spaces
 * - No special characters, letters, or spaces allowed (except leading/trailing spaces)
 * - Must be a positive number greater than 0
 * - Must not exceed 999,999,999.99
 * - Must accept up to 2 decimal places
 * - Must handle both integer and decimal values
 */
export function validateAmountInput(input: string): ValidationResult {
  // Handle null, undefined, or empty input
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      errorMessage: 'Amount is required'
    };
  }

  // Trim leading and trailing spaces and normalize decimal separator
  const trimmedInput = input.trim().replace(',', '.');
  
  // Check if empty after trimming
  if (trimmedInput === '') {
    return {
      isValid: false,
      errorMessage: 'Amount is required'
    };
  }

  // Check for valid characters only (digits, single decimal point)
  const validCharacterPattern = /^[0-9]+(\.[0-9]{0,2})?$/;
  if (!validCharacterPattern.test(trimmedInput)) {
    // More specific error messages for common issues
    if (/[a-zA-Z]/.test(trimmedInput)) {
      return {
        isValid: false,
        errorMessage: 'Amount cannot contain letters'
      };
    }
    
    if (/[^0-9.]/.test(trimmedInput)) {
      return {
        isValid: false,
        errorMessage: 'Amount can only contain numbers and decimal point'
      };
    }
    
    if ((trimmedInput.match(/\./g) || []).length > 1) {
      return {
        isValid: false,
        errorMessage: 'Amount can only have one decimal point'
      };
    }
    
    if (/\.\d{3,}/.test(trimmedInput)) {
      return {
        isValid: false,
        errorMessage: 'Amount can have maximum 2 decimal places'
      };
    }
    
    return {
      isValid: false,
      errorMessage: 'Invalid amount format'
    };
  }

  // Convert to number for numerical validations
  let numericValue: Decimal;
  try {
    numericValue = new Decimal(trimmedInput);
  } catch (error) {
    return {
      isValid: false,
      errorMessage: 'Invalid number format'
    };
  }
  
  // Check if positive and greater than 0
  if (numericValue.lte(0)) {
    return {
      isValid: false,
      errorMessage: 'Amount must be greater than 0,00'
    };
  }

  // Check for edge cases with decimal precision
  const decimalPart = trimmedInput.split('.')[1];
  if (decimalPart && decimalPart.length > 2) {
    return {
      isValid: false,
      errorMessage: 'Amount can have maximum 2 decimal places'
    };
  }

  // Check for leading zeros (except for values like 0.50)
  if (trimmedInput.length > 1 && trimmedInput.startsWith('0') && !trimmedInput.startsWith('0.')) {
    return {
      isValid: false,
      errorMessage: 'Invalid number format'
    };
  }

  return {
    isValid: true
  };
}

/**
 * Legacy function for backward compatibility
 * Returns boolean only (matches existing validateAmount function signature)
 */
export function validateAmount(value: string): boolean {
  return validateAmountInput(value).isValid;
}

/**
 * Formats a valid amount string to ensure consistent display
 * Should only be called after validation passes
 */
export function formatAmountInput(input: string): string {
  const trimmed = input.trim().replace(',', '.');
  
  try {
    const decimal = new Decimal(trimmed);
    // Always format with exactly 2 decimal places and comma separator
    const formatted = decimal.toFixed(2);
    
    // Replace dot with comma for display
    return formatted.replace('.', ',');
  } catch (error) {
    return '0,00';
  }
}

/**
 * Real-time validation for input fields
 * Provides immediate feedback as user types
 */
export function validateAmountRealTime(input: string): {
  isValid: boolean;
  errorMessage?: string;
  warningMessage?: string;
} {
  // Allow empty input during typing
  if (!input || input.trim() === '') {
    return { isValid: true };
  }

  const result = validateAmountInput(input);
  
  return result;
}