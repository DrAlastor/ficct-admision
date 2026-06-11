import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { FiCalendar, FiSettings, FiDatabase, FiList } from 'react-icons/fi';

export default function AdminView({ materias, examenes }) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        materia_id: '',
        tipo: 'Parcial 1',
        fecha_inicio: '',
        fecha_fin: '',
        duracion_minutos: 30,
        cantidad_preguntas: 5
    });

    const submitExamen = (e) => {
        e.preventDefault();
        post(route('gestion_examenes.store'), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-gray-800 text-lg mb-1">Banco de Preguntas</h3>
                        <p className="text-xs text-gray-500 mb-4">Gestiona las preguntas de selección múltiple por materia.</p>
                        <Link href={route('gestion_examenes.preguntas')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center inline-flex transition-colors">
                            <FiDatabase className="mr-2" /> Gestionar Banco
                        </Link>
                    </div>
                    <div className="h-16 w-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center">
                        <FiList size={32} />
                    </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-gray-800 text-lg mb-1">Programar Examen</h3>
                        <p className="text-xs text-gray-500 mb-4">Habilita un nuevo examen para los postulantes.</p>
                        <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center inline-flex transition-colors">
                            <FiCalendar className="mr-2" /> {showForm ? 'Cancelar' : 'Programar Examen'}
                        </button>
                    </div>
                    <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                        <FiSettings size={32} />
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-[fadeIn_0.3s_ease-out]">
                    <h3 className="text-lg font-black text-gray-800 uppercase mb-4 border-b pb-2">Nuevo Examen</h3>
                    <form onSubmit={submitExamen} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Materia</label>
                            <select required value={data.materia_id} onChange={e => setData('materia_id', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm">
                                <option value="">Seleccione una materia</option>
                                {materias.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.total_preguntas} preg. disponibles)</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Tipo</label>
                            <select required value={data.tipo} onChange={e => setData('tipo', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm">
                                <option value="Parcial 1">Parcial 1 (30%)</option>
                                <option value="Parcial 2">Parcial 2 (30%)</option>
                                <option value="Examen Final">Examen Final (40%)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Fecha y Hora de Inicio</label>
                            <input type="datetime-local" required value={data.fecha_inicio} onChange={e => setData('fecha_inicio', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Fecha y Hora de Fin</label>
                            <input type="datetime-local" required value={data.fecha_fin} onChange={e => setData('fecha_fin', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Duración (Minutos)</label>
                            <input type="number" min="5" required value={data.duracion_minutos} onChange={e => setData('duracion_minutos', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Cantidad de Preguntas</label>
                            <input type="number" min="1" max="50" required value={data.cantidad_preguntas} onChange={e => setData('cantidad_preguntas', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div className="md:col-span-2 mt-2">
                            <button type="submit" disabled={processing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-sm transition-colors">
                                Guardar Examen
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                    <h3 className="font-black text-gray-800 uppercase tracking-wide flex items-center">
                        <FiCalendar className="mr-2 text-indigo-500" /> Exámenes Programados
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-black text-gray-500 text-xs uppercase">Materia</th>
                                <th className="px-6 py-3 text-left font-black text-gray-500 text-xs uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left font-black text-gray-500 text-xs uppercase">Apertura</th>
                                <th className="px-6 py-3 text-left font-black text-gray-500 text-xs uppercase">Cierre</th>
                                <th className="px-6 py-3 text-center font-black text-gray-500 text-xs uppercase">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {examenes.map(ex => (
                                <tr key={ex.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-gray-800">{ex.materia_nombre}</td>
                                    <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100">{ex.tipo}</span></td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-600">{ex.fecha_inicio}</td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-600">{ex.fecha_fin}</td>
                                    <td className="px-6 py-4 text-center text-xs font-medium text-gray-500">{ex.duracion_minutos} min / {ex.cantidad_preguntas} preg.</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
