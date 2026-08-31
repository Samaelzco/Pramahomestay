<?php

namespace App\Mail;

use App\Models\EmailNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GuestTransactionalMail extends Mailable
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
            view: 'mail.guest-transactional',
            text: 'mail.guest-transactional-text',
            with: ['notification' => $this->notification],
        );
    }
}
