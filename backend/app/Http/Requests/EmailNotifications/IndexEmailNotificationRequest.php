<?php

namespace App\Http\Requests\EmailNotifications;

use App\Enums\EmailNotificationStatus;
use App\Enums\EmailNotificationType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexEmailNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('notifications.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', Rule::enum(EmailNotificationStatus::class)],
            'type' => ['nullable', Rule::enum(EmailNotificationType::class)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'], 'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
