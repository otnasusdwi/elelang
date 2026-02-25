<?php

namespace App\Http\Requests\Escrow;

use Illuminate\Foundation\Http\FormRequest;

class ActionEscrowRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'reference' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}