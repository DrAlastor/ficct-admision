<?php

namespace Backend\consulta_reporte\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiAIService
{
    protected $apiKey;
    protected $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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

Tabla: gestion (id SERIAL, semestre INT, aÑo INT)
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

        $response = Http::withHeaders([
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

        $response = Http::post($this->apiUrl . '?key=' . $this->apiKey, [
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
}
