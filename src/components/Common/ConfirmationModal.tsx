import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-primary';
      default:
        return 'text-error';
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'btn-error';
      case 'warning':
        return 'btn-warning';
      case 'info':
        return 'btn-primary';
      default:
        return 'btn-error';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle size={24} className={getIconColor()} />
            <h2 className="heading-4">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-secondary mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="btn btn-outline flex-1"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`btn ${getConfirmButtonClass()} flex-1`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;