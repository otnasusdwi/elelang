<?php

namespace App\Http\Controllers;

use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * @OA\Get(
     *   path="/orders",
     *   tags={"Orders"},
     *   summary="List orders (buyer sees own, seller sees own)",
     *   security={{"sanctum":{}}},
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $q = Order::query()->with(['commodity.media', 'buyer:id,name,email', 'seller:id,name,email']);

        if (($user->role ?? '') === 'buyer') {
            $q->where('buyer_id', $user->id);
        } elseif (($user->role ?? '') === 'seller') {
            $q->where('seller_id', $user->id);
        } elseif (($user->role ?? '') === 'admin') {
            // admin can see all (optional)
        } else {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($q->orderByDesc('id')->paginate(20));
    }

    /**
     * @OA\Get(
     *   path="/orders/{id}",
     *   tags={"Orders"},
     *   summary="Order detail",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=404, description="Not found")
     * )
     */
    public function show(Request $request, Order $order)
    {
        $user = $request->user();
        $role = $user->role ?? '';

        if ($role === 'buyer' && $order->buyer_id !== $user->id) return response()->json(['message' => 'Forbidden'], 403);
        if ($role === 'seller' && $order->seller_id !== $user->id) return response()->json(['message' => 'Forbidden'], 403);
        // admin allowed

        return response()->json($order->load(['commodity.media', 'buyer:id,name,email', 'seller:id,name,email']));
    }

    /**
     * @OA\Patch(
     *   path="/orders/{id}/status",
     *   tags={"Orders"},
     *   summary="Update order status (buyer/seller)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(required=true, @OA\JsonContent(
     *     required={"status"},
     *     @OA\Property(property="status", type="string", example="shipping")
     *   )),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function updateStatus(UpdateOrderStatusRequest $request, Order $order)
    {
        $user = $request->user();
        $role = $user->role ?? '';

        // Aturan sederhana MVP:
        // buyer boleh set: delivered, completed
        // seller boleh set: shipping
        $newStatus = $request->input('status');

        if ($role === 'seller') {
            if ($order->seller_id !== $user->id) return response()->json(['message' => 'Forbidden'], 403);
            if (!in_array($newStatus, ['shipping', 'cancelled'], true)) {
                return response()->json(['message' => 'Seller can only set shipping/cancelled'], 422);
            }
        } elseif ($role === 'buyer') {
            if ($order->buyer_id !== $user->id) return response()->json(['message' => 'Forbidden'], 403);
            if (!in_array($newStatus, ['delivered', 'completed', 'cancelled'], true)) {
                return response()->json(['message' => 'Buyer can only set delivered/completed/cancelled'], 422);
            }
        } elseif ($role === 'admin') {
            // admin boleh set apapun (optional)
        } else {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $order->status = $newStatus;
        $order->save();

        return response()->json($order);
    }
}