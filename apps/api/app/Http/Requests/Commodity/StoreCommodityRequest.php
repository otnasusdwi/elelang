<?php

namespace App\Http\Requests\Commodity;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommodityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'weight_kg' => ['nullable', 'numeric', 'min:0'],
            'size_grade' => ['nullable', 'string', 'max:50'],
            'location' => ['nullable', 'string', 'max:150'],
            'catch_method' => ['nullable', 'string', 'max:100'],
            'catch_time' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'in:draft,published,archived'],

            // media opsional: array of {type,url,sort_order}
            'media' => ['nullable', 'array'],
            'media.*.type' => ['required_with:media', 'in:image,video'],
            'media.*.url' => ['required_with:media', 'string'],
            'media.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
