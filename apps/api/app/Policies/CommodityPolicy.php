<?php

namespace App\Policies;

use App\Models\Commodity;
use App\Models\User;

class CommodityPolicy
{
    public function update(User $user, Commodity $commodity): bool
    {
        return ($user->role ?? '') === 'seller' && $commodity->seller_id === $user->id;
    }

    public function delete(User $user, Commodity $commodity): bool
    {
        return ($user->role ?? '') === 'seller' && $commodity->seller_id === $user->id;
    }

    public function view(User $user, Commodity $commodity): bool
    {
        // seller boleh lihat miliknya, admin boleh lihat semua
        if (($user->role ?? '') === 'admin') return true;
        if (($user->role ?? '') === 'seller') return $commodity->seller_id === $user->id;
        return false;
    }
}
