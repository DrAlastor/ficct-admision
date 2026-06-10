<?php

namespace Backend\aula_virtual\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ExamenController extends Controller
{
    /**
     * Muestra la vista principal del módulo de Exámenes dependiendo del rol del usuario.
     * Admin: Gestión completa de exámenes y banco de preguntas.
     * Docente: Visualiza resultados y notas de sus alumnos.
     * Postulante: Visualiza exámenes pendientes y rinde pruebas.
     *
     * @param Request $request Petición HTTP.
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->rol_id == 1) {
            return $this->vistaAdmin();
        } elseif ($user->rol_id == 2) {
            return $this->vistaDocente($user);
        } elseif ($user->rol_id == 3) {
            return $this->vistaPostulante($user);
        }

        return redirect()->route('dashboard')->with('error', 'Rol no autorizado.');
    }

    /**
     * ==========================================
     * LOGICA PARA EL ADMINISTRADOR
     * ==========================================
     */

    /**
     * Retorna la vista del Administrador con todas las materias, los exámenes configurados
     * y las estadísticas del banco de preguntas por cada materia.
     *
     * @return \Inertia\Response
     */
    private function vistaAdmin()
    {
        // Traer materias
        $materias = DB::table('materia')->get();
        
        // Traer exámenes configurados
        $examenes = DB::table('examen as e')
            ->join('materia as m', 'e.materia_id', '=', 'm.id')
            ->select('e.*', 'm.nombre as materia_nombre')
            ->orderBy('e.fecha_inicio', 'desc')
            ->get();

        // Conteo de preguntas en el banco
        $bancoStats = DB::table('pregunta')
            ->select('materia_id', DB::raw('count(*) as total'))
            ->groupBy('materia_id')
            ->get()
            ->keyBy('materia_id');

        foreach ($materias as $m) {
            $m->total_preguntas = isset($bancoStats[$m->id]) ? $bancoStats[$m->id]->total : 0;
        }

        return Inertia::render('Modulos/aula_virtual/Examenes/Index', [
            'rol' => 'admin',
            'materias' => $materias,
            'examenes' => $examenes
        ]);
    }

    /**
     * Devuelve la vista para gestionar el Banco de Preguntas.
     * Exclusivo para administradores. Muestra todas las materias y las preguntas registradas.
     *
     * @param Request $request Petición HTTP.
     * @return \Inertia\Response
     */
    public function preguntas(Request $request)
    {
        $user = $request->user();
        if ($user->rol_id != 1) abort(403);

        $materias = DB::table('materia')->get();
        $preguntas = DB::table('pregunta as p')
            ->join('materia as m', 'p.materia_id', '=', 'm.id')
            ->select('p.*', 'm.nombre as materia_nombre')
            ->orderBy('p.materia_id')
            ->orderBy('p.id')
            ->get();

        return Inertia::render('Modulos/aula_virtual/Examenes/Preguntas', [
            'materias' => $materias,
            'preguntas' => $preguntas
        ]);
    }

    /**
     * Almacena un nuevo examen programado en la base de datos.
     * Define tipo de examen, duración, cantidad de preguntas y fechas de habilitación.
     *
     * @param Request $request Petición HTTP con los datos del formulario.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeExamen(Request $request)
    {
        $request->validate([
            'materia_id' => 'required|integer',
            'tipo' => 'required|string', // 'Parcial 1', 'Parcial 2', 'Examen Final'
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'duracion_minutos' => 'required|integer|min:5',
            'cantidad_preguntas' => 'required|integer|min:1'
        ]);

        DB::table('examen')->insert([
            'materia_id' => $request->materia_id,
            'tipo' => $request->tipo,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin' => $request->fecha_fin,
            'duracion_minutos' => $request->duracion_minutos,
            'cantidad_preguntas' => $request->cantidad_preguntas
        ]);

        return back()->with('success', 'Examen programado correctamente.');
    }

    /**
     * Guarda una nueva pregunta en el banco de preguntas para una materia específica.
     *
     * @param Request $request Contiene enunciado, opciones (A, B, C, D) y la respuesta correcta.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storePregunta(Request $request)
    {
        $request->validate([
            'materia_id' => 'required|integer',
            'enunciado' => 'required|string',
            'opcion_a' => 'required|string',
            'opcion_b' => 'required|string',
            'opcion_c' => 'required|string',
            'opcion_d' => 'required|string',
            'respuesta_correcta' => 'required|in:A,B,C,D'
        ]);

        DB::table('pregunta')->insert($request->except('_token'));
        return back()->with('success', 'Pregunta añadida al banco.');
    }

    /**
     * Genera automáticamente 10 preguntas por cada materia (Matemáticas, Física, Inglés, Computación)
     * basándose en temas predefinidos (Seeder) para llenar el banco rápidamente.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function seederPreguntas()
    {
        $materias = DB::table('materia')->get();
        if ($materias->isEmpty()) {
            return back()->with('error', 'No hay materias registradas.');
        }

        $temarios = [
            'matemáticas' => [
                '¿Cuál es el resultado de la siguiente operación aritmética: 5 + 3 * 2?',
                'Resuelve la siguiente ecuación algebraica: 2x + 5 = 15. ¿Cuál es el valor de x?',
                '¿Cuál es la solución de la inecuación: 3x - 2 > 10?',
                'Calcula el logaritmo en base 10 de 1000.',
                'En un triángulo rectángulo, si el cateto opuesto mide 3 y el adyacente 4, ¿cuál es la tangente del ángulo?',
                '¿Cuál es el área de un círculo de radio 5? (Usa pi=3.14)',
                'Calcula el valor de x en la ecuación: x^2 - 4 = 0',
                '¿Cuál es el resultado de la operación: (4^2) / 2?',
                'Si el seno de un ángulo es 0.5, ¿cuál es el ángulo en grados (0 a 90)?',
                '¿Cuál es el perímetro de un cuadrado de lado 6?'
            ],
            'física' => [
                'Según la introducción a la física, ¿cuál de las siguientes es una magnitud fundamental?',
                'En metrología, ¿cuál es la unidad del Sistema Internacional para medir la temperatura?',
                'En termología, ¿cuál es el punto de ebullición del agua a nivel del mar en grados Celsius?',
                '¿Cuál de las siguientes cantidades es un vector?',
                'En estática, para que un cuerpo esté en equilibrio de traslación, la suma de las fuerzas debe ser:',
                'En cinemática, la tasa de cambio de la velocidad con respecto al tiempo se denomina:',
                'Según la segunda ley de Newton (Dinámica), la fuerza es igual a la masa multiplicada por:',
                '¿Cuál es el valor aproximado de la gravedad en la Tierra?',
                '¿Qué instrumento se utiliza para medir fuerzas?',
                'La energía cinética de un cuerpo depende de su masa y su:'
            ],
            'inglés' => [
                'Choose the correct form of the verb "To be": She ___ a student.',
                'Identify the subject in the sentence: "The quick brown fox jumps over the lazy dog."',
                'Select the correct sentence in Simple Present: ',
                'Which sentence is in Present Continuous?',
                'Choose the correct form in Simple Past: They ___ to the park yesterday.',
                'Which sentence is in Past Continuous?',
                'Select the correct form for Simple Future: I ___ you tomorrow.',
                'Choose the correct pronoun: ___ is my best friend.',
                'What is the past tense of the verb "To have"?',
                'Identify the verb in the sentence: "He runs very fast."'
            ],
            'computación' => [
                'En introducción a la tecnología informática, ¿cuál es el cerebro de la computadora?',
                'En redes, ¿qué significa la sigla LAN?',
                'En el sistema de numeración binario, ¿cuáles son los únicos dígitos permitidos?',
                '¿Cuántos bits conforman un byte en la representación de la información?',
                'En razonamiento lógico, si A es verdadero y B es falso, ¿qué resulta de la operación AND (A y B)?',
                '¿Cuál de los siguientes es un dispositivo de entrada?',
                '¿Qué protocolo se utiliza comúnmente para navegar en páginas web?',
                'El número 10 en sistema decimal, ¿cómo se representa en binario?',
                '¿Qué componente almacena información de forma permanente incluso al apagar el equipo?',
                'En lógica, ¿cuál es la compuerta que invierte el valor de entrada?'
            ]
        ];

        $respuestasFalsas = [
            'matemáticas' => [['16','11','13'],['10','4','6'],['x > 5','x < 4','x > 3'],['2','4','10'],['0.75','1.33','0.6'],['31.4','15.7','78.5'],['4,-4','Solo 4','0'],['16','4','12'],['45','60','90'],['12','36','18']],
            'física' => [['Velocidad','Fuerza','Aceleración'],['Fahrenheit','Celsius','Rankine'],['0','50','212'],['Masa','Tiempo','Temperatura'],['Mayor a cero','Menor a cero','Constante'],['Posición','Rapidez','Desplazamiento'],['Velocidad','Distancia','Tiempo'],['9.8 m/s','9.8 m/s^3','10 m/s'],['Termómetro','Barómetro','Cronómetro'],['Posición','Altura','Temperatura']],
            'inglés' => [['am','are','be'],['fox','jumps','dog'],['He playing soccer','He play soccer','He is play soccer'],['They plays','They played','They play'],['go','goed','gone'],['I played','I play','I playing'],['will call','am call','called'],['Him','His','Them'],['has','have','having'],['fast','He','very']],
            'computación' => [['Disco Duro','Memoria RAM','Fuente de poder'],['Large Area Network','Local Access Network','Logical Area Network'],['1 y 2','0, 1 y 2','A y B'],['4','16','32'],['Verdadero','Depende','Ninguna'],['Monitor','Impresora','Parlante'],['FTP','SMTP','POP3'],['1000','1100','1001'],['Memoria RAM','Caché','Registros CPU'],['AND','OR','XOR']]
        ];

        $respuestasCorrectas = [
            'matemáticas' => ['11','5','x > 4','3','0.75','78.5','2, -2','8','30','24'],
            'física' => ['Longitud','Kelvin','100','Fuerza','Cero','Aceleración','Aceleración','9.8 m/s^2','Dinamómetro','Velocidad'],
            'inglés' => ['is','fox','He plays soccer','They are playing','went','I was playing','will call','He','had','runs'],
            'computación' => ['Procesador (CPU)','Local Area Network','0 y 1','8','Falso','Teclado','HTTP/HTTPS','1010','Disco Duro','NOT']
        ];

        $preguntas = [];
        foreach ($materias as $m) {
            $nombreLower = strtolower($m->nombre);
            
            $key = null;
            if (strpos($nombreLower, 'matem') !== false) $key = 'matemáticas';
            elseif (strpos($nombreLower, 'fisica') !== false || strpos($nombreLower, 'física') !== false) $key = 'física';
            elseif (strpos($nombreLower, 'ingl') !== false) $key = 'inglés';
            elseif (strpos($nombreLower, 'compu') !== false || strpos($nombreLower, 'info') !== false) $key = 'computación';
            
            if ($key) {
                for ($i = 0; $i < 10; $i++) {
                    $opciones = $respuestasFalsas[$key][$i];
                    $opciones[] = $respuestasCorrectas[$key][$i];
                    shuffle($opciones);
                    
                    $correctaIndex = array_search($respuestasCorrectas[$key][$i], $opciones);
                    $letras = ['A', 'B', 'C', 'D'];
                    
                    $preguntas[] = [
                        'materia_id' => $m->id,
                        'enunciado' => $temarios[$key][$i],
                        'opcion_a' => (string)$opciones[0],
                        'opcion_b' => (string)$opciones[1],
                        'opcion_c' => (string)$opciones[2],
                        'opcion_d' => (string)$opciones[3],
                        'respuesta_correcta' => $letras[$correctaIndex]
                    ];
                }
            } else {
                // Si hay una materia que no concuerda, preguntas genéricas
                for ($i = 1; $i <= 10; $i++) {
                    $preguntas[] = [
                        'materia_id' => $m->id,
                        'enunciado' => 'Pregunta de teoría ' . $i . ' sobre conceptos de ' . $m->nombre . '.',
                        'opcion_a' => 'Concepto erróneo 1',
                        'opcion_b' => 'Concepto erróneo 2',
                        'opcion_c' => 'Concepto erróneo 3',
                        'opcion_d' => 'Esta es la respuesta correcta de prueba.',
                        'respuesta_correcta' => 'D'
                    ];
                }
            }
        }

        if(count($preguntas) > 0) {
            DB::table('pregunta')->insert($preguntas);
        }
        
        return back()->with('success', 'Se generaron ' . count($preguntas) . ' preguntas de prueba exitosamente con los temarios oficiales.');
    }

    /**
     * Elimina una pregunta específica del banco de datos.
     *
     * @param int $id ID de la pregunta a eliminar.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroyPregunta($id)
    {
        DB::table('pregunta')->where('id', $id)->delete();
        return back()->with('success', 'Pregunta eliminada del banco exitosamente.');
    }

    /**
     * Limpia completamente el banco de preguntas (elimina todas).
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function clearPreguntas()
    {
        DB::table('pregunta')->truncate();
        return back()->with('success', 'Se ha limpiado todo el banco de preguntas.');
    }


    /**
     * ==========================================
     * LOGICA PARA EL DOCENTE
     * ==========================================
     */

    /**
     * Genera la vista para el rol de Docente.
     * Muestra las materias asignadas al docente y la lista de sus estudiantes 
     * con sus respectivas notas para cada evaluación (Parcial 1, 2, Final).
     *
     * @param object $user Usuario autenticado (Docente).
     * @return \Inertia\Response
     */
    private function vistaDocente($user)
    {
        $perfil = DB::table('perfil')->where('usuario_id', $user->id)->first();
        if (!$perfil) {
            return Inertia::render('Modulos/aula_virtual/Examenes/Index', ['rol' => 'error', 'message' => 'Perfil no encontrado.']);
        }

        // Obtener grupos del docente
        $grupos = DB::table('carga_horaria as ch')
            ->join('grupo as g', 'ch.grupo_codigo', '=', 'g.codigo')
            ->join('materia as m', 'g.materia_id', '=', 'm.id')
            ->where('ch.docente_id', $perfil->id)
            ->select('g.codigo as grupo_codigo', 'g.nombre as grupo_nombre', 'm.nombre as materia_nombre', 'm.id as materia_id')
            ->get();

        $notasPorGrupo = [];

        foreach ($grupos as $g) {
            // Obtener estudiantes y sus notas en EVALUACIONES
            $estudiantes = DB::table('inscripciones_cup as i')
                ->join('postulacion as p', 'i.postulacion_codigo', '=', 'p.codigo')
                ->join('postulante as pos', 'p.postulante_id', '=', 'pos.id')
                ->join('perfil as perf', 'pos.perfil_id', '=', 'perf.id')
                ->leftJoin('evaluaciones as ev', 'i.id', '=', 'ev.inscripcion_id')
                ->where('i.grupo_codigo', $g->grupo_codigo)
                ->select(
                    'perf.nombres', 'perf.apellido_paterno', 'perf.apellido_materno',
                    'ev.nota_p1', 'ev.nota_p2', 'ev.nota_p3', 'ev.promedio_final', 'ev.estado_materia'
                )
                ->orderBy('perf.apellido_paterno')
                ->get();
            
            $notasPorGrupo[$g->grupo_codigo] = $estudiantes;
        }

        return Inertia::render('Modulos/aula_virtual/Examenes/Index', [
            'rol' => 'docente',
            'grupos' => $grupos,
            'notas' => $notasPorGrupo
        ]);
    }


    /**
     * ==========================================
     * LOGICA PARA EL POSTULANTE
     * ==========================================
     */

    /**
     * Genera la vista para el rol de Postulante.
     * Muestra sus materias inscritas y los exámenes disponibles en curso.
     * También bloquea los exámenes que el postulante ya ha rendido previamente.
     *
     * @param object $user Usuario autenticado (Postulante).
     * @return \Inertia\Response
     */
    private function vistaPostulante($user)
    {
        $perfil = DB::table('perfil')->where('usuario_id', $user->id)->first();
        if (!$perfil) {
            return Inertia::render('Modulos/aula_virtual/Examenes/Index', ['rol' => 'error', 'message' => 'Perfil no encontrado.']);
        }

        $postulante = DB::table('postulante')->where('id', $perfil->id)->first();
        if (!$postulante) {
            return Inertia::render('Modulos/aula_virtual/Examenes/Index', ['rol' => 'error', 'message' => 'No estás registrado como postulante.']);
        }

        // Obtener materias inscritas
        $inscripciones = DB::table('postulacion as p')
            ->join('inscripciones_cup as i', 'p.codigo', '=', 'i.postulacion_codigo')
            ->join('grupo as g', 'i.grupo_codigo', '=', 'g.codigo')
            ->join('materia as m', 'g.materia_id', '=', 'm.id')
            ->leftJoin('evaluaciones as ev', 'i.id', '=', 'ev.inscripcion_id')
            ->where('p.postulante_id', $postulante->id)
            ->select('i.id as inscripcion_id', 'm.id as materia_id', 'm.nombre as materia_nombre', 'g.nombre as grupo_nombre', 'ev.nota_p1', 'ev.nota_p2', 'ev.nota_p3', 'ev.promedio_final', 'ev.estado_materia')
            ->get();

        $materiasIds = $inscripciones->pluck('materia_id')->toArray();

        // Buscar exámenes para esas materias
        $ahora = Carbon::now();
        
        $examenes_disponibles = DB::table('examen as e')
            ->join('materia as m', 'e.materia_id', '=', 'm.id')
            ->whereIn('e.materia_id', $materiasIds)
            ->where('e.fecha_inicio', '<=', $ahora)
            ->where('e.fecha_fin', '>=', $ahora)
            ->select('e.*', 'm.nombre as materia_nombre')
            ->get();

        // Obtener intentos realizados para saber si ya dio un examen disponible
        $inscripcionesIds = $inscripciones->pluck('inscripcion_id')->toArray();
        $intentos = DB::table('intento_examen')
            ->whereIn('inscripcion_id', $inscripcionesIds)
            ->get()
            ->keyBy('examen_id');

        foreach ($examenes_disponibles as $e) {
            $e->ya_realizado = isset($intentos[$e->id]);
            if ($e->ya_realizado) {
                $e->nota_obtenida = $intentos[$e->id]->nota_obtenida;
            }
        }

        return Inertia::render('Modulos/aula_virtual/Examenes/Index', [
            'rol' => 'postulante',
            'inscripciones' => $inscripciones,
            'examenes' => $examenes_disponibles
        ]);
    }

    /**
     * Inicia el proceso de rendir un examen para un postulante.
     * Valida la fecha activa, que no haya sido rendido antes y extrae un número de preguntas 
     * aleatorias según la configuración del examen. No envía la respuesta correcta al frontend.
     *
     * @param int $id ID del examen a rendir.
     * @param Request $request Petición HTTP.
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function rendir($id, Request $request)
    {
        $user = $request->user();
        if ($user->rol_id != 3) abort(403);

        $perfil = DB::table('perfil')->where('usuario_id', $user->id)->first();
        $postulante = DB::table('postulante')->where('id', $perfil->id)->first();

        $examen = DB::table('examen as e')
            ->join('materia as m', 'e.materia_id', '=', 'm.id')
            ->where('e.id', $id)
            ->select('e.*', 'm.nombre as materia_nombre')
            ->first();

        if (!$examen) abort(404, 'Examen no encontrado');

        $ahora = Carbon::now();
        if ($ahora < Carbon::parse($examen->fecha_inicio) || $ahora > Carbon::parse($examen->fecha_fin)) {
            return redirect()->route('examenes.index')->with('error', 'El examen no está en su periodo activo.');
        }

        // Buscar la inscripción correspondiente a esta materia
        $inscripcion = DB::table('postulacion as p')
            ->join('inscripciones_cup as i', 'p.codigo', '=', 'i.postulacion_codigo')
            ->join('grupo as g', 'i.grupo_codigo', '=', 'g.codigo')
            ->where('p.postulante_id', $postulante->id)
            ->where('g.materia_id', $examen->materia_id)
            ->select('i.id')
            ->first();

        if (!$inscripcion) {
            return redirect()->route('examenes.index')->with('error', 'No estás inscrito en esta materia.');
        }

        // Verificar si ya lo rindió
        $intento = DB::table('intento_examen')
            ->where('examen_id', $examen->id)
            ->where('inscripcion_id', $inscripcion->id)
            ->first();

        if ($intento) {
            return redirect()->route('examenes.index')->with('error', 'Ya realizaste este examen. No puedes volver a enviarlo.');
        }

        // Obtener preguntas aleatorias (no mandar la respuesta correcta al frontend)
        $preguntas = DB::table('pregunta')
            ->where('materia_id', $examen->materia_id)
            ->inRandomOrder()
            ->limit($examen->cantidad_preguntas)
            ->select('id', 'enunciado', 'opcion_a', 'opcion_b', 'opcion_c', 'opcion_d')
            ->get();

        if ($preguntas->isEmpty()) {
            return redirect()->route('examenes.index')->with('error', 'No hay preguntas suficientes en el banco para esta materia.');
        }

        return Inertia::render('Modulos/aula_virtual/Examenes/Rendir', [
            'examen' => $examen,
            'preguntas' => $preguntas,
            'inscripcion_id' => $inscripcion->id
        ]);
    }

    /**
     * Recibe y evalúa el examen enviado por el postulante.
     * Valida respuestas, calcula el porcentaje de aciertos y actualiza 
     * directamente la nota correspondiente en la tabla EVALUACIONES según el tipo de examen.
     *
     * @param int $id ID del examen rendido.
     * @param Request $request Contiene 'inscripcion_id' y el arreglo de 'respuestas'.
     * @return \Illuminate\Http\RedirectResponse
     */
    public function calificar($id, Request $request)
    {
        $user = $request->user();
        if ($user->rol_id != 3) abort(403);

        $request->validate([
            'inscripcion_id' => 'required|integer',
            'respuestas' => 'required|array'
        ]);

        $examen = DB::table('examen')->where('id', $id)->first();
        if (!$examen) abort(404);

        // Validar doble envío
        $intento = DB::table('intento_examen')
            ->where('examen_id', $examen->id)
            ->where('inscripcion_id', $request->inscripcion_id)
            ->first();

        if ($intento) {
            return redirect()->route('examenes.index')->with('error', 'Ya se registró la calificación de este examen.');
        }

        $correctas = 0;
        $total = count($request->respuestas);
        
        if ($total == 0) {
            $total = $examen->cantidad_preguntas; // Evitar division por cero si enviaron vacio
        }

        foreach ($request->respuestas as $res) {
            $pregunta = DB::table('pregunta')->where('id', $res['pregunta_id'])->first();
            if ($pregunta && $pregunta->respuesta_correcta === $res['seleccionada']) {
                $correctas++;
            }
        }

        // Nota sobre 100
        $notaPura100 = ($correctas / $total) * 100;

        // Registrar intento
        DB::table('intento_examen')->insert([
            'examen_id' => $examen->id,
            'inscripcion_id' => $request->inscripcion_id,
            'nota_obtenida' => $notaPura100,
            'fecha_realizacion' => Carbon::now()
        ]);

        // Asegurarnos de que exista un registro en EVALUACIONES
        $eval = DB::table('evaluaciones')->where('inscripcion_id', $request->inscripcion_id)->first();
        
        if (!$eval) {
            $evalId = DB::table('evaluaciones')->insertGetId([
                'inscripcion_id' => $request->inscripcion_id,
                'nota_p1' => 0, 'nota_p2' => 0, 'nota_p3' => 0, 'promedio_final' => 0,
                'estado_materia' => 'Reprobado'
            ]);
            $eval = DB::table('evaluaciones')->where('id', $evalId)->first();
        }

        $updateData = [];
        
        // Ponderar: 30% para Parcial 1 y 2, 40% para Final
        if ($examen->tipo === 'Parcial 1') {
            $updateData['nota_p1'] = $notaPura100 * 0.30;
        } elseif ($examen->tipo === 'Parcial 2') {
            $updateData['nota_p2'] = $notaPura100 * 0.30;
        } elseif ($examen->tipo === 'Examen Final' || $examen->tipo === 'Final') {
            $updateData['nota_p3'] = $notaPura100 * 0.40;
        }

        // Calcular nuevo promedio usando las notas existentes (solo actualizando la actual)
        $p1 = isset($updateData['nota_p1']) ? $updateData['nota_p1'] : $eval->nota_p1;
        $p2 = isset($updateData['nota_p2']) ? $updateData['nota_p2'] : $eval->nota_p2;
        $p3 = isset($updateData['nota_p3']) ? $updateData['nota_p3'] : $eval->nota_p3;
        
        $promedioFinal = $p1 + $p2 + $p3;
        $updateData['promedio_final'] = $promedioFinal;
        
        if ($promedioFinal >= 60) {
            $updateData['estado_materia'] = 'Aprobado';
        } else {
            $updateData['estado_materia'] = 'Reprobado';
        }

        DB::table('evaluaciones')
            ->where('inscripcion_id', $request->inscripcion_id)
            ->update($updateData);

        return redirect()->route('examenes.index')->with('success', 'Examen enviado correctamente. Calificación: ' . round($notaPura100, 2) . '/100');
    }
}
