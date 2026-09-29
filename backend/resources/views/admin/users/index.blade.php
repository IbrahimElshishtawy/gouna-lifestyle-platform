@extends('layouts.admin')

@section('title', app()->getLocale() === 'ar' ? 'المستخدمون والأدوار' : 'Users & Access Control')
@section('page-title', app()->getLocale() === 'ar' ? 'إدارة المستخدمين والأدوار (RBAC)' : 'User Accounts & Role Permissions')
@section('breadcrumb', $tabTitle ?? (app()->getLocale() === 'ar' ? 'المستخدمون' : 'Users'))

@section('content')
<div class="space-y-6">

    <!-- Header Actions -->
    <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-brand-brown tracking-tight">
                {{ $tabTitle ?? (app()->getLocale() === 'ar' ? 'حسابات مديري النظام وصلاحيات الوصول' : 'Admin Staff & Access Control') }}
            </h2>
            <p class="text-xs text-brand-brown-muted mt-1">
                {{ app()->getLocale() === 'ar' ? 'إدارة فريق عمل GouNow، مديري الحجوزات، وكلاء الكونسيرج، وتحديد صلاحيات كل دور' : 'Manage administrative staff, property managers, concierge agents, and role permissions' }}
            </p>
        </div>
        <button onclick="alert('Add staff user modal')" class="px-4 py-2.5 rounded-xl bg-brand-terracotta text-white text-xs font-semibold hover:bg-brand-terracotta-dark transition flex items-center gap-2 shadow-xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>{{ app()->getLocale() === 'ar' ? 'إضافة مسؤول جديد' : 'Invite Staff Member' }}</span>
        </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-brand-border/60 overflow-x-auto gap-2 text-xs font-semibold text-brand-brown-muted pb-1">
        <a href="{{ route('admin.users.index') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.users.index') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'مديرو النظام وفريق العمل' : 'Staff Accounts' }}
        </a>
        <a href="{{ route('admin.users.roles') }}" class="px-4 py-2.5 rounded-xl transition {{ request()->routeIs('admin.users.roles') ? 'bg-brand-terracotta text-white font-bold' : 'hover:bg-brand-sand/40 text-brand-brown' }}">
            {{ app()->getLocale() === 'ar' ? 'الأدوار والصلاحيات (RBAC)' : 'Roles & Permissions' }}
        </a>
    </div>

    @if(request()->routeIs('admin.users.roles'))
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Full System Control</span>
                <h3 class="font-bold text-base text-brand-brown mt-2">Super Administrator</h3>
                <p class="text-xs text-brand-brown-muted mt-1">Unrestricted access across pricing, financial settlements, and staff roles.</p>
                <div class="mt-4 pt-3 border-t border-brand-border text-xs text-brand-brown font-semibold">
                    1 Active User
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Hospitality Desk</span>
                <h3 class="font-bold text-base text-brand-brown mt-2">VIP Concierge Specialist</h3>
                <p class="text-xs text-brand-brown-muted mt-1">Can create bookings, chat with guests via WhatsApp, and manage yacht/safari schedules.</p>
                <div class="mt-4 pt-3 border-t border-brand-border text-xs text-brand-brown font-semibold">
                    3 Active Users
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Inventory</span>
                <h3 class="font-bold text-base text-brand-brown mt-2">Property Manager</h3>
                <p class="text-xs text-brand-brown-muted mt-1">Can edit villa listings, update maintenance blocks, and upload photo galleries.</p>
                <div class="mt-4 pt-3 border-t border-brand-border text-xs text-brand-brown font-semibold">
                    2 Active Users
                </div>
            </div>
        </div>
    @else
        <!-- Users Table -->
        <div class="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-xs">
            <table class="w-full text-left text-xs text-brand-brown">
                <thead class="bg-brand-sand-light/60 uppercase text-[10px] font-bold text-brand-brown-muted border-b border-brand-border">
                    <tr>
                        <th class="py-3.5 px-4">Staff Member</th>
                        <th class="py-3.5 px-4">Assigned Role</th>
                        <th class="py-3.5 px-4">Status</th>
                        <th class="py-3.5 px-4">Last Active</th>
                        <th class="py-3.5 px-4 text-center">Manage</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-brand-border/60">
                    <tr>
                        <td class="py-3.5 px-4">
                            <div class="font-bold text-brand-brown">Ibrahim Elshishtawy</div>
                            <div class="text-[11px] text-brand-brown-muted">admin@gounow.com</div>
                        </td>
                        <td class="py-3.5 px-4">
                            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-terracotta/10 text-brand-terracotta">
                                Super Administrator
                            </span>
                        </td>
                        <td class="py-3.5 px-4">
                            <span class="text-emerald-700 font-semibold flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                            </span>
                        </td>
                        <td class="py-3.5 px-4 text-brand-brown-muted">Just now</td>
                        <td class="py-3.5 px-4 text-center">
                            <button class="text-brand-terracotta font-semibold hover:underline">Edit Access</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    @endif

</div>
@endsection
