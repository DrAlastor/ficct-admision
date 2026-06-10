import SidebarLayout from '@/Layouts/SidebarLayout';
import { Head } from '@inertiajs/react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiGlobe, FiBriefcase, FiHash } from 'react-icons/fi';

export default function ShowProfile({ perfil, rol_id }) {
    
    // Función helper para formatear fechas
    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const InfoCard = ({ icon: Icon, label, value, className = '' }) => (
        <div className={`flex items-start p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300 ${className}`}>
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600 mr-4 shrink-0">
                <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-800 break-words">{value || 'No especificado'}</p>
            </div>
        </div>
    );

    return (
        <SidebarLayout title="MI PERFIL" subtitle="INFORMACIÓN PERSONAL">
            <Head title="Consultar Perfil" />

            <div className="py-8 flex justify-center items-start min-h-[70vh]">
                <div className="w-full max-w-4xl space-y-6">
                    {/* Tarjeta Principal - Glassmorphism */}
                    <div className="relative bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] p-8 md:p-10 overflow-hidden group">
                        {/* Decoración abstracta */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-300/30 to-purple-400/30 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 border-b border-gray-100 pb-8">
                            {/* Avatar grande */}
                            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#07074E] to-blue-500 flex items-center justify-center text-white text-4xl font-black shadow-xl shrink-0 border-4 border-white">
                                {perfil.nombres ? perfil.nombres.charAt(0).toUpperCase() : 'U'}
                            </div>
                            
                            <div className="text-center md:text-left flex-1">
                                <h2 className="text-3xl font-black text-gray-800 tracking-tight">
                                    {perfil.nombres} {perfil.apellido_paterno} {perfil.apellido_materno}
                                </h2>
                                <p className="text-blue-600 font-bold uppercase tracking-widest text-sm mt-1">
                                    {perfil.cargo || 'Usuario del Sistema'}
                                </p>
                                <div className="mt-4 inline-flex items-center bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-xs font-bold font-mono">
                                    <FiHash className="mr-2" /> CÓDIGO: {perfil.codigo}
                                </div>
                            </div>
                        </div>

                        {/* Grid de Información */}
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoCard icon={FiHash} label="Carnet de Identidad" value={perfil.ci} className="col-span-1" />
                            <InfoCard icon={FiCalendar} label="Fecha de Nacimiento" value={formatDate(perfil.fecha_nacimiento)} className="col-span-1" />
                            <InfoCard icon={FiUser} label="Género (Sexo)" value={perfil.sexo === 'M' ? 'Masculino' : perfil.sexo === 'F' ? 'Femenino' : perfil.sexo} className="col-span-1" />
                            
                            <InfoCard icon={FiPhone} label="Teléfono" value={perfil.telefono} className="col-span-1" />
                            <InfoCard icon={FiMail} label="Correo Electrónico" value={perfil.email} className="md:col-span-2 lg:col-span-2" />
                            
                            <InfoCard icon={FiGlobe} label="Nacionalidad" value={perfil.nacionalidad} className="md:col-span-2 lg:col-span-1" />
                            <InfoCard icon={FiMapPin} label="Dirección" value={perfil.direccion} className="md:col-span-2 lg:col-span-2" />
                        </div>

                        {/* Información Específica por Rol */}
                        {(rol_id === 2 || rol_id === 3) && (
                            <div className="relative z-10 mt-8 pt-8 border-t border-gray-100">
                                <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center">
                                    <FiBriefcase className="mr-3 text-blue-500" /> 
                                    {rol_id === 2 ? 'Datos Docentes' : 'Datos Académicos del Postulante'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                    {rol_id === 2 && (
                                        <>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Profesión</p>
                                                <p className="font-semibold text-gray-800">{perfil.profesion || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Área Profesional</p>
                                                <p className="font-semibold text-gray-800">{perfil.area_profesional || '-'}</p>
                                            </div>
                                        </>
                                    )}
                                    {rol_id === 3 && (
                                        <>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Colegio de Procedencia</p>
                                                <p className="font-semibold text-gray-800">{perfil.colegio_procedencia || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase">Ciudad</p>
                                                <p className="font-semibold text-gray-800">{perfil.ciudad || '-'}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
