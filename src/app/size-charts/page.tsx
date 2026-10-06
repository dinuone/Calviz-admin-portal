"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  fetchAdminSizeCharts,
  createAdminSizeChart,
  updateAdminSizeChart,
  deleteAdminSizeChart,
  assignSizeChartProducts,
  fetchAdminProducts,
  uploadAdminProductImage,
} from "@/lib/api";
import { SizeChart, ProductSummary } from "@/types";
import {
  Ruler,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  Package,
  Image as ImageIcon,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  HelpCircle,
  Tag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Standard Industry Preset for Oversized Tops (Inches)
const DEFAULT_TOPS_COLUMNS = ["chest", "length", "shoulder", "sleeve"];
const DEFAULT_TOPS_ROWS = [
  { size: "S", chest: '22.0"', length: '28.5"', shoulder: '21.0"', sleeve: '9.0"' },
  { size: "M", chest: '23.0"', length: '29.5"', shoulder: '22.0"', sleeve: '9.5"' },
  { size: "L", chest: '24.0"', length: '30.5"', shoulder: '23.0"', sleeve: '10.0"' },
  { size: "XL", chest: '25.0"', length: '31.5"', shoulder: '24.0"', sleeve: '10.5"' },
  { size: "XXL", chest: '26.0"', length: '32.5"', shoulder: '25.0"', sleeve: '11.0"' },
];

// Standard Industry Preset for Streetwear Bottoms (Inches)
const DEFAULT_BOTTOMS_COLUMNS = ["waist", "length", "inseam", "hip"];
const DEFAULT_BOTTOMS_ROWS = [
  { size: "S", waist: '30"', length: '40.0"', inseam: '30.0"', hip: '42.0"' },
  { size: "M", waist: '32"', length: '41.0"', inseam: '31.0"', hip: '44.0"' },
  { size: "L", waist: '34"', length: '42.0"', inseam: '31.5"', hip: '46.0"' },
  { size: "XL", waist: '36"', length: '43.0"', inseam: '32.0"', hip: '48.0"' },
];

interface MeasurementRow {
  size: string;
  [key: string]: string;
}

export default function SizeChartsPage() {
  const [sizeCharts, setSizeCharts] = useState<SizeChart[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editor Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChart, setEditingChart] = useState<SizeChart | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "matrix" | "products">("info");
  const [saving, setSaving] = useState(false);

  // Quick Assign Modal State (Direct 1-Click from card)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningChart, setAssigningChart] = useState<SizeChart | null>(null);
  const [assignSaving, setAssignSaving] = useState(false);

  // Size Chart Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fitType, setFitType] = useState("Architectural Oversized / Relaxed Boxy");
  const [categoryHint, setCategoryHint] = useState("Heavyweight Tees");
  const [modelStats, setModelStats] = useState("Model is 6'1\" (185cm), 78kg wearing size L for relaxed aesthetic.");
  const [careInstructions, setCareInstructions] = useState("Cold machine wash with like colors (30°C). Line dry in shade.");
  const [imageUrl, setImageUrl] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  // Dynamic Measurement Matrix State
  const [columns, setColumns] = useState<string[]>(DEFAULT_TOPS_COLUMNS);
  const [rows, setRows] = useState<MeasurementRow[]>(DEFAULT_TOPS_ROWS);
  const [newColumnName, setNewColumnName] = useState("");

  // Product Assignment State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [chartsData, productsData] = await Promise.all([
        fetchAdminSizeCharts(true),
        fetchAdminProducts(),
      ]);
      setSizeCharts(Array.isArray(chartsData) ? chartsData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err: any) {
      setError(err.message || "Failed to load size charts and product list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingChart(null);
    setName("");
    setDescription("");
    setFitType("Architectural Oversized / Relaxed Boxy");
    setCategoryHint("Heavyweight Tees");
    setModelStats("Model is 5'8\" (185cm), 78kg wearing size L for relaxed aesthetic.");
    setCareInstructions("Cold machine wash with like colors (30°C). Line dry in shade.");
    setImageUrl("");
    setIsDefault(false);
    setIsActive(true);
    setDisplayOrder(sizeCharts.length + 1);
    setColumns(DEFAULT_TOPS_COLUMNS);
    setRows(DEFAULT_TOPS_ROWS);
    setSelectedProductIds([]);
    setActiveTab("info");
    setModalOpen(true);
  };

  const openEditModal = (chart: SizeChart) => {
    setEditingChart(chart);
    setName(chart.name);
    setDescription(chart.description || "");
    setFitType(chart.fitType || "");
    setCategoryHint(chart.categoryHint || "");
    setModelStats(chart.modelStats || "");
    setCareInstructions(chart.careInstructions || "");
    setImageUrl(chart.imageUrl || "");
    setIsDefault(chart.isDefault);
    setIsActive(chart.isActive);
    setDisplayOrder(chart.displayOrder);

    // Parse measurement JSON
    try {
      const parsed = JSON.parse(chart.measurementsJson || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        setRows(parsed);
        const colSet = new Set<string>();
        parsed.forEach((r) => {
          Object.keys(r).forEach((k) => {
            if (k !== "size") colSet.add(k);
          });
        });
        setColumns(Array.from(colSet));
      } else {
        setColumns(DEFAULT_TOPS_COLUMNS);
        setRows(DEFAULT_TOPS_ROWS);
      }
    } catch {
      setColumns(DEFAULT_TOPS_COLUMNS);
      setRows(DEFAULT_TOPS_ROWS);
    }

    // Set currently assigned products
    const assignedIds = chart.products?.map((p) => p.id) || [];
    setSelectedProductIds(assignedIds);
    setActiveTab("info");
    setModalOpen(true);
  };

  // Open Direct Quick Assign Modal from Card
  const openQuickAssignModal = (chart: SizeChart) => {
    setAssigningChart(chart);
    const assignedIds = chart.products?.map((p) => p.id) || [];
    setSelectedProductIds(assignedIds);
    setProductSearch("");
    setSelectedCategoryFilter("all");
    setIsAssignModalOpen(true);
  };

  const handleSaveQuickAssign = async () => {
    if (!assigningChart) return;
    try {
      setAssignSaving(true);
      setError(null);
      await assignSizeChartProducts(assigningChart.id, selectedProductIds);
      setSuccess(`Successfully updated product assignments for "${assigningChart.name}" (${selectedProductIds.length} products linked).`);
      setIsAssignModalOpen(false);
      await loadData();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to save product assignments.");
    } finally {
      setAssignSaving(false);
    }
  };

  const handleApplyPreset = (preset: "tops" | "bottoms") => {
    if (preset === "tops") {
      setColumns(DEFAULT_TOPS_COLUMNS);
      setRows(DEFAULT_TOPS_ROWS);
      setFitType("Architectural Oversized / Relaxed Boxy");
      setCategoryHint("Heavyweight Tees & Hoodies");
    } else {
      setColumns(DEFAULT_BOTTOMS_COLUMNS);
      setRows(DEFAULT_BOTTOMS_ROWS);
      setFitType("Wide-Leg Relaxed Utility");
      setCategoryHint("Utility Cargo & Trousers");
    }
  };

  const handleAddColumn = () => {
    const colKey = newColumnName.trim().toLowerCase().replace(/\s+/g, "_");
    if (!colKey) return;
    if (columns.includes(colKey)) {
      alert("This measurement column already exists.");
      return;
    }
    setColumns([...columns, colKey]);
    setRows(
      rows.map((r) => ({
        ...r,
        [colKey]: "",
      }))
    );
    setNewColumnName("");
  };

  const handleRemoveColumn = (col: string) => {
    setColumns(columns.filter((c) => c !== col));
    setRows(
      rows.map((r) => {
        const copy = { ...r };
        delete copy[col];
        return copy;
      })
    );
  };

  const handleAddRow = () => {
    const newRow: MeasurementRow = { size: "3XL" };
    columns.forEach((c) => {
      newRow[c] = "";
    });
    setRows([...rows, newRow]);
  };

  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleCellChange = (rowIndex: number, column: string, value: string) => {
    const updated = [...rows];
    updated[rowIndex] = { ...updated[rowIndex], [column]: value };
    setRows(updated);
  };

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAllFiltered = (filteredIds: string[]) => {
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedProductIds.includes(id));
    if (allSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a size chart name.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        fitType: fitType.trim() || undefined,
        categoryHint: categoryHint.trim() || undefined,
        modelStats: modelStats.trim() || undefined,
        careInstructions: careInstructions.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        measurementsJson: JSON.stringify(rows),
        isDefault,
        isActive,
        displayOrder,
        productIds: selectedProductIds,
      };

      if (editingChart) {
        await updateAdminSizeChart(editingChart.id, payload);
        setSuccess(`"${name}" size chart matrix updated successfully!`);
      } else {
        await createAdminSizeChart(payload);
        setSuccess(`"${name}" size chart matrix created successfully!`);
      }

      setModalOpen(false);
      await loadData();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to save size chart matrix.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, chartName: string) => {
    if (!confirm(`Are you sure you want to delete "${chartName}"? Products linked to this chart will simply have no size chart template.`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteAdminSizeChart(id);
      setSuccess(`"${chartName}" size chart deleted successfully.`);
      await loadData();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to delete size chart.");
    } finally {
      setLoading(false);
    }
  };

  // Categories extracted from products
  const categories = useMemo(() => {
    const catMap = new Map<string, string>();
    products.forEach((p) => {
      const key = p.categorySlug || p.categoryName;
      if (key) {
        catMap.set(key, p.categoryName || key);
      }
    });
    return Array.from(catMap.entries()).map(([slug, name]) => ({
      slug,
      name,
    }));
  }, [products]);

  // Filtered products for assignment
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const query = productSearch.trim().toLowerCase();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(query));

      const matchesCategory =
        selectedCategoryFilter === "all" ||
        p.categorySlug?.toLowerCase() === selectedCategoryFilter.toLowerCase() ||
        p.categoryName?.toLowerCase() === selectedCategoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, productSearch, selectedCategoryFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <Ruler className="w-4 h-4 text-emerald-400" />
            <span>Garment Geometry &amp; Spec Matrices</span>
          </div>
          <h1 className="text-2xl font-black text-white font-mono tracking-tight uppercase">
            Size Charts &amp; Measurement Matrices
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Manage reusable silhouette measurement matrices and fitting guides. Assign a single matrix across multiple products in one click.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            className="border-slate-800 text-slate-300 hover:text-white font-mono text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            onClick={openCreateModal}
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>New Size Matrix</span>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between animate-fade-in font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between animate-fade-in font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Size Charts Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Loading Size Matrices...
          </p>
        </div>
      ) : sizeCharts.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 p-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
            <Ruler className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white font-mono uppercase mb-1">No Size Matrices Created Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Create reusable size charts for your Heavyweight Tees, Boxy Hoodies, and Utility Pants.
          </p>
          <Button onClick={openCreateModal} className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs">
            <Plus className="w-4 h-4 mr-1.5" />
            Create First Matrix
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sizeCharts.map((chart) => {
            let parsedRows: MeasurementRow[] = [];
            try {
              parsedRows = JSON.parse(chart.measurementsJson || "[]");
            } catch { }

            const assignedProductsCount = chart.products?.length ?? chart.productCount ?? 0;

            return (
              <div
                key={chart.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                          {chart.categoryHint || "All Garments"}
                        </span>
                        {chart.isDefault && (
                          <Badge variant="success" className="text-[9px] py-0 px-1.5">
                            Default
                          </Badge>
                        )}
                        {!chart.isActive && (
                          <Badge variant="secondary" className="text-[9px] py-0 px-1.5 text-slate-400">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base font-black text-white font-mono uppercase tracking-tight">
                        {chart.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(chart)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                        title="Edit Size Matrix"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(chart.id, chart.name)}
                        className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                        title="Delete Matrix"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {chart.fitType && (
                    <p className="text-xs text-emerald-400/90 font-mono font-bold mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{chart.fitType}</span>
                    </p>
                  )}

                  {chart.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {chart.description}
                    </p>
                  )}

                  {/* Measurement Matrix Table Preview */}
                  {parsedRows.length > 0 && (
                    <div className="my-4 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-[11px] font-mono">
                      <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                          Measurement Grid (Inches)
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {parsedRows.length} Sizes
                        </span>
                      </div>
                      <div className="overflow-x-auto max-h-36 no-scrollbar">
                        <table className="w-full text-left">
                          <thead className="bg-slate-900/50 text-[10px] text-slate-400 uppercase">
                            <tr>
                              <th className="px-2.5 py-1.5 font-bold">Size</th>
                              {Object.keys(parsedRows[0] || {})
                                .filter((k) => k !== "size")
                                .map((col) => (
                                  <th key={col} className="px-2.5 py-1.5 font-bold capitalize">
                                    {col}
                                  </th>
                                ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900">
                            {parsedRows.map((r, i) => (
                              <tr key={i} className="hover:bg-slate-900/30">
                                <td className="px-2.5 py-1 text-white font-bold">{r.size}</td>
                                {Object.keys(parsedRows[0] || {})
                                  .filter((k) => k !== "size")
                                  .map((col) => (
                                    <td key={col} className="px-2.5 py-1 text-slate-300">
                                      {r[col] || "—"}
                                    </td>
                                  ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Model Telemetry */}
                  {chart.modelStats && (
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 mb-3 flex items-start gap-2 font-mono">
                      <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <p className="line-clamp-2">{chart.modelStats}</p>
                    </div>
                  )}

                  {/* Assigned Products Chips */}
                  {chart.products && chart.products.length > 0 && (
                    <div className="mb-3 space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                        Assigned Products:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto no-scrollbar">
                        {chart.products.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800/90 text-slate-300 border border-slate-700/60"
                          >
                            <Tag className="w-2.5 h-2.5 mr-1 text-emerald-400" />
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Assigned Products Count & Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Package className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-bold text-white">{assignedProductsCount}</span>
                    <span className="text-slate-500">Products</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => openQuickAssignModal(chart)}
                      variant="default"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-mono px-2.5 py-1 h-7"
                    >
                      <Users className="w-3 h-3 mr-1" />
                      Assign Products
                    </Button>

                    <Button
                      onClick={() => openEditModal(chart)}
                      variant="ghost"
                      size="sm"
                      className="text-[11px] font-mono text-slate-400 hover:text-white px-2 py-1 h-7"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK ASSIGN PRODUCTS MODAL */}
      {isAssignModalOpen && assigningChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#0e1420] border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-left">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base uppercase text-white font-mono">
                    Assign Products: {assigningChart.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Select products from your catalog that will inherit this size matrix.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search products by title or slug..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 font-mono focus:outline-hidden focus:border-emerald-500/50"
                  />
                </div>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-hidden"
                >
                  <option value="all">All Categories ({products.length} Products)</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs">
                    {selectedProductIds.length} Selected
                  </Badge>
                  <span className="text-slate-400">
                    of {filteredProducts.length} visible products
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectAllFiltered(filteredProducts.map((p) => p.id))}
                    className="text-xs font-mono h-7 border-slate-700 text-slate-300 hover:text-white"
                  >
                    {filteredProducts.length > 0 && filteredProducts.every((p) => selectedProductIds.includes(p.id))
                      ? "Deselect Visible"
                      : "Select All Visible"}
                  </Button>

                  {selectedProductIds.length > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedProductIds([])}
                      className="text-xs font-mono h-7 text-slate-400 hover:text-white"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>

              {/* Products List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-2 py-12 text-center text-slate-500 text-xs font-mono bg-slate-900/30 border border-dashed border-slate-800 rounded-xl p-6">
                    <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-white font-bold mb-1">No products found</p>
                    <p className="text-slate-400">
                      {products.length === 0
                        ? "You haven't created any products in the catalog yet."
                        : "No products matched the active search or category filter."}
                    </p>
                  </div>
                ) : (
                  filteredProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleToggleProduct(p.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${isSelected
                          ? "bg-emerald-500/15 border-emerald-500/50 text-white"
                          : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                      >
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${isSelected
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-slate-700 bg-slate-950"
                            }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>

                        {p.primaryImageUrl ? (
                          <img
                            src={p.primaryImageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0 bg-slate-950"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-slate-500" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs truncate text-white">{p.name}</p>
                          <p className="text-[10px] font-mono text-slate-400 truncate">
                            {p.categoryName || "Uncategorized"} • LKR {p.basePrice?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between bg-slate-900 shrink-0">
              <span className="text-xs font-mono text-slate-400">
                {selectedProductIds.length} products will be linked to this matrix
              </span>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="border-slate-800 text-slate-300 font-mono text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveQuickAssign}
                  disabled={assignSaving}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider"
                >
                  {assignSaving ? "Linking Products..." : "Save Product Assignments"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL EDITOR MODAL / DRAWER */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#0e1420] border border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-left font-sans">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base uppercase text-white font-mono">
                    {editingChart ? `Edit: ${editingChart.name}` : "Create Size Chart & Matrix"}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    CALVIZ Atelier Silhouette Specification System
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Selector */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 font-mono text-xs shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className={`py-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${activeTab === "info"
                  ? "border-emerald-500 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>1. Silhouette &amp; Model</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("matrix")}
                className={`py-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${activeTab === "matrix"
                  ? "border-emerald-500 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>2. Measurement Grid ({rows.length} Sizes)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("products")}
                className={`py-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${activeTab === "products"
                  ? "border-emerald-500 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>3. Assign Products ({selectedProductIds.length})</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* TAB 1: SILHOUETTE & MODEL INFO */}
                {activeTab === "info" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                      <div>
                        <span className="text-xs font-mono font-bold text-white block">Quick Starting Presets</span>
                        <span className="text-[11px] text-slate-400">Load calibrated specs for tops or bottoms</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => handleApplyPreset("tops")}
                          variant="secondary"
                          size="sm"
                          className="text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          Tees / Hoodies
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleApplyPreset("bottoms")}
                          variant="secondary"
                          size="sm"
                          className="text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          Pants / Cargo
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-mono uppercase text-slate-400 mb-1.5 block">
                          Size Matrix Title <span className="text-rose-400">*</span>
                        </Label>
                        <Input
                          type="text"
                          placeholder="e.g. Heavyweight Oversized T-Shirts"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-slate-900 border-slate-800 text-xs text-white"
                          required
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-mono uppercase text-slate-400 mb-1.5 block">
                          Garment Category Hint
                        </Label>
                        <Input
                          type="text"
                          placeholder="e.g. Heavyweight Tees, Boxy Hoodies"
                          value={categoryHint}
                          onChange={(e) => setCategoryHint(e.target.value)}
                          className="bg-slate-900 border-slate-800 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-mono uppercase text-slate-400 mb-1.5 block">
                        Fit &amp; Silhouette Descriptor
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g. Architectural Oversized / Relaxed Boxy Silhouette"
                        value={fitType}
                        onChange={(e) => setFitType(e.target.value)}
                        className="bg-slate-900 border-slate-800 text-xs text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-mono uppercase text-slate-400 mb-1.5 block">
                        Model Telemetry &amp; Reference (Customer-Facing)
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g. Model is 6'1&quot; (185cm), 78kg wearing size L for relaxed draped aesthetic."
                        value={modelStats}
                        onChange={(e) => setModelStats(e.target.value)}
                        className="bg-slate-900 border-slate-800 text-xs text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-mono uppercase text-slate-400 mb-1.5 block">
                        Care Instructions &amp; Shrinkage Advisory
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g. Cold machine wash with like colors (30°C). Line dry in shade. Do not tumble dry."
                        value={careInstructions}
                        onChange={(e) => setCareInstructions(e.target.value)}
                        className="bg-slate-900 border-slate-800 text-xs text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-mono uppercase text-slate-400 mb-1.5 block">
                        Description / Fit Notes
                      </Label>
                      <textarea
                        rows={2}
                        placeholder="Additional details on chest drop, shoulder seams, and garment stretch."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 font-sans focus:outline-hidden focus:border-emerald-500/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-center pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-mono">
                        <input
                          type="checkbox"
                          checked={isDefault}
                          onChange={(e) => setIsDefault(e.target.checked)}
                          className="w-4 h-4 accent-emerald-500 rounded"
                        />
                        <span>Default Storewide Fallback</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-mono">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="w-4 h-4 accent-emerald-500 rounded"
                        />
                        <span>Active Matrix</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* TAB 2: MEASUREMENT MATRIX GRID */}
                {activeTab === "matrix" && (
                  <div className="space-y-4">
                    {/* Add Column Bar */}
                    <div className="flex items-center gap-2 p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                      <span className="text-xs font-mono text-slate-400 uppercase font-bold shrink-0">
                        Add Dimension:
                      </span>
                      <Input
                        type="text"
                        placeholder="e.g. armhole, cuff, thigh..."
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddColumn();
                          }
                        }}
                        className="h-8 bg-slate-950 border-slate-800 text-xs font-mono text-white"
                      />
                      <Button
                        type="button"
                        onClick={handleAddColumn}
                        size="sm"
                        className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Column
                      </Button>
                    </div>

                    {/* Interactive Specs Table */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                          <tr>
                            <th className="p-2.5 font-bold text-white w-20">Size</th>
                            {columns.map((col) => (
                              <th key={col} className="p-2.5 font-bold">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="capitalize">{col}</span>
                                  {columns.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveColumn(col)}
                                      className="text-slate-500 hover:text-rose-400 p-0.5 rounded"
                                      title={`Remove ${col} column`}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </th>
                            ))}
                            <th className="p-2.5 w-12 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-900/40">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.size}
                                  onChange={(e) => handleCellChange(rIdx, "size", e.target.value.toUpperCase())}
                                  className="w-16 px-2 py-1 bg-slate-900 border border-slate-800 rounded font-bold text-xs text-emerald-400 text-center uppercase"
                                />
                              </td>
                              {columns.map((col) => (
                                <td key={col} className="p-2">
                                  <input
                                    type="text"
                                    placeholder='e.g. 24.0"'
                                    value={row[col] || ""}
                                    onChange={(e) => handleCellChange(rIdx, col, e.target.value)}
                                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200"
                                  />
                                </td>
                              ))}
                              <td className="p-2 text-center">
                                {rows.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRow(rIdx)}
                                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                    title="Delete row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <Button
                      type="button"
                      onClick={handleAddRow}
                      variant="ghost"
                      className="w-full py-2 bg-slate-900/60 hover:bg-slate-900 text-slate-300 font-mono text-xs border border-dashed border-slate-800 rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add Size Row
                    </Button>
                  </div>
                )}

                {/* TAB 3: ASSIGNED PRODUCTS */}
                {activeTab === "products" && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search products by title or slug..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={selectedCategoryFilter}
                          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                        >
                          <option value="all">All Categories</option>
                          {categories.map((c) => (
                            <option key={c.slug} value={c.slug}>
                              {c.name}
                            </option>
                          ))}
                        </select>

                        <Button
                          type="button"
                          onClick={() => handleSelectAllFiltered(filteredProducts.map((p) => p.id))}
                          size="sm"
                          variant="secondary"
                          className="text-xs font-mono shrink-0"
                        >
                          {filteredProducts.length > 0 && filteredProducts.every((p) => selectedProductIds.includes(p.id))
                            ? "Deselect Filtered"
                            : "Select Filtered"}
                        </Button>
                      </div>
                    </div>

                    {/* Summary Bar */}
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs font-mono text-emerald-300">
                      <span>
                        <strong>{selectedProductIds.length}</strong> products will use this size matrix.
                      </span>
                      {selectedProductIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedProductIds([])}
                          className="text-[11px] underline text-slate-400 hover:text-white"
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                      {filteredProducts.length === 0 ? (
                        <div className="col-span-2 py-8 text-center text-slate-500 text-xs font-mono">
                          No products match your filter.
                        </div>
                      ) : (
                        filteredProducts.map((p) => {
                          const isSelected = selectedProductIds.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => handleToggleProduct(p.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${isSelected
                                ? "bg-emerald-500/15 border-emerald-500/50 text-white"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                                }`}
                            >
                              <div
                                className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${isSelected
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-slate-700 bg-slate-950"
                                  }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5" />}
                              </div>

                              {p.primaryImageUrl ? (
                                <img
                                  src={p.primaryImageUrl}
                                  alt=""
                                  className="w-9 h-9 rounded object-cover border border-slate-800 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded bg-slate-800 flex items-center justify-center shrink-0">
                                  <Package className="w-4 h-4 text-slate-500" />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs truncate text-white">{p.name}</p>
                                <p className="text-[10px] font-mono text-slate-500 truncate">
                                  {p.categoryName || "Uncategorized"} • LKR {p.basePrice?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between bg-slate-900 shrink-0">
                <div className="text-xs text-slate-400 font-mono">
                  {selectedProductIds.length} products linked
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalOpen(false)}
                    className="border-slate-800 text-slate-300 font-mono text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider"
                  >
                    {saving ? "Saving Matrix..." : editingChart ? "Update Matrix" : "Create Matrix"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
