<?php

namespace Database\Factories;

use App\Models\Commodity;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommodityFactory extends Factory
{
    protected $model = Commodity::class;

    public function definition(): array
    {
        return [
            'seller_id' => User::factory(),
            'name' => $this->faker->word(),
            'status' => 'published',
        ];
    }
}