import React from 'react';
import { router } from '@inertiajs/react';

export default function BitacoraTable({ bitacora }) {
    const formatDate = (dateString) => {
        const safeDate = dateString.includes('T') ? dateString.replace('Z', '') : dateString.replace(' ', 'T');
        const date = new Date(safeDate);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const safeDate = dateString.includes('T') ? dateString.replace('Z', '') : dateString.replace(' ', 'T');
        const date = new Date(safeDate);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar p-2">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="py-6 px-8 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">ID</th>
                            <th className="py-6 px-8 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Accion / Detalle</th>
                            <th className="py-6 px-8 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Fecha y Hora</th>
                            <th className="py-6 px-8 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">IP</th>
                            <th className="py-6 px-8 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Usuario (ID)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50/50">
                        {bitacora.data.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-16 text-center text-gray-500 font-medium">
                                    No se encontraron registros que coincidan con los filtros.
                                </td>
                            </tr>
                        ) : (
                            bitacora.data.map((registro) => (
                                <tr key={registro.id} className="hover:bg-gray-50/30 transition-colors">
                                    
                                    {/* ID */}
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        <span className="text-gray-500 font-black tracking-wider text-sm">
                                            #{registro.id}
                                        </span>
                                    </td>

                                    {/* ACCIÓN / DETALLE */}
                                    <td className="py-5 px-8">
                                        <div className="font-bold text-[#0F172A] text-sm">
                                            {registro.accion}
                                            {registro.detalle && (
                                                <span className="font-normal text-gray-600"> - {registro.detalle}</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* FECHA Y HORA */}
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        <div className="font-bold text-gray-700 text-sm">
                                            {formatDate(registro.fecha_hora)}
                                        </div>
                                        <div className="text-xs text-gray-400 font-medium mt-0.5">
                                            {formatTime(registro.fecha_hora)}
                                        </div>
                                    </td>

                                    {/* IP */}
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        <span className="text-gray-500 font-medium text-xs tracking-wider">
                                            {registro.ip || '::1'}
                                        </span>
                                    </td>

                                    {/* USUARIO */}
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        {registro.usuario ? (
                                            <>
                                                <div className="font-bold text-[#07074E] text-sm">
                                                    {registro.usuario.perfil?.nombres} {registro.usuario.perfil?.apellido_paterno}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-black tracking-widest mt-0.5">
                                                    ID: {registro.usuario.id}
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-gray-400 italic text-sm">Sistema / Desconocido</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {bitacora.links && bitacora.links.length > 3 && (
                <div className="py-5 px-8 border-t border-gray-100 flex justify-center bg-gray-50/50">
                    <div className="flex space-x-2">
                        {bitacora.links.map((link, i) => (
                            <button
                                key={i}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                                    link.active 
                                        ? 'bg-[#07074E] text-white shadow-md' 
                                        : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed border-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
