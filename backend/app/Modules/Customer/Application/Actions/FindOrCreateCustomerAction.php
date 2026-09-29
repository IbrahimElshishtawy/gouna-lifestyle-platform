<?php

declare(strict_types=1);

namespace App\Modules\Customer\Application\Actions;

use App\Models\Customer;

class FindOrCreateCustomerAction
{
    public function execute(array $data, ?int $userId = null): Customer
    {
        return Customer::firstOrCreate(
            ['email' => $data['email']],
            [
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'phone' => $data['phone'],
                'country_of_residence' => $data['country'] ?? 'Egypt',
                'user_id' => $userId,
                'notes' => $data['special_requests'] ?? null,
                'source' => $data['source'] ?? 'website_checkout',
            ]
        );
    }
}
