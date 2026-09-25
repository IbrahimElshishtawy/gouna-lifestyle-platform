@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'إدارة الفعاليات والتذاكر' : 'Events & Tickets Management')
@section('page-title', app()->getLocale() === 'ar' ? 'الفعاليات وحفلات الجونة' : "What's On & Events")
@section('breadcrumb', app()->getLocale() === 'ar' ? 'قائمة الفعاليات' : 'Events List')

@section('content')
<div class="space-y-6">

    <!-- Top Action Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ app()->getLocale() === 'ar' ? 'سجل الفعاليات والحفلات وتذاكر الدخول' : 'El Gouna Nightlife, Beach Festivals & Concerts' }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'إدارة مواعيد الفعاليات، فئات التذاكر (عام / VIP / طاولات)، ومتابعة مبيعات التذاكر' : 'Manage event dates, multi-tier ticket categories (General, VIP, Backstage), sales capacity, and pricing' }}
            </p>
        </div>
        <div class="flex items-center space-x-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
            <a href="{{ route('admin.events.create') }}" 
               class="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-terracotta text-white font-semibold text-xs hover:bg-brand-terracotta-dark shadow-sm transition-all">
                <svg class="w-4 h-4 {{ app()->getLocale() === 'ar' ? 'ml-1.5' : 'mr-1.5' }}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                <span>{{ app()->getLocale() === 'ar' ? 'إضافة فعالية جديدة' : 'Add New Event' }}</span>
            </a>
        </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
        <form method="GET" action="{{ route('admin.events.index') }}" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div class="lg:col-span-2">
                <label class="block text-[11px] font-semibold text-brand-brown-muted uppercase mb-1">{{ app()->getLocale() === 'ar' ? 'بحث بالاسم أو المكان' : 'Search Event / Venue' }}</label>
                <input type="text" name="search" value="{{ request('search') }}" 
                       placeholder="{{ app()->getLocale() === 'ar' ? 'ابحث باسم الفعالية أو المكان...' : 'Search event name, venue...' }}"
                       class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta focus:ring focus:ring-brand-terracotta/20 py-2.5 px-3">
            </div>

            <div>
                <label class="block text-[11px] font-semibold text-brand-brown-muted uppercase mb-1">{{ app()->getLocale() === 'ar' ? 'نوع الفعالية' : 'Category' }}</label>
                <select name="category" class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white">
                    <option value="">{{ app()->getLocale() === 'ar' ? 'جميع الأنواع' : 'All Categories' }}</option>
                    <option value="nightlife" {{ request('category') === 'nightlife' ? 'selected' : '' }}>Nightlife & DJ Sets</option>
                    <option value="beach_party" {{ request('category') === 'beach_party' ? 'selected' : '' }}>Beach Club Parties</option>
                    <option value="concert" {{ request('category') === 'concert' ? 'selected' : '' }}>Concerts & Live Acts</option>
                    <option value="sports" {{ request('category') === 'sports' ? 'selected' : '' }}>Sports & Tournaments</option>
                    <option value="cultural" {{ request('category') === 'cultural' ? 'selected' : '' }}>Cultural & Festivals</option>
                </select>
            </div>

            <div>
                <label class="block text-[11px] font-semibold text-brand-brown-muted uppercase mb-1">{{ app()->getLocale() === 'ar' ? 'الحالة' : 'Status' }}</label>
                <select name="status" class="w-full text-xs rounded-xl border-brand-border focus:border-brand-terracotta py-2.5 px-3 bg-white">
                    <option value="">{{ app()->getLocale() === 'ar' ? 'كل الحالات' : 'All Statuses' }}</option>
                    <option value="published" {{ request('status') === 'published' ? 'selected' : '' }}>Published</option>
                    <option value="draft" {{ request('status') === 'draft' ? 'selected' : '' }}>Draft</option>
                    <option value="completed" {{ request('status') === 'completed' ? 'selected' : '' }}>Completed</option>
                    <option value="cancelled" {{ request('status') === 'cancelled' ? 'selected' : '' }}>Cancelled</option>
                </select>
            </div>

            <div class="flex items-end space-x-2 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                <button type="submit" class="flex-1 py-2.5 px-4 bg-brand-brown text-white text-xs font-semibold rounded-xl hover:bg-brand-brown-dark transition-colors text-center">
                    {{ app()->getLocale() === 'ar' ? 'تصفية' : 'Filter' }}
                </button>
                @if(request()->anyFilled(['search', 'category', 'status']))
                    <a href="{{ route('admin.events.index') }}" class="py-2.5 px-3 bg-brand-sand-light text-brand-brown-muted hover:text-brand-brown text-xs font-medium rounded-xl border border-brand-border transition-colors">
                        Reset
                    </a>
                @endif
            </div>
        </form>
    </div>

    <!-- Events Table -->
    <div class="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-brand-brown {{ app()->getLocale() === 'ar' ? 'text-right' : '' }}">
                <thead class="bg-brand-sand-light/60 border-b border-brand-border text-[11px] font-bold uppercase tracking-wider text-brand-brown-muted">
                    <tr>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'الفعالية' : 'Event' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'التاريخ والوقت' : 'Date & Timing' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'المكان والمنظم' : 'Venue & Organizer' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'فئات التذاكر' : 'Ticket Tiers' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'السعة والمبيعات' : 'Capacity / Sales' }}</th>
                        <th class="py-3.5 px-4">{{ app()->getLocale() === 'ar' ? 'الحالة' : 'Status' }}</th>
                        <th class="py-3.5 px-4 text-center">{{ app()->getLocale() === 'ar' ? 'إجراءات' : 'Actions' }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-brand-border/60">
                    @forelse($events as $event)
                        <tr class="hover:bg-brand-sand-light/30 transition-colors">
                            <td class="py-4 px-4">
                                <div class="flex items-center space-x-3 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                                    <div class="w-14 h-14 rounded-xl overflow-hidden bg-brand-sand shrink-0 border border-brand-border relative">
                                        @if($event->featuredImage->first())
                                            <img src="{{ $event->featuredImage->first()->thumb_url }}" alt="{{ $event->title }}" class="w-full h-full object-cover">
                                        @elseif($event->media->first())
                                            <img src="{{ $event->media->first()->thumb_url }}" alt="{{ $event->title }}" class="w-full h-full object-cover">
                                        @else
                                            <div class="w-full h-full flex items-center justify-center text-[10px] text-brand-brown-muted font-bold">
                                                EVENT
                                            </div>
                                        @endif
                                    </div>
                                    <div class="min-w-0">
                                        <span class="text-[10px] font-bold uppercase tracking-wider text-brand-terracotta bg-brand-terracotta/10 px-1.5 py-0.5 rounded">
                                            {{ ucfirst($event->category ?? 'Nightlife') }}
                                        </span>
                                        <p class="font-bold text-brand-brown text-sm truncate max-w-xs mt-0.5">
                                            {{ $event->title }}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            <td class="py-4 px-4 whitespace-nowrap">
                                <div class="space-y-0.5">
                                    <p class="font-bold text-brand-brown">{{ $event->event_date?->format('M d, Y') }}</p>
                                    <p class="text-[11px] text-brand-brown-muted">
                                        {{ $event->start_time ? substr($event->start_time, 0, 5) : '20:00' }}
                                        @if($event->end_time)
                                            - {{ substr($event->end_time, 0, 5) }}
                                        @endif
                                    </p>
                                </div>
                            </td>

                            <td class="py-4 px-4 whitespace-nowrap">
                                <div class="space-y-0.5">
                                    <p class="font-semibold text-brand-brown">📍 {{ $event->venue_name ?? 'El Gouna' }}</p>
                                    @if($event->organizer)
                                        <p class="text-[11px] text-brand-brown-muted">By: {{ $event->organizer }}</p>
                                    @endif
                                </div>
                            </td>

                            <td class="py-4 px-4">
                                <div class="space-y-1">
                                    @foreach($event->ticketTypes as $tier)
                                        <div class="text-[11px] flex items-center justify-between gap-2 bg-brand-sand-light/60 px-2 py-0.5 rounded">
                                            <span class="font-medium text-brand-brown truncate">{{ $tier->name }}</span>
                                            <span class="font-bold text-brand-terracotta whitespace-nowrap">{{ number_format($tier->price_cents / 100) }} EGP</span>
                                        </div>
                                    @endforeach
                                    @if($event->ticketTypes->isEmpty())
                                        <span class="text-[11px] text-brand-brown-muted italic">No ticket tiers</span>
                                    @endif
                                </div>
                            </td>

                            <td class="py-4 px-4 whitespace-nowrap">
                                <div class="space-y-1 text-xs">
                                    <p class="font-semibold text-brand-brown">
                                        {{ $event->ticketTypes->sum('sold_count') }} sold
                                        @if($event->ticketTypes->sum('capacity'))
                                            / {{ $event->ticketTypes->sum('capacity') }}
                                        @endif
                                    </p>
                                    @if($event->ticketTypes->sum('capacity'))
                                        <div class="w-24 bg-brand-border h-1.5 rounded-full overflow-hidden">
                                            @php
                                                $pct = min(100, round(($event->ticketTypes->sum('sold_count') / max(1, $event->ticketTypes->sum('capacity'))) * 100));
                                            @endphp
                                            <div class="bg-brand-terracotta h-full rounded-full" style="width: {{ $pct }}%"></div>
                                        </div>
                                    @endif
                                </div>
                            </td>

                            <td class="py-4 px-4 whitespace-nowrap">
                                @if($event->status === 'published')
                                    <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Published</span>
                                @elseif($event->status === 'cancelled')
                                    <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">Cancelled</span>
                                @elseif($event->status === 'completed')
                                    <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Completed</span>
                                @else
                                    <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">Draft</span>
                                @endif
                            </td>

                            <td class="py-4 px-4 whitespace-nowrap text-center">
                                <div class="inline-flex items-center space-x-1.5 {{ app()->getLocale() === 'ar' ? 'space-x-reverse' : '' }}">
                                    <!-- Edit -->
                                    <a href="{{ route('admin.events.edit', $event) }}" 
                                       title="Edit Event"
                                       class="p-2 text-brand-brown hover:text-brand-terracotta bg-brand-sand-light hover:bg-brand-sand rounded-lg transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    </a>

                                    <!-- Delete -->
                                    <form method="POST" action="{{ route('admin.events.destroy', $event) }}" 
                                          onsubmit="return confirm('{{ app()->getLocale() === 'ar' ? 'أرشفة هذه الفعالية؟' : 'Archive this event?' }}')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" 
                                                title="Archive Event"
                                                class="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="py-12 px-4 text-center">
                                <div class="max-w-xs mx-auto text-brand-brown-muted space-y-3">
                                    <div class="w-12 h-12 mx-auto rounded-full bg-brand-sand-light flex items-center justify-center text-brand-terracotta">
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                                    </div>
                                    <p class="font-bold text-sm text-brand-brown">{{ app()->getLocale() === 'ar' ? 'لا توجد فعاليات مطابقة' : 'No events found' }}</p>
                                    <a href="{{ route('admin.events.create') }}" class="inline-block mt-2 px-4 py-2 bg-brand-terracotta text-white rounded-xl text-xs font-semibold hover:bg-brand-terracotta-dark">
                                        + {{ app()->getLocale() === 'ar' ? 'إضافة فعالية جديدة' : 'Add New Event' }}
                                    </a>
                                </div>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($events->hasPages())
            <div class="p-4 border-t border-brand-border bg-brand-sand-light/40">
                {{ $events->links() }}
            </div>
        @endif
    </div>

</div>
@endsection
