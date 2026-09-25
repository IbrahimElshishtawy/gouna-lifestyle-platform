@extends('layouts.app')

@section('title', 'Page Not Found (404) - GouNow Lifestyle')

@section('content')
<div class="min-h-[60vh] flex items-center justify-center px-6 py-20 text-center">
    <div class="max-w-md mx-auto space-y-6">
        <span class="text-xs font-bold uppercase tracking-[0.25em] text-brand-terracotta">404 &bull; Lost in Paradise</span>
        <h1 class="font-serif text-4xl sm:text-5xl font-bold text-brand-brown">This Shoreline Doesn't Exist</h1>
        <p class="text-xs sm:text-sm text-brand-brown-muted leading-relaxed font-light">
            The page or villa sanctuary you are searching for might have been moved, renamed, or is currently reserved.
        </p>
        <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="{{ route('home') }}" class="w-full sm:w-auto px-6 py-3 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm">
                Return to Homepage
            </a>
            <a href="{{ route('properties.index', ['listing_type' => 'rent']) }}" class="w-full sm:w-auto px-6 py-3 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider transition">
                Explore Available Stays
            </a>
        </div>
    </div>
</div>
@endsection
