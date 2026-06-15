import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { FiX, FiUpload, FiFileText, FiCheck, FiAlertCircle } from 'react-icons/fi';
import * as XLSX from 'xlsx';

export default function ImportUsuariosModal({ isOpen, onClose, roles = [] }) {
    const [gestiones, setGestiones] = useState([]);
    const [parsedData, setParsedData] = useState([]);
    const [fileError, setFileError] = useState('');
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        gestion_id: '',
        usuarios: [],
    });

    useEffect(() => {
        if (isOpen) {
            // Fetch gestiones disponibles
            fetch('/api/gestiones')
                .then(res => res.json())
                .then(data => {
                    setGestiones(data);
                    if (data.length > 0) {
                        setData('gestion_id', data[0].id);
                    }
                })
                .catch(err => console.error("Error al obtener gestiones:", err));
        } else {
            reset();
            setParsedData([]);
            setFileError('');
            clearErrors();
        }
    }, [isOpen]);

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
                
                // Normalize keys and validate minimum required fields
                const formattedData = jsonData.map(originalRow => {
                    const row = {};
                    // Normalize keys: trim and lowercase
                    for (const key in originalRow) {
                        row[key.trim().toLowerCase()] = originalRow[key];
                    }
                    return {
                        ci: row['ci'] ? String(row['ci']).trim() : '',
                        nombres: row['nombres'] ? String(row['nombres']).trim() : '',
                        apellido_paterno: row['apellido paterno'] || row['apellidopaterno'] ? String(row['apellido paterno'] || row['apellidopaterno']).trim() : '',
                        apellido_materno: row['apellido materno'] || row['apellidomaterno'] ? String(row['apellido materno'] || row['apellidomaterno']).trim() : '',
                        email: row['email'] || row['correo'] ? String(row['email'] || row['correo']).trim() : '',
                        telefono: row['telefono'] || row['celular'] ? String(row['telefono'] || row['celular']).trim() : '',
                        cargo: row['cargo'] ? String(row['cargo']).trim() : '',
                        rol_id: row['rol id'] || row['rol_id'] || row['rol'] ? String(row['rol id'] || row['rol_id'] || row['rol']).trim() : '',
                        password: row['password'] || row['contraseña'] ? String(row['password'] || row['contraseña']).trim() : '',
                        profesion: row['profesion'] ? String(row['profesion']).trim() : 'Ingeniero',
                        area_profesional: row['area_profesional'] || row['area profesional'] ? String(row['area_profesional'] || row['area profesional']).trim() : 'Ciencias de la Computación',
                        grado_academico: row['grado_academico'] || row['grado academico'] ? String(row['grado_academico'] || row['grado academico']).trim() : 'Licenciatura',
                        maestria: row['maestria'] ? (String(row['maestria']).trim().toLowerCase() === 'si' || String(row['maestria']).trim().toLowerCase() === 'true' || String(row['maestria']).trim() === '1') : false,
                        diplomado_educacion_superior: row['diplomado'] || row['diplomado_educacion_superior'] || row['diplomado educacion superior'] ? (String(row['diplomado'] || row['diplomado_educacion_superior'] || row['diplomado educacion superior']).trim().toLowerCase() === 'si' || String(row['diplomado'] || row['diplomado_educacion_superior'] || row['diplomado educacion superior']).trim().toLowerCase() === 'true' || String(row['diplomado'] || row['diplomado_educacion_superior'] || row['diplomado educacion superior']).trim() === '1') : false,
                        experiencia_anos: row['experiencia'] || row['experiencia_anos'] || row['experiencia anos'] ? parseInt(row['experiencia'] || row['experiencia_anos'] || row['experiencia anos']) || 0 : 5,
                        grupos_maximos: row['grupos'] || row['grupos_maximos'] || row['grupos maximos'] ? parseInt(row['grupos'] || row['grupos_maximos'] || row['grupos maximos']) || 4 : 4
                    };
                }).filter(row => row.ci && row.nombres && row.apellido_paterno && row.email && row.rol_id);

                if (formattedData.length === 0) {
                    setFileError('No se encontraron registros válidos. Verifica que las columnas existan (CI, Nombres, Apellido Paterno, Email, Rol ID).');
                    setParsedData([]);
                    setData('usuarios', []);
                } else {
                    setParsedData(formattedData);
                    setData('usuarios', formattedData);
                }
            } catch (err) {
                console.error("Error parsing file:", err);
                setFileError('Hubo un error al procesar el archivo. Asegúrate de que no esté corrupto.');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/usuarios/importar', {
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-4xl p-4 md:p-6 my-8">
                <div className="bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                        <div className="flex items-center">
                            <FiUpload className="text-[#07074E] mr-3" size={24} />
                            <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Importar Usuarios</h3>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full p-2 transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                        <form id="import-form" onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Errores del Backend */}
                            {errors.error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center">
                                    <FiAlertCircle className="mr-2" size={18} /> {errors.error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Selección de Gestión */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Gestión Académica de Ingreso</label>
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
                                    <p className="mt-1 text-xs text-gray-400">Todos los usuarios importados se asignarán a esta gestión.</p>
                                </div>

                                {/* Subir Archivo */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Archivo Excel / CSV</label>
                                    <input 
                                        type="file" 
                                        accept=".xlsx, .xls, .csv"
                                        onChange={handleFileUpload}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
                                    />
                                    {fileError && <p className="mt-2 text-sm text-red-600 font-bold">{fileError}</p>}
                                    <p className="mt-2 text-xs text-gray-400 font-medium">Debe contener las columnas: CI, Nombres, Apellido Paterno, Email, Rol ID.</p>
                                </div>
                            </div>

                            {/* Preview Table */}
                            {parsedData.length > 0 && (
                                <div className="mt-8 border border-gray-100 rounded-2xl overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-700">Previsualización de datos</span>
                                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center">
                                            <FiCheck className="mr-1" /> {parsedData.length} registros válidos
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto max-h-60">
                                        <table className="w-full text-sm text-left text-gray-500">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2">CI</th>
                                                    <th className="px-4 py-2">Nombres</th>
                                                    <th className="px-4 py-2">Apellidos</th>
                                                    <th className="px-4 py-2">Email</th>
                                                    <th className="px-4 py-2">Rol ID</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {parsedData.slice(0, 20).map((row, idx) => (
                                                    <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                                        <td className="px-4 py-2">{row.ci}</td>
                                                        <td className="px-4 py-2">{row.nombres}</td>
                                                        <td className="px-4 py-2">{row.apellido_paterno} {row.apellido_materno}</td>
                                                        <td className="px-4 py-2">{row.email}</td>
                                                        <td className="px-4 py-2 font-bold text-[#07074E]">{row.rol_id}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {parsedData.length > 20 && (
                                            <div className="text-center p-2 text-xs text-gray-400 bg-gray-50 italic">
                                                Mostrando los primeros 20 registros de {parsedData.length}...
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
                            disabled={processing || parsedData.length === 0}
                            className="text-white bg-[#07074E] hover:bg-[#06063b] focus:ring-4 focus:ring-indigo-300 font-bold uppercase text-xs px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {processing ? 'Importando...' : 'Confirmar e Importar'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
