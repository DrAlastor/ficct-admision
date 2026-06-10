import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

import AdminView from './_components/AdminView';
import DocenteView from './_components/DocenteView';
import PostulanteView from './_components/PostulanteView';

/**
 * Componente principal del submódulo de Exámenes.
 * Funciona como un enrutador interno que muestra una vista u otra (AdminView, DocenteView, PostulanteView)
 * dependiendo del rol del usuario autenticado, manteniendo un mismo SidebarLayout de fondo.
 *
 * @param {Object} props Props enviados desde ExamenController.php
 * @returns {JSX.Element}
 */
export default function Index({ auth, rol, message, materias = [], examenes = [], grupos = [], notas = [], inscripciones = [] }) {
    const { flash } = usePage().props;

    return (
        <SidebarLayout title="GESTIÓN DE EXÁMENES" subtitle="Configuración y seguimiento de evaluaciones web">
            <Head title="Exámenes" />

            <div className="max-w-7xl mx-auto pb-10">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl flex items-center">
                        <FiCheckCircle className="text-green-600 mr-3 flex-shrink-0" size={20} />
                        <p className="text-sm font-bold text-green-800">{flash.success}</p>
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl flex items-center">
                        <FiXCircle className="text-red-600 mr-3 flex-shrink-0" size={20} />
                        <p className="text-sm font-bold text-red-800">{flash.error}</p>
                    </div>
                )}

                {/* Vista según el rol */}
                {rol === 'admin' && (
                    <AdminView materias={materias} examenes={examenes} />
                )}

                {rol === 'docente' && (
                    <DocenteView grupos={grupos} notas={notas} />
                )}

                {rol === 'postulante' && (
                    <PostulanteView examenes={examenes} inscripciones={inscripciones} />
                )}
            </div>
        </SidebarLayout>
    );
}
