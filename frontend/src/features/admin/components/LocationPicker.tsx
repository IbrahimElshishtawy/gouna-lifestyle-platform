"use client";

import React, { useState, useEffect, useCallback } from "react";
import { parseLocationCoordinates } from "../services/admin.api";
import { useLanguage } from "@/context/LanguageContext";

export interface LocationValue {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  map_url?: string | null;
}

interface LocationPickerProps {
  value: LocationValue;
  onChange: (location: {
    latitude: number;
    longitude: number;
    address?: string;
    map_url?: string;
  }) => void;
  className?: string;
}

// Famous El Gouna landmark presets for rapid administrator snapping
const EL_GOUNA_PRESETS = [
  { name_en: "Abu Tig Marina", name_ar: "مارينا أبو تيج", lat: 27.3975, lng: 33.6775 },
  { name_en: "Fanadir Bay", name_ar: "خليج الفنادير", lat: 27.412, lng: 33.681 },
  { name_en: "West Golf", name_ar: "وست جولف", lat: 27.382, lng: 33.665 },
  { name_en: "Mangroovy Beach", name_ar: "شاطئ مانجروفي", lat: 27.408, lng: 33.684 },
  { name_en: "Tawila Island Lagoons", name_ar: "طويلة لاجونز", lat: 27.39, lng: 33.67 },
  { name_en: "Ancient Sands Golf", name_ar: "انشنت ساندز", lat: 27.375, lng: 33.68 },
  { name_en: "Downtown / Tamr Henna", name_ar: "وسط البلد / تمر حنة", lat: 27.387, lng: 33.678 },
];

export default function LocationPicker({
  value,
  onChange,
  className = "",
}: LocationPickerProps) {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const [inputUrl, setInputUrl] = useState(value.map_url || "");
  const [parsing, setParsing] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [tempLat, setTempLat] = useState<number>(value.latitude || 27.3948);
  const [tempLng, setTempLng] = useState<number>(value.longitude || 33.6782);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Sync temp coords with value
  useEffect(() => {
    if (typeof value.latitude === "number" && typeof value.longitude === "number") {
      setTempLat(value.latitude);
      setTempLng(value.longitude);
    }
  }, [value.latitude, value.longitude]);

  // Client-side regex for rapid parsing before server fallback
  const extractCoordinatesLocally = (str: string): { lat: number; lng: number } | null => {
    // 1. "lat, lng"
    const directMatch = str.trim().match(/^([+-]?\d{1,2}(?:\.\d+)?)[,\s]+([+-]?\d{1,3}(?:\.\d+)?)$/);
    if (directMatch) {
      const lat = parseFloat(directMatch[1]);
      const lng = parseFloat(directMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

    // 2. "@lat,lng"
    const atMatch = str.match(/@([+-]?\d{1,2}(?:\.\d+)?),([+-]?\d{1,3}(?:\.\d+)?)/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

    // 3. "?q=lat,lng"
    const qMatch = str.match(/[?&](?:q|ll|loc|center)=([+-]?\d{1,2}(?:\.\d+)?)[,%2C\s]+([+-]?\d{1,3}(?:\.\d+)?)/i);
    if (qMatch) {
      const lat = parseFloat(qMatch[1]);
      const lng = parseFloat(qMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

    // 4. "!3d<lat>!4d<lng>"
    const protoMatch = str.match(/!3d([+-]?\d{1,2}(?:\.\d+)?)!4d([+-]?\d{1,3}(?:\.\d+)?)/);
    if (protoMatch) {
      const lat = parseFloat(protoMatch[1]);
      const lng = parseFloat(protoMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

    return null;
  };

  const handleParseUrl = async (urlToParse?: string) => {
    const raw = (urlToParse !== undefined ? urlToParse : inputUrl).trim();
    if (!raw) {
      setFeedback({
        type: "error",
        message: isAr
          ? "يرجى لصق رابط خرائط جوجل أو كتابة الإحداثيات أولاً."
          : "Please paste a Google Maps link or enter coordinates first.",
      });
      return;
    }

    setFeedback(null);
    setParsing(true);

    try {
      // Step 1: Rapid client-side check
      const localCoords = extractCoordinatesLocally(raw);
      if (localCoords) {
        onChange({
          latitude: localCoords.lat,
          longitude: localCoords.lng,
          map_url: raw,
          address: value.address || "El Gouna, Red Sea, Egypt",
        });
        setFeedback({
          type: "success",
          message: isAr
            ? `تم التقاط الإحداثيات بنجاح: (${localCoords.lat.toFixed(5)}, ${localCoords.lng.toFixed(5)})`
            : `Coordinates extracted successfully: (${localCoords.lat.toFixed(5)}, ${localCoords.lng.toFixed(5)})`,
        });
        setParsing(false);
        return;
      }

      // Step 2: Robust Backend Parser
      const res = await parseLocationCoordinates(raw);
      if (res.success && typeof res.latitude === "number" && typeof res.longitude === "number") {
        onChange({
          latitude: res.latitude,
          longitude: res.longitude,
          map_url: res.map_url || raw,
          address: value.address || "El Gouna, Red Sea, Egypt",
        });
        setFeedback({
          type: "success",
          message: isAr
            ? `تم التقاط الموقع بنجاح (${res.latitude.toFixed(5)}, ${res.longitude.toFixed(5)})`
            : `Location detected successfully (${res.latitude.toFixed(5)}, ${res.longitude.toFixed(5)})`,
        });
      } else {
        setFeedback({
          type: "error",
          message:
            res.message ||
            (isAr
              ? "تعذر التعرف على الإحداثيات من هذا الرابط. يمكنك اختيار الموقع مباشرة على الخريطة."
              : "Unable to detect the exact coordinates from this link. Please choose the location on the map."),
        });
      }
    } catch {
      setFeedback({
        type: "error",
        message: isAr
          ? "تعذر تحليل الرابط. يرجى التأكد من صحة الرابط أو تحديد الموقع عبر الخريطة."
          : "Unable to detect coordinates from this link. Please choose the location on the map.",
      });
    } finally {
      setParsing(false);
    }
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setFeedback({
        type: "error",
        message: isAr
          ? "متصفحك لا يدعم خاصية تحديد الموقع الجغرافي GPS."
          : "Your browser does not support geolocation.",
      });
      return;
    }

    setGpsLoading(true);
    setFeedback(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(7));
        const lng = parseFloat(pos.coords.longitude.toFixed(7));
        onChange({
          latitude: lat,
          longitude: lng,
          map_url: `https://www.google.com/maps?q=${lat},${lng}`,
          address: value.address || "GPS Current Location, Egypt",
        });
        setInputUrl(`https://www.google.com/maps?q=${lat},${lng}`);
        setFeedback({
          type: "success",
          message: isAr
            ? `تم تحديد موقع جهازك بنجاح (${lat.toFixed(5)}, ${lng.toFixed(5)})`
            : `Device location acquired (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        // Do not expose raw browser errors directly per prompt requirements
        if (err.code === err.PERMISSION_DENIED) {
          setFeedback({
            type: "error",
            message: isAr
              ? "تم رفض إذن الوصول إلى الموقع. يمكنك لصق رابط الخريطة أو اختيار الموقع يدوياً على الخريطة."
              : "Location access was denied. You can select the location manually on the map or paste a Google Maps link.",
          });
        } else {
          setFeedback({
            type: "error",
            message: isAr
              ? "تعذر الحصول على إشارة GPS حالياً. يرجى اختيار الموقع على الخريطة."
              : "Unable to retrieve GPS coordinates. Please select the location on the map.",
          });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const hasSelectedLocation =
    typeof value.latitude === "number" &&
    typeof value.longitude === "number" &&
    !isNaN(value.latitude) &&
    !isNaN(value.longitude);

  const handleConfirmMapSelection = () => {
    onChange({
      latitude: tempLat,
      longitude: tempLng,
      map_url: `https://www.google.com/maps?q=${tempLat},${tempLng}`,
      address: value.address || "El Gouna Selected Point",
    });
    setInputUrl(`https://www.google.com/maps?q=${tempLat},${tempLng}`);
    setIsMapModalOpen(false);
    setFeedback({
      type: "success",
      message: isAr
        ? `تم تأكيد الموقع المحدد على الخريطة (${tempLat.toFixed(5)}, ${tempLng.toFixed(5)})`
        : `Confirmed location on map (${tempLat.toFixed(5)}, ${tempLng.toFixed(5)})`,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Controls: Link Bar + GPS + Map Picker */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-brown">
          {isAr ? "موقع العقار والإحداثيات الجغرافية" : "Property Location & Geolocation"}
        </label>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Method B: Paste Google Maps Link */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (extractCoordinatesLocally(e.target.value)) {
                  handleParseUrl(e.target.value);
                }
              }}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData("text");
                if (pasted) {
                  setTimeout(() => handleParseUrl(pasted), 50);
                }
              }}
              placeholder={
                isAr
                  ? "الصق رابط خرائط جوجل أو الإحداثيات (مثال: https://maps.google.com/...)"
                  : "Search or paste Google Maps location link (e.g. https://maps.google.com/...)"
              }
              className="w-full text-xs bg-brand-sand-light/40 border border-brand-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-terracotta text-brand-brown placeholder:text-brand-brown-muted/60"
            />
            {inputUrl && (
              <button
                type="button"
                onClick={() => handleParseUrl()}
                disabled={parsing}
                className="absolute right-2 top-2 px-2.5 py-1 bg-brand-sand hover:bg-brand-sand-dark text-brand-brown text-[10px] font-bold rounded-lg transition"
              >
                {parsing ? (isAr ? "جاري الفحص..." : "Detecting...") : isAr ? "تحليل الرابط" : "Detect"}
              </button>
            )}
          </div>

          {/* Action Buttons: GPS + Pick on Map */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUseGps}
              disabled={gpsLoading}
              className="px-3.5 py-2.5 bg-brand-sand-light hover:bg-brand-sand text-brand-brown border border-brand-border rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title={isAr ? "استخدام موقع جهازك الحالي" : "Use current GPS location"}
            >
              <span>📍</span>
              <span>{gpsLoading ? (isAr ? "جاري التحديد..." : "Locating...") : isAr ? "موقعي الحالي" : "Use GPS"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMapModalOpen(true)}
              className="px-3.5 py-2.5 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
            >
              <span>🗺️</span>
              <span>{isAr ? "تحديد على الخريطة" : "Pick on Map"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2 border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : feedback.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[11px] font-bold hover:underline"
          >
            ✕
          </button>
        </div>
      )}

      {/* Selected Location Card & Map Preview */}
      {hasSelectedLocation ? (
        <div className="bg-brand-sand-light/30 border border-brand-border rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-bold text-brand-brown text-xs">
                  {value.address || (isAr ? "الجونة، البحر الأحمر، مصر" : "El Gouna, Red Sea, Egypt")}
                </h4>
              </div>
              <p className="text-[11px] text-brand-brown-muted mt-0.5">
                Latitude: <span className="font-mono font-medium text-brand-brown">{value.latitude?.toFixed(6)}</span> |{" "}
                Longitude: <span className="font-mono font-medium text-brand-brown">{value.longitude?.toFixed(6)}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="px-3 py-1.5 bg-white hover:bg-brand-sand border border-brand-border text-brand-brown rounded-lg text-[11px] font-bold transition shadow-2xs"
              >
                {isAr ? "تغيير الموقع" : "Change Location"}
              </button>
              <a
                href={`https://www.google.com/maps?q=${value.latitude},${value.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white hover:bg-brand-sand border border-brand-border text-brand-brown rounded-lg text-[11px] font-medium transition"
              >
                {isAr ? "فتح في خرائط Google ↗" : "Open Google Maps ↗"}
              </a>
            </div>
          </div>

          {/* Map Preview Embed */}
          <div className="relative w-full h-44 rounded-xl overflow-hidden border border-brand-border bg-brand-sand-light">
            <iframe
              title="Location Map Preview"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${(value.longitude || 33.678) - 0.008}%2C${(value.latitude || 27.394) - 0.008}%2C${(value.longitude || 33.678) + 0.008}%2C${(value.latitude || 27.394) + 0.008}&layer=mapnik&marker=${value.latitude}%2C${value.longitude}`}
              className="w-full h-full filter saturate-95"
            />
          </div>
        </div>
      ) : (
        <div className="p-4 border border-dashed border-brand-border rounded-2xl bg-white/50 text-center text-xs text-brand-brown-muted">
          <p className="font-medium">
            {isAr ? "لم يتم تحديد أي موقع جغرافي للعقار بعد." : "No location selected yet."}
          </p>
          <p className="text-[11px] mt-1 text-brand-brown-muted/80">
            {isAr
              ? "الصق رابط الخريطة أعلاه، أو اضغط على «موقعي الحالي» أو «تحديد على الخريطة» لاختيار نقطة التمركز."
              : "Paste a Google Maps link above, or click 'Use GPS' or 'Pick on Map' to set authoritative coordinates."}
          </p>
        </div>
      )}

      {/* Interactive Map Picker Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-brand-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div>
                <h3 className="text-base font-serif font-bold text-brand-brown">
                  {isAr ? "تحديد الموقع على خريطة الجونة" : "Pick Location on Map"}
                </h3>
                <p className="text-xs text-brand-brown-muted mt-0.5">
                  {isAr
                    ? "اختر من أبرز مناطق الجونة أدناه أو عدّل الإحداثيات بدقة عالية."
                    : "Select a neighborhood preset or adjust coordinates directly."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="w-8 h-8 rounded-full bg-brand-sand-light hover:bg-brand-sand text-brand-brown flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-brand-brown-muted">
                {isAr ? "المعالم والمناطق السريعة في الجونة:" : "Quick El Gouna Presets:"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {EL_GOUNA_PRESETS.map((p) => {
                  const isSelected =
                    Math.abs(tempLat - p.lat) < 0.001 && Math.abs(tempLng - p.lng) < 0.001;
                  return (
                    <button
                      key={p.name_en}
                      type="button"
                      onClick={() => {
                        setTempLat(p.lat);
                        setTempLng(p.lng);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                        isSelected
                          ? "bg-brand-terracotta text-white border-brand-terracotta shadow-2xs"
                          : "bg-brand-sand-light/60 hover:bg-brand-sand text-brand-brown border-brand-border"
                      }`}
                    >
                      {isAr ? p.name_ar : p.name_en}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Preview Canvas */}
            <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-brand-border bg-brand-sand-light shadow-inner">
              <iframe
                title="Interactive Picker Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${tempLng - 0.006}%2C${tempLat - 0.006}%2C${tempLng + 0.006}%2C${tempLat + 0.006}&layer=mapnik&marker=${tempLat}%2C${tempLng}`}
                className="w-full h-full"
              />
            </div>

            {/* Fine-tuning Coords */}
            <div className="grid grid-cols-2 gap-3 bg-brand-sand-light/40 p-3 rounded-xl border border-brand-border text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-brand-brown-muted mb-1">
                  Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  min="-90"
                  max="90"
                  value={tempLat}
                  onChange={(e) => setTempLat(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-white border border-brand-border rounded-lg p-2 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-brand-brown-muted mb-1">
                  Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  min="-180"
                  max="180"
                  value={tempLng}
                  onChange={(e) => setTempLng(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-white border border-brand-border rounded-lg p-2 font-mono"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="px-4 py-2 bg-brand-sand-light hover:bg-brand-sand text-brand-brown rounded-xl text-xs font-semibold transition"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmMapSelection}
                className="px-5 py-2 bg-brand-terracotta hover:bg-brand-terracotta-dark text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                {isAr ? "تأكيد الموقع المختار" : "Confirm Location"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
