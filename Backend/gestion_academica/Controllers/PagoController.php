<?php

namespace Backend\gestion_academica\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * CU23 - Gestionar Pagos
 */
class PagoController extends Controller
{
    /**
     * Obtiene y muestra la lista principal de registros o la vista por defecto.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function index()
    {
        // Obtener conceptos de pago
        $conceptos = DB::table('concepto_pago')->orderBy('id')->get();
        
        // Obtener métodos de pago
        $metodos = DB::table('metodo_pago_config')->orderBy('id')->get();

        // Obtener los últimos 10 pagos realizados
        $pagos = DB::table('pago')
            ->join('postulacion', 'pago.postulacion_codigo', '=', 'postulacion.codigo')
            ->join('postulante', 'postulacion.postulante_id', '=', 'postulante.id')
            ->join('perfil', 'postulante.id', '=', 'perfil.id')
            ->select(
                'pago.id',
                'pago.nro_recibo',
                'pago.monto',
                'pago.metodo_pago',
                'pago.transaccion_id',
                'pago.estado',
                'pago.fecha',
                'perfil.nombres',
                'perfil.apellido_paterno'
            )
            ->orderBy('pago.fecha', 'desc')
            ->orderBy('pago.id', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Modulos/gestion_academica/Pagos/Index', [
            'conceptos' => $conceptos,
            'metodos' => $metodos,
            'historial_pagos' => $pagos
        ]);
    }

    /**
     * Ejecuta la acción o procedimiento 'guardarConcepto' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function guardarConcepto(Request $request)
    {
        $request->validate([
            'id' => 'nullable|integer',
            'nombre' => 'required|string|max:100',
            'monto' => 'required|numeric|min:0',
            'descripcion' => 'nullable|string'
        ]);

        if ($request->id) {
            DB::table('concepto_pago')->where('id', $request->id)->update([
                'nombre' => $request->nombre,
                'monto' => $request->monto,
                'descripcion' => $request->descripcion
            ]);
        } else {
            DB::table('concepto_pago')->insert([
                'nombre' => $request->nombre,
                'monto' => $request->monto,
                'descripcion' => $request->descripcion
            ]);
        }

        return redirect()->back()->with('success', 'Concepto de pago guardado correctamente.');
    }

    /**
     * Ejecuta la acción o procedimiento 'eliminarConcepto' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function eliminarConcepto($id)
    {
        DB::table('concepto_pago')->where('id', $id)->delete();
        return redirect()->back()->with('success', 'Concepto eliminado correctamente.');
    }

    /**
     * Ejecuta la acción o procedimiento 'guardarMetodo' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function guardarMetodo(Request $request)
    {
        $request->validate([
            'id' => 'nullable|integer',
            'nombre' => 'required|string|max:50',
            'public_key' => 'nullable|string',
            'secret_key' => 'nullable|string',
            'activo' => 'required|boolean'
        ]);

        if ($request->id) {
            DB::table('metodo_pago_config')->where('id', $request->id)->update([
                'nombre' => $request->nombre,
                'public_key' => $request->public_key,
                'secret_key' => $request->secret_key,
                'activo' => $request->activo
            ]);
        } else {
            DB::table('metodo_pago_config')->insert([
                'nombre' => $request->nombre,
                'public_key' => $request->public_key,
                'secret_key' => $request->secret_key,
                'activo' => $request->activo
            ]);
        }

        return redirect()->back()->with('success', 'Método de pago actualizado correctamente.');
    }
}
