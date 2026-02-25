<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DisputeMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'dispute_id',
        'sender_id',
        'message',
        'media_url',
    ];

    public function dispute() { return $this->belongsTo(Dispute::class); }
    public function sender() { return $this->belongsTo(User::class, 'sender_id'); }
}