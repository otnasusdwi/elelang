<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HandoverProof extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'type',
        'media_url',
        'timestamp',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}