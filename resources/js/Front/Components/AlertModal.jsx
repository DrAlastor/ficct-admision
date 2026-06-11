import React from 'react';
import Modal from './Modal';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function AlertModal({ show, message, type, onClose }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6 text-center">
                <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {type === 'success' ? <FiCheckCircle size={32} /> : <FiAlertCircle size={32} />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {type === 'success' ? '¡Éxito!' : 'Atención'}
                </h3>
                <p className="text-gray-500 font-medium mb-6">
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-white transition-colors ${type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                    Aceptar
                </button>
            </div>
        </Modal>
    );
}
