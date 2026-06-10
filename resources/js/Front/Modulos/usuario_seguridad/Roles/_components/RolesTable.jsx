import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { router } from '@inertiajs/react';

export default function RolesTable({ roles, openModal, handleDelete }) {
    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mt-8">
            <div className="overflow-x-auto custom-scrollbar p-2">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">ID</th>
                            <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Nombre del Rol</th>
                            <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Descripción</th>
                            <th className="py-6 px-8 text-xs font-black text-gray-400 uppercase tracking-widest text-center whitespace-nowrap w-32">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50/50">
                        {roles.data.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="py-16 text-center text-gray-500 font-medium">
                                    No se encontraron roles.
                                </td>
                            </tr>
                        ) : (
                            roles.data.map((rol) => (
                                <tr key={rol.id} className="hover:bg-gray-50/30 transition-colors group">
                                    
                                    {/* ID */}
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider">
                                            #{rol.id}
                                        </span>
                                    </td>

                                    {/* NOMBRE DEL ROL */}
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        <span className="font-black text-[#0F172A] text-lg tracking-tight">
                                            {rol.nombre}
                                        </span>
                                    </td>

                                    {/* DESCRIPCIÓN */}
                                    <td className="py-5 px-8">
                                        {rol.descripcion && rol.descripcion !== 'Sin descripción' ? (
                                            <span className="text-gray-500 font-medium text-sm">
                                                {rol.descripcion}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300 italic font-medium text-sm">
                                                Sin descripción
                                            </span>
                                        )}
                                    </td>

                                    {/* ACCIONES */}
                                    <td className="py-5 px-8 whitespace-nowrap">
                                        <div className="flex justify-center items-center space-x-3">
                                            <button 
                                                onClick={() => openModal(rol)}
                                                className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-200 hover:text-gray-900 transition-colors focus:outline-none"
                                                title="Editar Rol"
                                            >
                                                <FiEdit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(rol)}
                                                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 hover:text-red-700 transition-colors focus:outline-none"
                                                title="Eliminar Rol"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {roles.links && roles.links.length > 3 && (
                <div className="py-5 px-8 border-t border-gray-100 flex justify-center bg-gray-50/50">
                    <div className="flex space-x-2">
                        {roles.links.map((link, i) => (
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
