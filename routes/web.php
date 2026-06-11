<?php

use Backend\usuario_seguridad\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Backend\modulo_inscripcion\Controllers\PostulanteRegistroController;

// Mostrar el formulario en React
Route::get('/registro-cup', [PostulanteRegistroController::class, 'create'])->name('registro.create');

// Procesar los datos, archivos y el pago
Route::post('/registro-cup', [PostulanteRegistroController::class, 'store'])->name('registro.store');

// Procesar formulario e iniciar pago
Route::post('/registro-cup/pago', [PostulanteRegistroController::class, 'iniciarPago'])->name('registro.iniciarPago');

// URL de éxito a la que vuelve Stripe (Flujo original)
Route::get('/registro-cup/exito', [PostulanteRegistroController::class, 'exitoPago'])->name('registro.exito');

// RUTAS DE PAGOS (Stripe & PayPal)
Route::post('/api/create-payment-intent', [PaymentController::class, 'createPaymentIntent']);
Route::post('/api/paypal/create-order', [PaymentController::class, 'createPayPalOrder']);
Route::post('/api/paypal/capture-order', [PaymentController::class, 'capturePayPalOrder']);
Route::post('/stripe/webhook', [PaymentController::class, 'stripeWebhook'])
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);

// Nuevo flujo: Pago ficticio, iniciar inscripción y consulta
Route::post('/registro-cup/iniciar-inscripcion', [PostulanteRegistroController::class, 'iniciarInscripcion']);
Route::post('/registro-cup/pago-ficticio', [PostulanteRegistroController::class, 'procesarPagoFicticio'])->name('registro.pago.ficticio');
Route::post('/registro-cup/consultar', [PostulanteRegistroController::class, 'consultarRegistro'])->name('registro.consultar');

Route::get('/', function () {
    return Inertia::render('Modulos/modulo_inscripcion/PaginaInicio/Index', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

use Backend\usuario_seguridad\Controllers\DashboardController;

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/password', [Backend\usuario_seguridad\Controllers\ProfileController::class, 'edit'])->name('password.edit');
    Route::patch('/password', [Backend\usuario_seguridad\Controllers\ProfileController::class, 'update'])->name('password.update.profile');
    Route::delete('/password', [Backend\usuario_seguridad\Controllers\ProfileController::class, 'destroy'])->name('password.destroy');
    
    // Consultar Perfil
    Route::get('/perfil', [Backend\usuario_seguridad\Controllers\ProfileController::class, 'show'])->name('profile.show');
    
    // Gestión de Usuarios
    Route::post('/usuarios/{id}/restore', [\Backend\usuario_seguridad\Controllers\UsuarioController::class, 'restore'])->name('usuarios.restore');
    Route::resource('usuarios', Backend\usuario_seguridad\Controllers\UsuarioController::class);
    
    // Gestión de Roles y Permisos
    Route::resource('roles', Backend\usuario_seguridad\Controllers\RolController::class);

    // Auditoría y Bitácora
    Route::get('/bitacora', [Backend\usuario_seguridad\Controllers\BitacoraController::class, 'index'])->name('bitacora.index');
});

use Backend\aula_virtual\Controllers\DocenteController;
use Backend\aula_virtual\Controllers\BoletaController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/docente/grupo/{id}/alumnos', [DocenteController::class, 'getAlumnos'])->name('docente.alumnos');
    Route::post('/docente/notas/update', [DocenteController::class, 'updateNotas'])->name('docente.notas.update');
    
    // Consultar Boleta
    Route::get('/boleta', [\Backend\aula_virtual\Controllers\BoletaController::class, 'index'])->name('boleta.index');
    Route::post('/boleta/config', [\Backend\aula_virtual\Controllers\BoletaController::class, 'saveConfig'])->name('boleta.config.save');

    // Consultar Horario
    Route::get('/horario', [\Backend\aula_virtual\Controllers\HorarioController::class, 'index'])->name('horario.index');

    // Consultar / Marcar Asistencia
    Route::get('/asistencia', [\Backend\aula_virtual\Controllers\AsistenciaController::class, 'index'])->name('asistencia.index');
    Route::post('/asistencia/abrir', [\Backend\aula_virtual\Controllers\AsistenciaController::class, 'abrirSesion'])->name('asistencia.abrir');
    Route::post('/asistencia/cerrar/{id}', [\Backend\aula_virtual\Controllers\AsistenciaController::class, 'cerrarSesion'])->name('asistencia.cerrar');
    Route::post('/asistencia/generar-contrasena/{id}', [\Backend\aula_virtual\Controllers\AsistenciaController::class, 'generarContrasena'])->name('asistencia.generar');
    Route::post('/asistencia/marcar-docente/{id}', [\Backend\aula_virtual\Controllers\AsistenciaController::class, 'marcarDocente'])->name('asistencia.marcar.docente');
    Route::post('/asistencia/marcar', [\Backend\aula_virtual\Controllers\AsistenciaController::class, 'marcarPostulante'])->name('asistencia.marcar.postulante');

    // Rendir Examenes
    Route::get('/examenes', [\Backend\aula_virtual\Controllers\ExamenController::class, 'index'])->name('examenes.index');
    Route::get('/examenes/{id}/rendir', [\Backend\aula_virtual\Controllers\ExamenController::class, 'rendir'])->name('examenes.rendir');
    Route::post('/examenes/{id}/calificar', [\Backend\aula_virtual\Controllers\ExamenController::class, 'calificar'])->name('examenes.calificar');

    Route::prefix('gestion-examenes')->group(function () {
        Route::get('/', [\Backend\gestion_academica\Controllers\GestionExamenController::class, 'index'])->name('gestion_examenes.index');
        Route::get('/preguntas', [\Backend\gestion_academica\Controllers\GestionExamenController::class, 'preguntas'])->name('gestion_examenes.preguntas');
        Route::post('/preguntas/store', [\Backend\gestion_academica\Controllers\GestionExamenController::class, 'storePregunta'])->name('gestion_examenes.preguntas.store');
        Route::post('/preguntas/seeder', [\Backend\gestion_academica\Controllers\GestionExamenController::class, 'seederPreguntas'])->name('gestion_examenes.preguntas.seeder');
        Route::delete('/preguntas/clear', [\Backend\gestion_academica\Controllers\GestionExamenController::class, 'clearPreguntas'])->name('gestion_examenes.preguntas.clear');
        Route::delete('/preguntas/{id}', [\Backend\gestion_academica\Controllers\GestionExamenController::class, 'destroyPregunta'])->name('gestion_examenes.preguntas.destroy');
        Route::post('/store', [\Backend\gestion_academica\Controllers\GestionExamenController::class, 'storeExamen'])->name('gestion_examenes.store');
    });

    // Configuración de Cupos
    Route::get('/configuracion-cupos', [\Backend\gestion_academica\Controllers\CupoController::class, 'index'])->name('cupos.index');
    Route::post('/configuracion-cupos', [\Backend\gestion_academica\Controllers\CupoController::class, 'update'])->name('cupos.update');

    // Gestión de Grupos
    Route::get('/grupos', [\Backend\gestion_academica\Controllers\GrupoController::class, 'index'])->name('grupos.index');
    Route::post('/grupos/generar', [\Backend\gestion_academica\Controllers\GrupoController::class, 'generar'])->name('grupos.generar');

    // Gestión de Horarios
    Route::get('/horarios', [\Backend\gestion_academica\Controllers\GestionHorarioController::class, 'index'])->name('horarios.admin.index');
    Route::post('/horarios/generar', [\Backend\gestion_academica\Controllers\GestionHorarioController::class, 'generar'])->name('horarios.admin.generar');
    
    // Gestión de Aulas
    Route::get('/aulas', [\Backend\gestion_academica\Controllers\AulaController::class, 'index'])->name('aulas.admin.index');
    Route::get('/aulas/disponibles', [\Backend\gestion_academica\Controllers\AulaController::class, 'getAulasDisponibles'])->name('aulas.admin.aulas_disponibles');
    Route::post('/aulas/asignar', [\Backend\gestion_academica\Controllers\AulaController::class, 'asignarAula'])->name('aulas.admin.asignar_aula');
    Route::post('/aulas/autogenerar', [\Backend\gestion_academica\Controllers\AulaController::class, 'autogenerar'])->name('aulas.admin.autogenerar');

    // Gestión Académica
    Route::post('/postulantes/{id}/aceptar', [\Backend\gestion_academica\Controllers\PostulanteController::class, 'aceptar'])->name('postulantes.aceptar');
    Route::get('/postulantes', [\Backend\gestion_academica\Controllers\PostulanteController::class, 'index'])->name('postulantes.index');
    Route::put('/postulantes/{id}', [\Backend\gestion_academica\Controllers\PostulanteController::class, 'update'])->name('postulantes.update');

    // Gestión de Pagos (CU23)
    Route::get('/pagos', [\Backend\gestion_academica\Controllers\PagoController::class, 'index'])->name('pagos.admin.index');
    Route::post('/pagos/concepto', [\Backend\gestion_academica\Controllers\PagoController::class, 'guardarConcepto'])->name('pagos.admin.concepto.store');
    Route::delete('/pagos/concepto/{id}', [\Backend\gestion_academica\Controllers\PagoController::class, 'eliminarConcepto'])->name('pagos.admin.concepto.destroy');
    Route::post('/pagos/metodo', [\Backend\gestion_academica\Controllers\PagoController::class, 'guardarMetodo'])->name('pagos.admin.metodo.store');

    // Gestión de Carreras (CU24)
    Route::get('/carreras', [\Backend\gestion_academica\Controllers\CarreraController::class, 'index'])->name('carreras.admin.index');
    Route::post('/carreras', [\Backend\gestion_academica\Controllers\CarreraController::class, 'store'])->name('carreras.admin.store');
    Route::put('/carreras/{codigo}', [\Backend\gestion_academica\Controllers\CarreraController::class, 'update'])->name('carreras.admin.update');
    Route::delete('/carreras/{codigo}', [\Backend\gestion_academica\Controllers\CarreraController::class, 'destroy'])->name('carreras.admin.destroy');
});

require __DIR__.'/auth.php';
