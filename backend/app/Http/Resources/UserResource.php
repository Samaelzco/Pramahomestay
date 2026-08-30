<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $relationCount = collect(['created_bookings_count', 'created_guests_count', 'created_payments_count'])
            ->sum(fn (string $attribute): int => (int) ($this->resource->getAttribute($attribute) ?? 0));
        if (! array_key_exists('created_bookings_count', $this->resource->getAttributes())) {
            $relationCount = $this->createdBookings()->withTrashed()->count()
                + $this->createdGuests()->withTrashed()->count()
                + $this->createdPayments()->withTrashed()->count();
        }

        /** @var User|null $actor */
        $actor = $request->user();
        $isSelf = $actor?->is($this->resource) ?? false;
        $isLastActiveAdmin = $this->is_active
            && $this->hasRole('admin')
            && User::query()->where('is_active', true)->role('admin')->count() <= 1;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roles' => $this->getRoleNames()->values(),
            'role_labels' => $this->roles->map(fn ($role) => $role->display_name ?? Str::headline($role->name))->values(),
            'permissions' => $this->getAllPermissions()->pluck('name')->values(),
            'is_active' => $this->is_active,
            'receives_internal_email_notifications' => $this->receives_internal_email_notifications,
            'is_self' => $isSelf,
            'can_change_status' => ! $isSelf && ! $isLastActiveAdmin,
            'can_delete' => ! $isSelf && ! $isLastActiveAdmin && $relationCount === 0,
            'last_login_at' => $this->last_login_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
