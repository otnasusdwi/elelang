<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;

class AdminAnalyticsController extends Controller
{
    /**
     * @OA\Get(
     *   path="/admin/analytics/summary",
     *   tags={"Admin - Analytics"},
     *   summary="Dashboard summary KPI (admin)",
     *   security={{"sanctum":{}}},
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function summary(AnalyticsService $service)
    {
        return response()->json($service->summary());
    }

    /**
     * @OA\Get(
     *   path="/admin/analytics/time-series",
     *   tags={"Admin - Analytics"},
     *   summary="Orders & GMV time-series (admin)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="days", in="query", required=false, @OA\Schema(type="integer", example=30)),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function timeSeries(Request $request, AnalyticsService $service)
    {
        $days = (int) $request->query('days', 30);
        return response()->json($service->timeSeries($days));
    }
}