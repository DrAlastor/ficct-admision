import React from 'react';

export default function FormPreferencias({ data, handleChange, errores }) {
    const carreras = [
        { id: 1, nombre: 'Ingenieria Informatica' },
        { id: 2, nombre: 'Ingenieria de Sistemas' },
        { id: 3, nombre: 'Ingenieria en Redes y Telecomunicaciones' },
        { id: 4, nombre: 'Ingenieria Robotica' },
    ];

    const turnos = [
        { id: 'Manana', nombre: 'Turno Manana' },
        { id: 'Tarde', nombre: 'Turno Tarde' },
        { id: 'Cualquiera', nombre: 'Me es indiferente' },
    ];

    const tiposColegio = ['Fiscal', 'Convenio', 'Privado', 'CEA / Alternativo'];

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
                <label className="block text-sm font-semibold text-gray-700">
                    1ra Opcion de Carrera
                </label>
                <select
                    name="carrera_opcion1"
                    value={data.carrera_opcion1}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-blue-950/10 bg-white p-2 shadow-sm focus:border-[#063f7c] focus:ring-[#063f7c]"
                    required
                >
                    <option value="">Selecciona tu primera opcion...</option>
                    {carreras.map((carrera) => (
                        <option key={carrera.id} value={carrera.id}>
                            {carrera.nombre}
                        </option>
                    ))}
                </select>
                {errores.carrera_opcion1 && (
                    <span className="text-sm text-red-500">{errores.carrera_opcion1[0]}</span>
                )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700">
                    2da Opcion de Carrera
                </label>
                <select
                    name="carrera_opcion2"
                    value={data.carrera_opcion2}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-blue-950/10 bg-white p-2 shadow-sm focus:border-[#063f7c] focus:ring-[#063f7c]"
                    required
                >
                    <option value="">Selecciona tu segunda opcion...</option>
                    {carreras.map((carrera) => (
                        <option
                            key={carrera.id}
                            value={carrera.id}
                            disabled={data.carrera_opcion1 === String(carrera.id)}
                        >
                            {carrera.nombre}
                        </option>
                    ))}
                </select>
                {errores.carrera_opcion2 && (
                    <span className="text-sm text-red-500">{errores.carrera_opcion2[0]}</span>
                )}
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">
                    Tipo de colegio
                </label>
                <div className="mt-2 grid gap-3 sm:grid-cols-4">
                    {tiposColegio.map((tipo) => (
                        <label
                            key={tipo}
                            className={`flex cursor-pointer items-center rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                                data.tipo_colegio === tipo
                                    ? 'border-[#ef172f] bg-red-50 text-[#063f7c]'
                                    : 'border-blue-950/10 bg-white text-gray-700 hover:bg-blue-50'
                            }`}
                        >
                            <input
                                type="radio"
                                name="tipo_colegio"
                                value={tipo}
                                checked={data.tipo_colegio === tipo}
                                onChange={handleChange}
                                className="h-4 w-4 border-gray-300 text-[#ef172f] focus:ring-[#ef172f]"
                                required
                            />
                            <span className="ml-2">{tipo}</span>
                        </label>
                    ))}
                </div>
                {errores.tipo_colegio && (
                    <span className="text-sm text-red-500">{errores.tipo_colegio[0]}</span>
                )}
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">
                    Turno Sugerido para el CUP
                </label>
                <div className="mt-2 flex flex-wrap gap-4">
                    {turnos.map((turno) => (
                        <label
                            key={turno.id}
                            className="flex items-center rounded-lg border border-blue-950/10 bg-white px-4 py-3"
                        >
                            <input
                                type="radio"
                                name="turno_sugerido"
                                value={turno.id}
                                checked={data.turno_sugerido === turno.id}
                                onChange={handleChange}
                                className="h-4 w-4 border-gray-300 text-[#063f7c] focus:ring-[#063f7c]"
                                required
                            />
                            <span className="ml-2 text-sm text-gray-700">{turno.nombre}</span>
                        </label>
                    ))}
                </div>
                {errores.turno_sugerido && (
                    <span className="text-sm text-red-500">{errores.turno_sugerido[0]}</span>
                )}
                <p className="mt-2 text-xs text-gray-500">
                    Nota: El turno sugerido no garantiza la asignacion, pero se tomara en cuenta segun disponibilidad de cupos.
                </p>
            </div>
        </div>
    );
}
