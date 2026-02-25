<?php

namespace App\Http\Controllers;

use App\Http\Requests\Escrow\ActionEscrowRequest;
use App\Models\Order;
use App\Services\EscrowService;
use Illuminate\Http\Request;

class OrderEscrowController extends Controller
{
    private function authorizeOrder(Request $request, Order $order): void
    {
        $user = $request->user();
        $role = $user->role ?? '';

        if ($role === 'admin') return;
        if ($role === 'buyer' && $order->buyer_id === $user->id) return;
        if ($role === 'seller' && $order->seller_id === $user->id) return;

        abort(403);
    }

    /**
     * @OA\Get(
     *   path="/orders/{id}/escrow",
     *   tags={"Escrow"},
     *   summary="Get escrow ledger & balance for an order",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function show(Request $request, Order $order, EscrowService $service)
    {
        $this->authorizeOrder($request, $order);

        return response()->json([
            'balance' => $service->getBalance($order),
            'ledger' => $order->escrowLedgers()->orderByDesc('id')->get(),
        ]);
    }

    /**
     * @OA\Post(
     *   path="/orders/{id}/escrow/hold",
     *   tags={"Escrow"},
     *   summary="Hold funds (simulate payment success)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function hold(ActionEscrowRequest $request, Order $order, EscrowService $service)
    {
        $user = $request->user();
        $role = $user->role ?? '';

        // buyer atau admin boleh trigger hold (MVP)
        if (!in_array($role, ['buyer', 'admin'], true)) abort(403);
        if ($role === 'buyer' && $order->buyer_id !== $user->id) abort(403);

        $ledger = $service->hold($order, $request->input('reference'), $request->input('note'));

        return response()->json($ledger);
    }

    /**
     * @OA\Post(
     *   path="/orders/{id}/escrow/release",
     *   tags={"Escrow"},
     *   summary="Release funds to seller (admin)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function release(ActionEscrowRequest $request, Order $order, EscrowService $service)
    {
        if (($request->user()->role ?? '') !== 'admin') abort(403);

        $ledger = $service->release($order, $request->input('reference'), $request->input('note'));

        return response()->json($ledger);
    }

    /**
     * @OA\Post(
     *   path="/orders/{id}/escrow/refund",
     *   tags={"Escrow"},
     *   summary="Refund funds to buyer (admin)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function refund(ActionEscrowRequest $request, Order $order, EscrowService $service)
    {
        if (($request->user()->role ?? '') !== 'admin') abort(403);

        $ledger = $service->refund($order, $request->input('reference'), $request->input('note'));

        return response()->json($ledger);
    }
}