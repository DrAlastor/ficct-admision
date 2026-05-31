import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function UpdateProfileInformation({
    perfil,
    rol_id,
    className = '',
}) {
    if (!perfil) return null;

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Información Personal
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Aquí puedes ver tus datos registrados en el sistema.
                </p>
            </header>

            <div className="mt-6 space-y-6">
                <div>
                    <InputLabel value="Nombres" />
                    <TextInput
                        className="mt-1 block w-full bg-gray-100"
                        value={perfil.nombres + ' ' + perfil.apellido_paterno + (perfil.apellido_materno ? ' ' + perfil.apellido_materno : '')}
                        readOnly
                    />
                </div>

                <div>
                    <InputLabel value="Correo Electrónico" />
                    <TextInput
                        className="mt-1 block w-full bg-gray-100"
                        value={perfil.email}
                        readOnly
                    />
                </div>

                <div>
                    <InputLabel value="Carnet de Identidad (CI)" />
                    <TextInput
                        className="mt-1 block w-full bg-gray-100"
                        value={perfil.ci}
                        readOnly
                    />
                </div>

                {rol_id === 3 && (
                    <>
                        <div>
                            <InputLabel value="Colegio de Procedencia" />
                            <TextInput
                                className="mt-1 block w-full bg-gray-100"
                                value={perfil.colegio_procedencia || 'N/A'}
                                readOnly
                            />
                        </div>
                    </>
                )}

                {rol_id === 2 && (
                    <>
                        <div>
                            <InputLabel value="Profesión" />
                            <TextInput
                                className="mt-1 block w-full bg-gray-100"
                                value={perfil.profesion || 'N/A'}
                                readOnly
                            />
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
