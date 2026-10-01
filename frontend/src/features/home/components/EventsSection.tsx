import React from "react";
import Image from "next/image";

export default function EventsSection() {
  const events = [
    {
      id: 1,
      title: "El Gouna Film Festival (GFF)",
      date: "OCTOBER 2026",
      category: "Film & Culture",
      location: "Festival Plaza, El Gouna",
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      description:
        "The flagship cinematic event celebrating international cinema, world premieres, red carpets, and masterclasses by the Red Sea.",
    },
    {
      id: 2,
      title: "Sunset Lagoon Sessions",
      date: "EVERY FRIDAY",
      category: "Music & Sunset",
      location: "The Club House, Downtown",
      image:
        "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
      description:
        "Live deep house DJ sets, handcrafted cocktails, and bohemian vibes as the golden hour reflects across the lagoon waters.",
    },
    {
      id: 3,
      title: "Red Sea Half Marathon & Sports Fest",
      date: "NOVEMBER 2026",
      category: "Sports & Wellness",
      location: "Abu Tig Marina Promenade",
      image:
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      description:
        "Run the scenic coastal course passing marina yachts and turquoise lagoons with global runners and family fun runs.",
    },
  ];

  return (
    <section id="events" className="py-20 px-6 lg:px-12 bg-brand-sand-light/50 border-t border-brand-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
            Community &amp; Culture
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
            What&apos;s On in El Gouna
          </h2>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-2 font-light leading-relaxed">
            Discover curated world-class festivals, acoustic lagoon concerts,
            yacht gatherings, and sporting spectacles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-3xl overflow-hidden border border-brand-border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="relative h-56 overflow-hidden bg-brand-sand">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-brand-terracotta text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                    {event.date}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-[11px] text-brand-terracotta font-semibold uppercase tracking-wider mb-2">
                  <span>{event.category}</span>
                  <span>•</span>
                  <span className="text-brand-brown-muted normal-case font-normal">
                    {event.location}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-brand-brown mb-2 group-hover:text-brand-terracotta transition-colors">
                  {event.title}
                </h3>

                <p className="text-xs text-brand-brown-muted line-clamp-3 font-light leading-relaxed mb-6">
                  {event.description}
                </p>

                <div className="mt-auto pt-4 border-t border-brand-border/60">
                  <a
                    href="https://wa.me/201000000000?text=Hello%20GouNow,%20I%20would%20like%20information%20and%20access%20to%20events%20in%20El%20Gouna"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center py-2.5 px-4 bg-brand-sand-light hover:bg-brand-brown hover:text-white text-brand-brown rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    RSVP &amp; Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
