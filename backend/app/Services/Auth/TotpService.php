<?php

namespace App\Services\Auth;

use InvalidArgumentException;

class TotpService
{
    private const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    private const TIME_STEP = 30;

    private const DIGITS = 6;

    /**
     * Generate a new random Base32 encoded TOTP secret (160 bits / 20 bytes = 32 Base32 chars).
     */
    public function generateSecret(int $length = 32): string
    {
        $secret = '';
        $randomBytes = random_bytes($length);

        for ($i = 0; $i < $length; $i++) {
            $secret .= self::BASE32_CHARS[ord($randomBytes[$i]) % 32];
        }

        return $secret;
    }

    /**
     * Generate an otpauth:// URI for authenticator apps.
     */
    public function getOtpAuthUri(string $company, string $accountName, string $secret): string
    {
        $label = rawurlencode($company).':'.rawurlencode($accountName);
        $issuer = rawurlencode($company);

        return "otpauth://totp/{$label}?secret={$secret}&issuer={$issuer}&algorithm=SHA1&digits=".self::DIGITS.'&period='.self::TIME_STEP;
    }

    /**
     * Generate the current TOTP code for the given secret at a specific time step.
     */
    public function generateCode(string $secret, ?int $timestamp = null): string
    {
        $timestamp = $timestamp ?? time();
        $timeStep = (int) floor($timestamp / self::TIME_STEP);

        return $this->calculateCodeForStep($secret, $timeStep);
    }

    /**
     * Verify a submitted code with window tolerance and replay prevention.
     *
     * @param  string  $secret  Base32 secret
     * @param  string  $code  User-submitted 6-digit code
     * @param  int  $window  Number of steps before and after current time to check (default: 1)
     * @param  int|null  $lastUsedStep  Last successfully verified step (to prevent replay)
     * @param  int|null  $usedStep  Output parameter: the matched step if valid
     * @param  int|null  $timestamp  Reference timestamp (defaults to current time)
     */
    public function verifyCode(
        string $secret,
        string $code,
        int $window = 1,
        ?int $lastUsedStep = null,
        ?int &$usedStep = null,
        ?int $timestamp = null
    ): bool {
        $cleanCode = trim($code);
        if (strlen($cleanCode) !== self::DIGITS || ! ctype_digit($cleanCode)) {
            return false;
        }

        $timestamp = $timestamp ?? time();
        $currentStep = (int) floor($timestamp / self::TIME_STEP);

        for ($step = $currentStep - $window; $step <= $currentStep + $window; $step++) {
            // Replay protection: cannot reuse the same or an older step
            if ($lastUsedStep !== null && $step <= $lastUsedStep) {
                continue;
            }

            $expectedCode = $this->calculateCodeForStep($secret, $step);

            if (hash_equals($expectedCode, $cleanCode)) {
                $usedStep = $step;

                return true;
            }
        }

        return false;
    }

    /**
     * Calculate HOTP code for a specific time step.
     */
    public function calculateCodeForStep(string $secret, int $step): string
    {
        $key = $this->base32Decode($secret);
        $counter = pack('N*', 0, $step);

        $hash = hash_hmac('sha1', $counter, $key, true);
        $offset = ord($hash[19]) & 0x0F;

        $binary = (
            ((ord($hash[$offset]) & 0x7F) << 24) |
            ((ord($hash[$offset + 1]) & 0xFF) << 16) |
            ((ord($hash[$offset + 2]) & 0xFF) << 8) |
            (ord($hash[$offset + 3]) & 0xFF)
        );

        $otp = $binary % (10 ** self::DIGITS);

        return str_pad((string) $otp, self::DIGITS, '0', STR_PAD_LEFT);
    }

    /**
     * Decode a Base32 string into binary data.
     */
    public function base32Decode(string $b32): string
    {
        $b32 = strtoupper(trim($b32));
        $b32 = rtrim($b32, '=');

        if ($b32 === '') {
            return '';
        }

        $binaryString = '';
        foreach (str_split($b32) as $char) {
            $pos = strpos(self::BASE32_CHARS, $char);
            if ($pos === false) {
                throw new InvalidArgumentException("Invalid Base32 character encountered: {$char}");
            }
            $binaryString .= sprintf('%05b', $pos);
        }

        $bytes = '';
        $chunks = str_split($binaryString, 8);
        foreach ($chunks as $chunk) {
            if (strlen($chunk) === 8) {
                $bytes .= chr((int) bindec($chunk));
            }
        }

        return $bytes;
    }
}
