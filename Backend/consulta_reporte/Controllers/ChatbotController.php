<?php

namespace Backend\consulta_reporte\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Backend\consulta_reporte\Services\GeminiAIService;

/**
 * CU30 - Consultar Asistente Virtual IA
 */
class ChatbotController extends Controller
{
    /**
     * Procesa los mensajes enviados por el usuario hacia el FICCT-Bot
     */
    public function ask(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'history' => 'nullable|array' // Array de mensajes previos para el contexto
        ]);

        try {
            $gemini = new GeminiAIService();
            $respuesta = $gemini->answerChatbotQuery(
                $request->input('message'),
                $request->input('history', [])
            );

            return response()->json([
                'success' => true,
                'reply' => $respuesta
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('ChatbotController Error: ' . $e->getMessage() . ' en ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'success' => false,
                'reply' => "Hubo un error al procesar tu solicitud. Por favor intenta de nuevo más tarde."
            ], 500);
        }
    }
}
