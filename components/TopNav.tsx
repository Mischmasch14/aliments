"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const path = usePathname();
  const items = [
    { href: "/uebersicht", label: "Übersicht" },
    { href: "/training",   label: "Training" },
    { href: "/fuetterung", label: "Fütterung" },
  ];
  return (
    <nav style={{ display: "flex", gap: 16 }}>
      {items.map(it => {
        const active = path.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            style={{
              textDecoration: "none",
              color: active ? "var(--text)" : "var(--muted)",
              fontWeight: active ? 700 : 600,
            }}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}