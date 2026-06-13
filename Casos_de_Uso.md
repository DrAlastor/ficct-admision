# 1. Módulo de Inscripción y Seguridad

## Caso de Uso: CU01 - Iniciar Sesión
- **Propósito**: Validar las credenciales del usuario para permitirle el acceso seguro al sistema según su rol.
- **Actores**: Postulante, Docente, Administrador.
- **Iniciador**: Cualquier Usuario.
- **Precondiciones**: El usuario debe tener un registro activo en el sistema.
- **Flujo Principal**:
  1. El usuario accede a la pantalla de login.
  2. Ingresa su Código de Usuario y su Contraseña (por defecto, el Carnet de Identidad - CI).
  3. El sistema valida las credenciales en la base de datos.
  4. El sistema redirige al usuario al panel correspondiente según su rol.
- **Postcondiciones**: El usuario inicia una sesión activa en la plataforma.
- **Excepciones**:
  1. **Credenciales Inválidas**: El sistema muestra una alerta de error y permite reintentar.
  2. **Usuario Inactivo**: El sistema bloquea el acceso si la cuenta está deshabilitada.

## Caso de Uso: CU02 - Gestionar Usuarios
- **Propósito**: Permitir al administrador registrar, editar, desactivar y listar a los usuarios del sistema.
- **Actores**: Administrador.
- **Iniciador**: Administrador.
- **Precondiciones**: El administrador debe estar autenticado.
- **Flujo Principal**:
  1. El administrador ingresa a la opción "Gestionar Usuarios".
  2. El sistema muestra la lista de usuarios.
  3. El administrador selecciona agregar, editar o eliminar un usuario.
  4. El sistema guarda los cambios y actualiza la lista.
- **Postcondiciones**: La información del usuario se actualiza en el sistema.
- **Excepciones**:
  1. **Datos incompletos**: El sistema alerta sobre campos obligatorios.
  2. **Código duplicado**: El sistema rechaza la creación si el código de usuario ya existe.

## Caso de Uso: CU03 - Roles y Permisos
- **Propósito**: Asignar y modificar los roles y permisos de acceso para los usuarios del sistema.
- **Actores**: Administrador.
- **Iniciador**: Administrador.
- **Precondiciones**: El administrador debe estar autenticado.
- **Flujo Principal**:
  1. El administrador ingresa a "Roles y Permisos".
  2. Selecciona un rol específico.
  3. Activa o desactiva los permisos para los diferentes módulos.
  4. Guarda la configuración.
- **Postcondiciones**: Los permisos del rol son actualizados y aplicados a los usuarios correspondientes.
- **Excepciones**:
  1. **Rol en uso crítico**: No se permite quitar permisos esenciales a un rol administrador principal.

## Caso de Uso: CU04 - Auditoría y Bitácora
- **Propósito**: Registrar y visualizar las acciones realizadas por los usuarios dentro del sistema.
- **Actores**: Administrador.
- **Iniciador**: Sistema (Automático) / Administrador (Visualización).
- **Precondiciones**: El administrador debe estar autenticado.
- **Flujo Principal**:
  1. El usuario realiza una acción en el sistema (ej. login, modificar datos).
  2. El sistema registra la acción, usuario, IP y fecha en la bitácora.
  3. El administrador accede al módulo de "Bitácora" para revisar los registros.
- **Postcondiciones**: La acción queda registrada para fines de auditoría.
- **Excepciones**:
  1. **Fallo de conexión**: Si falla la base de datos, el sistema guarda el registro en un log temporal.

## Caso de Uso: CU05 - Consultar Perfil
- **Propósito**: Permitir al usuario ver y actualizar su información personal.
- **Actores**: Postulante, Docente, Administrador.
- **Iniciador**: Cualquier Usuario.
- **Precondiciones**: El usuario debe haber iniciado sesión.
- **Flujo Principal**:
  1. El usuario hace clic en "Mi Perfil".
  2. El sistema muestra sus datos personales, información de contacto y foto.
  3. El usuario puede modificar datos permitidos (ej. teléfono, correo).
  4. Guarda los cambios.
- **Postcondiciones**: El perfil del usuario es actualizado.
- **Excepciones**:
  1. **Formato incorrecto**: El sistema rechaza correos electrónicos no válidos.

## Caso de Uso: CU06 - Registro de Postulantes
- **Propósito**: Permitir a un aspirante registrarse en el sistema y crear su cuenta para el proceso de admisión.
- **Actores**: Postulante (Aspirante).
- **Iniciador**: Postulante.
- **Precondiciones**: Las inscripciones deben estar abiertas.
- **Flujo Principal**:
  1. El postulante accede al formulario de registro público.
  2. Ingresa sus datos personales (CI, Nombre, Correo, etc.).
  3. El sistema valida los datos y crea la cuenta del postulante.
- **Postcondiciones**: El postulante recibe sus credenciales de acceso y puede ingresar al sistema.
- **Excepciones**:
  1. **CI Registrado**: El sistema bloquea el registro si el Carnet de Identidad ya está en uso.

## Caso de Uso: CU07 - Pagar Matrícula
- **Propósito**: Procesar el pago de inscripción del postulante al Curso Preuniversitario.
- **Actores**: Postulante.
- **Iniciador**: Postulante.
- **Precondiciones**: El postulante debe estar registrado pero sin pago completado.
- **Flujo Principal**:
  1. El postulante inicia sesión y es redirigido al módulo de pago.
  2. Selecciona el método de pago (Stripe/Tarjeta).
  3. Ingresa los datos de pago y confirma.
  4. El sistema procesa la transacción y genera el recibo.
- **Postcondiciones**: El estado del postulante cambia a "Inscrito".
- **Excepciones**:
  1. **Pago Rechazado**: El sistema muestra un error del banco y permite reintentar.

## Caso de Uso: CU08 - Validar Documentos
- **Propósito**: Revisar y validar los documentos subidos por los postulantes (CI, Título de Bachiller).
- **Actores**: Administrador.
- **Iniciador**: Administrador.
- **Precondiciones**: El postulante debe haber subido sus documentos.
- **Flujo Principal**:
  1. El administrador ingresa a "Validar Documentos".
  2. Selecciona a un postulante y revisa sus archivos.
  3. Marca los documentos como "Validados" o "Rechazados".
- **Postcondiciones**: El estado de la documentación del postulante se actualiza.
- **Excepciones**:
  1. **Documento ilegible**: Se rechaza y se notifica al postulante para que lo vuelva a subir.

## Caso de Uso: CU09 - Panel Principal (Dashboard)
- **Propósito**: Mostrar un resumen del estado del sistema, estadísticas rápidas y accesos directos según el rol.
- **Actores**: Todos los usuarios.
- **Iniciador**: Cualquier Usuario.
- **Precondiciones**: El usuario debe iniciar sesión.
- **Flujo Principal**:
  1. El usuario completa el inicio de sesión.
  2. El sistema carga el Dashboard correspondiente a su rol (Administrador, Docente, Postulante).
  3. Se muestran las tarjetas informativas y gráficos relevantes.
- **Postcondiciones**: El usuario visualiza la información principal del sistema.
- **Excepciones**:
  1. **Error de carga de datos**: Si los widgets fallan, se muestra un mensaje de "Datos no disponibles".

## Caso de Uso: CU10 - Cerrar Sesión
- **Propósito**: Finalizar la sesión activa del usuario de manera segura.
- **Actores**: Todos los usuarios.
- **Iniciador**: Cualquier Usuario.
- **Precondiciones**: El usuario debe tener una sesión activa.
- **Flujo Principal**:
  1. El usuario hace clic en "Cerrar Sesión".
  2. El sistema destruye el token de autenticación.
  3. Redirige al usuario a la página de Login.
- **Postcondiciones**: La sesión finaliza y ya no se puede acceder a las rutas protegidas.
- **Excepciones**: Ninguna.

## Caso de Uso: CU11 - Gestionar Contraseña
- **Propósito**: Permitir al usuario cambiar su contraseña actual por una nueva para mayor seguridad.
- **Actores**: Todos los usuarios.
- **Iniciador**: Cualquier Usuario.
- **Precondiciones**: El usuario debe estar autenticado en el sistema.
- **Flujo Principal**:
  1. El usuario accede a "Cambiar Contraseña".
  2. Ingresa su contraseña actual y luego la nueva contraseña (dos veces).
  3. El sistema verifica que la contraseña actual sea correcta y que las nuevas coincidan.
  4. El sistema actualiza la contraseña en la base de datos (encriptada).
- **Postcondiciones**: El usuario ahora debe usar la nueva contraseña para sus próximos ingresos.
- **Excepciones**:
  1. **Contraseña actual incorrecta**: El sistema deniega el cambio.
  2. **Contraseñas nuevas no coinciden**: El sistema solicita ingresar los datos nuevamente.

---

# 2. Módulo de Aula Virtual

## Caso de Uso: CU12 - Acceder al Aula Virtual
- **Propósito**: Listar las materias en las que el postulante o docente está inscrito/asignado.
- **Actores**: Postulante, Docente.
- **Iniciador**: Postulante / Docente.
- **Precondiciones**: El postulante debe estar inscrito o el docente debe tener carga horaria.
- **Flujo Principal**:
  1. El usuario ingresa a la pestaña "Aula Virtual".
  2. El sistema recupera los grupos activos del usuario.
  3. Muestra las tarjetas de las materias disponibles.
- **Postcondiciones**: El usuario ingresa al entorno de sus materias.
- **Excepciones**:
  1. **Sin materias asignadas**: Se muestra un mensaje de "No tiene materias disponibles".

## Caso de Uso: CU13 - Consultar Boleta
- **Propósito**: Mostrar al postulante las materias inscritas, notas parciales y estado de aprobación.
- **Actores**: Postulante.
- **Iniciador**: Postulante.
- **Precondiciones**: El postulante debe estar inscrito en grupos.
- **Flujo Principal**:
  1. El postulante accede a "Consultar Boleta".
  2. El sistema recupera las evaluaciones y notas del estudiante.
  3. El sistema muestra la boleta detallada con el promedio final.
- **Postcondiciones**: El postulante está informado sobre su rendimiento.
- **Excepciones**:
  1. **Notas no publicadas**: Se muestra "Pendiente" en las calificaciones no subidas.

## Caso de Uso: CU14 - Consultar Horario
- **Propósito**: Mostrar el calendario de clases semanales para el docente o el postulante.
- **Actores**: Postulante, Docente.
- **Iniciador**: Postulante / Docente.
- **Precondiciones**: El usuario debe tener grupos asignados con horarios definidos.
- **Flujo Principal**:
  1. El usuario accede a "Consultar Horario".
  2. El sistema recupera los horarios, días y aulas.
  3. El sistema renderiza un calendario semanal visualizando las clases.
- **Postcondiciones**: El usuario conoce la ubicación y hora de sus clases.
- **Excepciones**:
  1. **Horario no generado**: Si no hay horarios, se informa al usuario que están pendientes.

## Caso de Uso: CU15 - Consultar Asistencia
- **Propósito**: Permitir a los docentes registrar asistencia y a los postulantes consultarla.
- **Actores**: Docente, Postulante.
- **Iniciador**: Docente / Postulante.
- **Precondiciones**: El docente debe haber iniciado una sesión de clase.
- **Flujo Principal**:
  1. El Docente abre una sesión de asistencia y genera una contraseña o código.
  2. Los postulantes acceden a "Registrar Asistencia", ingresan el código y el sistema marca "Presente".
  3. El Docente o Postulante pueden ver el historial de asistencias de la gestión.
- **Postcondiciones**: La asistencia queda registrada en la base de datos.
- **Excepciones**:
  1. **Código Incorrecto/Expirado**: El postulante no puede registrar asistencia.

## Caso de Uso: CU16 - Rendir Exámenes
- **Propósito**: Permitir a los postulantes responder evaluaciones en línea dentro del tiempo establecido.
- **Actores**: Postulante.
- **Iniciador**: Postulante.
- **Precondiciones**: Un examen debe estar activo y el postulante no debe haberlo rendido previamente.
- **Flujo Principal**:
  1. El postulante selecciona "Exámenes Pendientes" en el Aula Virtual.
  2. Ingresa la contraseña del examen brindada por el docente.
  3. Responde a las preguntas de opción múltiple dentro del tiempo límite.
  4. Finaliza y envía el examen; el sistema calcula la nota y la guarda.
- **Postcondiciones**: La calificación se registra en las evaluaciones del estudiante.
- **Excepciones**:
  1. **Tiempo Excedido**: El examen se envía automáticamente con las respuestas marcadas hasta el momento.

---

# 3. Módulo de Gestión Académica

## Caso de Uso: CU17 - Gestionar Postulantes
- **Propósito**: Administrar la lista general de postulantes inscritos, permitiendo búsquedas y ediciones.
- **Actores**: Administrador.
- **Iniciador**: Administrador.
- **Precondiciones**: El administrador debe tener permisos del módulo académico.
- **Flujo Principal**:
  1. El administrador ingresa a "Gestionar Postulantes".
  2. El sistema muestra la tabla de postulantes con opciones de filtros.
  3. El administrador puede editar información o cambiar el estado del postulante.
- **Postcondiciones**: Los datos del postulante se actualizan.
- **Excepciones**: Ninguna.

## Caso de Uso: CU18 - Gestionar Cupos
- **Propósito**: Configurar la capacidad máxima de alumnos que pueden ingresar por carrera y por grupo.
- **Actores**: Administrador.
- **Iniciador**: Administrador.
- **Precondiciones**: Deben existir carreras y gestiones activas.
- **Flujo Principal**:
  1. El administrador accede a "Gestionar Cupos".
  2. Define la cantidad máxima de alumnos aceptados por cada carrera.
  3. Define la capacidad máxima de los grupos (aulas).
  4. Guarda la configuración.
- **Postcondiciones**: El sistema respetará estos límites durante la inscripción y generación de grupos.
- **Excepciones**:
  1. **Cupo inferior a inscritos**: El sistema advierte si se intenta reducir el cupo a un número menor a los alumnos ya admitidos.

## Caso de Uso: CU19 - Gestionar Grupos
- **Propósito**: Crear, editar y administrar los grupos (cohortes) de las materias del CUP.
- **Actores**: Administrador.
- **Iniciador**: Administrador.
- **Precondiciones**: Las materias y aulas deben estar creadas.
- **Flujo Principal**:
  1. El administrador ingresa a "Gestionar Grupos".
  2. Crea un nuevo grupo indicando la materia, el turno (Mañana/Tarde) y el cupo.
  3. El sistema guarda el grupo y lo deja listo para la asignación de docentes.
- **Postcondiciones**: El grupo queda disponible para la inscripción de estudiantes.
- **Excepciones**:
  1. **Materia inexistente**: No se puede crear un grupo sin seleccionar una materia válida.

## Caso de Uso: CU20 - Gestionar Horarios
- **Propósito**: Definir y asignar automáticamente los horarios de clases para los grupos generados.
- **Actores**: Administrador.
- **Iniciador**: Administrador.
- **Precondiciones**: Deben existir grupos, aulas y docentes.
- **Flujo Principal**:
  1. El administrador accede a "Gestionar Horarios".
  2. Ejecuta el algoritmo de asignación de horarios.
  3. El sistema asigna las materias a los grupos distribuyendo de Lunes a Viernes.
  4. El administrador guarda o edita manualmente el horario propuesto.
- **Postcondiciones**: Los grupos cuentan con horarios definidos sin cruces.
- **Excepciones**:
  1. **Falta de aulas**: El sistema notifica que no hay suficientes aulas para generar el horario completo.

## Caso de Uso: CU21 - Gestionar Aulas
- **Propósito**: Registrar y mantener el catálogo de aulas y laboratorios físicos.
- **Actores**: Administrador.
- **Iniciador**: Administrador.
- **Precondiciones**: Ninguna.
- **Flujo Principal**:
  1. El administrador ingresa a "Gestionar Aulas".
  2. Agrega una nueva aula especificando número, pabellón/piso y capacidad.
  3. Guarda los cambios.
- **Postcondiciones**: El aula está disponible para ser usada en los horarios.
- **Excepciones**:
  1. **Aula duplicada**: El sistema rechaza la creación si el código del aula ya existe.

## Caso de Uso: CU22 - Gestionar Exámenes
- **Propósito**: Programar las fechas de los exámenes y gestionar su banco de preguntas.
- **Actores**: Administrador, Docente.
- **Iniciador**: Administrador o Docente.
- **Precondiciones**: Deben existir materias y docentes asignados.
- **Flujo Principal**:
  1. El usuario accede a "Gestionar Exámenes".
  2. Define la fecha, hora, duración y ponderación de un examen parcial o final.
  3. Carga o edita las preguntas y respuestas correctas para dicho examen.
- **Postcondiciones**: El examen queda programado y visible en el Aula Virtual en la fecha asignada.
- **Excepciones**:
  1. **Preguntas insuficientes**: El sistema no permite activar un examen si no tiene la cantidad de preguntas definida.

## Caso de Uso: CU23 - Gestionar Pagos
- **Propósito**: Configurar los métodos de pago, APIs (Stripe, PayPal) y conceptos a cobrar (Matrícula).
- **Actores**: Administrador.
- **Iniciador**: Administrador.
- **Precondiciones**: Ninguna.
- **Flujo Principal**:
  1. El administrador ingresa a "Gestionar Pagos".
  2. Configura las llaves de acceso (API Keys) de los proveedores de pago.
  3. Define el monto del concepto "Matrícula CUP".
  4. Guarda y activa los métodos.
- **Postcondiciones**: El módulo de pagos de postulantes actualizará sus métodos disponibles.
- **Excepciones**:
  1. **API Key Inválida**: El sistema falla la conexión de prueba con el proveedor.

## Caso de Uso: CU24 - Gestionar Carreras
- **Propósito**: Mantener el registro de las carreras disponibles y sus cupos de admisión.
- **Actores**: Administrador.
- **Iniciador**: Administrador.
- **Precondiciones**: La Facultad debe existir.
- **Flujo Principal**:
  1. El administrador accede a "Gestionar Carreras".
  2. Agrega una carrera nueva especificando nombre, sigla y cupo.
  3. Guarda los datos.
- **Postcondiciones**: La carrera aparece como opción para los nuevos postulantes.
- **Excepciones**:
  1. **Nombre duplicado**: El sistema alerta si la carrera ya está registrada.

---

# 4. Módulo de Docencia

## Caso de Uso: CU25 - Gestionar Docente
- **Propósito**: Administrar la información personal, grados académicos y cuentas de los docentes.
- **Actores**: Administrador.
- **Iniciador**: Administrador.
- **Precondiciones**: Ninguna.
- **Flujo Principal**:
  1. El administrador ingresa a "Gestionar Docente".
  2. Ve la lista de docentes, selecciona crear o editar.
  3. Ingresa datos como Profesión, Grado Académico y Máximo de Grupos que puede enseñar.
  4. Guarda los datos y el sistema genera la cuenta de usuario del docente automáticamente.
- **Postcondiciones**: El docente puede acceder al sistema y está listo para recibir carga horaria.
- **Excepciones**:
  1. **Correo Duplicado**: El sistema no permite guardar si el email ya existe.

## Caso de Uso: CU26 - Gestionar Carga Horaria
- **Propósito**: Asignar los grupos y materias que cada docente enseñará durante la gestión.
- **Actores**: Administrador.
- **Iniciador**: Administrador.
- **Precondiciones**: Deben existir docentes activos y grupos creados.
- **Flujo Principal**:
  1. El administrador accede a "Gestionar Carga Horaria".
  2. Selecciona un docente de la lista.
  3. Le asigna los grupos disponibles verificando que no exceda su límite de "Grupos Máximos".
  4. Guarda la asignación.
- **Postcondiciones**: El docente tendrá los grupos en su Aula Virtual y Horario.
- **Excepciones**:
  1. **Exceso de grupos**: El sistema bloquea la asignación si el docente supera su límite configurado.
  2. **Cruce de horarios**: El sistema alerta si los grupos asignados comparten la misma hora.

---

# 5. Consultas y Reportes

## Caso de Uso: CU27 - Gestionar Estadísticas
- **Propósito**: Visualizar gráficos interactivos e indicadores clave sobre inscripciones, pagos y rendimiento.
- **Actores**: Administrador.
- **Iniciador**: Administrador.
- **Precondiciones**: El sistema debe tener datos registrados (pagos, alumnos, notas).
- **Flujo Principal**:
  1. El administrador ingresa a "Gestionar Estadísticas".
  2. El sistema carga los gráficos de "Ingresos por Método de Pago", "Postulantes por Carrera", "Porcentaje de Aprobados", etc.
  3. El administrador puede filtrar por gestión (semestre/año).
- **Postcondiciones**: El administrador visualiza el estado general en tiempo real.
- **Excepciones**:
  1. **Sin datos**: Si no hay datos, el gráfico se muestra vacío.

## Caso de Uso: CU28 - Gestionar Consultas
- **Propósito**: Realizar consultas detalladas a la base de datos utilizando filtros inteligentes y exportación.
- **Actores**: Administrador.
- **Iniciador**: Administrador.
- **Precondiciones**: El administrador debe tener permisos de reportes.
- **Flujo Principal**:
  1. El administrador accede a "Gestionar Consultas".
  2. Utiliza filtros combinados (Ej. Estudiantes Aprobados en Sistemas en el 2025).
  3. El sistema muestra la tabla de resultados.
  4. El administrador exporta la tabla en formato PDF o Excel.
- **Postcondiciones**: Se genera y descarga el documento con el reporte específico.
- **Excepciones**: Ninguna.

## Caso de Uso: CU29 - Reporte de Pagos
- **Propósito**: Revisar el historial de todos los pagos realizados por concepto de matrícula.
- **Actores**: Administrador.
- **Iniciador**: Administrador.
- **Precondiciones**: Deben existir transacciones de pago.
- **Flujo Principal**:
  1. El administrador accede a "Reporte de Pagos".
  2. Visualiza la tabla con los Nro. Recibo, Montos, Estudiantes y Estados de pago (Completado/Pendiente).
  3. Puede realizar filtros por fecha o método de pago y exportar la lista.
- **Postcondiciones**: El reporte es generado para contabilidad.
- **Excepciones**: Ninguna.
