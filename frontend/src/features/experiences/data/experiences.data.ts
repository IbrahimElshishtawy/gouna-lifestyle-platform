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
      name: "Abu Tig Marina • All Day (8 Hrs)",
    },
    price_cents: 3600000,
    price_formatted: "36,000",
    currency: "EGP",
    pricing_type: "/ charter",
    duration: "Full Day (8 Hours: 09:00 - 17:00)",
    max_guests: 12,
    meeting_point: "Abu Tig Marina, Pier B, Berth 14.",
    what_to_bring: "Swimwear, sun protection, sunglasses, camera.",
    cancellation_policy: "Full refund up to 48 hours before departure. 100% weather-guaranteed rescheduling.",
    description:
      "Cruise the azure lagoons and open turquoise waters of Tawila. Enjoy freshly prepared seafood lunch on board, premium snorkeling gear, and sunset champagne.",
    overview:
      "Depart from Abu Tig Marina for an unforgettable day cruise across the pristine waters of the Red Sea. Anchor at Tawila Island’s sandbank for swimming in crystal turquoise lagoons, paddleboarding, snorkeling vivid coral reefs, and savoring freshly prepared seafood.",
    image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1400&q=85",
    images: [
      { id: 1, url: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1400&q=85" },
      { id: 2, url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=85" },
      { id: 3, url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85" },
      { id: 4, url: "https://images.unsplash.com/photo-1510525009512-ad7fc13eefab?auto=format&fit=crop&w=1200&q=85" },
    ],
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
      name: "Red Sea Mountains • 4.5 Hrs",
    },
    price_cents: 280000,
    price_formatted: "2,800",
    currency: "EGP",
    pricing_type: "/ person",
    duration: "4.5 Hours",
    max_guests: 16,
    meeting_point: "Complimentary VIP villa or hotel pickup in El Gouna.",
    what_to_bring: "Comfortable shoes, sunglasses, light jacket for evening.",
    cancellation_policy: "Full refund up to 24 hours prior to safari.",
    description:
      "Drive powerful desert buggies through the Red Sea mountains, followed by candlelit Bedouin feast and telescope stargazing under the desert sky.",
    overview:
      "Experience the raw majesty of the Eastern Desert. Ride modern quad bikes over golden dunes as the sun sets over the Red Sea mountains. Arrive at an authentic candlelit Bedouin camp for herbal tea, freshly baked flatbread, charcoal-grilled barbecue, and astronomical telescope stargazing.",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    images: [
      { id: 1, url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80" },
      { id: 2, url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80" },
    ],
  },
  {
    id: 3,
    title: "Mangroovy Beach Kitesurfing & Foiling Masterclass",
    slug: "private-kitesurf-coaching-mangroovy",
    category: {
      id: 3,
      name: "Watersports & Kitesurfing",
      slug: "watersports-kitesurfing",
    },
    location: {
      id: 3,
      name: "Mangroovy Beach • 3 Hrs",
    },
    price_cents: 340000,
    price_formatted: "3,400",
    currency: "EGP",
    pricing_type: "/ person",
    duration: "3 Hours",
    max_guests: 4,
    meeting_point: "Mangroovy Kite Center, Beach Zone 1.",
    what_to_bring: "Swimsuit, rashguard, waterproof sunscreen.",
    cancellation_policy: "Full refund if wind conditions are unsuitable. 100% wind-guarantee.",
    description:
      "One-on-one IKO certified coaching with radio helmet communication and premium Duotone gear on El Gouna's butter-flat lagoons.",
    overview:
      "El Gouna is globally renowned as the ultimate kitesurfing capital of the Middle East. Whether you are launching your first waterstart or dialing in unhooked freestyle tricks, our master instructors tailor the session to your progression with crystal flat water and dedicated rescue boat cover.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    images: [
      { id: 1, url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" },
    ],
  },
  {
    id: 4,
    title: "Red Sea Dolphin Reef & Scuba Expedition",
    slug: "red-sea-dolphin-reef-diving",
    category: {
      id: 4,
      name: "Diving & Marine Expeditions",
      slug: "diving",
    },
    location: {
      id: 4,
      name: "Dolphin House Reef • 6 Hrs",
    },
    price_cents: 420000,
    price_formatted: "4,200",
    currency: "EGP",
    pricing_type: "/ person",
    duration: "6 Hours",
    max_guests: 10,
    meeting_point: "Abu Tig Marina Pier C.",
    what_to_bring: "Swimwear, towel, dive certification card (if certified).",
    cancellation_policy: "Full refund up to 48 hours before departure.",
    description:
      "Guided dive and snorkel voyage to Sha'ab El Erg (Dolphin House), famous for wild spinner dolphin pods and vibrant coral pinnacles.",
    overview:
      "Immerse yourself in one of the most celebrated marine sanctuaries of the northern Red Sea. Encounter wild dolphin pods in their natural lagoon and explore pristine coral gardens under the guidance of PADI master instructors.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    images: [
      { id: 1, url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80" },
    ],
  },
];
