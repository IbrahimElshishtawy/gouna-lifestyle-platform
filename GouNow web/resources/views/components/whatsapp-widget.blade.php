@php
    $whatsappNumber = \App\Helpers\WhatsAppHelper::number();
    $defaultMessage = app()->getLocale() === 'ar'
        ? 'مرحباً جو ناو، أود الاستفسار عن حجز إقامة فاخرة أو تجربة في الجونة.'
        : 'Hello GouNow, I would like to inquire about luxury villa stays and experiences in El Gouna.';
    $whatsappUrl = 'https://wa.me/' . $whatsappNumber . '?text=' . urlencode($defaultMessage);
@endphp

<!-- Persistent Floating WhatsApp VIP Concierge Widget (Section 37) -->
<div class="fixed bottom-6 {{ app()->getLocale() === 'ar' ? 'left-6' : 'right-6' }} z-50 group no-print">
    <a href="{{ $whatsappUrl }}" 
       target="_blank"
       rel="noopener noreferrer"
       data-ga-event="contact_whatsapp"
       data-ga-item="floating_concierge_button"
       data-ga-category="lead_conversion"
       class="flex items-center gap-3 bg-white/95 hover:bg-white text-brand-brown px-4 py-3 rounded-full shadow-2xl border border-brand-border/80 backdrop-blur-md transition-all duration-300 transform hover:scale-105 hover:shadow-emerald-900/10">
        
        <!-- Animated pulsing green dot & icon -->
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white shrink-0 shadow-sm">
            <span class="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.203c.043.071.043.419-.101.824z"/></svg>
        </div>

        <div class="text-left {{ app()->getLocale() === 'ar' ? 'text-right' : '' }} hidden sm:block">
            <span class="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">VIP Concierge</span>
            <span class="block text-xs font-semibold text-brand-brown">
                {{ app()->getLocale() === 'ar' ? 'محادثة فورية واتساب' : 'Chat on WhatsApp' }}
            </span>
        </div>
    </a>
</div>
