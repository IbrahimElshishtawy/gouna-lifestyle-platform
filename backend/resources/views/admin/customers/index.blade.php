@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'العملاء والطلبات' : 'Customers & Sales Leads')
@section('page-title', app()->getLocale() === 'ar' ? 'إدارة العملاء وطلبات الشراء' : 'Guest CRM, Real Estate Leads & WhatsApp Inquiries')
@section('breadcrumb', $tabTitle ?? (app()->getLocale() === 'ar' ? 'العملاء والطلبات' : 'Customers & Leads'))

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ $tabTitle ?? (app()->getLocale() === 'ar' ? 'سجل العملاء وطلبات الاستثمار العقاري' : 'Client Relationship Management (CRM)') }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'متابعة سجل الضيوف المميزين، طلبات شراء الفلل بملايين الجنيهات، ومحادثات الكونسيرج عبر واتساب' : 'Track high-net-worth real estate buyers, luxury vacation guests, and direct concierge inquiries' }}
            </p>
        </div>
        <button onclick="alert('Exporting CRM leads CSV...')" class="px-4 py-2.5 rounded-xl bg-brand-terracotta text-white text-xs font-semibold hover:bg-brand-terracotta-dark transition flex items-center gap-2 shadow-xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            <span>{{ app()->getLocale() === 'ar' ? 'تصدير بيانات العملاء (CSV)' : 'Export CRM Leads' }}</span>
        </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-brand-border/60 overflow-x-auto gap-2 text-xs font-semibold text-brand-brown-muted pb-1">
        <a href="{{ route('admin.customers.index') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.customers.index') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'سجل الضيوف والعملاء' : 'VIP Guest Profiles' }}
        </a>
        <a href="{{ route('admin.customers.leads') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.customers.leads') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'طلبات شراء العقارات (Leads)' : 'Property Sales Leads' }}
        </a>
        <a href="{{ route('admin.customers.inquiries') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.customers.inquiries') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'استفسارات واتساب والموقع' : 'Direct Inquiries' }}
        </a>
    </div>

    @if(request()->routeIs('admin.customers.leads'))
        <!-- Leads Kanban / Table -->
        <div class="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-xs">
            <table class="w-full text-left text-xs text-brand-brown">
                <thead class="bg-brand-sand-light/60 uppercase text-[10px] font-bold text-brand-brown-muted border-b border-brand-border">
                    <tr>
                        <th class="py-3.5 px-4">Lead Name</th>
                        <th class="py-3.5 px-4">Phone / WhatsApp</th>
                        <th class="py-3.5 px-4">Interested In</th>
                        <th class="py-3.5 px-4">Budget Range</th>
                        <th class="py-3.5 px-4">Pipeline Stage</th>
                        <th class="py-3.5 px-4 text-center">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-brand-border/60">
                    <tr>
                        <td class="py-3.5 px-4 font-bold">Ahmed Zaki</td>
                        <td class="py-3.5 px-4 font-mono text-[11px]">+20 101 234 5678</td>
                        <td class="py-3.5 px-4">Tawila Island Designer Villa</td>
                        <td class="py-3.5 px-4 font-bold text-brand-terracotta">48,000,000 EGP</td>
                        <td class="py-3.5 px-4"><span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Viewing Scheduled</span></td>
                        <td class="py-3.5 px-4 text-center">
                            <a href="https://wa.me/201012345678" target="_blank" class="text-emerald-700 font-bold hover:underline">WhatsApp</a>
                        </td>
                    </tr>
                    <tr>
                        <td class="py-3.5 px-4 font-bold">Dr. Sherif Allam</td>
                        <td class="py-3.5 px-4 font-mono text-[11px]">+20 122 889 9001</td>
                        <td class="py-3.5 px-4">The Hill Signature Estate</td>
                        <td class="py-3.5 px-4 font-bold text-brand-terracotta">65,000,000 EGP</td>
                        <td class="py-3.5 px-4"><span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Negotiation</span></td>
                        <td class="py-3.5 px-4 text-center">
                            <a href="https://wa.me/201228899001" target="_blank" class="text-emerald-700 font-bold hover:underline">WhatsApp</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    @elseif(request()->routeIs('admin.customers.inquiries'))
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
                <div class="flex items-center justify-between text-xs text-brand-brown-muted">
                    <span class="font-bold text-brand-terracotta">Inquiry #INQ-881</span>
                    <span>15 mins ago</span>
                </div>
                <h4 class="font-bold text-sm text-brand-brown mt-2">Private Yacht Charter Inquiry</h4>
                <p class="text-xs text-brand-brown-muted mt-1">"Looking to book a private boat for 10 people to Tawila Island this Friday with catering."</p>
                <div class="mt-4 pt-3 border-t border-brand-border flex items-center justify-between">
                    <span class="text-xs font-semibold text-brand-brown">Omar El-Gammal (+20 111 445 5667)</span>
                    <a href="https://wa.me/201114455667" target="_blank" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700">Reply on WhatsApp</a>
                </div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
                <div class="flex items-center justify-between text-xs text-brand-brown-muted">
                    <span class="font-bold text-brand-terracotta">Inquiry #INQ-882</span>
                    <span>1 hour ago</span>
                </div>
                <h4 class="font-bold text-sm text-brand-brown mt-2">Golf Cart Delivery to West Golf</h4>
                <p class="text-xs text-brand-brown-muted mt-1">"We need a 4-seater electric golf cart delivered to Villa 14 West Golf for 4 days."</p>
                <div class="mt-4 pt-3 border-t border-brand-border flex items-center justify-between">
                    <span class="text-xs font-semibold text-brand-brown">Laila Rostom (+20 100 998 8776)</span>
                    <a href="https://wa.me/201009988776" target="_blank" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700">Reply on WhatsApp</a>
                </div>
            </div>
        </div>
    @else
        <!-- Customers Table -->
        <div class="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-xs">
            <table class="w-full text-left text-xs text-brand-brown">
                <thead class="bg-brand-sand-light/60 uppercase text-[10px] font-bold text-brand-brown-muted border-b border-brand-border">
                    <tr>
                        <th class="py-3.5 px-4">Client Name</th>
                        <th class="py-3.5 px-4">Contact Info</th>
                        <th class="py-3.5 px-4">Stays Completed</th>
                        <th class="py-3.5 px-4">Lifetime Spend</th>
                        <th class="py-3.5 px-4">VIP Tier</th>
                        <th class="py-3.5 px-4 text-center">Profile</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-brand-border/60">
                    @forelse($customers as $cust)
                        <tr class="hover:bg-brand-sand-light/30">
                            <td class="py-3.5 px-4 font-bold text-brand-brown">{{ $cust->name }}</td>
                            <td class="py-3.5 px-4 text-brand-brown-muted">
                                <div>{{ $cust->email }}</div>
                                <div class="text-[11px] font-mono">{{ $cust->phone }}</div>
                            </td>
                            <td class="py-3.5 px-4 font-semibold">{{ $cust->bookings_count ?? 3 }} Stays</td>
                            <td class="py-3.5 px-4 font-bold text-brand-terracotta">
                                {{ number_format($cust->lifetime_spend ?? 142000) }} EGP
                            </td>
                            <td class="py-3.5 px-4">
                                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    ⭐ Black Diamond VIP
                                </span>
                            </td>
                            <td class="py-3.5 px-4 text-center">
                                <button onclick="alert('Viewing client profile: {{ $cust->name }}')" class="text-xs font-semibold text-brand-terracotta hover:underline">View CRM</button>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="text-center py-8 text-brand-brown-muted">No guest profiles found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    @endif

</div>
@endsection
