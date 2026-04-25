"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { TbSend, TbLoader2, TbX, TbMessageCircle, TbCheck, TbChecks, TbArrowLeft } from "react-icons/tb";

type Message = {
  id: string;
  conversation_id: string;
  expediteur_id: string;
  destinataire_id: string;
  contenu: string;
  est_lu: boolean;
  created_at: string;
  pending?: boolean;
};

interface ChatBoxProps {
  conversationId: string;
  currentUserId: string;
  otherName: string;
  otherAvatar?: string;
  produitInfo?: { id: string; name: string; image?: string; price?: number };
  onClose?: () => void;
  onBack?: () => void;
}

const formatPrice = (p: number) => new Intl.NumberFormat("fr-FR").format(p) + " FCFA";

export default function ChatBox({
  conversationId, currentUserId, otherName, otherAvatar, produitInfo, onClose, onBack,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadMessages();
    markAsRead();

    const channel = supabase.channel("chat-" + conversationId)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const m = payload.new as Message;
        setMessages(prev => {
          // Remplacer le message pending par le vrai message
          const hasPending = prev.some(p => p.pending && p.contenu === m.contenu && p.expediteur_id === m.expediteur_id);
          if (hasPending) {
            return prev.map(p => p.pending && p.contenu === m.contenu ? { ...m, pending: false } : p);
          }
          return [...prev, m];
        });
        if (m.destinataire_id === currentUserId) markSingleAsRead(m.id);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setLoading(false);
  };

  const markAsRead = async () => {
    await supabase.from("messages").update({ est_lu: true })
      .eq("conversation_id", conversationId)
      .eq("destinataire_id", currentUserId)
      .eq("est_lu", false);
    const { data: conv } = await supabase.from("conversations").select("buyer_id, vendor_id").eq("id", conversationId).single();
    if (conv) {
      const isBuyer = conv.buyer_id === currentUserId;
      await supabase.from("conversations").update(
        isBuyer ? { unread_buyer: 0 } : { unread_vendor: 0 }
      ).eq("id", conversationId);
    }
  };

  const markSingleAsRead = async (msgId: string) => {
    await supabase.from("messages").update({ est_lu: true }).eq("id", msgId);
  };

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText("");
    inputRef.current?.focus();

    // Affichage instantane (optimistic)
    const tempMsg: Message = {
      id: "pending-" + Date.now(),
      conversation_id: conversationId,
      expediteur_id: currentUserId,
      destinataire_id: "",
      contenu: content,
      est_lu: false,
      created_at: new Date().toISOString(),
      pending: true,
    };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30);

    setSending(true);
    const { data: conv } = await supabase.from("conversations")
      .select("buyer_id, vendor_id, vendors(user_id)").eq("id", conversationId).single();
    if (!conv) { setSending(false); return; }

    const vendorUserId = (conv as any).vendors?.user_id;
    const isBuyer = conv.buyer_id === currentUserId;
    const destinataireId = isBuyer ? vendorUserId : conv.buyer_id;

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      expediteur_id: currentUserId,
      destinataire_id: destinataireId,
      contenu: content,
      est_lu: false,
    });

    await supabase.from("conversations").update({
      last_message: content,
      last_message_at: new Date().toISOString(),
      ...(isBuyer
        ? { unread_vendor: (await getUnread(conversationId, "vendor")) + 1 }
        : { unread_buyer: (await getUnread(conversationId, "buyer")) + 1 }),
    }).eq("id", conversationId);

    setSending(false);
  };

  const getUnread = async (convId: string, role: "buyer" | "vendor") => {
    const { data } = await supabase.from("conversations")
      .select(role === "buyer" ? "unread_buyer" : "unread_vendor").eq("id", convId).single();
    return (data as any)?.[role === "buyer" ? "unread_buyer" : "unread_vendor"] ?? 0;
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: string) => {
    const date = new Date(d);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Aujourd hui";
    if (date.toDateString() === yesterday.toDateString()) return "Hier";
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const grouped: { date: string; msgs: Message[] }[] = [];
  messages.forEach(m => {
    const date = formatDate(m.created_at);
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) last.msgs.push(m);
    else grouped.push({ date, msgs: [m] });
  });

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5]">

      {/* Header style WhatsApp */}
      <div className="bg-[#2B3090] px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow-md">
        {onBack && (
          <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 lg:hidden transition-colors">
            <TbArrowLeft size={18} />
          </button>
        )}
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden font-bold text-white text-sm bg-white/20 ring-2 ring-white/30">
          {otherAvatar
            ? <img src={otherAvatar} alt={otherName} className="w-full h-full object-cover" />
            : <span>{otherName?.[0]?.toUpperCase() ?? "?"}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{otherName}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <p className="text-white/70 text-xs">En ligne</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
            <TbX size={18} />
          </button>
        )}
      </div>

      {/* Produit info */}
      {produitInfo && (
        <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {produitInfo.image && <img src={produitInfo.image} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Discussion sur</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{produitInfo.name}</p>
          </div>
          {produitInfo.price !== undefined && (
            <p className="text-sm font-bold text-[#2B3090]">{formatPrice(produitInfo.price)}</p>
          )}
        </div>
      )}

      {/* Zone messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
        style={{ backgroundImage: "radial-gradient(circle, #d1d5db22 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
        {loading ? (
          <div className="flex justify-center py-8">
            <TbLoader2 className="animate-spin text-gray-400" size={24} />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <TbMessageCircle className="text-[#2B3090]" size={32} />
            </div>
            <p className="text-gray-500 text-sm font-medium">Aucun message</p>
            <p className="text-gray-400 text-xs mt-1">Dites bonjour a {otherName} !</p>
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.date}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-300/50" />
                <span className="text-[11px] text-gray-500 font-medium bg-white/80 px-3 py-0.5 rounded-full shadow-sm">
                  {group.date}
                </span>
                <div className="flex-1 h-px bg-gray-300/50" />
              </div>
              <div className="space-y-1">
                {group.msgs.map((msg) => {
                  const isMe = msg.expediteur_id === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}>
                      <div className={`max-w-[78%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div className={`px-3.5 py-2 text-sm leading-relaxed shadow-sm relative ${
                          isMe
                            ? "bg-[#2B3090] text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm"
                            : "bg-white text-gray-800 rounded-t-2xl rounded-br-2xl rounded-bl-sm"
                        } ${msg.pending ? "opacity-70" : "opacity-100"} transition-opacity duration-200`}>
                          {msg.contenu}
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
                          <span className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</span>
                          {isMe && (
                            msg.pending
                              ? <TbCheck size={12} className="text-gray-300" />
                              : msg.est_lu
                                ? <TbChecks size={12} className="text-blue-400" />
                                : <TbChecks size={12} className="text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input zone */}
      <div className="px-3 py-3 bg-[#f0f2f5] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-white rounded-full px-4 py-2.5 shadow-sm border border-gray-200 focus-within:border-[#2B3090]/30 transition-colors">
            <input
              ref={inputRef}
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
              placeholder="Ecrivez un message..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            className="w-11 h-11 bg-[#2B3090] rounded-full flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#1a1f6e] active:scale-95 transition-all flex-shrink-0 shadow-md"
          >
            {sending ? <TbLoader2 size={18} className="animate-spin" /> : <TbSend size={17} className="-rotate-0 translate-x-0.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}