<?php

namespace App\Http\Requests\Dispute;

use Illuminate\Foundation\Http\FormRequest;

class AdminResolveDisputeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:in_review,resolved,rejected'],
            'resolution' => ['nullable', 'in:refund,release,replacement,none'],
            'resolution_note' => ['nullable', 'string'],
        ];
    }
}