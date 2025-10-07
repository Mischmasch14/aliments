type HorseCardProps = {
    name: string;
    coat?: string;
    avatarUrl?: string;
    alerts?: number;
  };
  
  export default function HorseCard({ name, coat, avatarUrl, alerts = 0 }: HorseCardProps) {
    return (
      <div className="rounded-2xl border shadow-sm p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200" />
          )}
          <div>
            <div className="font-medium">{name}</div>
            {coat && <div className="text-sm text-gray-500">Fell: {coat}</div>}
          </div>
        </div>
  
        <div className="text-sm text-gray-500">Nächste Termine: –</div>
  
        <div className="mt-1 flex gap-2">
          <button type="button" className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">Termin setzen</button>
          <button type="button" className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">Training protokollieren</button>
        </div>
  
        {alerts > 0 && <div className="text-xs text-red-600">{alerts} Hinweis(e)</div>}
      </div>
    );
  }
  