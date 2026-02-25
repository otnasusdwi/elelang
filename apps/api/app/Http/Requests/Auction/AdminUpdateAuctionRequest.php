<?php

namespace App\Http\Requests\Auction;

use Illuminate\Foundation\Http\FormRequest;

class AdminUpdateAuctionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_at' => ['sometimes', 'date'],
            'end_at' => ['sometimes', 'date'],
            'timezone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'status' => ['sometimes', 'in:scheduled,live,ended,cancelled'],
            'anti_sniping_seconds' => ['sometimes', 'integer', 'min:1', 'max:600'],
            'extend_minutes' => ['sometimes', 'integer', 'min:1', 'max:180'],
        ];
    }
}
