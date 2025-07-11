import React from 'react';
import { DayPicker } from 'react-day-picker';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectDate,
  selectedDate,
}) => {
  if (!isOpen) return null;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onSelectDate(date);
      onClose();
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    onSelectDate(today);
    onClose();
  };

  const handleYesterdayClick = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    onSelectDate(yesterday);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-4">Select Date</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            aria-label="Close date picker"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Date Options */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleTodayClick}
            className="btn btn-outline"
          >
            Today
          </button>
          <button
            onClick={handleYesterdayClick}
            className="btn btn-outline"
          >
            Yesterday
          </button>
        </div>

        {/* Date Picker */}
        <div className="date-picker-container">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            showOutsideDays
            className="rdp-custom"
            modifiersClassNames={{
              selected: 'rdp-selected',
              today: 'rdp-today',
            }}
          />
        </div>

        <div className="flex space-x-3 mt-4">
          <button
            onClick={onClose}
            className="btn btn-outline flex-1"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSelectDate(selectedDate);
              onClose();
            }}
            className="btn btn-primary flex-1"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;