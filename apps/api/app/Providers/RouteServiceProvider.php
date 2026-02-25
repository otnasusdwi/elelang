<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    public const HOME = '/home';

    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // ✅ ADD THIS
        RateLimiter::for('bids', function (Request $request) {
            $userId = $request->user()?->id ?: $request->ip();
            $auction = $request->route('auction');
            $auctionId = is_object($auction) ? ($auction->id ?? 'x') : ($auction ?: 'x');

            return [
                Limit::perMinute(20)->by("bids:$userId:$auctionId"),
                Limit::perMinute(60)->by("bids-global:$userId"),
            ];
        });

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}