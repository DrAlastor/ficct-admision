<?php

use Backend\Modulo1_Seguridad\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Backend\Modulo2_Admision\Controllers\PostulanteRegistroController;

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

use Backend\Modulo1_Seguridad\Controllers\DashboardController;

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [Backend\Modulo1_Seguridad\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [Backend\Modulo1_Seguridad\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [Backend\Modulo1_Seguridad\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');
});

use Backend\Modulo4_AulaVirtual\Controllers\DocenteController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/docente/grupo/{id}/alumnos', [DocenteController::class, 'getAlumnos'])->name('docente.alumnos');
    Route::post('/docente/notas/update', [DocenteController::class, 'updateNotas'])->name('docente.notas.update');
});

require __DIR__.'/auth.php';
