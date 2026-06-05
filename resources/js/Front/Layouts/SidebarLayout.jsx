import { useState } from 'react';
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

export default function SidebarLayout({ children, title, subtitle }) {
    const { auth } = usePage().props;
    const { user, modulos } = auth;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [openModules, setOpenModules] = useState({});

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
        if (lowerName.includes('usuario')) return <FiUsers />;
        if (lowerName.includes('configuracion')) return <FiSettings />;
        if (lowerName.includes('reporte') || lowerName.includes('bitacora')) return <FiActivity />;
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
            {/* Sidebar */}
            <aside 
                className={`bg-[#0F172A] text-white flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-0 -translate-x-full lg:w-72 lg:translate-x-0'}`}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 bg-[#0B1121] border-b border-gray-800">
                    <div className="bg-red-600 rounded p-2 mr-3">
                        <FiLayout className="text-white font-bold" />
                    </div>
                    <span className="font-bold text-lg tracking-wider">
                        FICCT<span className="font-light text-gray-400"> SYSTEM</span>
                    </span>
                </div>

                {/* Dashboard Menu Item */}
                <div className="px-4 py-4">
                    <Link 
                        href={route('dashboard')}
                        className="flex items-center px-4 py-3 bg-red-600 rounded-lg text-white font-semibold transition hover:bg-red-700 shadow-md"
                    >
                        <FiLayout className="mr-3" />
                        Dashboard
                    </Link>
                </div>

                {/* Dynamic Modules Menu */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                    {modulos && modulos.map((modulo, idx) => (
                        <div key={idx} className="mb-2">
                            <button 
                                onClick={() => toggleModule(modulo.nombre)}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-[#1E293B] rounded-lg transition"
                            >
                                <div className="flex items-center font-medium">
                                    <span className="mr-3 text-gray-400">{getModuleIcon(modulo.nombre)}</span>
                                    {modulo.nombre}
                                </div>
                                <FiChevronDown className={`transition-transform ${openModules[modulo.nombre] ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Functions / Sub-items */}
                            <div className={`mt-1 pl-11 space-y-1 overflow-hidden transition-all duration-200 ${openModules[modulo.nombre] ? 'max-h-96' : 'max-h-0'}`}>
                                {modulo.funciones.map((func, fIdx) => (
                                    <Link 
                                        key={fIdx}
                                        href="#"
                                        className="block py-2 text-xs text-gray-400 hover:text-white hover:translate-x-1 transition-transform"
                                    >
                                        <span className="mr-2 text-red-500">•</span>
                                        {func.nombre}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-500 hover:text-gray-700 lg:hidden focus:outline-none"
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
                            className="bg-[#0F172A] hover:bg-black text-white px-5 py-2 rounded-full text-xs font-bold tracking-wide flex items-center transition shadow-md"
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
                        <div className="bg-[#0F172A] rounded-2xl p-8 mb-8 shadow-lg flex justify-between items-center bg-gradient-to-r from-[#0F172A] to-[#1E293B]">
                            <div>
                                <h1 className="text-white text-3xl font-black italic tracking-wide uppercase">
                                    BIENVENIDO, <span className="text-red-500">{getRoleName(user.rol_id)}</span>
                                </h1>
                                {subtitle && (
                                    <p className="text-gray-400 font-medium tracking-widest text-xs mt-2 uppercase">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                            <div className="hidden md:flex items-center bg-white/10 px-4 py-2 rounded-lg text-white/80 text-sm font-semibold backdrop-blur-sm border border-white/10">
                                <span>{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</span>
                            </div>
                        </div>
                    )}
                    
                    {children}
                </main>
            </div>
        </div>
    );
}
