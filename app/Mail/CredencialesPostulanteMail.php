<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CredencialesPostulanteMail extends Mailable
{
    use Queueable, SerializesModels;

    public $nombre;
    public $codigo;
    public $password;

    /**
     * Create a new message instance.
     */
    public function __construct($nombre, $codigo, $password)
    {
        $this->nombre = $nombre;
        $this->codigo = $codigo;
        $this->password = $password;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Bienvenido a la FICCT! Tus credenciales de acceso',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.postulantes.credenciales',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
