"use client";
import Link from "next/link";

export default function SettingsButton() {
  return (
    <Link
      href="/einstellungen"
      aria-label="Einstellungen"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "var(--icon)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--icon)")}
    >
      <svg
        width="24" height="24" viewBox="-1 -1 26 26"
        fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ overflow: "visible" }} aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33A1.65 1.65 0 0 0 14 21.4V22a2 2 0 1 1-4 0v-.6a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06c.35-.5.4-1.17.13-1.73A1.65 1.65 0 0 0 3 14H2a2 2 0 1 1 0-4h1a1.65 1.65 0 0 0 1.54-.97c.27-.56.22-1.23-.13-1.73l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06c.5.35 1.17.4 1.73.13A1.65 1.65 0 0 0 10 3.6V3a2 2 0 1 1 4 0v.6c0 .66.38 1.26.97 1.54.56.27 1.23.22 1.73-.13l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.35.5-.4 1.17-.13 1.73.28.59.88.97 1.54.97h1a2 2 0 1 1 0 4h-1c-.66 0-1.26.38-1.54.97Z" />
      </svg>
    </Link>
  );
}