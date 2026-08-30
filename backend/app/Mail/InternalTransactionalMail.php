<?php

namespace App\Mail;

use App\Models\EmailNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InternalTransactionalMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly EmailNotification $notification) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->notification->subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.internal-transactional',
            text: 'mail.internal-transactional-text',
            with: ['notification' => $this->notification],
        );
    }
}
