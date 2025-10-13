"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SIDEBAR_W = 320; // gleiche Breite wie Pferdeliste

export default function TopSwitch() {
  const path = usePathname();
  const tabs = [
    { href: "/uebersicht", label: "Kalender" },
    { href: "/training",   label: "Training" },
    { href: "/fuetterung", label: "Fütterung" },
  ];

  return (
    <nav
      aria-label="Bereiche"
      style={{
        width: SIDEBAR_W,
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        padding: 6,
        display: "flex",
        gap: 6,
      }}
    >
      {tabs.map(t => {
        const active = path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            style={{
                flex: 1,                 // gleiche Breite
                minWidth: 0,             // sauberes Shrinken
                whiteSpace: "nowrap",    // kein Zeilenumbruch
                textAlign: "center",
                padding: "10px 12px",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 600,
                color: "#6b7280",
                background: active ? "#fff" : "transparent",
                border: active ? "1px solid #e5e7eb" : "1px solid transparent",
                boxShadow: active ? "0 1px 1px rgba(0,0,0,0.04)" : "none",
              
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}