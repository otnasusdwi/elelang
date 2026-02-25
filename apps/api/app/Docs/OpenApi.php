<?php

namespace App\Docs;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *   title="E-Lelang Ikan API",
 *   version="1.0.0",
 *   description="API untuk aplikasi e-lelang ikan realtime"
 * )
 *
 * @OA\Server(
 *   url="http://localhost:8080/api",
 *   description="Local API Base"
 * )
 *
 * @OA\SecurityScheme(
 *   securityScheme="sanctum",
 *   type="http",
 *   scheme="bearer",
 *   bearerFormat="JWT",
 *   description="Gunakan Bearer token dari endpoint login/register"
 * )
 */
class OpenApi {}
