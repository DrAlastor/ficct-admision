import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

import AdminView from './_components/AdminView';
import DocenteView from './_components/DocenteView';
import PostulanteView from './_components/PostulanteView';

/**
 * Componente raíz del submódulo de Asistencia.
 * Controla el estado general (historial, filtros) y renderiza la vista correspondiente
 * al rol del usuario actual (Admin, Docente o Postulante).
 *
 * @param {Object} props Datos enviados desde AsistenciaController.php
 * @returns {JSX.Element}
 */
export default function Index({ auth, rol, message, grupos = [], sesionesAbiertas = [], historial = [], perfil_id }) {
    const [showHistorial, setShowHistorial] = useState(false);
    const [filtroMateria, setFiltroMateria] = useState('');

    const { flash } = usePage().props;
    const flashSuccess = flash?.success;
    const flashError = flash?.error;
    const flashInfo = flash?.info;

    // Filtro de historial por materia
    const historialFiltrado = filtroMateria
        ? historial.filter(h => h.materia_nombre === filtroMateria)
        : historial;

    const materiasUnicas = [...new Set((historial || []).map(h => h.materia_nombre))];

    // Títulos según rol
    const titulos = {
        admin: { title: 'GESTIÓN DE ASISTENCIA', subtitle: 'Abre y cierra sesiones para cada grupo' },
        docente: { title: 'MI ASISTENCIA', subtitle: 'Marca tu asistencia y genera la contraseña para tus alumnos' },
        postulante: { title: 'MARCAR ASISTENCIA', subtitle: 'Ingresa la contraseña dictada por tu docente para marcar tu presencia' },
        error: { title: 'ASISTENCIA', subtitle: 'Error de acceso' },
    };

    const t = titulos[rol] || titulos.error;

    return (
        <SidebarLayout title={t.title} subtitle={t.subtitle}>
            <Head title="Consultar Asistencia" />

            <div className="max-w-7xl mx-auto pb-10">

                {/* Flash Messages */}
                {flashSuccess && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl flex items-center animate-[fadeIn_0.3s_ease-out]">
                        <FiCheckCircle className="text-green-600 mr-3 flex-shrink-0" size={20} />
                        <p className="text-sm font-bold text-green-800">{flashSuccess}</p>
                    </div>
                )}
                {flashError && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl flex items-center animate-[fadeIn_0.3s_ease-out]">
                        <FiXCircle className="text-red-600 mr-3 flex-shrink-0" size={20} />
                        <p className="text-sm font-bold text-red-800">{flashError}</p>
                    </div>
                )}
                {flashInfo && (
                    <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl flex items-center animate-[fadeIn_0.3s_ease-out]">
                        <FiAlertCircle className="text-blue-600 mr-3 flex-shrink-0" size={20} />
                        <p className="text-sm font-bold text-blue-800">{flashInfo}</p>
                    </div>
                )}

                {/* Error state */}
                {rol === 'error' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center text-center">
                        <div className="h-24 w-24 rounded-full bg-red-50 flex items-center justify-center mb-6">
                            <FiAlertCircle className="text-red-400" size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-3">{message}</h2>
                    </div>
                )}

                {/* Vista según el rol */}
                {rol === 'admin' && (
                    <AdminView 
                        grupos={grupos} 
                        sesionesAbiertas={sesionesAbiertas} 
                        historial={historial} 
                        showHistorial={showHistorial}
                        setShowHistorial={setShowHistorial}
                        filtroMateria={filtroMateria}
                        setFiltroMateria={setFiltroMateria}
                        materiasUnicas={materiasUnicas}
                        historialFiltrado={historialFiltrado}
                    />
                )}

                {rol === 'docente' && (
                    <DocenteView 
                        grupos={grupos} 
                        sesionesAbiertas={sesionesAbiertas} 
                        historial={historial} 
                        showHistorial={showHistorial}
                        setShowHistorial={setShowHistorial}
                        filtroMateria={filtroMateria}
                        setFiltroMateria={setFiltroMateria}
                        materiasUnicas={materiasUnicas}
                        historialFiltrado={historialFiltrado}
                    />
                )}

                {rol === 'postulante' && (
                    <PostulanteView 
                        sesionesAbiertas={sesionesAbiertas} 
                        grupos={grupos} 
                        historial={historial} 
                    />
                )}

            </div>
        </SidebarLayout>
    );
}
