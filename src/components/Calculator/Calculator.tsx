import React, { useState, useEffect, useRef } from 'react';
import { X, Delete } from 'lucide-react';
import Decimal from 'decimal.js';

// Configure Decimal.js for financial calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21,
  minE: -9e15,
  maxE: 9e15
});

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
      if (initialValue && initialValue !== '0' && initialValue !== '0,00' && initialValue !== '' && initialValue !== '0.00') {
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
          setShouldReplaceDisplay(true); // CRITICAL: Next number input should replace this value
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
  const formatNumberForDisplay = (value: string | Decimal): string => {
    try {
      const decimal = value instanceof Decimal ? value : new Decimal(value);
      // Format with exactly 2 decimal places and replace dot with comma
      return decimal.toFixed(2).replace('.', ',');
    } catch (error) {
      return '0,00';
    }
  };

  // Parse display string to number (handle comma as decimal separator)
  const parseDisplayNumber = (displayStr: string): Decimal => {
    try {
      return new Decimal(displayStr.replace(',', '.'));
    } catch (error) {
      return new Decimal('0');
    }
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
      } else if (e.key === 'Delete') {
        clearAll();
      } else if (e.key === 'Backspace') {
        deleteLastChar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, inputState, currentNumber, hasDecimal, shouldReplaceDisplay]);

  const inputNumber = (num: string) => {
    setError(''); // Clear any errors
    
    if (inputState === 'initial' || shouldReplaceDisplay || inputState === 'result') {
      // First number input, replacing existing value, or starting fresh after result
      setCurrentNumber(num);
      setDisplay(num);
      setInputState('number');
      setHasDecimal(false);
      setShouldReplaceDisplay(false);
    } else if (inputState === 'number') {
      // Continue building current number
      const newDisplay = display + num;
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
          const displayStr = formatNumberForDisplay(result);
          setPreviousNumber(result.toString());
          setCurrentNumber('');
          setOperation(newOp);
          setInputState('operator');
          setHasDecimal(false);
          setDisplay(displayStr);
          setLastResult(result.toNumber());
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
      // Allow changing operators - this is the key fix for the user's request
      setOperation(newOp);
      // Keep the same display and state, just update the operation
      // This allows users to correct operator mistakes like 9 + → 9 -
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
        setLastResult(result.toNumber());
        setShouldReplaceDisplay(true); // Next number input should replace result
      }
    }
  };

  const calculateResult = (): Decimal | null => {
    try {
      const prev = new Decimal(previousNumber);
      const current = new Decimal(currentNumber);
    
      let result: Decimal;

      switch (operation) {
        case '+':
          result = prev.plus(current);
          break;
        case '-':
          result = prev.minus(current);
          break;
        case '×':
          result = prev.times(current);
          break;
        case '÷':
          if (current.equals(0)) {
            setError('Cannot divide by zero');
            return null;
          }
          result = prev.dividedBy(current);
          break;
        default:
          setError('Invalid operation');
          return null;
      }
      // Round to 2 decimal places for display
      result = result.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

      return result;
    } catch (error) {
      setError('Calculation error');
      return null;
    }
  };

  const clearAll = () => {
    resetCalculator();
  };

  const deleteLastChar = () => {
    setError(''); // Clear any errors
    
    if (inputState === 'initial' || display === '0,00') {
      return; // Nothing to delete
    }
    
    if (inputState === 'result') {
      // If we're showing a result, start fresh
      resetCalculator();
      return;
    }
    
    if (inputState === 'operator') {
      // If we just entered an operator, go back to the previous number
      if (previousNumber !== '') {
        const prevNum = new Decimal(previousNumber);
        const displayStr = formatNumberForDisplay(prevNum);
        setDisplay(displayStr);
        setCurrentNumber(previousNumber);
        setPreviousNumber('');
        setOperation(null);
        setInputState('number');
        setHasDecimal(displayStr.includes(','));
        setShouldReplaceDisplay(false);
      }
      return;
    }
    
    if (inputState === 'number' && currentNumber !== '') {
      if (currentNumber.length === 1) {
        // If only one character left, reset to initial state
        setDisplay('0,00');
        setCurrentNumber('');
        setInputState('initial');
        setHasDecimal(false);
        setShouldReplaceDisplay(true);
      } else {
        // Remove last character
        const newCurrentNumber = currentNumber.slice(0, -1);
        let newDisplay = display.slice(0, -1);
        
        // Handle decimal point removal
        if (display.endsWith(',')) {
          setHasDecimal(false);
        }
        
        // If we removed all digits before decimal, add a zero
        if (newDisplay === '' || newDisplay === ',') {
          newDisplay = '0,00';
          setCurrentNumber('0');
          setHasDecimal(false);
        } else {
          setCurrentNumber(newCurrentNumber);
        }
        
        setDisplay(newDisplay);
        setShouldReplaceDisplay(false);
      }
    }
  };

  const handleCancel = () => {
    resetCalculator();
    onClose();
  };

  const isOKButtonEnabled = (): boolean => {
    if (error) return false;
    
    let valueToValidate: string;
    let numericValue: number;
    
    // Handle ongoing calculation
    if (inputState === 'number' && currentNumber !== '' && operation && previousNumber !== '') {
      const result = calculateResult();
      if (result !== null && result.gte('0.01')) {
        valueToValidate = formatNumberForDisplay(result);
        numericValue = result.toNumber();
      } else {
        return false;
      }
    } else if (inputState === 'result' && lastResult !== null) {
      valueToValidate = formatNumberForDisplay(lastResult);
      numericValue = lastResult;
    } else if (inputState === 'number' && currentNumber !== '') {
      try {
        const decimal = new Decimal(currentNumber);
        if (decimal.gte('0.01')) {
          valueToValidate = formatNumberForDisplay(decimal);
          numericValue = decimal.toNumber();
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    } else {
      return false; // No valid number to return
    }
    
    // Check minimum value requirement only
    return numericValue >= 0.01;
  };

  const handleOK = () => {
    if (!isOKButtonEnabled()) {
      return;
    }
    
    let valueToReturn: string;
    
    // Handle ongoing calculation: if there's an operation in progress, calculate first
    if (inputState === 'number' && currentNumber !== '' && operation && previousNumber !== '') {
      const result = calculateResult();
      if (result !== null && result.gte('0.01')) {
        valueToReturn = formatNumberForDisplay(result);
        onResult(valueToReturn);
        onClose();
        return;
      } else if (result !== null && result.lt('0.01')) {
        // Result is too small, don't save
        setError('Result must be at least 0,01');
        return;
      } else {
        // Calculation failed, don't save
        return;
      }
    } else if (inputState === 'result' && lastResult !== null) {
      // Return the actual numeric result, formatted properly
      valueToReturn = formatNumberForDisplay(lastResult);
    } else if (inputState === 'number' && currentNumber !== '') {
      // Return current number formatted
      try {
        const decimal = new Decimal(currentNumber);
        if (decimal.gte('0.01')) {
          valueToReturn = formatNumberForDisplay(decimal);
        } else {
          setError('Amount must be at least 0,01');
          return;
        }
      } catch (error) {
        setError('Invalid amount');
        return;
      }
    } else {
      // No valid value to return
      return;
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

  const isDeleteAllowed = () => {
    return (display !== '0,00' || currentNumber !== '');
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
        {/* Display */}
        <div className="calculator-display">
          <div className="calculator-display-text">
            {display}
          </div>
          {operation && previousNumber && inputState === 'operator' && (
            <div className="calculator-operation">
              {formatNumberForDisplay(previousNumber)} {operation}
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
            onClick={deleteLastChar}
            className="calculator-btn calculator-btn-delete"
            disabled={!isDeleteAllowed()}
            title="Delete last character"
          >
            <Delete size={18} />
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
            onClick={() => performOperation('-')}
            className="calculator-btn calculator-btn-operator"
            disabled={!isOperatorAllowed()}
            title="Subtract"
          >
            −
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
            onClick={() => performOperation('+')}
            className="calculator-btn calculator-btn-operator"
            disabled={!isOperatorAllowed()}
            title="Add"
          >
            +
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
          <button
            onClick={calculate}
            className="calculator-btn calculator-btn-equals"
            disabled={!isEqualsAllowed()}
            title="Calculate"
          >
            =
          </button>

          {/* Row 5 */}
          <button
            onClick={() => inputNumber('0')}
            className="calculator-btn calculator-btn-number"
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