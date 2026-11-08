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
import "./mobile-compact.css";
export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, viewportFit: 'cover',
  interactiveWidget: 'resizes-content', colorScheme: 'light',
  themeColor: [{media:'(max-width:850px)',color:'#ffffff'},{media:'(min-width:851px)',color:'#21152e'}],
};
import MetaPixel from "../components/meta-pixel";
import { Analytics } from "@vercel/analytics/next";
export const metadata: Metadata = {
  metadataBase: new URL("https://yombal-immo.pro"),
  // Vérification Search Console (Google) et Bing Webmaster : codes publics, définis dans Vercel.
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined, other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined },
  title: { default: "Yombal.immo — Logiciel de gestion locative simple (Sénégal & Afrique)", template: "%s · Yombal.immo" },
  description: "Yombal.immo est le logiciel de gestion locative pour propriétaires et agences : loyers, paiements partiels, retards, quittances et factures PDF, baux, biens et locataires. Gratuit pour commencer, paiement Orange Money, Wave ou carte.",
  applicationName: "Yombal.immo",
  keywords: ["Yombal","Yombal immo","Yombal.immo","gestion locative","logiciel gestion locative","gestion immobilière Sénégal","gestion des loyers","quittance de loyer","facture loyer","agence immobilière Dakar","propriétaire bailleur","suivi des locataires","application immobilier Afrique"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: { type: "website", locale: "fr_SN", alternateLocale: ["fr_FR"], url: "https://yombal-immo.pro", siteName: "Yombal.immo", title: "Yombal.immo — La gestion locative, enfin simple", description: "Loyers, locataires, factures et bilans au même endroit. Gratuit pour commencer.", images: [{ url: "/og-yombal.jpg", width: 1200, height: 630, alt: "Yombal.immo — gérez vos loyers sans cahier" }] },
  twitter: { card: "summary_large_image", title: "Yombal.immo — La gestion locative, enfin simple", description: "Loyers, locataires, factures et bilans au même endroit. Gratuit pour commencer.", images: ["/og-yombal.jpg"] },
  icons: { icon: "/yombal-logo.png", shortcut: "/yombal-logo.png", apple: "/icons/yombal-192.png" },
  appleWebApp: { capable: true, title: "Yombal.immo", statusBarStyle: "default" },
  category: "business",
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="fr"><head><link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials"/><script src="/install-bootstrap.js"/></head><body>{children}<ConfirmHost/><MetaPixel/><Analytics/></body></html>;
}
