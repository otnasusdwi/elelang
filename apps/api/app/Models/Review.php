<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'rater_id',
        'ratee_id',
        'rating',
        'comment',
    ];

    public function order() { return $this->belongsTo(Order::class); }
    public function rater() { return $this->belongsTo(User::class, 'rater_id'); }
    public function ratee() { return $this->belongsTo(User::class, 'ratee_id'); }
}