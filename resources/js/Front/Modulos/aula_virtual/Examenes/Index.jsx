import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

import ResultadosView from './_components/ResultadosView';
import PostulanteView from './_components/PostulanteView';

export default function Index({ auth, rol, message, examenes = [], grupos = [], notas = [], inscripciones = [] }) {
    const { flash } = usePage().props;

    return (
        <SidebarLayout title="AULA VIRTUAL" subtitle="Rendir Evaluaciones y Ver Resultados">
            <Head title="Exámenes Aula Virtual" />

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

                {message && rol === 'error' && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
                        <p className="text-sm font-bold text-red-800">{message}</p>
                    </div>
                )}

                {/* Vista según el rol */}
                {rol === 'admin_docente' && (
                    <ResultadosView grupos={grupos} notas={notas} />
                )}

                {rol === 'postulante' && (
                    <PostulanteView examenes={examenes} inscripciones={inscripciones} />
                )}
            </div>
        </SidebarLayout>
    );
}
