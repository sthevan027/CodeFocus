import React from 'react';
import { createPortal } from 'react-dom';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const types = {
    danger: {
      icon: '⚠️',
      confirmClass: 'bg-red-600 hover:bg-red-700',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-500'
    },
    warning: {
      icon: '⚠️',
      confirmClass: 'bg-yellow-600 hover:bg-yellow-700',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-500'
    },
    info: {
      icon: 'ℹ️',
      confirmClass: 'bg-blue-600 hover:bg-blue-700',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-500'
    },
    success: {
      icon: '✅',
      confirmClass: 'bg-green-600 hover:bg-green-700',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-500'
    }
  };

  const style = types[type] || types.warning;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-gray-900 rounded-xl shadow-xl max-w-md w-full border border-white/10 transform transition-all">
          <div className="p-6">
            {/* Icon */}
            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${style.iconBg} mb-4`}>
              <span className="text-2xl">{style.icon}</span>
            </div>
            
            {/* Content */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">
                {title}
              </h3>
              <p className="text-gray-300">
                {message}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="bg-gray-800/50 px-6 py-4 flex gap-3 justify-end rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${style.confirmClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Hook para usar o dialog de confirmação
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = React.useState({
    isOpen: false,
    props: {}
  });

  const showConfirm = (props) => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        props: {
          ...props,
          onConfirm: () => {
            resolve(true);
            setDialogState({ isOpen: false, props: {} });
          },
          onClose: () => {
            resolve(false);
            setDialogState({ isOpen: false, props: {} });
          }
        }
      });
    });
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={dialogState.isOpen}
      {...dialogState.props}
    />
  );

  return { showConfirm, ConfirmDialogComponent };
};

export default ConfirmDialog;