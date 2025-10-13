"use client";
import { useEffect, useMemo, useState } from "react";
import { applyPalette, buildPalette, DEFAULT_RGB, loadBaseRGB, saveBaseRGB } from "@/lib/theme";

export default function ColorSliders() {
  const [r, setR] = useState(DEFAULT_RGB.r);
  const [g, setG] = useState(DEFAULT_RGB.g);
  const [b, setB] = useState(DEFAULT_RGB.b);

  // beim Mount gespeicherten Wert laden und anwenden
  useEffect(() => {
    const saved = loadBaseRGB();
    const base = saved ?? DEFAULT_RGB;
    setR(base.r); setG(base.g); setB(base.b);
    applyPalette(buildPalette(base));
  }, []);

  const base = useMemo(() => ({ r, g, b }), [r,g,b]);

  function update(nr?: number, ng?: number, nb?: number) {
    const next = { r: nr ?? r, g: ng ?? g, b: nb ?? b };
    applyPalette(buildPalette(next));
    saveBaseRGB(next);
    setR(next.r); setG(next.g); setB(next.b);
  }

  const hex = "#" + [r,g,b].map(v => v.toString(16).padStart(2,"0")).join("");

  return (
    <div className="card" style={{ padding: 16, display:"grid", gap:16 }}>
      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        <div style={{
          width:48, height:48, borderRadius:8, border:"1px solid var(--border)",
          background: hex, boxShadow:"inset 0 0 0 1px rgba(0,0,0,0.04)"
        }} />
        <div style={{ fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace" }}>
          <div style={{ color:"var(--text)", fontWeight:700 }}>{hex.toUpperCase()}</div>
          <div className="muted">RGB {r}, {g}, {b}</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button
            onClick={() => update(DEFAULT_RGB.r, DEFAULT_RGB.g, DEFAULT_RGB.b)}
            style={{ padding:"6px 10px", border:"1px solid var(--border)", borderRadius:8, background:"var(--surface-0)", cursor:"pointer", color:"var(--text)" }}
          >
            Reset
          </button>
        </div>
      </div>

      {([
        { label:"R", value:r, set:setR, color:"#fca5a5" },
        { label:"G", value:g, set:setG, color:"#86efac" },
        { label:"B", value:b, set:setB, color:"#93c5fd" },
      ] as const).map(ch => (
        <div key={ch.label} style={{ display:"grid", gridTemplateColumns:"28px 1fr 56px", gap:8, alignItems:"center" }}>
          <label className="muted" style={{ textAlign:"right" }}>{ch.label}</label>
          <input
            type="range" min={0} max={255} value={ch.value}
            onChange={e => update(ch.label==="R"? +e.target.value : undefined,
                                  ch.label==="G"? +e.target.value : undefined,
                                  ch.label==="B"? +e.target.value : undefined)}
            style={{ accentColor: ch.color }}
          />
          <input
            type="number" min={0} max={255} value={ch.value}
            onChange={e => update(ch.label==="R"? +e.target.value : undefined,
                                  ch.label==="G"? +e.target.value : undefined,
                                  ch.label==="B"? +e.target.value : undefined)}
            style={{ width:56, padding:"6px 8px", border:"1px solid var(--border)", borderRadius:8, background:"var(--surface-0)", color:"var(--text)" }}
          />
        </div>
      ))}

      {/* Vorschau der Palette */}
      <div>
        <div className="muted" style={{ marginBottom:8 }}>Palette</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(10, 1fr)", gap:6 }}>
          {["--brand-50","--brand-100","--brand-200","--brand-300","--brand-400","--brand-500","--brand-600","--brand-700","--brand-800","--brand-900"].map(k => (
            <div key={k} title={k}
              style={{ height:24, borderRadius:6, border:"1px solid var(--border)", background:`var(${k})` }} />
          ))}
        </div>
      </div>
    </div>
  );
}