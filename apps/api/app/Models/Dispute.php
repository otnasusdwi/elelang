<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Dispute extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'opened_by',
        'reason',
        'description',
        'status',
        'resolution',
        'resolution_note',
        'resolved_by',
    ];

    public function order() { return $this->belongsTo(Order::class); }
    public function opener() { return $this->belongsTo(User::class, 'opened_by'); }
    public function resolver() { return $this->belongsTo(User::class, 'resolved_by'); }
    public function messages() { return $this->hasMany(DisputeMessage::class); }
}