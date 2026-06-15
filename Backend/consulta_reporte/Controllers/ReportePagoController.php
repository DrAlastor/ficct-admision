<?php

namespace Backend\consulta_reporte\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

/**
 * CU29 - Reporte de Pagos
 */
class ReportePagoController extends Controller
{
    /**
     * CU29 - Reporte de Pagos
     */
    public function index(Request $request)
    {
        $gestionId = $request->query('gestion_id');

        $gestiones = DB::table('gestion')
            ->orderBy('anio', 'desc')
            ->orderBy('semestre', 'desc')
            ->get()
            ->map(fn($g) => [
                'id' => $g->id,
                'label' => "{$g->semestre}-{$g->anio}",
            ]);

        // Seleccionar la gestión más reciente si no hay una en el request
        if (!$gestionId && $gestiones->isNotEmpty()) {
            $gestionId = $gestiones->first()['id'];
        }

        $pagos = [];
        $totalRecaudado = 0;

        if ($gestionId) {
            $pagos = DB::table('pago')
                ->join('postulacion', 'pago.postulacion_codigo', '=', 'postulacion.codigo')
                ->join('postulante', 'postulacion.postulante_id', '=', 'postulante.id')
                ->join('perfil', 'postulante.id', '=', 'perfil.id')
                ->where('postulacion.gestion_id', $gestionId)
                ->where('pago.estado', 'Completado')
                ->select(
                    'pago.nro_recibo',
                    DB::raw("CONCAT(perfil.nombres, ' ', perfil.apellido_paterno, ' ', COALESCE(perfil.apellido_materno, '')) as nombre_completo"),
                    'pago.monto',
                    'pago.fecha',
                    'pago.transaccion_id',
                    'pago.estado',
                    'pago.metodo_pago'
                )
                ->orderBy('pago.fecha', 'desc')
                ->get();

            $totalRecaudado = collect($pagos)->sum('monto');
        }

        return Inertia::render('Modulos/consulta_reporte/ReportePagos/Index', [
            'gestiones' => $gestiones,
            'pagos' => collect($pagos)->map(function ($pago) {
                return [
                    'nro_recibo' => $pago->nro_recibo,
                    'nombre_completo' => $pago->nombre_completo,
                    'monto' => number_format((float)$pago->monto, 2, '.', ''),
                    'fecha' => $pago->fecha,
                    'transaccion_id' => $pago->transaccion_id,
                    'estado' => $pago->estado,
                    'metodo_pago' => $pago->metodo_pago,
                ];
            }),
            'totalRecaudado' => number_format((float)$totalRecaudado, 2, '.', ''),
            'filtroGestionId' => $gestionId
        ]);
    }

    /**
     * Descargar reporte de pagos en PDF
     */
    public function exportarPdf(Request $request)
    {
        $gestionId = $request->query('gestion_id');

        $gestion = DB::table('gestion')->where('id', $gestionId)->first();
        if (!$gestion) {
            $gestion = DB::table('gestion')->orderBy('anio', 'desc')->orderBy('semestre', 'desc')->first();
        }

        if (!$gestion) {
            abort(404, 'No hay gestiones disponibles.');
        }

        $pagos = DB::table('pago')
            ->join('postulacion', 'pago.postulacion_codigo', '=', 'postulacion.codigo')
            ->join('postulante', 'postulacion.postulante_id', '=', 'postulante.id')
            ->join('perfil', 'postulante.id', '=', 'perfil.id')
            ->where('postulacion.gestion_id', $gestion->id)
            ->where('pago.estado', 'Completado')
            ->select(
                'pago.nro_recibo',
                DB::raw("CONCAT(perfil.nombres, ' ', perfil.apellido_paterno, ' ', COALESCE(perfil.apellido_materno, '')) as nombre_completo"),
                'pago.monto',
                'pago.fecha',
                'pago.transaccion_id',
                'pago.estado',
                'pago.metodo_pago'
            )
            ->orderBy('pago.fecha', 'desc')
            ->get();

        $totalRecaudado = collect($pagos)->sum('monto');

        $pdf = Pdf::loadView('reportes.reporte_pagos', [
            'gestion' => $gestion,
            'pagos' => $pagos,
            'totalRecaudado' => $totalRecaudado
        ]);

        return $pdf->download("Reporte_Pagos_{$gestion->semestre}_{$gestion->anio}.pdf");
    }
}
