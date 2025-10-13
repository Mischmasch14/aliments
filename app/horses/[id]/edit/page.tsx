"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Horse } from "@/types/horse";

const STORAGE_KEY = "aliments.horses";

export default function EditHorsePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [list, setList] = useState<Horse[]>([]);
  const [data, setData] = useState<{ name: string; breed: string; age: string; notes: string }>({
    name: "", breed: "", age: "", notes: ""
  });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const l: Horse[] = raw ? JSON.parse(raw) : [];
    setList(l);
    const h = l.find(x => x.id === id);
    if (h) {
      setData({
        name: h.name ?? "",
        breed: h.breed ?? "",
        age: h.age != null ? String(h.age) : "",
        notes: h.notes ?? "",
      });
    }
  }, [id]);

  const exists = useMemo(() => list.some(h => h.id === id), [list, id]);
  if (!exists) {
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

  function onChange<K extends keyof typeof data>(k: K, v: string) { setData(d => ({ ...d, [k]: v })); }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ageNum = data.age.trim() === "" ? undefined : Number(data.age);
    if (ageNum !== undefined && Number.isNaN(ageNum)) {
      alert("Bitte eine Zahl für Alter eingeben."); return;
    }
    const next = list.map(h => h.id === id ? {
      ...h,
      name: data.name.trim(),
      breed: data.breed.trim() || undefined,
      age: ageNum,
      notes: data.notes.trim() || undefined,
    } : h);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    router.push(`/horses/${id}`);
  }

  return (
    <section className="container" style={{ display:"grid", gap:12, maxWidth:520 }}>
      <h1>Pferd bearbeiten</h1>
      <form onSubmit={onSubmit} className="card" style={{ display:"grid", gap:12 }}>
        <label>
          <div className="muted">Name *</div>
          <input value={data.name} onChange={e => onChange("name", e.target.value)}
                 required style={{ width:"100%", padding:10, border:"1px solid var(--border)", borderRadius:8 }}/>
        </label>
        <label>
          <div className="muted">Rasse</div>
          <input value={data.breed} onChange={e => onChange("breed", e.target.value)}
                 style={{ width:"100%", padding:10, border:"1px solid var(--border)", borderRadius:8 }}/>
        </label>
        <label>
          <div className="muted">Alter (Jahre)</div>
          <input value={data.age} onChange={e => onChange("age", e.target.value)} inputMode="numeric"
                 style={{ width:"100%", padding:10, border:"1px solid var(--border)", borderRadius:8 }}/>
        </label>
        <label>
          <div className="muted">Notizen</div>
          <textarea rows={4} value={data.notes} onChange={e => onChange("notes", e.target.value)}
                    style={{ width:"100%", padding:10, border:"1px solid var(--border)", borderRadius:8, resize:"vertical" }}/>
        </label>

        <div style={{ display:"flex", gap:8 }}>
          <button type="submit"
                  style={{ padding:"10px 14px", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer" }}>
            Speichern
          </button>
          <button type="button" onClick={() => router.push(`/horses/${id}`)}
                  style={{ padding:"10px 14px", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer" }}>
            Abbrechen
          </button>
        </div>
      </form>
    </section>
  );
}