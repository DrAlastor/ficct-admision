import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiDownload, FiUsers, FiMonitor } from 'react-icons/fi';

export default function GruposTable({ grupos, handleEdit, handleDelete, handleDownload }) {
    const [editingGroup, setEditingGroup] = useState(null);
    const [editForm, setEditForm] = useState({ cupo: '', modalidad: '' });

    const startEdit = (grupo) => {
        setEditingGroup(grupo.nombre);
        setEditForm({ cupo: grupo.cupo, modalidad: grupo.modalidad });
    };

    const saveEdit = (nombre) => {
        handleEdit(nombre, editForm.cupo, editForm.modalidad);
        setEditingGroup(null);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#0F172A]">Grupos Generados</h3>
                <span className="bg-[#07074E]/10 text-[#07074E] text-xs font-bold px-3 py-1 rounded-full">
                    Total: {grupos.length}
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Grupo</th>
                            <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Modalidad</th>
                            <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Inscritos / Cupo</th>
                            <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50/50">
                        {grupos.map((grupo, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                <td className="py-4 px-6">
                                    <span className="text-lg font-black text-[#07074E] tracking-widest bg-[#07074E]/5 px-3 py-1 rounded-lg">
                                        {grupo.nombre}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    {editingGroup === grupo.nombre ? (
                                        <select 
                                            value={editForm.modalidad}
                                            onChange={e => setEditForm({...editForm, modalidad: e.target.value})}
                                            className="border-gray-200 rounded-lg text-sm"
                                        >
                                            <option value="Presencial">Presencial</option>
                                            <option value="Virtual">Virtual</option>
                                        </select>
                                    ) : (
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                            grupo.modalidad === 'Presencial' 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : 'bg-purple-100 text-purple-700'
                                        }`}>
                                            {grupo.modalidad === 'Presencial' ? <FiUsers className="mr-1"/> : <FiMonitor className="mr-1"/>}
                                            {grupo.modalidad}
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-6">
                                    {editingGroup === grupo.nombre ? (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-500">{grupo.inscritos_actuales} / </span>
                                            <input 
                                                type="number" 
                                                value={editForm.cupo}
                                                onChange={e => setEditForm({...editForm, cupo: e.target.value})}
                                                className="border-gray-200 rounded-lg w-20 text-sm p-1"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                                <div 
                                                    className="bg-green-500 h-2.5 rounded-full" 
                                                    style={{ width: `${Math.min((grupo.inscritos_actuales / grupo.cupo) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">
                                                {grupo.inscritos_actuales} / {grupo.cupo}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-right space-x-2">
                                    {editingGroup === grupo.nombre ? (
                                        <>
                                            <button 
                                                onClick={() => saveEdit(grupo.nombre)}
                                                className="text-green-600 hover:text-green-800 font-bold text-sm"
                                            >Guardar</button>
                                            <button 
                                                onClick={() => setEditingGroup(null)}
                                                className="text-gray-400 hover:text-gray-600 font-bold text-sm ml-2"
                                            >Cancelar</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleDownload(grupo.nombre, 'pdf')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Descargar PDF">
                                                <FiDownload />
                                            </button>
                                            <button onClick={() => handleDownload(grupo.nombre, 'csv')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Descargar Excel/CSV">
                                                <FiDownload />
                                            </button>
                                            <button onClick={() => startEdit(grupo)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                                <FiEdit2 />
                                            </button>
                                            <button onClick={() => handleDelete(grupo.nombre)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                                <FiTrash2 />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {grupos.length === 0 && (
                            <tr>
                                <td colSpan="4" className="py-8 text-center text-gray-500">
                                    No hay grupos generados para esta gestión.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
