"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Horse = {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  notes?: string;
  avatarUrl?: string;
};

const STORAGE_KEY = "aliments.horses";
const AVATAR = 28;

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

export default function HorsesList() {
  const router = useRouter();
  const [horses, setHorses] = useState<Horse[]>([]);
  const dragFrom = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      setHorses(raw ? JSON.parse(raw) : []);
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function reorder<T>(arr: T[], from: number, to: number) {
    const copy = [...arr];
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    return copy;
  }

  function handleDragStart(i: number) {
    dragFrom.current = i;
    dragging.current = true;
  }
  function handleDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    setOverIndex(i);
  }
  function handleDrop(i: number) {
    const from = dragFrom.current;
    dragFrom.current = null;
    setOverIndex(null);
    dragging.current = false;
    if (from == null || from === i) return;
    const next = reorder(horses, from, i);
    setHorses(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  function handleDragEnd() {
    dragFrom.current = null;
    setOverIndex(null);
    dragging.current = false;
  }

  function openDetail(id: string) {
    if (dragging.current) return; // Klick unterdrücken, wenn gerade gezogen wurde
    router.push(`/horses/${id}`);
  }

  return (
    <aside
      className="card"
      style={{
        position: "relative",
        padding: 10,
        height: "100%",
        minHeight: 0,
        overflowY: "auto", // eigener Scrollcontainer
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "8px 0",
        }}
      >
        <strong>Pferde</strong>
        <a
          href="/horses/new"
          aria-label="Pferd anlegen"
          style={{
            width: 26,
            height: 26,
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--border)",
            textDecoration: "none",
          }}
        >
          +
        </a>
      </div>

      {horses.length === 0 ? (
        <div className="muted">Noch keine Pferde gespeichert.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {horses.map((h, i) => {
            const isOver = overIndex === i;
            return (
              <div
                key={h.id}
                className="card"
                draggable
                onClick={() => openDetail(h.id)}
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                style={{
                  padding: 8,
                  borderRadius: 10,
                  boxShadow: "none",
                  cursor: "pointer",
                  outline: isOver ? "2px solid #0ea5e9" : "none",
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Avatar src={h.avatarUrl} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: 13,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {h.name}
                      </strong>
                      {h.age != null && (
                        <span className="muted" style={{ fontSize: 11 }}>
                          {h.age}
                        </span>
                      )}
                    </div>
                    <div
                      className="muted"
                      style={{
                        marginTop: 3,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {h.breed ?? "Unbekannt"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}