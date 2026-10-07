"use client";

import React, { useState, useEffect } from "react";
import AdminShell from "@/components/AdminShell";
import {
  Server,
  Globe,
  Shield,
  FileText,
  ExternalLink,
  RefreshCw,
  HardDrive,
  AlertTriangle,
  Sparkles,
  Clock,
  CheckCircle2,
  Lock,
  Eye,
  Key,
  Phone,
  Save,
  Calendar,
  Zap,
  X
} from "lucide-react";
import { 
  fetchAdminCategories, 
  fetchAdminSiteMode, 
  updateAdminSiteMode, 
  SiteModeSettings 
} from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [latency, setLatency] = useState<number | null>(null);

  // Site Mode Settings State
  const [siteMode, setSiteMode] = useState<SiteModeSettings>({
    mode: "LIVE",
    headline: "ATELIER ARCHIVAL UPGRADE IN PROGRESS",
    message: "CALVIZ atelier is undergoing scheduled system enhancements. Order fulfillment desks remain active via WhatsApp concierge.",
    enableVipSignup: true,
    adminBypassKey: "calviz-preview-2025",
    supportPhone: "+94 70 490 1027",
    updatedAtUtc: new Date().toISOString(),
  });
  const [loadingMode, setLoadingMode] = useState(true);
  const [savingMode, setSavingMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const checkHealth = async () => {
    setApiStatus("checking");
    const start = performance.now();
    try {
      await fetchAdminCategories();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setApiStatus("online");
    } catch (err) {
      console.error("Backend health probe failed:", err);
      setApiStatus("offline");
      setLatency(null);
    }
  };

  const loadSiteMode = async () => {
    setLoadingMode(true);
    try {
      const data = await fetchAdminSiteMode();
      setSiteMode(data);
    } catch (err) {
      console.error("Failed to load site mode", err);
    } finally {
      setLoadingMode(false);
    }
  };

  useEffect(() => {
    checkHealth();
    loadSiteMode();
  }, []);

  // Helper for datetime-local input formatting in local timezone
  const toLocalDatetimeString = (dateIso?: string) => {
    if (!dateIso) return "";
    const d = new Date(dateIso);
    if (isNaN(d.getTime())) return "";
    const offset = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - offset);
    return local.toISOString().slice(0, 16);
  };

  const fromLocalDatetimeString = (localStr: string) => {
    if (!localStr) return undefined;
    const d = new Date(localStr);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  };

  const applyDatePreset = (hours: number) => {
    if (hours === 0) {
      setSiteMode({ ...siteMode, targetDateUtc: undefined });
      return;
    }
    const target = new Date(Date.now() + hours * 3600 * 1000);
    setSiteMode({ ...siteMode, targetDateUtc: target.toISOString() });
  };

  const targetDateFormatted = siteMode.targetDateUtc
    ? new Date(siteMode.targetDateUtc).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const handleSaveMode = async () => {
    setSavingMode(true);
    setSaveSuccess(false);
    try {
      const updated = await updateAdminSiteMode(siteMode);
      setSiteMode(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e: any) {
      alert("Failed to save site mode: " + (e.message || "Unknown error"));
    } finally {
      setSavingMode(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full pb-12">
      {/* Page Title - Center Aligned */}
      <div className="text-center space-y-2 py-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs font-mono text-slate-300 uppercase tracking-widest font-bold">
          <Globe className="w-3.5 h-3.5 text-white" />
          <span>PLATFORM GOVERNANCE // SETTINGS</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black uppercase text-white font-mono tracking-tight">
          SITE MODE &amp; PLATFORM CONTROL
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Toggle public storefront state between Live Store, Scheduled Maintenance, or Coming Soon Mode with custom headlines and anti-bot VIP allocation registration.
        </p>
      </div>

      {/* 1. STOREFRONT OPERATIONAL MODE CARD */}
      <div className="bg-[#0e1420] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase font-bold text-slate-400">
                  STOREFRONT STATUS
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  siteMode.mode === "LIVE"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : siteMode.mode === "MAINTENANCE"
                    ? "bg-amber-950 text-amber-300 border border-amber-800 animate-pulse"
                    : "bg-purple-950 text-purple-300 border border-purple-800 animate-pulse"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    siteMode.mode === "LIVE" ? "bg-emerald-400" : siteMode.mode === "MAINTENANCE" ? "bg-amber-400" : "bg-purple-400"
                  }`} />
                  {siteMode.mode === "LIVE" ? "STORE IS LIVE" : siteMode.mode === "MAINTENANCE" ? "MAINTENANCE MODE ACTIVE" : "COMING SOON MODE ACTIVE"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Choose what visitors see when navigating to your e-commerce storefront.
              </p>
            </div>

            {saveSuccess && (
              <div className="px-3 py-1.5 bg-emerald-900/60 border border-emerald-700 text-emerald-200 text-xs font-mono font-bold rounded-xl flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>SAVED SUCCESSFULLY</span>
              </div>
            )}
          </div>

          {/* Mode Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Live Mode */}
            <div
              onClick={() => setSiteMode({ ...siteMode, mode: "LIVE" })}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                siteMode.mode === "LIVE"
                  ? "bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/50"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/50 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                {siteMode.mode === "LIVE" && (
                  <Badge variant="success" className="text-[10px] font-mono">SELECTED</Badge>
                )}
              </div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">1. Live Store</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Normal catalog, cart, checkout, customer reviews, and order placing open to all visitors.
              </p>
            </div>

            {/* 2. Maintenance Mode */}
            <div
              onClick={() => setSiteMode({ ...siteMode, mode: "MAINTENANCE" })}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                siteMode.mode === "MAINTENANCE"
                  ? "bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/50"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-900/50 text-amber-400 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                {siteMode.mode === "MAINTENANCE" && (
                  <Badge className="bg-amber-500 text-black font-mono text-[10px] font-bold">ACTIVE</Badge>
                )}
              </div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">2. Maintenance Mode</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Displays a luxury animated maintenance screen with status pulse and WhatsApp concierge link.
              </p>
            </div>

            {/* 3. Coming Soon Mode */}
            <div
              onClick={() => setSiteMode({ ...siteMode, mode: "COMING_SOON" })}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                siteMode.mode === "COMING_SOON"
                  ? "bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/50"
                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-900/50 text-purple-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                {siteMode.mode === "COMING_SOON" && (
                  <Badge className="bg-purple-500 text-white font-mono text-[10px] font-bold">ACTIVE</Badge>
                )}
              </div>
              <h3 className="text-sm font-bold text-white font-mono uppercase">3. Coming Soon</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Displays an animated drop countdown timer, countdown clock, and early VIP access phone registration.
              </p>
            </div>
          </div>

          {/* Mode Customization Fields (When Maintenance or Coming Soon is active) */}
          {siteMode.mode !== "LIVE" && (
            <div className="p-5 sm:p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-5 animate-fade-in font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>CUSTOMIZE DISPLAY CONTENT &amp; TARGET DATE</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-bold uppercase">
                    Screen Headline
                  </label>
                  <input
                    type="text"
                    value={siteMode.headline}
                    onChange={(e) => setSiteMode({ ...siteMode, headline: e.target.value })}
                    placeholder="E.g. ARCHIVAL TEXTILE CALIBRATION"
                    className="w-full px-3.5 py-2.5 bg-[#0e1420] border border-slate-700 rounded-xl text-white text-xs font-sans font-medium focus:outline-none focus:border-white"
                  />
                </div>

                {/* Enhanced Date & Time Picker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 font-bold uppercase">
                      Target Reopen / Launch Date
                    </label>
                    {siteMode.targetDateUtc && (
                      <button
                        type="button"
                        onClick={() => applyDatePreset(0)}
                        className="text-[10px] text-rose-400 hover:text-rose-300 uppercase underline cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Clear Date</span>
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="datetime-local"
                      value={toLocalDatetimeString(siteMode.targetDateUtc)}
                      onChange={(e) =>
                        setSiteMode({
                          ...siteMode,
                          targetDateUtc: fromLocalDatetimeString(e.target.value),
                        })
                      }
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#0e1420] border border-slate-700 rounded-xl text-white text-xs font-mono font-medium focus:outline-none focus:border-white cursor-pointer"
                    />
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 uppercase mr-1 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" /> Presets:
                    </span>
                    <button
                      type="button"
                      onClick={() => applyDatePreset(2)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                    >
                      +2h
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset(6)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                    >
                      +6h
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset(24)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                    >
                      +24h (1 Day)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset(72)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                    >
                      +3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset(168)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                    >
                      +7 Days
                    </button>
                  </div>

                  {/* Live Target Preview Badge */}
                  {targetDateFormatted && (
                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center justify-between text-[11px] font-mono text-emerald-300 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Countdown Target: <strong>{targetDateFormatted}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold uppercase">
                  Public Announcement Message
                </label>
                <textarea
                  rows={3}
                  value={siteMode.message}
                  onChange={(e) => setSiteMode({ ...siteMode, message: e.target.value })}
                  placeholder="Explain why the store is in maintenance mode or tease the upcoming drop..."
                  className="w-full px-3.5 py-2.5 bg-[#0e1420] border border-slate-700 rounded-xl text-white text-xs font-sans font-medium focus:outline-none focus:border-white resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center gap-3">
                  <input
                    id="enableVip"
                    type="checkbox"
                    checked={siteMode.enableVipSignup}
                    onChange={(e) => setSiteMode({ ...siteMode, enableVipSignup: e.target.checked })}
                    className="w-4 h-4 rounded text-white bg-[#0e1420] border-slate-700 focus:ring-0"
                  />
                  <label htmlFor="enableVip" className="text-slate-300 font-bold uppercase cursor-pointer">
                    Enable VIP Mobile Signup Box on Storefront
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Public Storefront:</span>
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-200 hover:text-white underline flex items-center gap-1 font-bold"
              >
                <span>Open http://localhost:3000</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <Button
              onClick={handleSaveMode}
              disabled={savingMode}
              className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-200 font-mono text-xs font-bold uppercase px-6 py-2.5 shadow-md cursor-pointer"
            >
              <Save className={`w-3.5 h-3.5 mr-2 ${savingMode ? "animate-spin" : ""}`} />
              {savingMode ? "SAVING CONFIG..." : "SAVE SITE MODE"}
            </Button>
          </div>
        </div>

        {/* 2. BACKEND API TELEMETRY & HEALTH CARD */}
        <Card className="bg-[#0e1420] border-slate-800 text-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-mono uppercase text-white">.NET Core Web API Backend</CardTitle>
                <CardDescription className="font-mono text-xs text-slate-400">
                  {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5089/api"}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkHealth}
              className="font-mono text-xs font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${apiStatus === "checking" ? "animate-spin" : ""}`} />
              PROBE
            </Button>
          </CardHeader>

          <CardContent className="pt-2">
            <Separator className="mb-4 bg-slate-800" />
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Status:</span>
                {apiStatus === "checking" ? (
                  <span className="text-slate-400 flex items-center gap-1">Checking...</span>
                ) : apiStatus === "online" ? (
                  <Badge variant="success" className="gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Healthy &amp; Responding
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    Offline or Unreachable
                  </Badge>
                )}
              </div>

              {latency !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Roundtrip Latency:</span>
                  <span className="font-bold text-emerald-400">{latency} ms</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
