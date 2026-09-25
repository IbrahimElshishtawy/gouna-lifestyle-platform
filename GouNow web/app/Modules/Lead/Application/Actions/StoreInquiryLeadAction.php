<?php

declare(strict_types=1);

namespace App\Modules\Lead\Application\Actions;

use App\Models\Lead;
use App\Modules\Lead\Application\DTOs\LeadInquiryDTO;

class StoreInquiryLeadAction
{
    public function execute(LeadInquiryDTO $dto): Lead
    {
        return Lead::create([
            'name' => $dto->name,
            'email' => $dto->email,
            'phone' => $dto->phone,
            'message' => $dto->message,
            'type' => $dto->type,
            'source' => $dto->source,
            'leadable_type' => $dto->leadableType,
            'leadable_id' => $dto->leadableId,
            'status' => 'new',
        ]);
    }
}
