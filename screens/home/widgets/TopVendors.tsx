"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { TbBuildingStore, TbArrowRight, TbCheck, TbX, TbChevronLeft, TbChevronRight } from "react-icons/tb";

export default function TopVendors() {
  const [vendeurs, setVendeurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState<{ stories: any[]; index: number; vendor: any } | null>(null);
  const [isVendor, setIsVendor] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: v } = await supabase.from("vendors").select("id").eq("user_id", user.id).single();
        if (v) setIsVendor(true);
      }
      const { data: vendors } = await supabase
        .from("vendors")
        .select("id, shop_name, logo_url, is_verified, description")
        .eq("status", "active")
        .limit(6);
      if (!vendors) { setLoading(false); return; }
      const vendorsWithStories = await Promise.all(vendors.map(async (v) => {
        const { data: stories } = await supabase
          .from("vendor_stories")
          .select("*")
          .eq("vendor_id", v.id)
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false });
        return { ...v, stories: stories || [] };
      }));
      setVendeurs(vendorsWithStories);
      setLoading(false);
    })();
  }, []);

  const openStories = (e: React.MouseEvent, vendor: any) => {
    if (vendor.stories.length === 0) return;
    e.preventDefault();
    setActiveStory({ stories: vendor.stories, index: 0, vendor });
  };
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

  if (!loading && !vendeurs.length) return null;

  return (
    <section className="px-4 py-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#2B3090]">Nos vendeurs</h2>
          <p className="text-sm text-gray-400 mt-0.5">Boutiques actives sur le campus</p>
        </div>
        <Link href="/vendeurs" className="text-xs text-[#2B3090] font-semibold hover:underline flex items-center gap-1">
          Voir tout <TbArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
              <div className="w-12 h-12 bg-gray-100 rounded-xl mx-auto mb-3" />
              <div className="h-3 bg-gray-100 rounded w-3/4 mx-auto mb-2" />
              <div className="h-2 bg-gray-100 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {vendeurs.map(v => (
            <Link key={v.id} href={`/vendeurs/${v.id}`}
              className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all border border-gray-100 group hover:-translate-y-0.5">
              <div
                onClick={(e) => openStories(e, v)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-3 overflow-hidden transition-all
                  ${v.stories.length > 0
                    ? "ring-2 ring-[#F5A623] ring-offset-2 cursor-pointer hover:scale-105 bg-[#2B3090]/10 text-[#2B3090]"
                    : "bg-[#2B3090]/10 text-[#2B3090] group-hover:bg-[#2B3090] group-hover:text-white"
                  }`}
              >
                {v.logo_url ? (
                  <Image
                    src={v.logo_url}
                    alt={v.shop_name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                    quality={60}
                    sizes="56px"
                  />
                ) : v.shop_name?.[0]?.toUpperCase()}
              </div>
              <p className="font-bold text-gray-800 text-xs truncate">{v.shop_name}</p>
              {v.is_verified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-green-600 font-semibold mt-1">
                  <TbCheck size={10} /> Verifie
                </span>
              )}
              {v.description && (
                <p className="text-gray-400 text-[10px] mt-1 line-clamp-2 leading-tight">{v.description}</p>
              )}
              <div className="mt-3 flex items-center justify-center gap-1 text-[#2B3090]">
                <TbBuildingStore size={12} />
                <span className="text-[10px] font-semibold">
                  {v.stories.length > 0 ? `${v.stories.length} story` : "Voir la boutique"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!isVendor && (
        <div className="mt-6 bg-gradient-to-r from-[#1A1F6B] to-[#2B3090] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white">
            <h3 className="font-bold text-base">Vous voulez vendre sur le campus ?</h3>
            <p className="text-white/60 text-sm mt-0.5">Creez votre boutique gratuitement en 2 minutes</p>
          </div>
          <Link href="/devenir-vendeur"
            className="bg-[#F5A623] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#d4891a] transition-colors whitespace-nowrap flex-shrink-0">
            Devenir vendeur
          </Link>
        </div>
      )}

      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={closeStory}>
          <div className="relative w-full max-w-sm h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
              {activeStory.stories.map((_: any, i: number) => (
                <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30">
                  <div className={`h-full rounded-full bg-white ${i <= activeStory.index ? "w-full" : "w-0"}`} />
                </div>
              ))}
            </div>
            <div className="absolute top-8 left-3 right-3 flex items-center gap-2 z-10">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                {activeStory.vendor.logo_url ? (
                  <Image src={activeStory.vendor.logo_url} width={32} height={32} className="w-full h-full object-cover" alt="" quality={60} />
                ) : activeStory.vendor.shop_name?.[0]}
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
    </section>
  );
}