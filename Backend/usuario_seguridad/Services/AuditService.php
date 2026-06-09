<?php

namespace Backend\usuario_seguridad\Services;

use Backend\usuario_seguridad\Models\Bitacora;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Carbon\Carbon;

class AuditService
{
    /**
     * Registra un evento en la Bitácora.
     *
     * @param string $accion El nombre corto de la acción (Ej. 'Inicio de sesión exitoso')
     * @param string|null $detalle Opcional. Descripción detallada de la acción.
     * @return void
     */
    public static function log($accion, $detalle = null)
    {
        try {
            Bitacora::create([
                'usuario_id' => Auth::check() ? Auth::id() : null,
                'accion'     => $accion,
                'detalle'    => $detalle,
                'ip'         => Request::ip(),
                'fecha_hora' => Carbon::now()
            ]);
        } catch (\Exception $e) {
            // Ignorar errores de auditoría para no bloquear el flujo principal,
            // Opcionalmente se puede registrar en logs nativos de Laravel.
            \Log::error('Error guardando bitácora: ' . $e->getMessage());
        }
    }
}
