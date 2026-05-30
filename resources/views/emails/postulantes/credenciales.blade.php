<x-mail::message>
# ¡Bienvenido al CUP de la FICCT, {{ $nombres }}!

Tu registro y pago se han procesado correctamente. Ya puedes acceder al sistema del Aula Virtual.

Tal como definimos en el proceso de admisión, el sistema ha creado tu acceso. Tus credenciales oficiales son:

- **Usuario (Código):** {{ $codigo }}
- **Contraseña:** {{ $ci }}

<x-mail::button :url="route('login')">
Iniciar Sesión
</x-mail::button>

Gracias,<br>
La Administración de la FICCT
</x-mail::message>