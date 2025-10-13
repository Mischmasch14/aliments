// components/HorseListSidebar.tsx
import Link from "next/link";
import { demoHorses } from "@/lib/demoHorses";

function imgSrc(h: unknown): string {
  // Falls du später imageUrl hinzufügst, wird es genutzt. Sonst Default.
  if (h && typeof h === "object" && "imageUrl" in (h as any)) {
    const v = (h as any).imageUrl;
    if (typeof v === "string" && v.length > 0) return v;
  }
  return "/default-horse.png";
}

export default function HorseListSidebar() {
  return (
    <aside
      className="card"
      style={{
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100%",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ fontWeight: 700 }}>Pferde</div>
        <Link
          href="/horses/new"
          style={{
            marginLeft: "auto",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "6px 10px",
            background: "white",
          }}
        >
          + Neu
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {demoHorses.map((h) => (
          <Link
            key={h.id}
            href={`/horses/${h.id}`}
            className="card"
            style={{
              display: "grid",
              gridTemplateColumns: "48px 1fr",
              gap: 10,
              alignItems: "center",
              padding: 8,
              textDecoration: "none",
            }}
          >
            <img
              src={imgSrc(h)}
              alt={h.name}
              width={48}
              height={48}
              style={{ borderRadius: 8, objectFit: "cover" }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>{h.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                {(h as any).breed || "unbekannte Rasse"} · {(h as any).age ?? "?"} Jahre
              </div>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}