<?php

namespace Backend\consulta_reporte\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Backend\consulta_reporte\Services\GeminiAIService;

/**
 * CU28 - Gestionar Consultas
 */
class ConsultaController extends Controller
{
    /**
     * CU28 - Gestionar Consultas (Página principal)
     */
    public function index()
    {
        $gestiones = DB::table('gestion')
            ->orderBy('anio', 'desc')
            ->orderBy('semestre', 'desc')
            ->get()
            ->map(fn($g) => [
                'id' => $g->id,
                'label' => "{$g->semestre}-{$g->anio}",
            ]);

        $carreras = DB::table('carrera')->get();

        return Inertia::render('Modulos/consulta_reporte/GestionarConsultas/Index', [
            'gestiones' => $gestiones,
            'carreras' => $carreras,
        ]);
    }

    /**
     * Endpoint para procesar consultas en Lenguaje Natural (IA)
     */
    public function ejecutarConsultaIA(Request $request)
    {
        $request->validate([
            'query' => 'required|string|max:500',
            'gestion_id' => 'required|integer'
        ]);

        try {
            $gemini = new GeminiAIService();
            $sql = $gemini->generateSqlFromText($request->input('query'), $request->input('gestion_id'));

            // Validar seguridad muy básica (solo lectura)
            $sqlUpper = strtoupper($sql);
            if (
                strpos($sqlUpper, 'DELETE') !== false || 
                strpos($sqlUpper, 'UPDATE') !== false || 
                strpos($sqlUpper, 'INSERT') !== false || 
                strpos($sqlUpper, 'DROP') !== false ||
                strpos($sqlUpper, 'ALTER') !== false
            ) {
                return response()->json(['error' => 'La consulta generada contiene sentencias no permitidas. Sólo se permiten consultas SELECT.'], 403);
            }

            // Ejecutar la consulta generada
            // Se asume PostgreSQL. Usar TRANSACTION READ ONLY podría ser mejor pero DB::select es suficiente si validamos.
            $resultados = DB::select($sql);

            return response()->json([
                'success' => true,
                'sql' => $sql,
                'data' => $resultados
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ejecutar consultas predefinidas comunes
     */
    public function ejecutarPredefinida(Request $request)
    {
        $tipo = $request->input('tipo');
        $gestionId = $request->input('gestion_id');

        if (!$gestionId) {
            return response()->json(['error' => 'La gestión es requerida'], 400);
        }

        $resultados = [];

        switch ($tipo) {
            case 'alumnos_aprobados':
                // Consulta 1: Retorna la lista de alumnos que aprobaron una materia (estado_materia = 'Aprobado') en la gestión especificada
                // Orden: Nota Final descendente
                $resultados = DB::table('evaluaciones as e')
                    ->join('inscripciones_cup as ic', 'e.inscripcion_id', '=', 'ic.id')
                    ->join('postulacion as p', 'ic.postulacion_codigo', '=', 'p.codigo')
                    ->join('perfil as pf', 'p.postulante_id', '=', 'pf.id')
                    ->join('grupo as g', 'ic.grupo_codigo', '=', 'g.codigo')
                    ->join('materia as m', 'g.materia_id', '=', 'm.id')
                    ->where('p.gestion_id', $gestionId)
                    ->where('e.estado_materia', 'Aprobado')
                    ->select(
                        'pf.ci as CI',
                        DB::raw("CONCAT(pf.nombres, ' ', pf.apellido_paterno, ' ', pf.apellido_materno) as Nombre_Completo"),
                        'm.nombre as Materia',
                        'g.nombre as Grupo',
                        'e.promedio_final as Nota_Final'
                    )
                    ->orderByDesc('e.promedio_final')
                    ->get();
                break;

            case 'alumnos_reprobados':
                // Consulta 2: Retorna la lista de alumnos que reprobaron una materia (estado_materia = 'Reprobado') en la gestión especificada
                // Orden: Nota Final descendente
                $resultados = DB::table('evaluaciones as e')
                    ->join('inscripciones_cup as ic', 'e.inscripcion_id', '=', 'ic.id')
                    ->join('postulacion as p', 'ic.postulacion_codigo', '=', 'p.codigo')
                    ->join('perfil as pf', 'p.postulante_id', '=', 'pf.id')
                    ->join('grupo as g', 'ic.grupo_codigo', '=', 'g.codigo')
                    ->join('materia as m', 'g.materia_id', '=', 'm.id')
                    ->where('p.gestion_id', $gestionId)
                    ->where('e.estado_materia', 'Reprobado')
                    ->select(
                        'pf.ci as CI',
                        DB::raw("CONCAT(pf.nombres, ' ', pf.apellido_paterno, ' ', pf.apellido_materno) as Nombre_Completo"),
                        'm.nombre as Materia',
                        'g.nombre as Grupo',
                        'e.promedio_final as Nota_Final'
                    )
                    ->orderByDesc('e.promedio_final')
                    ->get();
                break;

            case 'pagos_stripe_paypal':
                // Consulta 3: Obtiene todos los pagos completados utilizando las pasarelas en línea (Stripe o PayPal) para esta gestión
                // Orden: Fecha descendente
                $resultados = DB::table('pago as pa')
                    ->join('postulacion as p', 'pa.postulacion_codigo', '=', 'p.codigo')
                    ->join('perfil as pf', 'p.postulante_id', '=', 'pf.id')
                    ->where('p.gestion_id', $gestionId)
                    ->whereIn('pa.metodo_pago', ['Stripe (Tarjetas)', 'PayPal'])
                    ->select(
                        'pf.ci as CI',
                        DB::raw("CONCAT(pf.nombres, ' ', pf.apellido_paterno) as Postulante"),
                        'pa.nro_recibo as Nro_Recibo',
                        'pa.monto as Monto',
                        'pa.metodo_pago as Metodo_Pago',
                        'pa.fecha as Fecha'
                    )
                    ->orderByDesc('pa.fecha')
                    ->get();
                break;

            case 'aceptados_promedio_carrera':
                // Consulta 4: Obtiene los postulantes cuyo estado final es 'Aceptado'
                // Incluye una subconsulta para calcular su Promedio General en las evaluaciones de los cursos
                // Orden: Promedio General descendente
                $resultados = DB::table('postulacion as p')
                    ->join('perfil as pf', 'p.postulante_id', '=', 'pf.id')
                    ->join('postulacion_carrera as pc', 'p.codigo', '=', 'pc.postulacion_codigo')
                    ->join('carrera as c', 'pc.carrera_codigo', '=', 'c.codigo')
                    ->where('p.gestion_id', $gestionId)
                    ->where('pc.prioridad', 1)
                    ->where('p.estado', 'Aceptado')
                    ->select(
                        'pf.ci as CI',
                        DB::raw("CONCAT(pf.nombres, ' ', pf.apellido_paterno) as Postulante"),
                        'c.nombre as Carrera',
                        DB::raw("(SELECT ROUND(AVG(e.promedio_final)::numeric, 2) FROM evaluaciones e JOIN inscripciones_cup ic ON e.inscripcion_id = ic.id WHERE ic.postulacion_codigo = p.codigo) as \"Promedio_General\"")
                    )
                    ->orderByDesc('Promedio_General')
                    ->get();
                break;

            case 'grupos_mayor_aprobados':
                // Consulta 5: Agrupa por materia y grupo, contando la cantidad total de alumnos aprobados
                // Orden: Total de Aprobados descendente
                $resultados = DB::table('evaluaciones as e')
                    ->join('inscripciones_cup as ic', 'e.inscripcion_id', '=', 'ic.id')
                    ->join('grupo as g', 'ic.grupo_codigo', '=', 'g.codigo')
                    ->join('materia as m', 'g.materia_id', '=', 'm.id')
                    ->where('g.gestion_id', $gestionId)
                    ->where('e.estado_materia', 'Aprobado')
                    ->select(
                        'g.nombre as Grupo',
                        'm.nombre as Materia',
                        DB::raw('COUNT(*) as "Total_Aprobados"')
                    )
                    ->groupBy('g.nombre', 'm.nombre')
                    ->orderByDesc('Total_Aprobados')
                    ->get();
                break;

            case 'grupos_mayor_reprobados':
                // Consulta 6: Agrupa por materia y grupo, contando la cantidad total de alumnos reprobados
                // Orden: Total de Reprobados descendente
                $resultados = DB::table('evaluaciones as e')
                    ->join('inscripciones_cup as ic', 'e.inscripcion_id', '=', 'ic.id')
                    ->join('grupo as g', 'ic.grupo_codigo', '=', 'g.codigo')
                    ->join('materia as m', 'g.materia_id', '=', 'm.id')
                    ->where('g.gestion_id', $gestionId)
                    ->where('e.estado_materia', 'Reprobado')
                    ->select(
                        'g.nombre as Grupo',
                        'm.nombre as Materia',
                        DB::raw('COUNT(*) as "Total_Reprobados"')
                    )
                    ->groupBy('g.nombre', 'm.nombre')
                    ->orderByDesc('Total_Reprobados')
                    ->get();
                break;

            case 'carreras_aceptados_rechazados':
                // Consulta 7: Agrupa por carrera y cuenta de manera condicional (CASE WHEN)
                // el total de postulantes Aceptados vs Rechazados (1ra opción)
                // Orden: Total de Aceptados descendente
                $resultados = DB::table('postulacion as p')
                    ->join('postulacion_carrera as pc', 'p.codigo', '=', 'pc.postulacion_codigo')
                    ->join('carrera as c', 'pc.carrera_codigo', '=', 'c.codigo')
                    ->where('p.gestion_id', $gestionId)
                    ->where('pc.prioridad', 1)
                    ->select(
                        'c.nombre as Carrera',
                        DB::raw("SUM(CASE WHEN p.estado = 'Aceptado' THEN 1 ELSE 0 END) as \"Total_Aceptados\""),
                        DB::raw("SUM(CASE WHEN p.estado LIKE 'Rechazado%' THEN 1 ELSE 0 END) as \"Total_Rechazados\"")
                    )
                    ->groupBy('c.nombre')
                    ->orderByDesc('Total_Aceptados')
                    ->get();
                break;

            case 'docentes_aprobados_reprobados':
                // Consulta 8: Cruza la tabla de carga horaria, docentes, grupos y evaluaciones para contabilizar
                // cuántos alumnos pasaron o reprobaron bajo la tutoría de un docente en particular
                // Orden: Total de Aprobados descendente
                $resultados = DB::table('carga_horaria as ch')
                    ->join('perfil as pf', 'ch.docente_id', '=', 'pf.id')
                    ->join('grupo as g', 'ch.grupo_codigo', '=', 'g.codigo')
                    ->join('inscripciones_cup as ic', 'g.codigo', '=', 'ic.grupo_codigo')
                    ->join('evaluaciones as e', 'ic.id', '=', 'e.inscripcion_id')
                    ->where('g.gestion_id', $gestionId)
                    ->select(
                        DB::raw("CONCAT(pf.nombres, ' ', pf.apellido_paterno) as Docente"),
                        DB::raw("SUM(CASE WHEN e.estado_materia = 'Aprobado' THEN 1 ELSE 0 END) as \"Total_Aprobados\""),
                        DB::raw("SUM(CASE WHEN e.estado_materia = 'Reprobado' THEN 1 ELSE 0 END) as \"Total_Reprobados\"")
                    )
                    ->groupBy('pf.id', 'pf.nombres', 'pf.apellido_paterno')
                    ->orderByDesc('Total_Aprobados')
                    ->get();
                break;

            case 'grupos_mejores_peores_notas':
                // Consulta 9: Estadísticas de notas por grupo obteniendo el valor Máximo, Mínimo y el Promedio del grupo
                // Orden: Promedio del grupo descendente
                $resultados = DB::table('evaluaciones as e')
                    ->join('inscripciones_cup as ic', 'e.inscripcion_id', '=', 'ic.id')
                    ->join('grupo as g', 'ic.grupo_codigo', '=', 'g.codigo')
                    ->join('materia as m', 'g.materia_id', '=', 'm.id')
                    ->where('g.gestion_id', $gestionId)
                    ->select(
                        'g.nombre as Grupo',
                        'm.nombre as Materia',
                        DB::raw('MAX(e.promedio_final) as "Mejor_Nota"'),
                        DB::raw('MIN(e.promedio_final) as "Peor_Nota"'),
                        DB::raw('ROUND(AVG(e.promedio_final)::numeric, 2) as "Promedio_Grupo"')
                    )
                    ->groupBy('g.nombre', 'm.nombre')
                    ->orderByDesc('Promedio_Grupo')
                    ->get();
                break;

            default:
                return response()->json(['error' => 'Tipo de consulta no válido'], 400);
        }

        return response()->json([
            'success' => true,
            'data' => $resultados
        ]);
    }
}
