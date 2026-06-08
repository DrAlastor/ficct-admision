import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function EnterToken({ status, email }) {
    const { data, setData, post, processing, errors } = useForm({
        email: email || '',
        token: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.token.verify'));
    };

    return (
        <GuestLayout>
            <Head title="Ingresar Código Temporal" />

            <div className="mb-4 text-sm text-gray-600">
                Se ha enviado un código temporal de 6 dígitos a tu correo electrónico. 
                Por favor, ingresa el código a continuación para iniciar sesión y poder cambiar tu contraseña.
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Correo Electrónico" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full bg-gray-100"
                        readOnly
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="token" value="Código de 6 dígitos" />
                    <TextInput
                        id="token"
                        type="text"
                        name="token"
                        maxLength={6}
                        value={data.token}
                        className="mt-1 block w-full tracking-widest text-center text-xl font-bold"
                        isFocused={true}
                        onChange={(e) => setData('token', e.target.value)}
                    />
                    <InputError message={errors.token} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing || data.token.length !== 6}>
                        Ingresar y Cambiar Contraseña
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
