import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        codigo_inicio: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar sesion" />

            <div className="mb-6 text-center">
                <p className="text-sm font-bold uppercase tracking-wide text-[#ef172f]">
                    FICCT
                </p>
                <h1 className="mt-2 text-2xl font-extrabold text-[#063f7c]">
                    Iniciar sesion
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Accede con tu codigo de usuario o CI.
                </p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="codigo_inicio" value="Codigo de Usuario / CI" />

                    <TextInput
                        id="codigo_inicio"
                        type="text"
                        name="codigo_inicio"
                        value={data.codigo_inicio}
                        className="mt-1 block w-full border-blue-950/10 bg-[#f4f8fc] focus:border-[#063f7c] focus:ring-[#063f7c]"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('codigo_inicio', e.target.value)}
                    />

                    <InputError message={errors.codigo_inicio} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Contrasena" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full border-blue-950/10 bg-[#f4f8fc] focus:border-[#063f7c] focus:ring-[#063f7c]"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            className="text-[#063f7c] focus:ring-[#063f7c]"
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Recordarme
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm font-semibold text-[#063f7c] underline hover:text-[#ef172f] focus:outline-none focus:ring-2 focus:ring-[#ef172f] focus:ring-offset-2"
                        >
                            Olvide mi contrasena
                        </Link>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className={`ms-4 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#ef172f] focus:ring-offset-2 ${
                            processing
                                ? 'cursor-not-allowed bg-blue-300'
                                : 'bg-[#063f7c] hover:bg-[#052f5d]'
                        }`}
                    >
                        Ingresar
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
