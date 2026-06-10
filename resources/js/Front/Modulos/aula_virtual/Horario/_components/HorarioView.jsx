import React from 'react';

export default function HorarioView({ horarioData, primaryColor, colorMap, timeBlocks, days }) {
    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 mt-6 p-8 relative">
            {/* Cabecera del Documento estilo Boleta de Inscripción */}
            <div className="mb-8 border-b-2 pb-6" style={{ borderColor: primaryColor }}>
                <h2 className="text-center font-bold uppercase tracking-widest text-lg mb-6 text-gray-800">
                    BOLETA DE INSCRIPCION 1-2026
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium text-gray-800">
                    <div>
                        <p className="mb-1"><span className="font-bold">Código:</span> {horarioData.registro} <span className="ml-4 font-bold">Nombre:</span> {horarioData.nombre}</p>
                        <p className="mb-1"><span className="font-bold">Carrera:</span> {horarioData.carrera}</p>
                        <p className="mb-1"><span className="font-bold">Lugar:</span> {horarioData.lugar}</p>
                    </div>
                    <div className="flex justify-end items-start hidden md:flex">
                        {/* Un pequeño recuadro simulando un QR o código de barras para la estética */}
                        <div className="w-24 h-24 bg-gray-100 border border-gray-300 p-1 flex flex-wrap content-start">
                            {/* Patrón aleatorio para simular QR */}
                            {[...Array(64)].map((_, i) => (
                                <div key={i} className={`w-2.5 h-2.5 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de Horarios */}
            <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="py-3 px-2 border-b-2 border-gray-300 font-bold text-gray-700 w-1/8 bg-green-100/50">HORARIO</th>
                            {days.map((day, idx) => (
                                <th key={idx} className="py-3 px-2 border-b-2 border-gray-300 font-bold text-gray-700 w-1/8 bg-green-100/50">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeBlocks.map((block, rowIdx) => (
                            <tr key={rowIdx} className="border-b border-gray-200">
                                {/* Columna de Horario */}
                                <td className="py-4 px-2 font-medium text-gray-600 bg-white">
                                    {block.inicio} - {block.fin}
                                </td>
                                
                                {/* Columnas de Días */}
                                {days.map((day, colIdx) => {
                                    // Buscar si hay una clase en este día y bloque de hora
                                    const clase = horarioData.clases.find(c => 
                                        c.dia === day && c.hora_inicio === block.inicio && c.hora_fin === block.fin
                                    );

                                    return (
                                        <td key={colIdx} className={`py-4 px-2 font-bold text-gray-800 ${clase ? colorMap[clase.sigla] : 'bg-white'}`}>
                                            {clase ? clase.materia : ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        
                        {/* Si no hay bloques, mostrar aviso */}
                        {timeBlocks.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-8 text-gray-400 italic">No hay clases programadas.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer (Resumen de materias) */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-600 uppercase font-medium">
                <p>MATERIAS {horarioData.total_materias} : {horarioData.lista_materias}</p>
            </div>
        </div>
    );
}
