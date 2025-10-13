import type { Horse } from "../types/horse";

export default function HorseCard({ horse }: { horse: Horse }) {
  return (
    <div className="card">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
        <strong>{horse.name}</strong>
        {horse.age != null && <span className="muted">{horse.age} Jahre</span>}
      </div>
      <div className="muted" style={{ marginTop: 6 }}>
        {horse.breed ?? "Unbekannte Rasse"}
      </div>
      {horse.notes && (
        <div style={{ marginTop: 10 }}>{horse.notes}</div>
      )}
    </div>
  );
}

