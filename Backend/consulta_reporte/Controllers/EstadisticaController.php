<?php

namespace Backend\consulta_reporte\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

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
            ->orderBy('aÑo', 'desc')
            ->orderBy('semestre', 'desc')
            ->get()
            ->map(fn($g) => [
                'id' => $g->id,
                'label' => "{$g->semestre}-{$g->aÑo}",
                'semestre' => $g->semestre,
                'anio' => $g->aÑo,
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
            $ultima = DB::table('gestion')->orderBy('aÑo', 'desc')->orderBy('semestre', 'desc')->first();
            $gestionIds = $ultima ? [$ultima->id] : [];
        }

        $data = [];

        foreach ($gestionIds as $gestionId) {
            $gestion = DB::table('gestion')->where('id', $gestionId)->first();
            if (!$gestion) continue;

            $label = "{$gestion->semestre}-{$gestion->aÑo}";

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
}
