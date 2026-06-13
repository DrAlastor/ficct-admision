import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { FiCalendar, FiSettings, FiDatabase, FiList, FiRefreshCw, FiKey } from 'react-icons/fi';

export default function AdminView({ materias, examenes }) {
    const [showForm, setShowForm] = useState(false);

    // Prepare default state for preguntas_por_materia
    const defaultPreguntas = {};
    materias.forEach(m => {
        defaultPreguntas[m.id] = 0;
    });

    const { data, setData, post, processing, reset } = useForm({
        turno: 'Mañana',
        tipo: 'Parcial 1',
        fecha_inicio: '',
        fecha_fin: '',
        duracion_minutos: 60,
        password: '',
        preguntas_por_materia: defaultPreguntas
    });

    const generarPassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let pass = '';
        for (let i = 0; i < 6; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setData('password', pass);
    };

    const handlePreguntasChange = (materiaId, value) => {
        setData('preguntas_por_materia', {
            ...data.preguntas_por_materia,
            [materiaId]: parseInt(value) || 0
        });
    };

    const submitExamen = (e) => {
        e.preventDefault();
        
        let total = 0;
        Object.values(data.preguntas_por_materia).forEach(v => total += v);
        
        if (total === 0) {
            alert("Debe asignar al menos una pregunta para el examen.");
            return;
        }

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
                        <h3 className="font-black text-gray-800 text-lg mb-1">Programar Examen por Turno</h3>
                        <p className="text-xs text-gray-500 mb-4">Habilita un nuevo examen global para un turno.</p>
                        <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center inline-flex transition-colors">
                            <FiCalendar className="mr-2" /> {showForm ? 'Cancelar' : 'Programar Examen Global'}
                        </button>
                    </div>
                    <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                        <FiSettings size={32} />
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-[fadeIn_0.3s_ease-out]">
                    <h3 className="text-lg font-black text-gray-800 uppercase mb-4 border-b pb-2">Nuevo Examen Global</h3>
                    <form onSubmit={submitExamen} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Turno del Examen</label>
                            <select required value={data.turno} onChange={e => setData('turno', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm">
                                <option value="Mañana">Mañana</option>
                                <option value="Tarde">Tarde</option>
                                <option value="Noche">Noche</option>
                                <option value="Virtual">Virtual</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Tipo de Examen</label>
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
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Duración Global (Minutos)</label>
                            <input type="number" min="5" required value={data.duracion_minutos} onChange={e => setData('duracion_minutos', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Contraseña del Examen</label>
                            <div className="flex space-x-2">
                                <input type="text" required value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm font-mono tracking-widest text-indigo-700 bg-indigo-50" placeholder="Ej: A1B2C3" />
                                <button type="button" onClick={generarPassword} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 rounded-lg border border-indigo-200 transition-colors" title="Generar Contraseña Aleatoria">
                                    <FiRefreshCw />
                                </button>
                            </div>
                        </div>

                        {/* Configuración de Materias */}
                        <div className="md:col-span-2 mt-4 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                            <h4 className="text-sm font-black text-gray-700 mb-3 border-b border-gray-200 pb-2">Composición del Examen (Cantidad de preguntas por materia)</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {materias.map(m => (
                                    <div key={m.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                        <label className="block text-xs font-bold text-gray-600 mb-1 truncate" title={m.nombre}>{m.nombre}</label>
                                        <div className="flex items-center">
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max={m.total_preguntas} 
                                                value={data.preguntas_por_materia[m.id] || 0} 
                                                onChange={e => handlePreguntasChange(m.id, e.target.value)} 
                                                className="w-full border-gray-300 rounded-md text-sm py-1.5" 
                                            />
                                            <span className="text-[10px] text-gray-400 ml-2 font-bold whitespace-nowrap">/ {m.total_preguntas} Disp.</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2 mt-4">
                            <button type="submit" disabled={processing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl shadow-md transition-colors flex justify-center items-center">
                                {processing ? 'Guardando...' : 'Guardar y Programar Examen'}
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
                                <th className="px-6 py-3 text-left font-black text-gray-500 text-xs uppercase">Turno / Tipo</th>
                                <th className="px-6 py-3 text-left font-black text-gray-500 text-xs uppercase">Programación</th>
                                <th className="px-6 py-3 text-left font-black text-gray-500 text-xs uppercase">Composición</th>
                                <th className="px-6 py-3 text-center font-black text-gray-500 text-xs uppercase">Contraseña</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {examenes.map(ex => {
                                const totalPreguntas = ex.materias.reduce((acc, m) => acc + m.cantidad_preguntas, 0);
                                
                                return (
                                <tr key={ex.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-black text-gray-800 text-base">{ex.turno}</div>
                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">{ex.tipo}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-medium text-gray-600 flex items-center mb-1"><FiCalendar className="mr-1"/> Inicio: {ex.fecha_inicio}</div>
                                        <div className="text-xs font-medium text-gray-600 flex items-center mb-1"><FiCalendar className="mr-1"/> Fin: {ex.fecha_fin}</div>
                                        <div className="text-[11px] font-black text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">Duración: {ex.duracion_minutos} min</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-black text-gray-700 mb-1">Total: {totalPreguntas} preguntas</div>
                                        <div className="flex flex-wrap gap-1">
                                            {ex.materias.map((m, i) => (
                                                <span key={i} className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded font-medium">
                                                    {m.nombre}: {m.cantidad_preguntas}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center justify-center bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-mono font-black text-slate-700 shadow-inner">
                                            <FiKey className="mr-2 text-slate-400" />
                                            {ex.password}
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
