<?php

namespace Backend\aula_virtual\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ExamenController extends Controller
{
    /**
     * Muestra la vista principal del módulo de Exámenes dependiendo del rol del usuario.
     * Admin: Gestión completa de exámenes y banco de preguntas.
     * Docente: Visualiza resultados y notas de sus alumnos.
     * Postulante: Visualiza exámenes pendientes y rinde pruebas.
     *
     * @param Request $request Petición HTTP.
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->rol_id == 1 || $user->rol_id == 2) {
            return $this->vistaAdminDocente($user);
        } elseif ($user->rol_id == 3) {
            return $this->vistaPostulante($user);
        }

        return redirect()->route('dashboard')->with('error', 'Rol no autorizado.');
    }

    /**
     * ==========================================
     * LOGICA PARA EL DOCENTE / ADMINISTRADOR
     * ==========================================
     */
    private function vistaAdminDocente($user)
    {
        $perfil = DB::table('perfil')->where('usuario_id', $user->id)->first();
        if (!$perfil) {
            return Inertia::render('Modulos/aula_virtual/Examenes/Index', ['rol' => 'error', 'message' => 'Perfil no encontrado.']);
        }

        if ($user->rol_id == 1) {
            // Admin sees all groups
            $grupos = DB::table('grupo as g')
                ->join('materia as m', 'g.materia_id', '=', 'm.id')
                ->select('g.codigo as grupo_codigo', 'g.nombre as grupo_nombre', 'm.nombre as materia_nombre', 'm.id as materia_id')
                ->get();
        } else {
            // Docente sees only their groups
            $grupos = DB::table('carga_horaria as ch')
                ->join('grupo as g', 'ch.grupo_codigo', '=', 'g.codigo')
                ->join('materia as m', 'g.materia_id', '=', 'm.id')
                ->where('ch.docente_id', $perfil->id)
                ->select('g.codigo as grupo_codigo', 'g.nombre as grupo_nombre', 'm.nombre as materia_nombre', 'm.id as materia_id')
                ->get();
        }

        $notasPorGrupo = [];

        foreach ($grupos as $g) {
            $estudiantes = DB::table('inscripciones_cup as i')
                ->join('postulacion as p', 'i.postulacion_codigo', '=', 'p.codigo')
                ->join('postulante as pos', 'p.postulante_id', '=', 'pos.id')
                ->join('perfil as perf', 'pos.id', '=', 'perf.id')
                ->leftJoin('evaluaciones as ev', 'i.id', '=', 'ev.inscripcion_id')
                ->where('i.grupo_codigo', $g->grupo_codigo)
                ->select(
                    'perf.ci', 'perf.nombres', 'perf.apellido_paterno', 'perf.apellido_materno',
                    'ev.nota_p1', 'ev.nota_p2', 'ev.nota_p3', 'ev.promedio_final', 'ev.estado_materia'
                )
                ->orderBy('perf.apellido_paterno')
                ->get();
            
            $notasPorGrupo[$g->grupo_codigo] = $estudiantes;
        }

        return Inertia::render('Modulos/aula_virtual/Examenes/Index', [
            'rol' => 'admin_docente',
            'grupos' => $grupos,
            'notas' => $notasPorGrupo
        ]);
    }

    /**
     * ==========================================
     * LOGICA PARA EL DOCENTE
     * ==========================================
     */

    /**
     * Genera la vista para el rol de Docente.
     * Muestra las materias asignadas al docente y la lista de sus estudiantes 
     * con sus respectivas notas para cada evaluación (Parcial 1, 2, Final).
     *
     * @param object $user Usuario autenticado (Docente).
     * @return \Inertia\Response
     */
    private function vistaDocente($user)
    {
        $perfil = DB::table('perfil')->where('usuario_id', $user->id)->first();
        if (!$perfil) {
            return Inertia::render('Modulos/aula_virtual/Examenes/Index', ['rol' => 'error', 'message' => 'Perfil no encontrado.']);
        }

        // Obtener grupos del docente
        $grupos = DB::table('carga_horaria as ch')
            ->join('grupo as g', 'ch.grupo_codigo', '=', 'g.codigo')
            ->join('materia as m', 'g.materia_id', '=', 'm.id')
            ->where('ch.docente_id', $perfil->id)
            ->select('g.codigo as grupo_codigo', 'g.nombre as grupo_nombre', 'm.nombre as materia_nombre', 'm.id as materia_id')
            ->get();

        $notasPorGrupo = [];

        foreach ($grupos as $g) {
            // Obtener estudiantes y sus notas en EVALUACIONES
            $estudiantes = DB::table('inscripciones_cup as i')
                ->join('postulacion as p', 'i.postulacion_codigo', '=', 'p.codigo')
                ->join('postulante as pos', 'p.postulante_id', '=', 'pos.id')
                ->join('perfil as perf', 'pos.perfil_id', '=', 'perf.id')
                ->leftJoin('evaluaciones as ev', 'i.id', '=', 'ev.inscripcion_id')
                ->where('i.grupo_codigo', $g->grupo_codigo)
                ->select(
                    'perf.nombres', 'perf.apellido_paterno', 'perf.apellido_materno',
                    'ev.nota_p1', 'ev.nota_p2', 'ev.nota_p3', 'ev.promedio_final', 'ev.estado_materia'
                )
                ->orderBy('perf.apellido_paterno')
                ->get();
            
            $notasPorGrupo[$g->grupo_codigo] = $estudiantes;
        }

        return Inertia::render('Modulos/aula_virtual/Examenes/Index', [
            'rol' => 'docente',
            'grupos' => $grupos,
            'notas' => $notasPorGrupo
        ]);
    }


    /**
     * ==========================================
     * LOGICA PARA EL POSTULANTE
     * ==========================================
     */

    /**
     * Genera la vista para el rol de Postulante.
     * Muestra sus materias inscritas y los exámenes disponibles en curso.
     * También bloquea los exámenes que el postulante ya ha rendido previamente.
     *
     * @param object $user Usuario autenticado (Postulante).
     * @return \Inertia\Response
     */
    private function vistaPostulante($user)
    {
        $perfil = DB::table('perfil')->where('usuario_id', $user->id)->first();
        if (!$perfil) {
            return Inertia::render('Modulos/aula_virtual/Examenes/Index', ['rol' => 'error', 'message' => 'Perfil no encontrado.']);
        }

        $postulante = DB::table('postulante')->where('id', $perfil->id)->first();
        if (!$postulante) {
            return Inertia::render('Modulos/aula_virtual/Examenes/Index', ['rol' => 'error', 'message' => 'No estás registrado como postulante.']);
        }

        // Obtener materias inscritas
        $inscripciones = DB::table('postulacion as p')
            ->join('inscripciones_cup as i', 'p.codigo', '=', 'i.postulacion_codigo')
            ->join('grupo as g', 'i.grupo_codigo', '=', 'g.codigo')
            ->join('materia as m', 'g.materia_id', '=', 'm.id')
            ->leftJoin('evaluaciones as ev', 'i.id', '=', 'ev.inscripcion_id')
            ->where('p.postulante_id', $postulante->id)
            ->select('i.id as inscripcion_id', 'm.id as materia_id', 'm.nombre as materia_nombre', 'g.nombre as grupo_nombre', 'ev.nota_p1', 'ev.nota_p2', 'ev.nota_p3', 'ev.promedio_final', 'ev.estado_materia')
            ->get();

        $materiasIds = $inscripciones->pluck('materia_id')->toArray();

        // Buscar exámenes para esas materias
        $ahora = Carbon::now();
        
        $examenes_disponibles = DB::table('examen as e')
            ->join('materia as m', 'e.materia_id', '=', 'm.id')
            ->whereIn('e.materia_id', $materiasIds)
            ->where('e.fecha_inicio', '<=', $ahora)
            ->where('e.fecha_fin', '>=', $ahora)
            ->select('e.*', 'm.nombre as materia_nombre')
            ->get();

        // Obtener intentos realizados para saber si ya dio un examen disponible
        $inscripcionesIds = $inscripciones->pluck('inscripcion_id')->toArray();
        $intentos = DB::table('intento_examen')
            ->whereIn('inscripcion_id', $inscripcionesIds)
            ->get()
            ->keyBy('examen_id');

        foreach ($examenes_disponibles as $e) {
            $e->ya_realizado = isset($intentos[$e->id]);
            if ($e->ya_realizado) {
                $e->nota_obtenida = $intentos[$e->id]->nota_obtenida;
            }
        }

        return Inertia::render('Modulos/aula_virtual/Examenes/Index', [
            'rol' => 'postulante',
            'inscripciones' => $inscripciones,
            'examenes' => $examenes_disponibles
        ]);
    }

    /**
     * Inicia el proceso de rendir un examen para un postulante.
     * Valida la fecha activa, que no haya sido rendido antes y extrae un número de preguntas 
     * aleatorias según la configuración del examen. No envía la respuesta correcta al frontend.
     *
     * @param int $id ID del examen a rendir.
     * @param Request $request Petición HTTP.
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function rendir($id, Request $request)
    {
        $user = $request->user();
        if ($user->rol_id != 3) abort(403);

        $perfil = DB::table('perfil')->where('usuario_id', $user->id)->first();
        $postulante = DB::table('postulante')->where('id', $perfil->id)->first();

        $examen = DB::table('examen as e')
            ->join('materia as m', 'e.materia_id', '=', 'm.id')
            ->where('e.id', $id)
            ->select('e.*', 'm.nombre as materia_nombre')
            ->first();

        if (!$examen) abort(404, 'Examen no encontrado');

        $ahora = Carbon::now();
        if ($ahora < Carbon::parse($examen->fecha_inicio) || $ahora > Carbon::parse($examen->fecha_fin)) {
            return redirect()->route('examenes.index')->with('error', 'El examen no está en su periodo activo.');
        }

        // Buscar la inscripción correspondiente a esta materia
        $inscripcion = DB::table('postulacion as p')
            ->join('inscripciones_cup as i', 'p.codigo', '=', 'i.postulacion_codigo')
            ->join('grupo as g', 'i.grupo_codigo', '=', 'g.codigo')
            ->where('p.postulante_id', $postulante->id)
            ->where('g.materia_id', $examen->materia_id)
            ->select('i.id')
            ->first();

        if (!$inscripcion) {
            return redirect()->route('examenes.index')->with('error', 'No estás inscrito en esta materia.');
        }

        // Verificar si ya lo rindió
        $intento = DB::table('intento_examen')
            ->where('examen_id', $examen->id)
            ->where('inscripcion_id', $inscripcion->id)
            ->first();

        if ($intento) {
            return redirect()->route('examenes.index')->with('error', 'Ya realizaste este examen. No puedes volver a enviarlo.');
        }

        // Obtener preguntas aleatorias (no mandar la respuesta correcta al frontend)
        $preguntas = DB::table('pregunta')
            ->where('materia_id', $examen->materia_id)
            ->inRandomOrder()
            ->limit($examen->cantidad_preguntas)
            ->select('id', 'enunciado', 'opcion_a', 'opcion_b', 'opcion_c', 'opcion_d')
            ->get();

        if ($preguntas->isEmpty()) {
            return redirect()->route('examenes.index')->with('error', 'No hay preguntas suficientes en el banco para esta materia.');
        }

        return Inertia::render('Modulos/aula_virtual/Examenes/Rendir', [
            'examen' => $examen,
            'preguntas' => $preguntas,
            'inscripcion_id' => $inscripcion->id
        ]);
    }

    /**
     * Recibe y evalúa el examen enviado por el postulante.
     * Valida respuestas, calcula el porcentaje de aciertos y actualiza 
     * directamente la nota correspondiente en la tabla EVALUACIONES según el tipo de examen.
     *
     * @param int $id ID del examen rendido.
     * @param Request $request Contiene 'inscripcion_id' y el arreglo de 'respuestas'.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function calificar($id, Request $request)
    {
        $user = $request->user();
        if ($user->rol_id != 3) abort(403);

        $request->validate([
            'inscripcion_id' => 'required|integer',
            'respuestas' => 'required|array'
        ]);

        $examen = DB::table('examen')->where('id', $id)->first();
        if (!$examen) abort(404);

        // Validar doble envío
        $intento = DB::table('intento_examen')
            ->where('examen_id', $examen->id)
            ->where('inscripcion_id', $request->inscripcion_id)
            ->first();

        if ($intento) {
            return redirect()->route('examenes.index')->with('error', 'Ya se registró la calificación de este examen.');
        }

        $correctas = 0;
        $total = count($request->respuestas);
        
        if ($total == 0) {
            $total = $examen->cantidad_preguntas; // Evitar division por cero si enviaron vacio
        }

        foreach ($request->respuestas as $res) {
            $pregunta = DB::table('pregunta')->where('id', $res['pregunta_id'])->first();
            if ($pregunta && $pregunta->respuesta_correcta === $res['seleccionada']) {
                $correctas++;
            }
        }

        // Nota sobre 100
        $notaPura100 = ($correctas / $total) * 100;

        // Registrar intento
        DB::table('intento_examen')->insert([
            'examen_id' => $examen->id,
            'inscripcion_id' => $request->inscripcion_id,
            'nota_obtenida' => $notaPura100,
            'fecha_realizacion' => Carbon::now()
        ]);

        // Asegurarnos de que exista un registro en EVALUACIONES
        $eval = DB::table('evaluaciones')->where('inscripcion_id', $request->inscripcion_id)->first();
        
        if (!$eval) {
            $evalId = DB::table('evaluaciones')->insertGetId([
                'inscripcion_id' => $request->inscripcion_id,
                'nota_p1' => 0, 'nota_p2' => 0, 'nota_p3' => 0, 'promedio_final' => 0,
                'estado_materia' => 'Reprobado'
            ]);
            $eval = DB::table('evaluaciones')->where('id', $evalId)->first();
        }

        $updateData = [];
        
        // Ponderar: 30% para Parcial 1 y 2, 40% para Final
        if ($examen->tipo === 'Parcial 1') {
            $updateData['nota_p1'] = $notaPura100 * 0.30;
        } elseif ($examen->tipo === 'Parcial 2') {
            $updateData['nota_p2'] = $notaPura100 * 0.30;
        } elseif ($examen->tipo === 'Examen Final' || $examen->tipo === 'Final') {
            $updateData['nota_p3'] = $notaPura100 * 0.40;
        }

        // Calcular nuevo promedio usando las notas existentes (solo actualizando la actual)
        $p1 = isset($updateData['nota_p1']) ? $updateData['nota_p1'] : $eval->nota_p1;
        $p2 = isset($updateData['nota_p2']) ? $updateData['nota_p2'] : $eval->nota_p2;
        $p3 = isset($updateData['nota_p3']) ? $updateData['nota_p3'] : $eval->nota_p3;
        
        $promedioFinal = $p1 + $p2 + $p3;
        $updateData['promedio_final'] = $promedioFinal;
        
        if ($promedioFinal >= 60) {
            $updateData['estado_materia'] = 'Aprobado';
        } else {
            $updateData['estado_materia'] = 'Reprobado';
        }

        DB::table('evaluaciones')
            ->where('inscripcion_id', $request->inscripcion_id)
            ->update($updateData);

        return redirect()->route('examenes.index')->with('success', 'Examen enviado correctamente. Calificación: ' . round($notaPura100, 2) . '/100');
    }
}
