<?php

namespace Backend\modulo_inscripcion\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Webhook;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Backend\modulo_inscripcion\Models\Pago;
use Illuminate\Support\Facades\Http;

/**
 * CU00 - Pagos Stripe
 */
class PaymentController extends Controller
{
    // ==========================================
    // STRIPE
    // ==========================================
    /**
     * Ejecuta la acción o procedimiento 'createPaymentIntent' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'postulacion_codigo' => 'required|integer',
            'monto' => 'required|numeric'
        ]);

        Stripe::setApiKey(env('STRIPE_SECRET'));

        try {
            // El monto en Stripe es en centavos, así que multiplicamos por 100
            $amountInCents = intval(round($request->monto * 100));

            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => 'bob', // O usd, dependiendo de la configuración de Stripe
                'metadata' => [
                    'postulacion_codigo' => $request->postulacion_codigo
                ],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
            ]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Ejecuta la acción o procedimiento 'stripeWebhook' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function stripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = env('STRIPE_WEBHOOK_SECRET', '');

        try {
            // Si hay un webhook secret configurado en el .env, validamos la firma
            if ($endpointSecret !== '') {
                $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
            } else {
                // Si no hay secret, simplemente parseamos el JSON (Para entornos locales rápidos sin CLI)
                $event = json_decode($payload);
            }
        } catch (\Exception $e) {
            Log::error('Stripe Webhook Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }

        // Manejar el evento
        if ($event->type == 'payment_intent.succeeded') {
            $paymentIntent = $event->data->object;
            $postulacionCodigo = $paymentIntent->metadata->postulacion_codigo ?? null;
            $transaccionId = $paymentIntent->id;
            
            if ($postulacionCodigo) {
                // Marcar el pago como Completado y crear el registro
                $this->registrarPagoExitoso($postulacionCodigo, $transaccionId, 'Stripe (Tarjetas)', $paymentIntent->amount / 100);
            }
        }

        return response()->json(['status' => 'success'], 200);
    }

    // ==========================================
    // PAYPAL
    // ==========================================
    /**
     * Ejecuta la acción o procedimiento 'getPayPalAccessToken' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    private function getPayPalAccessToken()
    {
        $clientId = env('PAYPAL_CLIENT_ID');
        $secret = env('PAYPAL_SECRET');

        Log::info('PayPal: Solicitando access token...', ['client_id_prefix' => substr($clientId ?? '', 0, 10)]);

        $response = Http::withoutVerifying()
            ->withBasicAuth($clientId, $secret)
            ->asForm()
            ->post('https://api-m.sandbox.paypal.com/v1/oauth2/token', [
                'grant_type' => 'client_credentials',
            ]);

        if ($response->successful()) {
            Log::info('PayPal: Access token obtenido exitosamente.');
            return $response->json()['access_token'];
        }

        Log::error('PayPal: Error obteniendo access token', ['status' => $response->status(), 'body' => $response->body()]);
        throw new \Exception('No se pudo obtener el Access Token de PayPal. Status: ' . $response->status());
    }

    /**
     * Ejecuta la acción o procedimiento 'createPayPalOrder' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function createPayPalOrder(Request $request)
    {
        $request->validate([
            'postulacion_codigo' => 'required|integer',
            'monto' => 'required|numeric'
        ]);

        try {
            $accessToken = $this->getPayPalAccessToken();

            $montoUSD = strval(round($request->monto / 6.96, 2));
            Log::info('PayPal: Creando orden', ['monto_bob' => $request->monto, 'monto_usd' => $montoUSD, 'postulacion' => $request->postulacion_codigo]);

            $response = Http::withoutVerifying()
                ->withToken($accessToken)
                ->post('https://api-m.sandbox.paypal.com/v2/checkout/orders', [
                    'intent' => 'CAPTURE',
                    'purchase_units' => [
                        [
                            'reference_id' => strval($request->postulacion_codigo),
                            'amount' => [
                                'currency_code' => 'USD',
                                'value' => $montoUSD
                            ]
                        ]
                    ]
                ]);

            if ($response->successful()) {
                Log::info('PayPal: Orden creada exitosamente', ['order_id' => $response->json()['id'] ?? 'N/A']);
                return response()->json($response->json());
            }

            Log::error('PayPal: Error creando orden', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['error' => 'Error de PayPal: ' . $response->body()], 500);
        } catch (\Exception $e) {
            Log::error('PayPal: Excepción en createPayPalOrder', ['message' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Ejecuta la acción o procedimiento 'capturePayPalOrder' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function capturePayPalOrder(Request $request)
    {
        $request->validate([
            'order_id' => 'required|string',
            'postulacion_codigo' => 'required|integer'
        ]);

        try {
            $accessToken = $this->getPayPalAccessToken();

            $response = Http::withoutVerifying()
                ->withToken($accessToken)
                ->post("https://api-m.sandbox.paypal.com/v2/checkout/orders/{$request->order_id}/capture", [
                    'headers' => [
                        'Content-Type' => 'application/json'
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['status'] === 'COMPLETED') {
                    // Obtener el monto (en PayPal está en USD generalmente, lo guardamos tal cual o hacemos conversión)
                    $montoCapturado = $data['purchase_units'][0]['payments']['captures'][0]['amount']['value'];
                    
                    // Convertir de vuelta a BOB si es necesario (ej: * 6.96)
                    $montoBob = round($montoCapturado * 6.96, 2);

                    $this->registrarPagoExitoso($request->postulacion_codigo, $request->order_id, 'PayPal', $montoBob);

                    return response()->json(['status' => 'COMPLETED']);
                }
            }

            return response()->json(['error' => 'La orden no pudo ser capturada.'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ==========================================
    // MÉTODO COMÚN PARA REGISTRAR PAGOS
    // ==========================================
    /**
     * Ejecuta la acción o procedimiento 'registrarPagoExitoso' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    private function registrarPagoExitoso($postulacionCodigo, $transaccionId, $metodoNombre, $monto)
    {
        // Verificar si ya existe el pago para no duplicar en webhooks
        $existe = Pago::where('transaccion_id', $transaccionId)->exists();
        if ($existe) return;

        DB::beginTransaction();
        try {
            Pago::create([
                'postulacion_codigo' => $postulacionCodigo,
                'nro_recibo' => 'REC-' . rand(10000, 99999),
                'monto' => $monto,
                'metodo_pago' => $metodoNombre,
                'transaccion_id' => $transaccionId,
                'estado' => 'Completado',
                'fecha' => now()->toDateString()
            ]);

            // No finalizamos la inscripción aquí; el administrador la aceptará manualmente.

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error registrando pago exitoso: ' . $e->getMessage());
        }
    }
}
