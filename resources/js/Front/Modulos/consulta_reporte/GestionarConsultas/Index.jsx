import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import SmartSearch from './_components/SmartSearch';
import QuickQueries from './_components/QuickQueries';
import ResultTable from './_components/ResultTable';
import axios from 'axios';

export default function Index() {
    const { gestiones } = usePage().props;
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [lastSql, setLastSql] = useState('');

    const handleSearchIA = async (query) => {
        setLoading(true);
        setResults(null);
        setLastSql('');
        try {
            const response = await axios.post(route('consultas.ia'), { query });
            setResults(response.data.data);
            setLastSql(response.data.sql);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || 'Error de conexión con el servidor IA';
            alert('Error: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickQuery = async (tipo, gestionId) => {
        setLoading(true);
        setResults(null);
        setLastSql('');
        try {
            const response = await axios.post(route('consultas.predefinida'), { tipo, gestion_id: gestionId });
            setResults(response.data.data);
        } catch (error) {
            console.error(error);
            alert('Error al ejecutar la consulta predefinida');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarLayout title="CONSULTAS Y REPORTES" subtitle="Gestionar Consultas e IA — CU28">
            <Head title="Gestionar Consultas" />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Panel Izquierdo: Controles */}
                <div className="xl:col-span-5 flex flex-col h-full">
                    <SmartSearch onSearch={handleSearchIA} loading={loading} />
                    <QuickQueries 
                        gestiones={gestiones} 
                        onSelectQuery={handleQuickQuery} 
                        loading={loading} 
                    />
                </div>

                {/* Panel Derecho: Resultados */}
                <div className="xl:col-span-7 flex flex-col min-h-[600px]">
                    <ResultTable data={results} sql={lastSql} loading={loading} />
                </div>
            </div>
        </SidebarLayout>
    );
}
