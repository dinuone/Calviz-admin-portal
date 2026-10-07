"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  ExternalLink,
  RefreshCw,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { fetchAdminProducts, deleteAdminProduct } from "@/lib/api";
import { Product } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminProducts();
      setProducts(data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      setIsDeleting(true);
      setActionError(null);
      await deleteAdminProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setActionSuccess(`"${productToDelete.name}" has been deleted successfully.`);
      setProductToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete product";
      setActionError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categories?.some(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
            Products & Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage products, size matrix inventory, edit specs, and drops.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadProducts}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link href="/products/new">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
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
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Search Bar */}
      <Card className="p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, weight, or collection..."
            className="pl-9"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          {filtered.length} Products Cataloged
        </span>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-16 text-center text-slate-500 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
            Loading catalog data...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-16 text-center text-slate-500 text-sm">
            No products found. Click &quot;New Product&quot; above to create one.
          </div>
        ) : (
          filtered.map((prod) => {
            const primaryImg = prod.images?.find((img) => img.isPrimary)?.imageUrl || prod.images?.[0]?.imageUrl;
            const totalStock = prod.variants?.reduce((acc, v) => acc + v.stockQuantity, 0) ?? 0;
            const threshold = prod.lowStockThreshold || 5;
            const isLowStock = prod.variants?.some((v) => v.stockQuantity <= threshold);

            return (
              <Card
                key={prod.id}
                className="overflow-hidden flex flex-col group hover:border-slate-700 transition-all"
              >
                {/* Image Banner */}
                <div className="h-64 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  {primaryImg ? (
                    <img
                      src={primaryImg}
                      alt={prod.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-slate-700" />
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={
                        totalStock === 0
                          ? "destructive"
                          : isLowStock
                            ? "warning"
                            : "success"
                      }
                    >
                      {totalStock === 0 ? "Out of Stock" : isLowStock ? `Low Stock (${totalStock})` : `${totalStock} units`}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-400 mb-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {prod.categories && prod.categories.length > 0 ? (
                          prod.categories.map((c) => (
                            <span
                              key={c.id}
                              className="font-mono uppercase text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-semibold"
                            >
                              {c.name}
                            </span>
                          ))
                        ) : (
                          <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                            {prod.categoryName || "Uncategorized"}
                          </span>
                        )}
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-500 font-mono"
                          title={`Alert triggered when variant stock is ≤ ${threshold}`}
                        >
                          Alert ≤ {threshold}
                        </span>
                      </div>
                      {prod.isFeatured && (
                        <span className="text-[10px] text-amber-400 font-mono shrink-0">★ Featured</span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-white group-hover:text-slate-200 transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-sans">
                      {prod.description}
                    </p>
                  </div>

                  {/* Size Matrix Chips */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">
                        Size Matrix Inventory
                      </span>
                      {isLowStock && (
                        <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Reorder needed
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {prod.variants && prod.variants.length > 0 ? (
                        prod.variants.map((v) => (
                          <div
                            key={v.id || v.size}
                            className={`px-2 py-1 rounded text-[10px] font-mono border ${v.stockQuantity === 0
                              ? "bg-rose-950/30 border-rose-900/50 text-rose-400 line-through"
                              : v.stockQuantity <= threshold
                                ? "bg-amber-950/30 border-amber-900/50 text-amber-300 font-bold"
                                : "bg-slate-900 border-slate-800 text-slate-300"
                              }`}
                          >
                            {v.size}: {v.stockQuantity}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-600">No variants</span>
                      )}
                    </div>
                  </div>

                  {/* Price & Action footer */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-500 block">
                          Base Price
                        </span>
                        <span className="text-sm font-bold font-mono text-white">
                          LKR {prod.basePrice.toLocaleString()}
                        </span>
                      </div>
                      <a
                        href={`http://localhost:3000/product/${prod.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Live Store
                      </a>
                    </div>

                    {/* Operational Action Buttons: EDIT & DELETE */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
                        <Link href={`/products/${prod.id}/edit`}>
                          <Edit3 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          Edit Specs
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setProductToDelete(prod)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3"
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              Confirm Product Deletion
            </DialogTitle>
            <DialogDescription className="text-slate-300 pt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-white font-mono">{productToDelete?.name}</strong>?
              <br />
              <span className="text-slate-400 text-xs mt-1 block">
                This will immediately remove this garment from the storefront catalog and inventory registers.
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              variant="outline"
              onClick={() => setProductToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
