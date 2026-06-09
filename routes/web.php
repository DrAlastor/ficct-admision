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
    Route::get('/profile', [Backend\usuario_seguridad\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [Backend\usuario_seguridad\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [Backend\usuario_seguridad\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Gestión de Usuarios
    Route::resource('usuarios', Backend\usuario_seguridad\Controllers\UsuarioController::class);
    
    // Gestión de Roles y Permisos
    Route::resource('roles', Backend\usuario_seguridad\Controllers\RolController::class);

    // Auditoría y Bitácora
    Route::get('/bitacora', [Backend\usuario_seguridad\Controllers\BitacoraController::class, 'index'])->name('bitacora.index');
});

use Backend\aula_virtual\Controllers\DocenteController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/docente/grupo/{id}/alumnos', [DocenteController::class, 'getAlumnos'])->name('docente.alumnos');
    Route::post('/docente/notas/update', [DocenteController::class, 'updateNotas'])->name('docente.notas.update');
});

require __DIR__.'/auth.php';
