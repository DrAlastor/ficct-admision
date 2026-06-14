<?php

namespace Backend\consulta_reporte\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * CU27 - Gestionar Estadísticas
 */
class EstadisticaController extends Controller
{
    /**
     * CU27 - Gestionar Estadísticas
     * Dashboard principal de estadísticas gerenciales
     */
    public function index()
    {
        // ════════════════════════════════════════════════════
        // 1. LISTA DE GESTIONES (para los filtros)
        // ════════════════════════════════════════════════════
        $gestiones = DB::table('gestion')
            ->orderBy('anio', 'desc')
            ->orderBy('semestre', 'desc')
            ->get()
            ->map(fn($g) => [
                'id' => $g->id,
                'label' => "{$g->semestre}-{$g->anio}",
                'semestre' => $g->semestre,
                'anio' => $g->anio,
            ]);

        // ════════════════════════════════════════════════════
        // 2. CARRERAS disponibles
        // ════════════════════════════════════════════════════
        $carreras = DB::table('carrera')->get()->map(fn($c) => [
            'codigo' => $c->codigo,
            'nombre' => $c->nombre,
            'sigla' => $c->sigla,
            'cupo_maximo' => $c->cupo_maximo,
        ]);

        // ════════════════════════════════════════════════════
        // 3. MATERIAS
        // ════════════════════════════════════════════════════
        $materias = DB::table('materia')->get()->map(fn($m) => [
            'id' => $m->id,
            'nombre' => $m->nombre,
            'sigla' => $m->sigla,
        ]);

        return Inertia::render('Modulos/consulta_reporte/GestionarEstadisticas/Index', [
            'gestiones' => $gestiones,
            'carreras' => $carreras,
            'materias' => $materias,
        ]);
    }

    /**
     * Endpoint AJAX para obtener datos estadísticos filtrados por gestión(es)
     */
    public function getData(Request $request)
    {
        $gestionIds = $request->input('gestiones', []);
        
        if (empty($gestionIds)) {
            // Si no se pasa ninguna, usar la más reciente
            $ultima = DB::table('gestion')->orderBy('anio', 'desc')->orderBy('semestre', 'desc')->first();
            $gestionIds = $ultima ? [$ultima->id] : [];
        }

        $data = [];

        foreach ($gestionIds as $gestionId) {
            $gestion = DB::table('gestion')->where('id', $gestionId)->first();
            if (!$gestion) continue;

            $label = "{$gestion->semestre}-{$gestion->anio}";

            // ─────────────────────────────────────────────
            // A. POSTULANTES
            // ─────────────────────────────────────────────
            $postulaciones = DB::table('postulacion')
                ->where('gestion_id', $gestionId)
                ->pluck('codigo')
                ->toArray();

            $totalPostulantes = count($postulaciones);

            // Postulantes por sexo
            $postulantePorSexo = DB::table('postulacion as p')
                ->join('perfil as pf', 'p.postulante_id', '=', 'pf.id')
                ->where('p.gestion_id', $gestionId)
                ->select('pf.sexo', DB::raw('COUNT(*) as total'))
                ->groupBy('pf.sexo')
                ->get()
                ->pluck('total', 'sexo')
                ->toArray();

            // Postulantes por carrera (1ra opción)
            $postulantePorCarrera = DB::table('postulacion as p')
                ->join('postulacion_carrera as pc', 'p.codigo', '=', 'pc.postulacion_codigo')
                ->join('carrera as c', 'pc.carrera_codigo', '=', 'c.codigo')
                ->where('p.gestion_id', $gestionId)
                ->where('pc.prioridad', 1)
                ->select('c.nombre as carrera', DB::raw('COUNT(*) as total'))
                ->groupBy('c.nombre')
                ->get()
                ->toArray();

            // Postulantes por colegio (Top 10)
            $postulantePorColegio = DB::table('postulacion as p')
                ->join('postulante as pos', 'p.postulante_id', '=', 'pos.id')
                ->where('p.gestion_id', $gestionId)
                ->select('pos.colegio_procedencia as colegio', DB::raw('COUNT(*) as total'))
                ->groupBy('pos.colegio_procedencia')
                ->orderByDesc('total')
                ->limit(10)
                ->get()
                ->toArray();

            // Postulantes por ciudad
            $postulantePorCiudad = DB::table('postulacion as p')
                ->join('postulante as pos', 'p.postulante_id', '=', 'pos.id')
                ->where('p.gestion_id', $gestionId)
                ->select('pos.ciudad', DB::raw('COUNT(*) as total'))
                ->groupBy('pos.ciudad')
                ->orderByDesc('total')
                ->get()
                ->toArray();

            // ─────────────────────────────────────────────
            // B. NOTAS Y RENDIMIENTO
            // ─────────────────────────────────────────────
            $inscripciones = DB::table('inscripciones_cup as ic')
                ->join('postulacion as p', 'ic.postulacion_codigo', '=', 'p.codigo')
                ->where('p.gestion_id', $gestionId)
                ->pluck('ic.id')
                ->toArray();

            // Evaluaciones de esta gestión
            $evaluaciones = DB::table('evaluaciones')
                ->whereIn('inscripcion_id', $inscripciones ?: [0])
                ->get();

            // Promedios por materia
            $promediosPorMateria = DB::table('evaluaciones as e')
                ->join('inscripciones_cup as ic', 'e.inscripcion_id', '=', 'ic.id')
                ->join('grupo as g', 'ic.grupo_codigo', '=', 'g.codigo')
                ->join('materia as m', 'g.materia_id', '=', 'm.id')
                ->join('postulacion as p', 'ic.postulacion_codigo', '=', 'p.codigo')
                ->where('p.gestion_id', $gestionId)
                ->select('m.nombre as materia', 'm.sigla',
                    DB::raw('ROUND(AVG(e.promedio_final)::numeric, 2) as promedio'),
                    DB::raw('MAX(e.promedio_final) as max_nota'),
                    DB::raw('MIN(CASE WHEN e.promedio_final > 0 THEN e.promedio_final END) as min_nota'),
                    DB::raw('COUNT(*) as total_evaluaciones')
                )
                ->groupBy('m.nombre', 'm.sigla')
                ->get()
                ->toArray();

            // Aprobados y reprobados totales
            $aprobados = $evaluaciones->where('estado_materia', 'Aprobado')->count();
            $reprobados = $evaluaciones->where('estado_materia', 'Reprobado')->count();
            $cursando = $evaluaciones->where('estado_materia', 'Cursando')->count();

            // Distribución de notas (rangos)
            $distribucionNotas = [
                '0-20' => $evaluaciones->where('promedio_final', '>=', 0)->where('promedio_final', '<', 20)->where('promedio_final', '>', 0)->count(),
                '20-40' => $evaluaciones->where('promedio_final', '>=', 20)->where('promedio_final', '<', 40)->count(),
                '40-51' => $evaluaciones->where('promedio_final', '>=', 40)->where('promedio_final', '<', 51)->count(),
                '51-60' => $evaluaciones->where('promedio_final', '>=', 51)->where('promedio_final', '<', 60)->count(),
                '60-70' => $evaluaciones->where('promedio_final', '>=', 60)->where('promedio_final', '<', 70)->count(),
                '70-80' => $evaluaciones->where('promedio_final', '>=', 70)->where('promedio_final', '<', 80)->count(),
                '80-90' => $evaluaciones->where('promedio_final', '>=', 80)->where('promedio_final', '<', 90)->count(),
                '90-100' => $evaluaciones->where('promedio_final', '>=', 90)->where('promedio_final', '<=', 100)->count(),
            ];

            // Top 10 mejores alumnos (promedio general por postulante)
            $topMejores = DB::table('evaluaciones as e')
                ->join('inscripciones_cup as ic', 'e.inscripcion_id', '=', 'ic.id')
                ->join('postulacion as p', 'ic.postulacion_codigo', '=', 'p.codigo')
                ->join('perfil as pf', 'p.postulante_id', '=', 'pf.id')
                ->where('p.gestion_id', $gestionId)
                ->where('e.estado_materia', '!=', 'Cursando')
                ->select(
                    'pf.nombres', 'pf.apellido_paterno', 'pf.apellido_materno', 'pf.ci',
                    DB::raw('ROUND(AVG(e.promedio_final)::numeric, 2) as promedio_general')
                )
                ->groupBy('pf.id', 'pf.nombres', 'pf.apellido_paterno', 'pf.apellido_materno', 'pf.ci')
                ->orderByDesc('promedio_general')
                ->limit(10)
                ->get()
                ->toArray();

            // Top 10 peores alumnos
            $topPeores = DB::table('evaluaciones as e')
                ->join('inscripciones_cup as ic', 'e.inscripcion_id', '=', 'ic.id')
                ->join('postulacion as p', 'ic.postulacion_codigo', '=', 'p.codigo')
                ->join('perfil as pf', 'p.postulante_id', '=', 'pf.id')
                ->where('p.gestion_id', $gestionId)
                ->where('e.estado_materia', '!=', 'Cursando')
                ->select(
                    'pf.nombres', 'pf.apellido_paterno', 'pf.apellido_materno', 'pf.ci',
                    DB::raw('ROUND(AVG(e.promedio_final)::numeric, 2) as promedio_general')
                )
                ->groupBy('pf.id', 'pf.nombres', 'pf.apellido_paterno', 'pf.apellido_materno', 'pf.ci')
                ->orderBy('promedio_general')
                ->limit(10)
                ->get()
                ->toArray();

            // ─────────────────────────────────────────────
            // C. APROBADOS/REPROBADOS POR MATERIA
            // ─────────────────────────────────────────────
            $aprobadosPorMateria = DB::table('evaluaciones as e')
                ->join('inscripciones_cup as ic', 'e.inscripcion_id', '=', 'ic.id')
                ->join('grupo as g', 'ic.grupo_codigo', '=', 'g.codigo')
                ->join('materia as m', 'g.materia_id', '=', 'm.id')
                ->join('postulacion as p', 'ic.postulacion_codigo', '=', 'p.codigo')
                ->where('p.gestion_id', $gestionId)
                ->whereIn('e.estado_materia', ['Aprobado', 'Reprobado'])
                ->select(
                    'm.nombre as materia',
                    DB::raw("SUM(CASE WHEN e.estado_materia = 'Aprobado' THEN 1 ELSE 0 END) as aprobados"),
                    DB::raw("SUM(CASE WHEN e.estado_materia = 'Reprobado' THEN 1 ELSE 0 END) as reprobados")
                )
                ->groupBy('m.nombre')
                ->get()
                ->toArray();

            // ─────────────────────────────────────────────
            // D. GRUPOS
            // ─────────────────────────────────────────────
            $gruposRendimiento = DB::table('evaluaciones as e')
                ->join('inscripciones_cup as ic', 'e.inscripcion_id', '=', 'ic.id')
                ->join('grupo as g', 'ic.grupo_codigo', '=', 'g.codigo')
                ->join('materia as m', 'g.materia_id', '=', 'm.id')
                ->join('postulacion as p', 'ic.postulacion_codigo', '=', 'p.codigo')
                ->where('p.gestion_id', $gestionId)
                ->where('e.estado_materia', '!=', 'Cursando')
                ->select(
                    'g.nombre as grupo',
                    'm.nombre as materia',
                    DB::raw('ROUND(AVG(e.promedio_final)::numeric, 2) as promedio'),
                    DB::raw("SUM(CASE WHEN e.estado_materia = 'Aprobado' THEN 1 ELSE 0 END) as aprobados"),
                    DB::raw("SUM(CASE WHEN e.estado_materia = 'Reprobado' THEN 1 ELSE 0 END) as reprobados"),
                    DB::raw('COUNT(*) as total_inscritos')
                )
                ->groupBy('g.nombre', 'm.nombre')
                ->get()
                ->toArray();

            // ─────────────────────────────────────────────
            // E. DOCENTES
            // ─────────────────────────────────────────────
            $docentesData = DB::table('docente as d')
                ->join('perfil as pf', 'd.id', '=', 'pf.id')
                ->leftJoin('carga_horaria as ch', 'd.id', '=', 'ch.docente_id')
                ->leftJoin('grupo as g', 'ch.grupo_codigo', '=', 'g.codigo')
                ->leftJoin('horario as h', 'g.codigo', '=', 'h.grupo_codigo')
                ->select(
                    'd.id',
                    'pf.nombres', 'pf.apellido_paterno',
                    DB::raw('COUNT(DISTINCT ch.grupo_codigo) as total_grupos'),
                    DB::raw('COUNT(DISTINCT h.id) as total_sesiones_horario')
                )
                ->groupBy('d.id', 'pf.nombres', 'pf.apellido_paterno')
                ->get()
                ->toArray();

            // Horas por docente (calculado de horarios)
            $horasPorDocente = DB::table('carga_horaria as ch')
                ->join('horario as h', 'ch.grupo_codigo', '=', 'h.grupo_codigo')
                ->join('perfil as pf', 'ch.docente_id', '=', 'pf.id')
                ->select(
                    'ch.docente_id',
                    'pf.nombres', 'pf.apellido_paterno',
                    DB::raw("SUM(EXTRACT(EPOCH FROM (h.hora_fin::time - h.hora_inicio::time)) / 3600) as total_horas")
                )
                ->groupBy('ch.docente_id', 'pf.nombres', 'pf.apellido_paterno')
                ->orderByDesc('total_horas')
                ->get()
                ->toArray();

            // Asistencias de docentes (DOCENTE_PRESENTE = true)
            $asistenciasDocente = DB::table('sesion_asistencia as sa')
                ->join('perfil as pf', 'sa.docente_id', '=', 'pf.id')
                ->select(
                    'sa.docente_id',
                    'pf.nombres', 'pf.apellido_paterno',
                    DB::raw("SUM(CASE WHEN sa.docente_presente = true THEN 1 ELSE 0 END) as asistencias"),
                    DB::raw("SUM(CASE WHEN sa.docente_presente = false THEN 1 ELSE 0 END) as inasistencias"),
                    DB::raw('COUNT(*) as total_sesiones')
                )
                ->groupBy('sa.docente_id', 'pf.nombres', 'pf.apellido_paterno')
                ->get()
                ->toArray();

            // Asistencias de postulantes (Top 10 con más/menos asistencia)
            $asistenciasPostulante = DB::table('registro_asistencia as ra')
                ->join('perfil as pf', 'ra.postulante_id', '=', 'pf.id')
                ->join('sesion_asistencia as sa', 'ra.sesion_id', '=', 'sa.id')
                ->select(
                    'ra.postulante_id',
                    'pf.nombres', 'pf.apellido_paterno', 'pf.apellido_materno',
                    DB::raw("SUM(CASE WHEN ra.estado = 'Presente' THEN 1 ELSE 0 END) as presentes"),
                    DB::raw("SUM(CASE WHEN ra.estado = 'Falta' THEN 1 ELSE 0 END) as faltas"),
                    DB::raw('COUNT(*) as total_registros')
                )
                ->groupBy('ra.postulante_id', 'pf.nombres', 'pf.apellido_paterno', 'pf.apellido_materno')
                ->get()
                ->toArray();

            // ─────────────────────────────────────────────
            // F. ADMISIÓN
            // ─────────────────────────────────────────────
            $estadosAdmision = DB::table('postulacion')
                ->where('gestion_id', $gestionId)
                ->select('estado', DB::raw('COUNT(*) as total'))
                ->groupBy('estado')
                ->get()
                ->toArray();

            // Admitidos por carrera
            $admitidosPorCarrera = DB::table('postulacion as p')
                ->where('p.gestion_id', $gestionId)
                ->where('p.estado', 'like', 'Aceptado%')
                ->select('p.estado', DB::raw('COUNT(*) as total'))
                ->groupBy('p.estado')
                ->get()
                ->toArray();

            // ─────────────────────────────────────────────
            // G. PAGOS
            // ─────────────────────────────────────────────
            $pagosPorMetodo = DB::table('pago as pa')
                ->join('postulacion as p', 'pa.postulacion_codigo', '=', 'p.codigo')
                ->where('p.gestion_id', $gestionId)
                ->select('pa.metodo_pago', DB::raw('COUNT(*) as cantidad'), DB::raw('SUM(pa.monto) as total_monto'))
                ->groupBy('pa.metodo_pago')
                ->get()
                ->toArray();

            $totalIngresos = DB::table('pago as pa')
                ->join('postulacion as p', 'pa.postulacion_codigo', '=', 'p.codigo')
                ->where('p.gestion_id', $gestionId)
                ->where('pa.estado', 'Completado')
                ->sum('pa.monto');

            // ─────────────────────────────────────────────
            // H. DEMOGRAFÍA
            // ─────────────────────────────────────────────
            $nacionalidades = DB::table('postulacion as p')
                ->join('perfil as pf', 'p.postulante_id', '=', 'pf.id')
                ->where('p.gestion_id', $gestionId)
                ->select('pf.nacionalidad', DB::raw('COUNT(*) as total'))
                ->groupBy('pf.nacionalidad')
                ->orderByDesc('total')
                ->get()
                ->toArray();

            // Compilar datos de esta gestión
            $data[] = [
                'gestion_id' => $gestionId,
                'label' => $label,
                'postulantes' => [
                    'total' => $totalPostulantes,
                    'por_sexo' => $postulantePorSexo,
                    'por_carrera' => $postulantePorCarrera,
                    'por_colegio' => $postulantePorColegio,
                    'por_ciudad' => $postulantePorCiudad,
                    'nacionalidades' => $nacionalidades,
                ],
                'notas' => [
                    'promedios_por_materia' => $promediosPorMateria,
                    'aprobados' => $aprobados,
                    'reprobados' => $reprobados,
                    'cursando' => $cursando,
                    'distribucion' => $distribucionNotas,
                    'aprobados_por_materia' => $aprobadosPorMateria,
                    'top_mejores' => $topMejores,
                    'top_peores' => $topPeores,
                ],
                'grupos' => $gruposRendimiento,
                'docentes' => [
                    'listado' => $docentesData,
                    'horas' => $horasPorDocente,
                    'asistencias_docente' => $asistenciasDocente,
                    'asistencias_postulante' => $asistenciasPostulante,
                ],
                'admision' => [
                    'estados' => $estadosAdmision,
                    'admitidos_por_carrera' => $admitidosPorCarrera,
                ],
                'pagos' => [
                    'por_metodo' => $pagosPorMetodo,
                    'total_ingresos' => $totalIngresos,
                ],
            ];
        }

        return response()->json($data);
    }

    /**
     * Importar historial de notas, postulaciones y grupos desde un CSV/Excel
     */
    public function importarHistorial(Request $request)
    {
        set_time_limit(300);

        $validated = $request->validate([
            'gestion_id' => 'required|exists:gestion,id',
            'registros' => 'required|array|min:1',
            'registros.*.ci' => 'required|string',
            'registros.*.nombres' => 'required|string',
            'registros.*.apellido_paterno' => 'nullable|string',
            'registros.*.apellido_materno' => 'nullable|string',
            'registros.*.email' => 'nullable|string',
            'registros.*.sexo' => 'nullable|string',
            'registros.*.colegio' => 'nullable|string',
            'registros.*.ciudad' => 'nullable|string',
            'registros.*.carrera' => 'required|string',
            'registros.*.materia' => 'required|string',
            'registros.*.grupo' => 'required|string',
            'registros.*.nota_p1' => 'nullable|numeric',
            'registros.*.nota_p2' => 'nullable|numeric',
            'registros.*.nota_p3' => 'nullable|numeric',
            'registros.*.promedio_final' => 'required|numeric',
            'registros.*.estado_materia' => 'required|string',
            'registros.*.monto_pago' => 'nullable|numeric',
            'registros.*.metodo_pago' => 'nullable|string',
            'registros.*.nro_recibo' => 'nullable|string',
            'registros.*.ci_docente' => 'nullable|string',
            'registros.*.nombre_docente' => 'nullable|string',
            'registros.*.apellido_docente' => 'nullable|string',
            'registros.*.profesion_docente' => 'nullable|string',
        ]);

        $gestionId = $validated['gestion_id'];
        $registros = $validated['registros'];

        DB::beginTransaction();
        try {
            // Cargar diccionarios en memoria para no saturar Supabase
            $carreras = DB::table('carrera')->get()->keyBy(fn($c) => strtolower(trim($c->nombre)));
            $carrerasSigla = DB::table('carrera')->get()->keyBy(fn($c) => strtolower(trim($c->sigla)));
            $materias = DB::table('materia')->get()->keyBy(fn($m) => strtolower(trim($m->sigla)));
            
            // Grupos de esta gestión
            $grupos = DB::table('grupo')->where('gestion_id', $gestionId)->get();
            $gruposDict = [];
            foreach ($grupos as $g) {
                $gruposDict[$g->materia_id . '-' . strtolower(trim($g->nombre))] = $g->codigo;
            }

            // Perfiles existentes
            $cisAImportar = array_unique(array_column($registros, 'ci'));
            $perfiles = DB::table('perfil')->whereIn('ci', $cisAImportar)->get()->keyBy('ci');
            $postulantes = DB::table('postulante')->whereIn('id', $perfiles->pluck('id'))->get()->keyBy('id');

            // Postulaciones de esta gestión
            $postulaciones = DB::table('postulacion')
                ->where('gestion_id', $gestionId)
                ->whereIn('postulante_id', $perfiles->pluck('id'))
                ->get()
                ->keyBy('postulante_id');

            // IDs autoincrementables
            $nextUsuarioId = DB::table('usuario')->max('id') + 1;
            $nextPerfilId = DB::table('perfil')->max('id') + 1;
            $nextMateriaId = DB::table('materia')->max('id') + 1;
            $nextGrupoCodigo = DB::table('grupo')->max('codigo') + 1;
            $nextPostulacionCodigo = DB::table('postulacion')->max('codigo') + 1;
            $nextInscripcionId = DB::table('inscripciones_cup')->max('id') + 1;
            $nextEvaluacionId = DB::table('evaluaciones')->max('id') + 1;
            
            // Caches for Pagos and Docentes to avoid duplicates in the loop
            $pagosInsertados = []; // by postulacion_codigo
            $docentesInsertados = []; // by ci_docente
            $cargaHorariaInsertada = []; // by docente_id-grupo_codigo

            // Arreglos para Bulk Insert
            $insertsUsuario = [];
            $insertsPerfil = [];
            $insertsPostulante = [];
            $insertsPostulacion = [];
            $insertsPostulacionCarrera = [];
            $insertsInscripciones = [];
            $insertsEvaluaciones = [];
            $insertsPago = [];
            $insertsDocente = [];
            $insertsCargaHoraria = [];

            foreach ($registros as $idx => $row) {
                $ci = $row['ci'];
                
                // 1. OBTENER O CREAR CARRERA
                $carreraKey = strtolower(trim($row['carrera']));
                $carreraId = null;
                if (isset($carreras[$carreraKey])) {
                    $carreraId = $carreras[$carreraKey]->codigo;
                } elseif (isset($carrerasSigla[$carreraKey])) {
                    $carreraId = $carrerasSigla[$carreraKey]->codigo;
                } else {
                    $carreraId = $carreras->first()->codigo ?? 1;
                }

                // 2. OBTENER O CREAR MATERIA
                $materiaKey = strtolower(trim($row['materia']));
                if (!isset($materias[$materiaKey])) {
                    DB::table('materia')->insert([
                        'id' => $nextMateriaId,
                        'nombre' => strtoupper(trim($row['materia'])),
                        'sigla' => strtoupper(trim($row['materia']))
                    ]);
                    $materias[$materiaKey] = (object)['id' => $nextMateriaId, 'sigla' => strtoupper(trim($row['materia']))];
                    $materiaId = $nextMateriaId;
                    $nextMateriaId++;
                } else {
                    $materiaId = $materias[$materiaKey]->id;
                }

                // 3. OBTENER O CREAR GRUPO
                $grupoNombre = strtoupper(trim($row['grupo']));
                $grupoKey = $materiaId . '-' . strtolower($grupoNombre);
                if (!isset($gruposDict[$grupoKey])) {
                    DB::table('grupo')->insert([
                        'codigo' => $nextGrupoCodigo,
                        'materia_id' => $materiaId,
                        'gestion_id' => $gestionId,
                        'nombre' => $grupoNombre,
                        'cupo' => 50,
                        'inscritos_actuales' => 0
                    ]);
                    $gruposDict[$grupoKey] = $nextGrupoCodigo;
                    $grupoCodigo = $nextGrupoCodigo;
                    $nextGrupoCodigo++;
                } else {
                    $grupoCodigo = $gruposDict[$grupoKey];
                }

                // 4. OBTENER O CREAR POSTULANTE
                $perfilId = null;
                if (!isset($perfiles[$ci])) {
                    $insertsUsuario[] = [
                        'id' => $nextUsuarioId,
                        'rol_id' => 4, // Postulante
                        'gestion_id' => $gestionId,
                        'codigo_inicio' => 'P' . $ci,
                        'password' => \Illuminate\Support\Facades\Hash::make($ci),
                        'estado' => 'Inactivo',
                    ];

                    $email = empty($row['email']) ? "{$ci}@postulante.com" : $row['email'];
                    $insertsPerfil[] = [
                        'id' => $nextPerfilId,
                        'usuario_id' => $nextUsuarioId,
                        'codigo' => 'P' . $ci,
                        'ci' => $ci,
                        'nombres' => $row['nombres'],
                        'apellido_paterno' => $row['apellido_paterno'] ?? '',
                        'apellido_materno' => $row['apellido_materno'] ?? '',
                        'email' => $email,
                        'sexo' => strtoupper(trim($row['sexo'])) === 'M' ? 'M' : 'F',
                    ];

                    $insertsPostulante[] = [
                        'id' => $nextPerfilId,
                        'colegio_procedencia' => $row['colegio'] ?? 'S/N',
                        'ciudad' => $row['ciudad'] ?? 'S/N',
                    ];

                    $perfiles[$ci] = (object)['id' => $nextPerfilId];
                    $perfilId = $nextPerfilId;
                    
                    $nextUsuarioId++;
                    $nextPerfilId++;
                } else {
                    $perfilId = $perfiles[$ci]->id;
                }

                // 5. OBTENER O CREAR POSTULACION
                if (!isset($postulaciones[$perfilId])) {
                    $insertsPostulacion[] = [
                        'codigo' => $nextPostulacionCodigo,
                        'postulante_id' => $perfilId,
                        'gestion_id' => $gestionId,
                        'fecha' => date('Y-m-d'),
                        'hora' => date('H:i:s'),
                        'estado' => $row['promedio_final'] >= 60 ? 'Aceptado' : 'Rechazado'
                    ];

                    $insertsPostulacionCarrera[] = [
                        'postulacion_codigo' => $nextPostulacionCodigo,
                        'carrera_codigo' => $carreraId,
                        'prioridad' => 1
                    ];

                    $postulaciones[$perfilId] = (object)['codigo' => $nextPostulacionCodigo];
                    $postulacionCodigo = $nextPostulacionCodigo;
                    $nextPostulacionCodigo++;
                } else {
                    $postulacionCodigo = $postulaciones[$perfilId]->codigo;
                }

                // 6. CREAR INSCRIPCION CUP
                $insertsInscripciones[] = [
                    'id' => $nextInscripcionId,
                    'postulacion_codigo' => $postulacionCodigo,
                    'grupo_codigo' => $grupoCodigo,
                    'fecha_inscripcion' => date('Y-m-d'),
                    'estado' => 'Activo'
                ];

                // 7. CREAR EVALUACION
                $insertsEvaluaciones[] = [
                    'id' => $nextEvaluacionId,
                    'inscripcion_id' => $nextInscripcionId,
                    'nota_p1' => $row['nota_p1'] ?? 0,
                    'nota_p2' => $row['nota_p2'] ?? 0,
                    'nota_p3' => $row['nota_p3'] ?? 0,
                    'promedio_final' => $row['promedio_final'] ?? 0,
                    'estado_materia' => $row['estado_materia'] ?? 'Reprobado'
                ];

                // 8. CREAR PAGO
                if (!empty($row['monto_pago']) && $row['monto_pago'] > 0) {
                    if (!isset($pagosInsertados[$postulacionCodigo])) {
                        $insertsPago[] = [
                            'postulacion_codigo' => $postulacionCodigo,
                            'nro_recibo' => $row['nro_recibo'] ?? 'REC-AUTO-' . $postulacionCodigo,
                            'monto' => $row['monto_pago'],
                            'metodo_pago' => $row['metodo_pago'] ?? 'Efectivo',
                            'estado' => 'Completado',
                            'fecha' => date('Y-m-d')
                        ];
                        $pagosInsertados[$postulacionCodigo] = true;
                    }
                }

                // 9. CREAR DOCENTE Y CARGA HORARIA
                if (!empty($row['ci_docente'])) {
                    $ciDocente = $row['ci_docente'];
                    $docenteId = null;

                    if (!isset($docentesInsertados[$ciDocente])) {
                        $docPerfil = DB::table('perfil')->where('ci', $ciDocente)->first();
                        if (!$docPerfil) {
                            $insertsUsuario[] = [
                                'id' => $nextUsuarioId,
                                'rol_id' => 2, // Docente
                                'gestion_id' => $gestionId,
                                'codigo_inicio' => 'D' . $ciDocente,
                                'password' => \Illuminate\Support\Facades\Hash::make($ciDocente),
                                'estado' => 'Inactivo',
                            ];

                            $insertsPerfil[] = [
                                'id' => $nextPerfilId,
                                'usuario_id' => $nextUsuarioId,
                                'codigo' => 'D' . $ciDocente,
                                'ci' => $ciDocente,
                                'nombres' => $row['nombre_docente'] ?? 'Docente',
                                'apellido_paterno' => $row['apellido_docente'] ?? '',
                                'apellido_materno' => '',
                                'email' => "{$ciDocente}@docente.com",
                                'sexo' => 'M',
                            ];

                            $insertsDocente[] = [
                                'id' => $nextPerfilId,
                                'profesion' => $row['profesion_docente'] ?? 'Profesional',
                                'grado_academico' => 'Licenciatura'
                            ];

                            $docenteId = $nextPerfilId;
                            $nextUsuarioId++;
                            $nextPerfilId++;
                        } else {
                            $docenteId = $docPerfil->id;
                            $docEntry = DB::table('docente')->where('id', $docenteId)->first();
                            if (!$docEntry) {
                                $insertsDocente[] = [
                                    'id' => $docenteId,
                                    'profesion' => $row['profesion_docente'] ?? 'Profesional',
                                    'grado_academico' => 'Licenciatura'
                                ];
                            }
                        }
                        $docentesInsertados[$ciDocente] = $docenteId;
                    } else {
                        $docenteId = $docentesInsertados[$ciDocente];
                    }

                    // Carga Horaria
                    $cargaKey = $docenteId . '-' . $grupoCodigo;
                    if (!isset($cargaHorariaInsertada[$cargaKey])) {
                        $existsCH = DB::table('carga_horaria')->where('docente_id', $docenteId)->where('grupo_codigo', $grupoCodigo)->exists();
                        if (!$existsCH) {
                            $insertsCargaHoraria[] = [
                                'docente_id' => $docenteId,
                                'grupo_codigo' => $grupoCodigo
                            ];
                        }
                        $cargaHorariaInsertada[$cargaKey] = true;
                    }
                }

                $nextInscripcionId++;
                $nextEvaluacionId++;
            }

            // EJECUTAR BULK INSERTS (Evita timeout de DB)
            if (count($insertsUsuario) > 0) DB::table('usuario')->insert($insertsUsuario);
            if (count($insertsPerfil) > 0) DB::table('perfil')->insert($insertsPerfil);
            if (count($insertsPostulante) > 0) DB::table('postulante')->insert($insertsPostulante);
            if (count($insertsDocente) > 0) DB::table('docente')->insert($insertsDocente);
            if (count($insertsPostulacion) > 0) DB::table('postulacion')->insert($insertsPostulacion);
            if (count($insertsPostulacionCarrera) > 0) DB::table('postulacion_carrera')->insert($insertsPostulacionCarrera);
            if (count($insertsInscripciones) > 0) DB::table('inscripciones_cup')->insert($insertsInscripciones);
            if (count($insertsEvaluaciones) > 0) DB::table('evaluaciones')->insert($insertsEvaluaciones);
            if (count($insertsPago) > 0) DB::table('pago')->insert($insertsPago);
            if (count($insertsCargaHoraria) > 0) DB::table('carga_horaria')->insert($insertsCargaHoraria);

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Historial importado correctamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al importar: ' . $e->getMessage()], 500);
        }
    }
}
