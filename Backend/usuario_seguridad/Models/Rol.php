<?php

namespace Backend\usuario_seguridad\Models;

use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    protected $table = 'rol';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'descripcion'
    ];

    /**
     * Ejecuta la acción o procedimiento 'funciones' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function funciones()
    {
        return $this->belongsToMany(Funcion::class, 'rol_funcion', 'rol_id', 'funcion_id')
                    ->withPivot('id_accion', 'descripcion');
    }
}
