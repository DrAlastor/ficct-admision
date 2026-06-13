<?php

namespace Backend\gestion_academica\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * CU22 - Gestionar Exámenes
 */
class GestionExamenController extends Controller
{
    /**
     * Obtiene y muestra la lista principal de registros o la vista por defecto.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->rol_id != 1) {
            return redirect()->route('dashboard')->with('error', 'Rol no autorizado.');
        }

        $materias = DB::table('materia')->get();
        
        $examenes = DB::table('examen as e')
            ->select('e.*')
            ->orderBy('e.fecha_inicio', 'desc')
            ->get();

        foreach ($examenes as $examen) {
            $examen->materias = DB::table('examen_materia as em')
                ->join('materia as m', 'em.materia_id', '=', 'm.id')
                ->where('em.examen_id', $examen->id)
                ->select('m.nombre', 'em.cantidad_preguntas')
                ->get();
        }

        $bancoStats = DB::table('pregunta')
            ->select('materia_id', DB::raw('count(*) as total'))
            ->groupBy('materia_id')
            ->get()
            ->keyBy('materia_id');

        foreach ($materias as $m) {
            $m->total_preguntas = isset($bancoStats[$m->id]) ? $bancoStats[$m->id]->total : 0;
        }

        return Inertia::render('Modulos/gestion_academica/Examenes/Index', [
            'materias' => $materias,
            'examenes' => $examenes
        ]);
    }

    /**
     * Ejecuta la acción o procedimiento 'preguntas' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
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

        return Inertia::render('Modulos/gestion_academica/Examenes/Preguntas', [
            'materias' => $materias,
            'preguntas' => $preguntas
        ]);
    }

    /**
     * Ejecuta la acción o procedimiento 'storeExamen' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function storeExamen(Request $request)
    {
        $request->validate([
            'turno' => 'required|string',
            'tipo' => 'required|string', 
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'duracion_minutos' => 'required|integer|min:5',
            'password' => 'required|string',
            'preguntas_por_materia' => 'required|array'
        ]);

        DB::beginTransaction();
        try {
            $examenId = DB::table('examen')->insertGetId([
                'turno' => $request->turno,
                'tipo' => $request->tipo,
                'fecha_inicio' => $request->fecha_inicio,
                'fecha_fin' => $request->fecha_fin,
                'duracion_minutos' => $request->duracion_minutos,
                'password' => $request->password
            ]);

            $inserts = [];
            foreach ($request->preguntas_por_materia as $materiaId => $cantidad) {
                if ($cantidad > 0) {
                    $inserts[] = [
                        'examen_id' => $examenId,
                        'materia_id' => $materiaId,
                        'cantidad_preguntas' => $cantidad
                    ];
                }
            }

            if (!empty($inserts)) {
                DB::table('examen_materia')->insert($inserts);
            }

            DB::commit();
            return back()->with('success', 'Examen programado correctamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al programar el examen: ' . $e->getMessage()]);
        }
    }

    /**
     * Ejecuta la acción o procedimiento 'storePregunta' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
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
     * Ejecuta la acción o procedimiento 'seederPreguntas' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
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
                '¿Cuál de las siguientes es un dispositivo de entrada?',
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
     * Ejecuta la acción o procedimiento 'destroyPregunta' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function destroyPregunta($id)
    {
        DB::table('pregunta')->where('id', $id)->delete();
        return back()->with('success', 'Pregunta eliminada del banco exitosamente.');
    }

    /**
     * Ejecuta la acción o procedimiento 'clearPreguntas' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function clearPreguntas()
    {
        DB::table('pregunta')->truncate();
        return back()->with('success', 'Se ha limpiado todo el banco de preguntas.');
    }
}
