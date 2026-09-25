import React, { useState, useRef, useEffect } from "react";
import { FONT_DISPLAY } from "@/theme";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import {
  ChatText,
  WhatsappLogo,
  DeviceMobile,
  Cpu,
  MapTrifold,
  CheckCircle,
  PaperPlaneRight,
  ShieldCheck,
  Broadcast,
  ArrowRight,
  ArrowClockwise,
  Sparkle,
} from "@phosphor-icons/react";

const INITIAL_MESSAGES = [
  {
    id: "init-1",
    sender: "user",
    text: "Big deep pothole on MG Road near IFFCO Chowk metro pillar 142. Two scooters slipped this morning. Water is filling up inside.",
    time: "09:38 AM",
    source: "Sent via SMS",
  },
  {
    id: "init-2",
    sender: "bot",
    type: "report_card",
    ticketId: "RW-8492",
    location: "MG Road, Metro Pillar 142",
    hazard: "Critical Pothole & Slip Risk",
    routed: "PWD Gurugram (Zone 2)",
    time: "09:38 AM",
    source: "Automated Dispatch",
  },
  {
    id: "init-3",
    sender: "user",
    text: "STATUS",
    time: "10:15 AM",
    source: "Sent via SMS",
  },
  {
    id: "init-4",
    sender: "bot",
    type: "status_card",
    text: "🚜 Work Scheduled: Crew assigned under Eng. R. Sharma (PWD). Expected patch repair within 48 hours.",
    time: "10:15 AM",
  },
];

const QUICK_PROMPTS = [
  { label: "Pothole on MG Road", text: "Deep pothole on MG Road near Metro Pillar 142. Traffic slowing down." },
  { label: "Flooding at Cyber Hub", text: "Severe waterlogging at DLF Cyber City gateway underpass. Drain is clogged." },
  { label: "Broken Lights NH-48", text: "Streetlights not working on NH-48 near Kherki Daula. Pitch dark." },
  { label: "Reply STATUS", text: "STATUS" },
];

function formatCurrentTime() {
  try {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Just now";
  }
}

function parseHazardNLP(text) {
  const lower = text.toLowerCase();
  
  // Location extraction
  let location = "MG Road, Gurugram";
  if (lower.includes("iffco") || lower.includes("pillar 142")) {
    location = "MG Road, near IFFCO Chowk Metro Pillar 142";
  } else if (lower.includes("cyber city") || lower.includes("cyber hub")) {
    location = "DLF Cyber City Gateway Underpass";
  } else if (lower.includes("nh-48") || lower.includes("nh 48") || lower.includes("highway") || lower.includes("kherki")) {
    location = "Delhi-Jaipur Highway (NH-48), Kherki Daula";
  } else if (lower.includes("ring road")) {
    location = "Ring Road Flyover, New Delhi";
  } else if (lower.includes("sohna")) {
    location = "Sohna Elevated Expressway";
  } else if (/sector\s*\d+/i.test(text)) {
    const match = text.match(/sector\s*\d+/i);
    location = `${match[0].toUpperCase()} Main Corridor`;
  } else {
    const words = text.split(" ").slice(0, 4).join(" ");
    location = words.length > 5 ? words.replace(/[.,]/g, "") : "Sector 14 Arterial Road";
  }

  // Hazard classification
  let hazard = "Road Surface Distress & Commuter Risk";
  let authority = "PWD Gurugram (Zone 2)";

  if (lower.includes("pothole") || lower.includes("crater") || lower.includes("pit") || lower.includes("slip")) {
    hazard = "Critical Pothole & Slip Risk";
  } else if (lower.includes("water") || lower.includes("flood") || lower.includes("drain") || lower.includes("waterlog")) {
    hazard = "Severe Waterlogging & Drainage Blockage";
    authority = "MCD Municipal Drainage Div";
  } else if (lower.includes("light") || lower.includes("dark") || lower.includes("lamp") || lower.includes("pole")) {
    hazard = "Streetlight Outage / Zero Visibility";
    authority = "MCD Electrical Maintenance";
  } else if (lower.includes("garbage") || lower.includes("trash") || lower.includes("debris") || lower.includes("waste")) {
    hazard = "Construction Debris & Road Encroachment";
    authority = "MCD Sanitation Command";
  } else if (lower.includes("divider") || lower.includes("barrier") || lower.includes("median")) {
    hazard = "Damaged Divider & Structural Impact Risk";
  }

  if (location.includes("NH-48") || location.includes("Highway") || location.includes("Expressway")) {
    authority = "NHAI Northern Corridor Division";
  }

  const ticketId = `RW-${Math.floor(1000 + Math.random() * 9000)}`;

  return { location, hazard, authority, ticketId };
}

export default function SmsReportingSection() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState("RW-8492");

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat when new messages arrive or typing status changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const query = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!query || isTyping) return;

    const time = formatCurrentTime();
    const isStatusQuery = /status|track|update/i.test(query);

    // 1. Append User message immediately
    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      time,
      source: "Sent via SMS",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Try posting to backend API in parallel (non-blocking)
    try {
      fetch("/api/reports/sms-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      }).catch(() => {});
    } catch {
      // Ignored: client-side engine guarantees instant response
    }

    // 2. Realistic response delay for NLP parsing & bot dispatching
    setTimeout(() => {
      setIsTyping(false);

      if (isStatusQuery) {
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          type: "status_card",
          text: `🚜 Work Scheduled: Inspection team assigned for #${activeTicketId}. Eng. R. Sharma (PWD) verified repair crew. SLA: Under 48 hours.`,
          time: formatCurrentTime(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const parsed = parseHazardNLP(query);
        setActiveTicketId(parsed.ticketId);

        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          type: "report_card",
          ticketId: parsed.ticketId,
          location: parsed.location,
          hazard: parsed.hazard,
          routed: parsed.authority,
          time: formatCurrentTime(),
          source: "Automated Dispatch",
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    }, 750);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    setInputText("");
    setIsTyping(false);
    setActiveTicketId("RW-8492");
    if (inputRef.current) inputRef.current.focus();
  };

  const handleQuickPromptClick = (text) => {
    handleSendMessage(text);
  };

  const handleCheckStatus = (ticket) => {
    setActiveTicketId(ticket || activeTicketId);
    handleSendMessage("STATUS");
  };

  const steps = [
    {
      step: "01",
      icon: ChatText,
      title: "Text / WhatsApp",
      desc: "Citizen sends a simple text description and landmark in Hindi or English to +91 98712 34567 or shortcode 56161.",
      detail: "No app download, login, or mobile internet required.",
    },
    {
      step: "02",
      icon: Cpu,
      title: "Auto-Parsed into a Report",
      desc: "Fast NLP parses road name, landmark, and hazard severity, assigning an official tracking ID with jurisdiction routing.",
      detail: "Extracts location, assigns PWD/NHAI/MCD department in seconds.",
    },
    {
      step: "03",
      icon: MapTrifold,
      title: "Appears on Map & Timeline",
      desc: "Instantly logs into the open civic database, entering the 9-stage verification timeline with SMS status updates.",
      detail: "Citizen receives SMS updates as crews inspect & resolve.",
    },
  ];

  return (
    <section id="sms-reporting" className="relative py-24 asphalt-bg overflow-hidden" data-testid="sms-reporting-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow text="/ OFFLINE & ACCESSIBILITY HOTLINE" />
            <h2 className={`${FONT_DISPLAY} text-4xl md:text-5xl text-[#F2EFE9] mt-1 leading-[1.08]`}>
              Civic reporting for <span className="text-[#E59518]">every citizen.</span>
            </h2>
            <p className="mt-3 text-base md:text-lg text-[#A39E93] leading-relaxed">
              Not everyone has a high-end smartphone or unlimited data plan. RoadWatch operates an automated 24/7 SMS and
              WhatsApp hotline that empowers daily commuters, auto drivers, and senior citizens to log road hazards in seconds.
            </p>
          </div>
        </Reveal>

        {/* Interactive Phone Mockup Card + Twilio integration showcase */}
        <Reveal delay={150} className="mt-12">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Phone Mockup (5 cols on lg) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-[36px] bg-[#0E0E10] border-4 border-zinc-800 shadow-2xl overflow-hidden relative flex flex-col">
                
                {/* Smartphone Top Notch & Status Bar */}
                <div className="bg-[#141416] px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono text-[#A39E93] border-b border-white/[0.04] select-none">
                  <span className="font-semibold text-[#F2EFE9]">09:41</span>
                  <div className="w-20 h-3.5 bg-black/80 rounded-full" />
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="font-semibold">5G</span>
                    <span className="w-4 h-2 rounded-sm border border-zinc-400 inline-block bg-[#3EA370]" />
                  </div>
                </div>

                {/* Chat App Header */}
                <div className="bg-[#141416] px-4 py-3 flex items-center justify-between border-b border-white/[0.06] select-none">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#E59518]/10 border border-[#E59518]/25 flex items-center justify-center text-[#E59518] shrink-0">
                      <WhatsappLogo size={20} weight="fill" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[#F2EFE9]">RoadWatch Hotline</span>
                        <ShieldCheck size={14} className="text-[#E59518]" weight="fill" />
                      </div>
                      <div className="text-[10px] text-[#3EA370] font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3EA370] animate-pulse" />
                        +91 98712 34567 · Official Bot
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetChat}
                      title="Reset chat simulation"
                      className="text-[#78736A] hover:text-[#F2EFE9] bg-white/[0.04] hover:bg-white/[0.08] p-1.5 rounded transition-colors"
                    >
                      <ArrowClockwise size={13} />
                    </button>
                    <span className="text-[10px] text-[#78736A] font-mono bg-white/[0.04] px-2 py-0.5 rounded">
                      TOLL FREE
                    </span>
                  </div>
                </div>

                {/* Chat Message Stream */}
                <div
                  ref={chatContainerRef}
                  className="p-4 space-y-3.5 bg-[#0A0A0C] h-[370px] overflow-y-auto flex flex-col text-xs scroll-smooth"
                  data-testid="sms-chat-stream"
                >
                  {/* Date badge */}
                  <div className="text-center select-none py-1">
                    <span className="text-[10px] font-mono text-[#78736A] bg-white/[0.04] px-2.5 py-0.5 rounded-full">
                      TODAY
                    </span>
                  </div>

                  {messages.map((msg) => {
                    if (msg.sender === "user") {
                      return (
                        <div key={msg.id} className="flex flex-col items-end">
                          <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#E59518] text-[#0E0E10] p-3 shadow font-medium leading-relaxed break-words">
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-[#78736A] mt-1 font-mono">
                            {msg.time} {msg.source ? `· ${msg.source}` : ""}
                          </span>
                        </div>
                      );
                    }

                    if (msg.type === "report_card") {
                      return (
                        <div key={msg.id} className="flex flex-col items-start w-full">
                          <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-[#18181B] border border-[#E59518]/30 text-[#F2EFE9] p-3 shadow-md leading-relaxed">
                            <div className="font-bold text-[#E59518] flex items-center gap-1.5 text-[11px] mb-1.5">
                              <CheckCircle size={15} weight="fill" /> REPORT FILED: #{msg.ticketId}
                            </div>
                            <div className="text-[11px] space-y-1 text-[#F2EFE9]/90 font-mono">
                              <div className="break-words">📍 {msg.location}</div>
                              <div className="break-words">⚠️ Hazard: {msg.hazard}</div>
                              <div className="break-words">🏛️ Routed: {msg.routed}</div>
                            </div>
                            <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-[10px] text-[#A39E93]">
                                Track at <strong className="text-[#E59518]">roadwatch.in/t/{msg.ticketId}</strong> or reply <code className="text-[#F2EFE9]">STATUS</code>
                              </p>
                              <button
                                type="button"
                                onClick={() => handleCheckStatus(msg.ticketId)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#E59518]/15 hover:bg-[#E59518]/25 text-[#E59518] text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                              >
                                Check STATUS →
                              </button>
                            </div>
                          </div>
                          <span className="text-[9px] text-[#78736A] mt-1 font-mono">
                            {msg.time} · Automated Dispatch
                          </span>
                        </div>
                      );
                    }

                    if (msg.type === "status_card") {
                      return (
                        <div key={msg.id} className="flex flex-col items-start w-full">
                          <div className="max-w-[90%] rounded-xl rounded-tl-sm bg-[#18181B] border border-[#3EA370]/30 text-[#F2EFE9] p-2.5 text-[11px] leading-relaxed">
                            <span className="text-[#3EA370] font-semibold">{msg.text}</span>
                          </div>
                          <span className="text-[9px] text-[#78736A] mt-0.5 font-mono">
                            {msg.time} · Realtime Dispatch Sync
                          </span>
                        </div>
                      );
                    }

                    return null;
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex flex-col items-start">
                      <div className="rounded-xl rounded-tl-sm bg-[#18181B] border border-white/[0.08] px-3 py-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E59518] animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E59518] animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E59518] animate-bounce" style={{ animationDelay: "300ms" }} />
                        <span className="text-[10px] text-[#A39E93] font-mono ml-1">Parsing landmark & dispatching...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Chips */}
                <div className="bg-[#141416] px-3 py-2 border-t border-white/[0.04] flex items-center gap-1.5 overflow-x-auto select-none">
                  <span className="text-[9px] font-mono text-[#78736A] shrink-0 uppercase tracking-wider">Try:</span>
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => handleQuickPromptClick(prompt.text)}
                      disabled={isTyping}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono text-[#A39E93] hover:text-[#F2EFE9] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] whitespace-nowrap transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>

                {/* Mockup Active Message Form */}
                <form
                  onSubmit={handleFormSubmit}
                  className="bg-[#141416] p-2.5 border-t border-white/[0.06] flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Text a road issue or 'STATUS'..."
                    disabled={isTyping}
                    className="flex-1 bg-white/[0.05] border border-white/[0.08] focus:border-[#E59518]/60 focus:bg-white/[0.08] rounded-full px-3.5 py-1.5 text-xs text-[#F2EFE9] placeholder-[#78736A] outline-none transition-all disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isTyping}
                    className="w-8 h-8 rounded-full bg-[#E59518] hover:bg-[#F2A229] disabled:opacity-30 disabled:hover:bg-[#E59518] flex items-center justify-center text-[#0E0E10] transition-colors shrink-0 cursor-pointer shadow"
                    title="Send SMS"
                  >
                    <PaperPlaneRight size={14} weight="bold" />
                  </button>
                </form>
              </div>
            </div>

            {/* Description & Impact Details (7 cols on lg) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="rounded-2xl p-6 md:p-8 border border-white/[0.08] bg-[#141416]/95 backdrop-blur-md">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-[#E59518] bg-[#E59518]/10 border border-[#E59518]/25 mb-4">
                  <Broadcast size={14} className="animate-pulse" />
                  TWO-WAY MULTI-CHANNEL TELEPHONY
                </div>

                <h3 className={`${FONT_DISPLAY} text-2xl md:text-3xl text-[#F2EFE9] font-bold leading-tight`}>
                  Zero app required. Just text the road problem.
                </h3>

                <p className="mt-3 text-sm md:text-base text-[#A39E93] leading-relaxed">
                  Citizens on basic feature phones or intermittent 2G coverage can send an SMS or WhatsApp voice note.
                  The RoadWatch NLP pipeline parses landmarks, cross-references municipal boundary maps, and issues an
                  immediate confirmation with live ticket tracking.
                </p>

                {/* Twilio & WhatsApp callout */}
                <div className="mt-6 p-4 rounded-xl bg-[#E59518]/[0.08] border border-[#E59518]/25 flex items-start gap-3">
                  <DeviceMobile size={22} className="text-[#E59518] shrink-0 mt-0.5" />
                  <div className="text-xs md:text-sm text-[#F2EFE9]">
                    <strong className="text-[#E59518] block font-semibold mb-0.5">
                      Enterprise Communication Infrastructure
                    </strong>
                    "Powered by Twilio / WhatsApp Business API — reaches citizens without smartphones or data plans."
                  </div>
                </div>

                {/* Key stats row */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-white/[0.06] text-center">
                  <div className="p-3 rounded-lg bg-[#0E0E10]/80 border border-white/[0.05]">
                    <div className="font-display font-black text-2xl text-[#E59518]">48%</div>
                    <div className="text-[11px] text-[#A39E93] font-mono mt-0.5">Reports via SMS/Chat</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0E0E10]/80 border border-white/[0.05]">
                    <div className="font-display font-black text-2xl text-[#F2EFE9]">&lt; 3 sec</div>
                    <div className="text-[11px] text-[#A39E93] font-mono mt-0.5">Automated Ticket ID</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0E0E10]/80 border border-white/[0.05] col-span-2 sm:col-span-1">
                    <div className="font-display font-black text-2xl text-[#3EA370]">100%</div>
                    <div className="text-[11px] text-[#A39E93] font-mono mt-0.5">Open Database Sync</div>
                  </div>
                </div>

                {/* Interactive CTA to test the simulator */}
                <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#A39E93]">
                    <Sparkle size={14} className="text-[#E59518]" weight="fill" />
                    <span>Try testing the interactive phone simulator on the left</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (inputRef.current) {
                        inputRef.current.focus();
                        inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#E59518] hover:bg-[#F2A229] text-[#0E0E10] transition-colors cursor-pointer shadow-sm"
                  >
                    <span>Test Hotline Simulator</span>
                    <ArrowRight size={13} weight="bold" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 3-Step Visual below using existing STEP / number pattern */}
        <Reveal delay={250} className="mt-12">
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map(({ step, icon: Icon, title, desc, detail }) => (
              <div
                key={step}
                data-testid={`sms-step-${step}`}
                className="rounded-2xl border border-white/[0.08] bg-[#141416]/95 p-6 flex flex-col justify-between transition-all duration-300 hover:border-[#E59518]/30 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-11 h-11 rounded-lg bg-[#E59518]/10 border border-[#E59518]/25 flex items-center justify-center">
                      <Icon size={22} className="text-[#E59518]" weight="duotone" />
                    </div>
                    <span className="font-mono text-xs font-bold text-[#E59518]">
                      STEP {step}
                    </span>
                  </div>

                  <h4 className={`${FONT_DISPLAY} text-lg md:text-xl text-[#F2EFE9] font-bold`}>
                    {title}
                  </h4>

                  <p className="mt-2 text-xs md:text-sm text-[#A39E93] leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/[0.04] text-[11px] text-[#78736A] font-mono flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#E59518]" /> {detail}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Section bottom dashed amber lane divider */}
        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
