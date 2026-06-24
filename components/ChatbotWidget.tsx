"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, RotateCcw, ShieldAlert, ArrowDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "USER" | "BOT";
  message: string;
  createdAt: Date | string;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true); // Default showing dot to grab attention
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Fetch initial chat history
  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/chatbot");
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewMessage(false);
    }
  }, [messages, isOpen, isTyping]);

  // Handle open/close
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  // Send Message
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Clear input
    setInputValue("");
    
    // Add user message locally first
    const tempUserMsg: Message = {
      id: Math.random().toString(),
      sender: "USER",
      message: text,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, data.reply]);
      } else {
        const errorMsg: Message = {
          id: Math.random().toString(),
          sender: "BOT",
          message: "Maaf, terjadi kesalahan teknis saat menghubungkan ke asisten. Silakan coba sesaat lagi.",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: "BOT",
        message: "Koneksi terputus. Silakan periksa jaringan internet Anda.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage(inputValue);
    }
  };

  // Reset Conversation
  const resetConversation = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus seluruh riwayat percakapan?")) return;
    
    try {
      const res = await fetch("/api/chatbot", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to reset conversation:", err);
    }
  };

  const quickQuestions = [
    "Bagaimana cara membayar pajak?",
    "Bagaimana cara mengunduh SPPT?",
    "Cek status pengajuan",
    "Lihat tagihan saya",
  ];

  return (
    <>
      {/* ── Floating Action Button (FAB) ── */}
      <button
        onClick={toggleChat}
        className={cn(
          "fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 group",
          isOpen 
            ? "bg-zinc-800 text-white hover:bg-zinc-700" 
            : "bg-primary text-white hover:shadow-2xl hover:shadow-primary/40 animate-pulse-subtle"
        )}
        aria-label="Tanya Asisten Pajak"
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-300 rotate-0 hover:rotate-90" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            {hasNewMessage && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-bounce" />
            )}
          </div>
        )}
      </button>

      {/* ── Chatbot Panel Container ── */}
      <div
        className={cn(
          "fixed z-[9998] transition-all duration-500 ease-out transform",
          "bottom-24 right-4 left-4 md:left-auto md:right-6",
          "w-[calc(100%-2rem)] md:w-[380px]",
          "h-[70vh] md:h-[600px]",
          "bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden",
          isOpen 
            ? "translate-y-0 opacity-100 pointer-events-auto scale-100" 
            : "translate-y-10 opacity-0 pointer-events-none scale-95"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-center justify-center shadow-md shadow-primary/5 overflow-hidden p-1.5 relative">
              <Image src="/logo.png" alt="Bapenda Logo" fill className="object-contain p-1" />
            </div>
            <div>
              <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-100 leading-none">Asisten Pajak Daerah</h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>
          
          {messages.length > 0 && (
            <button
              onClick={resetConversation}
              title="Reset Percakapan"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body (Messages) */}
        <div 
          ref={bodyRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/10 custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary animate-pulse">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div>
                <h5 className="font-black text-zinc-700 dark:text-zinc-300 text-sm">Selamat Datang di Asisten Pajak</h5>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs mt-1 leading-relaxed">
                  Tanyakan informasi seputar PBB-P2, cek tagihan, unduh SPPT, status pengajuan, dan panduan lainnya secara langsung.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isBot = msg.sender === "BOT";
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                      isBot ? "justify-start" : "justify-end"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm",
                        isBot
                          ? "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200"
                          : "bg-primary text-white"
                      )}
                    >
                      <p className="whitespace-pre-line font-medium">{msg.message}</p>
                      <span
                        className={cn(
                          "block text-[8px] mt-1.5 text-right font-black uppercase tracking-wider",
                          isBot ? "text-zinc-400 dark:text-zinc-500" : "text-white/60"
                        )}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start w-full animate-in fade-in duration-300">
              <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions Helper */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-[10px] font-bold text-primary dark:text-primary-foreground border border-primary/20 hover:border-primary hover:bg-primary/5 rounded-full px-3 py-1.5 transition-all text-left truncate max-w-full"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Footer Input */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 flex gap-2 items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ketik pertanyaan Anda..."
            className="flex-1 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:text-zinc-100"
          />
          <button
            onClick={() => sendMessage(inputValue)}
            className="w-10 h-10 bg-primary text-white hover:bg-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-all active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
