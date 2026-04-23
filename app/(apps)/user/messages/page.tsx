"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  TbMessageCircle, TbLoader2, TbArrowLeft, TbSearch,
} from "react-icons/tb";
import ChatBox from "@/components/chat/ChatBox";
import Link from "next/link";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [isVendor, setIsVendor] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/sign-in"); return; }
      setUserId(user.id);

      // Verifier si aussi vendeur
      const { data: vendors } = await supabase.from("vendors").select("id").eq("user_id", user.id).limit(1);
      setIsVendor(!!(vendors && vendors.length > 0));
      const vendorId = vendors?.[0]?.id;

      // Toutes les conversations ou je suis acheteur OU vendeur
      const { data } = await supabase.from("conversations")
        .select(`
          *,
          vendors(id, shop_name, logo_url, user_id),
          products:produit_id(id, name, images, price)
        `)
        .or(`buyer_id.eq.${user.id}${vendorId ? ",vendor_id.eq." + vendorId : ""}`)
        .order("last_message_at", { ascending: false });

      setConversations(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = conversations.filter((c: any) => {
    const name = c.vendors?.shop_name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const getOtherInfo = (conv: any) => {
    const isBuyer = conv.buyer_id === userId;
    if (isBuyer) {
      return {
        name: conv.vendors?.shop_name || "Vendeur",
        avatar: conv.vendors?.logo_url,
        unread: conv.unread_buyer || 0,
      };
    }
    return {
      name: "Client",
      avatar: null,
      unread: conv.unread_vendor || 0,
    };
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <TbLoader2 className="animate-spin text-primary" size={36} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Liste conversations */}
      <div className={`${selected ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-96 border-r border-gray-100 bg-white`}>
        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3 sticky top-0 bg-white z-10">
          <Link href="/user/dashboard" className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-200">
            <TbArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900">Messages</h1>
            <p className="text-xs text-gray-400">{conversations.length} conversation{conversations.length > 1 ? "s" : ""}</p>
          </div>
        </div>

        {conversations.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="relative">
              <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                className="w-full bg-gray-50 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <TbMessageCircle className="text-gray-400" size={32} />
              </div>
              <p className="font-semibold text-gray-600">Aucune conversation</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">Contactez un vendeur depuis un produit pour commencer</p>
              <Link href="/produits" className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                Voir les produits
              </Link>
            </div>
          ) : (
            filtered.map((conv: any) => {
              const other = getOtherInfo(conv);
              const isSelected = selected?.id === conv.id;
              return (
                <button key={conv.id} onClick={() => setSelected(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left ${
                    isSelected ? "bg-primary/5" : ""
                  }`}>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary flex-shrink-0 overflow-hidden">
                    {other.avatar ? <img src={other.avatar} alt={other.name} className="w-full h-full object-cover" /> : other.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-800 text-sm truncate">{other.name}</p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {new Date(conv.last_message_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className={`text-xs truncate ${other.unread > 0 ? "text-gray-800 font-semibold" : "text-gray-400"}`}>
                        {conv.last_message || "Debut de conversation"}
                      </p>
                      {other.unread > 0 && (
                        <span className="bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {other.unread > 9 ? "9+" : other.unread}
                        </span>
                      )}
                    </div>
                    {conv.products?.name && (
                      <p className="text-[10px] text-primary/70 truncate mt-0.5">📦 {conv.products.name}</p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat */}
      <div className={`${selected ? "flex" : "hidden lg:flex"} flex-1 flex-col`}>
        {selected && userId ? (
          <ChatBox
            conversationId={selected.id}
            currentUserId={userId}
            otherName={getOtherInfo(selected).name}
            otherAvatar={getOtherInfo(selected).avatar}
            produitInfo={selected.products ? {
              id: selected.products.id,
              name: selected.products.name,
              image: selected.products.images?.[0],
              price: selected.products.price,
            } : undefined}
            onBack={() => setSelected(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-center px-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <TbMessageCircle className="text-primary" size={40} />
            </div>
            <p className="font-bold text-gray-700 text-lg">Vos messages</p>
            <p className="text-sm text-gray-400 max-w-xs mt-1">
              Selectionnez une conversation pour commencer a discuter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}