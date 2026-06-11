import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import { FiDollarSign, FiSettings, FiList } from 'react-icons/fi';

import ConfiguracionPagos from './_components/ConfiguracionPagos';
import UltimosRecibos from './_components/UltimosRecibos';

export default function GestionarPagos({ conceptos, metodos, historial_pagos }) {
    const [activeTab, setActiveTab] = useState('configuracion');

    return (
        <SidebarLayout title="GESTIÓN DE PAGOS" subtitle="Configuración Financiera">
            <Head title="Gestionar Pagos" />

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
                {/* Tabs Premium */}
                <div className="flex space-x-2 border-b border-gray-100 pb-4 mb-6">
                    <button
                        onClick={() => setActiveTab('configuracion')}
                        className={`flex items-center px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 ${
                            activeTab === 'configuracion'
                                ? 'bg-[#07074E] text-white shadow-lg shadow-indigo-200'
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        <FiSettings className="mr-2" size={18} />
                        CONFIGURAR COBROS
                    </button>
                    <button
                        onClick={() => setActiveTab('recibos')}
                        className={`flex items-center px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 ${
                            activeTab === 'recibos'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        <FiList className="mr-2" size={18} />
                        HISTORIAL RECIENTE
                    </button>
                </div>

                {/* Content */}
                <div className="mt-6">
                    {activeTab === 'configuracion' && (
                        <ConfiguracionPagos conceptos={conceptos} metodos={metodos} />
                    )}
                    {activeTab === 'recibos' && (
                        <UltimosRecibos historial={historial_pagos} />
                    )}
                </div>
            </div>
        </SidebarLayout>
    );
}
