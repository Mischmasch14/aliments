"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Horse } from "@/types/horse";

const STORAGE_KEY = "aliments.horses";

export default function HorseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [list, setList] = useState<Horse[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    setList(raw ? JSON.parse(raw) : []);
  }, []);

  const horse = useMemo(() => list.find(h => h.id === id), [list, id]);

  if (!horse) {
    return (
      <section className="container" style={{ display:"grid", gap:12 }}>
        <h1>Pferd nicht gefunden</h1>
        <button onClick={() => router.push("/uebersicht")}
          style={{ padding:"10px 14px", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer" }}>
          Zur Übersicht
        </button>
      </section>
    );
  }

  // Ab hier ist horse sicher vorhanden
  const horseId = horse.id;
  const horseName = horse.name;

  function deleteHorse() {
    if (!confirm(`„${horseName}“ wirklich löschen?`)) return;
    const next = list.filter(h => h.id !== horseId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    router.push("/uebersicht");
  }

  function editHorse() {
    router.push(`/horses/${horseId}/edit`);
  }

  return (
    <section className="container" style={{ display:"grid", gap:12, maxWidth:640 }}>
      <h1>{horseName}</h1>

      <div className="card" style={{ display:"grid", gap:8, padding:12 }}>
        <div><strong>Rasse:</strong> {horse.breed ?? "Unbekannt"}</div>
        <div><strong>Alter:</strong> {horse.age ?? "-"}</div>
        {horse.notes ? <div><strong>Notizen:</strong> {horse.notes}</div> : null}
      </div>

      <div style={{ display:"flex", gap:8 }}>
        <button onClick={editHorse}
          style={{ padding:"10px 14px", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer" }}>
          Bearbeiten
        </button>
        <button onClick={deleteHorse}
          style={{ padding:"10px 14px", border:"1px solid #ef4444", background:"#fee2e2",
                   borderRadius:8, cursor:"pointer" }}>
          Löschen
        </button>
        <button onClick={() => router.push("/uebersicht")}
          style={{ padding:"10px 14px", border:"1px solid var(--border)", borderRadius:8, marginLeft:"auto", cursor:"pointer" }}>
          Zur Übersicht
        </button>
      </div>
    </section>
  );
}