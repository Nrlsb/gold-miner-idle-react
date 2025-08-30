// src/components/ConfirmationModal.js
import React from 'react';

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 sm:p-8 text-center space-y-6 border border-gray-600 shadow-lg max-w-sm w-full">
                <p className="text-lg text-gray-200">{message}</p>
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={onCancel} 
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
