import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiUsers, FiEdit2, FiTrash2, FiPlus, FiAlertCircle } from 'react-icons/fi';
import DocenteModal from './_components/DocenteModal';
import AlertModal from '@/Components/AlertModal';

export default function Index({ auth }) {
    const { docentes, errors, success } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [docenteEditing, setDocenteEditing] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, docente: null });
    const [searchTerm, setSearchTerm] = useState('');

    const openCreateModal = () => {
        setDocenteEditing(null);
        setIsModalOpen(true);
    };

    const openEditModal = (docente) => {
        setDocenteEditing(docente);
        setIsModalOpen(true);
    };

    const handleDelete = () => {
        if (!deleteModal.docente) return;
        router.delete(route('docentes.destroy', deleteModal.docente.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteModal({ isOpen: false, docente: null })
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('docentes.index'), { search: searchTerm }, { preserveState: true, preserveScroll: true });
    };

    return (
        <SidebarLayout title="MÓDULO DE DOCENCIA" subtitle="Gestión de Docentes">
            <Head title="Gestionar Docentes" />
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                {errors.error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
                        <FiAlertCircle className="mr-3 text-red-500 flex-shrink-0" size={24} />
                        <span className="font-bold">{errors.error}</span>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center">
                        <FiAlertCircle className="mr-3 text-green-500 flex-shrink-0" size={24} />
                        <span className="font-bold">{success}</span>
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center">
                        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl mr-4 shadow-sm">
                            <FiUsers size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Plantel Docente</h1>
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                Administra los perfiles de los docentes registrados
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <form onSubmit={handleSearch} className="flex">
                            <input 
                                type="text"
                                placeholder="Buscar por CI, Nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-gray-300 rounded-l-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <button type="submit" className="bg-gray-100 border border-l-0 border-gray-300 text-gray-700 px-4 py-2 rounded-r-xl font-medium hover:bg-gray-200 transition">
                                Buscar
                            </button>
                        </form>
                        <button 
                            onClick={openCreateModal}
                            className="bg-[#07074E] text-white px-6 py-2 rounded-xl font-bold flex items-center hover:bg-[#0A0F5C] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <FiPlus className="mr-2" size={18} />
                            Nuevo Docente
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Docente</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Contacto</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Perfil Profesional</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {docentes.map((docente) => (
                                <tr key={docente.id} className="hover:bg-indigo-50/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-bold text-gray-800">{docente.nombres} {docente.apellido_paterno} {docente.apellido_materno}</div>
                                        <div className="text-xs text-gray-500 font-medium mt-0.5">CI: {docente.ci}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-700">{docente.email}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">Tel: {docente.telefono}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-indigo-700">{docente.profesion}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{docente.grado_academico} - {docente.experiencia_anos} años exp.</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            docente.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {docente.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => openEditModal(docente)}
                                            className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors mr-2"
                                            title="Editar"
                                        >
                                            <FiEdit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => setDeleteModal({ isOpen: true, docente })}
                                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                                            title="Dar de Baja"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {docentes.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                                        No hay docentes registrados que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DocenteModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                docente={docenteEditing}
            />

            <AlertModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, docente: null })}
                onConfirm={handleDelete}
                title="Dar de Baja Docente"
                message={`¿Estás seguro que deseas dar de baja al docente ${deleteModal.docente?.nombres} ${deleteModal.docente?.apellido_paterno}? Su usuario será desactivado.`}
                type="danger"
                confirmText="Dar de Baja"
            />
        </SidebarLayout>
    );
}
