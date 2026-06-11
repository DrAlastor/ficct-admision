import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { FiSave, FiCreditCard, FiDollarSign, FiCheck, FiX, FiBriefcase } from 'react-icons/fi';
import { FaPaypal, FaStripe, FaUniversity } from 'react-icons/fa';
import axios from 'axios';

export default function ConfiguracionPagos({ conceptos, metodos }) {
    const { data: conceptoData, setData: setConceptoData, post: postConcepto, processing: procConcepto, errors: errConcepto } = useForm({
        id: conceptos.length > 0 ? conceptos[0].id : null,
        nombre: conceptos.length > 0 ? conceptos[0].nombre : 'Matrícula CUP',
        monto: conceptos.length > 0 ? conceptos[0].monto : '',
        descripcion: conceptos.length > 0 ? conceptos[0].descripcion : 'Cobro por inscripción al Curso Preuniversitario'
    });

    const guardarConcepto = (e) => {
        e.preventDefault();
        postConcepto(route('pagos.admin.concepto.store'));
    };

    // Asegurar que existan los 3 métodos en el render
    const getMetodo = (nombre) => {
        return metodos.find(m => m.nombre.toLowerCase() === nombre.toLowerCase()) || { id: null, nombre, public_key: '', secret_key: '', activo: false };
    };

    const stripe = getMetodo('Stripe (Tarjetas)');
    const paypal = getMetodo('PayPal');
    const transferencia = getMetodo('Transferencia Bancaria');

    const [processingMetodo, setProcessingMetodo] = useState(null);

    // Estado local para manejar los inputs antes de guardarlos
    const [localKeys, setLocalKeys] = useState({
        stripe_pub: stripe.public_key || '',
        stripe_sec: stripe.secret_key || '',
        paypal_pub: paypal.public_key || '',
        paypal_sec: paypal.secret_key || ''
    });
    const toggleMetodo = (metodo, currentState) => {
        setProcessingMetodo(metodo.id);
        router.post(route('pagos.admin.metodo.store'), {
            id: metodo.id,
            nombre: metodo.nombre,
            public_key: metodo.public_key,
            secret_key: metodo.secret_key,
            activo: !currentState
        }, {
            preserveScroll: true,
            onFinish: () => setProcessingMetodo(null)
        });
    };

    const guardarTodasLasKeys = async () => {
        setProcessingMetodo('all');
        try {
            // Guardamos todos los métodos uno por uno
            const metodosData = metodos.map(m => {
                const isStripe = m.nombre.toLowerCase().includes('stripe');
                const isPaypal = m.nombre.toLowerCase().includes('paypal');
                let pub = m.public_key;
                let sec = m.secret_key;
                
                if (isStripe) { pub = localKeys.stripe_pub; sec = localKeys.stripe_sec; }
                if (isPaypal) { pub = localKeys.paypal_pub; sec = localKeys.paypal_sec; }

                return {
                    id: m.id,
                    nombre: m.nombre,
                    public_key: pub,
                    secret_key: sec,
                    activo: m.activo
                };
            });

            for (const mData of metodosData) {
                await axios.post(route('pagos.admin.metodo.store'), mData);
            }
            
            // Recargar la data a través de Inertia
            router.reload({ only: ['metodos'] });
            alert("¡Todas las credenciales han sido guardadas correctamente!");
        } catch (error) {
            console.error("Error guardando keys:", error);
            alert("Hubo un error al guardar las credenciales.");
        } finally {
            setProcessingMetodo(null);
        }
    };

    const handleKeyChange = (metodo, field, value) => {
        const prefix = metodo.nombre.toLowerCase().includes('stripe') ? 'stripe' : 'paypal';
        const key = field === 'public_key' ? `${prefix}_pub` : `${prefix}_sec`;
        setLocalKeys(prev => ({ ...prev, [key]: value }));
    };


    const renderMetodoCard = (metodo, icon, bgClass, textClass) => {
        return (
            <div className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${metodo.activo ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <span className={`${bgClass} ${textClass} p-2.5 rounded-xl mr-3`}>
                            {icon}
                        </span>
                        <h4 className="font-black text-gray-800">{metodo.nombre}</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={metodo.activo}
                            onChange={() => toggleMetodo(metodo, metodo.activo)}
                            disabled={processingMetodo === metodo.id}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                </div>
                
                {metodo.nombre !== 'Transferencia Bancaria' && (
                    <div className="space-y-3 mt-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Public Key / Client ID</label>
                            <input
                                type="text"
                                value={metodo.nombre.toLowerCase().includes('stripe') ? localKeys.stripe_pub : localKeys.paypal_pub}
                                onChange={(e) => handleKeyChange(metodo, 'public_key', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-1 focus:ring-blue-500 font-mono"
                                placeholder={`Clave pública de ${metodo.nombre}`}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Secret Key / Webhook Secret</label>
                            <input
                                type="password"
                                value={metodo.nombre.toLowerCase().includes('stripe') ? localKeys.stripe_sec : localKeys.paypal_sec}
                                onChange={(e) => handleKeyChange(metodo, 'secret_key', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-1 focus:ring-blue-500 font-mono"
                                placeholder={`Clave privada de ${metodo.nombre}`}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Concepto de Pago (Columna 4) */}
            <div className="xl:col-span-5">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 relative overflow-hidden group h-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none"></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                            <span className="bg-blue-100 text-blue-600 p-2 rounded-xl mr-3">
                                <FiDollarSign size={20} />
                            </span>
                            Definir Concepto de Cobro
                        </h3>

                        <form onSubmit={guardarConcepto} className="space-y-5">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Nombre del Concepto</label>
                                <input
                                    type="text"
                                    value={conceptoData.nombre}
                                    onChange={e => setConceptoData('nombre', e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                                    placeholder="Ej: Matrícula CUP"
                                />
                                {errConcepto.nombre && <p className="text-red-500 text-xs mt-1 font-bold">{errConcepto.nombre}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Monto (Bs.)</label>
                                <div className="relative shadow-sm rounded-xl">
                                    <span className="absolute left-4 top-3.5 text-gray-400 font-bold">Bs.</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={conceptoData.monto}
                                        onChange={e => setConceptoData('monto', e.target.value)}
                                        className="w-full bg-white border border-gray-300 rounded-xl pl-12 py-3 font-black text-gray-800 text-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="300.00"
                                    />
                                </div>
                                {errConcepto.monto && <p className="text-red-500 text-xs mt-1 font-bold">{errConcepto.monto}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Descripción</label>
                                <textarea
                                    value={conceptoData.descripcion}
                                    onChange={e => setConceptoData('descripcion', e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                                    rows="3"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={procConcepto}
                                className="w-full flex items-center justify-center py-3.5 bg-[#07074E] text-white rounded-xl font-black shadow-md hover:bg-[#0A0F5C] hover:shadow-lg transition-all disabled:opacity-50 mt-4"
                            >
                                <FiSave className="mr-2" size={18} /> Guardar Concepto
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Métodos de Pago (Columna 8) */}
            <div className="xl:col-span-7">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="mb-6 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-black text-gray-800 flex items-center">
                                    <span className="bg-indigo-100 text-indigo-600 p-2 rounded-xl mr-3">
                                        <FiBriefcase size={20} />
                                    </span>
                                    Métodos de Pago Permitidos
                                </h3>
                                <p className="text-sm text-gray-500 mt-2 font-medium">
                                    Activa y configura las pasarelas de pago disponibles para los postulantes. El pago en Efectivo o QR externo no está permitido por sistema.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={guardarTodasLasKeys}
                                disabled={processingMetodo === 'all'}
                                className="flex-shrink-0 flex items-center justify-center px-4 py-2 bg-[#07074E] text-white rounded-lg font-bold shadow-md hover:bg-[#0A0F5C] hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                <FiSave className="mr-2" /> {processingMetodo === 'all' ? 'Guardando...' : 'Guardar Credenciales'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderMetodoCard(stripe, <FaStripe size={24} />, 'bg-[#635BFF]/10', 'text-[#635BFF]')}
                            {renderMetodoCard(paypal, <FaPaypal size={20} />, 'bg-[#003087]/10', 'text-[#003087]')}
                            <div className="md:col-span-2">
                                {renderMetodoCard(transferencia, <FaUniversity size={20} />, 'bg-emerald-100', 'text-emerald-600')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
