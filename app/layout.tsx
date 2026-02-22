import "./globals.css";
import AppShell from "@/components/AppShell";
import { HudProvider } from "@/lib/hud-store";
import NoZoom from "@/components/NoZoom";

export const metadata = {
  title: "FlorFlamer",
  description: "The most Fire Portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NoZoom />
        <HudProvider>
          <AppShell>{children}</AppShell>
        </HudProvider>
      </body>
    </html>
  );
}
