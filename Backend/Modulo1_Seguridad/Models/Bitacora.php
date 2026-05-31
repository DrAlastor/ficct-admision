<?php

namespace Backend\Modulo1_Seguridad\Models;

use Illuminate\Database\Eloquent\Model;

class Bitacora extends Model
{
    protected $table = 'bitacora';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'accion',
        'fecha',
        'hora',
        'ip'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
