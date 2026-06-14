import React from 'react';

const inputClass = "mt-2 block w-full rounded-xl border border-blue-950/10 bg-[#f8fbff] px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-[#063f7c] focus:bg-white focus:ring-2 focus:ring-[#063f7c]/15";
const labelClass = "block text-sm font-bold text-slate-700";
const errorClass = "mt-1 block text-sm font-bold text-red-500";

export default function FormDatosPersonales({ data, handleChange, errores }) {
    return (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Nombres" name="nombres" value={data.nombres} onChange={handleChange} error={errores.nombres} required />
            <Field label="Apellido Paterno" name="apellido_paterno" value={data.apellido_paterno} onChange={handleChange} error={errores.apellido_paterno} required />
            <Field label="Apellido Materno" name="apellido_materno" value={data.apellido_materno} onChange={handleChange} error={errores.apellido_materno} />
            <Field label="Carnet de Identidad (CI)" name="ci" value={data.ci} onChange={handleChange} error={errores.ci} required />
            <Field label="Correo Electronico Personal" type="email" name="email" value={data.email} onChange={handleChange} error={errores.email} required />
            <Field label="Fecha de Nacimiento" type="date" name="fecha_nacimiento" value={data.fecha_nacimiento} onChange={handleChange} error={errores.fecha_nacimiento} required />
            <Field label="Nacionalidad" name="nacionalidad" value={data.nacionalidad} onChange={handleChange} error={errores.nacionalidad} placeholder="Ej. Boliviana" required />

            <div>
                <label className={labelClass}>Sexo</label>
                <select
                    name="sexo"
                    value={data.sexo}
                    onChange={handleChange}
                    className={inputClass}
                    required
                >
                    <option value="">Seleccionar...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                </select>
                {errores.sexo && <span className={errorClass}>{errores.sexo[0]}</span>}
            </div>

            <Field label="Telefono / Celular" type="tel" name="telefono" value={data.telefono} onChange={handleChange} error={errores.telefono} required />

            <div className="lg:col-span-3">
                <Field label="Direccion Domiciliaria" name="direccion" value={data.direccion} onChange={handleChange} error={errores.direccion} required />
            </div>
        </div>
    );
}

function Field({ label, error, type = 'text', ...props }) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            <input type={type} className={inputClass} {...props} />
            {error && <span className={errorClass}>{error[0]}</span>}
        </div>
    );
}
