<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    /**
     * Switch current application language (EN / AR).
     */
    public function switch(Request $request, string $locale): RedirectResponse
    {
        if (in_array($locale, ['en', 'ar'])) {
            $request->session()->put('locale', $locale);

            if (auth()->check()) {
                auth()->user()->update(['locale' => $locale]);
            }
        }

        return redirect()->back();
    }
}
