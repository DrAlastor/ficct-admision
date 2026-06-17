import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiClock, FiSearch, FiCpu } from 'react-icons/fi';
import GestionarCargaModal from './_components/GestionarCargaModal';
import axios from 'axios';

export default function Index({ auth }) {
    const { docentes, filters } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDocente, setSelectedDocente] = useState(null);
    const [isAutoCharging, setIsAutoCharging] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(route('carga_horaria.index'), { search: searchTerm }, { preserveState: true, preserveScroll: true, replace: true });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const openGestionarModal = (docente) => {
        setSelectedDocente(docente);
        setIsModalOpen(true);
    };

    const handleAutoCargar = async () => {
        if (!confirm('¿Estás seguro de auto-cargar horarios? Esto eliminará la carga horaria actual de esta gestión y reasignará los grupos a los docentes basándose en su perfil.')) return;
        
        setIsAutoCharging(true);
        try {
            const response = await axios.post(route('carga_horaria.autocargar'));
            alert(response.data.message);
            router.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al intentar auto-cargar los horarios.');
        } finally {
            setIsAutoCharging(false);
        }
    };

    return (
        <SidebarLayout title="MÓDULO DE DOCENCIA" subtitle="Gestión de Carga Horaria">
            <Head title="Carga Horaria" />
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center">
                        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl mr-4 shadow-sm">
                            <FiClock size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Carga Horaria de Docentes</h1>
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                Asigna grupos y materias al plantel docente
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full md:w-auto relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-gray-400" />
                        </div>
                        <input 
                            type="text"
                            placeholder="Buscar docente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-80 border border-gray-300 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                    
                    <button
                        onClick={handleAutoCargar}
                        disabled={isAutoCharging}
                        className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isAutoCharging ? (
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <FiCpu size={18} />
                        )}
                        {isAutoCharging ? 'Asignando...' : 'Auto-Cargar'}
                    </button>
                </div>

                <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold">Docente</th>
                                <th className="p-4 font-bold">CI</th>
                                <th className="p-4 font-bold">Profesión</th>
                                <th className="p-4 font-bold">Área Profesional</th>
                                <th className="p-4 font-bold text-center">Grupos Asignados</th>
                                <th className="p-4 font-bold text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {docentes.map((docente) => (
                                <tr key={docente.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{docente.nombres}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 font-medium">
                                        {docente.ci}
                                    </td>
                                    <td className="p-4">
                                        <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg inline-block">
                                            {docente.profesion}
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-gray-500 font-medium">
                                        {docente.area_profesional}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${docente.grupos_asignados >= docente.grupos_maximos ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                            {docente.grupos_asignados} / {docente.grupos_maximos}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => openGestionarModal(docente)}
                                            className="bg-[#07074E] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#0A0F5C] transition-colors shadow-sm"
                                        >
                                            Gestionar Carga
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {docentes.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-gray-500 font-medium">
                                        <div className="flex flex-col items-center justify-center">
                                            <FiSearch size={40} className="text-gray-300 mb-4" />
                                            No se encontraron docentes con ese criterio de búsqueda.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedDocente && (
                <GestionarCargaModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    docente={selectedDocente}
                />
            )}
        </SidebarLayout>
    );
}
