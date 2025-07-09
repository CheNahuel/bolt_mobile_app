import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (value: string) => void;
  initialValue?: string;
}

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

const Calculator: React.FC<CalculatorProps> = ({
  isOpen,
  onClose,
  onResult,
  initialValue = ''
}) => {
  const [display, setDisplay] = useState('0.00');
  const [rawInput, setRawInput] = useState('');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Constants for validation
  const MAX_VALUE = 999999.99;
  const MIN_VALUE = 0.01;
  const MAX_DIGITS = 9; // Including decimal places

  // Reset calculator when opened
  useEffect(() => {
    if (isOpen) {
      const initial = initialValue && initialValue !== '0' ? initialValue : '';
      if (initial) {
        const formatted = formatAmount(initial);
        setDisplay(formatted);
        setRawInput(initial);
      } else {
        setDisplay('0.00');
        setRawInput('');
      }
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(false);
      setValidationError(null);
    }
  }, [isOpen, initialValue]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      if (e.key >= '0' && e.key <= '9') {
        inputNumber(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        performOperation(e.key);
      } else if (e.key === 'Enter') {
        handleOK();
      } else if (e.key === 'Escape') {
        handleCancel();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (e.ctrlKey || e.metaKey) {
          clearAll();
        } else {
          backspace();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, rawInput, previousValue, operation, waitingForOperand]);

  // Validate amount input
  const validateAmount = (input: string): ValidationResult => {
    if (!input || input.trim() === '') {
      return { isValid: false, errorMessage: 'Amount is required' };
    }

    const trimmed = input.trim();
    
    // Check for valid characters only (digits and single decimal point)
    const validCharacterPattern = /^[0-9]*\.?[0-9]*$/;
    if (!validCharacterPattern.test(trimmed)) {
      return { isValid: false, errorMessage: 'Invalid characters' };
    }

    // Check for multiple decimal points
    if ((trimmed.match(/\./g) || []).length > 1) {
      return { isValid: false, errorMessage: 'Only one decimal point allowed' };
    }

    // Check for leading zeros (except for values like 0.50)
    if (trimmed.length > 1 && trimmed.startsWith('0') && !trimmed.startsWith('0.')) {
      return { isValid: false, errorMessage: 'No leading zeros allowed' };
    }

    // Check maximum digits (including decimal places)
    const digitsOnly = trimmed.replace('.', '');
    if (digitsOnly.length > MAX_DIGITS) {
      return { isValid: false, errorMessage: `Maximum ${MAX_DIGITS} digits allowed` };
    }

    // Check decimal places
    const decimalPart = trimmed.split('.')[1];
    if (decimalPart && decimalPart.length > 2) {
      return { isValid: false, errorMessage: 'Maximum 2 decimal places allowed' };
    }

    // Convert to number for range validation
    const numericValue = parseFloat(trimmed);
    
    if (isNaN(numericValue)) {
      return { isValid: false, errorMessage: 'Invalid number format' };
    }

    if (numericValue < MIN_VALUE) {
      return { isValid: false, errorMessage: `Minimum amount is ${MIN_VALUE.toFixed(2)}` };
    }

    if (numericValue > MAX_VALUE) {
      return { isValid: false, errorMessage: `Maximum amount is ${MAX_VALUE.toFixed(2)}` };
    }

    return { isValid: true };
  };

  // Format amount to always show 2 decimal places
  const formatAmount = (input: string): string => {
    if (!input || input.trim() === '') return '0.00';
    
    const trimmed = input.trim();
    const numericValue = parseFloat(trimmed);
    
    if (isNaN(numericValue)) return '0.00';
    
    return numericValue.toFixed(2);
  };

  // Get current numeric value
  const getCurrentValue = (): number => {
    return parseFloat(rawInput || '0');
  };

  // Check if current state is valid for submission
  const isValidForSubmission = (): boolean => {
    if (!rawInput || rawInput.trim() === '') return false;
    const validation = validateAmount(rawInput);
    return validation.isValid;
  };

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setRawInput(num);
      setWaitingForOperand(false);
    } else {
      const newInput = rawInput === '' ? num : rawInput + num;
      
      // Check if adding this digit would exceed limits
      const digitsOnly = newInput.replace('.', '');
      if (digitsOnly.length > MAX_DIGITS) {
        setValidationError(`Maximum ${MAX_DIGITS} digits allowed`);
        return;
      }
      
      setRawInput(newInput);
    }
    
    updateDisplay();
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setRawInput('0.');
      setWaitingForOperand(false);
    } else if (rawInput.indexOf('.') === -1) {
      const newInput = rawInput === '' ? '0.' : rawInput + '.';
      setRawInput(newInput);
    }
    
    updateDisplay();
  };

  const backspace = () => {
    if (waitingForOperand) return;
    
    const newInput = rawInput.slice(0, -1);
    setRawInput(newInput);
    updateDisplay();
  };

  const clearAll = () => {
    setRawInput('');
    setDisplay('0.00');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setValidationError(null);
  };

  const updateDisplay = () => {
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      const validation = validateAmount(rawInput);
      
      if (validation.isValid) {
        setDisplay(formatAmount(rawInput));
        setValidationError(null);
      } else {
        // Show raw input for immediate feedback, but keep validation error
        setDisplay(rawInput || '0.00');
        setValidationError(validation.errorMessage || null);
      }
    }, 0);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = getCurrentValue();
    const validation = validateAmount(rawInput);
    
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || 'Invalid input');
      return;
    }

    if (previousValue === null) {
      setPreviousValue(rawInput);
    } else if (operation) {
      const currentValue = parseFloat(previousValue || '0');
      const result = calculateResult(currentValue, inputValue, operation);
      
      if (result !== null) {
        const resultString = result.toString();
        setPreviousValue(resultString);
        setRawInput(resultString);
        setDisplay(formatAmount(resultString));
      }
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
    setValidationError(null);
  };

  const calculate = () => {
    const prev = parseFloat(previousValue || '0');
    const current = getCurrentValue();
    const validation = validateAmount(rawInput);
    
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || 'Invalid input');
      return;
    }

    if (previousValue === null || !operation) {
      return;
    }

    const result = calculateResult(prev, current, operation);
    
    if (result !== null) {
      const resultString = result.toString();
      setRawInput(resultString);
      setDisplay(formatAmount(resultString));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(false);
      setValidationError(null);
    }
  };

  const calculateResult = (firstValue: number, secondValue: number, operation: string): number | null => {
    let result: number;

    switch (operation) {
      case '+':
        result = firstValue + secondValue;
        break;
      case '-':
        result = firstValue - secondValue;
        break;
      case '*':
        result = firstValue * secondValue;
        break;
      case '/':
        if (secondValue === 0) {
          setValidationError('Cannot divide by zero');
          return null;
        }
        result = firstValue / secondValue;
        break;
      default:
        return secondValue;
    }

    // Round to avoid floating point precision issues
    result = Math.round((result + Number.EPSILON) * 100) / 100;

    // Validate result
    if (!isFinite(result)) {
      setValidationError('Result is not a valid number');
      return null;
    }

    if (result < 0) {
      setValidationError('Result cannot be negative');
      return null;
    }

    if (result > MAX_VALUE) {
      setValidationError(`Result exceeds maximum value of ${MAX_VALUE.toFixed(2)}`);
      return null;
    }

    if (result > 0 && result < MIN_VALUE) {
      setValidationError(`Result is below minimum value of ${MIN_VALUE.toFixed(2)}`);
      return null;
    }

    return result;
  };

  const handleCancel = () => {
    clearAll();
    onClose();
  };

  const handleOK = () => {
    if (isValidForSubmission()) {
      const formattedValue = formatAmount(rawInput);
      onResult(formattedValue);
      onClose();
    }
  };

  // Handle clicks outside calculator
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (calculatorRef.current && !calculatorRef.current.contains(e.target as Node)) {
        handleCancel();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="calculator-overlay">
      <div ref={calculatorRef} className="calculator-popup">
        {/* Header */}
        <div className="calculator-header">
          <h3 className="calculator-title">Amount Calculator</h3>
          <button
            onClick={handleCancel}
            className="calculator-close"
            aria-label="Close calculator"
          >
            <X size={18} />
          </button>
        </div>

        {/* Display */}
        <div className="calculator-display">
          <div className="calculator-display-text">
            {display}
          </div>
          {operation && previousValue && (
            <div className="calculator-operation">
              {formatAmount(previousValue)} {operation}
            </div>
          )}
          {validationError && (
            <div className="calculator-error">
              {validationError}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="calculator-buttons">
          {/* Row 1 */}
          <button
            onClick={clearAll}
            className="calculator-btn calculator-btn-clear"
            title="Clear All"
          >
            C
          </button>
          <button
            onClick={() => performOperation('/')}
            className="calculator-btn calculator-btn-operator"
            title="Divide"
          >
            ÷
          </button>
          <button
            onClick={() => performOperation('*')}
            className="calculator-btn calculator-btn-operator"
            title="Multiply"
          >
            ×
          </button>
          <button
            onClick={() => performOperation('-')}
            className="calculator-btn calculator-btn-operator"
            title="Subtract"
          >
            −
          </button>

          {/* Row 2 */}
          <button
            onClick={() => inputNumber('7')}
            className="calculator-btn calculator-btn-number"
          >
            7
          </button>
          <button
            onClick={() => inputNumber('8')}
            className="calculator-btn calculator-btn-number"
          >
            8
          </button>
          <button
            onClick={() => inputNumber('9')}
            className="calculator-btn calculator-btn-number"
          >
            9
          </button>
          <button
            onClick={() => performOperation('+')}
            className="calculator-btn calculator-btn-operator"
            title="Add"
          >
            +
          </button>

          {/* Row 3 */}
          <button
            onClick={() => inputNumber('4')}
            className="calculator-btn calculator-btn-number"
          >
            4
          </button>
          <button
            onClick={() => inputNumber('5')}
            className="calculator-btn calculator-btn-number"
          >
            5
          </button>
          <button
            onClick={() => inputNumber('6')}
            className="calculator-btn calculator-btn-number"
          >
            6
          </button>
          <button
            onClick={calculate}
            className="calculator-btn calculator-btn-equals"
            title="Calculate"
          >
            =
          </button>

          {/* Row 4 */}
          <button
            onClick={() => inputNumber('1')}
            className="calculator-btn calculator-btn-number"
          >
            1
          </button>
          <button
            onClick={() => inputNumber('2')}
            className="calculator-btn calculator-btn-number"
          >
            2
          </button>
          <button
            onClick={() => inputNumber('3')}
            className="calculator-btn calculator-btn-number"
          >
            3
          </button>

          {/* Row 5 */}
          <button
            onClick={() => inputNumber('0')}
            className="calculator-btn calculator-btn-number calculator-btn-zero"
          >
            0
          </button>
          <button
            onClick={inputDecimal}
            className="calculator-btn calculator-btn-number"
            title="Decimal point"
          >
            .
          </button>
        </div>

        {/* Action Buttons */}
        <div className="calculator-actions">
          <button
            onClick={handleCancel}
            className="btn btn-outline calculator-action-btn"
          >
            Cancel
          </button>
          <button
            onClick={handleOK}
            className="btn btn-primary calculator-action-btn"
            disabled={!isValidForSubmission()}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;