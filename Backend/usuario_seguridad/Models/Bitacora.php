<?php

namespace Backend\usuario_seguridad\Models;

use Illuminate\Database\Eloquent\Model;

class Bitacora extends Model
{
    protected $table = 'bitacora';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'accion',
        'detalle',
        'ip',
        'fecha_hora'
    ];

    protected function casts(): array
    {
        return [
            'fecha_hora' => 'datetime',
        ];
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
