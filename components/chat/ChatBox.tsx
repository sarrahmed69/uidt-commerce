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
        setMessages(prev => [...prev, m]);
        if (m.destinataire_id === currentUserId) markSingleAsRead(m.id);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
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

    // Reset compteur non lu
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
    setSending(true);
    const content = text.trim();
    setText("");

    // Recuperer destinataire
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

    // Mettre a jour la conversation
    await supabase.from("conversations").update({
      last_message: content,
      last_message_at: new Date().toISOString(),
      ...(isBuyer ? { unread_vendor: (await getUnread(conversationId, "vendor")) + 1 } : { unread_buyer: (await getUnread(conversationId, "buyer")) + 1 }),
    }).eq("id", conversationId);

    setSending(false);
  };

  const getUnread = async (convId: string, role: "buyer" | "vendor") => {
    const { data } = await supabase.from("conversations").select(role === "buyer" ? "unread_buyer" : "unread_vendor").eq("id", convId).single();
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
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="bg-primary px-4 py-3 flex items-center gap-3 flex-shrink-0">
        {onBack && (
          <button onClick={onBack} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/90 hover:bg-white/20 lg:hidden">
            <TbArrowLeft size={16} />
          </button>
        )}
        <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden font-bold text-white text-sm">
          {otherAvatar ? <img src={otherAvatar} alt={otherName} className="w-full h-full object-cover" /> : otherName?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{otherName}</p>
          <p className="text-white/60 text-xs">En ligne</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/20">
            <TbX size={16} />
          </button>
        )}
      </div>

      {/* Produit info */}
      {produitInfo && (
        <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {produitInfo.image ? <img src={produitInfo.image} alt="" className="w-full h-full object-cover" /> : null}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">Discussion sur</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{produitInfo.name}</p>
          </div>
          {produitInfo.price !== undefined && <p className="text-sm font-bold text-primary">{formatPrice(produitInfo.price)}</p>}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8"><TbLoader2 className="animate-spin text-gray-400" size={24} /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <TbMessageCircle className="text-gray-400" size={28} />
            </div>
            <p className="text-gray-400 text-sm font-medium">Aucun message</p>
            <p className="text-gray-300 text-xs mt-1">Envoyez le premier message !</p>
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.date}>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">{group.date}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="space-y-1.5">
                {group.msgs.map((msg) => {
                  const isMe = msg.expediteur_id === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe ? "bg-primary text-white rounded-br-sm" : "bg-white text-gray-800 shadow-sm rounded-bl-sm border border-gray-100"
                        }`}>
                          {msg.contenu}
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "justify-end" : "justify-start"}`}>
                          <span className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</span>
                          {isMe && (msg.est_lu ? <TbChecks size={12} className="text-blue-400" /> : <TbCheck size={12} className="text-gray-400" />)}
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

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Ecrivez un message..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center text-white disabled:opacity-40 hover:bg-accent transition-colors flex-shrink-0"
          >
            {sending ? <TbLoader2 size={18} className="animate-spin" /> : <TbSend size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}