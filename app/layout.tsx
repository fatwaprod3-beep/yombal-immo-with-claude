import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./mobile.css";
import "./analytics.css";
import "./pro.css";
import "./refinements.css";
import "./documents.css";
import "./mobile-home.css";
import "./mobile-workflows.css";
import "./mobile-clarity.css";
import "./desktop-home.css";
import "./desktop-management.css";
import "./desktop-simplicity.css";
import "./property-history.css";
import "./navigation-polish.css";
import "./admin.css";
import "./assistant.css";
import "./home-v28.css";
import "./landing.css";
export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, viewportFit: 'cover',
  interactiveWidget: 'resizes-content', colorScheme: 'light',
  themeColor: [{media:'(max-width:850px)',color:'#ffffff'},{media:'(min-width:851px)',color:'#21152e'}],
};
export const metadata: Metadata = {
  title: "Yombal.immo — La gestion immobilière, simplifiée",
  description: "Biens, locataires, locations, loyers et rappels : votre immobilier en toute clarté.",
  icons: { icon: "/yombal-logo.png", shortcut: "/yombal-logo.png", apple: "/icons/yombal-192.png" },
  appleWebApp: { capable: true, title: "Yombal.immo", statusBarStyle: "default" },
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="fr"><head><link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials"/><script src="/install-bootstrap.js"/></head><body>{children}</body></html>;
}
