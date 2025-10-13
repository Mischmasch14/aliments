"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Horse = {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  notes?: string;
  avatarUrl?: string;
};

const STORAGE_KEY = "aliments.horses";
const AVATAR = 28; // <- Hier Größe ändern (z. B. 24, 28, 32)

function Avatar({ src }: { src?: string }) {
  return (
    <span
      style={{
        width: AVATAR,
        height: AVATAR,
        borderRadius: 9999,
        overflow: "hidden",
        display: "inline-block",
        border: "1px solid var(--border)",
        flex: `0 0 ${AVATAR}px`,
      }}
    >
      <img
        src={src ?? "/horse-default.png"}
        alt=""
        width={AVATAR}
        height={AVATAR}
        style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
      />
    </span>
  );
}

export default function HorsesBar() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const dragFrom = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      setHorses(raw ? JSON.parse(raw) : []);
    };
    load();
    const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) load(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function reorder<T>(arr: T[], from: number, to: number) {
    const copy = [...arr];
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    return copy;
  }

  function handleDragStart(i: number) { dragFrom.current = i; }
  function handleDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setOverIndex(i); }
  function handleDrop(i: number) {
    const from = dragFrom.current; dragFrom.current = null; setOverIndex(null);
    if (from == null || from === i) return;
    const next = reorder(horses, from, i);
    setHorses(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  function handleDragEnd() { dragFrom.current = null; setOverIndex(null); }

  return (
    <div className="card" style={{ position: "relative", padding: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8 }}>
        {horses.length === 0 ? (
          <div className="muted" style={{ gridColumn: "1 / -1" }}>Noch keine Pferde gespeichert.</div>
        ) : (
          horses.map((h, i) => {
            const isOver = overIndex === i;
            return (
              <div
                key={h.id}
                className="card"
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                style={{ padding: 8, borderRadius: 10, boxShadow: "none", cursor: "grab", outline: isOver ? "2px solid #0ea5e9" : "none" }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center", minHeight: AVATAR }}>
                  <Avatar src={h.avatarUrl} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <strong style={{ fontSize: 13 }}>{h.name}</strong>
                      {h.age != null && <span className="muted" style={{ fontSize: 11 }}>{h.age}</span>}
                    </div>
                    <div className="muted" style={{ marginTop: 3, fontSize: 11 }}>
                      {h.breed ?? "Unbekannt"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Link
        href="/horses/new"
        aria-label="Pferd anlegen"
        style={{
          position: "absolute",
          right: 8,
          bottom: 8,
          width: 28,
          height: 28,
          borderRadius: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--border)",
          background: "var(--panel)",
          boxShadow: "var(--shadow)",
          textDecoration: "none",
          fontSize: 18,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        +
      </Link>
    </div>
  );
}