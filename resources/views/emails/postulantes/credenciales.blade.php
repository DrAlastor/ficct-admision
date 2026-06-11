<x-mail::message>
# ¡Felicidades {{ $nombre }}! Tu inscripción ha sido aceptada.

Tu registro como postulante en la **Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones (FICCT)** ha sido validado exitosamente.

A partir de este momento, puedes ingresar al sistema para consultar el estado de tu postulación, ver tus horarios y revisar tus boletas.

Tus credenciales de acceso son:

<x-mail::panel>
**Usuario:** {{ $codigo }}
**Contraseña:** {{ $password }}
</x-mail::panel>

<x-mail::button :url="url('/login')">
Ingresar al Sistema
</x-mail::button>

Te recomendamos cambiar tu contraseña una vez hayas ingresado por primera vez por motivos de seguridad.

Si tienes alguna pregunta, no dudes en contactarnos.

Saludos cordiales,<br>
**Administración FICCT**
</x-mail::message>