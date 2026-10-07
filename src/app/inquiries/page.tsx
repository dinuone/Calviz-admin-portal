"use client";

import React, { useState, useEffect } from "react";
import {
  fetchAdminInquiries,
  updateAdminInquiryStatus,
  deleteAdminInquiry,
  CustomerInquiry,
  InquiriesPagedResult,
} from "@/lib/api";
import {
  MessageSquare,
  Search,
  RefreshCw,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Trash2,
  ExternalLink,
  Filter,
  User,
  Calendar,
  AlertTriangle,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function InquiriesPage() {
  const [data, setData] = useState<InquiriesPagedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Selected for Modal Details
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [modalStatus, setModalStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminInquiries({
        status: statusFilter,
        inquiryType: typeFilter,
        search,
        page,
        pageSize: 20,
      });
      setData(res);
    } catch (err) {
      console.error("Failed to load inquiries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [statusFilter, typeFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadInquiries();
  };

  const handleQuickStatusChange = async (inquiry: CustomerInquiry, newStatus: string) => {
    try {
      await updateAdminInquiryStatus(inquiry.id, { status: newStatus });
      loadInquiries();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleSaveModal = async () => {
    if (!selectedInquiry) return;
    setUpdating(true);
    try {
      await updateAdminInquiryStatus(selectedInquiry.id, {
        status: modalStatus,
        adminNotes,
      });
      setSelectedInquiry(null);
      loadInquiries();
    } catch (e) {
      alert("Failed to save changes");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this customer request?")) return;
    try {
      await deleteAdminInquiry(id);
      loadInquiries();
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
    } catch (e) {
      alert("Failed to delete request");
    }
  };

  const openDetails = (inquiry: CustomerInquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNotes(inquiry.adminNotes || "");
    setModalStatus(inquiry.status);
  };

  const getCleanPhone = (phone: string) => {
    let p = phone.replace(/[^0-9]/g, "");
    if (p.startsWith("0")) p = "94" + p.substring(1);
    return p;
  };

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">
            <MessageSquare className="w-4 h-4 text-white" />
            <span>CRM &amp; CLIENT DISPATCH</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono uppercase mt-1">
            Customer Requests &amp; Inquiries
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage incoming contact inquiries, VIP allocation reservations, and sizing support tickets with anti-bot protection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadInquiries}
            disabled={loading}
            className="font-mono text-xs font-bold bg-[#0e1420] border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            REFRESH
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => { setStatusFilter("Pending"); setPage(1); }}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "Pending" ? "bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/50" : "bg-[#0e1420] border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-slate-400 font-bold uppercase">Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-mono text-amber-400 mt-2">
            {data?.pendingCount ?? 0}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">Needs response</span>
        </div>

        <div 
          onClick={() => { setStatusFilter("Contacted"); setPage(1); }}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "Contacted" ? "bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/50" : "bg-[#0e1420] border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-slate-400 font-bold uppercase">Contacted</span>
            <Phone className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black font-mono text-blue-400 mt-2">
            {data?.contactedCount ?? 0}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">In progress</span>
        </div>

        <div 
          onClick={() => { setStatusFilter("Resolved"); setPage(1); }}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "Resolved" ? "bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/50" : "bg-[#0e1420] border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-slate-400 font-bold uppercase">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400 mt-2">
            {data?.resolvedCount ?? 0}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">Completed tickets</span>
        </div>

        <div 
          onClick={() => { setStatusFilter("Spam"); setPage(1); }}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "Spam" ? "bg-red-950/40 border-red-500 ring-2 ring-red-500/50" : "bg-[#0e1420] border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-slate-400 font-bold uppercase">Bot / Spam</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-black font-mono text-red-400 mt-2">
            {data?.spamCount ?? 0}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">Trapped by honeypot</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-[#0e1420] p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {["All", "Pending", "Contacted", "Resolved", "Spam"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                statusFilter === st
                  ? "bg-white text-slate-950 shadow-xs"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Type & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-white w-full sm:w-auto"
          >
            <option value="All">All Inquiry Types</option>
            <option value="Sizing & Fit Advice">Sizing &amp; Fit Advice</option>
            <option value="VIP Early Allocation / Drop 02">VIP Early Allocation / Drop 02</option>
            <option value="Order Tracking & Courier Status">Order Tracking</option>
            <option value="Bank Transfer Payment Verification">Bank Slip Verification</option>
            <option value="7-Day Size Exchange Request">Size Exchange</option>
            <option value="General Inquiry">General Inquiry</option>
          </select>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, phone, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-white"
              />
            </div>
            <Button type="submit" size="sm" variant="secondary" className="font-mono text-xs font-bold bg-slate-800 text-white hover:bg-slate-700">
              SEARCH
            </Button>
          </form>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-[#0e1420] rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                <th className="py-3 px-4 font-bold">Customer Contact</th>
                <th className="py-3 px-4 font-bold">Type</th>
                <th className="py-3 px-4 font-bold">Inquiry Message</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Received</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Loading client requests...</span>
                  </td>
                </tr>
              ) : !data?.items?.length ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                    No customer requests found matching your filters.
                  </td>
                </tr>
              ) : (
                data.items.map((inquiry) => (
                  <tr 
                    key={inquiry.id} 
                    className={`hover:bg-slate-800/40 transition-colors ${inquiry.isBotSuspected ? "bg-red-950/20" : ""}`}
                  >
                    {/* Customer Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{inquiry.name}</span>
                          {inquiry.isBotSuspected && (
                            <span title="Honeypot Trap Triggered" className="px-1.5 py-0.2 bg-red-950 text-red-400 border border-red-800 font-mono text-[9px] font-bold rounded flex items-center gap-0.5">
                              <ShieldAlert className="w-2.5 h-2.5" /> BOT
                            </span>
                          )}
                        </div>
                        {inquiry.phone && (
                          <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {inquiry.phone}
                          </span>
                        )}
                        {inquiry.email && (
                          <span className="text-[11px] text-slate-500">
                            {inquiry.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 bg-slate-900 text-slate-300 font-mono text-[10px] font-semibold rounded border border-slate-800 whitespace-nowrap">
                        {inquiry.inquiryType}
                      </span>
                    </td>

                    {/* Message Preview */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p 
                        onClick={() => openDetails(inquiry)}
                        className="line-clamp-2 text-slate-300 cursor-pointer hover:text-white hover:underline"
                      >
                        {inquiry.message || "No message content"}
                      </p>
                      {inquiry.adminNotes && (
                        <span className="inline-block mt-1 font-mono text-[10px] text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800">
                          Note: {inquiry.adminNotes}
                        </span>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={inquiry.status}
                        onChange={(e) => handleQuickStatusChange(inquiry, e.target.value)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                          inquiry.status === "Pending"
                            ? "bg-amber-950/60 text-amber-300 border-amber-700"
                            : inquiry.status === "Contacted"
                            ? "bg-blue-950/60 text-blue-300 border-blue-700"
                            : inquiry.status === "Resolved"
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-700"
                            : "bg-red-950/60 text-red-300 border-red-700"
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Spam">Spam</option>
                      </select>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(inquiry.createdAtUtc).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inquiry.phone && (
                          <a
                            href={`https://wa.me/${getCleanPhone(inquiry.phone)}?text=${encodeURIComponent(
                              `Hello ${inquiry.name}, this is CALVIZ Client Desk regarding your inquiry.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Message on WhatsApp"
                            className="p-1.5 bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 border border-emerald-800 rounded-md transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {inquiry.email && (
                          <a
                            href={`mailto:${inquiry.email}?subject=${encodeURIComponent(
                              `CALVIZ Atelier // Re: ${inquiry.inquiryType}`
                            )}`}
                            title="Send Email"
                            className="p-1.5 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => openDetails(inquiry)}
                          title="View Full Details"
                          className="p-1.5 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white rounded-md font-mono text-[10px] font-bold px-2 transition-colors cursor-pointer"
                        >
                          VIEW
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(inquiry.id)}
                          title="Delete"
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data && data.totalCount > data.pageSize && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between font-mono text-xs text-slate-400 bg-slate-900/50">
            <span>
              Showing {(data.page - 1) * data.pageSize + 1}–
              {Math.min(data.page * data.pageSize, data.totalCount)} of {data.totalCount} requests
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="font-mono text-xs bg-[#0e1420] border-slate-700 text-slate-200"
              >
                PREV
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page * data.pageSize >= data.totalCount}
                onClick={() => setPage((p) => p + 1)}
                className="font-mono text-xs bg-[#0e1420] border-slate-700 text-slate-200"
              >
                NEXT
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Details & Notes Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#0e1420] rounded-3xl max-w-xl w-full border border-slate-800 shadow-2xl p-6 md:p-8 space-y-6 animate-scale-up text-slate-100">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                    REQUEST // {selectedInquiry.inquiryType}
                  </span>
                  {selectedInquiry.isBotSuspected && (
                    <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 font-mono text-[10px] font-bold rounded">
                      FLAGGED BOT
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold uppercase text-white font-mono mt-1">
                  {selectedInquiry.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="text-slate-400 hover:text-white text-xl font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Contact Details Pill Grid */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Phone Number</span>
                <span className="font-bold text-white">{selectedInquiry.phone || "Not provided"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Email Address</span>
                <span className="font-bold text-white">{selectedInquiry.email || "Not provided"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Client IP</span>
                <span className="text-slate-300">{selectedInquiry.ipAddress || "Unknown"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Timestamp</span>
                <span className="text-slate-300">
                  {new Date(selectedInquiry.createdAtUtc).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Message Content */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                Customer Message:
              </label>
              <div className="p-4 bg-slate-900 rounded-xl text-xs text-slate-200 font-medium leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                {selectedInquiry.message || "No message body."}
              </div>
            </div>

            {/* Status and Admin Note Form */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase text-slate-300">
                  Ticket Status:
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Spam">Spam</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
                  Internal Admin Notes:
                </label>
                <textarea
                  rows={3}
                  placeholder="E.g. Called customer on WhatsApp, confirmed size M sizing advice..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-white resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3">
              {selectedInquiry.phone && (
                <a
                  href={`https://wa.me/${getCleanPhone(selectedInquiry.phone)}?text=${encodeURIComponent(
                    `Hello ${selectedInquiry.name}, this is CALVIZ Client Desk regarding your inquiry.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInquiry(null)}
                  className="font-mono text-xs bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  CANCEL
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveModal}
                  disabled={updating}
                  className="bg-white text-slate-950 hover:bg-slate-200 font-mono text-xs font-bold"
                >
                  {updating ? "SAVING..." : "SAVE & UPDATE"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
