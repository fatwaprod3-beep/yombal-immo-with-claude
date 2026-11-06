import type { Metadata, Viewport } from "next";
import "./globals.css";
import ConfirmHost from "../components/confirm-dialog";
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
  metadataBase: new URL("https://yombal-immo.pro"),
  title: { default: "Yombal.immo — Logiciel de gestion locative simple (Sénégal & Afrique)", template: "%s · Yombal.immo" },
  description: "Yombal.immo est le logiciel de gestion locative pour propriétaires et agences : loyers, paiements partiels, retards, quittances et factures PDF, baux, biens et locataires. Gratuit pour commencer, paiement Orange Money, Wave ou carte.",
  applicationName: "Yombal.immo",
  keywords: ["Yombal","Yombal immo","Yombal.immo","gestion locative","logiciel gestion locative","gestion immobilière Sénégal","gestion des loyers","quittance de loyer","facture loyer","agence immobilière Dakar","propriétaire bailleur","suivi des locataires","application immobilier Afrique"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "fr_FR", url: "https://yombal-immo.pro", siteName: "Yombal.immo", title: "Yombal.immo — La gestion locative, enfin simple", description: "Loyers, locataires, factures et bilans au même endroit. Gratuit pour commencer.", images: [{ url: "/icons/yombal-512.png", width: 512, height: 512, alt: "Yombal.immo" }] },
  twitter: { card: "summary", title: "Yombal.immo — La gestion locative, enfin simple", description: "Loyers, locataires, factures et bilans au même endroit. Gratuit pour commencer.", images: ["/icons/yombal-512.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  icons: { icon: "/yombal-logo.png", shortcut: "/yombal-logo.png", apple: "/icons/yombal-192.png" },
  appleWebApp: { capable: true, title: "Yombal.immo", statusBarStyle: "default" },
  category: "business",
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="fr"><head><link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials"/><script src="/install-bootstrap.js"/></head><body>{children}<ConfirmHost/></body></html>;
}
