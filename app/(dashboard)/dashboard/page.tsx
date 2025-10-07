import HorseCard from "@/components/HorseCard";







export default function Page() {
    const horses = [
      { id: "1", name: "Pferd A", coat: "Fuchs", alerts: 0 },
      { id: "2", name: "Pferd B", coat: "Rappe", alerts: 2 },
      { id: "3", name: "Pferd C", coat: "Schimmel", alerts: 1 },
    ];
    return (
      <main className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {horses.map((h) => (
    <HorseCard key={h.id} name={h.name} coat={h.coat} alerts={h.alerts} />
  ))}
</section>

      </main>
    );
  }
  