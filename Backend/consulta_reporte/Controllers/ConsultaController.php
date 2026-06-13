<?php

namespace Backend\consulta_reporte\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Backend\consulta_reporte\Services\GeminiAIService;

class ConsultaController extends Controller
{
    /**
     * CU28 - Gestionar Consultas (Página principal)
     */
    public function index()
    {
        $gestiones = DB::table('gestion')
            ->orderBy('aÑo', 'desc')
            ->orderBy('semestre', 'desc')
            ->get()
            ->map(fn($g) => [
                'id' => $g->id,
                'label' => "{$g->semestre}-{$g->aÑo}",
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
            'query' => 'required|string|max:500'
        ]);

        try {
            $gemini = new GeminiAIService();
            $sql = $gemini->generateSqlFromText($request->input('query'));

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
                    ->orderBy('m.nombre')
                    ->orderByDesc('e.promedio_final')
                    ->get();
                break;

            case 'alumnos_reprobados':
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
                    ->orderBy('m.nombre')
                    ->orderByDesc('e.promedio_final')
                    ->get();
                break;

            case 'docentes_inasistencias':
                $resultados = DB::table('sesion_asistencia as sa')
                    ->join('perfil as pf', 'sa.docente_id', '=', 'pf.id')
                    ->where('sa.docente_presente', false)
                    // Faltaría filtrar por gestión en la tabla de asistencia si existiera la relación directa
                    ->select(
                        'pf.ci as CI',
                        DB::raw("CONCAT(pf.nombres, ' ', pf.apellido_paterno) as Docente"),
                        'sa.fecha as Fecha_Falta',
                        'sa.hora_inicio as Hora'
                    )
                    ->orderBy('sa.fecha', 'desc')
                    ->get();
                break;

            case 'postulantes_rechazados_cupo':
                $resultados = DB::table('postulacion as p')
                    ->join('perfil as pf', 'p.postulante_id', '=', 'pf.id')
                    ->where('p.gestion_id', $gestionId)
                    ->where('p.estado', 'Rechazado (Sin Cupo)')
                    ->select(
                        'pf.ci as CI',
                        DB::raw("CONCAT(pf.nombres, ' ', pf.apellido_paterno, ' ', pf.apellido_materno) as Nombre_Completo"),
                        'pf.nacionalidad as Nacionalidad'
                    )
                    ->get();
                break;

            case 'ingresos_stripe_paypal':
                $resultados = DB::table('pago as pa')
                    ->join('postulacion as p', 'pa.postulacion_codigo', '=', 'p.codigo')
                    ->where('p.gestion_id', $gestionId)
                    ->where('pa.estado', 'Completado')
                    ->select(
                        'pa.metodo_pago as Metodo_Pago',
                        DB::raw("COUNT(*) as Cantidad_Transacciones"),
                        DB::raw("SUM(pa.monto) as Total_Ingresos_Bs")
                    )
                    ->groupBy('pa.metodo_pago')
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
