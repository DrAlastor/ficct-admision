import React from 'react';
import { useForm } from '@inertiajs/react';
import { FiPlus, FiSave } from 'react-icons/fi';

export default function PreguntaForm({ materias }) {
    const { data, setData, post, processing, reset } = useForm({
        materia_id: materias.length > 0 ? materias[0].id : '',
        enunciado: '',
        opcion_a: '',
        opcion_b: '',
        opcion_c: '',
        opcion_d: '',
        respuesta_correcta: 'A'
    });

    const submitPregunta = (e) => {
        e.preventDefault();
        post(route('gestion_examenes.preguntas.store'), {
            onSuccess: () => reset('enunciado', 'opcion_a', 'opcion_b', 'opcion_c', 'opcion_d', 'respuesta_correcta')
        });
    };

    return (
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
            <h3 className="text-lg font-black text-gray-800 uppercase mb-4 border-b pb-2 flex items-center">
                <FiPlus className="mr-2 text-indigo-500" /> Nueva Pregunta
            </h3>
            <form onSubmit={submitPregunta} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Materia</label>
                    <select required value={data.materia_id} onChange={e => setData('materia_id', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white">
                        {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Enunciado</label>
                    <textarea required rows="3" value={data.enunciado} onChange={e => setData('enunciado', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm resize-none"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Opción A</label>
                        <input type="text" required value={data.opcion_a} onChange={e => setData('opcion_a', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Opción B</label>
                        <input type="text" required value={data.opcion_b} onChange={e => setData('opcion_b', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Opción C</label>
                        <input type="text" required value={data.opcion_c} onChange={e => setData('opcion_c', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Opción D</label>
                        <input type="text" required value={data.opcion_d} onChange={e => setData('opcion_d', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase text-green-600">Respuesta Correcta</label>
                    <select required value={data.respuesta_correcta} onChange={e => setData('respuesta_correcta', e.target.value)} className="w-full border-green-300 focus:border-green-500 focus:ring-green-200 rounded-lg text-sm font-bold bg-green-50">
                        <option value="A">Opción A</option>
                        <option value="B">Opción B</option>
                        <option value="C">Opción C</option>
                        <option value="D">Opción D</option>
                    </select>
                </div>
                <button type="submit" disabled={processing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex justify-center items-center transition-colors">
                    <FiSave className="mr-2" /> Guardar Pregunta
                </button>
            </form>
        </div>
    );
}
