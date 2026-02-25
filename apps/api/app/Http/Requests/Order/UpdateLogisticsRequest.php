<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLogisticsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'pickup_time' => ['nullable', 'date'],
            'pickup_location' => ['nullable', 'string', 'max:200'],
            'delivery_method' => ['nullable', 'in:pickup,courier,other'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}