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

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
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

        return Inertia::render('Modulos/usuario_seguridad/Edit', [
            'mustVerifyEmail' => false,
            'status' => session('status'),
            'perfil' => $perfil,
            'rol_id' => $usuario->rol_id
        ]);
    }

    /**
     * Update the user's profile information.
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
     * Delete the user's account.
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
