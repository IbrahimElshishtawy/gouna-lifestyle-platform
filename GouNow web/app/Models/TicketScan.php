<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketScan extends Model
{
    protected $fillable = ['event_ticket_id', 'scanned_by', 'result', 'device_info', 'ip_address'];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(EventTicket::class, 'event_ticket_id');
    }

    public function scanner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scanned_by');
    }
}
