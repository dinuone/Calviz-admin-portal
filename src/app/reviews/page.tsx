"use client";

import React, { useEffect, useState } from "react";
import {
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  RefreshCw,
  Search,
  Check,
  X,
  Eye,
  MessageSquare,
  Phone,
  ShieldCheck,
  Package,
  ExternalLink,
  ThumbsUp,
} from "lucide-react";
import { fetchAdminReviews, approveAdminReview, deleteAdminReview } from "@/lib/api";
import { AdminReview } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DataTablePagination } from "@/components/DataTablePagination";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Action processing state
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Photo viewer modal state
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Delete modal state
  const [reviewToDelete, setReviewToDelete] = useState<AdminReview | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadReviews = async (page = pageNumber, size = pageSize) => {
    try {
      setLoading(true);
      const res = await fetchAdminReviews({
        status: statusFilter,
        search: searchQuery.trim() || undefined,
        pageNumber: page,
        pageSize: size,
      });
      setReviews(res.items || []);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
      setPageNumber(res.pageNumber);
      setPageSize(size);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load customer reviews";
      console.error(msg);
      setActionError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews(pageNumber, pageSize);
  }, [pageNumber, pageSize, statusFilter]);

  // Debounced search to reset pageNumber to 1
  useEffect(() => {
    const handler = setTimeout(() => {
      setPageNumber(1);
      loadReviews(1, pageSize);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReviews();
  };

  const handleApprove = async (review: AdminReview, shouldApprove: boolean) => {
    try {
      setProcessingId(review.id);
      setActionError(null);
      await approveAdminReview(review.id, shouldApprove);
      
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? { ...r, isApproved: shouldApprove, approvedAt: shouldApprove ? new Date().toISOString() : null } : r
        )
      );

      setActionSuccess(
        shouldApprove
          ? `Review from ${review.customerName} has been approved and published to the storefront.`
          : `Review from ${review.customerName} has been unpublished.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update review status";
      setActionError(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;
    try {
      setIsDeleting(true);
      setActionError(null);
      await deleteAdminReview(reviewToDelete.id);
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
      setActionSuccess(`Review has been permanently deleted.`);
      setReviewToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete review";
      setActionError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const pendingCount = reviews.filter((r) => !r.isApproved).length;
  const approvedCount = reviews.filter((r) => r.isApproved).length;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
            Customer Reviews & Social Proof
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Verify customer feedback, inspect submitted fitting photos, and approve reviews for storefront publishing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => loadReviews()} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Pending Alert Banner */}
      {pendingCount > 0 && statusFilter !== "approved" && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-200">
                Action Required: {pendingCount} New Customer Review(s) Awaiting Moderation
              </h3>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Verify customer names and phone numbers before publishing customer feedback to live store.
              </p>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setStatusFilter("pending");
              setPageNumber(1);
            }}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shrink-0"
          >
            Review Pending ({pendingCount})
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setPageNumber(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-white text-slate-950 font-bold shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("pending");
              setPageNumber(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "pending"
                ? "bg-amber-400 text-slate-950 font-bold shadow-xs"
                : "text-amber-400/80 hover:text-amber-300"
            }`}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-950 text-amber-300 text-[10px] flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("approved");
              setPageNumber(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer ${
              statusFilter === "approved"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-xs"
                : "text-emerald-400/80 hover:text-emerald-300"
            }`}
          >
            Approved ({approvedCount})
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, product, or comment..."
            className="pl-9 text-xs"
          />
        </form>
      </Card>

      {/* Reviews Cards Deck */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
            Loading customer review submissions...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            No customer reviews found for the selected filter.
          </div>
        ) : (
          reviews.map((review) => {
            const isProcessing = processingId === review.id;

            return (
              <Card
                key={review.id}
                className={`overflow-hidden border transition-all ${
                  review.isApproved
                    ? "border-slate-800 bg-slate-950/40"
                    : "border-amber-500/30 bg-amber-500/5 shadow-md shadow-amber-950/10"
                }`}
              >
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Top Metadata Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      {/* Star Rating Display */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-700"
                            }`}
                          />
                        ))}
                      </div>

                      <span className="font-mono text-sm font-bold text-white">
                        {review.rating}.0 / 5.0
                      </span>

                      {/* Approval Status Badge */}
                      <Badge variant={review.isApproved ? "success" : "warning"}>
                        {review.isApproved ? "✓ Published Live" : "Pending Verification"}
                      </Badge>
                    </div>

                    <div className="text-xs font-mono text-slate-400">
                      Submitted on{" "}
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* Customer Information & Product Association */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-mono">
                    {/* Customer */}
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block mb-0.5">
                        Customer Name
                      </span>
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <span>{review.customerName}</span>
                        {review.isVerifiedBuyer && (
                          <span className="text-emerald-400 flex items-center gap-0.5 text-[10px]" title="Verified Customer">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block mb-0.5">
                        Phone Verification
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{review.customerPhone}</span>
                      </div>
                    </div>

                    {/* Product Associated */}
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block mb-0.5">
                        Reviewed Garment
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-200 truncate">
                        <Package className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{review.productName || "General / Brand"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Review Title & Content Body */}
                  <div className="space-y-1.5">
                    {review.reviewTitle && (
                      <h4 className="text-sm font-bold text-white font-sans">
                        &quot;{review.reviewTitle}&quot;
                      </h4>
                    )}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                      {review.comment}
                    </p>
                  </div>

                  {/* Attached Customer Photos */}
                  {review.imageUrls && review.imageUrls.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">
                        Customer Photo Uploads ({review.imageUrls.length}) — Click to Inspect
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {review.imageUrls.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedPhoto(imgUrl)}
                            className="relative w-20 h-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 group cursor-pointer hover:border-white transition-all shadow-xs"
                          >
                            <img
                              src={imgUrl}
                              alt={`Customer photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Operational Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                    <div className="text-[11px] font-mono text-slate-500">
                      {review.isApproved && review.approvedAt && (
                        <span>
                          Approved on {new Date(review.approvedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!review.isApproved ? (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(review, true)}
                          disabled={isProcessing}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                        >
                          <Check className="w-3.5 h-3.5 mr-1.5" />
                          {isProcessing ? "Publishing..." : "Approve & Publish to Store"}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(review, false)}
                          disabled={isProcessing}
                          className="text-xs text-slate-300 hover:text-amber-300 hover:border-amber-500/50"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          {isProcessing ? "Updating..." : "Unpublish Review"}
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReviewToDelete(review)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

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
        pageSizeOptions={[10, 15, 25, 50]}
        itemLabel="reviews"
        loading={loading}
        className="rounded-2xl border border-slate-800"
      />

      {/* Photo Lightbox Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 p-2">
          <div className="relative aspect-4/5 max-h-[80vh] w-full flex items-center justify-center overflow-hidden rounded-lg bg-black">
            {selectedPhoto && (
              <img
                src={selectedPhoto}
                alt="Full customer submission"
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div className="p-3 text-right">
            <Button variant="outline" size="sm" onClick={() => setSelectedPhoto(null)}>
              Close View
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              Confirm Review Deletion
            </DialogTitle>
            <DialogDescription className="text-slate-300 pt-2 leading-relaxed">
              Are you sure you want to permanently delete the review from{" "}
              <strong className="text-white font-mono">{reviewToDelete?.customerName}</strong>?
              <br />
              <span className="text-slate-400 text-xs mt-1 block">
                This action cannot be undone and will immediately remove this rating from social proof displays.
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button variant="outline" onClick={() => setReviewToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
