import React from 'react';

export default function FormDatosPersonales({ data, handleChange, errores }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombres</label>
                <input
                    type="text"
                    name="nombres"
                    value={data.nombres}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                />
                {errores.nombres && <span className="text-red-500 text-sm">{errores.nombres[0]}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Apellido Paterno</label>
                <input
                    type="text"
                    name="apellido_paterno"
                    value={data.apellido_paterno}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                />
                {errores.apellido_paterno && <span className="text-red-500 text-sm">{errores.apellido_paterno[0]}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Apellido Materno</label>
                <input
                    type="text"
                    name="apellido_materno"
                    value={data.apellido_materno}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
                {errores.apellido_materno && <span className="text-red-500 text-sm">{errores.apellido_materno[0]}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Carnet de Identidad (CI)</label>
                <input
                    type="text"
                    name="ci"
                    value={data.ci}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                />
                {errores.ci && <span className="text-red-500 text-sm">{errores.ci[0]}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Correo Electrónico Personal</label>
                <input
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                />
                {errores.email && <span className="text-red-500 text-sm">{errores.email[0]}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <input
                    type="date"
                    name="fecha_nacimiento"
                    value={data.fecha_nacimiento}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                />
                {errores.fecha_nacimiento && <span className="text-red-500 text-sm">{errores.fecha_nacimiento[0]}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Nacionalidad</label>
                <input
                    type="text"
                    name="nacionalidad"
                    value={data.nacionalidad}
                    onChange={handleChange}
                    placeholder="Ej. Boliviana"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                />
                {errores.nacionalidad && <span className="text-red-500 text-sm">{errores.nacionalidad[0]}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Sexo</label>
                <select
                    name="sexo"
                    value={data.sexo}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
                    required
                >
                    <option value="">Seleccionar...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                </select>
                {errores.sexo && <span className="text-red-500 text-sm">{errores.sexo[0]}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono / Celular</label>
                <input
                    type="tel"
                    name="telefono"
                    value={data.telefono}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                />
                {errores.telefono && <span className="text-red-500 text-sm">{errores.telefono[0]}</span>}
            </div>

            <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Dirección Domiciliaria</label>
                <input
                    type="text"
                    name="direccion"
                    value={data.direccion}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    required
                />
                {errores.direccion && <span className="text-red-500 text-sm">{errores.direccion[0]}</span>}
            </div>
        </div>
    );
}
