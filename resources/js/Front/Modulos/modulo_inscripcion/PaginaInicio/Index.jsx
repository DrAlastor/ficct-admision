import { Head, Link } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import {
    FaBookOpen,
    FaChevronRight,
    FaComments,
    FaLaptopCode,
    FaMapMarkerAlt,
    FaNetworkWired,
    FaQuestionCircle,
    FaRobot,
} from 'react-icons/fa';
import ChatbotWidget from '@/Components/ChatbotWidget';

const carreras = [
    {
        titulo: 'Ingenieria Informatica',
        inicial: 'I',
        descripcion:
            'Enfoque en construccion de software, modelado, diseno de algoritmos y aplicacion etica de tecnologia computacional.',
        duracion: '9 semestres',
        modalidad: 'Presencial con soporte virtual',
        titulos: 'Tec. Medio, Tec. Superior y Licenciatura',
        director: 'MSc. Ing. Jose Junior Villagomez Melgar',
        ubicacion: 'Modulo 236, 2do Piso, Ciudad Universitaria, UAGRM',
        plan: 'Plan vigente 187-6',
        malla:
            '9 semestres y 53 materias obligatorias. Incluye programacion, bases de datos, redes, sistemas operativos, ingenieria de software, inteligencia artificial y modalidad de graduacion.',
        perfil: [
            'Desarrollo de software y aplicaciones web/moviles',
            'Gestion de bases de datos y sistemas de informacion',
            'Arquitectura de software e inteligencia artificial',
        ],
        campo: [
            'Desarrollador full-stack',
            'Ingeniero de datos',
            'Consultor TI',
            'Emprendedor tecnologico',
        ],
        icono: FaLaptopCode,
    },
    {
        titulo: 'Ingenieria de Sistemas',
        inicial: 'S',
        descripcion:
            'Forma profesionales que aplican TI para mejorar la gestion industrial y empresarial, modelando y optimizando sistemas complejos.',
        duracion: '9 semestres + modo de graduacion',
        modalidad: 'Presencial con soporte virtual',
        titulos: 'Tec. Medio, Tec. Superior y Licenciatura',
        director: 'MSc. Ing. Leonardo Vargas Pena',
        ubicacion: 'Modulo 236, Ciudad Universitaria, UAGRM',
        plan: 'Plan 187-4',
        malla:
            '10 semestres en el plan interactivo y 45 materias obligatorias. Contempla administracion, programacion, bases de datos, procesos, redes, auditoria, tecnologia web y modalidad de titulacion.',
        perfil: [
            'Analisis y diseno de sistemas de informacion',
            'Gestion de procesos de negocio',
            'Liderazgo de proyectos tecnologicos',
        ],
        campo: [
            'Gerente de tecnologia',
            'Analista de sistemas',
            'Gerente de proyectos TI',
            'Arquitecto de soluciones',
        ],
        icono: FaBookOpen,
    },
    {
        titulo: 'Ingenieria en Redes y Telecomunicaciones',
        inicial: 'R',
        descripcion:
            'Especialistas en conectividad, procesamiento de senales, seguridad de redes y regulacion de telecomunicaciones.',
        duracion: '9 semestres',
        modalidad: 'Presencial',
        titulos: 'Tec. Medio, Tec. Superior y Licenciatura',
        director: 'MSc. Ing. Jorge Rosales',
        ubicacion: 'Modulo 236, Ciudad Universitaria, UAGRM',
        plan: 'Carrera creada el 20 de abril de 2005',
        malla:
            'Plan con enfasis en redes de datos, telecomunicaciones, electronica, seguridad, gestion de infraestructura y modalidad de titulacion.',
        perfil: [
            'Diseno e implementacion de redes corporativas',
            'Administracion de servidores y servicios de red',
            'Seguridad informatica y telecomunicaciones',
        ],
        campo: [
            'Administrador de redes',
            'Ingeniero de seguridad informatica',
            'Especialista en telecomunicaciones',
            'Auditor de seguridad de redes',
        ],
        icono: FaNetworkWired,
    },
    {
        titulo: 'Ingenieria en Robotica',
        inicial: 'B',
        descripcion:
            'Programa frontera orientado a mecanica, electronica, IA y sistemas de control para resolver problemas industriales y sociales.',
        duracion: '9 semestres',
        modalidad: 'Presencial',
        titulos: 'Tec. Medio, Tec. Superior y Licenciatura',
        director: 'MSc. Ing. Jose Junior Villagomez Melgar',
        ubicacion: 'Modulo 236, Ciudad Universitaria, UAGRM',
        plan: 'Programa en desarrollo - Industria 4.0',
        malla:
            '9 semestres con materias de programacion, fisica, robotica, CAD, circuitos, IA, sistemas embebidos, control, IoT y modalidad de titulacion.',
        perfil: [
            'Automatizacion industrial',
            'Mecatronica y diseno CAD/CAM',
            'IA embebida y vision computacional',
        ],
        campo: [
            'Ingeniero en automatizacion',
            'Disenador de sistemas roboticos',
            'Investigador en robotica e IA',
            'Ingeniero en Industria 4.0',
        ],
        icono: FaRobot,
    },
];

const tabs = ['Resumen', 'Director', 'Ubicacion'];

const preguntas = [
    {
        pregunta: 'El formulario cambia?',
        respuesta: 'No. El formulario CUP se mantiene y ahi se elige la carrera.',
    },
    {
        pregunta: 'Donde pago la matricula?',
        respuesta: 'En Caja Facultativa, Modulo 236, planta baja.',
    },
    {
        pregunta: 'Que costo tiene el CUP?',
        respuesta: 'La matricula unica indicada para el CUP es de 700 Bs.',
    },
];

export default function Welcome({ auth }) {
    const [carreraSeleccionada, setCarreraSeleccionada] = useState(carreras[0]);
    const [tabActiva, setTabActiva] = useState('Resumen');
    const IconoSeleccionado = carreraSeleccionada.icono;

    const mensajeIa = useMemo(
        () =>
            `Sobre ${carreraSeleccionada.titulo}: revisa la pestana de malla y ubicacion. Para el CUP, el pago referencial es 700 Bs. en Caja Facultativa del Modulo 236.`,
        [carreraSeleccionada],
    );

    const seleccionarCarrera = (carrera) => {
        setCarreraSeleccionada(carrera);
        setTabActiva('Resumen');
    };

    const contenidoTab = {
        Resumen: (
            <>
                <p className="text-sm leading-6 text-slate-600">{carreraSeleccionada.descripcion}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Dato titulo="Duracion" valor={carreraSeleccionada.duracion} />
                    <Dato titulo="Modalidad" valor={carreraSeleccionada.modalidad} />
                    <Dato titulo="Titulos" valor={carreraSeleccionada.titulos} />
                </div>
                <Lista titulo="Perfil profesional" items={carreraSeleccionada.perfil} />
                <Lista titulo="Campo laboral" items={carreraSeleccionada.campo} />
            </>
        ),
        Director: (
            <div className="rounded-lg bg-blue-50 p-5">
                <p className="text-sm font-semibold text-blue-900">Director de carrera</p>
                <h4 className="mt-2 text-2xl font-bold text-slate-950">
                    {carreraSeleccionada.director}
                </h4>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                    Atencion academica y orientacion de la carrera en la FICCT, Ciudad Universitaria UAGRM.
                </p>
            </div>
        ),
        Ubicacion: (
            <div>
                <h4 className="text-xl font-bold text-slate-950">Centro interno y atencion</h4>
                <p className="mt-3 text-sm leading-6 text-slate-600">{carreraSeleccionada.ubicacion}</p>
                <a
                    href="https://www.google.com/maps/search/?api=1&query=FICCT+UAGRM+Modulo+236"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex rounded-md border border-blue-200 px-4 py-2 text-sm font-bold text-blue-900 hover:bg-blue-50"
                >
                    Ver ubicacion
                </a>
            </div>
        ),
    };

    return (
        <div className="min-h-screen bg-[#f4f8fc] text-slate-900">
            <Head title="FICCT - Preinscripcion CUP" />

            <header className="border-b border-blue-950/10 bg-white/95 shadow-sm">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <img
                            src="/ficct-logo.png"
                            alt="Logo oficial FICCT"
                            className="h-16 w-14 object-contain"
                        />
                        <div>
                            <p className="text-lg font-bold text-[#063f7c]">FICCT</p>
                            <p className="max-w-md text-sm text-slate-600">
                                Facultad de Ingenieria en Ciencias de la Computacion y Telecomunicaciones
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href="#carreras"
                            className="hidden rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 md:inline-flex"
                        >
                            Carreras
                        </a>
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                            className="rounded-md bg-[#063f7c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#052f5d]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                            >
                                Iniciar sesion
                            </Link>
                        )}
                    </div>
                </nav>
            </header>

            <main>
                <section className="relative overflow-hidden bg-[#063f7c]">
                    <div className="absolute left-8 top-8 h-24 w-24 rounded-full border-8 border-[#f59e0b]/30" />
                    <div className="absolute bottom-10 right-16 h-32 w-32 rounded-full bg-[#ef172f]/20 blur-2xl" />
                    <div className="absolute right-1/3 top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
                        <div className="flex flex-col justify-center">
                            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#fbbf24]">
                                Preinscripcion CUP
                            </p>
                            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
                                Conoce las carreras de la FICCT antes de llenar tu formulario
                            </h1>
                            <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-50">
                                Revisa informacion de cada carrera, malla, director, plan academico, ubicacion y datos de pago del CUP.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href="#carreras"
                                    className="inline-flex items-center justify-center rounded-md border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20"
                                >
                                    Ver carreras
                                </a>
                                <Link
                                    href={route('registro.create')}
                                    className="inline-flex items-center justify-center rounded-md bg-[#ef172f] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/20 hover:bg-[#c8102a]"
                                >
                                    Ir al formulario CUP
                                    <FaChevronRight className="ml-2 h-3 w-3" />
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <img
                                src="/ficct-logo.png"
                                alt="Logo oficial de la Facultad de Ingenieria en Ciencias de la Computacion y Telecomunicaciones"
                                className="h-72 w-auto object-contain drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </section>

                <section id="carreras" className="relative overflow-hidden border-y border-blue-950/10 bg-[#f4f8fc] py-12">
                    <div className="absolute left-0 top-0 h-full w-2 bg-[#ef172f]" />
                    <div className="absolute right-8 top-8 h-20 w-20 rounded-full bg-[#f59e0b]/20" />
                    <div className="absolute bottom-10 left-10 h-28 w-28 rounded-full bg-[#6ee76a]/15" />
                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-[#063f7c]">Carreras FICCT</h2>
                            <p className="mt-2 text-slate-600">
                                Selecciona una tarjeta para abrir la pestana informativa de la carrera.
                            </p>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                            <div className="grid gap-4">
                                {carreras.map((carrera) => {
                                    const Icono = carrera.icono;
                                    const activa = carrera.titulo === carreraSeleccionada.titulo;

                                    return (
                                        <button
                                            key={carrera.titulo}
                                            type="button"
                                            onClick={() => seleccionarCarrera(carrera)}
                                            className={`rounded-lg border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                                                activa
                                                    ? 'border-[#ef172f] ring-2 ring-red-100'
                                                    : 'border-blue-950/10'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#063f7c] text-white">
                                                    <Icono className="h-6 w-6" />
                                                </span>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-950">
                                                        {carrera.titulo}
                                                    </h3>
                                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                                        {carrera.descripcion}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <aside className="rounded-lg border border-blue-950/10 bg-white shadow-lg shadow-blue-950/5">
                                <div className="border-b border-blue-950/10 bg-gradient-to-r from-[#063f7c] to-[#0a5aa7] p-6 text-white">
                                    <div className="flex items-center gap-4">
                                        <span className="flex h-14 w-14 items-center justify-center rounded-md bg-white text-xl font-bold text-[#063f7c]">
                                            {carreraSeleccionada.inicial}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-blue-100">
                                                Pestana de informacion
                                            </p>
                                            <h3 className="text-2xl font-bold text-white">
                                                {carreraSeleccionada.titulo}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 overflow-x-auto border-b border-slate-200 px-4 py-3">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => setTabActiva(tab)}
                                            className={`shrink-0 rounded-md px-3 py-2 text-sm font-bold ${
                                                tabActiva === tab
                                                    ? 'bg-[#ef172f] text-white'
                                                    : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-6">{contenidoTab[tabActiva]}</div>
                            </aside>
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden bg-white py-12">
                    <div className="absolute right-8 top-8 h-20 w-20 rounded-full border-8 border-[#f59e0b]/20" />
                    <div className="absolute bottom-8 left-8 h-24 w-24 rounded-full bg-[#6ee76a]/10" />
                    <div className="relative mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                        <div className="rounded-lg border border-blue-950/10 bg-[#f4f8fc] p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <FaMapMarkerAlt className="h-6 w-6 text-red-700" />
                                <h2 className="text-2xl font-bold">Ubicacion de la facultad</h2>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-slate-600">
                                Av. Busch, Ciudad Universitaria, Modulo 236, Santa Cruz de la Sierra, Bolivia.
                            </p>
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=FICCT+UAGRM+Modulo+236"
                                target="_blank"
                                rel="noreferrer"
                                className="mt-5 inline-flex rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100"
                            >
                                Abrir en Google Maps
                            </a>
                        </div>

                        <div className="rounded-lg border border-blue-950/10 bg-[#f4f8fc] p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <FaQuestionCircle className="h-6 w-6 text-blue-900" />
                                <h2 className="text-2xl font-bold">Preguntas frecuentes</h2>
                            </div>
                            <div className="mt-5 space-y-4">
                                {preguntas.map((item) => (
                                    <div key={item.pregunta}>
                                        <h3 className="text-sm font-bold text-slate-950">
                                            {item.pregunta}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-600">
                                            {item.respuesta}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-[#063f7c] py-10 text-white">
                    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                        <div className="flex items-start gap-3">
                            <FaComments className="mt-1 h-6 w-6 text-blue-200" />
                            <div>
                                <h2 className="text-2xl font-bold">Chat de orientacion</h2>
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
                                    {mensajeIa}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('registro.create')}
                            className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-bold text-blue-950 hover:bg-blue-50"
                        >
                            Continuar al formulario CUP
                        </Link>
                    </div>
                </section>
            </main>
            
            <ChatbotWidget />
        </div>
    );
}

function Dato({ titulo, valor }) {
    return (
        <div className="rounded-md bg-white p-3 shadow-sm">
            <dt className="text-xs font-bold uppercase text-slate-500">{titulo}</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">{valor}</dd>
        </div>
    );
}

function Lista({ titulo, items }) {
    return (
        <div className="mt-5">
            <h4 className="text-sm font-bold text-slate-950">{titulo}</h4>
            <ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                {items.map((item) => (
                    <li key={item} className="rounded-md bg-slate-50 px-3 py-2">
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}
