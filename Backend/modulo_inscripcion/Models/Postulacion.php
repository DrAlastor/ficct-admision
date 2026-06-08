<?php

namespace Backend\modulo_inscripcion\Models;

use Illuminate\Database\Eloquent\Model;

class Postulacion extends Model
{
    protected $table = 'postulacion';
    
    protected $primaryKey = 'codigo';
    
    public $timestamps = false;

    protected $fillable = [
        'postulante_id',
        'gestion_id',
        'fecha',
        'hora',
        'estado'
    ];
}