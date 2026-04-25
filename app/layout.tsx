import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavbarMain from "@/components/common/navbar/NavbarMain";
import Footer from "@/components/common/footer/Footer";
import { QueryProvider } from "@/providers/query-provider";
import { ProgressBarProviders } from "@/providers/progress-bar-provider";
import { Zoom, ToastContainer } from "react-toastify";
import ServiceWorkerRegister from "@/components/notifications/ServiceWorkerRegister";
import InstallAppBanner from "@/components/notifications/InstallAppBanner";

export const viewport: Viewport = { themeColor: "#2B3090" };

export const metadata: Metadata = {
  title: "KayJend | Le marche du campus UIDT",
  description: "La marketplace du campus de l Universite de Thies - Achetez et vendez facilement entre etudiants.",
  keywords: "KayJend, Universite de Thies, campus marketplace, etudiant, vente, achat, Wave, Orange Money, FCFA",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "KayJend" },
  openGraph: {
    title: "KayJend - Le marche du campus",
    description: "Achetez et vendez facilement sur le campus de l Universite de Thies",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/kayjend-logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KayJend" />
        {/* Preconnect Supabase — gain LCP 300ms */}
        <link rel="preconnect" href="https://lcaddyeamrtsyvggcrpa.supabase.co" />
        <link rel="dns-prefetch" href="https://lcaddyeamrtsyvggcrpa.supabase.co" />
      </head>
      <body className="antialiased" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <ServiceWorkerRegister />
        <InstallAppBanner />
        <QueryProvider>
          <ProgressBarProviders>
            <NavbarMain />
            {children}
            <Footer />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              closeButton={false}
              hideProgressBar
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              transition={Zoom}
            />
          </ProgressBarProviders>
        </QueryProvider>
      </body>
    </html>
  );
}