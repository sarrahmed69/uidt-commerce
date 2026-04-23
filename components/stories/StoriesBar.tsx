"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  TbX, TbChevronLeft, TbChevronRight, TbBuildingStore,
  TbHeart, TbShoppingBag, TbShare, TbVolume, TbVolumeOff, TbStar,
} from "react-icons/tb";

const fmt = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

interface Story { id: string; media_url: string; media_type: string; caption: string | null; created_at: string; expires_at: string; likes_count?: number; }
interface VendorWithStories { id: string; shop_name: string; logo_url: string | null; is_verified?: boolean; stories: Story[]; products: any[]; }

export default function StoriesBar() {
  const [vendors, setVendors]   = useState<VendorWithStories[]>([]);
  const [loading, setLoading]   = useState(true);
  const [viewing, setViewing]   = useState<{ vendorIdx: number; storyIdx: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted]       = useState(true);
  const [liked, setLiked]       = useState<Record<string, boolean>>({});
  const [showProducts, setShowProducts] = useState(false);
  const timerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const DURATION = 7000;

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: stories } = await supabase
        .from("vendor_stories")
        .select("*, vendors(id, shop_name, logo_url, is_verified)")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      if (!stories) { setLoading(false); return; }
      const map = new Map<string, VendorWithStories>();
      for (const s of stories) {
        const v = s.vendors as any;
        if (!v) continue;
        if (!map.has(v.id)) map.set(v.id, { id: v.id, shop_name: v.shop_name, logo_url: v.logo_url, is_verified: v.is_verified, stories: [], products: [] });
        map.get(v.id)!.stories.push({ id: s.id, media_url: s.media_url, media_type: s.media_type, caption: s.caption, created_at: s.created_at, expires_at: s.expires_at, likes_count: s.likes_count || 0 });
      }
      const supabase2 = createClient();
      for (const v of Array.from(map.values())) {
        const { data: prods } = await supabase2.from("products").select("id,name,price,images,promo_price").eq("vendor_id", v.id).eq("status","active").limit(4);
        v.products = prods || [];
      }
      setVendors(Array.from(map.values()));
      setLoading(false);
    })();
  }, []);

  const cv = viewing !== null ? vendors[viewing.vendorIdx] : null;
  const cs = viewing !== null ? cv?.stories[viewing.storyIdx] : null;

  const closeStory = useCallback(() => { clearInterval(timerRef.current); setViewing(null); setShowProducts(false); }, []);

  const goNext = useCallback(() => {
    if (!viewing) return;
    setProgress(0); setShowProducts(false);
    const { vendorIdx, storyIdx } = viewing;
    const vendor = vendors[vendorIdx];
    if (storyIdx < vendor.stories.length - 1) { setViewing({ vendorIdx, storyIdx: storyIdx + 1 }); }
    else if (vendorIdx < vendors.length - 1) { setViewing({ vendorIdx: vendorIdx + 1, storyIdx: 0 }); }
    else { closeStory(); }
  }, [viewing, vendors, closeStory]);

  const goPrev = useCallback(() => {
    if (!viewing) return;
    setProgress(0); setShowProducts(false);
    const { vendorIdx, storyIdx } = viewing;
    if (storyIdx > 0) { setViewing({ vendorIdx, storyIdx: storyIdx - 1 }); }
    else if (vendorIdx > 0) { const pv = vendors[vendorIdx - 1]; setViewing({ vendorIdx: vendorIdx - 1, storyIdx: pv.stories.length - 1 }); }
  }, [viewing, vendors]);

  // Auto-progress
  useEffect(() => {
    if (!viewing || !cs || cs.media_type === "video") return;
    clearInterval(timerRef.current);
    setProgress(0);
    const step = 50;
    timerRef.current = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(timerRef.current); goNext(); return 0; } return p + (step / DURATION) * 100; });
    }, step);
    return () => clearInterval(timerRef.current);
  }, [viewing, cs]);

  const handleLike = async () => {
    if (!cs) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const already = liked[cs.id];
    const newCount = already ? Math.max(0, (cs.likes_count || 0) - 1) : (cs.likes_count || 0) + 1;
    if (user) {
      if (already) {
        await supabase.from("story_likes").delete().eq("story_id", cs.id).eq("user_id", user.id);
      } else {
        await supabase.from("story_likes").insert({ story_id: cs.id, user_id: user.id });
      }
    }
    await supabase.from("vendor_stories").update({ likes_count: newCount }).eq("id", cs.id);
    setLiked(l => ({ ...l, [cs.id]: !already }));
    setVendors((prev: any[]) => prev.map((v, vi) =>
      vi === (viewing?.vendorIdx ?? -1)
        ? { ...v, stories: v.stories.map((s: any) => s.id === cs.id ? { ...s, likes_count: newCount } : s) }
        : v
    ));
  };

  // Touch swipe
  const touchY = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchY.current = e.touches[0].clientY; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dy = touchY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 40) { dy > 0 ? goNext() : goPrev(); }
  };

  if (!loading && vendors.length === 0) return null;

  return (
    <>
      {/* Bulles stories style Instagram */}
      <div className="px-4 py-4 max-w-7xl mx-auto">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
          {loading ? (
            [1,2,3,4,5].map(i => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1.5 animate-pulse">
                <div className="w-[64px] h-[64px] rounded-full bg-gray-200" />
                <div className="w-10 h-2 bg-gray-200 rounded" />
              </div>
            ))
          ) : vendors.map((v, i) => (
            <button key={v.id} onClick={() => { setViewing({ vendorIdx: i, storyIdx: 0 }); setProgress(0); }}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 group">
              <div className="w-[64px] h-[64px] rounded-full p-[2.5px] bg-gradient-to-tr from-[#F5A623] via-[#2B3090] to-[#F5A623]">
                <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
                  {v.logo_url
                    ? <img src={v.logo_url} className="w-full h-full object-cover" alt={v.shop_name} />
                    : <div className="w-full h-full bg-[#2B3090]/10 flex items-center justify-center text-[#2B3090] font-extrabold text-xl">{v.shop_name?.[0]}</div>}
                </div>
              </div>
              <span className="text-[10px] text-gray-700 font-semibold max-w-[64px] truncate">{v.shop_name}</span>
            </button>
          ))}
          {!loading && (
            <Link href="/stories" className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <div className="w-[64px] h-[64px] rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-2xl font-light">+</span>
              </div>
              <span className="text-[10px] text-gray-400">Voir tout</span>
            </Link>
          )}
        </div>
      </div>

      {/* VIEWER FULLSCREEN TIKTOK */}
      {viewing !== null && cv && cs && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
          onWheel={e => { if (e.deltaY > 0) goNext(); else goPrev(); }}>
          <div className="relative w-full h-full max-w-sm mx-auto">

            {/* Media */}
            {cs.media_type === "video" ? (
              <video ref={videoRef} src={cs.media_url} className="w-full h-full object-cover"
                autoPlay muted={muted} playsInline onEnded={goNext}
                onTimeUpdate={e => { const v = e.currentTarget; if (v.duration) setProgress((v.currentTime / v.duration) * 100); }} />
            ) : (
              <img src={cs.media_url} className="w-full h-full object-cover" alt="" />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

            {/* Progress bars */}
            <div className="absolute top-3 left-3 right-3 flex gap-1 z-30">
              {cv.stories.map((_: any, i: number) => (
                <div key={i} className="flex-1 h-[2.5px] rounded-full bg-white/30 overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-none"
                    style={{ width: i < viewing.storyIdx ? "100%" : i === viewing.storyIdx ? progress + "%" : "0%" }} />
                </div>
              ))}
            </div>

            {/* Header vendeur */}
            <div className="absolute top-8 left-3 right-3 flex items-center gap-2.5 z-30">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/80 flex-shrink-0 bg-[#2B3090]">
                {cv.logo_url
                  ? <img src={cv.logo_url} className="w-full h-full object-cover" alt="" />
                  : <span className="text-white font-bold flex items-center justify-center h-full">{cv.shop_name?.[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-white font-bold text-sm truncate">{cv.shop_name}</p>
                  {cv.is_verified && <TbStar size={12} className="text-[#F5A623]" />}
                </div>
                <p className="text-white/60 text-[10px]">
                  {viewing.storyIdx + 1}/{cv.stories.length} · {Math.round((Date.now() - new Date(cs.created_at).getTime()) / 60000)}min
                </p>
              </div>
              <button onClick={() => setMuted(m => !m)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                {muted ? <TbVolumeOff size={16} className="text-white" /> : <TbVolume size={16} className="text-white" />}
              </button>
              <button onClick={closeStory} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <TbX size={16} className="text-white" />
              </button>
            </div>

            {/* Zones tap */}
            <div className="absolute inset-0 flex z-20 pointer-events-none">
              <div className="w-1/3 h-full cursor-pointer pointer-events-auto" onClick={goPrev} />
              <div className="w-1/3 h-full" />
              <div className="w-1/3 h-full cursor-pointer pointer-events-auto" onClick={goNext} />
            </div>

            {/* Nav vendeurs */}
            {viewing.vendorIdx > 0 && (
              <button onClick={e => { e.stopPropagation(); setViewing({ vendorIdx: viewing.vendorIdx - 1, storyIdx: 0 }); setProgress(0); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <TbChevronLeft size={18} className="text-white" />
              </button>
            )}
            {viewing.vendorIdx < vendors.length - 1 && (
              <button onClick={e => { e.stopPropagation(); setViewing({ vendorIdx: viewing.vendorIdx + 1, storyIdx: 0 }); setProgress(0); }}
                className="absolute right-14 top-1/2 -translate-y-1/2 z-30 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <TbChevronRight size={18} className="text-white" />
              </button>
            )}

            {/* Caption */}
            {cs.caption && !showProducts && (
              <div className="absolute bottom-[160px] left-4 right-16 z-30">
                <p className="text-white text-sm font-medium leading-relaxed drop-shadow-lg">{cs.caption}</p>
              </div>
            )}

            {/* Actions droite */}
            <div className="absolute right-3 bottom-[160px] flex flex-col items-center gap-5 z-30">
              <button onClick={handleLike} className="flex flex-col items-center gap-1">
                <div className={"w-11 h-11 rounded-full flex items-center justify-center shadow-lg " + (liked[cs.id] ? "bg-red-500" : "bg-white/20 backdrop-blur-sm")}>
                  <TbHeart size={22} className="text-white" />
                </div>
                <span className="text-white text-[10px] font-semibold">{(cs.likes_count || 0) + (liked[cs.id] ? 1 : 0)}</span>
              </button>
              <button onClick={e => { e.stopPropagation(); setShowProducts(p => !p); }} className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <TbShoppingBag size={22} className="text-white" />
                </div>
                <span className="text-white text-[10px] font-semibold">Produits</span>
              </button>
              <button onClick={e => { e.stopPropagation(); navigator.share?.({ title: cv.shop_name, url: window.location.href }); }} className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <TbShare size={22} className="text-white" />
                </div>
                <span className="text-white text-[10px] font-semibold">Partager</span>
              </button>
            </div>

            {/* Bouton boutique */}
            {!showProducts && (
              <div className="absolute bottom-8 left-4 right-4 z-30">
                <Link href={"/vendeurs/" + cv.id} onClick={closeStory}
                  className="flex items-center justify-center gap-2 bg-white text-[#2B3090] font-bold py-3 rounded-2xl text-sm shadow-xl">
                  <TbBuildingStore size={18} /> Voir la boutique
                </Link>
              </div>
            )}

            {/* Panneau produits */}
            <div className={"absolute bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-out " + (showProducts ? "translate-y-0" : "translate-y-full")}>
              <div className="bg-white rounded-t-3xl p-5 max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-gray-900">Produits · {cv.shop_name}</p>
                  <button onClick={() => setShowProducts(false)}><TbX size={20} className="text-gray-400" /></button>
                </div>
                <div className="overflow-y-auto flex-1 space-y-3 pb-4">
                  {cv.products?.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">Aucun produit disponible</p>
                  ) : cv.products?.map((p: any) => (
                    <Link key={p.id} href={"/produits/" + p.id} onClick={closeStory}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><TbShoppingBag size={20} className="text-gray-300" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {p.promo_price ? (
                            <><span className="text-[#2B3090] font-bold text-sm">{fmt(p.promo_price)}</span>
                              <span className="text-gray-400 text-xs line-through">{fmt(p.price)}</span></>
                          ) : <span className="text-[#2B3090] font-bold text-sm">{fmt(p.price)}</span>}
                        </div>
                      </div>
                      <div className="bg-[#2B3090] text-white text-xs font-bold px-3 py-2 rounded-xl">Voir</div>
                    </Link>
                  ))}
                </div>
                <Link href={"/vendeurs/" + cv.id} onClick={closeStory}
                  className="flex items-center justify-center gap-2 bg-[#F5A623] text-white font-bold py-3.5 rounded-2xl text-sm mt-2">
                  <TbBuildingStore size={16} /> Voir toute la boutique
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}