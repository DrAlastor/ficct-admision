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
            ->select('id', 'nombre', 'public_key')
            ->get();

        // Extraer las claves públicas para pasarlas al modal de pago
        $stripeKey = $metodosActivos->firstWhere('nombre', 'Stripe (Tarjetas)')->public_key ?? null;
        $paypalClientId = $metodosActivos->firstWhere('nombre', 'PayPal')->public_key ?? null;

        return Inertia::render('Modulos/modulo_inscripcion/RegistroCUP/Index', [
            'precio_matricula' => $precio,
            'metodos_activos' => $metodosActivos,
            'stripe_key' => $stripeKey,
            'paypal_client_id' => $paypalClientId
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
            'postulacion_codigo' => 'required|integer'
        ]);

        try {
            DB::beginTransaction();

            $concepto = DB::table('concepto_pago')->where('nombre', 'Matrícula CUP')->first();
            $monto = $concepto ? $concepto->monto : 700.00;

            // Verificar si ya existe un pago
            $existe = \Backend\modulo_inscripcion\Models\Pago::where('postulacion_codigo', $request->postulacion_codigo)->exists();
            
            if (!$existe) {
                \Backend\modulo_inscripcion\Models\Pago::create([
                    'postulacion_codigo' => $request->postulacion_codigo,
                    'nro_recibo' => 'REC-FIC-' . rand(10000, 99999),
                    'monto' => $monto,
                    'metodo_pago' => 'Bypass Ficticio',
                    'transaccion_id' => 'bypass_' . uniqid(),
                    'estado' => 'Completado',
                    'fecha' => now()->toDateString()
                ]);
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

            // Obtener la gestión actual (la más reciente)
            $gestionActual = DB::table('gestion')->orderByDesc('id')->first();
            $gestionId = $gestionActual ? $gestionActual->id : 1;

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
                        'gestion_id' => $gestionId,
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

                $perfilExistente = new \Backend\usuario_seguridad\Models\Perfil();
                $perfilExistente->id = $siguienteId;
                $perfilExistente->usuario_id = null; // NO creamos usuario todavía!
                $perfilExistente->codigo = $codigoPostulante;
                $perfilExistente->ci = $request->ci;
                $perfilExistente->nombres = $request->nombres;
                $perfilExistente->apellido_paterno = $request->apellido_paterno;
                $perfilExistente->apellido_materno = $request->apellido_materno ?? null;
                $perfilExistente->fecha_nacimiento = $request->fecha_nacimiento;
                $perfilExistente->nacionalidad = $request->nacionalidad;
                $perfilExistente->sexo = $request->sexo;
                $perfilExistente->direccion = $request->direccion;
                $perfilExistente->telefono = $request->telefono;
                $perfilExistente->email = $request->email;
                $perfilExistente->cargo = 'POSTULANTE';
                $perfilExistente->save();

                $postulante = new Postulante();
                $postulante->id = $perfilExistente->id;
                $postulante->colegio_procedencia = $request->tipo_colegio;
                $postulante->ciudad = null;
                $postulante->save();

                $postulacion = new Postulacion();
                $postulacion->codigo = Postulacion::max('codigo') + 1;
                $postulacion->postulante_id = $postulante->id;
                $postulacion->gestion_id = $gestionId;
                $postulacion->fecha = now()->toDateString();
                $postulacion->hora = now()->toTimeString();
                $postulacion->estado = 'Pendiente';
                $postulacion->save();

                DB::table('postulacion_carrera')->insert([
                    ['postulacion_codigo' => $postulacion->codigo, 'carrera_codigo' => $request->carrera_opcion1, 'prioridad' => 1],
                    ['postulacion_codigo' => $postulacion->codigo, 'carrera_codigo' => $request->carrera_opcion2, 'prioridad' => 2]
                ]);

                $documento = new Documento();
                $documento->id = Documento::max('id') + 1;
                $documento->postulacion_codigo = $postulacion->codigo;
                $documento->tipo_documento = 'Requisitos Completos CUP';
                $documento->url_archivo = $rutaRequisitos;
                $documento->estado_validacion = 'Pendiente';
                $documento->save();
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
            $siguienteId = \Backend\usuario_seguridad\Models\Perfil::max('id') + 1;
            $codigoPostulante = 'POS' . date('ym') . str_pad($siguienteId, 4, '0', STR_PAD_LEFT);

            // 2. Crear el Usuario (Autenticación)
            $usuario = new Usuario();
            $usuario->id = Usuario::max('id') + 1;
            $usuario->codigo_inicio = $codigoPostulante;
            $usuario->password = Hash::make($datosPostulante['ci']);
            $usuario->estado = 'Inactivo';
            $usuario->rol_id = 4;
            $usuario->save();

            // 3. Crear el Perfil (Demografía)
            $perfil = new Perfil();
            $perfil->id = $siguienteId;
            $perfil->usuario_id = $usuario->id;
            $perfil->codigo = $codigoPostulante;
            $perfil->ci = $datosPostulante['ci'];
            $perfil->nombres = $datosPostulante['nombres'];
            $perfil->apellido_paterno = $datosPostulante['apellido_paterno'];
            $perfil->apellido_materno = $datosPostulante['apellido_materno'] ?? null;
            $perfil->fecha_nacimiento = $datosPostulante['fecha_nacimiento'];
            $perfil->nacionalidad = $datosPostulante['nacionalidad'];
            $perfil->sexo = $datosPostulante['sexo'];
            $perfil->direccion = $datosPostulante['direccion'];
            $perfil->telefono = $datosPostulante['telefono'];
            $perfil->email = $datosPostulante['email'];
            $perfil->save();

            // 3.1 Crear el registro específico de Postulante
            $postulante = new Postulante();
            $postulante->id = $perfil->id;
            $postulante->colegio_procedencia = $datosPostulante['tipo_colegio'] ?? null;
            $postulante->ciudad = null;
            $postulante->save();

            // 4. Crear la Postulación (Gestión actual)
            $gestionActual = DB::table('gestion')->orderByDesc('id')->first();
            $gestionId = $gestionActual ? $gestionActual->id : 1;
            
            $postulacion = new Postulacion();
            $postulacion->codigo = Postulacion::max('codigo') + 1;
            $postulacion->postulante_id = $postulante->id;
            $postulacion->gestion_id = $gestionId;
            $postulacion->fecha = now()->toDateString();
            $postulacion->hora = now()->toTimeString();
            $postulacion->estado = 'Habilitado CUP';
            $postulacion->save();

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
            $documento = new Documento();
            $documento->id = Documento::max('id') + 1;
            $documento->postulacion_codigo = $postulacion->codigo;
            $documento->tipo_documento = 'Requisitos Completos CUP';
            $documento->url_archivo = $datosPostulante['ruta_requisitos'];
            $documento->estado_validacion = 'Subido';
            $documento->save();

            // 6. Registrar el Pago Exitoso
            $concepto = DB::table('concepto_pago')->where('nombre', 'Matrícula CUP')->first();
            $monto = $concepto ? $concepto->monto : 700.00;

            $pago = new Pago();
            $pago->id = Pago::max('id') + 1;
            $pago->postulacion_codigo = $postulacion->codigo;
            $pago->nro_recibo = 'REC-' . rand(10000, 99999);
            $pago->monto = $monto;
            $pago->metodo_pago_id = $transaccion->metodo_id;
            $pago->transaccion_id = $transaccion->transaccion_id;
            $pago->estado = 'Completado';
            $pago->fecha = now()->toDateString();
            $pago->save();

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
