<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class AddHandoverProofRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'type' => ['required', 'in:pickup,delivery,received'],
            'media_url' => ['required', 'string'],
            'timestamp' => ['nullable', 'date'],
        ];
    }
}