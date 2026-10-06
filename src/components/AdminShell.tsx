"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Palette,
  Landmark,
  MapPin,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  CheckCircle2,
  ShieldCheck,
  Star,
  MessageSquare,
  Sparkles,
  Ruler,
} from "lucide-react";
import { isAdminAuthenticated, getAdminUser, removeAdminToken } from "@/lib/auth";
import { fetchAdminOrders } from "@/lib/api";
import { OrderStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminShellProps {
  children: React.ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Products", href: "/products", icon: Package },
  { label: "Size Charts", href: "/size-charts", icon: Ruler },
  { label: "Offers & Banners", href: "/banners", icon: Sparkles },
  { label: "Reviews", href: "/reviews", icon: Star },
  { label: "Collections", href: "/categories", icon: Layers },
  { label: "Color Palette", href: "/colors", icon: Palette },
  { label: "Bank Accounts", href: "/bank-accounts", icon: Landmark },
  { label: "Delivery Cities", href: "/cities", icon: MapPin },
  { label: "Settings", href: "/settings", icon: Settings },
];


export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    setMounted(true);
    if (!isLoginPage) {
      if (!isAdminAuthenticated()) {
        router.push("/login");
      } else {
        setUser(getAdminUser());
      }
    }
  }, [pathname, isLoginPage, router]);

  // Poll for new pending orders
  useEffect(() => {
    if (isLoginPage) return;

    let isMounted = true;
    async function checkPendingOrders() {
      try {
        const res = await fetchAdminOrders({ orderStatus: "Pending" });
        if (isMounted && res) {
          const count = res.totalCount ?? res.items?.length ?? 0;
          setPendingOrdersCount(count);
        }
      } catch (e) {
        // Silently handle if unauthenticated or offline
      }
    }

    checkPendingOrders();
    const interval = setInterval(checkPendingOrders, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isLoginPage, pathname]);

  const handleLogout = () => {
    removeAdminToken();
    router.push("/login");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-500">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isLoginPage) {
    return <main className="min-h-screen bg-[#090d16]">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 h-screen bg-[#0e1420] border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xl tracking-[0.25em] font-extrabold text-white">
              CALVIZ
            </span>
            <Badge variant="secondary" className="text-[10px] tracking-wider uppercase font-semibold">
              Admin
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const isOrdersTab = item.href === "/orders";
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                    ? "bg-white text-slate-950 shadow-md font-semibold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>

                {isOrdersTab && pendingOrdersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black font-mono bg-red-600 text-white shadow-sm flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-ping" />
                    {pendingOrdersCount} NEW
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Utility & Profile */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Live Storefront
            </span>
            <span className="text-[10px] text-slate-500 font-mono">:3000</span>
          </a>

          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {user?.username || "Admin"}
                </p>
                <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Session
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sign Out"
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Offset by fixed sidebar */}
      <div className="md:pl-64 flex flex-col min-h-screen min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-6 bg-[#0e1420]/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-white md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-sm font-semibold text-slate-200 capitalize">
              {navItems.find((n) => pathname.startsWith(n.href))?.label || "Console"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="success" className="gap-1.5 py-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>API Online</span>
            </Badge>
          </div>
        </header>

        {/* Content Page */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
