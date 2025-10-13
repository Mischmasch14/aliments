import { NextResponse } from "next/server";
import { demoEvents } from "@/lib/events";

function icsEscape(s: string) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function dt(isoUtc: string) {
  const d = new Date(isoUtc);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

export async function GET() {
  const nowIso = new Date().toISOString();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//aliments//calendar//DE",
    ...demoEvents.flatMap((ev) => [
      "BEGIN:VEVENT",
      `UID:${icsEscape(ev.id)}@aliments`,
      `DTSTAMP:${dt(nowIso)}`,
      `DTSTART:${dt(ev.startUtc)}`,
      `DTEND:${dt(ev.endUtc)}`,
      `SUMMARY:${icsEscape(ev.title)}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="aliments.ics"',
      "Cache-Control": "no-cache",
    },
  });
}
