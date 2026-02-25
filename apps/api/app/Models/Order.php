<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'auction_id',
        'commodity_id',
        'seller_id',
        'buyer_id',
        'final_price',
        'status',
    ];

    protected $casts = [
        'final_price' => 'decimal:2',
    ];

    public function auction() { return $this->belongsTo(Auction::class); }
    public function commodity() { return $this->belongsTo(Commodity::class); }
    public function seller() { return $this->belongsTo(User::class, 'seller_id'); }
    public function buyer() { return $this->belongsTo(User::class, 'buyer_id'); }

    public function logistics()
    {
        return $this->hasOne(\App\Models\Logistics::class);
    }

    public function handoverProofs()
    {
        return $this->hasMany(\App\Models\HandoverProof::class);
    }
}