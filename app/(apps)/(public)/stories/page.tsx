"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  TbX, TbBuildingStore, TbShoppingBag, TbHeart,
  TbShare, TbChevronUp, TbChevronDown, TbVolume,
  TbVolumeOff, TbLoader2, TbStar,
} from "react-icons/tb";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

export default function StoriesPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVendor, setActiveVendor] = useState<number>(0);
  const [activeStory, setActiveStory] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [fullscreen, setFullscreen] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const progressRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const DURATION = 7000;

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: allStories } = await supabase
        .from("vendor_stories")
        .select("*, vendors(id, shop_name, logo_url, rating, is_verified)")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (!allStories) { setLoading(false); return; }
      const map: Record<string, any> = {};
      for (const s of allStories) {
        const vid = s.vendor_id;
        if (!map[vid]) map[vid] = { ...s.vendors, stories: [], products: [] };
        map[vid].stories.push(s);
      }

      // Charger les produits de chaque vendeur
      const supabase2 = createClient();
      for (const v of Object.values(map) as any[]) {
        const { data: prods } = await supabase2.from("products")
          .select("id, name, price, images, promo_price")
          .eq("vendor_id", v.id).eq("status", "active").limit(3);
        v.products = prods || [];
      }
      setVendors(Object.values(map));
      setLoading(false);
    })();
  }, []);

  const currentVendor = vendors[activeVendor];
  const currentStory = currentVendor?.stories?.[activeStory];

  const goNext = useCallback(() => {
    if (!currentVendor) return;
    setProgress(0);
    if (activeStory < currentVendor.stories.length - 1) {
      setActiveStory(s => s + 1);
    } else if (activeVendor < vendors.length - 1) {
      setActiveVendor(v => v + 1);
      setActiveStory(0);
    }
    setShowProducts(false);
  }, [activeStory, activeVendor, currentVendor, vendors.length]);

  const goPrev = useCallback(() => {
    setProgress(0);
    if (activeStory > 0) {
      setActiveStory(s => s - 1);
    } else if (activeVendor > 0) {
      setActiveVendor(v => v - 1);
      setActiveStory(0);
    }
    setShowProducts(false);
  }, [activeStory, activeVendor]);

  // Progression automatique
  useEffect(() => {
    if (!fullscreen || paused || !currentStory || currentStory.media_type === "video") return;
    setProgress(0);
    clearInterval(progressRef.current);
    const interval = 50;
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(progressRef.current); goNext(); return 0; }
        return p + (interval / DURATION) * 100;
      });
    }, interval);
    return () => clearInterval(progressRef.current);
  }, [activeStory, activeVendor, paused, fullscreen, currentStory]);

  // Touch/swipe
  const touchStart = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <TbLoader2 className="animate-spin text-white" size={36} />
    </div>
  );

  if (!fullscreen) return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-[#2B3090]">Stories</h1>
        <p className="text-xs text-gray-400 mt-0.5">Découvrez les boutiques du campus</p>
      </div>

      {vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
          <TbBuildingStore size={56} className="opacity-20" />
          <p className="text-sm">Aucune story active pour le moment</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Bulles stories style Instagram */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mb-8">
            {vendors.map((v, i) => (
              <button key={v.id} onClick={() => { setActiveVendor(i); setActiveStory(0); setFullscreen(true); setProgress(0); }}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group">
                <div className="w-[72px] h-[72px] rounded-full p-[2px] bg-gradient-to-tr from-[#F5A623] via-[#2B3090] to-[#F5A623]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
                    {v.logo_url
                      ? <img src={v.logo_url} className="w-full h-full object-cover" alt={v.shop_name} />
                      : <div className="w-full h-full bg-[#2B3090]/10 flex items-center justify-center text-[#2B3090] font-bold text-2xl">{v.shop_name?.[0]}</div>}
                  </div>
                </div>
                <span className="text-[10px] text-gray-700 font-semibold max-w-[72px] truncate text-center">{v.shop_name}</span>
              </button>
            ))}
          </div>

          {/* Grille TikTok style */}
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Toutes les stories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {vendors.flatMap((v, vi) =>
              v.stories.map((s: any, si: number) => (
                <button key={s.id}
                  onClick={() => { setActiveVendor(vi); setActiveStory(si); setFullscreen(true); setProgress(0); }}
                  className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black group hover:scale-[1.02] transition-all shadow-lg">
                  {s.media_type === "video"
                    ? <video src={s.media_url} className="w-full h-full object-cover" muted />
                    : <img src={s.media_url} className="w-full h-full object-cover" alt="" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  {/* Vendeur info */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-white/50 flex-shrink-0">
                        {v.logo_url
                          ? <img src={v.logo_url} className="w-full h-full object-cover" alt="" />
                          : <div className="w-full h-full bg-[#2B3090] flex items-center justify-center text-white text-[10px] font-bold">{v.shop_name?.[0]}</div>}
                      </div>
                      <span className="text-white text-[11px] font-bold truncate">{v.shop_name}</span>
                    </div>
                    {s.caption && <p className="text-white/80 text-[10px] truncate">{s.caption}</p>}
                  </div>
                  {/* Play icon */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[12px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </main>
  );

  // MODE FULLSCREEN TIKTOK
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

      {/* Story media */}
      <div className="relative w-full h-full max-w-sm mx-auto"
        onClick={e => { const x = e.clientX; const w = window.innerWidth; x < w / 2 ? goPrev() : goNext(); }}>

        {currentStory?.media_type === "video" ? (
          <video ref={videoRef} src={currentStory.media_url} className="w-full h-full object-cover"
            autoPlay muted={muted} onEnded={goNext}
            onTimeUpdate={e => { const v = e.currentTarget; setProgress((v.currentTime / v.duration) * 100); }} />
        ) : (
          <img src={currentStory?.media_url} className="w-full h-full object-cover" alt="" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
          {currentVendor?.stories.map((_: any, i: number) => (
            <div key={i} className="flex-1 h-[2px] rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-none"
                style={{ width: i < activeStory ? "100%" : i === activeStory ? progress + "%" : "0%" }} />
            </div>
          ))}
        </div>

        {/* Header vendeur */}
        <div className="absolute top-8 left-3 right-3 flex items-center gap-2 z-20">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/80 flex-shrink-0">
            {currentVendor?.logo_url
              ? <img src={currentVendor.logo_url} className="w-full h-full object-cover" alt="" />
              : <div className="w-full h-full bg-[#2B3090] flex items-center justify-center text-white font-bold">{currentVendor?.shop_name?.[0]}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-white font-bold text-sm truncate">{currentVendor?.shop_name}</p>
              {currentVendor?.is_verified && <TbStar size={12} className="text-[#F5A623] flex-shrink-0" />}
            </div>
            <p className="text-white/60 text-[10px]">
              {activeStory + 1}/{currentVendor?.stories.length} · il y a {Math.round((Date.now() - new Date(currentStory?.created_at).getTime()) / 60000)}min
            </p>
          </div>
          <button onClick={() => setMuted(m => !m)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
            {muted ? <TbVolumeOff size={16} /> : <TbVolume size={16} />}
          </button>
          <button onClick={() => setFullscreen(false)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
            <TbX size={16} />
          </button>
        </div>

        {/* Caption */}
        {currentStory?.caption && (
          <div className="absolute bottom-[180px] left-4 right-16 z-20">
            <p className="text-white text-sm font-medium drop-shadow-lg">{currentStory.caption}</p>
          </div>
        )}

        {/* Actions droite */}
        <div className="absolute right-3 bottom-[180px] flex flex-col items-center gap-5 z-20">
          <button onClick={e => { e.stopPropagation(); setLiked(l => ({ ...l, [currentStory?.id]: !l[currentStory?.id] })); }}
            className="flex flex-col items-center gap-1">
            <div className={"w-10 h-10 rounded-full flex items-center justify-center " + (liked[currentStory?.id] ? "bg-red-500" : "bg-white/20")}>
              <TbHeart size={20} className={liked[currentStory?.id] ? "text-white fill-white" : "text-white"} />
            </div>
            <span className="text-white text-[10px]">{liked[currentStory?.id] ? "Aime" : "J'aime"}</span>
          </button>
          <button onClick={e => { e.stopPropagation(); setShowProducts(p => !p); }}
            className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <TbShoppingBag size={20} className="text-white" />
            </div>
            <span className="text-white text-[10px]">Produits</span>
          </button>
          <button onClick={e => { e.stopPropagation(); if (navigator.share) navigator.share({ title: currentVendor?.shop_name, url: window.location.href }); }}
            className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <TbShare size={20} className="text-white" />
            </div>
            <span className="text-white text-[10px]">Partager</span>
          </button>
        </div>

        {/* Navigation vendeurs */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
          {activeVendor > 0 && (
            <button onClick={e => { e.stopPropagation(); goPrev(); }}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
              <TbChevronUp size={18} />
            </button>
          )}
          {activeVendor < vendors.length - 1 && (
            <button onClick={e => { e.stopPropagation(); goNext(); }}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
              <TbChevronDown size={18} />
            </button>
          )}
        </div>

        {/* Panneau produits */}
        <div className={"absolute bottom-0 left-0 right-0 z-30 transition-transform duration-300 " + (showProducts ? "translate-y-0" : "translate-y-full")}>
          <div className="bg-white rounded-t-3xl p-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-gray-900">Produits de {currentVendor?.shop_name}</p>
              <button onClick={() => setShowProducts(false)}><TbX size={20} className="text-gray-400" /></button>
            </div>
            {currentVendor?.products?.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">Aucun produit disponible</p>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                {currentVendor?.products?.map((p: any) => (
                  <Link key={p.id} href={"/produits/" + p.id} onClick={() => setFullscreen(false)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-300"><TbShoppingBag size={20} /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.promo_price ? (
                          <>
                            <span className="text-[#2B3090] font-bold text-sm">{fmt(p.promo_price)}</span>
                            <span className="text-gray-400 text-xs line-through">{fmt(p.price)}</span>
                          </>
                        ) : (
                          <span className="text-[#2B3090] font-bold text-sm">{fmt(p.price)}</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-[#2B3090] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0">
                      Voir
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link href={"/vendeurs/" + currentVendor?.id} onClick={() => setFullscreen(false)}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-[#F5A623] text-white font-bold py-3 rounded-2xl text-sm">
              <TbBuildingStore size={16} /> Voir toute la boutique
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}