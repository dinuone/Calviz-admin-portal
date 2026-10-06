"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  Package,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  LayoutGrid,
  Table as TableIcon,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "@/lib/api";
import { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal State
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminCategories(true);
      setCategories(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load collections";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      setFormSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || "");
    setFormIsActive(cat.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError("Please provide a collection name.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const resolvedSlug =
        formSlug.trim() ||
        formName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

      if (editingCategory) {
        const payload: UpdateCategoryInput = {
          id: editingCategory.id,
          name: formName.trim(),
          slug: resolvedSlug,
          description: formDescription.trim(),
          isActive: formIsActive,
        };

        await updateAdminCategory(editingCategory.id, payload);
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id
              ? {
                  ...c,
                  name: formName.trim(),
                  slug: resolvedSlug,
                  description: formDescription.trim(),
                  isActive: formIsActive,
                }
              : c
          )
        );
        setSuccess(`Collection "${formName.trim()}" updated successfully.`);
      } else {
        const payload: CreateCategoryInput = {
          name: formName.trim(),
          slug: resolvedSlug,
          description: formDescription.trim(),
          isActive: formIsActive,
        };

        const res = await createAdminCategory(payload);
        const newCat: Category = {
          id: res.id,
          name: formName.trim(),
          slug: resolvedSlug,
          description: formDescription.trim(),
          isActive: formIsActive,
          productCount: 0,
          createdAt: new Date().toISOString(),
        };
        setCategories((prev) => [...prev, newCat]);
        setSuccess(`Collection "${formName.trim()}" created successfully.`);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save collection";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      setDeleting(true);
      setError(null);
      await deleteAdminCategory(deletingCategory.id);
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
      setSuccess(`Collection "${deletingCategory.name}" deleted.`);
      setDeletingCategory(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete collection";
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && (c.isActive ?? true)) ||
        (statusFilter === "inactive" && !(c.isActive ?? true));

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  const activeCount = useMemo(
    () => categories.filter((c) => c.isActive ?? true).length,
    [categories]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-white">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-mono uppercase">
              Collections &amp; Categories
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Organize heavyweight capsules, seasonal drop editions, and core line essentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={openCreateModal}
            className="bg-white text-slate-950 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider h-10 px-4 gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Collection</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-lg flex items-center justify-between gap-3 text-red-200 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center justify-between gap-3 text-emerald-200 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="text-emerald-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e1420] p-4 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collections or slug..."
              className="pl-9 h-9 bg-slate-900 border-slate-800 text-xs text-white placeholder-slate-500 focus:border-slate-600 rounded-lg"
            />
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === "all"
                  ? "bg-slate-800 text-white shadow-xs font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === "active"
                  ? "bg-slate-800 text-white shadow-xs font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === "inactive"
                  ? "bg-slate-800 text-white shadow-xs font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Archived ({categories.length - activeCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCategories}
            className="h-9 px-3 bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-500 hover:text-white"
              }`}
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-500 hover:text-white"
              }`}
              aria-label="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content View */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
          <div className="w-7 h-7 border-2 border-slate-700 border-t-white rounded-full animate-spin" />
          <span className="font-mono text-xs uppercase tracking-wider">
            Loading collection taxonomy...
          </span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-20 bg-[#0e1420] border border-slate-800/80 rounded-xl text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No collections found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No collections match your query "${searchQuery}".`
              : "No categories have been configured yet. Create your first collection above."}
          </p>
          <Button
            onClick={openCreateModal}
            className="bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold uppercase tracking-wider mt-2"
          >
            Create First Collection
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((c) => {
            const isActive = c.isActive ?? true;
            return (
              <div
                key={c.id}
                className="bg-[#0e1420] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between space-y-4 group shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white tracking-tight group-hover:text-slate-200">
                        {c.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          /{c.slug}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                        isActive
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                          : "bg-slate-900 text-slate-400 border border-slate-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                        }`}
                      />
                      {isActive ? "Active" : "Archived"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                    {c.description || "No specific collection narrative defined."}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Package className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.productCount ?? 0} Products</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/products?category=${c.slug}`}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                      title="View Products in Collection"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                      title="Edit Collection"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingCategory(c)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded-md transition-colors cursor-pointer"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Spec Table View */
        <div className="bg-[#0e1420] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 font-mono uppercase border-b border-slate-800 text-[11px]">
                  <th className="py-3 px-4">Collection Name</th>
                  <th className="py-3 px-4">URL Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Allocated Products</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredCategories.map((c) => {
                  const isActive = c.isActive ?? true;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-sans font-bold text-white text-sm">
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">/{c.slug}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-300 max-w-xs truncate">
                        {c.description || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-300">
                          <Package className="w-3 h-3 text-slate-400" />
                          <span>{c.productCount ?? 0}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isActive
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                              : "bg-slate-900 text-slate-400 border border-slate-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                            }`}
                          />
                          {isActive ? "Active" : "Archived"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Link href={`/products?category=${c.slug}`}>
                              <ExternalLink className="w-3.5 h-3.5 mr-1" />
                              <span>View</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(c)}
                            className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingCategory(c)}
                            className="h-8 px-2 text-slate-400 hover:text-red-400 hover:bg-red-950/50"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1420] text-slate-100 w-full max-w-lg rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-white font-mono uppercase">
                  {editingCategory ? `Edit Collection: ${editingCategory.name}` : "Create New Collection"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cat-name" className="text-xs text-slate-300">
                  Collection Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="cat-name"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Heavyweight Basics, Drop 02, Cargo Utility"
                  className="bg-slate-900 border-slate-800 text-xs text-white focus:border-slate-600 h-10 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-slug" className="text-xs text-slate-300">
                  URL Route Slug
                </Label>
                <Input
                  id="cat-slug"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="heavyweight-basics"
                  className="bg-slate-900 border-slate-800 text-xs font-mono text-white focus:border-slate-600 h-10 rounded-lg lowercase"
                />
                <p className="text-[10px] font-mono text-slate-500">
                  Will appear in URL routes: /#catalog?category={formSlug || "slug"}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-desc" className="text-xs text-slate-300">
                  Collection Narrative / Description
                </Label>
                <textarea
                  id="cat-desc"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Description of fabric weights, architectural cuts, and seasonal themes..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-slate-600 leading-relaxed placeholder-slate-600"
                />
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-white cursor-pointer">
                    Active on Storefront
                  </Label>
                  <p className="text-[11px] text-slate-500">
                    When enabled, this collection is visible in category filters and product creation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formIsActive ? "bg-white" : "bg-slate-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0e1420] shadow ring-0 transition duration-200 ease-in-out ${
                      formIsActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold uppercase tracking-wider h-10 px-5 gap-2 cursor-pointer shadow-sm"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? "Update Collection" : "Create Collection"}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1420] text-slate-100 w-full max-w-md rounded-2xl border border-red-900/50 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 bg-red-950/60 border border-red-800/60 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Collection?</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete the collection{" "}
              <strong className="text-white">"{deletingCategory.name}"</strong> (
              <span className="font-mono">/{deletingCategory.slug}</span>)?
              {deletingCategory.productCount && deletingCategory.productCount > 0 ? (
                <span className="block mt-2 text-amber-300">
                  Note: This collection currently has {deletingCategory.productCount} active products. Deleting it will archive the category to preserve historical product records.
                </span>
              ) : null}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeletingCategory(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={deleting}
                onClick={handleDeleteCategory}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider h-9 px-4 gap-2"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
