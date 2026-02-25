<?php

namespace App\Http\Controllers;

use App\Http\Requests\Dispute\AddDisputeMessageRequest;
use App\Http\Requests\Dispute\OpenDisputeRequest;
use App\Models\Dispute;
use App\Models\DisputeMessage;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Support\PaginatesApi;

class DisputeController extends Controller
{
    use PaginatesApi;
    private function authorizeOrder(Request $request, Order $order): void
    {
        $user = $request->user();
        $role = $user->role ?? '';

        if ($role === 'admin') return;

        if ($role === 'buyer' && $order->buyer_id === $user->id) return;
        if ($role === 'seller' && $order->seller_id === $user->id) return;

        abort(403);
    }

    private function authorizeDispute(Request $request, Dispute $dispute): void
    {
        $user = $request->user();
        $role = $user->role ?? '';

        if ($role === 'admin') return;

        $order = $dispute->order;
        if ($role === 'buyer' && $order->buyer_id === $user->id) return;
        if ($role === 'seller' && $order->seller_id === $user->id) return;

        abort(403);
    }

    /**
     * @OA\Post(
     *   path="/orders/{id}/dispute",
     *   tags={"Disputes"},
     *   summary="Open dispute for an order (buyer/seller)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(required=true, @OA\JsonContent(
     *     required={"reason"},
     *     @OA\Property(property="reason", type="string", example="Barang tidak sesuai"),
     *     @OA\Property(property="description", type="string", example="Berat tidak sesuai deskripsi")
     *   )),
     *   @OA\Response(response=201, description="Created"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function open(OpenDisputeRequest $request, Order $order)
    {
        $this->authorizeOrder($request, $order);

        // MVP: 1 dispute per order
        $existing = Dispute::query()->where('order_id', $order->id)->first();
        if ($existing) {
            return response()->json($existing->load(['messages.sender', 'order']), 200);
        }

        $dispute = Dispute::query()->create([
            'order_id' => $order->id,
            'opened_by' => $request->user()->id,
            'reason' => $request->input('reason'),
            'description' => $request->input('description'),
            'status' => 'open',
        ]);

        return response()->json($dispute->load(['messages.sender', 'order']), 201);
    }

    /**
     * @OA\Get(
     *   path="/disputes",
     *   tags={"Disputes"},
     *   summary="List disputes (buyer/seller sees own; admin sees all if used here)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", example=1), description="Page number (Laravel paginator)"),
     *   @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", example=20), description="Items per page. Max is capped by server."),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user->role ?? '';

        $q = Dispute::query()->with(['order.commodity.media', 'opener:id,name,email']);

        if ($role === 'buyer') {
            $q->whereHas('order', fn($oq) => $oq->where('buyer_id', $user->id));
        } elseif ($role === 'seller') {
            $q->whereHas('order', fn($oq) => $oq->where('seller_id', $user->id));
        } elseif ($role === 'admin') {
            // allowed (optional)
        } else {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($q->orderByDesc('id')->paginate($this->perPage($request, 20, 50)));
    }

    /**
     * @OA\Get(
     *   path="/disputes/{id}",
     *   tags={"Disputes"},
     *   summary="Dispute detail (buyer/seller/admin)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=404, description="Not found")
     * )
     */
    public function show(Request $request, Dispute $dispute)
    {
        $dispute->load(['order.commodity.media', 'messages.sender:id,name,email', 'opener:id,name,email', 'resolver:id,name,email']);
        $this->authorizeDispute($request, $dispute);

        return response()->json($dispute);
    }

    /**
     * @OA\Post(
     *   path="/disputes/{id}/messages",
     *   tags={"Disputes"},
     *   summary="Add message to dispute (buyer/seller/admin)",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(required=true, @OA\JsonContent(
     *     @OA\Property(property="message", type="string", example="Saya lampirkan foto barang"),
     *     @OA\Property(property="media_url", type="string", example="/storage/uploads/proof.jpg")
     *   )),
     *   @OA\Response(response=201, description="Created"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function addMessage(AddDisputeMessageRequest $request, Dispute $dispute)
    {
        $dispute->load('order');
        $this->authorizeDispute($request, $dispute);

        $msg = DisputeMessage::query()->create([
            'dispute_id' => $dispute->id,
            'sender_id' => $request->user()->id,
            'message' => $request->input('message'),
            'media_url' => $request->input('media_url'),
        ]);

        return response()->json($msg->load('sender:id,name,email'), 201);
    }
}
