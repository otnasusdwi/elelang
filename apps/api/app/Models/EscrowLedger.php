<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EscrowLedger extends Model
{
    use HasFactory;

    protected $table = 'escrow_ledger';

    protected $fillable = [
        'order_id',
        'amount',
        'state',
        'reference',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}