<?php

namespace App\Http\Controllers;

use App\Http\Requests\MediaUploadRequest;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    /**
     * @OA\Post(
     *   path="/media",
     *   tags={"Media"},
     *   summary="Upload media (image/video)",
     *   security={{"sanctum":{}}},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\MediaType(
     *       mediaType="multipart/form-data",
     *       @OA\Schema(
     *         required={"file"},
     *         @OA\Property(property="file", type="string", format="binary")
     *       )
     *     )
     *   ),
     *   @OA\Response(response=201, description="Created"),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(MediaUploadRequest $request)
    {
        $file = $request->file('file');

        $path = $file->store('uploads', 'public');
        $url = Storage::disk('public')->url($path);

        return response()->json([
            'path' => $path,
            'url'  => $url,
        ], 201);
    }
}
