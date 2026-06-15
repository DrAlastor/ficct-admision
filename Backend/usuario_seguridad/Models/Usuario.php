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
        'rol_id',
        'gestion_id'
    ];

    // Ocultamos la contraseña por seguridad cuando se hacen consultas
    protected $hidden = [
        'password',
    ];

    /**
     * Define la conversión de atributos o casteos de Eloquent.
     * Encripta/Oculta la contraseña automáticamente y maneja los tokens como hashes.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Relación uno a uno con Perfil.
     * Todo usuario tiene un único perfil con sus datos personales e imagen.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function perfil()
    {
        return $this->hasOne(Perfil::class, 'usuario_id');
    }

    /**
     * Relación de pertenencia con Rol.
     * Un usuario pertenece o está asignado a un Rol específico (Admin, Docente, etc).
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }
}