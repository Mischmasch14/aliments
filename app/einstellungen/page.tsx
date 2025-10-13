import ColorSliders from "@/components/ColorSliders";

export default function EinstellungenPage() {
  return (
    <div style={{ padding:16 }}>
      <h1 style={{ margin:"8px 0 16px", fontSize:18, color:"var(--text)" }}>Farben</h1>
      <ColorSliders />
      <p className="muted" style={{ marginTop:12 }}>
       
      </p>
    </div>
  );
}