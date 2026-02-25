<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Logistics extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'pickup_time',
        'pickup_location',
        'delivery_method',
        'notes',
    ];

    protected $casts = [
        'pickup_time' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}