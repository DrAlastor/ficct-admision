<?php

namespace Backend\modulo_inscripcion\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Mail\CredencialesPostulanteMail;
use Backend\usuario_seguridad\Models\Usuario;
use Backend\usuario_seguridad\Models\Perfil;
use Backend\modulo_inscripcion\Models\Postulante;
use Backend\modulo_inscripcion\Models\Postulacion;
use Backend\modulo_inscripcion\Models\Pago;
use Backend\modulo_inscripcion\Models\Documento;
use Inertia\Inertia;
use App\APIS\StripeAPI;
use App\APIS\PayPalAPI;

/**
 * CU00 - Registro de Postulantes
 */
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
        // Pasar el precio del concepto y los métodos activos al Frontend
        $concepto = DB::table('concepto_pago')->where('nombre', 'Matrícula CUP')->first();
        $precio = $concepto ? $concepto->monto : 700.00;

        $metodosActivos = DB::table('metodo_pago_config')
            ->where('activo', true)
            ->whereIn('nombre', ['Stripe (Tarjetas)', 'PayPal'])
            ->select('id', 'nombre')
            ->get();

        return Inertia::render('Modulos/modulo_inscripcion/RegistroCUP/Index', [
            'precio_matricula' => $precio,
            'metodos_activos' => $metodosActivos
        ]);
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
            'email' => 'required|email|unique:perfil,email',
            'fecha_nacimiento' => 'required|date',
            'nacionalidad' => 'required|string|max:50',
            'sexo' => 'required|in:M,F',
            'direccion' => 'required|string',
            'telefono' => 'required|string|max:20',
            'carrera_opcion1' => 'required|integer',
            'carrera_opcion2' => 'required|integer|different:carrera_opcion1',
            'turno_sugerido' => 'required|string',
            'tipo_colegio' => 'required|string|in:Fiscal,Convenio,Privado,CEA / Alternativo',
            'documento_requisitos' => 'required|file|mimes:pdf|max:10240',
        ]);

        // 2. Guardar el documento directamente en AWS S3 (Bucket de archivos)
        $rutaRequisitos = $request->file('documento_requisitos')->store('postulantes-ficct/requisitos', 's3_archivos');

        // 3. Guardar los datos en la sesión temporalmente mientras el usuario paga
        $datosPostulante = $request->except(['documento_requisitos']);
        $datosPostulante['ruta_requisitos'] = $rutaRequisitos;
        
        session(['datos_postulante' => $datosPostulante]);

        // 4. Obtener Concepto y Metodo de pago
        $concepto = DB::table('concepto_pago')->where('nombre', 'Matrícula CUP')->first();
        $monto = $concepto ? $concepto->monto : 700.00;
        $nombreConcepto = $concepto ? $concepto->descripcion : 'Pago de inscripción al CUP';

        $metodoSeleccionado = $request->input('metodo_pago'); // 'stripe' o 'paypal'

        try {
            if ($metodoSeleccionado === 'paypal') {
                $resultado = PayPalAPI::crearOrden(
                    $monto, 
                    route('registro.exito', ['metodo' => 'paypal']), 
                    route('registro.create')
                );
                // Guardar el order_id temporalmente para la validación después
                session(['paypal_order_id' => $resultado->order_id]);
                return response()->json(['url' => $resultado->url]);
            } else {
                // Por defecto Stripe
                $urlStripe = StripeAPI::crearSesion(
                    $monto, 
                    $nombreConcepto, 
                    route('registro.exito', ['metodo' => 'stripe']), 
                    route('registro.create')
                );
                return response()->json(['url' => $urlStripe]);
            }
        } catch (\Exception $e) {
            return response()->json(['errors' => ['general' => $e->getMessage()]], 422);
        }
    }
    
    /**
     * Ejecuta la acción o procedimiento 'procesarPagoFicticio' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function procesarPagoFicticio(Request $request)
    {
        $request->validate([
            'postulacion_codigo' => 'required|integer',
            'metodo_pago' => 'nullable|string' // Aceptamos el metodo de pago (Stripe o Paypal) del frontend
        ]);

        try {
            DB::beginTransaction();

            $concepto = DB::table('concepto_pago')->where('nombre', 'Matrícula CUP')->first();
            $monto = $concepto ? $concepto->monto : 700.00;

            // Nombre del método de pago para el historial
            $nombreMetodo = $request->metodo_pago ? $request->metodo_pago . ' (Bypass)' : 'Bypass Ficticio';

            // Verificar si ya existe un pago
            $existe = \Backend\modulo_inscripcion\Models\Pago::where('postulacion_codigo', $request->postulacion_codigo)->exists();
            
            if (!$existe) {
                \Backend\modulo_inscripcion\Models\Pago::create([
                    'postulacion_codigo' => $request->postulacion_codigo,
                    'nro_recibo' => 'REC-FIC-' . rand(10000, 99999),
                    'monto' => $monto,
                    'metodo_pago' => $nombreMetodo,
                    'transaccion_id' => 'bypass_' . uniqid(),
                    'estado' => 'Completado',
                    'fecha' => now()->toDateString()
                ]);

                // No llamamos a finalizarInscripcionPagada aquí, la postulación queda en Pendiente
                // para que el administrador la acepte manualmente.
            }

            DB::commit();

            return response()->json([
                'success' => true
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Ejecuta la acción o procedimiento 'iniciarInscripcion' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function iniciarInscripcion(Request $request)
    {
        $request->validate([
            'nombres' => 'required|string|max:100',
            'apellido_paterno' => 'required|string|max:100',
            'apellido_materno' => 'nullable|string|max:100',
            'ci' => 'required|string|max:20',
            'email' => 'required|email',
            'fecha_nacimiento' => 'required|date',
            'nacionalidad' => 'required|string|max:50',
            'sexo' => 'required|in:M,F',
            'direccion' => 'required|string',
            'telefono' => 'required|string|max:20',
            'carrera_opcion1' => 'required|integer',
            'carrera_opcion2' => 'required|integer|different:carrera_opcion1',
            'turno_sugerido' => 'required|string',
            'tipo_colegio' => 'required|string|in:Fiscal,Convenio,Privado,CEA / Alternativo',
            'documento_requisitos' => 'required|file|mimes:pdf|max:10240'
        ]);

        try {
            DB::beginTransaction();

            // Verificación manual de duplicidad y sobreescritura
            $perfilExistente = \Backend\usuario_seguridad\Models\Perfil::where('ci', $request->ci)->orWhere('email', $request->email)->first();
            $postulacion = null;

            $rutaRequisitos = $request->file('documento_requisitos')->store('postulantes-ficct/requisitos', 's3_archivos');

            if ($perfilExistente) {
                // Verificar si ya tiene una postulación pagada/aceptada
                $postulacionExistente = Postulacion::where('postulante_id', $perfilExistente->id)->latest('codigo')->first();
                
                // Si la postulación ya no está Pendiente (ya pagó o fue aceptado), bloqueamos el registro
                if ($postulacionExistente && $postulacionExistente->estado !== 'Pendiente') {
                    return response()->json(['errors' => [
                        'ci' => ['El Carnet de Identidad o Correo ya se encuentran registrados y en proceso de revisión.'],
                        'email' => ['El Carnet de Identidad o Correo ya se encuentran registrados y en proceso de revisión.']
                    ]], 422);
                }
                
                // Si existe pero está "Pendiente" (no ha pagado), SOBREESCRIBIMOS
                $perfilExistente->update([
                    'nombres' => $request->nombres,
                    'apellido_paterno' => $request->apellido_paterno,
                    'apellido_materno' => $request->apellido_materno ?? null,
                    'fecha_nacimiento' => $request->fecha_nacimiento,
                    'nacionalidad' => $request->nacionalidad,
                    'sexo' => $request->sexo,
                    'direccion' => $request->direccion,
                    'telefono' => $request->telefono,
                    // No sobreescribimos 'codigo' ni 'ci' ni 'email' si no es necesario (pero email y ci fueron usados en la búsqueda, asumimos que son iguales. Wait, orWhere means one of them could be different! So we should update both!)
                    'ci' => $request->ci,
                    'email' => $request->email,
                ]);

                $postulante = Postulante::find($perfilExistente->id);
                if ($postulante) {
                    $postulante->update(['colegio_procedencia' => $request->tipo_colegio]);
                } else {
                    $postulante = Postulante::create([
                        'id' => $perfilExistente->id,
                        'colegio_procedencia' => $request->tipo_colegio,
                        'ciudad' => null
                    ]);
                }

                $postulacion = $postulacionExistente;
                if (!$postulacion) {
                    $postulacion = Postulacion::create([
                        'postulante_id' => $postulante->id,
                        'gestion_id' => 1,
                        'fecha' => now()->toDateString(),
                        'hora' => now()->toTimeString(),
                        'estado' => 'Pendiente'
                    ]);
                }

                // Actualizar documento
                $documento = Documento::where('postulacion_codigo', $postulacion->codigo)->first();
                if ($documento) {
                    $documento->update(['url_archivo' => $rutaRequisitos]);
                } else {
                    Documento::create([
                        'postulacion_codigo' => $postulacion->codigo,
                        'tipo_documento' => 'Requisitos Completos CUP',
                        'url_archivo' => $rutaRequisitos,
                        'estado_validacion' => 'Pendiente'
                    ]);
                }

                // Actualizar carreras
                DB::table('postulacion_carrera')->where('postulacion_codigo', $postulacion->codigo)->delete();
                DB::table('postulacion_carrera')->insert([
                    ['postulacion_codigo' => $postulacion->codigo, 'carrera_codigo' => $request->carrera_opcion1, 'prioridad' => 1],
                    ['postulacion_codigo' => $postulacion->codigo, 'carrera_codigo' => $request->carrera_opcion2, 'prioridad' => 2]
                ]);

            } else {
                // FLUJO NORMAL PARA NUEVOS USUARIOS
                $siguienteId = \Backend\usuario_seguridad\Models\Perfil::max('id') + 1;
                $codigoPostulante = 'POS' . date('ym') . str_pad($siguienteId, 4, '0', STR_PAD_LEFT);

                $perfilExistente = \Backend\usuario_seguridad\Models\Perfil::create([
                    'usuario_id' => null, // NO creamos usuario todavía!
                    'codigo' => $codigoPostulante,
                    'ci' => $request->ci,
                    'nombres' => $request->nombres,
                    'apellido_paterno' => $request->apellido_paterno,
                    'apellido_materno' => $request->apellido_materno ?? null,
                    'fecha_nacimiento' => $request->fecha_nacimiento,
                    'nacionalidad' => $request->nacionalidad,
                    'sexo' => $request->sexo,
                    'direccion' => $request->direccion,
                    'telefono' => $request->telefono,
                    'email' => $request->email,
                    'cargo' => 'POSTULANTE'
                ]);

                $postulante = Postulante::create([
                    'id' => $perfilExistente->id,
                    'colegio_procedencia' => $request->tipo_colegio,
                    'ciudad' => null
                ]);

                $postulacion = Postulacion::create([
                    'postulante_id' => $postulante->id,
                    'gestion_id' => 1,
                    'fecha' => now()->toDateString(),
                    'hora' => now()->toTimeString(),
                    'estado' => 'Pendiente'
                ]);

                DB::table('postulacion_carrera')->insert([
                    ['postulacion_codigo' => $postulacion->codigo, 'carrera_codigo' => $request->carrera_opcion1, 'prioridad' => 1],
                    ['postulacion_codigo' => $postulacion->codigo, 'carrera_codigo' => $request->carrera_opcion2, 'prioridad' => 2]
                ]);

                Documento::create([
                    'postulacion_codigo' => $postulacion->codigo,
                    'tipo_documento' => 'Requisitos Completos CUP',
                    'url_archivo' => $rutaRequisitos,
                    'estado_validacion' => 'Pendiente'
                ]);
            }

            DB::commit();

            $concepto = DB::table('concepto_pago')->where('nombre', 'Matrícula CUP')->first();
            $monto = $concepto ? $concepto->monto : 700.00;

            return response()->json([
                'success' => true,
                'postulacion_codigo' => $postulacion->codigo,
                'monto' => $monto
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Ejecuta la acción o procedimiento 'consultarRegistro' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function consultarRegistro(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        $perfil = Perfil::where('email', $request->email)->first();
        if (!$perfil) {
            return response()->json(['status' => 'No encontrado']);
        }
        
        $postulante = Postulante::find($perfil->id);
        $postulacion = Postulacion::where('postulante_id', $postulante->id)->orderBy('codigo', 'desc')->first();
        
        if (!$postulacion) {
            return response()->json(['status' => 'No encontrado']);
        }

        if ($postulacion->estado === 'Pendiente') {
            return response()->json(['status' => 'Pendiente']);
        }

        if ($postulacion->estado === 'Habilitado CUP' || $postulacion->estado === 'Aceptado') {
            // Usuario ya debe estar creado
            return response()->json([
                'status' => 'Aceptado',
                'codigo' => $perfil->codigo,
                'password' => $perfil->ci
            ]);
        }
        
        return response()->json(['status' => $postulacion->estado]);
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
        $metodo = $request->query('metodo', 'stripe');
        $datosPostulante = session('datos_postulante');

        if (!$datosPostulante) {
            return redirect()->route('registro.create')->withErrors(['error' => 'Sesión inválida o expirada.']);
        }

        try {
            $transaccion = null;

            if ($metodo === 'paypal') {
                $orderId = session('paypal_order_id');
                if (!$orderId) throw new \Exception("ID de orden de PayPal no encontrado en sesión.");
                
                // token param is implicitly passed by paypal in url but we capture with orderId
                $token = $request->query('token');
                if ($token && $token !== $orderId) {
                    $orderId = $token; 
                }

                $transaccion = PayPalAPI::capturarPago($orderId);
            } else {
                $sessionId = $request->query('session_id');
                if (!$sessionId) throw new \Exception("ID de sesión de Stripe no encontrado.");
                
                $transaccion = StripeAPI::verificarPago($sessionId);
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

            // 5. Registrar el Documento Subido
            Documento::create([
                'postulacion_codigo' => $postulacion->codigo,
                'tipo_documento' => 'Requisitos Completos CUP',
                'url_archivo' => $datosPostulante['ruta_requisitos'],
                'estado_validacion' => 'Subido'
            ]);

            // 6. Registrar el Pago Exitoso
            $concepto = DB::table('concepto_pago')->where('nombre', 'Matrícula CUP')->first();
            $monto = $concepto ? $concepto->monto : 700.00;

            Pago::create([
                'postulacion_codigo' => $postulacion->codigo,
                'nro_recibo' => 'REC-' . rand(10000, 99999),
                'monto' => $monto,
                'metodo_pago_id' => $transaccion->metodo_id,
                'transaccion_id' => $transaccion->transaccion_id,
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
