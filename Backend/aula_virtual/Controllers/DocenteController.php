<?php

namespace Backend\aula_virtual\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * CU25 - Gestionar Docente
 */
class DocenteController extends Controller
{
    /**
     * Obtiene la lista de postulantes (estudiantes) inscritos en un grupo específico,
     * incluyendo sus notas de evaluación actuales.
     *
     * @param string $grupoCodigo Código identificador del grupo.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAlumnos($grupoCodigo)
    {
        $alumnos = DB::table('inscripciones_cup')
            ->join('postulacion', 'inscripciones_cup.postulacion_codigo', '=', 'postulacion.codigo')
            ->join('perfil', 'postulacion.postulante_id', '=', 'perfil.id')
            ->leftJoin('evaluaciones', 'inscripciones_cup.id', '=', 'evaluaciones.inscripcion_id')
            ->where('inscripciones_cup.grupo_codigo', $grupoCodigo)
            ->select(
                'inscripciones_cup.id as inscripcion_id',
                'perfil.nombres',
                'perfil.apellido_paterno',
                'perfil.apellido_materno',
                'perfil.ci',
                'evaluaciones.id as evaluacion_id',
                'evaluaciones.nota_p1',
                'evaluaciones.nota_p2',
                'evaluaciones.nota_p3',
                'evaluaciones.promedio_final',
                DB::raw("COALESCE(evaluaciones.estado_materia, 'Cursando') as estado_materia")
            )
            ->orderBy('perfil.apellido_paterno')
            ->get();

        return response()->json($alumnos);
    }

    /**
     * Actualiza las calificaciones (notas) de un estudiante para una evaluación específica.
     * Calcula automáticamente el promedio final basado en una ponderación 
     * (30% para P1, 30% para P2 y 40% para el Final) y determina si el estado es Aprobado o Reprobado.
     *
     * @param Request $request Contiene 'evaluacion_id', 'nota_p1', 'nota_p2' y 'nota_p3'.
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateNotas(Request $request)
    {
        $request->validate([
            'inscripcion_id' => 'required|integer',
            'nota_p1' => 'required|numeric|min:0|max:100',
            'nota_p2' => 'required|numeric|min:0|max:100',
            'nota_p3' => 'required|numeric|min:0|max:100',
        ]);

        $inscripcionId = $request->input('inscripcion_id');
        $notaP1 = $request->input('nota_p1');
        $notaP2 = $request->input('nota_p2');
        $notaP3 = $request->input('nota_p3');

        // Ponderación: 30% P1, 30% P2, 40% P3 (Final)
        $promedioFinal = ($notaP1 * 0.30) + ($notaP2 * 0.30) + ($notaP3 * 0.40);
        
        // Estado materia: Aprobar >= 51 (asumiendo que en este filtro se aprueba)
        $estadoMateria = $promedioFinal >= 51 ? 'Aprobado' : 'Reprobado';

        DB::table('evaluaciones')
            ->updateOrInsert(
                ['inscripcion_id' => $inscripcionId],
                [
                    'nota_p1' => $notaP1,
                    'nota_p2' => $notaP2,
                    'nota_p3' => $notaP3,
                    'promedio_final' => $promedioFinal,
                    'estado_materia' => $estadoMateria
                ]
            );

        return response()->json([
            'success' => true,
            'message' => 'Notas actualizadas correctamente',
            'promedio_final' => $promedioFinal,
            'estado_materia' => $estadoMateria
        ]);
    }
}
