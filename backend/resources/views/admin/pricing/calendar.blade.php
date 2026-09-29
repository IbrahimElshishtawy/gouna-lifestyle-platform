@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'تقويم الأسعار والإتاحة' : 'Price Calendar')
@section('page-title', app()->getLocale() === 'ar' ? 'تقويم الأسعار والطلب اليومي' : 'Nightly Rates & Demand Calendar')
@section('breadcrumb', app()->getLocale() === 'ar' ? 'تقويم الأسعار' : 'Rates Calendar')

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ app()->getLocale() === 'ar' ? 'مخطط أسعار الليلة اليومي (أكتوبر - نوفمبر 2026)' : 'Daily Rate Calendar (October - November 2026)' }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'تعديل أسعار الليالي الفردية وربطها بنسب الإشغال ومواسم الطلب' : 'Adjust individual night pricing based on high demand weekends and local El Gouna events' }}
            </p>
        </div>
        <div class="flex items-center gap-3">
            <button onclick="alert('Pricing overrides saved')" class="px-4 py-2.5 rounded-xl bg-brand-terracotta text-white text-xs font-semibold hover:bg-brand-terracotta-dark transition flex items-center gap-2 shadow-xs">
                <span>{{ app()->getLocale() === 'ar' ? 'حفظ الأسعار' : 'Save Rates' }}</span>
            </button>
        </div>
    </div>

    <!-- Calendar View -->
    <div class="bg-white rounded-2xl border border-brand-border p-6 shadow-xs">
        <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-base text-brand-brown">October 2026</h3>
            <div class="flex gap-2">
                <span class="text-xs px-2.5 py-1 rounded bg-brand-sand-light text-brand-brown font-semibold cursor-pointer">&larr; Sep</span>
                <span class="text-xs px-2.5 py-1 rounded bg-brand-sand-light text-brand-brown font-semibold cursor-pointer">Nov &rarr;</span>
            </div>
        </div>

        <div class="grid grid-cols-7 gap-3 text-center text-xs">
            <div class="font-bold text-brand-brown-muted py-2">Sun</div>
            <div class="font-bold text-brand-brown-muted py-2">Mon</div>
            <div class="font-bold text-brand-brown-muted py-2">Tue</div>
            <div class="font-bold text-brand-brown-muted py-2">Wed</div>
            <div class="font-bold text-brand-brown-muted py-2">Thu</div>
            <div class="font-bold text-brand-brown-muted py-2 text-brand-terracotta">Fri</div>
            <div class="font-bold text-brand-brown-muted py-2 text-brand-terracotta">Sat</div>

            @for($i = 1; $i <= 31; $i++)
                @php
                    $isWeekend = ($i % 7 == 5 || $i % 7 == 6);
                    $rate = $isWeekend ? 32000 : 25000;
                @endphp
                <div class="p-3 rounded-xl border border-brand-border/70 hover:border-brand-terracotta transition bg-brand-sand-light/20 flex flex-col justify-between h-20">
                    <span class="font-bold text-xs text-brand-brown">{{ $i }}</span>
                    <span class="font-mono text-[11px] font-semibold {{ $isWeekend ? 'text-brand-terracotta' : 'text-brand-brown-muted' }}">
                        {{ number_format($rate) }} <span class="text-[9px]">EGP</span>
                    </span>
                </div>
            @endfor
        </div>
    </div>

</div>
@endsection
