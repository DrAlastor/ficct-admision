import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    FiLogOut,
    FiMenu,
    FiX,
    FiChevronDown,
    FiFolder,
    FiLayout,
    FiUsers,
    FiSettings,
    FiActivity
} from 'react-icons/fi';
import ChatbotWidget from '@/Front/Components/ChatbotWidget';

export default function SidebarLayout({ children, title, subtitle }) {
    const { auth } = usePage().props;
    const { user, modulos } = auth;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [openModules, setOpenModules] = useState(() => {
        const saved = localStorage.getItem('sidebar_open_modules');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('sidebar_open_modules', JSON.stringify(openModules));
    }, [openModules]);

    const toggleModule = (moduleName) => {
        setOpenModules(prev => ({
            ...prev,
            [moduleName]: !prev[moduleName]
        }));
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    // Helper to determine role name based on ID
    const getRoleName = (id) => {
        if (id === 1) return 'ADMINISTRADOR';
        if (id === 2) return 'DOCENTE';
        if (id === 3) return 'POSTULANTE';
        return 'USUARIO';
    };

    const getRoleColor = (id) => {
        if (id === 1) return 'text-red-500';
        if (id === 2) return 'text-blue-500';
        return 'text-green-500';
    };

    // Helper para obtener iconos según el nombre del módulo
    const getModuleIcon = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('seguridad')) return <FiSettings />;
        if (lowerName.includes('admisión') || lowerName.includes('admision')) return <FiUsers />;
        if (lowerName.includes('académica') || lowerName.includes('academica')) return <FiFolder />;
        if (lowerName.includes('aula virtual')) return <FiLayout />;
        if (lowerName.includes('reporte') || lowerName.includes('selección')) return <FiActivity />;
        return <FiFolder />;
    };

    // Iniciales y nombre a mostrar
    const initials = user.perfil?.nombres
        ? user.perfil.nombres.substring(0, 1).toUpperCase() + (user.perfil.apellido_paterno ? user.perfil.apellido_paterno.substring(0, 1).toUpperCase() : '')
        : user.codigo_inicio ? user.codigo_inicio.substring(0, 2).toUpperCase() : 'US';

    const displayName = user.perfil?.nombres
        ? `${user.perfil.nombres} ${user.perfil.apellido_paterno || ''}`.trim()
        : user.codigo_inicio;

    return (
        <div className="flex h-screen bg-[#F4F6FB] font-sans">
            {/* Sidebar Premium */}
            <aside
                className={`bg-gradient-to-b from-[#07074E] via-[#0A0F5C] to-[#050533] text-white flex flex-col transition-all duration-300 shadow-[4px_0_24px_rgba(7,7,78,0.15)] z-20 relative overflow-hidden ${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full'}`}
            >
                <div className="w-72 flex flex-col h-full relative z-10">
                    {/* Decorative glow */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-blue-500/10 blur-3xl pointer-events-none"></div>

                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 border-b border-white/5 backdrop-blur-sm">
                        <div className="bg-gradient-to-br from-[#ef172f] to-[#c20c20] rounded-xl p-2.5 mr-3 shadow-lg shadow-red-500/20">
                            <FiLayout className="text-white font-bold" size={18} />
                        </div>
                        <span className="font-black text-xl tracking-widest drop-shadow-sm">
                            FICCT<span className="font-light text-blue-300"> SYSTEM</span>
                        </span>
                    </div>

                    {/* Dashboard Menu Item */}
                    <div className="px-5 py-5 border-b border-white/5">
                        <Link
                            href={route('dashboard')}
                            className="relative overflow-hidden group flex items-center px-4 py-3.5 bg-gradient-to-r from-blue-600/80 to-indigo-600/80 rounded-xl text-white font-bold transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 border border-white/10"
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                            <FiLayout className="mr-3 text-blue-200 group-hover:text-white transition-colors relative z-10" size={20} />
                            <span className="tracking-wide relative z-10">Dashboard</span>
                        </Link>
                    </div>

                    {/* Dynamic Modules Menu */}
                    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                        {modulos && modulos.map((modulo, idx) => ( // Modulos del panel
                            <div key={idx} className="mb-2">
                                <button
                                    onClick={() => toggleModule(modulo.nombre)}
                                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition"
                                >
                                    <div className="flex items-center font-medium">
                                        <span className="mr-3 text-gray-400">{getModuleIcon(modulo.nombre)}</span>
                                        {modulo.nombre}
                                    </div>
                                    <FiChevronDown className={`transition-transform ${openModules[modulo.nombre] ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Functions / Sub-items */}
                                <div className={`mt-1 pl-11 space-y-1 overflow-hidden transition-all duration-200 ${openModules[modulo.nombre] ? 'max-h-96' : 'max-h-0'}`}>
                                    {modulo.funciones.map((func, fIdx) => {
                                        //Definimos un mapa de rutas basado en el nombre de la función (el caso de uso)
                                        const routeMap = {
                                            'Gestionar Usuarios': 'usuarios.index',
                                            'Roles y Permisos': 'roles.index',
                                            'Auditoría y Bitácora': 'bitacora.index',
                                            'Gestionar Contraseña': 'password.edit',
                                            'Consultar Perfil': 'profile.show',
                                            'Consultar Boleta': 'boleta.index',
                                            'Consultar Horario': 'horario.index',
                                            'Consultar Asistencia': 'asistencia.index',
                                            'Rendir Exámenes': 'examenes.index',
                                            'Gestionar Postulantes': 'postulantes.index',
                                            'Gestionar Cupos': 'cupos.index',
                                            'Gestionar Grupos': 'grupos.index',
                                            'Gestionar Horarios': 'horarios.admin.index',
                                            'Gestionar Aulas': 'aulas.admin.index',
                                            'Gestionar Exámenes': 'gestion_examenes.index',
                                            'Gestionar Pagos': 'pagos.admin.index',
                                            'Gestionar Carreras': 'carreras.admin.index',
                                            'Gestionar Docente': 'docentes.index',
                                            'Gestionar Carga Horaria': 'carga_horaria.index',
                                            'Gestionar Estadísticas': 'estadisticas.index',
                                            'Gestionar Consultas': 'consultas.index',
                                            'Reporte de Pagos': 'reporte_pagos.index',
                                        };
                                        const routeName = routeMap[func.nombre];
                                        const hrefUrl = routeName ? route(routeName) : '#';

                                        return (
                                            <Link
                                                key={fIdx}
                                                href={hrefUrl}
                                                className="block py-2 text-xs text-blue-200 hover:text-white hover:translate-x-1 transition-transform"
                                            >
                                                <span className="mr-2 text-[#ef172f]">•</span>
                                                {func.nombre}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <FiMenu size={24} />
                        </button>
                        <div className="ml-4 text-xs font-semibold text-gray-400 tracking-widest uppercase">
                            • Panel de Control
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                                {displayName}
                            </div>
                            <div className={`text-xs font-bold ${getRoleColor(user.rol_id)} tracking-wider`}>
                                {getRoleName(user.rol_id)}
                            </div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm uppercase">
                            {initials}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-[#07074E] hover:bg-[#0a0d3b] text-white px-5 py-2 rounded-full text-xs font-bold tracking-wide flex items-center transition shadow-md"
                        >
                            <FiLogOut className="mr-2" />
                            CERRAR SESIÓN
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {/* Banner Dark */}
                    {title && (
                        <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 mb-8 shadow-2xl flex flex-col md:flex-row justify-between md:items-center bg-gradient-to-r from-[#07074E] via-[#0A0F5C] to-[#050533]">
                            {/* Abstract Glow */}
                            <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full pointer-events-none"></div>
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>

                            <div className="relative z-10 mb-6 md:mb-0">
                                <h1 className="text-white text-3xl md:text-4xl font-black italic tracking-wide uppercase drop-shadow-md">
                                    BIENVENIDO, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">{getRoleName(user.rol_id)}</span>
                                </h1>
                                {subtitle && (
                                    <p className="text-blue-200/80 font-bold tracking-[0.2em] text-xs mt-3 uppercase">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                            <div className="relative z-10 flex items-center bg-white/10 px-5 py-2.5 rounded-xl text-white font-bold backdrop-blur-md border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-transform hover:scale-105">
                                <span className="tracking-widest text-sm">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
                            </div>
                        </div>
                    )}

                    {children}
                </main>
            </div>
            <ChatbotWidget />
        </div>
    );
}
