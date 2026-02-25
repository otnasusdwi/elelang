<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dispute\AdminResolveDisputeRequest;
use App\Models\Dispute;
use App\Services\DisputeResolutionService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use App\Support\PaginatesApi;

class AdminDisputeController extends Controller
{
    use PaginatesApi;

    /**
     * @OA\Get(
     *   path="/admin/disputes",
     *   tags={"Admin - Disputes"},
     *   summary="List disputes for admin",
     *   security={{"sanctum":{}}},
     *   @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *   @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", example=1), description="Page number (Laravel paginator)"),
     *   @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", example=20), description="Items per page. Max is capped by server."),
     *   @OA\Response(response=200, description="OK"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function index(Request $request)
    {
        $query = Dispute::query()->with([
            'order.commodity.media',
            'order.buyer:id,name,email',
            'order.seller:id,name,email',
            'opener:id,name,email',
            'resolver:id,name,email',
        ]);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json(
            $query->orderByDesc('id')->paginate($this->perPage($request, 20, 50))
        );
    }

    public function show(Dispute $dispute)
    {
        return response()->json(
            $dispute->load([
                'order.commodity.media',
                'order.buyer:id,name,email',
                'order.seller:id,name,email',
                'messages.sender:id,name,email',
                'opener:id,name,email',
                'resolver:id,name,email',
            ])
        );
    }

    public function resolve(
        AdminResolveDisputeRequest $request,
        Dispute $dispute,
        DisputeResolutionService $service
    ) {
        $status = (string) $request->input('status');
        $resolution = $request->input('resolution');
        $note = $request->input('resolution_note');

        if ($status === 'resolved' && empty($resolution)) {
            throw ValidationException::withMessages([
                'resolution' => ['Resolution wajib diisi ketika status resolved.'],
            ]);
        }

        $updated = $service->resolve(
            $dispute,
            (int) $request->user()->id,
            $status,
            $resolution,
            $note
        );

        return response()->json($updated);
    }
}
