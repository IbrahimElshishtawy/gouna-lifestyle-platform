@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'مكتبة الوسائط والصور' : 'Media Library & Assets')
@section('page-title', app()->getLocale() === 'ar' ? 'مكتبة الصور والفيديوهات الفاخرة' : 'High-Resolution Media Assets')
@section('breadcrumb', app()->getLocale() === 'ar' ? 'الوسائط' : 'Media')

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ app()->getLocale() === 'ar' ? 'معرض الوسائط الرقمية (CDN)' : 'Digital Assets & Media Storage' }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'صور الفلل، اليخوت، الجولات الافتراضية، وشعارات العلامة التجارية بدقة عالية WebP' : 'High-resolution photography, drone videos, and floorplans optimized for WebP delivery' }}
            </p>
        </div>
        <button onclick="alert('Upload modal initialized')" class="px-4 py-2.5 rounded-xl bg-brand-terracotta text-white text-xs font-semibold hover:bg-brand-terracotta-dark transition flex items-center gap-2 shadow-xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            <span>{{ app()->getLocale() === 'ar' ? 'رفع وسائط جديدة' : 'Upload Assets' }}</span>
        </button>
    </div>

    <!-- Media Gallery Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        @php
            $sampleImages = [
                ['name' => 'Logo Asset', 'url' => asset('assets/images/logo.jpg'), 'tag' => 'Brand'],
                ['name' => 'Villa Waterfront', 'url' => 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80', 'tag' => 'Villa'],
                ['name' => 'Lagoon Sunset', 'url' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80', 'tag' => 'Lagoon'],
                ['name' => 'Azimut Yacht', 'url' => 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=600&q=80', 'tag' => 'Yacht'],
                ['name' => 'Desert Buggy', 'url' => 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80', 'tag' => 'Safari'],
                ['name' => 'Golf Cart', 'url' => 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=600&q=80', 'tag' => 'Vehicle'],
            ];
        @endphp

        @foreach($sampleImages as $img)
            <div class="group bg-white rounded-2xl border border-brand-border overflow-hidden shadow-xs hover:border-brand-terracotta transition">
                <div class="aspect-square w-full bg-brand-sand/30 overflow-hidden relative">
                    <img src="{{ $img['url'] }}" alt="{{ $img['name'] }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    <span class="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-brand-brown/80 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                        {{ $img['tag'] }}
                    </span>
                </div>
                <div class="p-2.5 flex items-center justify-between text-xs">
                    <span class="font-bold text-brand-brown truncate text-[11px]">{{ $img['name'] }}</span>
                    <button onclick="navigator.clipboard.writeText('{{ $img['url'] }}'); alert('Image URL copied to clipboard!');" class="text-brand-terracotta hover:underline text-[10px] font-bold" title="Copy URL">
                        Copy
                    </button>
                </div>
            </div>
        @endforeach
    </div>

</div>
@endsection
