"use client";

import { useEffect, useRef, useState } from "react";
import { addMonths, startOfMonth } from "date-fns";
import Month from "@/components/Month";

export default function CalendarScroll() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState(12);
  const [head, setHead] = useState(0);
  const base = startOfMonth(new Date());

  // unten nachladen
  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget; // nie null
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
      setCount(c => c + 6);
    }
  }

  // oben voranstellen und Position halten
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTop = () => {
      if (el.scrollTop < 120 && head > -12) {
        const prevHeight = el.scrollHeight;
        setHead(h => h - 6);
        requestAnimationFrame(() => {
          const n = containerRef.current!;
          const diff = n.scrollHeight - prevHeight;
          n.scrollTop += diff;
        });
      }
    };

    el.addEventListener("scroll", handleTop);
    return () => {
      el.removeEventListener("scroll", handleTop);
    };
  }, [head]);

  const months: Date[] = [];
  for (let i = head; i < head + count; i++) months.push(addMonths(base, i));

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      style={{ height: 720, overflowY: "auto", display: "grid", gap: 12, paddingRight: 4 }}
      aria-label="Kalender (scrollbar)"
    >
      {months.map(m => <Month key={m.toISOString()} monthDate={m} />)}
    </div>
  );
}