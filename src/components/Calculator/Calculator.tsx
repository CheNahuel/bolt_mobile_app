import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

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
  const [display, setDisplay] = useState('0.0');
  const [currentNumber, setCurrentNumber] = useState('');
  const [previousNumber, setPreviousNumber] = useState('');
  const [operation, setOperation] = useState<string | null>(null);
  const [inputState, setInputState] = useState<InputState>('initial');
  const [hasDecimal, setHasDecimal] = useState(false);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Reset calculator when opened
  useEffect(() => {
    if (isOpen) {
      if (initialValue && initialValue !== '0' && initialValue !== '0.00') {
        // Parse initial value and set as current number
        const parsed = parseFloat(initialValue.replace(',', '.'));
        if (!isNaN(parsed)) {
          const numberStr = parsed.toString();
          setCurrentNumber(numberStr);
          setDisplay(numberStr);
          setInputState('number');
          setHasDecimal(numberStr.includes('.'));
          setLastResult(parsed);
        } else {
          resetCalculator();
        }
      } else {
        resetCalculator();
      }
    }
  }, [isOpen, initialValue]);

  const resetCalculator = () => {
    setDisplay('0.0');
    setCurrentNumber('');
    setPreviousNumber('');
    setOperation(null);
    setInputState('initial');
    setHasDecimal(false);
    setLastResult(null);
    setError('');
  };

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      if (e.key >= '0' && e.key <= '9') {
        inputNumber(e.key);
      } else if (e.key === '.') {
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
  }, [isOpen, inputState, currentNumber, hasDecimal]);

  const inputNumber = (num: string) => {
    setError(''); // Clear any errors
    
    if (inputState === 'initial') {
      // First number input - clear initial display
      setCurrentNumber(num);
      setDisplay(num);
      setInputState('number');
      setHasDecimal(false);
    } else if (inputState === 'number') {
      // Continue building current number
      const newNumber = currentNumber + num;
      setCurrentNumber(newNumber);
      setDisplay(newNumber);
    } else if (inputState === 'operator') {
      // Start new number after operator
      setCurrentNumber(num);
      setDisplay(num);
      setInputState('number');
      setHasDecimal(false);
    } else if (inputState === 'result') {
      // Start fresh calculation after result - clear previous result
      setCurrentNumber(num);
      setDisplay(num);
      setInputState('number');
      setPreviousNumber('');
      setOperation(null);
      setHasDecimal(false);
      setLastResult(null);
    }
  };

  const inputDecimal = () => {
    setError(''); // Clear any errors
    
    if (inputState === 'initial') {
      // First input is decimal point
      setCurrentNumber('0.');
      setDisplay('0.');
      setInputState('number');
      setHasDecimal(true);
    } else if (inputState === 'number' && !hasDecimal) {
      // Add decimal to current number
      const newNumber = currentNumber === '' ? '0.' : currentNumber + '.';
      setCurrentNumber(newNumber);
      setDisplay(newNumber);
      setHasDecimal(true);
    } else if (inputState === 'operator') {
      // Start new decimal number after operator
      setCurrentNumber('0.');
      setDisplay('0.');
      setInputState('number');
      setHasDecimal(true);
    } else if (inputState === 'result') {
      // Start fresh decimal after result - clear previous result
      setCurrentNumber('0.');
      setDisplay('0.');
      setInputState('number');
      setPreviousNumber('');
      setOperation(null);
      setHasDecimal(true);
      setLastResult(null);
    }
  };

  const performOperation = (newOp: string) => {
    setError(''); // Clear any errors
    
    if (inputState === 'number' && currentNumber !== '') {
      if (operation && previousNumber !== '') {
        // Chain operations - calculate current result first
        const result = calculateResult();
        if (result !== null) {
          setPreviousNumber(result.toString());
          setCurrentNumber('');
          setOperation(newOp);
          setInputState('operator');
          setHasDecimal(false);
          setDisplay(result.toString());
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
      const resultValue = lastResult !== null ? lastResult.toString() : display.replace(',', '.');
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
        // Format final result with comma separator and appropriate decimal places
        const formattedResult = formatFinalResult(result);
        setDisplay(formattedResult);
        setCurrentNumber(result.toString());
        setPreviousNumber('');
        setOperation(null);
        setInputState('result');
        setHasDecimal(true);
        setLastResult(result);
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

    // Handle decimal precision properly
    // Round to 10 decimal places to avoid floating point issues, then remove trailing zeros
    result = Math.round((result + Number.EPSILON) * 10000000000) / 10000000000;

    if (!isFinite(result)) {
      setError('Result is too large');
      return null;
    }

    // Check for overflow
    if (Math.abs(result) > 999999999.99) {
      setError('Result exceeds maximum value');
      return null;
    }

    return result;
  };

  const formatFinalResult = (result: number): string => {
    // Determine appropriate decimal places
    let decimalPlaces = 2;
    
    // If result is a whole number, show no decimals
    if (result === Math.floor(result)) {
      decimalPlaces = 0;
    } else {
      // For decimals, show only necessary decimal places (up to 10)
      const resultStr = result.toString();
      const decimalIndex = resultStr.indexOf('.');
      if (decimalIndex !== -1) {
        const actualDecimals = resultStr.length - decimalIndex - 1;
        decimalPlaces = Math.min(actualDecimals, 10);
      }
    }
    
    // Format with appropriate decimal places
    const formatted = result.toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
    
    // Replace decimal point with comma for European formatting
    return formatted.replace('.', ',');
  };

  const clearAll = () => {
    resetCalculator();
  };

  const handleCancel = () => {
    resetCalculator();
    onClose();
  };

  const handleOK = () => {
    if (error) {
      // Don't return result if there's an error
      return;
    }
    
    let valueToReturn: string;
    
    if (inputState === 'result' && lastResult !== null) {
      // Return the actual numeric result, formatted properly
      valueToReturn = formatFinalResult(lastResult);
    } else if (inputState === 'number' && currentNumber !== '') {
      // Return current number formatted as final result
      const num = parseFloat(currentNumber);
      if (!isNaN(num)) {
        valueToReturn = formatFinalResult(num);
      } else {
        valueToReturn = formatFinalResult(0);
      }
    } else {
      // Return formatted zero
      valueToReturn = formatFinalResult(0);
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
    return !error && ((inputState === 'number' && currentNumber !== '') || inputState === 'result' || inputState === 'operator');
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
              {previousNumber} {operation}
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
            disabled={!!error}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;