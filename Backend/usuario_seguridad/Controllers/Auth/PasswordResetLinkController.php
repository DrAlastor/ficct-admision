<?php

namespace Backend\usuario_seguridad\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Muestra la vista para solicitar un enlace de restablecimiento de contraseña.
     * Esta vista contiene un formulario donde el usuario ingresa su correo electrónico.
     *
     * @return \Inertia\Response
     */
    public function create(): Response
    {
        return Inertia::render('Modulos/usuario_seguridad/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Procesa la solicitud para enviar el enlace de recuperación de contraseña.
     * Valida que el correo exista y usa la funcionalidad interna de Laravel para 
     * enviar el token seguro por email.
     *
     * @param Request $request Petición con el campo 'email'.
     * @return \Illuminate\Http\RedirectResponse
     * @throws ValidationException Si el correo no existe o no es válido.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('status', __($status));
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}
