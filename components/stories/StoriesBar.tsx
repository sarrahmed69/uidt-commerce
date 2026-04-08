"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { TbX, TbChevronLeft, TbChevronRight, TbBuildingStore } from "react-icons/tb";

interface Story {
  id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  expires_at: string;
}

interface VendorWithStories {
  id: string;
  shop_name: string;
  logo_url: string | null;
  stories: Story[];
}

export default function StoriesBar() {
  const [vendors, setVendors] = useState<VendorWithStories[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<{ vendorIdx: number; storyIdx: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<any>(null);
  const DURATION = 5000;

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const now = new Date().toISOString();
      const { data: stories } = await supabase
        .from("vendor_stories")
        .select("*, vendors(id, shop_name, logo_url)")
        .gt("expires_at", now)
        .order("created_at", { ascending: false });

      if (!stories) { setLoading(false); return; }

      // Grouper par vendeur
      const map = new Map<string, VendorWithStories>();
      for (const s of stories) {
        const v = s.vendors as any;
        if (!v) continue;
        if (!map.has(v.id)) {
          map.set(v.id, { id: v.id, shop_name: v.shop_name, logo_url: v.logo_url, stories: [] });
        }
        map.get(v.id)!.stories.push({
          id: s.id, media_url: s.media_url, media_type: s.media_type,
          caption: s.caption, created_at: s.created_at, expires_at: s.expires_at,
        });
      }
      setVendors(Array.from(map.values()));
      setLoading(false);
    })();
  }, []);

  // Progress bar auto-avance
  useEffect(() => {
    if (!viewing) return;
    setProgress(0);
    clearInterval(progressRef.current);
    const start = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(progressRef.current);
        goNext();
      }
    }, 50);
    return () => clearInterval(progressRef.current);
  }, [viewing]);

  const openStory = (vendorIdx: number) => setViewing({ vendorIdx, storyIdx: 0 });
  const closeStory = () => { clearInterval(progressRef.current); setViewing(null); };

  const goNext = () => {
    if (!viewing) return;
    const { vendorIdx, storyIdx } = viewing;
    const vendor = vendors[vendorIdx];
    if (storyIdx < vendor.stories.length - 1) {
      setViewing({ vendorIdx, storyIdx: storyIdx + 1 });
    } else if (vendorIdx < vendors.length - 1) {
      setViewing({ vendorIdx: vendorIdx + 1, storyIdx: 0 });
    } else {
      closeStory();
    }
  };

  const goPrev = () => {
    if (!viewing) return;
    const { vendorIdx, storyIdx } = viewing;
    if (storyIdx > 0) {
      setViewing({ vendorIdx, storyIdx: storyIdx - 1 });
    } else if (vendorIdx > 0) {
      const prevVendor = vendors[vendorIdx - 1];
      setViewing({ vendorIdx: vendorIdx - 1, storyIdx: prevVendor.stories.length - 1 });
    }
  };

  if (!loading && vendors.length === 0) return null;

  const currentVendor = viewing !== null ? vendors[viewing.vendorIdx] : null;
  const currentStory = viewing !== null ? currentVendor?.stories[viewing.storyIdx] : null;

  return (
    <>
      {/* Barre de stories */}
      <div className="px-4 py-4 max-w-7xl mx-auto">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
          {loading ? (
            [1,2,3,4,5,6].map(i => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1.5 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-gray-200" />
                <div className="w-12 h-2 bg-gray-200 rounded" />
              </div>
            ))
          ) : vendors.map((v, idx) => (
            <button key={v.id} onClick={() => openStory(idx)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 group">
              {/* Cercle gradient (story active) */}
              <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-[#F5A623] via-[#e05c1a] to-[#2B3090]">
                <div className="p-[2px] bg-white rounded-full">
                  <div className="w-14 h-14 rounded-full bg-[#2B3090]/10 flex items-center justify-center text-[#2B3090] font-bold text-xl overflow-hidden group-hover:scale-105 transition-transform">
                    {v.logo_url
                      ? <img src={v.logo_url} alt={v.shop_name} className="w-full h-full object-cover" />
                      : v.shop_name?.[0]?.toUpperCase()
                    }
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-gray-600 font-medium max-w-[64px] truncate text-center">
                {v.shop_name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Viewer modal */}
      {viewing && currentVendor && currentStory && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={closeStory}>
          <div className="relative w-full max-w-sm h-full max-h-[100dvh] flex flex-col"
            onClick={e => e.stopPropagation()}>

            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
              {currentVendor.stories.map((_, i) => (
                <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-none"
                    style={{ width: i < viewing.storyIdx ? "100%" : i === viewing.storyIdx ? `${progress}%` : "0%" }} />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-4 left-0 right-0 z-10 flex items-center gap-3 px-4 pt-4">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                {currentVendor.logo_url
                  ? <img src={currentVendor.logo_url} alt={currentVendor.shop_name} className="w-full h-full object-cover" />
                  : currentVendor.shop_name?.[0]?.toUpperCase()
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{currentVendor.shop_name}</p>
                <p className="text-white/60 text-xs">
                  {new Date(currentStory.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <button onClick={closeStory} className="text-white/80 hover:text-white">
                <TbX size={22} />
              </button>
            </div>

            {/* Media */}
            <div className="flex-1 relative bg-black">
              {currentStory.media_type === "video" ? (
                <video src={currentStory.media_url} autoPlay muted playsInline
                  className="absolute inset-0 w-full h-full object-contain" />
              ) : (
                <img src={currentStory.media_url} alt=""
                  className="absolute inset-0 w-full h-full object-contain" />
              )}

              {/* Navigation zones */}
              <button className="absolute left-0 top-0 bottom-0 w-1/3 z-10" onClick={goPrev} />
              <button className="absolute right-0 top-0 bottom-0 w-1/3 z-10" onClick={goNext} />
            </div>

            {/* Caption */}
            {currentStory.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-8 pt-12">
                <p className="text-white text-sm font-medium">{currentStory.caption}</p>
              </div>
            )}

            {/* Fleches navigation vendeur */}
            {viewing.vendorIdx > 0 && (
              <button onClick={() => setViewing({ vendorIdx: viewing.vendorIdx - 1, storyIdx: 0 })}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white z-20">
                <TbChevronLeft size={18} />
              </button>
            )}
            {viewing.vendorIdx < vendors.length - 1 && (
              <button onClick={() => setViewing({ vendorIdx: viewing.vendorIdx + 1, storyIdx: 0 })}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white z-20">
                <TbChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}