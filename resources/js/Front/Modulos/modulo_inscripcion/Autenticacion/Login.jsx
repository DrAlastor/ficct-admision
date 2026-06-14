import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { FiArrowLeft, FiKey, FiLock, FiLogIn, FiShield, FiUser } from 'react-icons/fi';

/**
 * Componente para el inicio de sesión de todos los usuarios (Administradores, Docentes, Postulantes).
 *
 * @param {Object} props
 * @param {string} props.status Estado opcional devuelto tras intentar login.
 * @param {boolean} props.canResetPassword Indica si la ruta de reseteo está activa.
 * @returns {JSX.Element}
 */
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
        <div className="relative min-h-screen overflow-hidden bg-[#061a36] text-slate-900">
            <Head title="Iniciar sesion" />

            <img
                src="/ficct/images/modulo-236.jpg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#061a36] via-[#063f7c]/95 to-[#020617]" />
            <div className="absolute left-[-8rem] top-16 h-72 w-72 rounded-full bg-[#ef172f]/25 blur-3xl" />
            <div className="absolute bottom-[-7rem] right-[-5rem] h-96 w-96 rounded-full bg-[#f59e0b]/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r from-[#ef172f] via-[#f59e0b] to-[#38bdf8]" />

            <main className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_460px] lg:px-8">
                <section className="hidden text-white lg:block">
                    <Link
                        href="/"
                        className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/20"
                    >
                        <FiArrowLeft className="mr-2" />
                        Volver al inicio
                    </Link>

                    <div className="mt-16 max-w-2xl">
                        <p className="inline-flex rounded-full border border-[#fbbf24]/40 bg-[#fbbf24]/15 px-4 py-2 text-sm font-black uppercase tracking-wide text-[#fbbf24]">
                            Portal academico FICCT
                        </p>
                        <h1 className="mt-6 text-6xl font-black leading-tight">
                            Acceso seguro para la Facultad de Ingenieria
                        </h1>
                        <p className="mt-6 text-xl leading-8 text-blue-50">
                            Ingresa al sistema para gestionar admision, postulaciones, aula virtual y servicios academicos de la FICCT.
                        </p>

                        <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
                            <InfoCard titulo="Admin" texto="Gestion" />
                            <InfoCard titulo="Docente" texto="Aula virtual" />
                            <InfoCard titulo="Postulante" texto="Seguimiento" />
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-md lg:max-w-none">
                    <div className="mb-6 flex justify-center lg:hidden">
                        <Link
                            href="/"
                            className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/20"
                        >
                            <FiArrowLeft className="mr-2" />
                            Volver al inicio
                        </Link>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl shadow-blue-950/40">
                        <div className="relative overflow-hidden bg-[#063f7c] px-8 py-8 text-center text-white">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.25),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(239,23,47,0.22),transparent_28%)]" />
                            <div className="relative">
                                <img
                                    src="/ficct/logos/escudo-ficct.png"
                                    alt="Logo oficial FICCT"
                                    className="mx-auto h-28 w-auto object-contain drop-shadow-2xl"
                                />
                                <p className="mt-4 text-xs font-black uppercase tracking-wide text-[#fbbf24]">
                                    Facultad de Ingenieria
                                </p>
                                <h2 className="mt-2 text-3xl font-black">Iniciar sesion</h2>
                                <p className="mt-2 text-sm leading-6 text-blue-50">
                                    Accede con tu codigo de usuario o carnet de identidad.
                                </p>
                            </div>
                        </div>

                        <div className="h-2 bg-gradient-to-r from-[#ef172f] via-[#f59e0b] to-[#38bdf8]" />

                        <div className="p-7 sm:p-8">
                            {status && (
                                <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <label htmlFor="codigo_inicio" className="block text-sm font-black text-slate-700">
                                        Codigo de Usuario / CI
                                    </label>
                                    <div className="relative mt-2">
                                        <FiUser className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#063f7c]" />
                                        <input
                                            id="codigo_inicio"
                                            type="text"
                                            name="codigo_inicio"
                                            value={data.codigo_inicio}
                                            className="block w-full rounded-xl border border-blue-950/10 bg-[#f8fbff] py-3 pl-12 pr-4 text-sm font-semibold text-slate-800 shadow-sm transition focus:border-[#063f7c] focus:bg-white focus:ring-2 focus:ring-[#063f7c]/15"
                                            autoComplete="username"
                                            autoFocus
                                            onChange={(e) => setData('codigo_inicio', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.codigo_inicio} className="mt-2" />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-black text-slate-700">
                                        Contrasena
                                    </label>
                                    <div className="relative mt-2">
                                        <FiLock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#063f7c]" />
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className="block w-full rounded-xl border border-blue-950/10 bg-[#f8fbff] py-3 pl-12 pr-4 text-sm font-semibold text-slate-800 shadow-sm transition focus:border-[#063f7c] focus:bg-white focus:ring-2 focus:ring-[#063f7c]/15"
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <label className="flex items-center">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            className="text-[#063f7c] focus:ring-[#063f7c]"
                                            onChange={(e) => setData('remember', e.target.checked)}
                                        />
                                        <span className="ms-2 text-sm font-semibold text-slate-600">
                                            Recordarme
                                        </span>
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm font-bold text-[#063f7c] underline hover:text-[#ef172f]"
                                        >
                                            Olvide mi contrasena
                                        </Link>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`flex w-full items-center justify-center rounded-xl px-4 py-4 text-sm font-black uppercase tracking-wide text-white shadow-lg transition ${
                                        processing
                                            ? 'cursor-not-allowed bg-blue-300'
                                            : 'bg-gradient-to-r from-[#ef172f] to-[#c8102a] shadow-red-950/20 hover:from-[#d9152b] hover:to-[#a90d22]'
                                    }`}
                                >
                                    <FiLogIn className="mr-2 h-5 w-5" />
                                    {processing ? 'Ingresando...' : 'Ingresar al sistema'}
                                </button>
                            </form>

                            <div className="mt-6 rounded-2xl border border-blue-950/10 bg-[#f8fbff] p-4">
                                <div className="flex items-start gap-3">
                                    <span className="rounded-xl bg-[#063f7c] p-2 text-white">
                                        <FiShield className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-black text-[#063f7c]">Acceso protegido</p>
                                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                                            Tus credenciales son personales. Cierra sesion al terminar si usas un equipo compartido.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

function InfoCard({ titulo, texto }) {
    return (
        <div className="border-l-4 border-[#fbbf24] bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-lg font-black text-white">{titulo}</p>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-100">{texto}</p>
        </div>
    );
}
