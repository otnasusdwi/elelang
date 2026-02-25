<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auction\AdminStoreAuctionRequest;
use App\Http\Requests\Auction\AdminUpdateAuctionRequest;
use App\Models\Auction;

class AdminAuctionController extends Controller
{
    /**
     * @OA\Post(
     *   path="/admin/auctions",
     *   tags={"Admin - Auctions"},
     *   summary="Create auction (admin)",
     *   security={{"sanctum":{}}},
     *   @OA\RequestBody(required=true, @OA\JsonContent(
     *     required={"commodity_id","start_at","end_at"},
     *     @OA\Property(property="commodity_id", type="integer", example=1),
     *     @OA\Property(property="start_at", type="string", example="2026-02-25 12:00:00"),
     *     @OA\Property(property="end_at", type="string", example="2026-02-25 12:30:00"),
     *     @OA\Property(property="timezone", type="string", example="Asia/Makassar"),
     *     @OA\Property(property="anti_sniping_seconds", type="integer", example=10),
     *     @OA\Property(property="extend_minutes", type="integer", example=10)
     *   )),
     *   @OA\Response(response=201, description="Created"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(AdminStoreAuctionRequest $request)
    {
        $auction = Auction::query()->create([
            'commodity_id' => $request->integer('commodity_id'),
            'start_at' => $request->input('start_at'),
            'end_at' => $request->input('end_at'),
            'timezone' => $request->input('timezone'),
            'status' => 'scheduled',
            'anti_sniping_seconds' => $request->input('anti_sniping_seconds', 10),
            'extend_minutes' => $request->input('extend_minutes', 10),
            'extended_count' => 0,
        ]);

        return response()->json($auction->load('commodity.media'), 201);
    }

    /**
     * @OA\Patch(
     *   path="/admin/auctions/{id}",
     *   tags={"Admin - Auctions"},
     *   summary="Update auction (admin)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=404, description="Not found"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(AdminUpdateAuctionRequest $request, Auction $auction)
    {
        $data = $request->validated();

        // Optional: kalau dua-duanya ada, enforce end_at after start_at
        if (isset($data['start_at'], $data['end_at']) && strtotime($data['end_at']) <= strtotime($data['start_at'])) {
            return response()->json(['message' => 'end_at must be after start_at'], 422);
        }

        $auction->fill($data);
        $auction->save();

        return response()->json($auction->load('commodity.media'));
    }
}