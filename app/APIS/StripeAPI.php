<?php

namespace App\APIS;

use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;
use Illuminate\Support\Facades\DB;

class StripeAPI
{
    /**
     * Crea una sesión segura de Stripe Checkout.
     *
     * @param float $monto El monto a cobrar (Ej. 300.00)
     * @param string $nombreConcepto El nombre de lo que se está cobrando
     * @param string $rutaExito URL completa de éxito
     * @param string $rutaCancelacion URL completa de cancelación
     * @return string La URL de redirección a Stripe
     * @throws \Exception
     */
    public static function crearSesion($monto, $nombreConcepto, $rutaExito, $rutaCancelacion)
    {
        // Obtener la llave privada desde la configuración de la BD
        $config = DB::table('metodo_pago_config')
            ->where('nombre', 'Stripe (Tarjetas)')
            ->where('activo', true)
            ->first();

        if (!$config || empty($config->secret_key)) {
            throw new \Exception("Stripe no está configurado o no está activo en el sistema.");
        }

        Stripe::setApiKey($config->secret_key);

        // Convertir monto a centavos (Stripe lo exige así)
        $centavos = intval($monto * 100);

        $checkoutSession = StripeSession::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'bob', 
                    'product_data' => [
                        'name' => 'Inscripción CUP - FICCT',
                        'description' => $nombreConcepto,
                    ],
                    'unit_amount' => $centavos, 
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => $rutaExito . '&session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $rutaCancelacion,
        ]);

        return $checkoutSession->url;
    }

    /**
     * Verifica si una sesión fue pagada exitosamente.
     *
     * @param string $sessionId
     * @return object Retorna los detalles de la transacción
     * @throws \Exception
     */
    public static function verificarPago($sessionId)
    {
        $config = DB::table('metodo_pago_config')
            ->where('nombre', 'Stripe (Tarjetas)')
            ->where('activo', true)
            ->first();

        if (!$config || empty($config->secret_key)) {
            throw new \Exception("Stripe no está configurado o no está activo en el sistema.");
        }

        Stripe::setApiKey($config->secret_key);
        
        $sessionStripe = StripeSession::retrieve($sessionId);

        if ($sessionStripe->payment_status !== 'paid') {
            throw new \Exception("El pago fue rechazado o no se ha completado.");
        }

        return (object)[
            'exito' => true,
            'transaccion_id' => $sessionStripe->payment_intent,
            'metodo_id' => $config->id
        ];
    }
}
