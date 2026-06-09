<?php

namespace Backend\usuario_seguridad\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable
{
    use Notifiable;

    // Apuntamos a tu tabla exacta
    protected $table = 'usuario';
    
    // Desactivamos los timestamps automáticos de Laravel
    public $timestamps = false;

    // Los campos que permitimos llenar desde el controlador
    protected $fillable = [
        'codigo_inicio', 
        'password', 
        'estado', 
        'rol_id'
    ];

    // Ocultamos la contraseña por seguridad cuando se hacen consultas
    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function perfil()
    {
        return $this->hasOne(Perfil::class, 'usuario_id');
    }

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }
}