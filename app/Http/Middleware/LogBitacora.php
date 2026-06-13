<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Backend\usuario_seguridad\Models\Bitacora;
use Illuminate\Support\Facades\Auth;

class LogBitacora
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (Auth::check()) {
            $method = $request->method();
            $path = $request->path();
            
            // Ignorar peticiones GET (para no llenar la bitácora) y rutas estáticas
            if ($method === 'GET' || $request->is('build/*', '_debugbar/*', 'sanctum/csrf-cookie', 'up')) {
                return $response;
            }

            $isLogin = $request->routeIs('login') && $method === 'POST';
            $isLogout = $request->routeIs('logout') && $method === 'POST';

            if ($isLogin) {
                $accion = "Inicio de Sesión";
                $detalle = "El usuario ingresó al sistema.";
            } elseif ($isLogout) {
                $accion = "Cierre de Sesión";
                $detalle = "El usuario salió del sistema.";
            } else {
                $routeName = $request->route() ? $request->route()->getName() : null;
                
                $routeMap = [
                    'registro.store' => 'Registró un nuevo postulante',
                    'registro.iniciarPago' => 'Inició pago de inscripción',
                    'password.update.profile' => 'Modificó su contraseña',
                    'password.destroy' => 'Eliminó su cuenta',
                    'usuarios.restore' => 'Restauró un usuario',
                    'usuarios.store' => 'Registró un nuevo usuario',
                    'usuarios.update' => 'Actualizó información de usuario',
                    'usuarios.destroy' => 'Eliminó o suspendió a un usuario',
                    'roles.store' => 'Creó un nuevo rol de sistema',
                    'roles.update' => 'Actualizó configuración de un rol',
                    'roles.destroy' => 'Eliminó un rol del sistema',
                    'docente.notas.update' => 'Actualizó notas de los alumnos',
                    'boleta.config.save' => 'Actualizó el diseño visual de la boleta',
                    'asistencia.abrir' => 'Abrió una sesión de asistencia',
                    'asistencia.cerrar' => 'Cerró una sesión de asistencia',
                    'asistencia.generar' => 'Generó un nuevo PIN/contraseña de asistencia',
                    'asistencia.marcar.docente' => 'Marcó su propia asistencia como docente',
                    'asistencia.marcar.postulante' => 'Registró su asistencia en clase',
                    'examenes.calificar' => 'Finalizó y envió sus respuestas del examen',
                    'gestion_examenes.preguntas.store' => 'Añadió pregunta al banco de preguntas',
                    'gestion_examenes.preguntas.seeder' => 'Autogeneró preguntas para el examen',
                    'gestion_examenes.preguntas.clear' => 'Vació el banco de preguntas',
                    'gestion_examenes.preguntas.destroy' => 'Eliminó una pregunta del banco',
                    'gestion_examenes.store' => 'Configuró fechas y parámetros de un examen',
                    'cupos.update' => 'Actualizó configuración de cupos máximos',
                    'grupos.generar' => 'Generó distribución de grupos automáticamente',
                    'grupos.toggle_inscripciones' => 'Modificó el estado de las inscripciones',
                    'grupos.asignar_alumnos' => 'Asignó alumnos a los grupos de forma aleatoria',
                    'grupos.inscribir_postulante' => 'Se auto-inscribió en un grupo académico',
                    'grupos.update' => 'Actualizó los cupos o modalidad de un grupo',
                    'grupos.destroy' => 'Eliminó un grupo académico del sistema',
                    'horarios.admin.generar' => 'Autogeneró horarios para todos los grupos',
                    'aulas.admin.asignar_aula' => 'Asignó un aula manualmente a un grupo',
                    'aulas.admin.autogenerar' => 'Autogeneró distribución de aulas',
                    'postulantes.aceptar' => 'Aceptó a un postulante en el sistema',
                    'postulantes.update' => 'Modificó datos personales de un postulante',
                    'pagos.admin.concepto.store' => 'Agregó un nuevo concepto/monto de pago',
                    'pagos.admin.concepto.destroy' => 'Eliminó un concepto de pago',
                    'pagos.admin.metodo.store' => 'Actualizó los métodos de cobro disponibles',
                    'carreras.admin.store' => 'Registró una nueva carrera',
                    'carreras.admin.update' => 'Modificó detalles de una carrera',
                    'carreras.admin.destroy' => 'Eliminó una carrera del sistema',
                    'docentes.store' => 'Registró un nuevo docente',
                    'docentes.update' => 'Actualizó información personal de un docente',
                    'docentes.destroy' => 'Dio de baja a un docente',
                    'carga_horaria.store' => 'Asignó y guardó carga horaria (grupos) a un docente'
                ];

                if ($routeName && isset($routeMap[$routeName])) {
                    $accion = $routeMap[$routeName];
                    
                    // Extraer segmento principal para el detalle
                    $segmentos = $request->segments();
                    $area = !empty($segmentos) ? ucfirst(str_replace(['-', '_'], ' ', $segmentos[0])) : 'General';
                    $detalle = "Módulo o Área: $area";
                } else {
                    // Fallback para rutas POST/PUT/DELETE que no estén explícitamente listadas
                    $accionMap = [
                        'POST' => 'Creó o Registró información',
                        'PUT' => 'Actualizó o Editó información',
                        'PATCH' => 'Actualizó o Editó información',
                        'DELETE' => 'Eliminó información'
                    ];
                    
                    $accion = $accionMap[$method] ?? 'Interactuó con el sistema';
                    $detalle = "Ruta: /$path";
                }
            }

            \Backend\usuario_seguridad\Services\AuditService::log($accion, $detalle);
        }

        return $response;
    }
}
