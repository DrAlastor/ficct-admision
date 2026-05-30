import React from 'react';

export default function FormPreferencias({ data, handleChange, errores }) {
    const carreras = [
        { id: 1, nombre: 'Ingeniería Informática' },
        { id: 2, nombre: 'Ingeniería en Sistemas' },
        { id: 3, nombre: 'Ingeniería en Redes y Telecomunicaciones' },
        { id: 4, nombre: 'Ingeniería Robótica' },
    ];

    const turnos = [
        { id: 'Mañana', nombre: 'Turno Mañana' },
        { id: 'Tarde', nombre: 'Turno Tarde' },
        { id: 'Cualquiera', nombre: 'Me es indiferente' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">1ra Opción de Carrera</label>
                <select
                    name="carrera_opcion1"
                    value={data.carrera_opcion1}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
                    required
                >
                    <option value="">Selecciona tu primera opción...</option>
                    {carreras.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                </select>
                {errores.carrera_opcion1 && <span className="text-red-500 text-sm">{errores.carrera_opcion1[0]}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">2da Opción de Carrera</label>
                <select
                    name="carrera_opcion2"
                    value={data.carrera_opcion2}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
                    required
                >
                    <option value="">Selecciona tu segunda opción...</option>
                    {carreras.map(c => (
                        <option key={c.id} value={c.id} disabled={data.carrera_opcion1 === String(c.id)}>{c.nombre}</option>
                    ))}
                </select>
                {errores.carrera_opcion2 && <span className="text-red-500 text-sm">{errores.carrera_opcion2[0]}</span>}
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Turno Sugerido para el CUP</label>
                <div className="mt-2 flex items-center space-x-6">
                    {turnos.map(turno => (
                        <label key={turno.id} className="flex items-center">
                            <input
                                type="radio"
                                name="turno_sugerido"
                                value={turno.id}
                                checked={data.turno_sugerido === turno.id}
                                onChange={handleChange}
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                required
                            />
                            <span className="ml-2 text-sm text-gray-700">{turno.nombre}</span>
                        </label>
                    ))}
                </div>
                {errores.turno_sugerido && <span className="text-red-500 text-sm">{errores.turno_sugerido[0]}</span>}
                <p className="mt-2 text-xs text-gray-500">Nota: El turno sugerido no garantiza la asignación, pero se tomará en cuenta según disponibilidad de cupos (CU-09).</p>
            </div>
        </div>
    );
}
