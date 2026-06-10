import React from 'react';
import { FiClock, FiMapPin, FiBook, FiCalendar, FiInfo } from 'react-icons/fi';

export default function BoletaView({ boleta, data, status }) {
    // Dynamically generate styles based on config
    const headerStyle = {
        background: `linear-gradient(to right, ${data.primaryColor}, ${data.secondaryColor})`
    };
    
    // We convert hex to rgba for the light accent background (approximate 10% opacity)
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '239, 23, 47';
    };

    const bgAccentLightStyle = { 
        backgroundColor: `rgba(${hexToRgb(data.accentColor)}, 0.1)`, 
        color: data.accentColor 
    };

    return (
        <div className="space-y-8 mt-2">
            {status === 'admin_preview' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex items-start">
                    <FiInfo className="text-yellow-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                        <p className="text-sm text-yellow-800 font-bold">Modo de Previsualización</p>
                        <p className="text-xs text-yellow-700 mt-0.5">Estás viendo una boleta de prueba ficticia para que puedas ajustar los colores. Estos colores se aplicarán a todas las boletas de docentes y postulantes reales.</p>
                    </div>
                </div>
            )}

            {/* Header card */}
            <div className="rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden" style={headerStyle}>
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-white opacity-5 mix-blend-overlay"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full opacity-20 mix-blend-overlay" style={{ backgroundColor: data.accentColor }}></div>
                
                <div className="relative z-10 w-full md:w-auto text-center md:text-left">
                    <h2 className="text-sm font-bold text-white/80 uppercase tracking-widest mb-1">Grupo Asignado</h2>
                    <p className="text-5xl font-black tracking-widest text-white drop-shadow-md">{boleta?.grupo}</p>
                </div>
                
                <div className="mt-6 md:mt-0 flex items-center bg-white/10 px-6 py-4 rounded-xl backdrop-blur-sm border border-white/20 relative z-10 w-full md:w-auto justify-center md:justify-start shadow-inner">
                    <FiCalendar className="mr-4 text-white/80" size={28} />
                    <div>
                        <p className="text-[10px] text-white/80 uppercase tracking-widest font-bold">Gestión</p>
                        <p className="font-black text-lg tracking-wider">1/2026</p>
                    </div>
                </div>
            </div>

            {/* Schedule Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {boleta?.materias.map((materia, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
                        <div className="border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white p-6 flex items-center">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center mr-5 group-hover:scale-110 transition-all duration-300 shadow-sm" style={bgAccentLightStyle}>
                                <FiBook size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-800 text-lg uppercase tracking-wide">{materia.nombre}</h3>
                                <div className="flex items-center mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-700 uppercase tracking-wider">
                                        {materia.modalidad}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Horarios Programados</h4>
                            <div className="space-y-3">
                                {materia.sesiones.map((sesion, sIdx) => (
                                    <div key={sIdx} className="flex items-center justify-between text-sm group/item hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors">
                                        <div className="flex items-center text-gray-700 font-bold w-24 uppercase tracking-wider text-xs">
                                            <span className="w-1.5 h-1.5 rounded-full mr-2 opacity-70" style={{ backgroundColor: data.primaryColor }}></span>
                                            {sesion.dia}
                                        </div>
                                        <div className="flex items-center text-gray-600 bg-white border border-gray-100 shadow-sm px-3 py-1.5 rounded-md text-xs font-bold">
                                            <FiClock className="mr-1.5 text-gray-400" />
                                            {sesion.hora_inicio.substring(0,5)} - {sesion.hora_fin.substring(0,5)}
                                        </div>
                                        <div className="flex items-center font-black text-xs px-3 py-1.5 rounded-md border" style={{ backgroundColor: `rgba(${hexToRgb(data.primaryColor)}, 0.05)`, borderColor: `rgba(${hexToRgb(data.primaryColor)}, 0.1)`, color: data.primaryColor }}>
                                            <FiMapPin className="mr-1.5 opacity-80" />
                                            {sesion.nro_aula}
                                        </div>
                                    </div>
                                ))}
                                {materia.sesiones.length === 0 && (
                                    <div className="text-center py-4">
                                        <p className="text-gray-400 text-sm italic font-medium">Sin horarios asignados aún</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
