"use client";

import { useEffect, useState } from "react";
import CalendarContinuous from "@/components/CalendarContinuous";
import HorsesList from "@/components/HorsesList";

export default function UebersichtPage() {
  const [headerH, setHeaderH] = useState(56); // Fallback

  useEffect(() => {
    const el = document.getElementById("app-header");
    const recalc = () => setHeaderH(el ? el.offsetHeight : 56);
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: headerH,
        left: 0,
        right: 0,
        bottom: 0,
        padding: 16,              // gleicher Rand oben/unten/links/rechts
        boxSizing: "border-box",
        overflow: "hidden",       // Seite selbst scrollt nicht
      }}
    >
      <div
        style={{
          height: "100%",
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: 16,
        }}
      >
        <div style={{ minHeight: 0 }}>
          <HorsesList />
        </div>
        <div style={{ minHeight: 0 }}>
          <CalendarContinuous />
        </div>
      </div>
    </div>
  );
}