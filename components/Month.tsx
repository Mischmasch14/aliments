"use client";

import { format, isSameMonth, isToday } from "date-fns";
import { de } from "date-fns/locale";
import { monthGrid } from "@/lib/calendar";
import { demoEvents } from "@/lib/events";

export default function Month({ monthDate }: { monthDate: Date }) {
  const label = format(monthDate, "MMMM yyyy", { locale: de });
  const days = monthGrid(monthDate, 1); // Montag-Start

  // Events per yyyy-mm-dd
  const map = new Map<string, number>();
  for (const ev of demoEvents) {
    const key = new Date(ev.startUtc).toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <strong>{label}</strong>
      </div>

      {/* Wochentage */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap: 8, marginBottom: 8 }}>
        {["Mo","Di","Mi","Do","Fr","Sa","So"].map(d => (
          <div key={d} className="muted" style={{ textAlign: "center" }}>{d}</div>
        ))}
      </div>

      {/* Tage */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap: 8 }}>
        {days.map((d) => {
          const key = d.toISOString().slice(0,10);
          const cnt = map.get(key) ?? 0;
          const today = isToday(d);
          const dim = isSameMonth(d, monthDate) ? 1 : 0.45;
          return (
            <div key={key} className="card" style={{ padding: 10, opacity: dim, borderColor: today ? "#60a5fa" : undefined }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                <span className="muted" style={{ fontSize: 12 }}>{format(d, "d")}</span>
                {cnt > 0 && (
                  <span title={`${cnt} Termin(e)`} style={{ display:"flex", gap: 4 }}>
                    {Array.from({length: Math.min(cnt,3)}).map((_,i)=>(
                      <i key={i} style={{ width:6, height:6, borderRadius:9999, background:"#0ea5e9", display:"inline-block" }} />
                    ))}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}