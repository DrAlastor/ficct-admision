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

// URL de éxito a la que vuelve Stripe
Route::get('/registro-cup/exito', [PostulanteRegistroController::class, 'exitoPago'])->name('registro.exito');

Route::get('/', function () {
    return Inertia::render('Welcome', [
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
    Route::post('/usuarios/{id}/restore', [UsuarioController::class, 'restore'])->name('usuarios.restore');
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
    Route::get('/examenes/preguntas', [\Backend\aula_virtual\Controllers\ExamenController::class, 'preguntas'])->name('examenes.preguntas');
    Route::post('/examenes/preguntas/store', [\Backend\aula_virtual\Controllers\ExamenController::class, 'storePregunta'])->name('examenes.preguntas.store');
    Route::post('/examenes/preguntas/seeder', [\Backend\aula_virtual\Controllers\ExamenController::class, 'seederPreguntas'])->name('examenes.preguntas.seeder');
    Route::delete('/examenes/preguntas/clear', [\Backend\aula_virtual\Controllers\ExamenController::class, 'clearPreguntas'])->name('examenes.preguntas.clear');
    Route::delete('/examenes/preguntas/{id}', [\Backend\aula_virtual\Controllers\ExamenController::class, 'destroyPregunta'])->name('examenes.preguntas.destroy');
    Route::post('/examenes/store', [\Backend\aula_virtual\Controllers\ExamenController::class, 'storeExamen'])->name('examenes.store');
    
    Route::get('/examenes/{id}/rendir', [\Backend\aula_virtual\Controllers\ExamenController::class, 'rendir'])->name('examenes.rendir');
    Route::post('/examenes/{id}/calificar', [\Backend\aula_virtual\Controllers\ExamenController::class, 'calificar'])->name('examenes.calificar');
});

require __DIR__.'/auth.php';
