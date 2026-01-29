import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Eliminar elemento?',
  description = 'Esta acción no se puede deshacer. ¿Estás seguro de que quieres continuar?'
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error executing delete action:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-background-secondary w-full max-w-sm rounded-xl shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-200 border border-border">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-status-danger/10 flex items-center justify-center text-status-danger">
                <AlertTriangle className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-lg text-text-primary">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-2 -mr-2 rounded-lg hover:bg-background-tertiary transition-colors"
            disabled={isDeleting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-5">
           <p className="text-text-secondary">{description}</p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-background-tertiary/30 border-t border-border flex gap-3 justify-end rounded-b-xl">
          <button 
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-status-danger text-white font-semibold rounded-xl hover:bg-status-danger/90 transition-colors shadow-lg shadow-status-danger/20 w-24 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
