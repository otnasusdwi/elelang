<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;

class AuditAdminActions
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $user = $request->user();
        if ($user && ($user->role ?? '') === 'admin') {
            // sanitize payload: jangan simpan password/token
            $payload = $request->except(['password', 'password_confirmation', 'token']);

            AuditLog::query()->create([
                'user_id' => $user->id,
                'action' => 'admin.request',
                'method' => $request->method(),
                'path' => $request->path(),
                'status_code' => $response->getStatusCode(),
                'ip' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 255),
                'payload' => $payload,
                'meta' => [
                    'route_name' => optional($request->route())->getName(),
                ],
            ]);
        }

        return $response;
    }
}