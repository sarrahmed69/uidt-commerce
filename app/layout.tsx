import type { Metadata } from "next";
import "./globals.css";
import NavbarMain from "@/components/common/navbar/NavbarMain";
import Footer from "@/components/common/footer/Footer";
import { QueryProvider } from "@/providers/query-provider";
import { ProgressBarProviders } from "@/providers/progress-bar-provider";
import { Zoom, ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "UIDT Commerce | Campus Marketplace",
  description: "La marketplace du campus de l Universite de Thies - Achetez et vendez facilement entre etudiants.",
  keywords: "UIDT Commerce, Universite de Thies, campus marketplace, etudiant, vente, achat, Wave, Orange Money, FCFA",
  manifest: "/manifest.json",
  themeColor: "#0a2a1f",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UIDT Commerce",
  },
  openGraph: {
    title: "UIDT Commerce - Campus Marketplace",
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
        <meta name="theme-color" content="#0a2a1f" />
        <link rel="apple-touch-icon" href="/images/uidt-logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="UIDT Commerce" />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
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