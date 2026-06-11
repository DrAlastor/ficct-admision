import React from 'react';
import { FiFileText, FiClock, FiCheckCircle } from 'react-icons/fi';

export default function UltimosRecibos({ historial }) {
    if (!historial || historial.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <FiFileText className="text-gray-400" size={32} />
                </div>
                <h4 className="text-xl font-black text-gray-800 mb-2">No hay pagos recientes</h4>
                <p className="text-gray-500 font-medium max-w-md mx-auto">
                    Aún no se han generado recibos de pago. El historial de las últimas 10 transacciones aparecerá aquí.
                </p>
            </div>
        );
    }

    // Formatear Fecha
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-lg font-black text-[#0F172A] flex items-center">
                    <FiClock className="mr-2 text-indigo-500" /> 
                    Últimos Pagos Recibidos
                </h3>
                <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                    Top {historial.length}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500">
                            <th className="py-3 px-6 font-black">Nro. Recibo</th>
                            <th className="py-3 px-6 font-black">Postulante</th>
                            <th className="py-3 px-6 font-black">Monto</th>
                            <th className="py-3 px-6 font-black">Método</th>
                            <th className="py-3 px-6 font-black text-right">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {historial.map((pago, index) => (
                            <tr key={index} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors">
                                <td className="py-4 px-6 font-mono font-bold text-gray-700 text-xs">
                                    {pago.nro_recibo}
                                    <div className="text-[10px] text-gray-400 font-sans tracking-wide mt-1">
                                        ID: {pago.transaccion_id || 'N/A'}
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="font-bold text-gray-900">{pago.nombres} {pago.apellido_paterno}</div>
                                    <div className="text-xs text-gray-500 font-medium">{formatearFecha(pago.fecha)}</div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="font-black text-[#07074E] text-lg">
                                        <span className="text-xs text-gray-400 font-bold mr-1">Bs.</span>
                                        {Number(pago.monto).toFixed(2)}
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border border-gray-200 bg-white shadow-sm text-gray-600">
                                        {pago.metodo_pago}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${pago.estado.toLowerCase() === 'completado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {pago.estado.toLowerCase() === 'completado' && <FiCheckCircle className="mr-1.5" />}
                                        {pago.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500 font-medium">
                    El historial completo estará disponible en el módulo de consultas y reportes en futuras actualizaciones.
                </p>
            </div>
        </div>
    );
}
