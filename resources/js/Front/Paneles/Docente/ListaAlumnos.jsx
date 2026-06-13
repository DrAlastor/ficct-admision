import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSave, FiEdit2, FiCheck, FiX, FiRefreshCw, FiUser } from 'react-icons/fi';

export default function ListaAlumnos({ grupo }) {
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ nota_p1: 0, nota_p2: 0, nota_p3: 0 });
    const [saving, setSaving] = useState(false);

    const fetchAlumnos = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/docente/grupo/${grupo.grupo_codigo}/alumnos`);
            setAlumnos(response.data);
        } catch (error) {
            console.error("Error fetching alumnos", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (grupo) {
            fetchAlumnos();
        }
    }, [grupo]);

    const handleEdit = (alumno) => {
        setEditingId(alumno.inscripcion_id);
        setEditData({
            nota_p1: alumno.nota_p1 || 0,
            nota_p2: alumno.nota_p2 || 0,
            nota_p3: alumno.nota_p3 || 0,
        });
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (inscripcion_id) => {
        setSaving(true);
        try {
            const response = await axios.post('/docente/notas/update', {
                inscripcion_id,
                ...editData
            });
            
            if (response.data.success) {
                // Update local state
                setAlumnos(alumnos.map(al => {
                    if (al.inscripcion_id === inscripcion_id) {
                        return {
                            ...al,
                            nota_p1: editData.nota_p1,
                            nota_p2: editData.nota_p2,
                            nota_p3: editData.nota_p3,
                            promedio_final: response.data.promedio_final,
                            estado_materia: response.data.estado_materia
                        };
                    }
                    return al;
                }));
                setEditingId(null);
            }
        } catch (error) {
            console.error("Error saving notas", error);
            alert("Error al guardar las notas. Revisa los valores ingresados.");
        } finally {
            setSaving(false);
        }
    };

    if (!grupo) {
        return null;
    }

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 relative overflow-hidden">
            {/* Elemento decorativo */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-10 blur-2xl pointer-events-none"></div>

            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-black text-gray-800 tracking-tight">
                        Listado de Alumnos
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        {grupo.materia} <span className="mx-2 text-gray-300">|</span> 
                        <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">Grupo {grupo.grupo_nombre}</span>
                    </p>
                </div>
                <button 
                    onClick={fetchAlumnos}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-300"
                    title="Actualizar Lista"
                >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-indigo-500 font-medium animate-pulse">Cargando estudiantes...</p>
                </div>
            ) : alumnos.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <FiUser className="mx-auto text-gray-300 mb-3" size={32} />
                    <p className="text-gray-500 font-medium">No hay alumnos inscritos en este grupo todavía.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-white text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold border-b border-gray-100">Estudiante</th>
                                <th className="p-4 font-bold border-b border-gray-100 text-center">CI</th>
                                <th className="p-4 font-bold border-b border-gray-100 text-center">Parcial 1 <br/><span className="text-[10px] text-gray-400">(30%)</span></th>
                                <th className="p-4 font-bold border-b border-gray-100 text-center">Parcial 2 <br/><span className="text-[10px] text-gray-400">(30%)</span></th>
                                <th className="p-4 font-bold border-b border-gray-100 text-center">Ex. Final <br/><span className="text-[10px] text-gray-400">(40%)</span></th>
                                <th className="p-4 font-bold border-b border-gray-100 text-center">Promedio</th>
                                <th className="p-4 font-bold border-b border-gray-100 text-center">Estado</th>
                                <th className="p-4 font-bold border-b border-gray-100 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {alumnos.map((alumno, index) => (
                                <tr key={alumno.inscripcion_id} className={`hover:bg-indigo-50/30 transition-colors duration-200 ${editingId === alumno.inscripcion_id ? 'bg-blue-50/50' : ''}`}>
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-blue-200 text-indigo-700 font-bold flex items-center justify-center mr-3 text-xs shadow-inner">
                                                {alumno.nombres.charAt(0)}{alumno.apellido_paterno.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-800">{alumno.apellido_paterno} {alumno.apellido_materno}</div>
                                                <div className="text-xs text-gray-500">{alumno.nombres}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center text-sm text-gray-600 font-mono">{alumno.ci}</td>
                                    
                                    {/* Edit Mode vs View Mode */}
                                    {editingId === alumno.inscripcion_id ? (
                                        <>
                                            <td className="p-4 text-center">
                                                <input type="number" name="nota_p1" value={editData.nota_p1} onChange={handleChange} min="0" max="100" className="w-16 p-1 text-center border border-indigo-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-bold text-indigo-700" />
                                            </td>
                                            <td className="p-4 text-center">
                                                <input type="number" name="nota_p2" value={editData.nota_p2} onChange={handleChange} min="0" max="100" className="w-16 p-1 text-center border border-indigo-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-bold text-indigo-700" />
                                            </td>
                                            <td className="p-4 text-center">
                                                <input type="number" name="nota_p3" value={editData.nota_p3} onChange={handleChange} min="0" max="100" className="w-16 p-1 text-center border border-indigo-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-bold text-indigo-700" />
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-sm font-bold text-gray-400">--</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-xs text-gray-400 uppercase tracking-wider">--</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={() => handleSave(alumno.inscripcion_id)} disabled={saving} className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition shadow-sm">
                                                        {saving ? <FiRefreshCw className="animate-spin" /> : <FiCheck />}
                                                    </button>
                                                    <button onClick={handleCancel} disabled={saving} className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition shadow-sm">
                                                        <FiX />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-4 text-center font-medium text-gray-700">{alumno.nota_p1}</td>
                                            <td className="p-4 text-center font-medium text-gray-700">{alumno.nota_p2}</td>
                                            <td className="p-4 text-center font-medium text-gray-700">{alumno.nota_p3}</td>
                                            <td className="p-4 text-center">
                                                <span className={`font-black text-sm px-2 py-1 rounded-lg ${alumno.promedio_final >= 51 ? 'bg-green-100 text-green-700' : alumno.promedio_final > 0 ? 'bg-red-100 text-red-700' : 'text-gray-400'}`}>
                                                    {alumno.promedio_final}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${alumno.estado_materia === 'Aprobado' ? 'bg-green-50 text-green-600 border border-green-200' : alumno.estado_materia === 'Reprobado' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-500'}`}>
                                                    {alumno.estado_materia}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleEdit(alumno)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <FiEdit2 size={16} />
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
