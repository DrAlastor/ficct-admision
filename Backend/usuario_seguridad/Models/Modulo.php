<?php

namespace Backend\usuario_seguridad\Models;

use Illuminate\Database\Eloquent\Model;

class Modulo extends Model
{
    protected $table = 'modulo';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'descripcion'
    ];

    public function funciones()
    {
        return $this->hasMany(Funcion::class, 'modulo_id');
    }
}
