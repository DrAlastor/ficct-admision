<?php

namespace Backend\Modulo2_Admision\Models;

use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    protected $table = 'pago';
    
    public $timestamps = false;

    protected $fillable = [
        'postulacion_codigo',
        'nro_recibo',
        'monto',
        'metodo_pago',
        'transaccion_id',
        'estado',
        'fecha'
    ];
}