import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { FiX, FiUpload, FiFileText, FiCheck, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import axios from 'axios';

export default function ImportEstadisticasModal({ isOpen, onClose, gestiones = [] }) {
    const [parsedData, setParsedData] = useState([]);
    const [fileError, setFileError] = useState('');
    const [apiError, setApiError] = useState('');
    const [apiSuccess, setApiSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { data, setData, reset } = useForm({
        gestion_id: '',
        registros: [],
    });

    useEffect(() => {
        if (isOpen) {
            if (gestiones.length > 0) {
                setData('gestion_id', gestiones[0].id);
            }
        } else {
            reset();
            setParsedData([]);
            setFileError('');
            setApiError('');
            setApiSuccess('');
        }
    }, [isOpen, gestiones]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        setFileError('');
        if (!file) return;

        const fileExt = file.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls', 'csv'].includes(fileExt)) {
            setFileError('El archivo debe ser un Excel (.xlsx, .xls) o CSV (.csv)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const jsonData = XLSX.utils.sheet_to_json(ws);
                
                // Validate minimum required fields
                const formattedData = jsonData.map(originalRow => {
                    const row = {};
                    for (const key in originalRow) {
                        row[key.trim().toLowerCase()] = originalRow[key];
                    }
                    return {
                        ci: row['ci'] ? String(row['ci']).trim() : '',
                        nombres: row['nombres'] ? String(row['nombres']).trim() : '',
                        apellido_paterno: row['apellido paterno'] || row['apellidopaterno'] ? String(row['apellido paterno'] || row['apellidopaterno']).trim() : '',
                        apellido_materno: row['apellido materno'] || row['apellidomaterno'] ? String(row['apellido materno'] || row['apellidomaterno']).trim() : '',
                        email: row['email'] || row['correo'] ? String(row['email'] || row['correo']).trim() : '',
                        sexo: row['sexo'] ? String(row['sexo']).trim() : 'M',
                        colegio: row['colegio'] ? String(row['colegio']).trim() : 'S/N',
                        ciudad: row['ciudad'] ? String(row['ciudad']).trim() : 'S/N',
                        carrera: row['carrera'] ? String(row['carrera']).trim() : '',
                        materia: row['materia'] ? String(row['materia']).trim() : '',
                        grupo: row['grupo'] ? String(row['grupo']).trim() : '',
                        monto_pago: row['monto pago'] ? parseFloat(row['monto pago']) : 0,
                        metodo_pago: row['metodo pago'] ? String(row['metodo pago']).trim() : '',
                        nro_recibo: row['nro recibo'] ? String(row['nro recibo']).trim() : '',
                        ci_docente: row['ci docente'] ? String(row['ci docente']).trim() : '',
                        nombre_docente: row['nombre docente'] ? String(row['nombre docente']).trim() : '',
                        apellido_docente: row['apellido docente'] ? String(row['apellido docente']).trim() : '',
                        profesion_docente: row['profesion docente'] ? String(row['profesion docente']).trim() : '',
                        hora_semanal_docente: row['hora semanal docente'] ? parseInt(row['hora semanal docente']) : 0,
                        nota_p1: row['nota p1'] || row['notap1'] ? parseFloat(row['nota p1'] || row['notap1']) : 0,
                        nota_p2: row['nota p2'] || row['notap2'] ? parseFloat(row['nota p2'] || row['notap2']) : 0,
                        nota_p3: row['nota p3'] || row['notap3'] ? parseFloat(row['nota p3'] || row['notap3']) : 0,
                        promedio_final: row['promedio final'] || row['promedio'] ? parseFloat(row['promedio final'] || row['promedio']) : 0,
                        estado_materia: row['estado materia'] || row['estado'] ? String(row['estado materia'] || row['estado']).trim() : 'Reprobado'
                    };
                }).filter(row => row.ci && row.nombres && row.materia && row.grupo && row.carrera);

                if (formattedData.length === 0) {
                    setFileError('No se encontraron registros válidos. Faltan columnas clave (CI, Nombres, Carrera, Materia, Grupo).');
                    setParsedData([]);
                    setData('registros', []);
                } else {
                    setParsedData(formattedData);
                    setData('registros', formattedData);
                }
            } catch (err) {
                console.error("Error parsing file:", err);
                setFileError('Hubo un error al procesar el archivo. Asegúrate de que no esté corrupto.');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setApiSuccess('');
        setIsSubmitting(true);
        
        try {
            const response = await axios.post('/estadisticas/importar-historial', {
                gestion_id: data.gestion_id,
                registros: data.registros
            });
            
            setApiSuccess(response.data.message || 'Historial importado correctamente');
            
            setTimeout(() => {
                reset();
                onClose();
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error("Submission error:", error);
            if (error.response && error.response.data) {
                setApiError(error.response.data.error || error.response.data.message || 'Error en el servidor al importar los datos.');
            } else {
                setApiError(error.message || 'Error de conexión');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-5xl p-4 md:p-6 my-8">
                <div className="bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                        <div className="flex items-center">
                            <FiUpload className="text-[#07074E] mr-3" size={24} />
                            <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Importar Historial Estadístico</h3>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full p-2 transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                        <form id="import-form" onSubmit={handleSubmit} className="space-y-6">
                            
                            {apiError && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-start shadow-sm">
                                    <FiAlertCircle className="mr-3 shrink-0 mt-0.5" size={20} /> 
                                    <div className="break-all whitespace-pre-wrap">{apiError}</div>
                                </div>
                            )}

                            {apiSuccess && (
                                <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-bold border border-green-200 flex items-center shadow-sm">
                                    <FiCheckCircle className="mr-3 shrink-0" size={20} /> 
                                    <div>{apiSuccess}</div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Gestión de Destino</label>
                                    <select
                                        value={data.gestion_id}
                                        onChange={e => setData('gestion_id', e.target.value)}
                                        className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 shadow-sm transition-all"
                                        required
                                    >
                                        {gestiones.map(g => (
                                            <option key={g.id} value={g.id}>Gestión {g.semestre}/{g.anio}</option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-400">Las notas se registrarán en esta gestión.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Archivo Excel / CSV</label>
                                    <input 
                                        type="file" 
                                        accept=".xlsx, .xls, .csv"
                                        onChange={handleFileUpload}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
                                    />
                                    {fileError && <p className="mt-2 text-sm text-red-600 font-bold">{fileError}</p>}
                                    <p className="mt-2 text-xs text-gray-400 font-medium">Debe contener: CI, Nombres, Carrera, Materia, Grupo, Promedio Final, Estado.</p>
                                </div>
                            </div>

                            {/* Preview Table */}
                            {parsedData.length > 0 && (
                                <div className="mt-8 border border-gray-100 rounded-2xl overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-700">Previsualización (Notas)</span>
                                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center">
                                            <FiCheck className="mr-1" /> {parsedData.length} registros
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto max-h-60">
                                        <table className="w-full text-sm text-left text-gray-500 whitespace-nowrap">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2">CI</th>
                                                    <th className="px-4 py-2">Estudiante</th>
                                                    <th className="px-4 py-2">Carrera</th>
                                                    <th className="px-4 py-2">Materia</th>
                                                    <th className="px-4 py-2">Grupo</th>
                                                    <th className="px-4 py-2">Nota Final</th>
                                                    <th className="px-4 py-2">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {parsedData.slice(0, 15).map((row, idx) => (
                                                    <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                                        <td className="px-4 py-2">{row.ci}</td>
                                                        <td className="px-4 py-2">{row.nombres} {row.apellido_paterno}</td>
                                                        <td className="px-4 py-2">{row.carrera}</td>
                                                        <td className="px-4 py-2 font-bold">{row.materia}</td>
                                                        <td className="px-4 py-2">{row.grupo}</td>
                                                        <td className="px-4 py-2 text-[#07074E] font-bold">{row.promedio_final}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${row.estado_materia === 'Aprobado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {row.estado_materia}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {parsedData.length > 15 && (
                                            <div className="text-center p-2 text-xs text-gray-400 bg-gray-50 italic">
                                                Mostrando los primeros 15 registros de {parsedData.length}...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end p-6 border-t border-gray-100 rounded-b-3xl shrink-0 bg-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-500 hover:bg-gray-200 hover:text-gray-900 font-bold uppercase text-xs px-6 py-3 rounded-xl mr-2 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form="import-form"
                            disabled={isSubmitting || parsedData.length === 0 || apiSuccess}
                            className="text-white bg-[#07074E] hover:bg-[#06063b] focus:ring-4 focus:ring-indigo-300 font-bold uppercase text-xs px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
                        >
                            {isSubmitting && (
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            )}
                            {isSubmitting ? 'Procesando...' : (apiSuccess ? '¡Completado!' : 'Confirmar e Importar')}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
