<?php

namespace App\Http\Controllers;

use App\Http\Requests\Order\AddHandoverProofRequest;
use App\Http\Requests\Order\UpdateLogisticsRequest;
use App\Models\HandoverProof;
use App\Models\Logistics;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderLogisticsController extends Controller
{
    private function authorizeOrder(Request $request, Order $order): void
    {
        $user = $request->user();
        $role = $user->role ?? '';

        if ($role === 'admin') return;

        if ($role === 'buyer' && $order->buyer_id !== $user->id) abort(403);
        if ($role === 'seller' && $order->seller_id !== $user->id) abort(403);
        if (!in_array($role, ['buyer', 'seller', 'admin'], true)) abort(403);
    }

    /**
     * @OA\Patch(
     *   path="/orders/{id}/logistics",
     *   tags={"Orders"},
     *   summary="Update logistics info for an order",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(required=true, @OA\JsonContent(
     *     @OA\Property(property="pickup_time", type="string", example="2026-02-25 15:00:00"),
     *     @OA\Property(property="pickup_location", type="string", example="TPI Buleleng"),
     *     @OA\Property(property="delivery_method", type="string", example="pickup"),
     *     @OA\Property(property="notes", type="string", example="Hubungi sebelum datang")
     *   )),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(UpdateLogisticsRequest $request, Order $order)
    {
        $this->authorizeOrder($request, $order);

        $data = $request->validated();

        $logistics = Logistics::query()->updateOrCreate(
            ['order_id' => $order->id],
            $data
        );

        return response()->json($logistics);
    }

    /**
     * @OA\Post(
     *   path="/orders/{id}/handover-proofs",
     *   tags={"Orders"},
     *   summary="Add handover proof (pickup/delivery/received)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(required=true, @OA\JsonContent(
     *     required={"type","media_url"},
     *     @OA\Property(property="type", type="string", example="pickup"),
     *     @OA\Property(property="media_url", type="string", example="/storage/uploads/proof.jpg"),
     *     @OA\Property(property="timestamp", type="string", example="2026-02-25 15:05:00")
     *   )),
     *   @OA\Response(response=201, description="Created"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function addProof(AddHandoverProofRequest $request, Order $order)
    {
        $this->authorizeOrder($request, $order);

        $proof = HandoverProof::query()->create([
            'order_id' => $order->id,
            'type' => $request->input('type'),
            'media_url' => $request->input('media_url'),
            'timestamp' => $request->input('timestamp') ?? now(),
        ]);

        return response()->json($proof, 201);
    }
}