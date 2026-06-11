import React from 'react';
import Modal from './Modal';
import { FiAlertTriangle } from 'react-icons/fi';

export default function ConfirmModal({ show, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', isProcessing = false }) {
    return (
        <Modal show={show} onClose={onCancel} maxWidth="sm">
            <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-full flex-shrink-0">
                        <FiAlertTriangle size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {title}
                    </h3>
                </div>
                <p className="text-gray-500 font-medium mb-6">
                    {message}
                </p>
                <div className="flex space-x-3 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="px-5 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#ef172f] hover:bg-[#ef172f]/90 transition-colors flex items-center disabled:opacity-50"
                    >
                        {isProcessing ? 'Procesando...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
