import React, { useState } from 'react';
import { FiDownload, FiSearch, FiBook, FiAward, FiFileText } from 'react-icons/fi';

export default function ResultadosView({ grupos = [], notas = [] }) {
    const [selectedGrupo, setSelectedGrupo] = useState(grupos[0]?.grupo_codigo || null);
    const [searchTerm, setSearchTerm] = useState('');

    const grupoActualInfo = grupos.find(g => g.grupo_codigo === selectedGrupo);
    const estudiantes = selectedGrupo ? (notas[selectedGrupo] || []) : [];

    const filteredEstudiantes = estudiantes.filter(e => 
        e.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.apellido_paterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.ci.includes(searchTerm)
    );

    const exportToCSV = () => {
        if (!grupoActualInfo || filteredEstudiantes.length === 0) return;

        const headers = ['CI', 'Apellido Paterno', 'Apellido Materno', 'Nombres', 'Parcial 1', 'Parcial 2', 'Examen Final', 'Promedio Final', 'Estado'];
        const csvRows = [headers.join(',')];

        filteredEstudiantes.forEach(e => {
            const row = [
                e.ci,
                e.apellido_paterno,
                e.apellido_materno || '',
                e.nombres,
                Number(e.nota_p1).toFixed(2),
                Number(e.nota_p2).toFixed(2),
                Number(e.nota_p3).toFixed(2),
                Number(e.promedio_final).toFixed(2),
                e.estado_materia
            ].map(v => `"${v}"`);
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Resultados_${grupoActualInfo.materia_nombre}_Grupo_${grupoActualInfo.grupo_nombre}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-[#0F172A] flex items-center">
                        <FiAward className="mr-2 text-indigo-500" /> Resultados de Evaluaciones
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Seleccione un grupo para visualizar o exportar las calificaciones.
                    </p>
                </div>
                {grupos.length > 0 && (
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <select 
                            value={selectedGrupo || ''} 
                            onChange={(e) => setSelectedGrupo(Number(e.target.value))}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full md:w-64 p-2.5"
                        >
                            {grupos.map(g => (
                                <option key={g.grupo_codigo} value={g.grupo_codigo}>
                                    {g.materia_nombre} - Grupo {g.grupo_nombre}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center justify-center bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
                            title="Exportar a CSV"
                        >
                            <FiDownload className="mr-2" /> CSV
                        </button>
                    </div>
                )}
            </div>

            {grupos.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <FiBook className="mx-auto text-4xl text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-700">No hay grupos asignados</h3>
                    <p className="text-gray-500 mt-2">Actualmente no gestiona ningún grupo de postulantes.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h4 className="font-bold text-gray-700 flex items-center">
                            <FiFileText className="mr-2 text-gray-400" /> 
                            Lista de Estudiantes 
                            <span className="ml-3 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs">
                                {filteredEstudiantes.length} alumnos
                            </span>
                        </h4>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Buscar por CI o Apellido..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500 w-64"
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">CI</th>
                                    <th className="px-6 py-4">Estudiante</th>
                                    <th className="px-6 py-4 text-center text-blue-600 bg-blue-50/30">Parcial 1 (30%)</th>
                                    <th className="px-6 py-4 text-center text-blue-600 bg-blue-50/30">Parcial 2 (30%)</th>
                                    <th className="px-6 py-4 text-center text-purple-600 bg-purple-50/30">Final (40%)</th>
                                    <th className="px-6 py-4 text-center font-bold">Nota Final</th>
                                    <th className="px-6 py-4 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEstudiantes.length > 0 ? (
                                    filteredEstudiantes.map((e, idx) => (
                                        <tr key={idx} className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{e.ci}</td>
                                            <td className="px-6 py-4 font-bold text-gray-700">
                                                {e.apellido_paterno} {e.apellido_materno} {e.nombres}
                                            </td>
                                            <td className="px-6 py-4 text-center bg-blue-50/10 font-medium">
                                                {Number(e.nota_p1).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center bg-blue-50/10 font-medium">
                                                {Number(e.nota_p2).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center bg-purple-50/10 font-medium">
                                                {Number(e.nota_p3).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center font-black text-gray-900 text-base">
                                                {Number(e.promedio_final).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    e.estado_materia === 'Aprobado' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {e.estado_materia}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            No se encontraron estudiantes para los filtros actuales.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
