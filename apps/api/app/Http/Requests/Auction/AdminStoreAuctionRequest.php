<?php

namespace App\Http\Requests\Auction;

use Illuminate\Foundation\Http\FormRequest;

class AdminStoreAuctionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'commodity_id' => ['required', 'integer', 'exists:commodities,id'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],

            'timezone' => ['nullable', 'string', 'max:50'],

            'anti_sniping_seconds' => ['nullable', 'integer', 'min:1', 'max:600'],
            'extend_minutes' => ['nullable', 'integer', 'min:1', 'max:180'],
        ];
    }
}
