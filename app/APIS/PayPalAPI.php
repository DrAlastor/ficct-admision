<?php

namespace App\APIS;

use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Core\ProductionEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;
use PayPalCheckoutSdk\Orders\OrdersCaptureRequest;
use Illuminate\Support\Facades\DB;

class PayPalAPI
{
    /**
     * Devuelve el cliente HTTP configurado de PayPal
     */
    private static function getClient()
    {
        $config = DB::table('metodo_pago_config')
            ->where('nombre', 'PayPal')
            ->where('activo', true)
            ->first();

        if (!$config || empty($config->public_key) || empty($config->secret_key)) {
            throw new \Exception("PayPal no está configurado o no está activo en el sistema.");
        }

        // Por defecto usaremos Sandbox. En producción cambiaríamos a ProductionEnvironment.
        $environment = new SandboxEnvironment($config->public_key, $config->secret_key);
        return new PayPalHttpClient($environment);
    }

    /**
     * Crea una orden de cobro en PayPal.
     *
     * @param float $monto El monto a cobrar (Ej. 300.00)
     * @param string $rutaExito URL completa de éxito
     * @param string $rutaCancelacion URL completa de cancelación
     * @return object Retorna la URL de redirección y el ID de la orden
     * @throws \Exception
     */
    public static function crearOrden($monto, $rutaExito, $rutaCancelacion)
    {
        $request = new OrdersCreateRequest();
        $request->prefer('return=representation');
        $request->body = [
            "intent" => "CAPTURE",
            "purchase_units" => [[
                "reference_id" => "CUP_" . uniqid(),
                "amount" => [
                    "value" => number_format($monto, 2, '.', ''), // PayPal usa formato texto '300.00'
                    "currency_code" => "USD" // PayPal no soporta BOB nativamente en todas las regiones, a menudo se usa USD u otra divisa compatible.
                ],
                "description" => "Inscripción CUP - FICCT"
            ]],
            "application_context" => [
                "cancel_url" => $rutaCancelacion,
                "return_url" => $rutaExito
            ] 
        ];

        try {
            $client = self::getClient();
            $response = $client->execute($request);
            
            $urlAprobacion = null;
            foreach ($response->result->links as $link) {
                if ($link->rel === 'approve') {
                    $urlAprobacion = $link->href;
                    break;
                }
            }

            return (object)[
                'url' => $urlAprobacion,
                'order_id' => $response->result->id
            ];
        } catch (\Exception $ex) {
            throw new \Exception("Error al comunicarse con PayPal: " . $ex->getMessage());
        }
    }

    /**
     * Verifica y captura una orden pagada exitosamente.
     *
     * @param string $orderId
     * @return object Retorna los detalles de la transacción
     * @throws \Exception
     */
    public static function capturarPago($orderId)
    {
        $config = DB::table('metodo_pago_config')
            ->where('nombre', 'PayPal')
            ->where('activo', true)
            ->first();

        if (!$config) {
            throw new \Exception("PayPal no está configurado.");
        }

        $request = new OrdersCaptureRequest($orderId);
        $request->prefer('return=representation');

        try {
            $client = self::getClient();
            $response = $client->execute($request);

            if ($response->result->status !== 'COMPLETED') {
                throw new \Exception("El pago de PayPal no se completó.");
            }

            // Obtener el ID real de la transacción capturada
            $captureId = $response->result->purchase_units[0]->payments->captures[0]->id;

            return (object)[
                'exito' => true,
                'transaccion_id' => $captureId,
                'metodo_id' => $config->id
            ];
        } catch (\Exception $ex) {
            throw new \Exception("Error al capturar el pago en PayPal: " . $ex->getMessage());
        }
    }
}
