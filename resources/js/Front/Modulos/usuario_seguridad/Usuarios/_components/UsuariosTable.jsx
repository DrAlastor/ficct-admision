import React from 'react';
import { FiEdit2, FiUserX, FiMail, FiShield } from 'react-icons/fi';
import { router } from '@inertiajs/react';

export default function UsuariosTable({ usuarios, openModal, handleDelete }) {
    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-gray-100">
                            <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Nombre</th>
                            <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">CI</th>
                            <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Cargo</th>
                            <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Acceso (Usuario)</th>
                            <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center whitespace-nowrap">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {usuarios.data.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-12 text-center text-gray-500">
                                    No se encontraron usuarios.
                                </td>
                            </tr>
                        ) : (
                            usuarios.data.map((usuario) => (
                                <tr key={usuario.id} className="hover:bg-gray-50/50 transition-colors group">
                                    
                                    {/* NOMBRE */}
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-xl bg-[#07074E] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                                                {getInitials(usuario.perfil?.nombres)}
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-bold text-gray-900 text-sm">
                                                    {usuario.perfil?.nombres} {usuario.perfil?.apellido_paterno}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* CI */}
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <span className="font-bold text-gray-600 text-sm">{usuario.perfil?.ci}</span>
                                    </td>

                                    {/* CARGO */}
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        {usuario.perfil?.cargo ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 uppercase tracking-wider">
                                                {usuario.perfil.cargo}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">N/A</span>
                                        )}
                                    </td>

                                    {/* ACCESO (USUARIO) */}
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <div className="flex flex-col space-y-1.5">
                                            <div className="flex items-center text-sm font-medium text-gray-600">
                                                <FiMail className="mr-2 text-gray-400" />
                                                {usuario.perfil?.email}
                                            </div>
                                            <div className="flex items-center">
                                                <FiShield className="mr-2 text-[#ef172f]" size={14} />
                                                <span className="bg-[#07074E] text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                    {usuario.rol?.nombre || 'SIN ROL'}
                                                </span>
                                                {usuario.estado === 'Activo' ? (
                                                    <span className="ml-2 bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                        Conectado
                                                    </span>
                                                ) : (
                                                    <span className="ml-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* ACCIONES */}
                                    <td className="py-4 px-6 whitespace-nowrap text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button 
                                                onClick={() => openModal(usuario)}
                                                className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors focus:outline-none"
                                                title="Editar"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(usuario)}
                                                className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors focus:outline-none"
                                                title="Eliminar"
                                            >
                                                <FiUserX size={16} />
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
            {usuarios.links && usuarios.links.length > 3 && (
                <div className="py-4 px-6 border-t border-gray-100 flex justify-center">
                    <div className="flex space-x-1">
                        {usuarios.links.map((link, i) => (
                            <button
                                key={i}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${
                                    link.active 
                                        ? 'bg-indigo-50 text-indigo-600' 
                                        : 'text-gray-500 hover:bg-gray-100'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
