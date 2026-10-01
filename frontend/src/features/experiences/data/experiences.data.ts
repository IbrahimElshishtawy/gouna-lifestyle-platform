import { Experience } from "../types/experience.types";

export const EXPERIENCES_DATA: Experience[] = [
  {
    id: 1,
    title: "Private Yacht Charter to Tawila Island",
    slug: "luxury-private-yacht-charter-tawila-island",
    category: {
      id: 1,
      name: "Private Boat Trips & Yachts",
      slug: "boat-trips",
    },
    location: {
      id: 1,
      name: "Abu Tig Marina",
    },
    price_cents: 3500000,
    price_formatted: "35,000",
    currency: "EGP",
    pricing_type: "/ per group",
    duration: "7 Hours (09:00 - 16:00)",
    max_guests: 12,
    meeting_point: "Abu Tig Marina, Pier B, Berth 14.",
    what_to_bring: "Swimwear, sun protection, sunglasses, camera.",
    cancellation_policy: "Full refund up to 48 hours before departure. Weather-guaranteed rescheduling.",
    description:
      "Full-day voyage aboard a 52ft Italian yacht with private captain, chef lunch, and dolphin reef snorkeling.",
    overview:
      "Depart from Abu Tig Marina for an unforgettable day cruise across the pristine waters of the Red Sea. Anchor at Tawila Island’s sandbank for swimming in crystal turquoise lagoons, paddleboarding, snorkeling vivid coral reefs, and savoring freshly prepared seafood.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 2,
    title: "Sunset Desert Quad Safari & Bedouin Dinner",
    slug: "sunset-desert-quad-safari-bedouin-dinner",
    category: {
      id: 2,
      name: "Desert Safaris & Stargazing",
      slug: "safari",
    },
    location: {
      id: 2,
      name: "Tawila Island & Lagoons",
    },
    price_cents: 280000,
    price_formatted: "2,800",
    currency: "EGP",
    pricing_type: "/ per person",
    duration: "4.5 Hours",
    max_guests: 20,
    meeting_point: "Complimentary hotel pickup from any villa or hotel in El Gouna.",
    what_to_bring: "Comfortable shoes, sunglasses, light jacket for evening.",
    cancellation_policy: "Full refund up to 24 hours prior to safari.",
    description:
      "Drive powerful desert buggies through the Red Sea mountains, followed by candlelit Bedouin feast and telescope stargazing.",
    overview:
      "Experience the raw majesty of the Eastern Desert. Ride modern quad bikes over golden dunes as the sun sets over the Red Sea mountains. Arrive at an authentic candlelit Bedouin camp for herbal tea, freshly baked flatbread, charcoal-grilled barbecue, and astronomical telescope stargazing.",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 3,
    title: "VIP Private Kitesurf Coaching Session",
    slug: "private-kitesurf-coaching-mangroovy",
    category: {
      id: 3,
      name: "Watersports & Kitesurfing",
      slug: "watersports-kitesurfing",
    },
    location: {
      id: 3,
      name: "Mangroovy & Kite Beach",
    },
    price_cents: 450000,
    price_formatted: "4,500",
    currency: "EGP",
    pricing_type: "/ per person",
    duration: "2 Hours",
    max_guests: 4,
    meeting_point: "Mangroovy Kite Center, Beach Zone 1.",
    what_to_bring: "Swimsuit, rashguard, waterproof sunscreen.",
    cancellation_policy: "Full refund if wind conditions are unsuitable. 100% wind-guarantee.",
    description:
      "One-on-one IKO certified coaching with radio helmet communication and premium Duotone gear.",
    overview:
      "El Gouna is globally renowned as the ultimate kitesurfing capital of the Middle East. Whether you are launching your first waterstart or dialing in unhooked freestyle tricks, our master instructors tailor the 2-hour session to your progression with crystal flat water and dedicated rescue boat cover.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 4,
    title: "Tawila Island Private Yacht Cruise",
    slug: "test-tawila-island-yacht",
    category: {
      id: 4,
      name: "Boat Trips",
      slug: "boat-trips-test",
    },
    location: {
      id: 4,
      name: "Marina Test Bay",
    },
    price_cents: 2500000,
    price_formatted: "25,000",
    currency: "EGP",
    pricing_type: "/ per group",
    duration: "8 Hours",
    max_guests: 12,
    meeting_point: "Marina Test Bay, Pier 3.",
    what_to_bring: "Swimwear, towel, sunscreen.",
    cancellation_policy: "Full refund up to 48 hours before departure.",
    description:
      "Full day yacht charter to untouched coral reefs and dolphin spots.",
    overview:
      "Enjoy private yacht cruise to Tawila island with full snorkeling equipment and chef buffet lunch.",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
  },
];
