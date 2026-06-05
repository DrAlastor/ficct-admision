<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $modulos = [];
        $user = $request->user();

        if ($user) {
            $user->load('perfil');
            $rawModulos = \Illuminate\Support\Facades\DB::table('modulo')
                ->join('funcion', 'modulo.id', '=', 'funcion.modulo_id')
                ->join('rol_funcion', 'funcion.id', '=', 'rol_funcion.funcion_id')
                ->where('rol_funcion.rol_id', $user->rol_id)
                ->select('modulo.nombre as modulo_nombre', 'funcion.nombre as funcion_nombre', 'funcion.permiso', 'modulo.id as modulo_id')
                ->orderBy('modulo_id')
                ->get();

            $modulos = $rawModulos->groupBy('modulo_nombre')->map(function ($items, $moduloNombre) {
                return [
                    'nombre' => $moduloNombre,
                    'funciones' => $items->map(function ($item) {
                        return [
                            'nombre' => $item->funcion_nombre,
                            'permiso' => $item->permiso
                        ];
                    })->values()
                ];
            })->values()->toArray();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'modulos' => $modulos
            ],
        ];
    }
}
