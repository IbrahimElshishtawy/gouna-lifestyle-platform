"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export interface ReviewItem {
  id: string | number;
  author: string;
  location?: string;
  avatar?: string;
  rating: number;
  date: string;
  verifiedStay: boolean;
  comment: string;
  conciergeResponse?: string;
}

interface ReviewsSectionProps {
  title?: string;
  averageRating?: number;
  totalReviews?: number;
  initialReviews?: ReviewItem[];
}

export default function ReviewsSection({
  title,
  averageRating = 4.96,
  totalReviews = 28,
  initialReviews,
}: ReviewsSectionProps) {
  const { t, locale } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formAuthor, setFormAuthor] = useState("");
  const [formComment, setFormComment] = useState("");

  const defaultReviewsEn: ReviewItem[] = [
    {
      id: 1,
      author: "Lord Henry Cavendish",
      location: "London, United Kingdom",
      rating: 5,
      date: "September 2026",
      verifiedStay: true,
      comment:
        "An absolutely transcendent retreat. The sunset over the lagoon is beyond description, and the private dock made our daily yacht excursions seamless. The housekeeping and butler service maintained supreme privacy and excellence.",
      conciergeResponse:
        "Thank you Lord Cavendish. It was an honor hosting you in El Gouna, and we look forward to preparing your arrival again this winter.",
    },
    {
      id: 2,
      author: "Dr. Marianne Weber",
      location: "Munich, Germany",
      rating: 5,
      date: "August 2026",
      verifiedStay: true,
      comment:
        "Flawless architecture and impeccably clean. The infinity pool overlooking the marina and the bespoke concierge recommendations made our anniversary unforgettable. Everything was exactly as pictured.",
    },
    {
      id: 3,
      author: "Karim & Yasmine Mansour",
      location: "Cairo, Egypt",
      rating: 5,
      date: "July 2026",
      verifiedStay: true,
      comment:
        "The best private luxury rental we have experienced in El Gouna. Spacious, serene, with high-speed internet and prime proximity to Abu Tig Marina. Five stars in every dimension.",
    },
  ];

  const defaultReviewsAr: ReviewItem[] = [
    {
      id: 1,
      author: "لورد هنري كافنديش",
      location: "لندن، المملكة المتحدة",
      rating: 5,
      date: "سبتمبر 2026",
      verifiedStay: true,
      comment:
        "إقامة تفوق الوصف بكافة المقاييس. الغروب على مياه البحيرة ساحر للغاية، والمرسى الخاص سهل علينا رحلات اليخوت اليومية. خدمة النظافة والمضيف الخاص قدمت خصوصية تامة ورفاهية متناهية.",
      conciergeResponse:
        "شكراً لك لورد كافنديش. تشرفنا باستضافتك في الجونة، ونتطلع للترحيب بك مجدداً هذا الشتاء.",
    },
    {
      id: 2,
      author: "د. ماريان فيبر",
      location: "ميونخ، ألمانيا",
      rating: 5,
      date: "أغسطس 2026",
      verifiedStay: true,
      comment:
        "تصميم معماري متكامل ونظافة استثنائية. حمام السباحة الإنفينيتي المطل على المارينا وترتيبات الكونسيرج الخاصة جعلت ذكرى زواجنا لا تُنسى. كل شيء مطابق تماماً للصور.",
    },
    {
      id: 3,
      author: "كريم وياسمين منصور",
      location: "القاهرة، مصر",
      rating: 5,
      date: "يوليو 2026",
      verifiedStay: true,
      comment:
        "أفضل تجربة استئجار فيلا خاصة قضيناها في الجونة. مساحة واسعة، هدوء تام، إنترنت فائق السرعة وقرب مباشر من مارينا أبو تيج. خمس نجوم في كل التفاصيل.",
    },
  ];

  const defaultReviews = locale === "ar" ? defaultReviewsAr : defaultReviewsEn;
  const reviews = initialReviews && initialReviews.length > 0 ? initialReviews : defaultReviews;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setShowModal(false);
      setSubmitted(false);
      setFormAuthor("");
      setFormComment("");
    }, 2000);
  };

  const categories = [
    { name: t.reviews.cleanliness, score: "5.0", percent: 100 },
    { name: t.reviews.accuracy, score: "4.9", percent: 98 },
    { name: t.reviews.communication, score: "5.0", percent: 100 },
    { name: t.reviews.location, score: "5.0", percent: 100 },
    { name: t.reviews.checkIn, score: "4.9", percent: 98 },
    { name: t.reviews.valueForMoney, score: "4.8", percent: 96 },
  ];

  const sectionTitle = title || t.reviews.title;

  return (
    <div className="bg-white p-6 sm:p-10 rounded-3xl border border-brand-border shadow-xs space-y-8">
      {/* Header & Overall Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-amber-500 text-lg">★</span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-brand-brown">
              {averageRating.toFixed(2)}
            </span>
            <span className="text-xs text-brand-brown-muted font-medium">
              &bull; {totalReviews} {t.reviews.verifiedReviews}
            </span>
          </div>
          <h2 className="font-serif text-lg font-bold text-brand-brown">
            {sectionTitle}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="self-start sm:self-auto px-4 py-2.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown border border-brand-border rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          {t.reviews.writeReview}
        </button>
      </div>

      {/* Categories Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8 text-xs">
        {categories.map((cat) => (
          <div key={cat.name} className="space-y-1">
            <div className="flex justify-between items-center text-brand-brown font-medium">
              <span>{cat.name}</span>
              <span className="font-bold">{cat.score}</span>
            </div>
            <div className="h-1.5 w-full bg-brand-sand-light rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-brown rounded-full"
                style={{ width: `${cat.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-brand-border/60">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-2xl bg-brand-sand-light/40 border border-brand-border/60 space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-brand-brown">
                      {rev.author}
                    </span>
                    {rev.verifiedStay && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                        ✓ {t.reviews.verifiedGuest}
                      </span>
                    )}
                  </div>
                  {rev.location && (
                    <span className="text-[11px] text-brand-brown-muted block">
                      {rev.location}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <div className="flex text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="text-[10px] text-brand-brown-muted ms-1">
                    {rev.date}
                  </span>
                </div>
              </div>

              <p className="text-xs text-brand-brown/90 leading-relaxed italic">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>

            {rev.conciergeResponse && (
              <div className="pt-2.5 border-t border-brand-border/40 text-[11px] text-brand-brown-muted">
                <span className="font-bold text-brand-terracotta">
                  {t.reviews.conciergeResponse}:{" "}
                </span>
                <span>{rev.conciergeResponse}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Write Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-brand-border shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-brand-border pb-3">
              <h3 className="font-serif font-bold text-lg text-brand-brown">
                {t.reviews.shareExperience}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-brand-brown-muted hover:text-brand-brown text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 rounded-2xl text-center space-y-2">
                <span className="text-3xl">✓</span>
                <p className="text-xs font-bold text-emerald-900">
                  {t.reviews.reviewSubmitted}
                </p>
                <p className="text-[11px] text-emerald-700">
                  {t.reviews.reviewSubmittedSub}
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-brand-brown-muted mb-1">
                    {t.reviews.rating}
                  </label>
                  <div className="flex gap-2 text-xl text-amber-500 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className={`transition ${formRating >= star ? "text-amber-500" : "text-gray-300"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-brown-muted mb-1">
                    {t.reviews.yourFullName}
                  </label>
                  <input
                    type="text"
                    required
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder={t.reviews.namePlaceholder}
                    className="w-full text-xs p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/50 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-brown-muted mb-1">
                    {t.reviews.reviewDetails}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder={t.reviews.reviewPlaceholder}
                    className="w-full text-xs p-2.5 rounded-xl border border-brand-border bg-brand-sand-light/50 focus:outline-none focus:ring-1 focus:ring-brand-terracotta"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-brand-border rounded-xl text-xs font-bold text-brand-brown-muted cursor-pointer"
                  >
                    {t.reviews.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    {t.reviews.submitReview}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
