<?php

namespace App\Support;

use Illuminate\Http\Request;

trait PaginatesApi
{
    protected function perPage(Request $request, int $default = 20, int $max = 50): int
    {
        $value = $request->query('per_page', $request->query('perPage', $default));

        if (!is_numeric($value)) {
            return $default;
        }

        $perPage = (int) $value;
        if ($perPage < 1) {
            return $default;
        }

        return min($perPage, $max);
    }
}
