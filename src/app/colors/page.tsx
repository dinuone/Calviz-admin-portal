"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  fetchAdminColors,
  createAdminColor,
  updateAdminColor,
  deleteAdminColor,
} from "@/lib/api";
import { ColorAttribute } from "@/types";
import {
  Palette,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  Copy,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Standard luxury streetwear palette presets
const QUICK_PRESETS = [
  { name: "Jet Black", hex: "#0A0A0A" },
  { name: "Chalk White", hex: "#F5F5F7" },
  { name: "Washed Charcoal", hex: "#262629" },
  { name: "Acid Slate", hex: "#4A4D54" },
  { name: "Military Olive", hex: "#3B4235" },
  { name: "Warm Oat", hex: "#E8E2D5" },
  { name: "Crimson Blood", hex: "#800A12" },
  { name: "Desert Sand", hex: "#BFAFA0" },
  { name: "Midnight Navy", hex: "#111B2E" },
  { name: "Vintage Sage", hex: "#8A9A86" },
];

export default function ColorsPage() {
  const [colors, setColors] = useState<ColorAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<ColorAttribute | null>(null);
  const [formName, setFormName] = useState("");
  const [formHex, setFormHex] = useState("#0A0A0A");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deletingColor, setDeletingColor] = useState<ColorAttribute | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Copy feedback
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const loadColors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminColors();
      setColors(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load colors";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColors();
  }, []);

  const filteredColors = useMemo(() => {
    return colors.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.hexCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && c.isActive) ||
        (statusFilter === "inactive" && !c.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [colors, searchQuery, statusFilter]);

  const activeCount = useMemo(() => colors.filter((c) => c.isActive).length, [colors]);

  const openCreateModal = (preset?: { name: string; hex: string }) => {
    setEditingColor(null);
    setFormName(preset ? preset.name : "");
    setFormHex(preset ? preset.hex : "#0A0A0A");
    setFormIsActive(true);
    setFormDisplayOrder(colors.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (c: ColorAttribute) => {
    setEditingColor(c);
    setFormName(c.name);
    setFormHex(c.hexCode);
    setFormIsActive(c.isActive);
    setFormDisplayOrder(c.displayOrder || 1);
    setIsModalOpen(true);
  };

  const handleSaveColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError("Please provide a color name.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const cleanHex = formHex.trim().startsWith("#")
        ? formHex.trim()
        : `#${formHex.trim()}`;

      if (editingColor) {
        const updated = await updateAdminColor(
          editingColor.id,
          formName.trim(),
          cleanHex,
          formIsActive,
          formDisplayOrder
        );
        setColors((prev) =>
          prev.map((c) => (c.id === editingColor.id ? updated : c))
        );
        setSuccess(`Color "${updated.name}" updated successfully.`);
      } else {
        const created = await createAdminColor(
          formName.trim(),
          cleanHex,
          formDisplayOrder
        );
        setColors((prev) => [...prev, created]);
        setSuccess(`Color "${created.name}" created successfully.`);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save color";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteColor = async () => {
    if (!deletingColor) return;
    try {
      setDeleting(true);
      setError(null);
      await deleteAdminColor(deletingColor.id);
      setColors((prev) => prev.filter((c) => c.id !== deletingColor.id));
      setSuccess(`Color "${deletingColor.name}" removed.`);
      setDeletingColor(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete color";
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  // Helper to determine text contrast (white vs dark)
  const isDarkColor = (hex: string) => {
    const c = hex.replace("#", "");
    if (c.length !== 6) return true;
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 140;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-white">
                <Palette className="w-5 h-5" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Color Palette &amp; Master Swatches
              </h1>
            </div>
            <p className="text-xs md:text-sm text-slate-400">
              Manage master garment dye colors, hex definitions, and product variant swatches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => openCreateModal()}
              className="bg-white text-slate-950 hover:bg-slate-200 font-bold text-xs uppercase tracking-wider h-10 px-4 gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Color Swatch</span>
            </Button>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-lg flex items-center justify-between gap-3 text-red-200 text-xs">
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
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center justify-between gap-3 text-emerald-200 text-xs">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
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

        {/* Quick Presets Bar */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Click Studio Dye Presets</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Click preset to instantly add or customize
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {QUICK_PRESETS.map((preset) => {
              const alreadyExists = colors.some(
                (c) => c.name.toLowerCase() === preset.name.toLowerCase()
              );
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => openCreateModal(preset)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all shrink-0 cursor-pointer ${
                    alreadyExists
                      ? "bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300"
                      : "bg-slate-900 border-slate-700/80 text-slate-200 hover:border-slate-500 hover:bg-slate-800"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-xs"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span>{preset.name}</span>
                  {alreadyExists ? (
                    <Check className="w-3 h-3 text-slate-600 ml-1" />
                  ) : (
                    <Plus className="w-3 h-3 text-slate-400 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e1420] p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search color name or #hex..."
                className="pl-9 h-9 bg-slate-900 border-slate-800 text-xs text-white placeholder-slate-500 focus:border-slate-600 rounded-lg"
              />
            </div>

            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All ({colors.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                  statusFilter === "active"
                    ? "bg-slate-800 text-white shadow-xs"
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
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Inactive ({colors.length - activeCount})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={loadColors}
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
              Loading master color swatches...
            </span>
          </div>
        ) : filteredColors.length === 0 ? (
          <div className="py-20 bg-[#0e1420] border border-slate-800/80 rounded-xl text-center space-y-3">
            <Palette className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No color swatches found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `No colors match your filter "${searchQuery}".`
                : "No color attributes have been created yet."}
            </p>
            <Button
              onClick={() => openCreateModal()}
              className="bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold uppercase tracking-wider mt-2"
            >
              Add First Color Swatch
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View of Color Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredColors.map((color) => {
              const isDark = isDarkColor(color.hexCode);
              return (
                <div
                  key={color.id}
                  className="bg-[#0e1420] border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-700 transition-all duration-200 flex flex-col justify-between group shadow-sm"
                >
                  {/* Visual Swatch Tile */}
                  <div
                    className="relative w-full h-28 p-3 flex flex-col justify-between transition-transform duration-300"
                    style={{ backgroundColor: color.hexCode }}
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-mono tracking-wider uppercase border ${
                          isDark
                            ? "bg-black/60 text-white border-white/20"
                            : "bg-white/80 text-black border-black/20"
                        }`}
                      >
                        Order #{color.displayOrder || 1}
                      </Badge>

                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                          color.isActive
                            ? isDark
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : isDark
                            ? "bg-red-950/80 text-red-300 border border-red-500/40"
                            : "bg-red-100 text-red-800 border border-red-300"
                        }`}
                      >
                        {color.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleCopyHex(color.hexCode)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded font-mono text-xs font-bold transition-transform hover:scale-105 cursor-pointer shadow-xs ${
                          isDark
                            ? "bg-black/75 text-white hover:bg-black"
                            : "bg-white/90 text-black hover:bg-white"
                        }`}
                        title="Click to copy HEX"
                      >
                        <span>{color.hexCode.toUpperCase()}</span>
                        {copiedHex === color.hexCode ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-60" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="p-4 space-y-3 bg-[#0e1420]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">
                          {color.name}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-500">
                          ID: {color.id.substring(0, 8)}...
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(color)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                          title="Edit color swatch"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingColor(color)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded-md transition-colors cursor-pointer"
                          title="Delete color swatch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
                    <th className="py-3 px-4">Swatch</th>
                    <th className="py-3 px-4">Color Name</th>
                    <th className="py-3 px-4">HEX Code</th>
                    <th className="py-3 px-4">Display Order</th>
                    <th className="py-3 px-4">Storefront Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredColors.map((color) => (
                    <tr
                      key={color.id}
                      className="hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-6 h-6 rounded-md border border-slate-700 shadow-xs shrink-0"
                            style={{ backgroundColor: color.hexCode }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sans font-bold text-white text-sm">
                        {color.name}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleCopyHex(color.hexCode)}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-800 hover:border-slate-600 rounded text-slate-300 font-bold hover:text-white cursor-pointer"
                        >
                          <span>{color.hexCode.toUpperCase()}</span>
                          {copiedHex === color.hexCode ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-60" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        #{color.displayOrder || 1}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            color.isActive
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                              : "bg-red-950/80 text-red-300 border border-red-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              color.isActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                            }`}
                          />
                          {color.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(color)}
                            className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingColor(color)}
                            className="h-8 px-2 text-slate-400 hover:text-red-400 hover:bg-red-950/50"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* CREATE / EDIT COLOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1420] text-slate-100 w-full max-w-lg rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingColor ? `Edit Color: ${editingColor.name}` : "Create Master Color Swatch"}
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

            <form onSubmit={handleSaveColor} className="p-6 space-y-5">
              {/* Real-time Preview Tile */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Live Swatch &amp; Contrast Preview</Label>
                <div
                  className="w-full h-20 rounded-xl border border-slate-700/80 flex items-center justify-between px-6 transition-all duration-200 shadow-inner"
                  style={{ backgroundColor: formHex }}
                >
                  <div
                    className={`font-mono text-sm font-bold ${
                      isDarkColor(formHex) ? "text-white" : "text-black"
                    }`}
                  >
                    {formName || "Color Name Preview"}
                  </div>
                  <div
                    className={`font-mono text-xs px-2.5 py-1 rounded font-semibold ${
                      isDarkColor(formHex)
                        ? "bg-black/60 text-white border border-white/20"
                        : "bg-white/80 text-black border border-black/20"
                    }`}
                  >
                    {formHex.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Color Name */}
              <div className="space-y-1.5">
                <Label htmlFor="color-name" className="text-xs text-slate-300">
                  Color Title / Dye Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="color-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Jet Black, Vintage Washed White..."
                  className="bg-slate-900 border-slate-800 text-xs text-white focus:border-slate-600 h-10 rounded-lg"
                  required
                />
              </div>

              {/* HEX Code & Color Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hex-code" className="text-xs text-slate-300">
                    HEX Color Code <span className="text-red-400">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formHex}
                      onChange={(e) => setFormHex(e.target.value.toUpperCase())}
                      className="w-10 h-10 rounded-lg border border-slate-800 bg-slate-900 p-0.5 cursor-pointer"
                    />
                    <Input
                      id="hex-code"
                      value={formHex}
                      onChange={(e) => setFormHex(e.target.value.toUpperCase())}
                      placeholder="#000000"
                      className="bg-slate-900 border-slate-800 text-xs font-mono text-white focus:border-slate-600 h-10 rounded-lg flex-1 uppercase"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="display-order" className="text-xs text-slate-300">
                    Display Priority Order
                  </Label>
                  <Input
                    id="display-order"
                    type="number"
                    min={1}
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value) || 1)}
                    className="bg-slate-900 border-slate-800 text-xs text-white focus:border-slate-600 h-10 rounded-lg"
                  />
                </div>
              </div>

              {/* Preset Color Swatches Selector inside Modal */}
              <div className="space-y-1.5 pt-1">
                <Label className="text-[11px] text-slate-400">Quick Standard Swatches</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  {QUICK_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setFormName(p.name);
                        setFormHex(p.hex);
                      }}
                      className="w-6 h-6 rounded-md border border-slate-700 hover:scale-110 transition-transform cursor-pointer shadow-xs"
                      style={{ backgroundColor: p.hex }}
                      title={`${p.name} (${p.hex})`}
                    />
                  ))}
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="space-y-0.5">
                  <Label className="text-xs font-bold text-white cursor-pointer">
                    Active on Storefront &amp; Admin
                  </Label>
                  <p className="text-[11px] text-slate-500">
                    When enabled, this color appears in product editors and live storefront swatch filters.
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

              {/* Modal Actions */}
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
                  disabled={saving}
                  className="bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold uppercase tracking-wider h-10 px-5 gap-2 cursor-pointer shadow-sm"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Swatch...</span>
                    </>
                  ) : (
                    <span>{editingColor ? "Update Color" : "Create Swatch"}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingColor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1420] text-slate-100 w-full max-w-md rounded-2xl border border-red-900/50 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 bg-red-950/60 border border-red-800/60 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Color Swatch?</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete the color{" "}
              <strong className="text-white">"{deletingColor.name}"</strong> (
              <span className="font-mono">{deletingColor.hexCode}</span>)? Existing product variants using this color will retain their data, but this preset will no longer be available in selection menus.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDeletingColor(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={deleting}
                onClick={handleDeleteColor}
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
