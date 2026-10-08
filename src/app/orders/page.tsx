"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  CheckCircle2,
  FileCheck,
  FileText,
  ExternalLink,
  Printer,
  AlertCircle,
  Eye,
  RefreshCw,
  User,
  MapPin,
  Phone,
  Mail,
  Package,
} from "lucide-react";
import { fetchAdminOrders, fetchAdminOrderById, updateAdminOrderStatus } from "@/lib/api";
import { getMediaUrl } from "@/lib/utils";
import { OrderSummaryAdmin, OrderDetail, OrderStatus, PaymentStatus } from "@/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DataTablePagination } from "@/components/DataTablePagination";

export default function OrdersPage() {
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<OrderSummaryAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>(
    searchParams.get("filter") === "unverified" ? "Unverified" : "All"
  );

  // Pagination state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Drawer state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    searchParams.get("id") || null
  );
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

  // Status edit inputs
  const [editOrderStatus, setEditOrderStatus] = useState<OrderStatus>("Placed");
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>("Pending");

  const loadOrders = async (page = pageNumber, size = pageSize) => {
    try {
      setLoading(true);
      const res = await fetchAdminOrders({
        search: searchQuery.trim() || undefined,
        orderStatus: statusFilter !== "All" ? (statusFilter as OrderStatus) : undefined,
        paymentStatus: paymentFilter !== "All" ? (paymentFilter as PaymentStatus) : undefined,
        pageNumber: page,
        pageSize: size,
      });

      setOrders(res.items || []);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
      setPageNumber(res.pageNumber);
      setPageSize(size);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(pageNumber, pageSize);
  }, [pageNumber, pageSize, statusFilter, paymentFilter]);

  // Load single order for sheet
  useEffect(() => {
    const id = selectedOrderId || searchParams.get("id");
    if (!id) {
      setSelectedOrder(null);
      return;
    }

    const loadSingle = async () => {
      try {
        setDrawerLoading(true);
        setStatusError(null);
        setStatusSuccess(null);
        const data = await fetchAdminOrderById(id);
        setSelectedOrder(data);
        setEditOrderStatus(data.orderStatus);
        setEditPaymentStatus(data.paymentStatus);
      } catch (err) {
        console.error("Failed to load single order:", err);
      } finally {
        setDrawerLoading(false);
      }
    };
    loadSingle();
  }, [selectedOrderId, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleUpdateStatus = async (approveSlip: boolean = false) => {
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      setStatusError(null);
      setStatusSuccess(null);

      const targetOrderStatus = approveSlip ? "Processing" : editOrderStatus;
      const targetPaymentStatus = approveSlip ? "Paid" : editPaymentStatus;

      const updated = await updateAdminOrderStatus(selectedOrder.id, {
        orderId: selectedOrder.id,
        newOrderStatus: targetOrderStatus,
        newPaymentStatus: targetPaymentStatus,
        approveBankSlip: approveSlip,
      });

      setSelectedOrder(updated);
      setEditOrderStatus(updated.orderStatus);
      setEditPaymentStatus(updated.paymentStatus);
      setStatusSuccess(
        approveSlip
          ? "Bank transfer slip verified and order set to Processing."
          : "Order status successfully updated."
      );
      loadOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update order status";
      setStatusError(msg);
    } finally {
      setUpdating(false);
    }
  };

  // Helper to check if bank slip / payment is approved
  const isPaymentApproved = (o: { paymentStatus?: string; bankSlipApproved?: boolean | null }) => {
    const ps = String(o.paymentStatus || "").toLowerCase();
    return ps === "paid" || ps === "verified" || ps === "2" || o.bankSlipApproved === true;
  };

  const filteredOrders = orders.filter((order) => {
    if (paymentFilter === "Unverified") {
      return (
        order.paymentMethod === "BankTransfer" &&
        order.hasBankSlip &&
        !isPaymentApproved(order)
      );
    }
    if (paymentFilter === "BankTransfer") {
      return order.paymentMethod === "BankTransfer";
    }
    if (paymentFilter === "CashOnDelivery") {
      return order.paymentMethod === "CashOnDelivery";
    }
    return true;
  });

  const renderFulfillmentBadge = (status: string | OrderStatus) => {
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

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
            Order Fulfillment Register
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review customer orders, inspect bank slip receipts, and advance fulfillment statuses.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadOrders()}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, Customer Name, or Phone..."
            className="pl-9"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {["All", "Placed", "Processing", "Shipped", "Delivered"].map((st) => (
              <Button
                key={st}
                variant={statusFilter === st ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setStatusFilter(st);
                  setPageNumber(1);
                }}
                className="h-7 text-xs"
              >
                {st}
              </Button>
            ))}
          </div>

          {/* Payment Filter Dropdown */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPageNumber(1);
            }}
            className="h-9 px-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-slate-500"
          >
            <option value="All">All Payments</option>
            <option value="Unverified">⚠️ Slips Needing Verification</option>
            <option value="BankTransfer">Bank Transfer Only</option>
            <option value="CashOnDelivery">Cash on Delivery Only</option>
          </select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
            Loading orders register...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-sm">
            No orders match the current criteria.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Slip Verification</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fulfillment Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const isBank = order.paymentMethod === "BankTransfer";

                return (
                  <TableRow
                    key={order.id}
                    className={selectedOrderId === order.id ? "bg-slate-800/40" : ""}
                  >
                    <TableCell className="font-semibold text-white">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="text-slate-400 text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString()}
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
                            <Badge variant="success">✓ Verified</Badge>
                          ) : (
                            <Badge
                              variant="warning"
                              className="cursor-pointer"
                              onClick={() => setSelectedOrderId(order.id)}
                            >
                              ⚠️ Review Slip
                            </Badge>
                          )
                        ) : (
                          <span className="text-slate-500 font-sans text-xs italic">
                            Slip Pending
                          </span>
                        )
                      ) : (
                        <span className="text-slate-600 font-sans text-xs">COD Mode</span>
                      )}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      LKR {order.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {renderFulfillmentBadge(order.orderStatus)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Inspect & Fulfill
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <DataTablePagination
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={(newPage) => setPageNumber(newPage)}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPageNumber(1);
          }}
          pageSizeOptions={[10, 15, 25, 50, 100]}
          itemLabel="orders"
          loading={loading}
        />
      </Card>

      {/* Shadcn Sheet Slide-Over Drawer */}
      <Sheet open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-2xl bg-[#0e1420] border-slate-800">
          <SheetHeader>
            <div className="flex items-center gap-3 flex-wrap">
              <SheetTitle>
                {selectedOrder ? selectedOrder.orderNumber : "Loading..."}
              </SheetTitle>
              {selectedOrder && (
                <>
                  <Badge variant={selectedOrder.paymentMethod === "BankTransfer" ? "purple" : "secondary"}>
                    {selectedOrder.paymentMethod}
                  </Badge>
                  {renderFulfillmentBadge(selectedOrder.orderStatus)}
                </>
              )}
            </div>
          </SheetHeader>

          {drawerLoading || !selectedOrder ? (
            <div className="py-20 text-center text-slate-500 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
              Retrieving complete order manifest...
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              {statusSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{statusSuccess}</span>
                </div>
              )}
              {statusError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{statusError}</span>
                </div>
              )}

              {/* Bank Slip Verification Section */}
              {selectedOrder.paymentMethod === "BankTransfer" && (
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm font-semibold text-white">
                        Bank Transfer Slip Review
                      </h3>
                    </div>
                    <Badge variant={isPaymentApproved(selectedOrder) ? "success" : "warning"}>
                      {isPaymentApproved(selectedOrder) ? "Approved" : "Awaiting Verification"}
                    </Badge>
                  </div>

                  {selectedOrder.bankTransferRef && (
                    <div className="text-xs font-mono text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500">Customer Reference: </span>
                      <span className="text-white font-bold">{selectedOrder.bankTransferRef}</span>
                    </div>
                  )}

                  {selectedOrder.bankSlipUrl ? (() => {
                    const slipUrl = getMediaUrl(selectedOrder.bankSlipUrl);
                    const isPdf = slipUrl.toLowerCase().endsWith(".pdf") || slipUrl.toLowerCase().includes(".pdf?");

                    return (
                      <div className="space-y-3">
                        {isPdf ? (
                          <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-950 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 text-amber-400 font-mono text-xs">
                                <FileText className="w-5 h-5 text-rose-400 shrink-0" />
                                <div>
                                  <span className="font-bold text-white block">Bank Transfer Slip (PDF Document)</span>
                                  <span className="text-[10px] text-slate-400">Attached receipt document</span>
                                </div>
                              </div>
                              <a
                                href={slipUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-mono transition-colors shrink-0"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Open PDF Fullscreen
                              </a>
                            </div>
                            <div className="w-full h-80 rounded border border-slate-800 bg-white overflow-hidden">
                              <iframe
                                src={`${slipUrl}#toolbar=0&navpanes=0`}
                                className="w-full h-full"
                                title="Bank Slip PDF Preview"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black/40 group min-h-48 max-h-80 flex items-center justify-center">
                            <img
                              src={slipUrl}
                              alt="Bank Transfer Slip"
                              className="max-h-80 object-contain w-full"
                            />
                            <a
                              href={slipUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium gap-2 transition-opacity"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Inspect High-Res Slip in New Tab
                            </a>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                          <a
                            href={slipUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-emerald-400 underline inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> View/Download Attachment
                          </a>
                        </div>

                        {!isPaymentApproved(selectedOrder) && (
                          <Button
                            variant="emerald"
                            onClick={() => handleUpdateStatus(true)}
                            disabled={updating}
                            className="w-full"
                            size="lg"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Approve Bank Slip & Move to Processing
                          </Button>
                        )}
                      </div>
                    );
                  })() : (
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                      Customer selected Bank Transfer but has not yet uploaded a payment slip receipt.
                    </div>
                  )}
                </div>
              )}

              {/* Customer & Destination Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Customer Details
                  </h4>
                  <p className="text-sm font-semibold text-white">{selectedOrder.customerName}</p>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 font-mono">
                    <Mail className="w-3 h-3 text-slate-500" />
                    {selectedOrder.customerEmail}
                  </p>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 font-mono">
                    <Phone className="w-3 h-3 text-slate-500" />
                    {selectedOrder.customerPhone}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Shipping Destination
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {selectedOrder.shippingAddress?.addressLine1 || selectedOrder.streetAddress || "Address Provided"}
                    {selectedOrder.shippingAddress?.addressLine2 && (
                      <>, {selectedOrder.shippingAddress.addressLine2}</>
                    )}
                    <br />
                    {selectedOrder.shippingAddress?.city || selectedOrder.city || "Colombo"},{" "}
                    {selectedOrder.shippingAddress?.postalCode || selectedOrder.postalCode || "00100"}
                  </p>
                </div>
              </div>

              {/* Garment Items */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Purchased Garments ({selectedOrder.items.length})
                </h4>
                <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            src={getMediaUrl(item.imageUrl)}
                            alt={item.productName}
                            className="w-12 h-12 rounded object-cover bg-black"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center text-slate-600">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-white">{item.productName}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                            <span>Size: {item.size}</span>
                            <span>•</span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <p className="text-white font-semibold">
                          LKR {(item.unitPrice * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          LKR {item.unitPrice.toLocaleString()} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>LKR {selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping Fee</span>
                  <span>LKR {(selectedOrder.shippingFee ?? selectedOrder.deliveryFee ?? 0).toLocaleString()}</span>
                </div>
                {selectedOrder.discountAmount !== undefined && selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Applied</span>
                    <span>- LKR {selectedOrder.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Billed</span>
                  <span>LKR {selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>


              {/* Status Update Card */}
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">
                  Manual Lifecycle Override
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Fulfillment Order Status
                    </label>
                    <select
                      value={editOrderStatus}
                      onChange={(e) => setEditOrderStatus(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-500"
                    >
                      <option value="Placed">Placed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={editPaymentStatus}
                      onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => handleUpdateStatus(false)}
                  disabled={updating}
                  className="w-full"
                >
                  {updating ? "Saving Changes..." : "Commit Status Changes"}
                </Button>
              </div>

              {/* Invoicing Link */}
              <Button asChild variant="outline" className="w-full">
                <a
                  href={
                    selectedOrder.invoicePdfUrl?.startsWith("http")
                      ? selectedOrder.invoicePdfUrl
                      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5089'}/api/orders/${selectedOrder.id}/invoice`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Download QuestPDF Invoice
                </a>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
