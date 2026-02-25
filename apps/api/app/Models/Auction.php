<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Auction extends Model
{
    use HasFactory;

    protected $fillable = [
        'commodity_id',
        'start_at',
        'end_at',
        'status',
        'timezone',
        'anti_sniping_seconds',
        'extend_minutes',
        'extended_count',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    public function commodity()
    {
        return $this->belongsTo(Commodity::class);
    }

    public function bids()
    {
        return $this->hasMany(\App\Models\Bid::class);
    }

    public function order()
    {
        return $this->hasOne(\App\Models\Order::class);
    }
}