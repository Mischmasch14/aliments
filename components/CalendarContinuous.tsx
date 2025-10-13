"use client";

import { getISOWeek } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDays, addWeeks, addMonths, format,
  isSameMonth, isToday, startOfMonth, startOfWeek,
} from "date-fns";
import { de } from "date-fns/locale";
import { demoEvents } from "@/lib/events";

type DayInfo = { date: Date; key: string; inMonth: boolean; today: boolean; evCount: number; };
type Mode = "day" | "week" | "month";

const DAY_CELL = 100;
const WEEK_GAP = 8;
const TODAY_BG = "var(--today-bg)";
const HOUR_ROW = 56;
const VISIBLE_ROWS = 5;
const MAX_VISIBLE_MONTH_EVENTS = 2;

function isoDateLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function scrollHourIntoView(node: HTMLDivElement | null, hour: number) {
  if (!node) return;
  const target = hour * HOUR_ROW - 2 * HOUR_ROW;
  const max = node.scrollHeight - node.clientHeight;
  node.scrollTop = Math.max(0, Math.min(target, max));
}

export default function CalendarContinuous() {
  const monthScrollRef = useRef<HTMLDivElement | null>(null);
  const dayScrollRef   = useRef<HTMLDivElement | null>(null);
  const weekScrollRef  = useRef<HTMLDivElement | null>(null);
  const lastScrollTop  = useRef(0);
  const isAutoScroll   = useRef(false);

  const [mode, setMode] = useState<Mode>("month");
  const baseWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const [headWeeks, setHeadWeeks] = useState(0);
  const [tailWeeks, setTailWeeks] = useState(12);

  const [currentIso, setCurrentIso] = useState<string>(isoDateLocal(new Date()));
  const [selectedKey, setSelectedKey] = useState<string>(isoDateLocal(new Date()));

  const eventsByDay = useMemo(() => {
    const m = new Map<string, any[]>();
    for (const ev of demoEvents) {
      const k = new Date(ev.startUtc).toISOString().slice(0, 10);
      m.set(k, [...(m.get(k) ?? []), ev]);
    }
    return m;
  }, []);

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
          date: d, key,
          inMonth: isSameMonth(d, monthRef),
          today: isToday(d),
          evCount: (eventsByDay.get(key) ?? []).length,
        });
      }
      arr.push(row);
    }
    return arr;
  }, [baseWeek, headWeeks, tailWeeks, eventsByDay]);

  function updateHeaderSymmetricContentCoords() {
    const el = monthScrollRef.current;
    if (!el) return;

    const containerRect = el.getBoundingClientRect();
    const firstWeek = el.querySelector<HTMLDivElement>("[data-week-start]");
    if (!firstWeek) return;

    const rowH = firstWeek.getBoundingClientRect().height;
    const scrollTop = el.scrollTop;

    const secondRowTopContent = scrollTop + rowH + WEEK_GAP;
    const bandMidContent = secondRowTopContent + rowH / 2;

    const anchors = Array.from(
      el.querySelectorAll<HTMLDivElement>('[data-day="1"][data-date]')
    );
    if (anchors.length === 0) return;

    let bestIso: string | null = null;
    let bestY = -Infinity;

    for (const a of anchors) {
      const r = a.getBoundingClientRect();
      const centerContent = scrollTop + (r.top - containerRect.top) + r.height / 2;
      if (centerContent <= bandMidContent && centerContent > bestY) {
        bestY = centerContent; bestIso = a.dataset.date ?? null;
      }
    }
    if (!bestIso) {
      let minY = Infinity; let iso: string | null = null;
      for (const a of anchors) {
        const r = a.getBoundingClientRect();
        const centerContent = scrollTop + (r.top - containerRect.top) + r.height / 2;
        if (centerContent < minY) { minY = centerContent; iso = a.dataset.date ?? null; }
      }
      bestIso = iso;
    }
    if (bestIso && bestIso !== currentIso) setCurrentIso(bestIso);
  }

  function onMonthScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const st = el.scrollTop;
    const goingUp = st < lastScrollTop.current;
    lastScrollTop.current = st;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200)
      setTailWeeks((t) => t + 8);

    if (el.scrollTop < 120 && goingUp) {
      const prev = el.scrollHeight;
      setHeadWeeks((h) => h - 8);
      requestAnimationFrame(() => {
        const n = monthScrollRef.current;
        if (!n) return;
        const diff = n.scrollHeight - prev;
        n.scrollTop += diff;
        updateHeaderSymmetricContentCoords();
      });
    } else {
      updateHeaderSymmetricContentCoords();
    }
  }

  useEffect(() => {
    if (mode !== "month") return;
    const id = requestAnimationFrame(updateHeaderSymmetricContentCoords);
    return () => cancelAnimationFrame(id);
  }, [mode, monthWeeks.length]);

  const monthLabel = format(addMonths(new Date(currentIso), 1), "MMMM yyyy", { locale: de });

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

  function findWeekRow(el: HTMLDivElement, cell: HTMLDivElement) {
    let row: HTMLElement | null = cell;
    while (row && row !== el && !(row instanceof HTMLElement && row.hasAttribute("data-week-start"))) {
      row = row.parentElement as HTMLElement | null;
    }
    return row as HTMLDivElement | null;
  }
  function targetTopWithin(el: HTMLDivElement, rowH: number) {
    const blockH = 5 * rowH + 4 * WEEK_GAP;
    return Math.max(0, Math.floor((el.clientHeight - blockH) / 2));
  }
  function scrollRowTo(el: HTMLDivElement, row: HTMLDivElement, topWithin: number) {
    const containerRect = el.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const rowTopWithin = rowRect.top - containerRect.top;
    isAutoScroll.current = true;
    el.scrollTop = el.scrollTop + (rowTopWithin - topWithin);
    lastScrollTop.current = el.scrollTop;
    requestAnimationFrame(() => { isAutoScroll.current = false; updateHeaderSymmetricContentCoords(); });
  }
  function scrollDateCentered(d: Date) {
    const el = monthScrollRef.current; if (!el) return;
    const key = isoDateLocal(d);
    const cell = el.querySelector<HTMLDivElement>(`[data-date="${key}"]`); if (!cell) return;
    const row = findWeekRow(el, cell); if (!row) return;
    const rowH = row.getBoundingClientRect().height;
    scrollRowTo(el, row, targetTopWithin(el, rowH));
  }
  function scrollMonthFirstCentered(monthDate: Date) {
    const el = monthScrollRef.current; if (!el) return;
    const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const key = isoDateLocal(first);
    const cell = el.querySelector<HTMLDivElement>(`[data-date="${key}"]`); if (!cell) return;
    const row = findWeekRow(el, cell); if (!row) return;
    const rowH = row.getBoundingClientRect().height;
    scrollRowTo(el, row, targetTopWithin(el, rowH));
  }

  function scrollToDate(target: Date) {
    const key = isoDateLocal(target);
    if (mode !== "month") { setSelectedKey(key); return; }
    setSelectedKey(key);
    setHeadWeeks(h => h - 8);
    setTailWeeks(t => t + 8);
    requestAnimationFrame(() => {
      const el = monthScrollRef.current; if (!el) return;
      const cell = el.querySelector<HTMLDivElement>(`[data-date="${key}"]`); if (!cell) return;
      const row = findWeekRow(el, cell); if (!row) return;
      const rowH = row.getBoundingClientRect().height;
      const desiredTop = targetTopWithin(el, rowH) + rowH + WEEK_GAP; // zweite Zeile
      scrollRowTo(el, row, desiredTop);
      requestAnimationFrame(() => { scrollRowTo(el, row, desiredTop); });
    });
  }
  function goPrev() {
    if (mode === "day") {
      setSelectedKey(isoDateLocal(addDays(new Date(selectedKey), -1)));
    } else if (mode === "week") {
      setSelectedKey(isoDateLocal(addDays(new Date(selectedKey), -7)));
    } else {
      const anchor = new Date(selectedKey);
      const targetMonth = addMonths(anchor, -1);
      const first = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
      setHeadWeeks(h => h - 16);
      setSelectedKey(isoDateLocal(first));
      requestAnimationFrame(() => { requestAnimationFrame(() => { scrollMonthFirstCentered(first); }); });
    }
  }
  function goNext() {
    if (mode === "day") {
      setSelectedKey(isoDateLocal(addDays(new Date(selectedKey), 1)));
    } else if (mode === "week") {
      setSelectedKey(isoDateLocal(addDays(new Date(selectedKey), 7)));
    } else {
      const anchor = new Date(selectedKey);
      const targetMonth = addMonths(anchor, 1);
      const first = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
      setTailWeeks(t => t + 16);
      setSelectedKey(isoDateLocal(first));
      requestAnimationFrame(() => { requestAnimationFrame(() => { scrollMonthFirstCentered(first); }); });
    }
  }

  useEffect(() => {
    if (mode !== "day") return;
    const nowHour = new Date().getHours();
    requestAnimationFrame(() => { scrollHourIntoView(dayScrollRef.current, nowHour); });
  }, [mode, selectedKey]);
  useEffect(() => {
    if (mode !== "week") return;
    const nowHour = new Date().getHours();
    requestAnimationFrame(() => { scrollHourIntoView(weekScrollRef.current, nowHour); });
  }, [mode, weekStartSelected]);
  useEffect(() => {
    if (mode !== "month") return;
    const el = monthScrollRef.current;
    if (el) lastScrollTop.current = el.scrollTop;
    requestAnimationFrame(() => { scrollDateCentered(new Date(selectedKey)); });
  }, [mode, selectedKey]);

  const leftTitle =
    mode === "day"
      ? format(selectedDate, "EEEE, d. MMMM yyyy", { locale: de })
      : mode === "week"
      ? format(weekStartSelected, "MMMM yyyy", { locale: de })
      : monthLabel;

  return (
    <div className="calendar card" style={{
      padding: "0 12px 12px",
      display: "flex", flexDirection: "column", height: "100%",
    }}>
      {/* Kopfzeile */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        margin: "8px 0",
        color: "var(--text)"
      }}>
        <div style={{ fontWeight: 600 }}>{leftTitle}</div>

        <div style={{ justifySelf: "center", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={goPrev}
            aria-label="Zurück"
            style={{ padding: "6px 10px", border: `1px solid var(--border)`, borderRadius: 8, background: "var(--surface-0)", cursor: "pointer", color:"var(--text)" }}>
            ←
          </button>

          <div role="tablist" aria-label="Ansicht" style={{
            display: "inline-flex",
            background: "var(--surface-2)",
            border: `1px solid var(--border)`,
            borderRadius: 9999,
            padding: 4, gap: 4,
          }}>
            {(["day","week","month"] as Mode[]).map((m) => {
              const active = mode === m;
              const label = m === "day" ? "Tag" : m === "week" ? "Woche" : "Monat";
              return (
                <button key={m} onClick={() => setMode(m)} role="tab" aria-selected={active}
                  style={{
                    minWidth: 72, padding: "6px 10px", border: "none", borderRadius: 9999,
                    background: active ? "var(--surface-0)" : "transparent",
                    boxShadow: active ? "0 1px 1px rgba(0,0,0,0.04)" : "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    color: active ? "var(--text)" : "var(--muted)",
                    borderLeft: active ? `1px solid var(--border)` : "none",
                    borderRight: active ? `1px solid var(--border)` : "none",
                  }}>
                  {label}
                </button>
              );
            })}
          </div>

          <button onClick={goNext}
            aria-label="Weiter"
            style={{ padding: "6px 10px", border: `1px solid var(--border)`, borderRadius: 8, background: "var(--surface-0)", cursor: "pointer", color:"var(--text)" }}>
            →
          </button>
        </div>

        <div style={{ justifySelf: "end", display:"flex", gap:8 }}>
          <button
            onClick={() => scrollToDate(new Date())}
            style={{
              padding: "8px 12px",
              border: `1px solid var(--border)`,
              borderRadius: 8,
              background: "var(--surface-0)",
              cursor: "pointer",
              color: "var(--text)",
              fontWeight: 600,
            }}
          >
            Heute
          </button>

          {/* Plus-Button → deinen Handler einfügen */}
          <button
            onClick={() => {/* setForm / setShowNew */}}
            aria-label="Neuen Termin anlegen"
            style={{
              width: 36, height: 36,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              border: `1px solid var(--border)`, borderRadius: 9999,
              background: "var(--surface-0)", cursor: "pointer", color: "var(--icon)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Kopfleiste */}
      <div className="card" style={{ padding: 8, marginBottom: 8 }}>
        {mode === "day" ? (
          <div style={{ height: 21, display: "flex", alignItems: "center", gap: 8, overflowX: "auto" }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>To Do</span>
          </div>
        ) : mode === "week" ? (
          <div style={{ display: "grid", gridTemplateColumns: "48px repeat(7, 1fr)", gap: 0 }}>
            <div style={{ textAlign: "left", fontSize: 12, color: "var(--muted)", padding: 0, transform: "translateY(1px) translateX(-2px)" }}>
              KW {getISOWeek(weekStartSelected)}
            </div>
            {weekDays.map((d) => {
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
            {["Mo","Di","Mi","Do","Fr","Sa","So"].map((d) => (
              <div key={d} className="muted" style={{ textAlign: "center" }}>{d}</div>
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
            style={{ height: "100%", overflowY: "auto", padding: 8, paddingRight: 12, paddingBottom: 24 }}
            aria-label="Kalender (Monat, kontinuierlich)"
          >
            <div style={{ display: "grid", gap: WEEK_GAP }}>
              {monthWeeks.map((row) => (
                <div key={row[0].key + "_week"} data-week-start={row[0].key}
                  style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                  {row.map((d) => {
                    const isFirstOfMonth = d.date.getDate() === 1;
                    const bg = isToday(d.date) ? TODAY_BG : "var(--surface-0)";
                    const list = eventsByDay.get(d.key) ?? [];
                    const extra = Math.max(0, list.length - MAX_VISIBLE_MONTH_EVENTS);
                    return (
                      <div
                        key={d.key}
                        data-date={d.key}
                        data-day={String(d.date.getDate())}
                        onClick={() => { setSelectedKey(d.key); setMode("day"); }}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)")}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)")}
                        style={{
                          padding: 10,
                          height: DAY_CELL,
                          cursor: "pointer",
                          userSelect: "none",
                          background: bg,
                          border: "1px solid var(--border)",
                          borderRadius: 10,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                          outline: "none",
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span className="muted" style={{ fontSize: 12, fontWeight: 600, visibility: isFirstOfMonth ? "visible" : "hidden" }}>
                            {isFirstOfMonth ? format(d.date, "MMMM", { locale: de }) : "—"}
                          </span>
                          <span className="muted" style={{ fontSize: 12 }}>{format(d.date, "d")}</span>
                        </div>

                        {list.slice(0, MAX_VISIBLE_MONTH_EVENTS).map((ev: any) => (
                          <div key={ev.id}
                            style={{
                              fontSize: 11, padding: "2px 6px", borderRadius: 6,
                              background: "var(--chip-bg)", color: "var(--chip-text)",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                            {ev.title}
                          </div>
                        ))}

                        {extra > 0 && (
                          <span style={{
                            position: "absolute", right: 6, bottom: 6,
                            fontSize: 11, color: "var(--muted)",
                            background: "rgba(255,255,255,0.7)",
                            border: "1px solid var(--border)",
                            borderRadius: 8, padding: "1px 6px",
                          }}>
                            +{extra}
                          </span>
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
                <div style={{ borderRight: "1px solid var(--border)", background: "var(--surface-1)" }}>
                  {hours.map((h) => (
                    <div key={h} style={{
                      height: HOUR_ROW, display: "flex", alignItems: "flex-start", justifyContent: "center",
                      padding: 0, fontSize: 12, color: "var(--muted)", transform: "translateY(-10px)",
                    }}>
                      {h === 0 ? "" : `${String(h).padStart(2, "0")}:00`}
                    </div>
                  ))}
                </div>
                {weekDays.map((d) => (
                  <div key={d.toISOString()} style={{ borderRight: "1px solid var(--border)" }}>
                    {hours.map((h) => (
                      <div key={h} style={{
                        height: HOUR_ROW,
                        borderBottom: "1px solid var(--surface-2)",
                        background: isToday(d) && h === new Date().getHours() ? TODAY_BG : "transparent",
                      }}/>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
            <div ref={dayScrollRef} style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "48px 1fr" }}>
                <div style={{ borderRight: "1px solid var(--border)", background: "var(--surface-1)" }}>
                  {hours.map((h) => (
                    <div key={h} style={{
                      height: HOUR_ROW, display: "flex", alignItems: "flex-start", justifyContent: "center",
                      padding: 0, fontSize: 12, color: "var(--muted)", transform: "translateY(-10px)",
                    }}>
                      {h === 0 ? "" : `${String(h).padStart(2, "0")}:00`}
                    </div>
                  ))}
                </div>
                <div>
                  {hours.map((h) => (
                    <div key={h} style={{
                      height: HOUR_ROW,
                      borderBottom: "1px solid var(--surface-2)",
                      background: isToday(selectedDate) && h === new Date().getHours() ? TODAY_BG : "transparent",
                    }}/>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}