<?php

namespace App\Models;

use App\Services\Auth\PermissionResolver;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'avatar', 'locale',
        'is_admin', 'is_active', 'force_password_change',
        'two_factor_secret', 'two_factor_recovery_codes', 'two_factor_confirmed_at', 'two_factor_last_step',
        'last_login_ip', 'last_login_at',
    ];

    protected $hidden = [
        'password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'two_factor_confirmed_at' => 'datetime',
            'two_factor_secret' => 'encrypted',
            'two_factor_last_step' => 'integer',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'is_active' => 'boolean',
            'force_password_change' => 'boolean',
            'two_factor_recovery_codes' => 'array',
        ];
    }

    public function setEmailAttribute(string $value): void
    {
        $this->attributes['email'] = Str::lower($value);
    }

    // Relationships
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_user')
            ->withPivot('granted');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function adminNotifications(): HasMany
    {
        return $this->hasMany(AdminNotification::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    // Helper methods
    public function hasRole(string $roleName): bool
    {
        if ($this->relationLoaded('roles')) {
            return $this->roles->contains('name', $roleName);
        }

        return $this->roles()->where('name', $roleName)->exists();
    }

    public function hasPermission(string $permissionName): bool
    {
        return app(PermissionResolver::class)->hasPermission($this, $permissionName);
    }

    public function getFullNameAttribute(): string
    {
        return $this->name;
    }

    public function hasTwoFactorEnabled(): bool
    {
        return $this->two_factor_confirmed_at !== null && ! empty($this->two_factor_secret);
    }

    public function requiresTwoFactor(): bool
    {
        if ($this->is_admin) {
            return true;
        }

        $requiredRoles = config('auth.require_2fa_roles', ['super_admin', 'finance', 'property_manager']);
        foreach ($requiredRoles as $role) {
            if ($this->hasRole($role)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate CSPRNG recovery codes, store their sha256 hashes, and return plain codes.
     *
     * @return array<string>
     */
    public function generateRecoveryCodes(int $count = 8): array
    {
        $plainCodes = [];
        $hashedCodes = [];

        for ($i = 0; $i < $count; $i++) {
            $code = strtoupper(Str::random(4)).'-'.strtoupper(Str::random(4));
            $plainCodes[] = $code;
            $hashedCodes[] = hash('sha256', $code);
        }

        $this->forceFill([
            'two_factor_recovery_codes' => $hashedCodes,
        ])->save();

        return $plainCodes;
    }

    /**
     * Atomically consume a single-use recovery code.
     */
    public function consumeRecoveryCode(string $code): bool
    {
        $code = trim($code);
        $codeHash = hash('sha256', $code);

        return DB::transaction(function () use ($codeHash) {
            $lockedUser = static::where('id', $this->id)->lockForUpdate()->first();
            if (! $lockedUser) {
                return false;
            }

            $currentCodes = $lockedUser->two_factor_recovery_codes ?? [];
            if (! is_array($currentCodes)) {
                return false;
            }

            $key = array_search($codeHash, $currentCodes, true);
            if ($key === false) {
                return false;
            }

            unset($currentCodes[$key]);
            $lockedUser->two_factor_recovery_codes = array_values($currentCodes);
            $lockedUser->save();

            $this->two_factor_recovery_codes = $lockedUser->two_factor_recovery_codes;

            return true;
        });
    }
}
