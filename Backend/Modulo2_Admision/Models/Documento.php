<?php

namespace Backend\Modulo2_Admision\Models;

use Illuminate\Database\Eloquent\Model;

class Documento extends Model
{
    // Apuntamos a la tabla en plural según tu BD
    protected $table = 'documentos';
    
    public $timestamps = false;

    protected $fillable = [
        'postulacion_codigo',
        'tipo_documento',
        'url_archivo',
        'estado_validacion'
    ];
}