<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id','action','method','path','status_code','ip','user_agent','payload','meta'
    ];

    protected $casts = [
        'payload' => 'array',
        'meta' => 'array',
    ];
}