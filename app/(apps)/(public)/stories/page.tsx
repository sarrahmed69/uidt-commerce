"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TbX, TbChevronLeft, TbChevronRight, TbBuildingStore } from "react-icons/tb";

export default function StoriesPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState<{ stories: any[]; index: number; vendor: any } | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: allStories } = await supabase
        .from("vendor_stories")
        .select("*, vendors(id, shop_name, logo_url)")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (!allStories) { setLoading(false); return; }

      // Grouper par vendeur
      const map: Record<string, any> = {};
      for (const s of allStories) {
        const vid = s.vendor_id;
        if (!map[vid]) map[vid] = { ...s.vendors, stories: [] };
        map[vid].stories.push(s);
      }
      setVendors(Object.values(map));
      setLoading(false);
    })();
  }, []);

  const openStories = (vendor: any) =>
    setActiveStory({ stories: vendor.stories, index: 0, vendor });
  const closeStory = () => setActiveStory(null);
  const nextStory = () => {
    if (!activeStory) return;
    if (activeStory.index < activeStory.stories.length - 1)
      setActiveStory({ ...activeStory, index: activeStory.index + 1 });
    else closeStory();
  };
  const prevStory = () => {
    if (!activeStory || activeStory.index === 0) return;
    setActiveStory({ ...activeStory, index: activeStory.index - 1 });
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2B3090]">Stories des vendeurs</h1>
        <p className="text-sm text-gray-400 mt-1">Toutes les stories actives sur le campus</p>
      </div>

      {loading ? (
        <div className="flex gap-4 flex-wrap">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-gray-200" />
              <div className="w-12 h-2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <TbBuildingStore size={48} className="mb-3 opacity-30" />
          <p className="text-sm">Aucune story active pour le moment</p>
        </div>
      ) : (
        <>
          {/* Ligne de bulles style Instagram */}
          <div className="flex gap-5 flex-wrap mb-10">
            {vendors.map(v => (
              <button key={v.id} onClick={() => openStories(v)}
                className="flex flex-col items-center gap-1.5 group">
                <div className="w-16 h-16 rounded-full ring-2 ring-[#F5A623] ring-offset-2 overflow-hidden bg-[#2B3090]/10 flex items-center justify-center text-[#2B3090] font-bold text-xl group-hover:scale-105 transition-transform">
                  {v.logo_url
                    ? <img src={v.logo_url} className="w-full h-full object-cover" alt={v.shop_name} />
                    : v.shop_name?.[0]?.toUpperCase()}
                </div>
                <span className="text-[10px] text-gray-600 font-medium max-w-[64px] truncate">{v.shop_name}</span>
                <span className="text-[9px] text-gray-400">{v.stories.length} story</span>
              </button>
            ))}
          </div>

          {/* Grille de toutes les stories */}
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Toutes les stories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {vendors.flatMap(v =>
              v.stories.map((s: any, i: number) => (
                <button key={s.id} onClick={() => setActiveStory({ stories: v.stories, index: i, vendor: v })}
                  className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black group hover:scale-[1.02] transition-transform shadow-sm">
                  {s.media_type === "video" ? (
                    <video src={s.media_url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={s.media_url} className="w-full h-full object-cover" alt="" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 flex-shrink-0">
                      {v.logo_url
                        ? <img src={v.logo_url} className="w-full h-full object-cover" alt="" />
                        : <span className="text-white text-[10px] font-bold flex items-center justify-center h-full">{v.shop_name?.[0]}</span>}
                    </div>
                    <span className="text-white text-[10px] font-semibold truncate">{v.shop_name}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={closeStory}>
          <div className="relative w-full max-w-sm h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
              {activeStory.stories.map((_: any, i: number) => (
                <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30">
                  <div className={`h-full rounded-full bg-white ${i <= activeStory.index ? "w-full" : "w-0"}`} />
                </div>
              ))}
            </div>
            <div className="absolute top-8 left-3 right-3 flex items-center gap-2 z-10">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                {activeStory.vendor.logo_url
                  ? <img src={activeStory.vendor.logo_url} className="w-full h-full object-cover" alt="" />
                  : activeStory.vendor.shop_name?.[0]}
              </div>
              <span className="text-white text-xs font-semibold">{activeStory.vendor.shop_name}</span>
              <button onClick={closeStory} className="ml-auto text-white"><TbX size={20} /></button>
            </div>
            <div className="w-full h-full rounded-2xl overflow-hidden bg-black">
              {activeStory.stories[activeStory.index]?.media_type === "video" ? (
                <video src={activeStory.stories[activeStory.index].media_url} className="w-full h-full object-contain" autoPlay onEnded={nextStory} />
              ) : (
                <img src={activeStory.stories[activeStory.index].media_url} className="w-full h-full object-contain" alt="story" />
              )}
            </div>
            <button onClick={prevStory} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"><TbChevronLeft size={28} /></button>
            <button onClick={nextStory} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"><TbChevronRight size={28} /></button>
          </div>
        </div>
      )}
    </main>
  );
}
