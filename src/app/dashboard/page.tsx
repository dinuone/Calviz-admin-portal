"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  FileCheck,
  ArrowUpRight,
  AlertTriangle,
  Package,
  Palette,
  Eye,
  RefreshCw,
} from "lucide-react";
import { fetchAdminOrders, fetchAdminProducts, fetchAdminReviews } from "@/lib/api";
import { OrderSummaryAdmin, Product, AdminReview } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Star, MessageSquare } from "lucide-react";

export default function DashboardPage() {
  const [orders, setOrders] = useState<OrderSummaryAdmin[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingReviews, setPendingReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [orderRes, productRes, reviewsRes] = await Promise.all([
        fetchAdminOrders({ pageSize: 20 }),
        fetchAdminProducts(),
        fetchAdminReviews({ status: "pending", pageSize: 20 }).catch(() => ({ items: [] })),
      ]);
      setOrders(orderRes.items || []);
      setProducts(productRes || []);
      setPendingReviews(reviewsRes.items || []);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Helper to check if bank slip / payment is approved
  const isPaymentApproved = (o: { paymentStatus?: string; bankSlipApproved?: boolean | null }) => {
    const ps = String(o.paymentStatus || "").toLowerCase();
    return ps === "paid" || ps === "verified" || ps === "2" || o.bankSlipApproved === true;
  };

  const renderFulfillmentBadge = (status: string | any) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "pending":
      case "placed":
      case "1":
        return (
          <Badge variant="amber" className="gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {status}
          </Badge>
        );
      case "processing":
      case "2":
        return (
          <Badge variant="cyan" className="gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            {status}
          </Badge>
        );
      case "shipped":
      case "dispatched":
      case "3":
        return (
          <Badge variant="indigo" className="gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            {status}
          </Badge>
        );
      case "delivered":
      case "4":
        return (
          <Badge variant="success" className="gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {status}
          </Badge>
        );
      case "cancelled":
      case "5":
        return (
          <Badge variant="destructive" className="gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            {status}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Metrics computation
  const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const unverifiedSlips = orders.filter(
    (o) => o.paymentMethod === "BankTransfer" && o.hasBankSlip && !isPaymentApproved(o)
  );
  const pendingOrders = orders.filter((o) => o.orderStatus === "Placed" || o.orderStatus === "Processing");
  const lowStockCount = products.filter((p) => {
    const threshold = p.lowStockThreshold ?? 5;
    return p.variants?.some((v) => v.stockQuantity <= threshold);
  }).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
            CALVIZ Operations Deck
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time pipeline telemetry, manual bank slip approvals, and inventory status.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Feed
          </Button>
          <Button asChild variant="outline" size="sm" className="bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white">
            <Link href="/colors">
              <Palette className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Color Palette
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-white text-slate-950 hover:bg-slate-200 font-bold">
            <Link href="/products/new">
              <Package className="w-3.5 h-3.5 mr-1.5" />
              New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Unverified Slips Banner Alert if any exist */}
      {unverifiedSlips.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-200">
                Action Required: {unverifiedSlips.length} Bank Transfer Slip(s) Pending Approval
              </h3>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Customers have uploaded payment receipts awaiting your verification before fulfillment.
              </p>
            </div>
          </div>
          <Button asChild variant="default" size="sm" className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shrink-0">
            <Link href="/orders?filter=unverified">Review Slips Now</Link>
          </Button>
        </div>
      )}

      {/* Pending Customer Reviews Banner Alert */}
      {pendingReviews.length > 0 && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-indigo-200">
                Action Required: {pendingReviews.length} New Customer Review(s) Awaiting Moderation
              </h3>
              <p className="text-xs text-indigo-300/80 mt-0.5">
                Customers have submitted reviews and fitting photos. Verify and approve to publish social proof.
              </p>
            </div>
          </div>
          <Button asChild variant="default" size="sm" className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold shrink-0">
            <Link href="/reviews?filter=pending">Moderate Reviews ({pendingReviews.length})</Link>
          </Button>
        </div>
      )}

      {/* 4 Stat Cards using shadcn Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Gross Volume
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-white">
              LKR {totalRevenue.toLocaleString()}
            </div>
            <CardDescription className="mt-1 font-mono">
              Across {orders.length} registered orders
            </CardDescription>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Orders Queue
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-white">
              {orders.length}
            </div>
            <CardDescription className="mt-1">
              {pendingOrders.length} active in processing
            </CardDescription>
          </CardContent>
        </Card>

        {/* Pending Verification */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Slips To Verify
            </CardTitle>
            <div className={`p-2 rounded-lg ${unverifiedSlips.length > 0 ? "bg-amber-500/20 text-amber-400 animate-pulse" : "bg-slate-800 text-slate-500"}`}>
              <FileCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-white">
              {unverifiedSlips.length}
            </div>
            <CardDescription className="mt-1">
              Direct bank transfer deposits
            </CardDescription>
          </CardContent>
        </Card>

        {/* Catalog Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Active Catalog
            </CardTitle>
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
              <Package className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-white">
              {products.length} <span className="text-sm font-normal text-slate-400">Products</span>
            </div>
            <CardDescription className="mt-1 text-amber-400/90 flex items-center gap-1">
              {lowStockCount > 0 && <AlertTriangle className="w-3 h-3 inline" />}
              {lowStockCount} items below threshold
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Section with shadcn Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Customer Orders</h2>
            <p className="text-xs text-slate-400">Latest checkout activity across COD and Direct Transfer</p>
          </div>
          <Link
            href="/orders"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
          >
            Full Register
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
              Loading order pipeline...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No orders found. Storefront checkouts will appear here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Slip Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 8).map((order) => {
                  const isBank = order.paymentMethod === "BankTransfer";
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-semibold text-white">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="font-sans text-slate-300">
                        {order.customerName}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isBank ? "purple" : "secondary"}>
                          {order.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isBank ? (
                          order.hasBankSlip ? (
                            isPaymentApproved(order) ? (
                              <Badge variant="success">✓ Approved</Badge>
                            ) : (
                              <Badge variant="warning">Review Slip</Badge>
                            )
                          ) : (
                            <span className="text-slate-500 font-sans text-xs italic">
                              Slip Pending
                            </span>
                          )
                        ) : (
                          <span className="text-slate-600 font-sans text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        LKR {order.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {renderFulfillmentBadge(order.orderStatus)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/orders?id=${order.id}`}>
                            <Eye className="w-3 h-3 mr-1" />
                            Inspect
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
