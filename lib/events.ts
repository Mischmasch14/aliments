// lib/events.ts
export type Event = {
    id: string;
    title: string;
    startUtc: string; // ISO in UTC
    endUtc: string;   // ISO in UTC
  };
  
  export const demoEvents: Event[] = [
    { id: "e1", title: "Fütterung Atlas", startUtc: "2025-10-09T07:00:00Z", endUtc: "2025-10-09T07:15:00Z" },
    { id: "e2", title: "Training Freya",  startUtc: "2025-10-09T15:00:00Z", endUtc: "2025-10-09T16:00:00Z" },
    { id: "e3", title: "Schmied Luna",    startUtc: "2025-10-12T09:30:00Z", endUtc: "2025-10-12T10:00:00Z" },
  ];
  