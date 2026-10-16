<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminSession extends Model
{
    use HasFactory;

    protected $table = 'admin_sessions';

    protected $fillable = [
        'user_id',
        'token_id',
        'ip_address',
        'user_agent',
        'device',
        'started_at',
        'last_activity_at',
        'ended_at',
        'duration_seconds',
        'status',
        'termination_reason',
        'terminated_by_id',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'last_activity_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration_seconds' => 'integer',
    ];

    /**
     * Relationship to the admin staff user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relationship to the super admin who terminated this session (if applicable).
     */
    public function terminatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'terminated_by_id');
    }

    /**
     * Dynamically compute current duration in seconds.
     */
    public function getCalculatedDurationSecondsAttribute(): int
    {
        $start = $this->started_at ?? $this->created_at ?? now();

        if ($this->status === 'active') {
            return (int) abs($start->diffInSeconds(now()));
        }

        $end = $this->ended_at ?? $this->last_activity_at ?? now();
        return (int) abs($start->diffInSeconds($end));
    }

    /**
     * Human-readable Arabic duration string.
     */
    public function getDurationFormattedArAttribute(): string
    {
        return self::formatSeconds($this->calculated_duration_seconds, 'ar');
    }

    /**
     * Human-readable English duration string.
     */
    public function getDurationFormattedEnAttribute(): string
    {
        return self::formatSeconds($this->calculated_duration_seconds, 'en');
    }

    /**
     * Close the session and persist the final calculated duration.
     */
    public function terminate(string $reason = 'logout', ?int $actorId = null): void
    {
        $end = now();
        $start = $this->started_at ?? $this->created_at ?? $end;
        $duration = max(1, (int) abs($start->diffInSeconds($end)));

        $this->update([
            'status' => $reason === 'logout' ? 'completed' : 'terminated',
            'ended_at' => $end,
            'last_activity_at' => $end,
            'duration_seconds' => $duration,
            'termination_reason' => $reason,
            'terminated_by_id' => $actorId,
        ]);
    }

    /**
     * Format elapsed seconds into luxury human-readable duration.
     */
    public static function formatSeconds(int $seconds, string $locale = 'ar'): string
    {
        if ($seconds < 60) {
            return $locale === 'ar' ? 'أقل من دقيقة' : '< 1 min';
        }

        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);

        if ($locale === 'ar') {
            if ($hours > 0 && $minutes > 0) {
                $hoursText = $hours == 1 ? 'ساعة واحدة' : ($hours == 2 ? 'ساعتان' : "{$hours} ساعات");
                $minsText = $minutes == 1 ? 'دقيقة' : ($minutes == 2 ? 'دقيقتان' : "{$minutes} دقيقة");
                return "{$hoursText} و {$minsText}";
            } elseif ($hours > 0) {
                return $hours == 1 ? 'ساعة واحدة' : ($hours == 2 ? 'ساعتان' : "{$hours} ساعات");
            } else {
                return $minutes == 1 ? 'دقيقة واحدة' : ($minutes == 2 ? 'دقيقتان' : "{$minutes} دقيقة");
            }
        }

        // English format
        if ($hours > 0 && $minutes > 0) {
            return "{$hours}h {$minutes}m";
        } elseif ($hours > 0) {
            return "{$hours}h";
        } else {
            return "{$minutes}m";
        }
    }

    /**
     * Detect user device and browser from User-Agent string.
     */
    public static function detectDevice(?string $userAgent): string
    {
        if (empty($userAgent)) {
            return 'Unknown Device';
        }

        $os = 'Desktop';
        if (preg_match('/iPhone/i', $userAgent)) {
            $os = 'iPhone (iOS)';
        } elseif (preg_match('/iPad/i', $userAgent)) {
            $os = 'iPad (iPadOS)';
        } elseif (preg_match('/Android/i', $userAgent)) {
            $os = 'Android Device';
        } elseif (preg_match('/Macintosh|Mac OS X/i', $userAgent)) {
            $os = 'macOS';
        } elseif (preg_match('/Windows/i', $userAgent)) {
            $os = 'Windows PC';
        } elseif (preg_match('/Linux/i', $userAgent)) {
            $os = 'Linux PC';
        }

        $browser = 'Browser';
        if (preg_match('/Edg/i', $userAgent)) {
            $browser = 'Edge';
        } elseif (preg_match('/Chrome/i', $userAgent)) {
            $browser = 'Chrome';
        } elseif (preg_match('/Safari/i', $userAgent)) {
            $browser = 'Safari';
        } elseif (preg_match('/Firefox/i', $userAgent)) {
            $browser = 'Firefox';
        }

        return "{$os} - {$browser}";
    }
}
