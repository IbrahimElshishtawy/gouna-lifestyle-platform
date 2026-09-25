<?php

declare(strict_types=1);

namespace App\Modules\Lead\Application\DTOs;

final class LeadInquiryDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly ?string $phone = null,
        public readonly ?string $message = null,
        public readonly string $type = 'inquiry',
        public readonly string $source = 'website',
        public readonly ?string $leadableType = null,
        public readonly ?int $leadableId = null,
    ) {}
}
