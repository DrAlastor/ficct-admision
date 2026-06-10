<?php

namespace Backend\modulo_inscripcion\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Mail\CredencialesPostulanteMail;
use Backend\modulo_inscripcion\Models\Usuario;
use Backend\modulo_inscripcion\Models\Perfil;
use Backend\modulo_inscripcion\Models\Postulante;
use Backend\modulo_inscripcion\Models\Postulacion;
use Backend\modulo_inscripcion\Models\Pago;
use Backend\modulo_inscripcion\Models\Documento;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;

class PostulanteRegistroController extends Controller
{
    /**
     * Renderiza la página principal de registro público para nuevos postulantes.
     * Esta vista incluye el formulario de datos, opciones de carrera y pago.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Modulos/modulo_inscripcion/Index');
    }

    /**
     * Procesa el primer paso del registro:
     * 1. Valida todos los datos demográficos y académicos del postulante.
     * 2. Sube los documentos adjuntos (CI y Título de Bachiller) a un bucket de AWS S3.
     * 3. Crea una sesión de pago segura mediante Stripe Checkout.
     * 4. Almacena temporalmente los datos en caché para usarlos tras el pago exitoso.
     *
     * @param Request $request Petición con formulario multipart/form-data.
     * @return \Illuminate\Http\JsonResponse Retorna la URL de Stripe para redirigir al usuario.
     */
    public function iniciarPago(Request $request)
    {
        // 1. Validar los datos del formulario entrante
        $request->validate([
            'nombres' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'ci' => 'required|string|max:20|unique:perfil,ci',
            'email' => 'required|email|unique:usuario,correo',
            'fecha_nacimiento' => 'required|date',
            'nacionalidad' => 'required|string|max:50',
            'sexo' => 'required|in:M,F',
            'direccion' => 'required|string',
            'telefono' => 'required|string|max:20',
            'carrera_opcion1' => 'required|integer',
            'carrera_opcion2' => 'required|integer|different:carrera_opcion1',
            'turno_sugerido' => 'required|string',
            'tipo_colegio' => 'required|string|in:Fiscal,Convenio,Privado,CEA / Alternativo',
            'documento_ci' => 'required|file|mimes:pdf,jpg,png|max:2048',
            'documento_bachiller' => 'required|file|mimes:pdf,jpg,png|max:2048',
        ]);

        // 2. Guardar los documentos directamente en AWS S3 (Bucket de archivos)
        $rutaCI = $request->file('documento_ci')->store('postulantes-ficct/ci', 's3_archivos');
        $rutaBachiller = $request->file('documento_bachiller')->store('postulantes-ficct/bachiller', 's3_archivos');

        // 3. Guardar los datos en la sesión temporalmente mientras el usuario paga
        $datosPostulante = $request->except(['documento_ci', 'documento_bachiller']);
        $datosPostulante['ruta_ci'] = $rutaCI;
        $datosPostulante['ruta_bachiller'] = $rutaBachiller;
        
        session(['datos_postulante' => $datosPostulante]);

        // 4. Configurar la clave secreta de Stripe
        Stripe::setApiKey(env('STRIPE_SECRET'));

        // 5. Crear la Sesión de Pago (Checkout)
        $checkoutSession = StripeSession::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'bob', 
                    'product_data' => [
                        'name' => 'Inscripción CUP - FICCT',
                        'description' => 'Pago de postulación para el Curso Preuniversitario',
                    ],
                    // Stripe maneja todo en centavos. 700 Bs = 70000 centavos
                    'unit_amount' => 70000, 
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            // URLs de redirección tras el pago
            'success_url' => route('registro.exito') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('registro.create'),
        ]);

        // 6. Devolver la URL al frontend de React para redirigir al usuario
        return response()->json(['url' => $checkoutSession->url]);
    }
    
    /**
     * Callback de confirmación tras un pago exitoso en Stripe (Paso 2):
     * 1. Verifica la validez de la sesión con la API de Stripe.
     * 2. Inicia una transacción para generar Perfil, Usuario, Postulación y Pagos en BD.
     * 3. Registra las opciones de carrera (prioridad 1 y 2).
     * 4. Envia un correo electrónico con el código generado y la contraseña por defecto.
     * 5. Redirige a la pantalla de Login con un mensaje de éxito.
     *
     * @param Request $request Petición HTTP con el parámetro `session_id` de Stripe.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function exitoPago(Request $request)
    {
        $sessionId = $request->query('session_id');
        $datosPostulante = session('datos_postulante');

        // Si no hay sesión de Stripe o faltan los datos, redirigir al inicio
        if (!$sessionId || !$datosPostulante) {
            return redirect()->route('registro.create')->withErrors(['error' => 'Sesión inválida o expirada.']);
        }

        Stripe::setApiKey(env('STRIPE_SECRET'));

        try {
            // Verificar el estado de la sesión en Stripe
            $sessionStripe = StripeSession::retrieve($sessionId);

            if ($sessionStripe->payment_status !== 'paid') {
                return redirect()->route('registro.create')->withErrors(['error' => 'El pago no se completó.']);
            }

            // Usar una transacción de BD para asegurar que todos los datos se guarden correctamente
            DB::beginTransaction();

            // 1. Generar el Código de Postulante (Ej. POS26059999)
            $codigoPostulante = 'POS' . date('ym') . rand(1000, 9999);

            // 2. Crear el Usuario (Autenticación)
            $usuario = Usuario::create([
                'codigo_inicio' => $codigoPostulante,
                'password' => Hash::make($datosPostulante['ci']), 
                'estado' => 'Activo',
                'rol_id' => 3 
            ]);

            // 3. Crear el Perfil (Demografía)
            $perfil = Perfil::create([
                'usuario_id' => $usuario->id,
                'codigo' => $codigoPostulante,
                'ci' => $datosPostulante['ci'],
                'nombres' => $datosPostulante['nombres'],
                'apellido_paterno' => $datosPostulante['apellido_paterno'],
                'apellido_materno' => $datosPostulante['apellido_materno'] ?? null,
                'fecha_nacimiento' => $datosPostulante['fecha_nacimiento'],
                'nacionalidad' => $datosPostulante['nacionalidad'],
                'sexo' => $datosPostulante['sexo'],
                'direccion' => $datosPostulante['direccion'],
                'telefono' => $datosPostulante['telefono'],
                'email' => $datosPostulante['email']
            ]);

            // 3.1 Crear el registro específico de Postulante
            $postulante = Postulante::create([
                'id' => $perfil->id,
                'colegio_procedencia' => $datosPostulante['tipo_colegio'] ?? null,
                'ciudad' => null
            ]);

            // 4. Crear la Postulación (Gestión actual)
            $postulacion = Postulacion::create([
                'postulante_id' => $postulante->id,
                'gestion_id' => 1, // Se debe asignar dinámicamente según la gestión activa
                'fecha' => now()->toDateString(),
                'hora' => now()->toTimeString(),
                'estado' => 'Habilitado CUP'
            ]);

            // 4.1 Registrar las Preferencias de Carrera (CU-09)
            DB::table('postulacion_carrera')->insert([
                [
                    'postulacion_codigo' => $postulacion->codigo,
                    'carrera_codigo' => $datosPostulante['carrera_opcion1'],
                    'prioridad' => 1
                ],
                [
                    'postulacion_codigo' => $postulacion->codigo,
                    'carrera_codigo' => $datosPostulante['carrera_opcion2'],
                    'prioridad' => 2
                ]
            ]);

            // 5. Registrar los Documentos Subidos
            Documento::create([
                'postulacion_codigo' => $postulacion->codigo,
                'tipo_documento' => 'Carnet Identidad',
                'url_archivo' => $datosPostulante['ruta_ci'],
                'estado_validacion' => 'PENDIENTE'
            ]);

            Documento::create([
                'postulacion_codigo' => $postulacion->codigo,
                'tipo_documento' => 'Certificado Bachiller',
                'url_archivo' => $datosPostulante['ruta_bachiller'],
                'estado_validacion' => 'PENDIENTE'
            ]);

            // 6. Registrar el Pago Exitoso
            Pago::create([
                'postulacion_codigo' => $postulacion->codigo,
                'nro_recibo' => 'REC-' . rand(10000, 99999),
                'monto' => 700.00,
                'metodo_pago' => 'Stripe',
                'transaccion_id' => $sessionStripe->payment_intent,
                'estado' => 'Completado',
                'fecha' => now()->toDateString()
            ]);

            DB::commit();

            // 7. Enviar Correo con las credenciales
            Mail::to($datosPostulante['email'])->send(new CredencialesPostulanteMail(
                $codigoPostulante, 
                $datosPostulante['ci'], 
                $datosPostulante['nombres']
            ));

            // Limpiar la sesión temporal
            session()->forget('datos_postulante');

            // 8. Redirigir al login con mensaje de éxito
            return redirect()->route('login')->with('success', 'Registro y pago completados con éxito. Revisa tu correo electrónico para obtener tus credenciales.');

        } catch (\Exception $e) {
            DB::rollBack();
            // En caso de error, puedes registrar en el log y devolver un mensaje
            return redirect()->route('registro.create')->withErrors(['error' => 'Ocurrió un error al procesar el registro: ' . $e->getMessage()]);
        }
    }
}
