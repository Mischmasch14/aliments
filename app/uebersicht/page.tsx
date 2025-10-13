// app/uebersicht/page.tsx
import CalendarContinuous from "@/components/CalendarContinuous";
import HorsesList from "@/components/HorsesList";

const HEADER = 56; // px: Höhe deiner Kopfzeile/Nav

export default function UebersichtPage() {
  return (
    <div
      style={{
        position: "fixed",
        top: HEADER,      // Abstand nach oben
        left: 0,
        right: 0,
        bottom: 0,
        padding: 16,     // gleichmäßiger Rand
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: 16,
          alignItems: "stretch",
          minHeight: 0,
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