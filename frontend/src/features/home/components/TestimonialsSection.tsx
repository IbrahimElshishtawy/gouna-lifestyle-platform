import React from "react";

export default function TestimonialsSection() {
  const reviews = [
    {
      id: 1,
      name: "Marcus & Sophia V.",
      origin: "Zurich, Switzerland",
      stay: "Marina Waterfront Villa",
      quote:
        "The most seamless luxury rental experience in El Gouna. The villa was spotless with breathtaking lagoon views and a heated pool our children adored. The VIP concierge handled everything effortlessly.",
      rating: 5,
    },
    {
      id: 2,
      name: "Alexander & Claire K.",
      origin: "London, UK",
      stay: "Private Tawila Yacht Expedition",
      quote:
        "Our private yacht day to Tawila Island was undeniably the highlight of our holiday. Professional captain, gourmet seafood lunch on board, and swimming with wild dolphins in crystal waters.",
      rating: 5,
    },
    {
      id: 3,
      name: "Laila & Tarek M.",
      origin: "Cairo, Egypt",
      stay: "Fanadir Bay Villa & Golf Pass",
      quote:
        "GouNow sets a brand-new standard for hospitality on the Red Sea. Instant check-in, flawless communication, and genuine attention to detail. We have already booked our winter retreat.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 px-6 lg:px-12 bg-white border-t border-brand-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-terracotta block mb-2">
            Guest Testimonials
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-brown">
            Stories from Our Guests
          </h2>
          <p className="text-xs sm:text-sm text-brand-brown-muted mt-2 font-light leading-relaxed">
            Discover why global travelers and discerning homeowners choose
            GouNow for bespoke El Gouna stays.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-brand-sand-light/40 p-8 rounded-3xl border border-brand-border/80 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 text-brand-terracotta mb-4 text-sm">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-brand-brown leading-relaxed font-light italic mb-6">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-brand-border/60">
                <span className="block font-bold text-xs text-brand-brown">
                  {review.name}
                </span>
                <span className="block text-[11px] text-brand-brown-muted">
                  {review.origin} &bull; {review.stay}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
