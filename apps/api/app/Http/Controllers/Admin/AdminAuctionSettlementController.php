<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Auction;
use App\Services\AuctionSettlementService;

class AdminAuctionSettlementController extends Controller
{
    /**
     * @OA\Post(
     *   path="/admin/auctions/{id}/close",
     *   tags={"Admin - Auctions"},
     *   summary="Close auction & create order (admin, for testing/ops)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function close(Auction $auction, AuctionSettlementService $service)
    {
        $order = $service->closeAuction($auction->id);
        return response()->json($order);
    }
}