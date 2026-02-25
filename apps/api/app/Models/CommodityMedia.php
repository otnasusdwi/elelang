<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CommodityMedia extends Model
{
    use HasFactory;

    protected $table = 'commodity_media';

    protected $fillable = [
        'commodity_id',
        'type',
        'url',
        'sort_order',
    ];

    public function commodity()
    {
        return $this->belongsTo(Commodity::class);
    }
}
