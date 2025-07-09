import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { validateAmountInput } from '../../utils/validation';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (value: string) => void;
  initialValue?: string;
}

type InputState = 'initial' | 'number' | 'operator' | 'result';

const Calculator: React.FC<CalculatorProps> = ({
  isOpen,
  onClose,
  onResult,
  initialValue = ''
}) => {
  const [display, setDisplay] = useState('0,00');
  const [currentNumber, setCurrentNumber] = useState('');
  const [previousNumber, setPreviousNumber] = useState('');
  const [operation, setOperation] = useState<string | null>(null);
  const [inputState, setInputState] = useState<InputState>('initial');
  const [hasDecimal, setHasDecimal] = useState(false);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [shouldReplaceDisplay, setShouldReplaceDisplay] = useState(true);
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Reset calculator when opened
  useEffect(() => {
    if (isOpen) {
      if (initialValue && initialValue !== '0' && initialValue !== '0,00' && initialValue !== '') {
        // Parse initial value (handle both comma and dot)
        const normalizedValue = initialValue.replace(',', '.');
        const parsed = parseFloat(normalizedValue);
        if (!isNaN(parsed) && parsed > 0) {
          const numberStr = formatNumberForDisplay(parsed);
          setCurrentNumber(parsed.toString());
          setDisplay(numberStr);
          setInputState('result');
          setHasDecimal(numberStr.includes(','));
          setLastResult(parsed);
          setShouldReplaceDisplay(true); // Next number input should replace this value
        } else {
          resetCalculator();
        }
      } else {
        resetCalculator();
      }
    }
  }, [isOpen, initialValue]);

  const resetCalculator = () => {
    setDisplay('0,00');
    setCurrentNumber('');
    setPreviousNumber('');
    setOperation(null);
    setInputState('initial');
    setHasDecimal(false);
    setLastResult(null);
    setError('');
    setShouldReplaceDisplay(true);
  };

  // Format number for display (use comma as decimal separator, exactly 2 decimals)
  const formatNumberForDisplay = (num: number): string => {
    // Limit to maximum value
    if (Math.abs(num) > 999999999.99) {
      return '999999999,99';
    }
    
    // Round to 2 decimal places
    const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
    
    // Format with exactly 2 decimal places and replace dot with comma
    return rounded.toFixed(2).replace('.', ',');
  };

  // Parse display string to number (handle comma as decimal separator)
  const parseDisplayNumber = (displayStr: string): number => {
    return parseFloat(displayStr.replace(',', '.'));
  };

  // Validate decimal places in current input
  const validateDecimalPlaces = (numberStr: string): boolean => {
    const commaIndex = numberStr.indexOf(',');
    if (commaIndex === -1) return true;
    return numberStr.length - commaIndex - 1 <= 2;
  };

  // Check if value exceeds maximum
  const exceedsMaxValue = (value: number): boolean => {
    return Math.abs(value) > 999999999.99;
  };

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      if (e.key >= '0' && e.key <= '9') {
        inputNumber(e.key);
      } else if (e.key === ',' || e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        performOperation('+');
      } else if (e.key === '-') {
        performOperation('-');
      } else if (e.key === '*') {
        performOperation('×');
      } else if (e.key === '/') {
        performOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
      } else if (e.key === 'Escape') {
        handleCancel();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        clearAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, inputState, currentNumber, hasDecimal, shouldReplaceDisplay]);

  const inputNumber = (num: string) => {
    setError(''); // Clear any errors
    
    if (inputState === 'initial' || shouldReplaceDisplay) {
      // First number input or replacing existing value
      setCurrentNumber(num);
      setDisplay(num);
      setInputState('number');
      setHasDecimal(false);
      setShouldReplaceDisplay(false);
    } else if (inputState === 'number') {
      // Continue building current number
      const newDisplay = display + num;
      
      // Check if adding this number would exceed decimal places
      if (!validateDecimalPlaces(newDisplay)) {
        return; // Don't add if it would exceed 2 decimal places
      }
      
      // Check if the resulting number would exceed maximum value
      const potentialValue = parseDisplayNumber(newDisplay);
      if (exceedsMaxValue(potentialValue)) {
        setError('Value exceeds maximum limit');
        return;
      }
      
      const newNumber = currentNumber + num;
      setCurrentNumber(newNumber);
      setDisplay(newDisplay);
    } else if (inputState === 'operator') {
      // Start new number after operator
      setCurrentNumber(num);
      setDisplay(num);
      setInputState('number');
      setHasDecimal(false);
      setShouldReplaceDisplay(false);
    } else if (inputState === 'result') {
      // Start fresh calculation after result - clear previous result
      setCurrentNumber(num);
      setDisplay(num);
      setInputState('number');
      setPreviousNumber('');
      setOperation(null);
      setHasDecimal(false);
      setLastResult(null);
      setShouldReplaceDisplay(false);
    }
  };

  const inputDecimal = () => {
    setError(''); // Clear any errors
    
    if (inputState === 'initial' || shouldReplaceDisplay) {
      // First input is decimal point or replacing existing value
      setCurrentNumber('0.');
      setDisplay('0,');
      setInputState('number');
      setHasDecimal(true);
      setShouldReplaceDisplay(false);
    } else if (inputState === 'number' && !hasDecimal) {
      // Add decimal to current number
      const newNumber = currentNumber === '' ? '0.' : currentNumber + '.';
      const newDisplay = display === '' ? '0,' : display + ',';
      setCurrentNumber(newNumber);
      setDisplay(newDisplay);
      setHasDecimal(true);
    } else if (inputState === 'operator') {
      // Start new decimal number after operator
      setCurrentNumber('0.');
      setDisplay('0,');
      setInputState('number');
      setHasDecimal(true);
      setShouldReplaceDisplay(false);
    } else if (inputState === 'result') {
      // Start fresh decimal after result - clear previous result
      setCurrentNumber('0.');
      setDisplay('0,');
      setInputState('number');
      setPreviousNumber('');
      setOperation(null);
      setHasDecimal(true);
      setLastResult(null);
      setShouldReplaceDisplay(false);
    }
  };

  const performOperation = (newOp: string) => {
    setError(''); // Clear any errors
    setShouldReplaceDisplay(false);
    
    if (inputState === 'number' && currentNumber !== '') {
      if (operation && previousNumber !== '') {
        // Chain operations - calculate current result first
        const result = calculateResult();
        if (result !== null) {
          const resultStr = result.toString();
          const displayStr = formatNumberForDisplay(result);
          setPreviousNumber(resultStr);
          setCurrentNumber('');
          setOperation(newOp);
          setInputState('operator');
          setHasDecimal(false);
          setDisplay(displayStr);
          setLastResult(result);
        }
      } else {
        // First operation
        setPreviousNumber(currentNumber);
        setCurrentNumber('');
        setOperation(newOp);
        setInputState('operator');
        setHasDecimal(false);
      }
    } else if (inputState === 'operator') {
      // Changing operators - keep displaying the new operator
      setOperation(newOp);
      // Display remains the same, just update the operation
    } else if (inputState === 'result') {
      // Use result as first operand for new calculation
      const resultValue = lastResult !== null ? lastResult.toString() : parseDisplayNumber(display).toString();
      setPreviousNumber(resultValue);
      setCurrentNumber('');
      setOperation(newOp);
      setInputState('operator');
      setHasDecimal(false);
    }
  };

  const calculate = () => {
    if (inputState === 'number' && currentNumber !== '' && operation && previousNumber !== '') {
      const result = calculateResult();
      if (result !== null) {
        // Format result with comma separator and exactly 2 decimal places
        const formattedResult = formatNumberForDisplay(result);
        setDisplay(formattedResult);
        setCurrentNumber(result.toString());
        setPreviousNumber('');
        setOperation(null);
        setInputState('result');
        setHasDecimal(formattedResult.includes(','));
        setLastResult(result);
        setShouldReplaceDisplay(true); // Next number input should replace result
      }
    }
  };

  const calculateResult = (): number | null => {
    const prev = parseFloat(previousNumber);
    const current = parseFloat(currentNumber);
    
    if (isNaN(prev) || isNaN(current)) {
      setError('Invalid number format');
      return null;
    }

    let result: number;

    switch (operation) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '×':
        result = prev * current;
        break;
      case '÷':
        if (current === 0) {
          setError('Cannot divide by zero');
          return null;
        }
        result = prev / current;
        break;
      default:
        setError('Invalid operation');
        return null;
    }

    // Handle decimal precision properly and limit to 2 decimal places
    result = Math.round((result + Number.EPSILON) * 100) / 100;

    if (!isFinite(result)) {
      setError('Result is too large');
      return null;
    }

    // Check for overflow (max 999999999.99)
    if (exceedsMaxValue(result)) {
      setError('Result exceeds maximum value');
      return null;
    }

    return result;
  };

  const clearAll = () => {
    resetCalculator();
  };

  const handleCancel = () => {
    resetCalculator();
    onClose();
  };

  const isOKButtonEnabled = (): boolean => {
    if (error) return false;
    
    let valueToValidate: string;
    
    if (inputState === 'result' && lastResult !== null) {
      valueToValidate = formatNumberForDisplay(lastResult);
    } else if (inputState === 'number' && currentNumber !== '') {
      const num = parseFloat(currentNumber);
      if (!isNaN(num)) {
        valueToValidate = formatNumberForDisplay(num);
      } else {
        return false;
      }
    } else {
      return false; // No valid number to return
    }
    
    // Validate using the validation utility (convert comma to dot for validation)
    const validationResult = validateAmountInput(valueToValidate.replace(',', '.'));
    return validationResult.isValid;
  };

  const handleOK = () => {
    if (!isOKButtonEnabled()) {
      return;
    }
    
    let valueToReturn: string;
    
    if (inputState === 'result' && lastResult !== null) {
      // Return the actual numeric result, formatted properly
      valueToReturn = formatNumberForDisplay(lastResult);
    } else if (inputState === 'number' && currentNumber !== '') {
      // Return current number formatted
      const num = parseFloat(currentNumber);
      if (!isNaN(num)) {
        valueToReturn = formatNumberForDisplay(num);
      } else {
        valueToReturn = '0,00';
      }
    } else {
      // Return formatted zero
      valueToReturn = '0,00';
    }
    
    onResult(valueToReturn);
    onClose();
  };

  // Button state logic
  const isNumberAllowed = () => {
    return !error && (inputState === 'initial' || inputState === 'number' || inputState === 'operator' || inputState === 'result');
  };

  const isDecimalAllowed = () => {
    return !error && ((inputState === 'initial' || inputState === 'operator' || inputState === 'result') || 
           (inputState === 'number' && !hasDecimal));
  };

  const isOperatorAllowed = () => {
    return !error && ((inputState === 'number' && currentNumber !== '') || inputState === 'result');
  };

  const isEqualsAllowed = () => {
    return !error && inputState === 'number' && currentNumber !== '' && operation && previousNumber !== '';
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
          <h3 className="calculator-title">Calculator</h3>
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
          {operation && previousNumber && inputState === 'operator' && (
            <div className="calculator-operation">
              {formatNumberForDisplay(parseFloat(previousNumber))} {operation}
            </div>
          )}
          {error && (
            <div className="calculator-error">
              {error}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="calculator-buttons">
          {/* Row 1 */}
          <button
            onClick={clearAll}
            className="calculator-btn calculator-btn-clear"
            title="Clear"
          >
            C
          </button>
          <button
            onClick={() => performOperation('÷')}
            className="calculator-btn calculator-btn-operator"
            disabled={!isOperatorAllowed()}
            title="Divide"
          >
            ÷
          </button>
          <button
            onClick={() => performOperation('×')}
            className="calculator-btn calculator-btn-operator"
            disabled={!isOperatorAllowed()}
            title="Multiply"
          >
            ×
          </button>
          <button
            onClick={() => performOperation('-')}
            className="calculator-btn calculator-btn-operator"
            disabled={!isOperatorAllowed()}
            title="Subtract"
          >
            −
          </button>

          {/* Row 2 */}
          <button
            onClick={() => inputNumber('7')}
            className="calculator-btn calculator-btn-number"
            disabled={!isNumberAllowed()}
          >
            7
          </button>
          <button
            onClick={() => inputNumber('8')}
            className="calculator-btn calculator-btn-number"
            disabled={!isNumberAllowed()}
          >
            8
          </button>
          <button
            onClick={() => inputNumber('9')}
            className="calculator-btn calculator-btn-number"
            disabled={!isNumberAllowed()}
          >
            9
          </button>
          <button
            onClick={() => performOperation('+')}
            className="calculator-btn calculator-btn-operator"
            disabled={!isOperatorAllowed()}
            title="Add"
          >
            +
          </button>

          {/* Row 3 */}
          <button
            onClick={() => inputNumber('4')}
            className="calculator-btn calculator-btn-number"
            disabled={!isNumberAllowed()}
          >
            4
          </button>
          <button
            onClick={() => inputNumber('5')}
            className="calculator-btn calculator-btn-number"
            disabled={!isNumberAllowed()}
          >
            5
          </button>
          <button
            onClick={() => inputNumber('6')}
            className="calculator-btn calculator-btn-number"
            disabled={!isNumberAllowed()}
          >
            6
          </button>
          <button
            onClick={calculate}
            className="calculator-btn calculator-btn-equals"
            disabled={!isEqualsAllowed()}
            title="Calculate"
          >
            =
          </button>

          {/* Row 4 */}
          <button
            onClick={() => inputNumber('1')}
            className="calculator-btn calculator-btn-number"
            disabled={!isNumberAllowed()}
          >
            1
          </button>
          <button
            onClick={() => inputNumber('2')}
            className="calculator-btn calculator-btn-number"
            disabled={!isNumberAllowed()}
          >
            2
          </button>
          <button
            onClick={() => inputNumber('3')}
            className="calculator-btn calculator-btn-number"
            disabled={!isNumberAllowed()}
          >
            3
          </button>

          {/* Row 5 */}
          <button
            onClick={() => inputNumber('0')}
            className="calculator-btn calculator-btn-number calculator-btn-zero"
            disabled={!isNumberAllowed()}
          >
            0
          </button>
          <button
            onClick={inputDecimal}
            className="calculator-btn calculator-btn-number"
            disabled={!isDecimalAllowed()}
            title="Decimal point"
          >
            ,
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
            disabled={!isOKButtonEnabled()}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;