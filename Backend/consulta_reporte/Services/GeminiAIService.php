<?php

namespace Backend\consulta_reporte\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * CU30 - Consultar Asistente Virtual IA (Chat con IA)
 */
class GeminiAIService
{
    protected $apiKey;
    protected $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    /**
     * Ejecuta la acción o procedimiento '__construct' dentro del módulo.
     *
     * @return \Illuminate\Http\Response|\Inertia\Response|mixed
     */
    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
    }

    /**
     * Convierte una pregunta en lenguaje natural a una consulta SQL de PostgreSQL (Read-Only)
     */
    public function generateSqlFromText($userQuery)
    {
        if (empty($this->apiKey)) {
            throw new \Exception("La API Key de Gemini no está configurada en el archivo .env (GEMINI_API_KEY).");
        }

        $schemaContext = "
Eres un experto en PostgreSQL. Dada la siguiente estructura de base de datos de un sistema universitario, 
convierte la pregunta del usuario en una consulta SQL válida. 
ES MUY IMPORTANTE QUE SOLO DEVUELVAS LA CONSULTA SQL EN TEXTO PLANO.
NO INCLUYAS markdown como ```sql o ```, NINGÚN TEXTO EXTRA, SOLO EL SQL.

### ESQUEMA DE BASE DE DATOS RELEVANTE:

Tabla: gestion (id SERIAL, semestre INT, anio INT)
Tabla: perfil (id SERIAL, ci VARCHAR, nombres VARCHAR, apellido_paterno VARCHAR, apellido_materno VARCHAR, sexo CHAR, nacionalidad VARCHAR)
Tabla: postulante (id INT REFERENCES perfil(id), colegio_procedencia VARCHAR, ciudad VARCHAR)
Tabla: postulacion (codigo VARCHAR, gestion_id INT, postulante_id INT, estado VARCHAR)
Tabla: carrera (codigo VARCHAR, nombre VARCHAR)
Tabla: postulacion_carrera (postulacion_codigo VARCHAR, carrera_codigo VARCHAR, prioridad INT)
Tabla: materia (id SERIAL, nombre VARCHAR, sigla VARCHAR)
Tabla: grupo (codigo VARCHAR, materia_id INT, nombre VARCHAR)
Tabla: inscripciones_cup (id SERIAL, postulacion_codigo VARCHAR, grupo_codigo VARCHAR)
Tabla: evaluaciones (inscripcion_id INT, nota_examen1 DECIMAL, nota_examen2 DECIMAL, promedio_final DECIMAL, estado_materia VARCHAR)
Tabla: docente (id INT REFERENCES perfil(id))
Tabla: carga_horaria (id SERIAL, docente_id INT, grupo_codigo VARCHAR)
Tabla: pago (id SERIAL, postulacion_codigo VARCHAR, monto DECIMAL, metodo_pago VARCHAR, estado VARCHAR)

### REGLAS:
1. Usa JOINs explícitos entre las tablas.
2. NUNCA uses UPDATE, DELETE, INSERT, DROP o ALTER. Solo SELECT.
3. Utiliza la función CONCAT(pf.nombres, ' ', pf.apellido_paterno, ' ', pf.apellido_materno) para el nombre completo.
4. Devuelve los resultados ordenados lógicamente o según lo pida el usuario.
5. Usa alias amigables para las columnas devueltas con AS (ej: pf.ci AS \"Carnet de Identidad\").
6. Solo devuelve el código SQL en texto plano, sin formato markdown.

Pregunta del usuario: \"$userQuery\"
        ";

        $response = Http::withoutVerifying()->withHeaders([
            'Content-Type' => 'application/json',
        ])->post($this->apiUrl . '?key=' . $this->apiKey, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $schemaContext]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.1, // Baja temperatura para consultas precisas
                'maxOutputTokens' => 1024,
            ]
        ]);

        if ($response->failed()) {
            Log::error("Error en Gemini API: " . $response->body());
            throw new \Exception("Error al comunicarse con la IA para generar la consulta.");
        }

        $data = $response->json();
        if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            $sql = trim($data['candidates'][0]['content']['parts'][0]['text']);
            // Limpiar posibles bloques markdown si la IA no obedeció
            $sql = str_replace(['```sql', '```'], '', $sql);
            return trim($sql);
        }

        throw new \Exception("La IA no devolvió una respuesta válida.");
    }

    /**
     * Realiza un análisis natural de los datos para el CU27
     */
    public function generateInsightsFromData($dashboardData, $userQuery)
    {
        if (empty($this->apiKey)) {
            throw new \Exception("La API Key de Gemini no está configurada en el archivo .env.");
        }

        $prompt = "
Actúa como un analista de datos experto. Aquí tienes un JSON que contiene los datos pre-calculados del dashboard de la universidad.
El usuario tiene una pregunta sobre estos datos. Analiza el JSON y responde la pregunta de forma breve, analítica, con viñetas y profesional. 

JSON DATA:
" . json_encode($dashboardData) . "

Pregunta del usuario: \"$userQuery\"
        ";

        $response = Http::withoutVerifying()->post($this->apiUrl . '?key=' . $this->apiKey, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ]);

        if ($response->successful()) {
            $data = $response->json();
            return $data['candidates'][0]['content']['parts'][0]['text'] ?? "No se pudo generar un análisis.";
        }

        return "Error al contactar a la IA.";
    }

    /**
     * Responde a preguntas de postulantes y estudiantes (FICCT-Bot)
     * Utiliza un historial de conversacion para mantener el contexto
     */
    public function answerChatbotQuery($userMessage, $history = [])
    {
        if (empty($this->apiKey)) {
            return "Lo siento, mi conexión inteligente está temporalmente inactiva (Falta GEMINI_API_KEY).";
        }

        $systemPrompt = "
Eres 'FICCT-Bot', el asistente virtual amigable, profesional y conciso de la Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones (FICCT) de la UAGRM (Universidad Autónoma Gabriel René Moreno), Santa Cruz, Bolivia.

Tus tareas:
- Ayudar a los postulantes a entender los procesos de inscripción al CUP (Curso Universitario Preuniversitario).
- Explicar sobre las carreras disponibles: Ingeniería Informática, Ingeniería de Sistemas, Ingeniería en Redes y Telecomunicaciones, y el nuevo programa de Ingeniería en Robótica.
- Dar información sobre pagos (la matrícula referencial del CUP es de 700 Bs. y se paga en Caja Facultativa del Módulo 236 o mediante Stripe/PayPal en el sistema).
- Ser muy cordial, usar emojis y mantener respuestas cortas y precisas. No te extiendas demasiado a menos que te pidan detalles.
- Nunca inventes fechas exactas si no las sabes, dile que revise la sección de comunicados o se dirija al Módulo 236, 2do Piso, Ciudad Universitaria.
- Si te piden generar código o hacer cosas ilegales, rechaza educadamente diciendo que tu rol es solo administrativo en la FICCT.
";

        // Preparamos los mensajes de historial para Gemini
        $contents = [];
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $systemPrompt . "\n\nEntendido, actuaré como FICCT-Bot a partir de ahora."]]
        ];
        $contents[] = [
            'role' => 'model',
            'parts' => [['text' => '¡Hola! Soy FICCT-Bot. ¿En qué te puedo ayudar hoy con tu proceso de admisión a la FICCT?']]
        ];

        // Añadir historial previo
        foreach ($history as $msg) {
            // El frontend debe enviar un arreglo de objetos {role: 'user' o 'model', text: 'mensaje'}
            $role = isset($msg['role']) && $msg['role'] === 'model' ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $msg['text'] ?? '']]
            ];
        }

        // Añadir mensaje actual
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userMessage]]
        ];

        $response = Http::withoutVerifying()->post($this->apiUrl . '?key=' . $this->apiKey, [
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.6,
                'maxOutputTokens' => 500,
            ]
        ]);

        if ($response->successful()) {
            $data = $response->json();
            return $data['candidates'][0]['content']['parts'][0]['text'] ?? "Lo siento, no pude procesar tu solicitud en este momento.";
        }

        Log::error("Error en Chatbot Gemini: " . $response->body());
        return "Disculpa, tuve un problema de conexión con el servidor. Por favor intenta de nuevo más tarde.";
    }
}
