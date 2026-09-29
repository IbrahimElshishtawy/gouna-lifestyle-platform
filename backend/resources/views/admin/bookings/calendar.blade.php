@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'تقويم الحجوزات والإتاحة' : 'Bookings & Availability Calendar')
@section('page-title', app()->getLocale() === 'ar' ? 'تقويم الحجوزات الشامل' : 'Occupancy & Reservation Calendar')
@section('breadcrumb', app()->getLocale() === 'ar' ? 'تقويم الوحدات' : 'Calendar View')

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ app()->getLocale() === 'ar' ? 'جدول الإشغال وتوافر الفلل (أكتوبر 2026)' : 'Property Occupancy Grid (October 2026)' }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'عرض فترات التوافر، الصيانة، والحجوزات المؤكدة لجميع وحدات الجونة' : 'Overview of confirmed check-ins, maintenance blocks, and available nights across all sanctuaries' }}
            </p>
        </div>
        <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1.5 text-xs text-brand-brown font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> {{ app()->getLocale() === 'ar' ? 'متاح للحجز' : 'Available' }}
            </span>
            <span class="inline-flex items-center gap-1.5 text-xs text-brand-brown font-semibold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span> {{ app()->getLocale() === 'ar' ? 'محجوز' : 'Reserved' }}
            </span>
            <span class="inline-flex items-center gap-1.5 text-xs text-brand-brown font-semibold bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200">
                <span class="w-2 h-2 rounded-full bg-rose-500"></span> {{ app()->getLocale() === 'ar' ? 'مغلق / صيانة' : 'Blocked' }}
            </span>
        </div>
    </div>

    <!-- Calendar Matrix Grid -->
    <div class="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-xs">
        <div class="p-4 border-b border-brand-border flex items-center justify-between bg-brand-sand-light/50">
            <h3 class="font-bold text-sm text-brand-brown">{{ app()->getLocale() === 'ar' ? 'الوحدات الفاخرة' : 'Sanctuary Units' }}</h3>
            <div class="text-xs font-bold text-brand-terracotta">October 2026</div>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-center text-xs">
                <thead class="bg-brand-sand-light/40 text-[10px] font-bold uppercase text-brand-brown-muted border-b border-brand-border">
                    <tr>
                        <th class="py-3 px-4 text-left w-56">{{ app()->getLocale() === 'ar' ? 'اسم الوحدة' : 'Villa Name' }}</th>
                        @for($day = 1; $day <= 15; $day++)
                            <th class="py-3 px-2 w-10 border-l border-brand-border/40">{{ $day }}</th>
                        @endfor
                    </tr>
                </thead>
                <tbody class="divide-y divide-brand-border/60">
                    @foreach($properties as $index => $prop)
                        <tr class="hover:bg-brand-sand-light/30">
                            <td class="py-3 px-4 text-left font-bold text-brand-brown truncate max-w-xs">
                                {{ $prop->title }}
                                <span class="block text-[10px] font-normal text-brand-brown-muted">{{ $prop->location->name ?? 'El Gouna' }}</span>
                            </td>
                            @for($d = 1; $d <= 15; $d++)
                                @php
                                    $isReserved = ($d >= ($index * 2 + 3) && $d <= ($index * 2 + 6));
                                    $isMaintenance = ($d == 1 || $d == 2) && $index == 1;
                                @endphp
                                <td class="py-3 px-1 border-l border-brand-border/40">
                                    @if($isReserved)
                                        <div class="bg-amber-100 text-amber-800 font-bold py-1 rounded text-[10px]" title="Booked">Booked</div>
                                    @elseif($isMaintenance)
                                        <div class="bg-rose-100 text-rose-800 font-bold py-1 rounded text-[10px]" title="Blocked">Clean</div>
                                    @else
                                        <div class="bg-emerald-50 text-emerald-700 py-1 rounded text-[10px] font-semibold">Free</div>
                                    @endif
                                </td>
                            @endfor
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

</div>
@endsection
