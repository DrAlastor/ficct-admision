<?php

namespace Backend\usuario_seguridad\Models;

use Illuminate\Database\Eloquent\Model;

class Funcion extends Model
{
    protected $table = 'funcion';
    public $timestamps = false;

    protected $fillable = [
        'modulo_id',
        'nombre',
        'permiso',
        'descripcion'
    ];

    public function modulo()
    {
        return $this->belongsTo(Modulo::class, 'modulo_id');
    }

    public function roles()
    {
        return $this->belongsToMany(Rol::class, 'rol_funcion', 'funcion_id', 'rol_id')
                    ->withPivot('id_accion', 'descripcion');
    }
}
