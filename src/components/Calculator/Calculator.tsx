import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (value: string) => void;
  initialValue?: string;
}

const Calculator: React.FC<CalculatorProps> = ({
  isOpen,
  onClose,
  onResult,
  initialValue = ''
}) => {
  const [display, setDisplay] = useState(initialValue || '0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

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
        handleCancel();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        clearAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, display, previousValue, operation, waitingForOperand]);

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

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operation) {
      const currentValue = previousValue || '0';
      const newValue = calculateResult(parseFloat(currentValue), inputValue, operation);
      
      if (newValue !== null) {
        const resultString = String(newValue);
        setDisplay(resultString);
        setPreviousValue(resultString);
      }
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    const prev = parseFloat(previousValue || '0');
    const current = parseFloat(display);

    if (previousValue === null || !operation) {
      return;
    }

    const result = calculateResult(prev, current, operation);
    
    if (result !== null) {
      const resultString = String(result);
      setDisplay(resultString);
      setPreviousValue(resultString);
      setOperation(null);
      setWaitingForOperand(true);
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
          setDisplay('Error');
          setPreviousValue(null);
          setOperation(null);
          setWaitingForOperand(true);
          return null;
        }
        result = firstValue / secondValue;
        break;
      default:
        return secondValue;
    }

    // Round to avoid floating point precision issues
    result = Math.round((result + Number.EPSILON) * 100000000) / 100000000;

    // Check for overflow
    if (!isFinite(result) || Math.abs(result) > 999999999.99) {
      setDisplay('Error');
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
      return null;
    }

    return result;
  };

  const handleCancel = () => {
    clearAll();
    onClose();
  };

  const handleOK = () => {
    if (display !== 'Error' && !isNaN(parseFloat(display))) {
      onResult(display);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="calculator-overlay">
      <div className="calculator-popup">
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
            rowSpan={2}
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
            disabled={display === 'Error'}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;