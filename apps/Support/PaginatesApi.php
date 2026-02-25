<?php

namespace App\Support;

use Illuminate\Http\Request;

trait PaginatesApi
{
    protected function perPage(Request $request, int $default = 20, int $max = 100): int
    {
        $pp = (int) $request->query('per_page', $default);
        if ($pp < 1) $pp = $default;
        if ($pp > $max) $pp = $max;
        return $pp;
    }
}