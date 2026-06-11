import React from 'react';
import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiMap } from 'react-icons/fi';

import AulasGeneradas from './_components/AulasGeneradas';

export default function GestionAulasIndex({ gestion, horarios_generados, error }) {
    return (
        <SidebarLayout>
            <Head title="Gestionar Aulas" />
            
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 p-8 text-white shadow-xl">
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 text-white/10">
                        <FiMap size={250} className="transform rotate-12" />
                    </div>
                    
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-blue-100 text-sm font-bold tracking-wider mb-4 backdrop-blur-md border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                CU21 - Gestión Académica
                            </div>
                            <h1 className="text-4xl font-black mb-2 tracking-tight">Gestión de Aulas</h1>
                            <p className="text-indigo-100 text-lg max-w-xl font-medium">
                                Asigna espacios físicos para la Gestión Académica {gestion?.anio || 'Actual'}. 
                                El sistema valida choques de horario de forma automática.
                            </p>
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="bg-red-50 text-red-500 p-6 rounded-2xl border border-red-100 shadow-sm text-center font-bold">
                        {error}
                    </div>
                ) : (
                    <AulasGeneradas horarios={horarios_generados} />
                )}
            </div>
        </SidebarLayout>
    );
}
