"use client";
import { useEffect, useState } from "react";
import { TbDownload, TbX, TbDeviceMobile } from "react-icons/tb";

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // iOS detection
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check si deja installe
    if ((window.matchMedia("(display-mode: standalone)").matches) || (window.navigator as any).standalone) {
      return;
    }

    // Check localStorage
    if (localStorage.getItem("kayjend-install-dismissed") === "true") {
      setDismissed(true);
      return;
    }

    // Android/Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Afficher sur iOS apres 3s
    if (ios) {
      setTimeout(() => setShowBanner(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const close = () => {
    setShowBanner(false);
    localStorage.setItem("kayjend-install-dismissed", "true");
    setDismissed(true);
  };

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:max-w-sm z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-accent px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <TbDeviceMobile size={18} />
            <span className="font-bold text-sm">Installer KayJend</span>
          </div>
          <button onClick={close} className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
            <TbX size={14} />
          </button>
        </div>
        <div className="p-4">
          {isIOS ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 leading-relaxed">
                Pour installer KayJend sur votre iPhone :
              </p>
              <ol className="text-xs text-gray-600 space-y-1.5 pl-4 list-decimal">
                <li>Appuyez sur <span className="font-bold">Partager</span> 📤 en bas</li>
                <li>Faites defiler et choisissez <span className="font-bold">Sur l ecran d accueil</span></li>
                <li>Validez avec <span className="font-bold">Ajouter</span></li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-600">
                Installez KayJend sur votre telephone pour recevoir les notifications et acceder plus vite !
              </p>
              <button onClick={install}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-accent transition-colors text-sm">
                <TbDownload size={16} /> Installer l app
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}