import HorseForm from "@/components/HorseForm";
// Fallback, wenn @-Alias bei dir nicht geht:
// import HorseForm from "../../../components/HorseForm";

export default function NewHorsePage() {
  return (
    <section className="container" style={{ display:"grid", gap:16 }}>
      <h1>Neues Pferd</h1>
      <HorseForm />
    </section>
  );
}
