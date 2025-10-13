"use client";

import { useMemo, useState } from "react";
import { addMonths, format, isSameDay, isSameMonth, isToday } from "date-fns";
import { de } from "date-fns/locale";
import { monthGrid } from "@/lib/calendar";
import { demoEvents } from "@/lib/events";

export default function Calendar() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const label = format(viewDate, "MMMM yyyy", { locale: de });
  const days = monthGrid(viewDate, 1); // Montag-Start

  // Events pro Tag vorgruppieren (nach UTC-Datum)
  const eventsByDay = useMemo(() => {
    const map = new Map<string, typeof demoEvents>();
    for (const ev of demoEvents) {
      const d = new Date(ev.startUtc);
      const key = d.toISOString().slice(0, 10); // yyyy-mm-dd
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, []);

  const selectedEvents = useMemo(() => {
    if (!selected) return [];
    const key = selected.toISOString().slice(0, 10);
    return eventsByDay.get(key) ?? [];
  }, [selected, eventsByDay]);

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
        <strong>Kalender</strong>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={() => { setSelected(null); setViewDate(d => addMonths(d, -1)); }} aria-label="vorheriger Monat">◀</button>
          <div className="muted" style={{ minWidth:140, textAlign:"center" }}>{label}</div>
          <button onClick={() => { setSelected(null); setViewDate(d => addMonths(d, +1)); }} aria-label="nächster Monat">▶</button>
        </div>
      </div>

      {/* Wochentage */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:8, marginTop:12 }}>
        {["Mo","Di","Mi","Do","Fr","Sa","So"].map(d => (
          <div key={d} className="muted" style={{ textAlign:"center" }}>{d}</div>
        ))}
      </div>

      {/* Raster mit Event-Punkten */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:8, marginTop:8 }}>
        {days.map((d) => {
          const dim = isSameMonth(d, viewDate) ? 1 : 0.45;
          const today = isToday(d);
          const key = d.toISOString().slice(0, 10);
          const count = eventsByDay.get(key)?.length ?? 0;
          const isSelected = selected ? isSameDay(selected, d) : false;

          return (
            <button
              key={key}
              onClick={() => setSelected(d)}
              className="card"
              style={{
                textAlign:"left",
                padding:12,
                opacity: dim,
                borderColor: isSelected ? "#0ea5e9" : (today ? "#60a5fa" : undefined),
                outline:"none",
                cursor:"pointer"
              }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                <div className="muted" style={{ fontSize:12 }}>{format(d, "d")}</div>
                {count > 0 && (
                  <div style={{ display:"flex", gap:4 }}>
                    {Array.from({length: Math.min(count, 3)}).map((_,i) => (
                      <span key={i} style={{
                        width:6, height:6, borderRadius:9999, background:"#0ea5e9", display:"inline-block"
                      }} />
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Ausgewählter Tag: Eventliste */}
      <div style={{ marginTop:12 }}>
        <div className="muted" style={{ marginBottom:8 }}>
          {selected ? format(selected, "EEEE, d. MMMM yyyy", { locale: de }) : "Kein Tag gewählt"}
        </div>
        {selectedEvents.length === 0 ? (
          <div className="muted">Keine Ereignisse.</div>
        ) : (
          <div style={{ display:"grid", gap:8 }}>
            {selectedEvents.map(ev => (
              <div key={ev.id} className="card" style={{ padding:12 }}>
                <strong>{ev.title}</strong>
                <div className="muted" style={{ marginTop:4 }}>
                  {format(new Date(ev.startUtc), "HH:mm")}–{format(new Date(ev.endUtc), "HH:mm")} UTC
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


