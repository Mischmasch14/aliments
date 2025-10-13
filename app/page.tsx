import HorseCard from "@/components/HorseCard";
import { demoHorses } from "@/lib/demoHorses";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>aliments</h1>
      <div className="grid">
  {demoHorses.map(h => <HorseCard key={h.id} horse={h} />)}
</div>

    </main>
  );
}

