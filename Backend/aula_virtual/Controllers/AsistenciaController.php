<?php

namespace Backend\aula_virtual\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * CU15 - Consultar Asistencia
 */
class AsistenciaController extends Controller
{
    /**
     * Vista principal del módulo de asistencia.
     * Evalúa el rol del usuario autenticado (Admin, Docente, Postulante) y 
     * redirige a la vista correspondiente con los datos necesarios.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = Auth::user();

        // Verificar permisos dinámicos
        if ($user->rol_id != 1) {
            $permiso = DB::table('rol_funcion')
                ->join('funcion', 'rol_funcion.funcion_id', '=', 'funcion.id')
                ->where('rol_funcion.rol_id', $user->rol_id)
                ->where('funcion.permiso', 'aula.asistencia')
                ->first();

            if (!$permiso) {
                abort(403, 'No tienes permiso para acceder a esta función.');
            }
        }

        $perfil = DB::table('perfil')->where('usuario_id', $user->id)->first();

        if (!$perfil) {
            return Inertia::render('Modulos/aula_virtual/Asistencia/Index', [
                'rol' => 'error',
                'message' => 'Perfil no encontrado.',
                'grupos' => [],
                'sesionesAbiertas' => [],
                'historial' => [],
            ]);
        }

        // ===================== ADMIN =====================
        if ($user->rol_id == 1) {
            return $this->vistaAdmin($perfil);
        }

        // ===================== DOCENTE =====================
        if ($user->rol_id == 2) {
            return $this->vistaDocente($perfil);
        }

        // ===================== POSTULANTE =====================
        if ($user->rol_id == 3) {
            return $this->vistaPostulante($perfil);
        }

        abort(403, 'Rol no reconocido.');
    }

    /**
     * Genera la vista de Asistencia para el rol Administrador.
     * Retorna todos los grupos disponibles, las sesiones actualmente abiertas en el sistema
     * y el historial global de sesiones ya cerradas.
     *
     * @param object $perfil Perfil del administrador actual.
     * @return \Inertia\Response
     */
    private function vistaAdmin($perfil)
    {
        // Todos los grupos con su materia y docente asignado
        $grupos = DB::table('grupo')
            ->join('materia', 'grupo.materia_id', '=', 'materia.id')
            ->leftJoin('carga_horaria', 'grupo.codigo', '=', 'carga_horaria.grupo_codigo')
            ->leftJoin('perfil as dp', 'carga_horaria.docente_id', '=', 'dp.id')
            ->select(
                'grupo.codigo',
                'grupo.nombre as grupo_nombre',
                'materia.nombre as materia_nombre',
                'grupo.inscritos_actuales',
                'dp.nombres as docente_nombres',
                'dp.apellido_paterno as docente_paterno'
            )
            ->orderBy('grupo.nombre')
            ->orderBy('materia.nombre')
            ->get()
            ->map(function ($g) {
                $g->docente = $g->docente_nombres
                    ? trim($g->docente_nombres . ' ' . $g->docente_paterno)
                    : 'Sin asignar';
                return $g;
            });

        // Sesiones abiertas
        $sesionesAbiertas = DB::table('sesion_asistencia')
            ->join('grupo', 'sesion_asistencia.grupo_codigo', '=', 'grupo.codigo')
            ->join('materia', 'grupo.materia_id', '=', 'materia.id')
            ->leftJoin('perfil as dp', 'sesion_asistencia.docente_id', '=', 'dp.id')
            ->where('sesion_asistencia.estado', 'Abierta')
            ->select(
                'sesion_asistencia.id',
                'sesion_asistencia.grupo_codigo',
                'sesion_asistencia.contrasena',
                'sesion_asistencia.fecha',
                'sesion_asistencia.hora_apertura',
                'sesion_asistencia.estado',
                'sesion_asistencia.docente_presente',
                'grupo.nombre as grupo_nombre',
                'materia.nombre as materia_nombre',
                'dp.nombres as docente_nombres',
                'dp.apellido_paterno as docente_paterno'
            )
            ->orderByDesc('sesion_asistencia.hora_apertura')
            ->get()
            ->map(function ($s) {
                $s->docente = $s->docente_nombres
                    ? trim($s->docente_nombres . ' ' . $s->docente_paterno)
                    : 'Sin asignar';
                // Contar presentes
                $s->presentes = DB::table('registro_asistencia')
                    ->where('sesion_id', $s->id)
                    ->where('estado', 'Presente')
                    ->count();
                $s->total = DB::table('registro_asistencia')
                    ->where('sesion_id', $s->id)
                    ->count();
                return $s;
            });

        // Historial (últimas 50 sesiones cerradas)
        $historial = $this->obtenerHistorialGlobal();

        return Inertia::render('Modulos/aula_virtual/Asistencia/Index', [
            'rol' => 'admin',
            'grupos' => $grupos,
            'sesionesAbiertas' => $sesionesAbiertas,
            'historial' => $historial,
        ]);
    }

    /**
     * Genera la vista de Asistencia para el rol Docente.
     * Obtiene los grupos asignados específicamente al docente, las sesiones que están abiertas
     * para sus materias y el historial de sesiones pasadas.
     *
     * @param object $perfil Perfil del docente actual.
     * @return \Inertia\Response
     */
    private function vistaDocente($perfil)
    {
        // Grupos asignados al docente
        $grupos = DB::table('carga_horaria')
            ->join('grupo', 'carga_horaria.grupo_codigo', '=', 'grupo.codigo')
            ->join('materia', 'grupo.materia_id', '=', 'materia.id')
            ->where('carga_horaria.docente_id', $perfil->id)
            ->select(
                'grupo.codigo',
                'grupo.nombre as grupo_nombre',
                'materia.nombre as materia_nombre',
                'grupo.inscritos_actuales'
            )
            ->orderBy('grupo.nombre')
            ->get();

        $grupoCodigos = $grupos->pluck('codigo')->toArray();

        // Sesiones abiertas de sus grupos
        $sesionesAbiertas = DB::table('sesion_asistencia')
            ->join('grupo', 'sesion_asistencia.grupo_codigo', '=', 'grupo.codigo')
            ->join('materia', 'grupo.materia_id', '=', 'materia.id')
            ->where('sesion_asistencia.estado', 'Abierta')
            ->whereIn('sesion_asistencia.grupo_codigo', $grupoCodigos)
            ->select(
                'sesion_asistencia.id',
                'sesion_asistencia.grupo_codigo',
                'sesion_asistencia.contrasena',
                'sesion_asistencia.fecha',
                'sesion_asistencia.hora_apertura',
                'sesion_asistencia.estado',
                'sesion_asistencia.docente_presente',
                'grupo.nombre as grupo_nombre',
                'materia.nombre as materia_nombre'
            )
            ->orderByDesc('sesion_asistencia.hora_apertura')
            ->get()
            ->map(function ($s) {
                $s->presentes = DB::table('registro_asistencia')
                    ->where('sesion_id', $s->id)
                    ->where('estado', 'Presente')
                    ->count();
                $s->total = DB::table('registro_asistencia')
                    ->where('sesion_id', $s->id)
                    ->count();
                return $s;
            });

        // Historial del docente
        $historial = DB::table('sesion_asistencia')
            ->join('grupo', 'sesion_asistencia.grupo_codigo', '=', 'grupo.codigo')
            ->join('materia', 'grupo.materia_id', '=', 'materia.id')
            ->where('sesion_asistencia.estado', 'Cerrada')
            ->whereIn('sesion_asistencia.grupo_codigo', $grupoCodigos)
            ->select(
                'sesion_asistencia.id',
                'sesion_asistencia.fecha',
                'sesion_asistencia.hora_apertura',
                'sesion_asistencia.hora_cierre',
                'sesion_asistencia.docente_presente',
                'grupo.nombre as grupo_nombre',
                'materia.nombre as materia_nombre'
            )
            ->orderByDesc('sesion_asistencia.fecha')
            ->limit(30)
            ->get()
            ->map(function ($s) {
                $s->presentes = DB::table('registro_asistencia')
                    ->where('sesion_id', $s->id)
                    ->where('estado', 'Presente')
                    ->count();
                $s->total = DB::table('registro_asistencia')
                    ->where('sesion_id', $s->id)
                    ->count();
                return $s;
            });

        return Inertia::render('Modulos/aula_virtual/Asistencia/Index', [
            'rol' => 'docente',
            'perfil_id' => $perfil->id,
            'grupos' => $grupos,
            'sesionesAbiertas' => $sesionesAbiertas,
            'historial' => $historial,
        ]);
    }

    /**
     * Genera la vista de Asistencia para el rol Postulante.
     * Verifica las materias en las que está inscrito el postulante y le muestra las sesiones 
     * abiertas para que pueda registrar su asistencia usando una contraseña.
     *
     * @param object $perfil Perfil del postulante actual.
     * @return \Inertia\Response
     */
    private function vistaPostulante($perfil)
    {
        $postulacion = DB::table('postulacion')
            ->where('postulante_id', $perfil->id)
            ->orderByDesc('codigo')
            ->first();

        $grupos = collect();
        $sesionesAbiertas = collect();
        $historial = collect();

        if ($postulacion) {
            // Grupos inscritos
            $inscripciones = DB::table('inscripciones_cup')
                ->join('grupo', 'inscripciones_cup.grupo_codigo', '=', 'grupo.codigo')
                ->join('materia', 'grupo.materia_id', '=', 'materia.id')
                ->leftJoin('carga_horaria', 'grupo.codigo', '=', 'carga_horaria.grupo_codigo')
                ->leftJoin('perfil as dp', 'carga_horaria.docente_id', '=', 'dp.id')
                ->where('inscripciones_cup.postulacion_codigo', $postulacion->codigo)
                ->select(
                    'grupo.codigo',
                    'grupo.nombre as grupo_nombre',
                    'materia.nombre as materia_nombre',
                    'dp.nombres as docente_nombres',
                    'dp.apellido_paterno as docente_paterno'
                )
                ->get()
                ->map(function ($g) {
                    $g->docente = $g->docente_nombres
                        ? trim($g->docente_nombres . ' ' . $g->docente_paterno)
                        : 'Sin asignar';
                    return $g;
                });

            $grupos = $inscripciones;
            $grupoCodigos = $inscripciones->pluck('codigo')->toArray();

            // Sesiones abiertas de sus grupos
            $sesionesAbiertas = DB::table('sesion_asistencia')
                ->join('grupo', 'sesion_asistencia.grupo_codigo', '=', 'grupo.codigo')
                ->join('materia', 'grupo.materia_id', '=', 'materia.id')
                ->where('sesion_asistencia.estado', 'Abierta')
                ->whereIn('sesion_asistencia.grupo_codigo', $grupoCodigos)
                ->select(
                    'sesion_asistencia.id',
                    'sesion_asistencia.grupo_codigo',
                    'sesion_asistencia.fecha',
                    'sesion_asistencia.hora_apertura',
                    'grupo.nombre as grupo_nombre',
                    'materia.nombre as materia_nombre'
                )
                ->orderByDesc('sesion_asistencia.hora_apertura')
                ->get()
                ->map(function ($s) use ($perfil) {
                    // Verificar si este postulante ya marcó
                    $registro = DB::table('registro_asistencia')
                        ->where('sesion_id', $s->id)
                        ->where('postulante_id', $perfil->id)
                        ->first();
                    $s->mi_estado = $registro ? $registro->estado : 'Pendiente';
                    $s->hora_marcado = $registro && $registro->hora_registro ? $registro->hora_registro : null;
                    return $s;
                });

            // Historial personal
            $historial = DB::table('registro_asistencia')
                ->join('sesion_asistencia', 'registro_asistencia.sesion_id', '=', 'sesion_asistencia.id')
                ->join('grupo', 'sesion_asistencia.grupo_codigo', '=', 'grupo.codigo')
                ->join('materia', 'grupo.materia_id', '=', 'materia.id')
                ->where('registro_asistencia.postulante_id', $perfil->id)
                ->select(
                    'sesion_asistencia.fecha',
                    'registro_asistencia.estado',
                    'registro_asistencia.hora_registro',
                    'grupo.nombre as grupo_nombre',
                    'materia.nombre as materia_nombre'
                )
                ->orderByDesc('sesion_asistencia.fecha')
                ->limit(50)
                ->get();
        }

        return Inertia::render('Modulos/aula_virtual/Asistencia/Index', [
            'rol' => 'postulante',
            'perfil_id' => $perfil->id,
            'grupos' => $grupos,
            'sesionesAbiertas' => $sesionesAbiertas,
            'historial' => $historial,
        ]);
    }

    /**
     * Administrador: Abre una nueva sesión de asistencia para un grupo específico.
     * Inicializa la sesión vacía y registra por defecto "Falta" para todos los estudiantes
     * inscritos en dicho grupo.
     *
     * @param Request $request Contiene el 'grupo_codigo' a abrir.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function abrirSesion(Request $request)
    {
        $user = Auth::user();
        if ($user->rol_id != 1) {
            abort(403, 'Solo el administrador puede abrir sesiones de asistencia.');
        }

        $request->validate([
            'grupo_codigo' => 'required|integer|exists:grupo,codigo',
        ]);

        $grupoCodigo = $request->grupo_codigo;

        // Verificar que no haya una sesión abierta para este grupo hoy
        $sesionExistente = DB::table('sesion_asistencia')
            ->where('grupo_codigo', $grupoCodigo)
            ->where('fecha', now()->toDateString())
            ->where('estado', 'Abierta')
            ->first();

        if ($sesionExistente) {
            return back()->with('error', 'Ya existe una sesión abierta para este grupo hoy.');
        }

        // Obtener docente asignado al grupo
        $carga = DB::table('carga_horaria')
            ->where('grupo_codigo', $grupoCodigo)
            ->first();

        // Crear la sesión (sin contraseña aún, el docente la genera)
        $sesionId = DB::table('sesion_asistencia')->insertGetId([
            'grupo_codigo' => $grupoCodigo,
            'docente_id' => $carga ? $carga->docente_id : null,
            'contrasena' => '', // vacía hasta que el docente genere
            'fecha' => now()->toDateString(),
            'hora_apertura' => now(),
            'hora_cierre' => null,
            'estado' => 'Abierta',
            'docente_presente' => false,
        ]);

        // Crear registros de "Falta" para todos los postulantes inscritos en este grupo
        $inscripciones = DB::table('inscripciones_cup')
            ->join('postulacion', 'inscripciones_cup.postulacion_codigo', '=', 'postulacion.codigo')
            ->where('inscripciones_cup.grupo_codigo', $grupoCodigo)
            ->select('postulacion.postulante_id')
            ->distinct()
            ->get();

        foreach ($inscripciones as $insc) {
            DB::table('registro_asistencia')->insert([
                'sesion_id' => $sesionId,
                'postulante_id' => $insc->postulante_id,
                'estado' => 'Falta',
                'hora_registro' => null,
            ]);
        }

        // Registrar en bitácora
        DB::table('bitacora')->insert([
            'usuario_id' => $user->id,
            'accion' => 'Abrir Sesión Asistencia',
            'detalle' => "Sesión #$sesionId abierta para grupo código $grupoCodigo",
            'ip' => $request->ip(),
            'fecha_hora' => now(),
        ]);

        return back()->with('success', 'Sesión de asistencia abierta correctamente.');
    }

    /**
     * Administrador: Cierra una sesión de asistencia previamente abierta.
     * Los estudiantes que no marcaron asistencia dentro del tiempo límite 
     * conservarán su estado por defecto ("Falta").
     *
     * @param Request $request Petición HTTP.
     * @param int $id ID de la sesión de asistencia a cerrar.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function cerrarSesion(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->rol_id != 1) {
            abort(403, 'Solo el administrador puede cerrar sesiones de asistencia.');
        }

        $sesion = DB::table('sesion_asistencia')->where('id', $id)->first();
        if (!$sesion || $sesion->estado !== 'Abierta') {
            return back()->with('error', 'Sesión no encontrada o ya cerrada.');
        }

        DB::table('sesion_asistencia')->where('id', $id)->update([
            'estado' => 'Cerrada',
            'hora_cierre' => now(),
        ]);

        // Registrar en bitácora
        DB::table('bitacora')->insert([
            'usuario_id' => $user->id,
            'accion' => 'Cerrar Sesión Asistencia',
            'detalle' => "Sesión #$id cerrada. Grupo código {$sesion->grupo_codigo}",
            'ip' => $request->ip(),
            'fecha_hora' => now(),
        ]);

        return back()->with('success', 'Sesión de asistencia cerrada. Los que no marcaron quedan como Falta.');
    }

    /**
     * Docente: Genera o regenera una contraseña aleatoria (6 caracteres) para una sesión abierta.
     * El docente dicta esta contraseña a los estudiantes presentes en clase para que marquen asistencia.
     *
     * @param Request $request Petición HTTP.
     * @param int $id ID de la sesión de asistencia.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function generarContrasena(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->rol_id != 2) {
            abort(403, 'Solo docentes pueden generar contraseñas.');
        }

        $sesion = DB::table('sesion_asistencia')->where('id', $id)->first();
        if (!$sesion || $sesion->estado !== 'Abierta') {
            return back()->with('error', 'Sesión no encontrada o ya cerrada.');
        }

        // Verificar que el docente esté asignado a este grupo
        $perfil = DB::table('perfil')->where('usuario_id', $user->id)->first();
        $carga = DB::table('carga_horaria')
            ->where('docente_id', $perfil->id)
            ->where('grupo_codigo', $sesion->grupo_codigo)
            ->first();

        if (!$carga) {
            abort(403, 'No estás asignado a este grupo.');
        }

        // Generar contraseña aleatoria de 6 caracteres alfanuméricos
        $contrasena = strtoupper(Str::random(6));

        DB::table('sesion_asistencia')->where('id', $id)->update([
            'contrasena' => $contrasena,
        ]);

        return back()->with('success', 'Contraseña generada correctamente.');
    }

    /**
     * Docente: Marca su propia asistencia en la sesión.
     * A diferencia de los postulantes, el docente no necesita contraseña para marcar asistencia.
     *
     * @param Request $request Petición HTTP.
     * @param int $id ID de la sesión de asistencia.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function marcarDocente(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->rol_id != 2) {
            abort(403, 'Solo docentes pueden marcar su propia asistencia.');
        }

        $sesion = DB::table('sesion_asistencia')->where('id', $id)->first();
        if (!$sesion || $sesion->estado !== 'Abierta') {
            return back()->with('error', 'Sesión no encontrada o ya cerrada.');
        }

        // Verificar que el docente esté asignado
        $perfil = DB::table('perfil')->where('usuario_id', $user->id)->first();
        $carga = DB::table('carga_horaria')
            ->where('docente_id', $perfil->id)
            ->where('grupo_codigo', $sesion->grupo_codigo)
            ->first();

        if (!$carga) {
            abort(403, 'No estás asignado a este grupo.');
        }

        DB::table('sesion_asistencia')->where('id', $id)->update([
            'docente_presente' => true,
        ]);

        return back()->with('success', 'Tu asistencia fue registrada correctamente.');
    }

    /**
     * Postulante: Marca su asistencia en la sesión.
     * Valida que la sesión esté abierta y que la contraseña ingresada coincida con 
     * la que el docente ha generado. Si es correcta, cambia el estado de "Falta" a "Presente".
     *
     * @param Request $request Contiene el 'sesion_id' y la 'contrasena' proporcionada.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function marcarPostulante(Request $request)
    {
        $user = Auth::user();
        if ($user->rol_id != 3) {
            abort(403, 'Solo postulantes pueden marcar asistencia con contraseña.');
        }

        $request->validate([
            'sesion_id' => 'required|integer',
            'contrasena' => 'required|string|max:10',
        ]);

        $sesion = DB::table('sesion_asistencia')->where('id', $request->sesion_id)->first();
        if (!$sesion || $sesion->estado !== 'Abierta') {
            return back()->with('error', 'La sesión de asistencia ya fue cerrada o no existe.');
        }

        if (empty($sesion->contrasena)) {
            return back()->with('error', 'El docente aún no ha generado la contraseña para esta sesión.');
        }

        // Validar contraseña (case insensitive)
        if (strtoupper(trim($request->contrasena)) !== strtoupper($sesion->contrasena)) {
            return back()->with('error', 'Contraseña incorrecta. Intenta nuevamente.');
        }

        $perfil = DB::table('perfil')->where('usuario_id', $user->id)->first();

        // Verificar que el postulante está inscrito en este grupo
        $registro = DB::table('registro_asistencia')
            ->where('sesion_id', $sesion->id)
            ->where('postulante_id', $perfil->id)
            ->first();

        if (!$registro) {
            return back()->with('error', 'No estás inscrito en este grupo.');
        }

        if ($registro->estado === 'Presente') {
            return back()->with('info', 'Ya tienes tu asistencia marcada como Presente.');
        }

        // Marcar como Presente
        DB::table('registro_asistencia')
            ->where('id', $registro->id)
            ->update([
                'estado' => 'Presente',
                'hora_registro' => now(),
            ]);

        return back()->with('success', '¡Asistencia registrada correctamente! Estado: Presente.');
    }

    /**
     * Obtiene el historial global de asistencia para los administradores.
     * Retorna las últimas 50 sesiones que ya han sido cerradas, con cálculos
     * agregados de cantidad de presentes vs cantidad total de alumnos.
     *
     * @return \Illuminate\Support\Collection
     */
    private function obtenerHistorialGlobal()
    {
        return DB::table('sesion_asistencia')
            ->join('grupo', 'sesion_asistencia.grupo_codigo', '=', 'grupo.codigo')
            ->join('materia', 'grupo.materia_id', '=', 'materia.id')
            ->leftJoin('perfil as dp', 'sesion_asistencia.docente_id', '=', 'dp.id')
            ->where('sesion_asistencia.estado', 'Cerrada')
            ->select(
                'sesion_asistencia.id',
                'sesion_asistencia.fecha',
                'sesion_asistencia.hora_apertura',
                'sesion_asistencia.hora_cierre',
                'sesion_asistencia.docente_presente',
                'grupo.nombre as grupo_nombre',
                'materia.nombre as materia_nombre',
                'dp.nombres as docente_nombres',
                'dp.apellido_paterno as docente_paterno'
            )
            ->orderByDesc('sesion_asistencia.fecha')
            ->limit(50)
            ->get()
            ->map(function ($s) {
                $s->docente = $s->docente_nombres
                    ? trim($s->docente_nombres . ' ' . $s->docente_paterno)
                    : 'Sin asignar';
                $s->presentes = DB::table('registro_asistencia')
                    ->where('sesion_id', $s->id)
                    ->where('estado', 'Presente')
                    ->count();
                $s->total = DB::table('registro_asistencia')
                    ->where('sesion_id', $s->id)
                    ->count();
                return $s;
            });
    }
}
