"use client";

import React, { useState, useEffect } from "react";
import {
  Server,
  Globe,
  Shield,
  FileText,
  ExternalLink,
  RefreshCw,
  HardDrive,
} from "lucide-react";
import { fetchAdminCategories } from "@/lib/api";
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

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
          System Settings & Platform Architecture
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Operational telemetry, backend connectivity, and enterprise service configurations.
        </p>
      </div>

      {/* Connectivity Health Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm">.NET Clean Architecture Backend</CardTitle>
              <CardDescription className="font-mono">
                {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5089/api"}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkHealth}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${apiStatus === "checking" ? "animate-spin" : ""}`} />
            Probe
          </Button>
        </CardHeader>

        <CardContent className="pt-2">
          <Separator className="mb-4" />
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Connection Status:</span>
              {apiStatus === "checking" ? (
                <span className="text-slate-400 flex items-center gap-1">Checking...</span>
              ) : apiStatus === "online" ? (
                <Badge variant="success" className="gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Healthy & Responding
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  Offline or Unreachable
                </Badge>
              )}
            </div>
            {latency !== null && (
              <div className="text-slate-400">
                Response Latency: <span className="text-white font-bold">{latency}ms</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Storefront Bridge */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-slate-400" />
              <CardTitle className="text-sm">Next.js Live Storefront</CardTitle>
            </div>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              Launch <ExternalLink className="w-3 h-3" />
            </a>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-slate-400">
              Consumer facing high-performance storefront running on port 3000 with real-time inventory synchronization.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-500">
              Port Allocation: <span className="text-slate-300">3000 (Store) / 3001 (Admin)</span>
            </div>
          </CardContent>
        </Card>

        {/* QuestPDF Invoicing Engine */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-slate-400" />
              <CardTitle className="text-sm">QuestPDF Invoicing Engine</CardTitle>
            </div>
            <Badge variant="success">Active</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-slate-400">
              Generates standardized tax receipts and commercial order manifests upon fulfillment progression.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-500">
              Engine: <span className="text-slate-300">Document Generator</span>
            </div>
          </CardContent>
        </Card>

        {/* Storage Service */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-slate-400" />
              <CardTitle className="text-sm">Bank Slip & Media Storage</CardTitle>
            </div>
            <Badge variant="secondary">Local / S3</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-slate-400">
              Stores customer transfer slips with secure HTTPS URL signatures for review in the fulfillment drawer.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-500">
              Static Root: <span className="text-slate-300">/uploads/bank-slips</span>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-slate-400" />
              <CardTitle className="text-sm">Administrator Access Control</CardTitle>
            </div>
            <Badge variant="purple">JWT Bearer</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-slate-400">
              Cryptographically signed JWT bearer tokens stored with client-side expiration handling.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-500">
              Default Account: <span className="text-slate-300">admin@calviz.com</span>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Low Stock Alert Configuration */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <CardTitle className="text-sm">Per-Product Low Stock Alert Threshold Engine</CardTitle>
            </div>
            <Badge variant="warning">Configurable</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-slate-400">
              Each garment item supports an independent stock safety buffer (Default: 5 units). When any size variant in warehouse inventory reaches or falls below its configured threshold, the operations deck and catalog trigger real-time warning badges and reorder indicators.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500">
              <div>Default Buffer: <span className="text-slate-300">5 units / variant</span></div>
              <div>Configurable via: <span className="text-slate-300">Product Create & Edit Specs Form</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
