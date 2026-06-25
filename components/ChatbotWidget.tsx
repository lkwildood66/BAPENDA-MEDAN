"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle, X, Send, RotateCcw, ChevronDown,
  Sparkles, FileText, HelpCircle, Home, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  sender: "USER" | "BOT";
  message: string;
  createdAt: Date | string;
  suggestions?: string[];
}

type Role = "DEVELOPER" | "ADMIN" | "OFFICER" | "USER" | "MAHASISWA" | null;

const roleActions: Record<string, { label: string; icon: React.ReactNode; query: string }[]> = {
  DEVELOPER: [
    { label: "Statistik Sistem", icon: <Home className="w-3.5 h-3.5" />, query: "Statistik sistem" },
    { label: "Audit Log", icon: <FileText className="w-3.5 h-3.5" />, query: "Audit log terbaru" },
    { label: "Monitoring", icon: <AlertTriangle className="w-3.5 h-3.5" />, query: "Monitoring sistem" },
  ],
  ADMIN: [
    { label: "Ringkasan Data", icon: <Home className="w-3.5 h-3.5" />, query: "Ringkasan data sistem" },
    { label: "Pengajuan Pending", icon: <FileText className="w-3.5 h-3.5" />, query: "Pengajuan pending" },
    { label: "Rekap Pembayaran", icon: <AlertTriangle className="w-3.5 h-3.5" />, query: "Rekap pembayaran bulan ini" },
  ],
  OFFICER: [
    { label: "Data Objek Pajak", icon: <Home className="w-3.5 h-3.5" />, query: "Data objek pajak" },
    { label: "Aktivitas Saya", icon: <FileText className="w-3.5 h-3.5" />, query: "Ringkasan aktivitas saya" },
    { label: "Mulai Penilaian", icon: <Sparkles className="w-3.5 h-3.5" />, query: "Cara memulai penilaian" },
  ],
  USER: [
    { label: "Cek Tagihan", icon: <AlertTriangle className="w-3.5 h-3.5" />, query: "Cek tagihan saya" },
    { label: "Lihat SPPT", icon: <FileText className="w-3.5 h-3.5" />, query: "Lihat SPPT saya" },
    { label: "Riwayat Bayar", icon: <Home className="w-3.5 h-3.5" />, query: "Riwayat pembayaran saya" },
    { label: "Status Pengajuan", icon: <HelpCircle className="w-3.5 h-3.5" />, query: "Status pengajuan saya" },
  ],
  MAHASISWA: [
    { label: "Cek Tagihan", icon: <AlertTriangle className="w-3.5 h-3.5" />, query: "Cek tagihan saya" },
    { label: "Lihat SPPT", icon: <FileText className="w-3.5 h-3.5" />, query: "Lihat SPPT saya" },
    { label: "Riwayat Bayar", icon: <Home className="w-3.5 h-3.5" />, query: "Riwayat pembayaran saya" },
    { label: "Status Pengajuan", icon: <HelpCircle className="w-3.5 h-3.5" />, query: "Status pengajuan saya" },
  ],
};

const guestActions = [
  { label: "Cara Login", icon: <HelpCircle className="w-3.5 h-3.5" />, query: "Bagaimana cara login?" },
  { label: "Buat Akun", icon: <Sparkles className="w-3.5 h-3.5" />, query: "Cara buat akun baru" },
  { label: "Cek Tagihan", icon: <AlertTriangle className="w-3.5 h-3.5" />, query: "Cek tagihan saya" },
  { label: "Info Pajak", icon: <FileText className="w-3.5 h-3.5" />, query: "Apa itu PBB?" },
];

function getRoleLabel(role: Role): string {
  const labels: Record<string, string> = {
    DEVELOPER: "Super Admin",
    ADMIN: "Admin",
    OFFICER: "Petugas Lapangan",
    USER: "Wajib Pajak",
    MAHASISWA: "Mahasiswa",
  };
  return labels[role ?? ""] || "Pengunjung";
}

export function ChatbotWidget() {
  const { data: session } = useSession();
  const role = (session?.user?.role || null) as Role;
  const isLoggedIn = !!session?.user?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Fetch history ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/chatbot");
        const data = await res.json();
        if (data.success && data.messages) {
          setMessages(data.messages);
        }
      } catch { /* silent */ }
    };
    fetchHistory();
  }, []);

  // ── Auto scroll ────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isTyping, isOpen, scrollToBottom]);

  // ── Focus input when panel opens ────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasUnread(false);
    }
  }, [isOpen]);

  // ── Handle toggle ──────────────────────────────────────────────────────
  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) setHasUnread(false);
  };

  // ── Send message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setInputValue("");

    const tempId = crypto.randomUUID();
    const tempUserMsg: Message = {
      id: tempId,
      sender: "USER",
      message: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errorBot: Message = {
          id: crypto.randomUUID(),
          sender: "BOT",
          message: errData.error || "Maaf, terjadi kesalahan. Silakan coba lagi.",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorBot]);
        return;
      }

      const data = await res.json();
      if (data.success && data.reply) {
        const botMsg: Message = {
          id: data.reply.id || crypto.randomUUID(),
          sender: "BOT",
          message: data.reply.message,
          createdAt: data.reply.createdAt || new Date().toISOString(),
          suggestions: data.reply.suggestions,
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch {
      const errorBot: Message = {
        id: crypto.randomUUID(),
        sender: "BOT",
        message: "Koneksi terputus. Silakan periksa jaringan internet Anda.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorBot]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  // ── Key handler ─────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────────
  const resetConversation = async () => {
    if (messages.length === 0) return;
    try {
      await fetch("/api/chatbot", { method: "DELETE" });
      setMessages([]);
    } catch { /* silent */ }
  };

  // ── Suggestion click ────────────────────────────────────────────────────
  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  // ── Get actions for current role ─────────────────────────────────────────
  const currentActions = isLoggedIn
    ? roleActions[role ?? "USER"] || roleActions.USER
    : guestActions;

  // ── Format time ─────────────────────────────────────────────────────────
  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "baru saja";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} mnt`;
    if (diff < 86400000) return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <>
      {/* ── Floating Chat Button ─────────────────────────────────────────── */}
      <button
        onClick={toggleChat}
        aria-label={isOpen ? "Tutup chat" : "Buka chat"}
        className={cn(
          "fixed bottom-6 right-6 z-[9999] group cursor-pointer",
          "transition-all duration-300 hover:scale-105 active:scale-95",
        )}
      >
        {/* Tooltip */}
        <span className={cn(
          "absolute -top-10 right-0 bg-zinc-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl",
          "whitespace-nowrap shadow-lg transition-all duration-300",
          "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none",
        )}>
          Tanya Asisten Pajak
        </span>

        {/* Button */}
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl",
          "transition-all duration-500 ease-out",
          isOpen
            ? "bg-zinc-800 text-white rotate-90 scale-90 shadow-zinc-800/30"
            : "bg-[#1E40AF] text-white shadow-[#1E40AF]/30 hover:shadow-[#1E40AF]/50",
        )}>
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </div>

        {/* Unread badge */}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
        )}
      </button>

      {/* ── Chat Panel ───────────────────────────────────────────────────── */}
      <div
        ref={panelRef}
        className={cn(
          "fixed z-[9998] flex flex-col overflow-hidden",
          "transition-all duration-500 ease-out transform",
          "bottom-24 right-6",
          "w-[380px] h-[600px]",
          "max-[480px]:bottom-0 max-[480px]:right-0 max-[480px]:w-full max-[480px]:h-[85vh] max-[480px]:rounded-none",
          "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl",
          isOpen
            ? "translate-y-0 opacity-100 pointer-events-auto scale-100"
            : "translate-y-8 opacity-0 pointer-events-none scale-95",
        )}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="shrink-0 bg-gradient-to-r from-[#1E40AF] to-[#2563EB] text-white">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold leading-tight truncate">Asisten Pajak BAPENDA</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-semibold text-emerald-200 uppercase tracking-wider">Online</span>
                  {session?.user?.name && (
                    <>
                      <span className="text-white/30 mx-1">|</span>
                      <span className="text-[10px] text-white/70 truncate max-w-[100px]">{session.user.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={resetConversation}
                disabled={messages.length === 0}
                title="Hapus percakapan"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={toggleChat}
                title="Tutup"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Messages ────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-zinc-50/80 dark:bg-zinc-900/20">
          {messages.length === 0 ? (
            /* ── Empty state ─────────────────────────────────────────────── */
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-6">
              <div className="w-16 h-16 rounded-2xl bg-[#1E40AF]/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-[#1E40AF]" />
              </div>
              <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                Selamat Datang{isLoggedIn && session?.user?.name ? `, ${session.user.name}` : ""}
              </h4>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs leading-relaxed">
                Saya adalah asisten digital BAPENDA Medan. Silakan pilih menu di bawah atau ketik pertanyaan Anda.
              </p>

              {/* Role-based quick actions */}
              <div className="mt-5 w-full max-w-xs space-y-1.5">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-left">
                  {isLoggedIn ? `Menu Cepat — ${getRoleLabel(role)}` : "Menu Cepat"}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {currentActions.map((act) => (
                    <button
                      key={act.label}
                      onClick={() => sendMessage(act.query)}
                      className={cn(
                        "flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2.5 rounded-xl",
                        "border border-zinc-200 dark:border-zinc-700",
                        "bg-white dark:bg-zinc-900",
                        "text-zinc-600 dark:text-zinc-300",
                        "hover:border-[#1E40AF]/30 hover:text-[#1E40AF] dark:hover:text-[#1E40AF]",
                        "transition-all text-left leading-tight",
                      )}
                    >
                      <span className="shrink-0 opacity-60">{act.icon}</span>
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ── Message list ─────────────────────────────────────────────── */
            <div className="space-y-3">
              {messages.map((msg) => {
                const isBot = msg.sender === "BOT";
                return (
                  <div key={msg.id} className={cn("flex", isBot ? "justify-start" : "justify-end")}>
                    <div className={cn(
                      "max-w-[88%] space-y-1",
                      isBot ? "order-1" : "order-1",
                    )}>
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm",
                        isBot
                          ? "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-tl-sm"
                          : "bg-[#1E40AF] text-white rounded-tr-sm",
                      )}>
                        <p className="whitespace-pre-line font-medium">{msg.message}</p>
                      </div>
                      <div className={cn(
                        "flex items-center gap-2 px-1",
                        isBot ? "justify-start" : "justify-end",
                      )}>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>

                      {/* Sugestion chips */}
                      {isBot && msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleSuggestionClick(s)}
                              className="text-[10px] font-semibold text-[#1E40AF] dark:text-blue-400 border border-[#1E40AF]/20 dark:border-blue-400/30 hover:bg-[#1E40AF]/5 dark:hover:bg-blue-400/10 rounded-full px-3 py-1.5 transition-all"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Quick actions bar (shown when messages exist) ─────────────── */}
        {messages.length > 0 && (
          <div className="shrink-0 px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-x-auto">
            <div className="flex gap-1.5">
              {currentActions.slice(0, 4).map((act) => (
                <button
                  key={act.label}
                  onClick={() => sendMessage(act.query)}
                  className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-[#1E40AF]/30 hover:text-[#1E40AF] dark:hover:text-blue-400 rounded-full px-3 py-1.5 transition-all whitespace-nowrap shrink-0"
                >
                  {act.icon}
                  {act.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input Area ──────────────────────────────────────────────────── */}
        <div className="shrink-0 px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pertanyaan Anda..."
              maxLength={1000}
              className={cn(
                "flex-1 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-900",
                "border border-zinc-200 dark:border-zinc-800",
                "rounded-xl text-xs",
                "focus:outline-none focus:border-[#1E40AF]/40 focus:ring-2 focus:ring-[#1E40AF]/10",
                "dark:text-zinc-100 placeholder:text-zinc-400",
                "transition-all",
              )}
              disabled={isTyping}
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                inputValue.trim() && !isTyping
                  ? "bg-[#1E40AF] text-white shadow-lg shadow-[#1E40AF]/20 hover:bg-[#1E40AF]/90 active:scale-95"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed",
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-600 mt-1.5 text-center font-medium">
            Asisten Pajak BAPENDA Medan — Powered by SIPADA
          </p>
        </div>
      </div>
    </>
  );
}
