<?php

namespace App\Http\Requests\Access;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('roles.update') ?? false;
    }

    public function rules(): array
    {
        $role = Role::query()->where('guard_name', 'web')->where('name', (string) $this->route('role'))->firstOrFail();

        return [
            'display_name' => ['required', 'string', 'max:100', Rule::unique('roles', 'display_name')->ignore($role)],
            'description' => ['nullable', 'string', 'max:500'],
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string', 'distinct', Rule::exists('permissions', 'name')->where('guard_name', 'web')],
        ];
    }
}
