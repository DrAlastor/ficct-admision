<?php

namespace Backend\aula_virtual\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Response;

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
     * Exportar lista de notas en formato PDF o CSV
     */
    public function exportarNotas($grupo_codigo, $format)
    {
        $user = auth()->user();
        if ($user->rol_id == 3) abort(403);

        $grupo = DB::table('grupo as g')
            ->join('materia as m', 'g.materia_id', '=', 'm.id')
            ->where('g.codigo', $grupo_codigo)
            ->select('g.codigo as grupo_codigo', 'g.nombre as grupo_nombre', 'm.nombre as materia_nombre')
            ->first();

        if (!$grupo) abort(404);

        $estudiantes = DB::table('inscripciones_cup as i')
            ->join('postulacion as p', 'i.postulacion_codigo', '=', 'p.codigo')
            ->join('postulante as pos', 'p.postulante_id', '=', 'pos.id')
            ->join('perfil as perf', 'pos.id', '=', 'perf.id') // Ensure we get correct profile info
            ->leftJoin('evaluaciones as ev', 'i.id', '=', 'ev.inscripcion_id')
            ->where('i.grupo_codigo', $grupo_codigo)
            ->select(
                'perf.ci', 'perf.nombres', 'perf.apellido_paterno', 'perf.apellido_materno',
                'ev.nota_p1', 'ev.nota_p2', 'ev.nota_p3', 'ev.promedio_final', 'ev.estado_materia'
            )
            ->orderBy('perf.apellido_paterno')
            ->get();

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('reportes.notas_alumnos', [
                'grupo' => $grupo,
                'estudiantes' => $estudiantes
            ]);
            return $pdf->download("Notas_{$grupo->materia_nombre}_{$grupo_codigo}.pdf");
        }

        if ($format === 'csv') {
            $headers = [
                "Content-type"        => "text/csv; charset=UTF-8",
                "Content-Disposition" => "attachment; filename=Notas_{$grupo->materia_nombre}_{$grupo_codigo}.csv",
                "Pragma"              => "no-cache",
                "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
                "Expires"             => "0"
            ];

            $callback = function() use($estudiantes) {
                $file = fopen('php://output', 'w');
                // UTF-8 BOM for Excel
                fputs($file, $bom =(chr(0xEF) . chr(0xBB) . chr(0xBF)));
                fputcsv($file, ['Nro', 'C.I.', 'Apellido Paterno', 'Apellido Materno', 'Nombres', 'Parcial 1', 'Parcial 2', 'Examen Final', 'Promedio Final', 'Estado']);
                
                foreach ($estudiantes as $index => $alumno) {
                    fputcsv($file, [
                        $index + 1,
                        $alumno->ci,
                        $alumno->apellido_paterno,
                        $alumno->apellido_materno,
                        $alumno->nombres,
                        $alumno->nota_p1 ?? '0.00',
                        $alumno->nota_p2 ?? '0.00',
                        $alumno->nota_p3 ?? '0.00',
                        $alumno->promedio_final ?? '0.00',
                        $alumno->estado_materia ?? 'Reprobado'
                    ]);
                }
                fclose($file);
            };

            return Response::stream($callback, 200, $headers);
        }

        abort(404);
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

        // Obtener todas sus inscripciones a materias (grupo)
        $inscripciones = DB::table('postulacion as p')
            ->join('inscripciones_cup as i', 'p.codigo', '=', 'i.postulacion_codigo')
            ->join('grupo as g', 'i.grupo_codigo', '=', 'g.codigo')
            ->join('materia as m', 'g.materia_id', '=', 'm.id')
            ->leftJoin('evaluaciones as ev', 'i.id', '=', 'ev.inscripcion_id')
            ->where('p.postulante_id', $postulante->id)
            ->select('i.id as inscripcion_id', 'm.id as materia_id', 'm.nombre as materia_nombre', 'g.codigo as grupo_codigo', 'g.nombre as grupo_nombre', 'ev.nota_p1', 'ev.nota_p2', 'ev.nota_p3', 'ev.promedio_final', 'ev.estado_materia')
            ->get();

        if ($inscripciones->isEmpty()) {
            return Inertia::render('Modulos/aula_virtual/Examenes/Index', [
                'rol' => 'postulante',
                'inscripciones' => [],
                'examenes' => []
            ]);
        }

        // Determinar el turno del postulante basándonos en el código de su grupo
        $grupoCodigo = $inscripciones->first()->grupo_codigo;
        $letra = strtoupper(substr($grupoCodigo, 0, 1));
        $turno = 'Virtual';
        if ($letra === 'M') $turno = 'Mañana';
        elseif ($letra === 'T') $turno = 'Tarde';
        elseif ($letra === 'N') $turno = 'Noche';
        elseif ($letra === 'V') $turno = 'Virtual';

        $ahora = Carbon::now();
        
        // Buscar exámenes programados para su turno global
        $examenes_disponibles = DB::table('examen as e')
            ->where('e.turno', $turno)
            ->where('e.fecha_inicio', '<=', $ahora)
            ->where('e.fecha_fin', '>=', $ahora)
            ->select('e.*')
            ->get();

        // Obtener intentos realizados para saber si ya dio este examen global
        // Basta con verificar si rindió el examen para AL MENOS UNA de sus materias (pues se califica todo junto)
        $inscripcionesIds = $inscripciones->pluck('inscripcion_id')->toArray();
        $intentos = DB::table('intento_examen')
            ->whereIn('inscripcion_id', $inscripcionesIds)
            ->get()
            ->keyBy('examen_id');

        foreach ($examenes_disponibles as $e) {
            $e->ya_realizado = isset($intentos[$e->id]);
            // No enviar el password al frontend en la lista por seguridad
            unset($e->password);
        }

        return Inertia::render('Modulos/aula_virtual/Examenes/Index', [
            'rol' => 'postulante',
            'inscripciones' => $inscripciones,
            'examenes' => $examenes_disponibles,
            'turno' => $turno
        ]);
    }

    public function rendir($id, Request $request)
    {
        $user = $request->user();
        if ($user->rol_id != 3) abort(403);

        $request->validate([
            'password' => 'required|string'
        ]);

        $perfil = DB::table('perfil')->where('usuario_id', $user->id)->first();
        $postulante = DB::table('postulante')->where('id', $perfil->id)->first();

        $examen = DB::table('examen')->where('id', $id)->first();
        if (!$examen) abort(404, 'Examen no encontrado');

        // Validar contraseña
        if ($examen->password !== $request->password) {
            return redirect()->route('examenes.index')->with('error', 'Contraseña incorrecta.');
        }

        $ahora = Carbon::now();
        if ($ahora < Carbon::parse($examen->fecha_inicio) || $ahora > Carbon::parse($examen->fecha_fin)) {
            return redirect()->route('examenes.index')->with('error', 'El examen no está en su periodo activo.');
        }

        // Obtener inscripciones del postulante para saber de qué materias extraer preguntas
        $inscripciones = DB::table('postulacion as p')
            ->join('inscripciones_cup as i', 'p.codigo', '=', 'i.postulacion_codigo')
            ->join('grupo as g', 'i.grupo_codigo', '=', 'g.codigo')
            ->where('p.postulante_id', $postulante->id)
            ->select('i.id as inscripcion_id', 'g.materia_id')
            ->get();

        if ($inscripciones->isEmpty()) {
            return redirect()->route('examenes.index')->with('error', 'No estás inscrito en ninguna materia.');
        }

        // Verificar doble intento con cualquiera de sus inscripciones
        $inscripcionesIds = $inscripciones->pluck('inscripcion_id')->toArray();
        $intento = DB::table('intento_examen')
            ->where('examen_id', $examen->id)
            ->whereIn('inscripcion_id', $inscripcionesIds)
            ->first();

        if ($intento) {
            return redirect()->route('examenes.index')->with('error', 'Ya realizaste este examen.');
        }

        // Extraer preguntas según la configuración global del examen
        $configuracionMaterias = DB::table('examen_materia')->where('examen_id', $examen->id)->get();
        $preguntas = collect();
        $materiasInscritasIds = $inscripciones->pluck('materia_id')->toArray();

        foreach ($configuracionMaterias as $config) {
            // Solo extraemos preguntas si el postulante está inscrito en esa materia (generalmente están en todas)
            if (in_array($config->materia_id, $materiasInscritasIds)) {
                $preguntasMateria = DB::table('pregunta')
                    ->join('materia', 'pregunta.materia_id', '=', 'materia.id')
                    ->where('pregunta.materia_id', $config->materia_id)
                    ->inRandomOrder()
                    ->limit($config->cantidad_preguntas)
                    ->select('pregunta.id', 'pregunta.materia_id', 'materia.nombre as materia_nombre', 'pregunta.enunciado', 'pregunta.opcion_a', 'pregunta.opcion_b', 'pregunta.opcion_c', 'pregunta.opcion_d')
                    ->get();
                
                $preguntas = $preguntas->merge($preguntasMateria);
            }
        }

        if ($preguntas->isEmpty()) {
            return redirect()->route('examenes.index')->with('error', 'No hay preguntas disponibles para este examen global.');
        }

        // Shuffle all questions so they are mixed
        $preguntas = $preguntas->shuffle();

        unset($examen->password); // No mandarla al frontend Rendir.jsx
        
        return Inertia::render('Modulos/aula_virtual/Examenes/Rendir', [
            'examen' => $examen,
            'preguntas' => $preguntas
        ]);
    }

    public function calificar($id, Request $request)
    {
        $user = $request->user();
        if ($user->rol_id != 3) abort(403);

        $request->validate([
            'respuestas' => 'required|array'
        ]);

        $perfil = DB::table('perfil')->where('usuario_id', $user->id)->first();
        $postulante = DB::table('postulante')->where('id', $perfil->id)->first();

        $examen = DB::table('examen')->where('id', $id)->first();
        if (!$examen) abort(404);

        // Obtener todas las inscripciones del postulante
        $inscripciones = DB::table('postulacion as p')
            ->join('inscripciones_cup as i', 'p.codigo', '=', 'i.postulacion_codigo')
            ->join('grupo as g', 'i.grupo_codigo', '=', 'g.codigo')
            ->where('p.postulante_id', $postulante->id)
            ->select('i.id as inscripcion_id', 'g.materia_id')
            ->get();

        if ($inscripciones->isEmpty()) {
            return redirect()->route('examenes.index')->with('error', 'No estás inscrito en ninguna materia.');
        }

        // Validar doble envío global
        $inscripcionesIds = $inscripciones->pluck('inscripcion_id')->toArray();
        $intento = DB::table('intento_examen')
            ->where('examen_id', $examen->id)
            ->whereIn('inscripcion_id', $inscripcionesIds)
            ->first();

        if ($intento) {
            return redirect()->route('examenes.index')->with('error', 'Ya se registró la calificación de este examen global.');
        }

        // Configuración de cantidades por materia
        $configuracionMaterias = DB::table('examen_materia')->where('examen_id', $examen->id)->get()->keyBy('materia_id');

        // Agrupar respuestas por materia evaluándolas en el camino
        $resultadosPorMateria = [];
        foreach ($inscripciones as $insc) {
            if (isset($configuracionMaterias[$insc->materia_id])) {
                $resultadosPorMateria[$insc->materia_id] = [
                    'correctas' => 0,
                    'total' => $configuracionMaterias[$insc->materia_id]->cantidad_preguntas,
                    'inscripcion_id' => $insc->inscripcion_id
                ];
            }
        }

        foreach ($request->respuestas as $res) {
            $pregunta = DB::table('pregunta')->where('id', $res['pregunta_id'])->first();
            if ($pregunta && isset($resultadosPorMateria[$pregunta->materia_id])) {
                if ($pregunta->respuesta_correcta === $res['seleccionada']) {
                    $resultadosPorMateria[$pregunta->materia_id]['correctas']++;
                }
            }
        }

        DB::beginTransaction();
        try {
            foreach ($resultadosPorMateria as $materiaId => $data) {
                $notaPura100 = 0;
                if ($data['total'] > 0) {
                    $notaPura100 = ($data['correctas'] / $data['total']) * 100;
                }

                // Registrar intento por cada materia
                DB::table('intento_examen')->insert([
                    'examen_id' => $examen->id,
                    'inscripcion_id' => $data['inscripcion_id'],
                    'nota_obtenida' => $notaPura100,
                    'fecha_realizacion' => Carbon::now()
                ]);

                // Actualizar o crear Evaluaciones
                $eval = DB::table('evaluaciones')->where('inscripcion_id', $data['inscripcion_id'])->first();
                if (!$eval) {
                    $evalId = DB::table('evaluaciones')->insertGetId([
                        'inscripcion_id' => $data['inscripcion_id'],
                        'nota_p1' => 0, 'nota_p2' => 0, 'nota_p3' => 0, 'promedio_final' => 0,
                        'estado_materia' => 'Reprobado'
                    ]);
                    $eval = DB::table('evaluaciones')->where('id', $evalId)->first();
                }

                $updateData = [];
                // Ponderar: 30% Parcial 1 y 2, 40% Final
                if ($examen->tipo === 'Parcial 1') {
                    $updateData['nota_p1'] = $notaPura100 * 0.30;
                } elseif ($examen->tipo === 'Parcial 2') {
                    $updateData['nota_p2'] = $notaPura100 * 0.30;
                } elseif ($examen->tipo === 'Examen Final' || $examen->tipo === 'Final') {
                    $updateData['nota_p3'] = $notaPura100 * 0.40;
                }

                $p1 = isset($updateData['nota_p1']) ? $updateData['nota_p1'] : $eval->nota_p1;
                $p2 = isset($updateData['nota_p2']) ? $updateData['nota_p2'] : $eval->nota_p2;
                $p3 = isset($updateData['nota_p3']) ? $updateData['nota_p3'] : $eval->nota_p3;
                
                $promedioFinal = $p1 + $p2 + $p3;
                $updateData['promedio_final'] = $promedioFinal;
                $updateData['estado_materia'] = $promedioFinal >= 60 ? 'Aprobado' : 'Reprobado';

                DB::table('evaluaciones')
                    ->where('inscripcion_id', $data['inscripcion_id'])
                    ->update($updateData);
            }
            DB::commit();
            return redirect()->route('examenes.index')->with('success', 'Examen Global enviado correctamente. Se han calificado tus materias correspondientes.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('examenes.index')->with('error', 'Error al procesar calificación: ' . $e->getMessage());
        }
    }
}
