import React, { useState } from 'react';
import axios from 'axios';
import { FiSearch, FiX, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

export default function ConsultarRegistro({ isOpen, onClose }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleConsultar = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/registro-cup/consultar', { email });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error al consultar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-[#063f7c]">
                    <div className="flex items-center text-white font-black">
                        <FiSearch className="mr-2" size={18} />
                        Consultar Registro
                    </div>
                    <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {!result ? (
                        <form onSubmit={handleConsultar}>
                            <p className="text-gray-600 mb-4 text-sm">
                                Ingresa el correo electrónico con el que realizaste tu preinscripción para verificar el estado actual.
                            </p>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    required 
                                    placeholder="tu@correo.com" 
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#063f7c] focus:border-[#063f7c]"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            
                            {error && (
                                <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg flex items-start">
                                    <FiAlertCircle className="mt-0.5 mr-2 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading || !email} className="w-full py-3 px-4 bg-[#063f7c] text-white rounded-xl font-bold hover:bg-[#052f5d] transition-colors disabled:opacity-70 flex justify-center items-center">
                                {loading ? 'Buscando...' : 'Consultar Estado'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            {result.status === 'No encontrado' && (
                                <>
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiAlertCircle className="text-red-500" size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-800 mb-2">Usted no ha sido registrado</h3>
                                    <p className="text-gray-500 mb-6">Por favor registre sus datos llenando el formulario de preinscripción.</p>
                                    <button onClick={() => { setResult(null); onClose(); }} className="text-[#063f7c] font-bold hover:underline">Entendido</button>
                                </>
                            )}

                            {result.status === 'Pendiente' && (
                                <>
                                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiClock className="text-amber-500" size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-800 mb-2">En Revisión</h3>
                                    <p className="text-gray-500 mb-6">Tu registro fue recibido y el pago fue procesado. Estamos validando tus documentos. Por favor regresa más tarde.</p>
                                    <button onClick={onClose} className="w-full py-3 px-4 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors">
                                        Entendido
                                    </button>
                                </>
                            )}

                            {result.status === 'Aceptado' && (
                                <>
                                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiCheckCircle className="text-green-500" size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-800 mb-2">¡Preinscripción Aceptada!</h3>
                                    <p className="text-gray-500 mb-6">Tus datos han sido validados. Ya puedes iniciar sesión en el sistema usando tus nuevas credenciales.</p>
                                    
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-left mb-6">
                                        <div className="mb-2">
                                            <span className="block text-xs font-bold text-blue-800 uppercase">Código de Usuario</span>
                                            <span className="block text-lg font-mono font-black text-[#063f7c]">{result.codigo}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-blue-800 uppercase">Contraseña</span>
                                            <span className="block text-lg font-mono font-black text-[#063f7c]">{result.password}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={onClose} className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                                            Cerrar
                                        </button>
                                        <button onClick={() => window.location.href = '/login'} className="flex-1 py-3 px-4 bg-[#063f7c] text-white rounded-xl font-bold hover:bg-[#052f5d] transition-colors">
                                            Ir a Iniciar Sesión
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
