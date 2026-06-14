import React from 'react';

export default function FormPreferencias({ data, handleChange, errores }) {
    const carreras = [
        { id: 1, nombre: 'Ingenieria Informatica', logo: '/ficct/logos/informatica.png', sigla: '187-6' },
        { id: 2, nombre: 'Ingenieria de Sistemas', logo: '/ficct/logos/sistemas.png', sigla: '187-4' },
        { id: 3, nombre: 'Ingenieria en Redes y Telecomunicaciones', logo: '/ficct/logos/redes.png', sigla: '187-5' },
        { id: 4, nombre: 'Ingenieria Robotica', logo: '/ficct/logos/robotica.png', sigla: '323-0' },
    ];

    const turnos = [
        { id: 'Manana', nombre: 'Turno Manana' },
        { id: 'Tarde', nombre: 'Turno Tarde' },
        { id: 'Cualquiera', nombre: 'Me es indiferente' },
    ];

    const tiposColegio = ['Fiscal', 'Convenio', 'Privado', 'CEA / Alternativo'];
    const selectClass = "mt-2 block w-full rounded-xl border border-blue-950/10 bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:border-[#063f7c] focus:bg-white focus:ring-2 focus:ring-[#063f7c]/15";

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-bold text-slate-700">
                        1ra Opcion de Carrera
                    </label>
                    <select
                        name="carrera_opcion1"
                        value={data.carrera_opcion1}
                        onChange={handleChange}
                        className={selectClass}
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
                        <span className="mt-1 block text-sm font-bold text-red-500">{errores.carrera_opcion1[0]}</span>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700">
                        2da Opcion de Carrera
                    </label>
                    <select
                        name="carrera_opcion2"
                        value={data.carrera_opcion2}
                        onChange={handleChange}
                        className={selectClass}
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
                        <span className="mt-1 block text-sm font-bold text-red-500">{errores.carrera_opcion2[0]}</span>
                    )}
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {carreras.map((carrera) => {
                    const seleccionada = data.carrera_opcion1 === String(carrera.id) || data.carrera_opcion2 === String(carrera.id);
                    return (
                        <div
                            key={carrera.id}
                            className={`rounded-2xl border p-4 transition ${
                                seleccionada
                                    ? 'border-[#ef172f] bg-red-50 shadow-md'
                                    : 'border-blue-950/10 bg-white'
                            }`}
                        >
                            <div className="flex h-24 items-center justify-center rounded-xl bg-[#f8fbff] p-3">
                                <img src={carrera.logo} alt={carrera.nombre} className="max-h-full max-w-full object-contain" />
                            </div>
                            <p className="mt-3 text-xs font-black text-[#ef172f]">{carrera.sigla}</p>
                            <h4 className="mt-1 text-sm font-black leading-tight text-[#063f7c]">{carrera.nombre}</h4>
                        </div>
                    );
                })}
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700">
                    Tipo de colegio
                </label>
                <div className="mt-2 grid gap-3 sm:grid-cols-4">
                    {tiposColegio.map((tipo) => (
                        <label
                            key={tipo}
                            className={`flex cursor-pointer items-center rounded-xl border px-4 py-3 text-sm font-bold transition ${
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
                    <span className="mt-1 block text-sm font-bold text-red-500">{errores.tipo_colegio[0]}</span>
                )}
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700">
                    Turno sugerido para el CUP
                </label>
                <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {turnos.map((turno) => (
                        <label
                            key={turno.id}
                            className={`flex cursor-pointer items-center rounded-xl border px-4 py-3 text-sm font-bold transition ${
                                data.turno_sugerido === turno.id
                                    ? 'border-[#063f7c] bg-blue-50 text-[#063f7c]'
                                    : 'border-blue-950/10 bg-white text-gray-700 hover:bg-blue-50'
                            }`}
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
                            <span className="ml-2">{turno.nombre}</span>
                        </label>
                    ))}
                </div>
                {errores.turno_sugerido && (
                    <span className="mt-1 block text-sm font-bold text-red-500">{errores.turno_sugerido[0]}</span>
                )}
                <p className="mt-2 text-xs font-semibold text-slate-500">
                    El turno sugerido no garantiza la asignacion, pero se tomara en cuenta segun disponibilidad de cupos.
                </p>
            </div>
        </div>
    );
}
