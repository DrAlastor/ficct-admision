<?php

namespace Backend\Modulo1_Seguridad\Models;

use Illuminate\Database\Eloquent\Model;

class TokenRecuperacion extends Model
{
    protected $table = 'token_recuperacion';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'token',
        'fecha_creacion',
        'fecha_expiracion',
        'usado'
    ];

    protected $casts = [
        'fecha_creacion' => 'datetime',
        'fecha_expiracion' => 'datetime',
        'usado' => 'boolean',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
