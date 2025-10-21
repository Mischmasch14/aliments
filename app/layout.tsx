// app/layout.tsx
import "./globals.css";
import AlimentsLogo from "@/components/AlimentsLogo";
import TopNav from "@/components/TopNav";
import SettingsButton from "@/components/SettingsButton";

export const metadata = { title: "aliments", description: "Übersicht" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <header
        id="app-header"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 16,
            padding: "8px 16px",
          }}
        >
          <AlimentsLogo />
          <div><TopNav /></div>
          <div style={{ justifySelf: "end" }}><SettingsButton /></div>
        </header>
        {children}
      </body>
    </html>
  );
}