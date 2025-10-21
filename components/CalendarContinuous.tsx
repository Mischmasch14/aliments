"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  addWeeks,
  addMonths,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { de } from "date-fns/locale";
import { demoEvents } from "@/lib/events";

type DayInfo = {
  date: Date;
  key: string;
  inMonth: boolean;
  today: boolean;
  evCount: number;
};
type Mode = "day" | "week" | "month";

const DAY_MIN = 99;
const WEEK_GAP = 10;
const TODAY_BG = "#eff6ff";
const HOUR_ROW = 56;

function isoDateLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarContinuous() {
  // Refs
  const monthScrollRef = useRef<HTMLDivElement | null>(null);
  const dayScrollRef   = useRef<HTMLDivElement | null>(null);
  const weekScrollRef  = useRef<HTMLDivElement | null>(null);
  const lastScrollTop  = useRef(0);

  // State
  const [mode, setMode] = useState<Mode>("month");
  const baseWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const [headWeeks, setHeadWeeks] = useState(-8);
  const [tailWeeks, setTailWeeks] = useState(16);
  const [currentIso, setCurrentIso] = useState<string>(isoDateLocal(new Date()));
  const [selectedKey, setSelectedKey] = useState<string>(isoDateLocal(new Date()));
  const [padTop, setPadTop] = useState(12);
  const [padBottom, setPadBottom] = useState(12);

  // --- Events (lokal + Demo) ---
  type NewEventForm = { title: string; date: string; start: string; end: string; allDay: boolean };
  const EV_KEY = "aliments.events";
  const [events, setEvents] = useState<Array<{title:string; startUtc:string; endUtc:string; allDay?:boolean}>>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<NewEventForm>({
    title:"", date: isoDateLocal(new Date()), start:"10:00", end:"11:00", allDay:false
  });

  const allEvents = useMemo(() => {
    const raw = (typeof window !== "undefined" && localStorage.getItem(EV_KEY)) || "[]";
    let user: any[] = [];
    try { user = JSON.parse(raw) } catch {}
    return [...(demoEvents ?? []), ...user];
  }, [events]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(EV_KEY);
      setEvents(raw ? JSON.parse(raw) : []);
    } catch {
      setEvents([]);
    }
  }, []);

  function saveEvent(e: {title:string; date:string; start:string; end:string; allDay:boolean}) {
    const startUtc = new Date(`${e.date}T${e.start}:00`).toISOString();
    const endUtc   = new Date(`${e.date}T${e.end}:00`).toISOString();
    const next = [...events, { title: e.title, startUtc, endUtc, allDay: e.allDay }];
    localStorage.setItem(EV_KEY, JSON.stringify(next));
    setEvents(next);
  }

  // Helpers
  function utcDayKey(d: Date) {
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      .toISOString()
      .slice(0, 10);
  }
  function layoutEvent(startUtc: string, endUtc: string) {
    const s = new Date(startUtc);
    const e = new Date(endUtc);
    const startMin = s.getHours() * 60 + s.getMinutes();
    const endMin   = e.getHours() * 60 + e.getMinutes();
    const durMin   = Math.max(15, endMin - startMin);
    return { top: (startMin / 60) * HOUR_ROW, height: (durMin / 60) * HOUR_ROW };
  }

  // --- Popup: "+N weitere" (Monatsansicht) ---
  // (WICHTIG: NACH allEvents definieren)
  const [moreForDay, setMoreForDay] = useState(false);
  const [moreForDate, setMoreForDate] = useState<Date | null>(null);

  const popupEvents = useMemo(() => {
    if (!moreForDate) return [];
    const key = utcDayKey(moreForDate);
    return allEvents
      .filter(ev => utcDayKey(new Date(ev.startUtc)) === key)
      .sort((a, b) => new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime());
  }, [moreForDate, allEvents]);

  function openDayPopup(date: Date) {
    setMoreForDate(date);
    setMoreForDay(true);
  }
  function closeDayPopup() {
    setMoreForDay(false);
    setMoreForDate(null);
  }
  function fmtHM(iso: string) {
    const dt = new Date(iso);
    return dt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  }

  // Events count per day (für Monatsraster)
  const eventsByDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const ev of allEvents) {
      const k = new Date(ev.startUtc).toISOString().slice(0, 10);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, [allEvents]);

  // Monatsraster
  const monthWeeks: DayInfo[][] = useMemo(() => {
    const arr: DayInfo[][] = [];
    for (let w = headWeeks; w < tailWeeks; w++) {
      const weekStart = addWeeks(baseWeek, w);
      const monthRef = startOfMonth(weekStart);
      const row: DayInfo[] = [];
      for (let i = 0; i < 7; i++) {
        const d = addDays(weekStart, i);
        const key = d.toISOString().slice(0, 10);
        row.push({
          date: d,
          key,
          inMonth: isSameMonth(d, monthRef),
          today: isToday(d),
          evCount: eventsByDay.get(key) ?? 0,
        });
      }
      arr.push(row);
    }
    return arr;
  }, [baseWeek, headWeeks, tailWeeks, eventsByDay]);

  // Header (Monatstitel) bestimmen
  function updateHeaderSymmetricContentCoords() {
    const el = monthScrollRef.current;
    if (!el) return;
    const firstWeek = el.querySelector<HTMLDivElement>('[data-week-start]');
    if (!firstWeek) return;
    const rowH = firstWeek.getBoundingClientRect().height;
    const padTopVal = parseFloat(getComputedStyle(el).paddingTop || "0") || 0;
    const anchorY = el.scrollTop + padTopVal + rowH + WEEK_GAP + rowH / 2;
    const anchors = Array.from(
      el.querySelectorAll<HTMLDivElement>('[data-day="1"][data-date]')
    );
    if (anchors.length === 0) return;
    let bestIso: string | null = null;
    let bestY = -Infinity;
    const contTop = el.getBoundingClientRect().top;
    for (const a of anchors) {
      const r = a.getBoundingClientRect();
      const centerY = el.scrollTop + (r.top - contTop) + r.height / 2;
      if (centerY <= anchorY && centerY > bestY) {
        bestY = centerY;
        bestIso = a.dataset.date ?? null;
      }
    }
    if (!bestIso && anchors[0]) bestIso = anchors[0].dataset.date ?? null;
    if (bestIso) setCurrentIso(bestIso);
  }
  function updateHeader() {
    const el = monthScrollRef.current;
    if (!el) return;
    const cont = el.getBoundingClientRect();
    const firstWeek = el.querySelector<HTMLDivElement>("[data-week-start]");
    if (!firstWeek) return;
    const rowH = firstWeek.getBoundingClientRect().height;
    const st = el.scrollTop;
    const secondRowTopContent = st + rowH + WEEK_GAP;
    const bandMid = secondRowTopContent + rowH / 2;
    const anchors = Array.from(el.querySelectorAll<HTMLDivElement>('[data-day="1"][data-date]'));
    if (anchors.length === 0) return;
    let bestIso: string | null = null;
    let bestY = -Infinity;
    for (const a of anchors) {
      const r = a.getBoundingClientRect();
      const centerContent = st + (r.top - cont.top) + r.height / 2;
      if (centerContent <= bandMid && centerContent > bestY) {
        bestY = centerContent;
        bestIso = a.dataset.date ?? null;
      }
    }
    if (!bestIso) {
      let minY = Infinity;
      for (const a of anchors) {
        const r = a.getBoundingClientRect();
        const centerContent = st + (r.top - cont.top) + r.height / 2;
        if (centerContent < minY) {
          minY = centerContent;
          bestIso = a.dataset.date ?? null;
        }
      }
    }
    if (bestIso && bestIso !== currentIso) setCurrentIso(bestIso);
  }
  function onMonthScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const st = el.scrollTop;
    const goingUp = st < lastScrollTop.current;
    lastScrollTop.current = st;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) setTailWeeks(t => t + 8);
    const topThreshold = padTop + WEEK_GAP;
    if (el.scrollTop <= topThreshold) {
      const prev = el.scrollHeight;
      setHeadWeeks(h => h - 8);
      requestAnimationFrame(() => {
        const n = monthScrollRef.current;
        if (!n) return;
        const diff = n.scrollHeight - prev;
        n.scrollTop += diff;
        lastScrollTop.current = n.scrollTop;
        updateHeaderSymmetricContentCoords();
        recalcMonthPad();
      });
      return;
    }
    updateHeaderSymmetricContentCoords();
  }

  // Padding berechnen
  function recalcMonthPad() {
    const el = monthScrollRef.current;
    if (!el) return;
    const firstRow = el.querySelector<HTMLDivElement>('[data-week-start]');
    if (!firstRow) return;
    const rowH = firstRow.getBoundingClientRect().height;
    const visible = el.clientHeight;
    const need = 5 * rowH + 4 * WEEK_GAP;
    const free = Math.max(0, visible - need);
    const top = Math.floor(free / 2);
    const bottom = free - top;
    setPadTop(top);
    setPadBottom(bottom);
  }
  function scrollDateIntoMonthRow(target: Date, rowIndexFromTop = 0, pxOffset = 0) {
    const el = monthScrollRef.current;
    if (!el) return;
    const key = isoDateLocal(target);
    const cell = el.querySelector<HTMLDivElement>(`[data-date="${key}"]`);
    if (!cell) return;
    let row: HTMLElement | null = cell;
    while (row && row !== el && !row.hasAttribute("data-week-start")) {
      row = row.parentElement as HTMLElement | null;
    }
    if (!row || row === el) return;
    const contRect = el.getBoundingClientRect();
    const rowRect  = row.getBoundingClientRect();
    const rowTopWithin = rowRect.top - contRect.top;
    const firstRow = el.querySelector<HTMLDivElement>('[data-week-start]');
    const rowH = firstRow ? firstRow.getBoundingClientRect().height : rowRect.height;
    const targetTopWithin = padTop + rowIndexFromTop * (rowH + WEEK_GAP) + pxOffset;
    el.scrollTop += (rowTopWithin - targetTopWithin);
    updateHeaderSymmetricContentCoords();
    lastScrollTop.current = el.scrollTop;
  }
  function scrollToDate(target: Date) {
    const key = isoDateLocal(target);
    if (mode !== "month") {
      setSelectedKey(key);
      return;
    }
    setSelectedKey(key);
    requestAnimationFrame(() => {
      scrollDateIntoMonthRow(new Date(key), 1, 1);
    });
  }

  // Auto-Startpositionen
  useEffect(() => {
    if (mode !== "day") return;
    const nowHour = new Date().getHours();
    requestAnimationFrame(() => {
      const n = dayScrollRef.current;
      if (!n) return;
      const target = nowHour * HOUR_ROW - 2 * HOUR_ROW;
      const max = n.scrollHeight - n.clientHeight;
      n.scrollTop = Math.max(0, Math.min(target, max));
    });
  }, [mode, selectedKey]);

  useEffect(() => {
    if (mode !== "week") return;
    const nowHour = new Date().getHours();
    requestAnimationFrame(() => {
      const n = weekScrollRef.current;
      if (!n) return;
      const target = nowHour * HOUR_ROW - 2 * HOUR_ROW;
      const max = n.scrollHeight - n.clientHeight;
      n.scrollTop = Math.max(0, Math.min(target, max));
    });
  }, [mode, baseWeek]);

  useEffect(() => {
    if (mode !== "month") return;
    const el = monthScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      recalcMonthPad();
      requestAnimationFrame(() => {
        scrollDateIntoMonthRow(new Date(selectedKey), 1, -2);
        lastScrollTop.current = el.scrollTop;
      });
    });
  }, [mode]);

  // Titel
  const hours = Array.from({ length: 24 }, (_, h) => h);
  const selectedDate = useMemo(() => new Date(selectedKey), [selectedKey]);
  const weekStartSelected = useMemo(
    () => startOfWeek(selectedDate, { weekStartsOn: 1 }),
    [selectedDate]
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStartSelected, i)),
    [weekStartSelected]
  );
  const monthLabel = format(new Date(currentIso), "MMMM yyyy", { locale: de });
  const leftTitle =
    mode === "day"
      ? format(selectedDate, "EEEE, d. MMMM yyyy", { locale: de })
      : mode === "week"
      ? format(weekStartSelected, "MMMM yyyy", { locale: de })
      : monthLabel;

  // Render
  return (
    <div
      className="calendar card"
      style={{
        padding: "0 12px 12px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Kopfzeile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          margin: "8px 0",
        }}
      >
        <div style={{ fontWeight: 600 }}>{leftTitle}</div>
        <div style={{ justifySelf: "center", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => {
            if (mode === "day") setSelectedKey(isoDateLocal(addDays(new Date(selectedKey), -1)));
            else if (mode === "week") setSelectedKey(isoDateLocal(addDays(new Date(selectedKey), -7)));
            else {
              const anchor = new Date(currentIso);
              const target = startOfMonth(addMonths(anchor, -1));
              setHeadWeeks(h => h - 8);
              setSelectedKey(isoDateLocal(target));
              requestAnimationFrame(() => {
                recalcMonthPad();
                requestAnimationFrame(() => {
                  scrollDateIntoMonthRow(target, 0, 1);
                  const el = monthScrollRef.current;
                  if (el) lastScrollTop.current = el.scrollTop;
                });
              });
            }
          }}>←</button>

          <div
            role="tablist"
            aria-label="Ansicht"
            style={{
              display: "inline-flex",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 9999,
              padding: 4,
              gap: 4,
            }}
          >
            {(["day", "week", "month"] as Mode[]).map((m) => {
              const active = mode === m;
              const label = m === "day" ? "Tag" : m === "week" ? "Woche" : "Monat";
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  role="tab"
                  aria-selected={active}
                  style={{
                    minWidth: 72,
                    padding: "6px 10px",
                    border: "none",
                    borderRadius: 9999,
                    background: active ? "white" : "transparent",
                    color: "var(--text)",
                    boxShadow: active ? "0 1px 1px rgba(0,0,0,0.04)" : "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button onClick={() => {
            if (mode === "day") setSelectedKey(isoDateLocal(addDays(new Date(selectedKey), 1)));
            else if (mode === "week") setSelectedKey(isoDateLocal(addDays(new Date(selectedKey), 7)));
            else {
              const anchor = new Date(currentIso);
              const target = startOfMonth(addMonths(anchor, 1));
              setTailWeeks(t => t + 8);
              setSelectedKey(isoDateLocal(target));
              requestAnimationFrame(() => {
                recalcMonthPad();
                requestAnimationFrame(() => {
                  scrollDateIntoMonthRow(target, 0, 1);
                  const el = monthScrollRef.current;
                  if (el) lastScrollTop.current = el.scrollTop;
                });
              });
            }
          }}>→</button>
        </div>

        {/* Neuer Termin Modal */}
        {showNew && (
          <div
            onClick={() => setShowNew(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingTop: 24,
              zIndex: 10,
            }}
          >
            <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: 360, padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Neuer Termin</div>
              <div style={{ display: "grid", gap: 8 }}>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Titel"
                  style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}
                />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input
                    type="time"
                    value={form.start}
                    onChange={(e) => setForm({ ...form, start: e.target.value })}
                    style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}
                  />
                  <input
                    type="time"
                    value={form.end}
                    onChange={(e) => setForm({ ...form, end: e.target.value })}
                    style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 8 }}
                  />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text)" }}>
                  <input
                    type="checkbox"
                    checked={form.allDay}
                    onChange={(e) => setForm({ ...form, allDay: e.target.checked })}
                  />
                  Ganztägig
                </label>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button
                    onClick={() => setShowNew(false)}
                    style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "white", cursor: "pointer" }}
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={() => { saveEvent(form); setShowNew(false); }}
                    style={{ padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "white", cursor: "pointer", fontWeight: 600 }}
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ justifySelf: "end", display:"flex", gap:8 }}>
          <button
            onClick={() => scrollToDate(new Date())}
            style={{ padding:"8px 12px", border:"1px solid var(--border)", borderRadius:8, background:"white", cursor:"pointer", color:"var(--text)" }}
          >
            Heute
          </button>
          <button
            onClick={() => {
              const base = mode === "day" ? new Date(selectedKey) : new Date();
              setForm({ title:"", date: isoDateLocal(base), start:"10:00", end:"11:00", allDay:false });
              setShowNew(true);
            }}
            aria-label="Neuen Termin"
            style={{
              width:36, height:36, display:"inline-flex", alignItems:"center", justifyContent:"center",
              border:"1px solid var(--border)", borderRadius:9999, background:"white",
              cursor:"pointer", boxShadow:"0 1px 2px rgba(0,0,0,0.04)"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Wochentagszeile / ToDo */}
      <div className="card" style={{ padding: 8, marginBottom: 8 }}>
        {mode === "day" ? (
          <div style={{ height: 21, display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>To Do</span>
          </div>
        ) : mode === "week" ? (
          <div style={{ display: "grid", gridTemplateColumns: "48px repeat(7, 1fr)" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", transform: "translateY(1px) translateX(-2px)" }}>
              KW {format(weekStartSelected, "I", { locale: de })}
            </div>
            {Array.from({ length: 7 }, (_, i) => addDays(weekStartSelected, i)).map((d) => {
              const wd = format(d, "EEE", { locale: de }).replace(".", "");
              const num = format(d, "d", { locale: de });
              return (
                <div key={d.toISOString()} className="muted" style={{ textAlign: "center" }}>
                  {wd} {num}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
              <div key={d} className="muted" style={{ textAlign: "center" }}>
                {d}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inhalt */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {mode === "month" ? (
          <div
            ref={monthScrollRef}
            onScroll={onMonthScroll}
            className="card"
            style={{
              height: "100%",
              overflowY: "auto",
              paddingLeft: 8,
              paddingRight: 12,
              paddingTop: padTop,
              paddingBottom: padBottom,
            }}
            aria-label="Kalender (Monat, kontinuierlich)"
          >
            <div style={{ display: "grid", gap: WEEK_GAP }}>
              {monthWeeks.map((row) => (
                <div
                  key={row[0].key + "_week"}
                  data-week-start={row[0].key}
                  style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: WEEK_GAP }}
                >
                  {row.map((d) => {
                    const isFirstOfMonth = d.date.getDate() === 1;
                    const bg = isToday(d.date) ? TODAY_BG : "transparent";

                    const dayKey = utcDayKey(d.date);
                    const dayEvents = allEvents.filter(
                      ev => utcDayKey(new Date(ev.startUtc)) === dayKey
                    );
                    const more = Math.max(0, dayEvents.length - 2);

                    return (
                      <div
                        key={d.key}
                        data-date={isoDateLocal(d.date)}
                        data-day={String(d.date.getDate())}
                        onClick={() => { setSelectedKey(isoDateLocal(d.date)); setMode("day"); }}
                        style={{
                          position: "relative",
                          padding: 10,
                          minHeight: DAY_MIN,
                          cursor: "pointer",
                          userSelect: "none",
                          background: bg,
                          border: "1px solid var(--border)",
                          borderRadius: 10,
                          outline: "none",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span
                            className="muted"
                            style={{ fontSize: 12, fontWeight: 600, visibility: isFirstOfMonth ? "visible" : "hidden" }}
                          >
                            {isFirstOfMonth ? format(d.date, "MMMM", { locale: de }) : "—"}
                          </span>
                          <span className="muted" style={{ fontSize: 12 }}>{format(d.date, "d")}</span>
                        </div>

                        <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
                          {dayEvents.slice(0, 2).map((ev, i) => (
                            <div
                              key={i}
                              style={{
                                fontSize: 12,
                                lineHeight: "16px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                color: "var(--text)",
                              }}
                              title={ev.title}
                            >
                              {ev.title}
                            </div>
                          ))}
                        </div>

                        {more > 0 && (
                          <button
                            type="button"
                            aria-label={`${more} weitere Termine anzeigen`}
                            onClick={(e) => { e.stopPropagation(); openDayPopup(d.date); }}
                            style={{
                              position: "absolute",
                              right: 6,
                              bottom: 6,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: 18,
                              minWidth: 22,
                              padding: "0 6px",
                              borderRadius: 9999,
                              background: "var(--surface-2)",
                              border: "1px solid var(--border)",
                              fontSize: 11,
                              lineHeight: 1,
                              color: "var(--text)",
                              cursor: "pointer"
                            }}
                          >
                            +{more}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : mode === "week" ? (
          <div className="card" style={{ padding: 0, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
            <div ref={weekScrollRef} style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "48px repeat(7, 1fr)" }}>
                {/* linke Zeitspalte */}
                <div style={{ borderRight: "1px solid var(--border)", background: "var(--surface-1)" }}>
                  {hours.map((h) => (
                    <div
                      key={h}
                      style={{
                        height: HOUR_ROW,
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "var(--muted)",
                        transform: "translateY(-10px)",
                      }}
                    >
                      {h === 0 ? "" : `${String(h).padStart(2, "0")}:00`}
                    </div>
                  ))}
                </div>

                {/* 7 Tages-Spalten */}
                {weekDays.map((d) => {
                  const dayKey = utcDayKey(d);
                  const dayEvents = allEvents.filter(
                    (ev) => utcDayKey(new Date(ev.startUtc)) === dayKey
                  );
                  return (
                    <div key={d.toISOString()} style={{ borderRight: "1px solid var(--border)", position: "relative" }}>
                      {hours.map((h) => (
                        <div
                          key={h}
                          style={{
                            height: HOUR_ROW,
                            borderBottom: "1px solid var(--surface-2)",
                            background: isToday(d) && h === new Date().getHours() ? TODAY_BG : "transparent",
                          }}
                        />
                      ))}

                      {dayEvents.map((ev, i) => {
                        const { top, height } = layoutEvent(ev.startUtc, ev.endUtc);
                        return (
                          <div
                            key={i}
                            title={ev.title}
                            style={{
                              position: "absolute",
                              left: 6,
                              right: 6,
                              top,
                              height,
                              borderRadius: 8,
                              background: "rgba(14,165,233,0.12)",
                              border: "1px solid #bae6fd",
                              overflow: "hidden",
                              display: "flex",
                              alignItems: "center",
                              padding: "2px 6px",
                              fontSize: 12,
                              color: "var(--text)",
                              pointerEvents: "auto",
                            }}
                          >
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {ev.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
            <div ref={dayScrollRef} style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "48px 1fr" }}>
                {/* linke Zeitspalte */}
                <div style={{ borderRight: "1px solid var(--border)", background: "var(--surface-1)" }}>
                  {hours.map((h) => (
                    <div
                      key={h}
                      style={{
                        height: HOUR_ROW,
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "var(--muted)",
                        transform: "translateY(-10px)",
                      }}
                    >
                      {h === 0 ? "" : `${String(h).padStart(2, "0")}:00`}
                    </div>
                  ))}
                </div>

                {/* rechte Tages-Spalte */}
                <div style={{ position: "relative" }}>
                  {hours.map((h) => (
                    <div
                      key={h}
                      style={{
                        height: HOUR_ROW,
                        borderBottom: "1px solid var(--surface-2)",
                        background:
                          isToday(new Date(selectedKey)) && h === new Date().getHours() ? TODAY_BG : "transparent",
                      }}
                    />
                  ))}

                  {allEvents
                    .filter((ev) => utcDayKey(new Date(ev.startUtc)) === utcDayKey(new Date(selectedKey)))
                    .map((ev, i) => {
                      const { top, height } = layoutEvent(ev.startUtc, ev.endUtc);
                      return (
                        <div
                          key={i}
                          title={ev.title}
                          style={{
                            position: "absolute",
                            left: 8,
                            right: 8,
                            top,
                            height,
                            borderRadius: 8,
                            background: "rgba(14,165,233,0.12)",
                            border: "1px solid #bae6fd",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            padding: "2px 6px",
                            fontSize: 12,
                            color: "var(--text)",
                            pointerEvents: "auto",
                          }}
                        >
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {ev.title}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popup: alle Termine des Tages (sortiert) */}
      {moreForDay && moreForDate && (
        <div
          onClick={closeDayPopup}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 24,
            zIndex: 20,
          }}
        >
          <div
            className="card"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 360, maxWidth: "90%", maxHeight: "70%", overflowY: "auto", padding: 12, borderRadius: 12 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>
                {format(moreForDate, "EEEE, d. MMMM yyyy", { locale: de })}
              </div>
              <button onClick={closeDayPopup} aria-label="Schließen"
                style={{ border: "1px solid var(--border)", borderRadius: 8, background: "white", cursor: "pointer", padding: "2px 8px" }}>
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {popupEvents.length === 0 && (
                <div className="muted" style={{ fontSize: 13 }}>Keine weiteren Termine.</div>
              )}
              {popupEvents.map((ev, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 8, alignItems: "center" }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {ev.allDay ? "ganztägig" : `${fmtHM(ev.startUtc)}–${fmtHM(ev.endUtc)}`}
                  </div>
                  <div style={{ fontSize: 14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}