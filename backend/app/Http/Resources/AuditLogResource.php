<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'actor' => $this->actor ? [
                'id' => $this->actor->id,
                'name' => $this->actor->name,
                'email' => $this->actor->email,
            ] : null,
            'action' => $this->action,
            'action_label' => [
                'created' => 'Ditambahkan', 'updated' => 'Diperbarui', 'deleted' => 'Dihapus',
                'activated' => 'Diaktifkan', 'deactivated' => 'Dinonaktifkan',
                'cancelled' => 'Dibatalkan', 'refunded' => 'Dikembalikan',
            ][$this->action] ?? ucfirst($this->action),
            'module' => $this->module,
            'module_label' => [
                'rooms' => 'Kamar', 'bookings' => 'Booking', 'payments' => 'Pembayaran',
                'guests' => 'Tamu', 'users' => 'User', 'roles' => 'Hak akses',
                'settings' => 'Pengaturan',
            ][$this->module] ?? ucfirst($this->module),
            'subject_id' => $this->subject_id,
            'subject_label' => $this->subject_label,
            'description' => $this->description,
            'old_values' => $this->old_values,
            'new_values' => $this->new_values,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'created_at' => $this->created_at,
        ];
    }
}
