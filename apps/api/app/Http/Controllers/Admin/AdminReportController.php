<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminReportController extends Controller
{
    /**
     * @OA\Get(
     *   path="/admin/reports/orders.csv",
     *   tags={"Admin - Reports"},
     *   summary="Export orders CSV (admin)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="from", in="query", required=false, @OA\Schema(type="string", example="2026-02-01")),
     *   @OA\Parameter(name="to", in="query", required=false, @OA\Schema(type="string", example="2026-02-25")),
     *   @OA\Response(response=200, description="CSV file"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function ordersCsv(Request $request): StreamedResponse
    {
        $from = $request->query('from'); // YYYY-MM-DD
        $to = $request->query('to');     // YYYY-MM-DD

        $q = Order::query()
            ->with(['commodity:id,name', 'buyer:id,name,email', 'seller:id,name,email'])
            ->orderByDesc('id');

        if ($from) $q->whereDate('created_at', '>=', $from);
        if ($to) $q->whereDate('created_at', '<=', $to);

        $filename = 'orders_' . date('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($q) {
            $out = fopen('php://output', 'w');

            fputcsv($out, [
                'order_id', 'status', 'final_price',
                'commodity', 'buyer_name', 'buyer_email',
                'seller_name', 'seller_email',
                'created_at'
            ]);

            $q->chunk(500, function ($orders) use ($out) {
                foreach ($orders as $o) {
                    fputcsv($out, [
                        $o->id,
                        $o->status,
                        (string) $o->final_price,
                        optional($o->commodity)->name,
                        optional($o->buyer)->name,
                        optional($o->buyer)->email,
                        optional($o->seller)->name,
                        optional($o->seller)->email,
                        optional($o->created_at)->toISOString(),
                    ]);
                }
            });

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}