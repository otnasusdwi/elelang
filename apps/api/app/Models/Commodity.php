<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Commodity extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'name',
        'weight_kg',
        'size_grade',
        'location',
        'catch_method',
        'catch_time',
        'description',
        'status',
    ];

    protected $casts = [
        'catch_time' => 'datetime',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function media()
    {
        return $this->hasMany(CommodityMedia::class);
    }
}
