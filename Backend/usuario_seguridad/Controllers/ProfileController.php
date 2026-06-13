<?php

namespace Backend\usuario_seguridad\Controllers;

use App\Http\Controllers\Controller;
use Backend\usuario_seguridad\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

/**
 * CU05 - Consultar Perfil
 */
class ProfileController extends Controller
{
    /**
     * Muestra la información personal del perfil del usuario logueado (Solo Lectura).
     * Si el usuario es Postulante o Docente, añade datos adicionales específicos de su rol
     * (Ej. Colegio de procedencia para postulantes, profesión para docentes).
     *
     * @param Request $request Petición HTTP para extraer el usuario autenticado.
     * @return \Inertia\Response
     */
    public function show(Request $request): Response
    {
        $usuario = $request->user();
        $perfil = clone $usuario->perfil;

        // Optionally load more data based on role
        if ($usuario->rol_id == 3) {
            $postulante = \Backend\modulo_inscripcion\Models\Postulante::find($perfil->id);
            if ($postulante) {
                $perfil->colegio_procedencia = $postulante->colegio_procedencia;
                $perfil->ciudad = $postulante->ciudad;
            }
        } elseif ($usuario->rol_id == 2) {
            $docente = \Backend\modulo_docencia\Models\Docente::find($perfil->id);
            if ($docente) {
                $perfil->profesion = $docente->profesion;
                $perfil->area_profesional = $docente->area_profesional;
            }
        }

        return Inertia::render('Modulos/usuario_seguridad/ShowProfile', [
            'perfil' => $perfil,
            'rol_id' => $usuario->rol_id
        ]);
    }

    /**
     * Devuelve la vista que contiene el formulario para actualizar la contraseña 
     * y datos básicos del usuario.
     *
     * @param Request $request Petición HTTP.
     * @return \Inertia\Response
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Modulos/usuario_seguridad/Edit', [
            'status' => session('status')
        ]);
    }

    /**
     * Actualiza la información básica del perfil del usuario desde las configuraciones.
     * En este proyecto el formulario suele usarse solo para contraseñas, pero Laravel 
     * lo expone por defecto para editar perfil (Email, Nombres).
     *
     * @param ProfileUpdateRequest $request Petición validada.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Elimina permanentemente la cuenta del usuario actual.
     * Se requiere ingresar la contraseña actual para confirmar la acción.
     *
     * @param Request $request Petición HTTP con la contraseña.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
