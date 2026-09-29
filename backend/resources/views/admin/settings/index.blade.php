@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'إعدادات النظام والمنصة' : 'Platform & System Settings')
@section('page-title', app()->getLocale() === 'ar' ? 'إعدادات المنصة والبوابات' : 'System Configuration & Payment Gateways')
@section('breadcrumb', $tabTitle ?? (app()->getLocale() === 'ar' ? 'الإعدادات' : 'Settings'))

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ $tabTitle ?? (app()->getLocale() === 'ar' ? 'إعدادات منصة GouNow العامة' : 'Platform Core Settings') }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'إدارة العملة الافتراضية، بوابات الدفع الإلكتروني (Stripe & Fawry)، سياسات الإلغاء، وتنبيهات الواتساب' : 'Configure platform currency, digital payment gateways, cancellation policies, and automated alerts' }}
            </p>
        </div>
        <button onclick="alert('Settings Saved Successfully')" class="px-4 py-2.5 rounded-xl bg-brand-terracotta text-white text-xs font-semibold hover:bg-brand-terracotta-dark transition flex items-center gap-2 shadow-xs">
            <span>{{ app()->getLocale() === 'ar' ? 'حفظ كافة الإعدادات' : 'Save All Settings' }}</span>
        </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-brand-border/60 overflow-x-auto gap-2 text-xs font-semibold text-brand-brown-muted pb-1">
        <a href="{{ route('admin.settings.general') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.settings.general') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'معلومات الشركة والعملة' : 'General & Currency' }}
        </a>
        <a href="{{ route('admin.settings.payments') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.settings.payments') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'بوابات الدفع الإلكتروني' : 'Payment Gateways' }}
        </a>
        <a href="{{ route('admin.settings.booking') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.settings.booking') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'قواعد الحجز والإلغاء' : 'Booking Policies' }}
        </a>
        <a href="{{ route('admin.settings.notifications') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.settings.notifications') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'الواتساب والتنبيهات' : 'WhatsApp & Email Alerts' }}
        </a>
    </div>

    @if(request()->routeIs('admin.settings.payments'))
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="font-bold text-sm text-brand-brown">Stripe Global (Visa / Mastercard)</h3>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Stripe Publishable Key</label>
                    <input type="text" value="pk_live_51GouNow_SampleKey" class="w-full text-xs rounded-xl border-brand-border p-3 font-mono">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Stripe Secret Key</label>
                    <input type="password" value="sk_live_51GouNow_SampleSecret" class="w-full text-xs rounded-xl border-brand-border p-3 font-mono">
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="font-bold text-sm text-brand-brown">Fawry &amp; Local Egyptian Gateways</h3>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Fawry Merchant Code</label>
                    <input type="text" value="77002910" class="w-full text-xs rounded-xl border-brand-border p-3 font-mono">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-brand-brown-muted mb-1">InstaPay / Bank Wire IBAN</label>
                    <input type="text" value="EG380002000100000012345678901" class="w-full text-xs rounded-xl border-brand-border p-3 font-mono">
                </div>
            </div>
        </div>
    @elseif(request()->routeIs('admin.settings.booking'))
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <h3 class="font-bold text-sm text-brand-brown">Cancellation &amp; Refund Rules</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Full Refund Window</label>
                    <input type="text" value="14 Days prior to arrival" class="w-full text-xs rounded-xl border-brand-border p-3">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Default Deposit Percentage</label>
                    <input type="text" value="30% Due at Booking" class="w-full text-xs rounded-xl border-brand-border p-3">
                </div>
            </div>
        </div>
    @elseif(request()->routeIs('admin.settings.notifications'))
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <h3 class="font-bold text-sm text-brand-brown">WhatsApp Business Cloud API</h3>
            <div>
                <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Official WhatsApp Phone Number</label>
                <input type="text" value="+201000000000" class="w-full text-xs rounded-xl border-brand-border p-3 font-mono">
            </div>
            <div>
                <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Booking Confirmation Template</label>
                <textarea rows="3" class="w-full text-xs rounded-xl border-brand-border p-3 font-mono text-xs">Dear @{{guest_name}}, your luxury stay at @{{property_title}} in El Gouna is confirmed! Booking ref: @{{reference}}.</textarea>
            </div>
        </div>
    @else
        <!-- General Settings Form -->
        <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Platform Brand Name</label>
                    <input type="text" value="GouNow Lifestyle - El Gouna" class="w-full text-xs rounded-xl border-brand-border p-3">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Default Display Currency</label>
                    <select class="w-full text-xs rounded-xl border-brand-border p-3 bg-white">
                        <option value="EGP" selected>Egyptian Pound (EGP)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="USD">US Dollar (USD)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Support Email</label>
                    <input type="email" value="concierge@gounow.com" class="w-full text-xs rounded-xl border-brand-border p-3">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-brand-brown-muted mb-1">Physical Desk Location</label>
                    <input type="text" value="Abu Tig Marina Promenade, El Gouna, Red Sea" class="w-full text-xs rounded-xl border-brand-border p-3">
                </div>
            </div>
        </div>
    @endif

</div>
@endsection
