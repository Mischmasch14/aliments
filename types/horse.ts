export type Horse = {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  notes?: string;

  // neu für Profilbild und spätere Individualisierung
  avatarUrl?: string;          
  coatColor?: string;          
  markings?: string;           
  forelockLength?: "kurz" | "mittel" | "lang";
  forelockDensity?: "wenig" | "mittel" | "viel";
};