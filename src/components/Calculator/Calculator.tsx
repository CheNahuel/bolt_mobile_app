import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (value: string) => void;
  initialValue?: string;
  position?: { top: number; left: number };
}

const Calculator: React.FC<CalculatorProps> = ({
  isOpen,
  onClose,
  onResult,
  initialValue = '',
  position
}) => {
  const [display, setDisplay] = useState(initialValue || '0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Reset calculator when opened with new initial value
  useEffect(() => {
    if (isOpen) {
      setDisplay(initialValue || '0');
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(false);
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
      } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Backspace') {
        clearEntry();
      } else if (e.key === 'Delete') {
        clearAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, display, previousValue, operation, waitingForOperand]);

  // Handle clicks outside calculator
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (calculatorRef.current && !calculatorRef.current.contains(e.target as Node)) {
        // If there's a valid result, use it; otherwise close without result
        if (display !== '0' && display !== 'Error' && !isNaN(parseFloat(display))) {
          onResult(display);
        }
        onClose();
      }
    };

    // Add a small delay to prevent immediate closing when opening
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, display, onClose, onResult]);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operation) {
      const currentValue = previousValue || '0';
      const newValue = calculate(parseFloat(currentValue), inputValue, operation);
      
      if (newValue !== null) {
        setDisplay(String(newValue));
        setPreviousValue(String(newValue));
      }
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue?: number, secondValue?: number, operation?: string) => {
    const prev = firstValue ?? parseFloat(previousValue || '0');
    const current = secondValue ?? parseFloat(display);
    const op = operation ?? (operation as string);

    if (previousValue === null || !op) {
      return current;
    }

    let result: number;

    switch (op) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        if (current === 0) {
          setDisplay('Error');
          setPreviousValue(null);
          setOperation(null);
          setWaitingForOperand(true);
          return null;
        }
        result = prev / current;
        break;
      default:
        return current;
    }

    // Round to avoid floating point precision issues
    result = Math.round((result + Number.EPSILON) * 100) / 100;

    // Check for overflow
    if (!isFinite(result) || result > 999999999.99) {
      setDisplay('Error');
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
      return null;
    }

    if (firstValue === undefined && secondValue === undefined) {
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }

    return result;
  };

  const handleEquals = () => {
    calculate();
  };

  const handleUseResult = () => {
    if (display !== 'Error' && !isNaN(parseFloat(display))) {
      onResult(display);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Determine if calculator should be positioned relative to input or centered
  const isPositioned = position !== undefined;
  
  const calculatorStyle: React.CSSProperties = isPositioned ? {
    position: 'fixed',
    top: position.top,
    left: position.left,
    zIndex: 1000,
    margin: 0,
  } : {};

  return (
    <div className="calculator-overlay">
      <div 
        ref={calculatorRef}
        className={`calculator-popup ${isPositioned ? 'positioned' : ''}`}
        style={calculatorStyle}
      >
        {/* Header */}
        <div className="calculator-header">
          <h3 className="calculator-title">Calculator</h3>
          <button
            onClick={onClose}
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
              {previousValue} {operation}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="calculator-buttons">
          {/* Row 1 */}
          <button
            onClick={clearAll}
            className="calculator-btn calculator-btn-clear"
            title="Clear All (Delete)"
          >
            C
          </button>
          <button
            onClick={clearEntry}
            className="calculator-btn calculator-btn-clear"
            title="Clear Entry (Backspace)"
          >
            CE
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
            onClick={() => performOperation('-')}
            className="calculator-btn calculator-btn-operator"
            title="Subtract"
          >
            −
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
            onClick={() => performOperation('+')}
            className="calculator-btn calculator-btn-operator"
            title="Add"
          >
            +
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
          <button
            onClick={handleEquals}
            className="calculator-btn calculator-btn-equals"
            rowSpan={2}
            title="Calculate (Enter)"
          >
            =
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
            onClick={onClose}
            className="btn btn-outline calculator-action-btn"
          >
            Cancel
          </button>
          <button
            onClick={handleUseResult}
            className="btn btn-primary calculator-action-btn"
            disabled={display === 'Error'}
          >
            Use Result
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;