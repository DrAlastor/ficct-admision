<?php

namespace Backend\usuario_seguridad\Controllers;

use App\Http\Controllers\Controller;
use Backend\usuario_seguridad\Models\Bitacora;
use Backend\usuario_seguridad\Models\Usuario;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BitacoraController extends Controller
{
    /**
     * Muestra el registro histórico de acciones realizadas en el sistema (Auditoría).
     * Permite filtrar la bitácora por un término de búsqueda (acción/detalle), 
     * por un usuario específico y por rangos de fecha.
     *
     * @param Request $request Petición HTTP con posibles filtros.
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $query = Bitacora::with('usuario.perfil')->orderBy('fecha_hora', 'desc');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            // Necesitamos usar where() para agrupar los OR si hay otros where
            $query->where(function($q) use ($search) {
                $q->where('accion', 'ilike', "%{$search}%")
                  ->orWhere('detalle', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('usuario_id') && !empty($request->usuario_id)) {
            $query->where('usuario_id', $request->usuario_id);
        }

        if ($request->has('fecha_desde') && !empty($request->fecha_desde)) {
            $desde = Carbon::parse($request->fecha_desde)->startOfDay();
            $query->where('fecha_hora', '>=', $desde);
        }

        if ($request->has('fecha_hasta') && !empty($request->fecha_hasta)) {
            $hasta = Carbon::parse($request->fecha_hasta)->endOfDay();
            $query->where('fecha_hora', '<=', $hasta);
        }

        $bitacora = $query->paginate(15);
        $usuarios = Usuario::with('perfil')->get();

        return Inertia::render('Modulos/usuario_seguridad/Bitacora/Index', [
            'bitacora' => $bitacora,
            'usuarios' => $usuarios,
            'filters' => $request->only(['search', 'usuario_id', 'fecha_desde', 'fecha_hasta'])
        ]);
    }
}
