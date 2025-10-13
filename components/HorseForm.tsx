"use client";

import { useState } from "react";
import type { Horse } from "@/types/horse"; // Falls Alias nicht geht: ../types/horse

const STORAGE_KEY = "aliments.horses";
const DEFAULT_AVATAR = "/horse-default.png";

type FormData = {
  name: string;
  breed: string;
  age: string;   // Text, wir parsen beim Speichern
  notes: string;
};

export default function HorseForm() {
  const [data, setData] = useState<FormData>({
    name: "",
    breed: "",
    age: "",
    notes: "",
  });

  function onChange<K extends keyof FormData>(key: K, value: string) {
    setData(d => ({ ...d, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const ageNum = data.age.trim() === "" ? undefined : Number(data.age);
    if (ageNum !== undefined && Number.isNaN(ageNum)) {
      alert("Bitte eine Zahl für Alter eingeben.");
      return;
    }

    const newHorse: Horse = {
      id: `h_${Date.now().toString(36)}`,
      name: data.name.trim(),
      breed: data.breed.trim() || undefined,
      age: ageNum,
      notes: data.notes.trim() || undefined,
      avatarUrl: DEFAULT_AVATAR, // <- Standardbild setzen
    };

    const raw = localStorage.getItem(STORAGE_KEY);
    const list: Horse[] = raw ? JSON.parse(raw) : [];
    list.push(newHorse);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

    alert("Pferd gespeichert.");
    setData({ name: "", breed: "", age: "", notes: "" });
  }

  return (
    <form onSubmit={onSubmit} className="card" style={{ display:"grid", gap:12, maxWidth:520 }}>
      <h2>Pferdeprofil anlegen</h2>

      <label>
        <div className="muted">Name *</div>
        <input
          value={data.name}
          onChange={e => onChange("name", e.target.value)}
          required
          placeholder="z. B. Atlas"
          style={{ width:"100%", padding:10, border:"1px solid var(--border)", borderRadius:8 }}
        />
      </label>

      <label>
        <div className="muted">Rasse</div>
        <input
          value={data.breed}
          onChange={e => onChange("breed", e.target.value)}
          placeholder="z. B. Trakehner"
          style={{ width:"100%", padding:10, border:"1px solid var(--border)", borderRadius:8 }}
        />
      </label>

      <label>
        <div className="muted">Alter (Jahre)</div>
        <input
          value={data.age}
          onChange={e => onChange("age", e.target.value)}
          inputMode="numeric"
          placeholder="z. B. 6"
          style={{ width:"100%", padding:10, border:"1px solid var(--border)", borderRadius:8 }}
        />
      </label>

      <label>
        <div className="muted">Notizen</div>
        <textarea
          value={data.notes}
          onChange={e => onChange("notes", e.target.value)}
          rows={4}
          placeholder="z. B. sensibel, mag Training am Vormittag"
          style={{ width:"100%", padding:10, border:"1px solid var(--border)", borderRadius:8, resize:"vertical" }}
        />
      </label>

      <div style={{ display:"flex", gap:8 }}>
        <button type="submit" style={{ padding:"10px 14px", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer" }}>
          Speichern
        </button>
        <button type="reset" onClick={() => setData({ name:"", breed:"", age:"", notes:"" })} style={{ padding:"10px 14px", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer" }}>
          Zurücksetzen
        </button>
      </div>
    </form>
  );
}