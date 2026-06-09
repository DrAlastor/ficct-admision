import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiPlus, FiSearch, FiEdit2, FiUserX, FiMail, FiShield } from 'react-icons/fi';
import UsuarioModal from './UsuarioModal';

export default function Index({ auth, usuarios, roles, filters, nextId }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            router.get(route('usuarios.index'), { search: searchQuery }, {
                preserveState: true,
                replace: true,
            });
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const openModal = (usuario = null) => {
        setSelectedUsuario(usuario);
        setIsModalOpen(true);
    };

    const handleDelete = (usuario) => {
        setDeleteConfirmUser(usuario);
    };

    const confirmDelete = () => {
        if (deleteConfirmUser) {
            router.delete(route('usuarios.destroy', deleteConfirmUser.id), {
                preserveScroll: true,
                onSuccess: () => setDeleteConfirmUser(null)
            });
        }
    };

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    return (
        <SidebarLayout title="GESTIÓN DE USUARIOS" subtitle="Usuarios">
            <Head title="Gestión de Usuarios" />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Usuarios</h2>
                    <p className="text-gray-500 font-medium">Administra la información de los usuarios del sistema.</p>
                </div>
                
                <button 
                    onClick={() => openModal()}
                    className="flex items-center justify-center bg-[#07074E] text-white px-6 py-3 rounded-full font-bold uppercase text-sm hover:bg-[#06063b] transition-all shadow-md hover:shadow-lg"
                >
                    <FiPlus className="mr-2" size={18} />
                    Crear Usuario
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-full border border-gray-100 shadow-sm p-2 mb-8 flex items-center">
                <div className="pl-4 text-gray-400">
                    <FiSearch size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nombre, CI, cargo o correo..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full bg-transparent border-none focus:ring-0 text-gray-700 py-2 px-4"
                />
            </div>

            {/* Table */}
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
                                                    {usuario.estado === 'Inactivo' && (
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
                                                    title="Deshabilitar"
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

            {/* Modal de Registro/Edición */}
            <UsuarioModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                usuario={selectedUsuario}
                roles={roles}
                nextId={nextId}
            />

            {/* Modal de Confirmación de Eliminación */}
            {deleteConfirmUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                                <FiUserX className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Deshabilitar Usuario</h3>
                            <p className="text-gray-500 mb-8">
                                ¿Estás seguro de que deseas deshabilitar a <span className="font-bold text-gray-900">{deleteConfirmUser.perfil?.nombres}</span>? 
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => setDeleteConfirmUser(null)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    Aceptar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}
