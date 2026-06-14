import React, { useState, useCallback } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import SidebarLayout from '@/Layouts/SidebarLayout';
import FilterBar from './_components/FilterBar';
import KpiCards from './_components/KpiCards';
import ChartPostulantes from './_components/ChartPostulantes';
import ChartNotas from './_components/ChartNotas';
import ChartAprobados from './_components/ChartAprobados';
import ChartGrupos from './_components/ChartGrupos';
import ChartDocentes from './_components/ChartDocentes';
import ChartAdmision from './_components/ChartAdmision';
import RankingPanel from './_components/RankingPanel';
import ImportEstadisticasModal from './_components/ImportEstadisticasModal';
import { FiBarChart2, FiUsers, FiBookOpen, FiCheckCircle, FiLayers, FiAward, FiCreditCard, FiUpload } from 'react-icons/fi';

const TABS = [
    { id: 'postulantes', label: 'Postulantes', icon: FiUsers, emoji: '👥' },
    { id: 'notas', label: 'Notas y Rendimiento', icon: FiBookOpen, emoji: '📝' },
    { id: 'aprobados', label: 'Aprobados/Reprobados', icon: FiCheckCircle, emoji: '✅' },
    { id: 'grupos', label: 'Grupos', icon: FiLayers, emoji: '📊' },
    { id: 'docentes', label: 'Docentes', icon: FiAward, emoji: '👨‍🏫' },
    { id: 'admision', label: 'Admisión y Pagos', icon: FiCreditCard, emoji: '🎓' },
    { id: 'ranking', label: 'Rankings', icon: FiBarChart2, emoji: '🏆' },
];

export default function Index() {
    const { gestiones, carreras, materias } = usePage().props;

    const [gestion1, setGestion1] = useState('');
    const [gestion2, setGestion2] = useState('');
    const [modo, setModo] = useState('individual');
    const [usarPorcentaje, setUsarPorcentaje] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('postulantes');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleFiltrar = useCallback(async () => {
        if (!gestion1) return;

        setLoading(true);
        try {
            const ids = [gestion1];
            if (modo === 'versus' && gestion2) {
                ids.push(gestion2);
            }

            const params = new URLSearchParams();
            ids.forEach(id => params.append('gestiones[]', id));

            const response = await fetch(`/estadisticas/data?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) throw new Error('Error al obtener datos');

            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setLoading(false);
        }
    }, [gestion1, gestion2, modo]);

    const renderTabContent = () => {
        if (!data || data.length === 0) return null;

        switch (activeTab) {
            case 'postulantes':
                return <ChartPostulantes data={data} modo={modo} usarPorcentaje={usarPorcentaje} />;
            case 'notas':
                return <ChartNotas data={data} modo={modo} usarPorcentaje={usarPorcentaje} />;
            case 'aprobados':
                return <ChartAprobados data={data} modo={modo} usarPorcentaje={usarPorcentaje} />;
            case 'grupos':
                return <ChartGrupos data={data} modo={modo} usarPorcentaje={usarPorcentaje} />;
            case 'docentes':
                return <ChartDocentes data={data} modo={modo} usarPorcentaje={usarPorcentaje} />;
            case 'admision':
                return <ChartAdmision data={data} modo={modo} usarPorcentaje={usarPorcentaje} />;
            case 'ranking':
                return <RankingPanel data={data} modo={modo} />;
            default:
                return null;
        }
    };

    const exportToPDF = () => {
        const element = document.getElementById('dashboard-content');
        if (!element) return;

        const opt = {
            margin: 0.2,
            filename: 'dashboard_estadistico.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a3', orientation: 'landscape' }
        };

        import('html2pdf.js').then(html2pdf => {
            html2pdf.default().set(opt).from(element).save();
        });
    };

    return (
        <SidebarLayout title="CONSULTAS Y REPORTES" subtitle="Dashboard Estadístico">
            <Head title="Gestionar Estadísticas" />

            <div className="flex justify-between items-center mb-6">
                <div className="flex-1">
                    <FilterBar
                        gestiones={gestiones}
                        gestion1={gestion1}
                        setGestion1={setGestion1}
                        gestion2={gestion2}
                        setGestion2={setGestion2}
                        modo={modo}
                        setModo={setModo}
                        usarPorcentaje={usarPorcentaje}
                        setUsarPorcentaje={setUsarPorcentaje}
                        onFiltrar={handleFiltrar}
                        loading={loading}
                    />
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="ml-4 h-[72px] bg-white border border-[#07074E] text-[#07074E] px-6 rounded-2xl font-bold shadow-sm hover:bg-gray-50 hover:shadow-md transition-all flex flex-col items-center justify-center gap-1"
                    >
                        <FiUpload size={24} />
                        <span className="text-[10px] uppercase tracking-wider">Importar</span>
                    </button>

                    {data && data.length > 0 && !loading && (
                        <button
                            onClick={exportToPDF}
                            className="h-[72px] bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                            <span className="text-[10px] uppercase tracking-wider">Exportar PDF</span>
                        </button>
                    )}
                </div>
            </div>

            <ImportEstadisticasModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                gestiones={gestiones}
            />

            {/* Estado vacío */}
            {!data && !loading && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h2 className="text-2xl font-black text-gray-700 mb-2">Dashboard Estadístico</h2>
                    <p className="text-gray-400 font-medium max-w-md mx-auto">
                        Selecciona una gestión y presiona <strong>"Consultar"</strong> para visualizar los indicadores y gráficos estadísticos del sistema.
                    </p>
                    <div className="mt-6 flex justify-center gap-3 flex-wrap">
                        {['Postulantes', 'Notas', 'Aprobados', 'Grupos', 'Docentes', 'Admisión'].map((tag, i) => (
                            <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <div className="flex justify-center mb-4">
                        <svg className="animate-spin h-12 w-12 text-indigo-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-black text-gray-700 mb-1">Procesando datos...</h2>
                    <p className="text-gray-400 font-medium text-sm">Consultando la base de datos y generando gráficos</p>
                </div>
            )}

            {/* Dashboard con datos */}
            {data && data.length > 0 && !loading && (
                <div id="dashboard-content" className="p-4 bg-gray-50/50 rounded-2xl">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-black text-[#07074E] uppercase">Reporte Estadístico de Gestión</h2>
                        <p className="text-gray-500 text-sm font-medium">Generado el {new Date().toLocaleDateString()}</p>
                    </div>

                    {/* KPI Cards */}
                    <KpiCards data={data} modo={modo} />

                    {/* Versus Banner */}
                    {modo === 'versus' && data.length >= 2 && (
                        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl">⚔️</span>
                                <div>
                                    <h3 className="text-white font-black text-lg tracking-wide">MODO VERSUS</h3>
                                    <p className="text-white/70 text-xs font-medium">Comparando gestiones lado a lado</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 backdrop-blur-md px-5 py-2 rounded-xl text-white font-black text-sm border border-white/20">
                                    🔵 {data[0].label}
                                </div>
                                <span className="text-white/60 font-black text-lg">VS</span>
                                <div className="bg-white/20 backdrop-blur-md px-5 py-2 rounded-xl text-white font-black text-sm border border-white/20">
                                    🔴 {data[1].label}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs de navegación (ocultos en PDF si se desea, o se renderizan todos para el PDF. Por ahora renderizamos el tab activo, el usuario puede cambiar de tab y exportar) */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden html2pdf__page-break">
                        <div className="flex overflow-x-auto border-b border-gray-100">
                            {TABS.map((tab) => {
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-5 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id
                                            ? 'border-[#07074E] text-[#07074E] bg-indigo-50/50'
                                            : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-base">{tab.emoji}</span>
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contenido del tab activo */}
                    <div className="min-h-[400px]">
                        {renderTabContent()}
                    </div>
                </div>
            )}
        </SidebarLayout>
    );
}
