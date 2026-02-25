<?php

namespace App\Http\Requests\Commodity;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCommodityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:150'],
            'weight_kg' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'size_grade' => ['sometimes', 'nullable', 'string', 'max:50'],
            'location' => ['sometimes', 'nullable', 'string', 'max:150'],
            'catch_method' => ['sometimes', 'nullable', 'string', 'max:100'],
            'catch_time' => ['sometimes', 'nullable', 'date'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'in:draft,published,archived'],

            // kalau update media, kita replace list-nya (simple)
            'media' => ['sometimes', 'array'],
            'media.*.type' => ['required_with:media', 'in:image,video'],
            'media.*.url' => ['required_with:media', 'string'],
            'media.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
