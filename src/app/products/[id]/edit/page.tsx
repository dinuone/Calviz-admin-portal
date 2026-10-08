"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  UploadCloud,
  Palette,
  Plus,
  Check,
  Ruler,
  FileText,
  Sparkles,
  X,
} from "lucide-react";
import {
  fetchAdminProductByIdOrSlug,
  fetchAdminCategories,
  updateAdminProduct,
  deleteAdminProduct,
  uploadAdminProductImage,
  fetchAdminColors,
  createAdminColor,
} from "@/lib/api";
import {
  Category,
  UpdateProductInput,
  UpdateProductVariantInput,
  UpdateProductImageInput,
  ColorAttribute,
  SizeMeasurementRow,
} from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

const DEFAULT_MEASUREMENTS: SizeMeasurementRow[] = [
  { size: "S", chest: '42.0" / 106.7 cm', length: '28.5" / 72.4 cm', sleeve: '9.0" / 22.8 cm', shoulder: '21.5" / 54.6 cm' },
  { size: "M", chest: '44.0" / 111.8 cm', length: '29.5" / 74.9 cm', sleeve: '9.5" / 24.1 cm', shoulder: '22.5" / 57.1 cm' },
  { size: "L", chest: '46.5" / 118.1 cm', length: '30.5" / 77.5 cm', sleeve: '10.0" / 25.4 cm', shoulder: '23.5" / 59.7 cm' },
  { size: "XL", chest: '49.0" / 124.5 cm', length: '31.5" / 80.0 cm', sleeve: '10.5" / 26.7 cm', shoulder: '24.5" / 62.2 cm' },
  { size: "XXL", chest: '51.5" / 130.8 cm', length: '32.5" / 82.5 cm', sleeve: '11.0" / 27.9 cm', shoulder: '25.5" / 64.8 cm' },
];

interface ImageItem {
  id?: string;
  previewUrl: string;
  file?: File;
  imageUrl?: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sizeChartInputRef = useRef<HTMLInputElement>(null);
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<ColorAttribute[]>([]);
  const [selectedColor, setSelectedColor] = useState<ColorAttribute | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Custom color creation state
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#0A0A0A");
  const [savingColor, setSavingColor] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState("Vintage Black");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [isOnSale, setIsOnSale] = useState(false);
  const [salePrice, setSalePrice] = useState<number | "">("");
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [gsm, setGsm] = useState<number | "">("");
  const [lowStockThreshold, setLowStockThreshold] = useState<number | "">(5);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Size Chart & Measurement Matrix State
  const [sizeChartImageUrl, setSizeChartImageUrl] = useState("");
  const [sizeChartFile, setSizeChartFile] = useState<File | null>(null);
  const [sizeChartPreviewUrl, setSizeChartPreviewUrl] = useState("");
  const [measurements, setMeasurements] = useState<SizeMeasurementRow[]>(DEFAULT_MEASUREMENTS);
  const [sizeGuideNotes, setSizeGuideNotes] = useState("MEASUREMENTS TAKEN FLAT. DEVIATION OF +/- 0.5\" REPRESENTS STANDARD HANDCRAFT TOLERANCE.");

  // Variants state
  const [variants, setVariants] = useState<UpdateProductVariantInput[]>([]);

  // Images state (stores preview and pending file until Update Product is clicked)
  const [images, setImages] = useState<ImageItem[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (!productId) return;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [product, catList, colorList] = await Promise.all([
          fetchAdminProductByIdOrSlug(productId),
          fetchAdminCategories().catch(() => []),
          fetchAdminColors().catch(() => []),
        ]);

        setCategories(catList || []);
        setColors(colorList || []);

        // Prepopulate form fields
        setName(product.name || "");
        setSlug(product.slug || "");

        const initialCatIds: string[] = [];
        if (product.categoryIds && product.categoryIds.length > 0) {
          initialCatIds.push(...product.categoryIds);
        } else if (product.categories && product.categories.length > 0) {
          initialCatIds.push(...product.categories.map((c) => c.id));
        } else if (product.categoryId) {
          initialCatIds.push(product.categoryId);
        } else if (catList && catList.length > 0) {
          initialCatIds.push(catList[0].id);
        }
        setSelectedCategoryIds(Array.from(new Set(initialCatIds)));

        setDescription(product.description || "");
        setBasePrice(product.basePrice ?? "");
        setIsOnSale(product.isOnSale ?? false);
        setSalePrice(product.salePrice ?? "");
        setIsNewArrival(product.isNewArrival ?? false);
        setIsBestSeller(product.isBestSeller ?? false);
        setGsm(product.gsm ?? 240);
        setLowStockThreshold(product.lowStockThreshold ?? 5);
        setIsFeatured(product.isFeatured ?? false);
        setIsActive(true);

        const detectedColor = product.variants?.[0]?.color || "Vintage Black";
        setColor(detectedColor);

        // Find matching color swatch
        if (colorList && colorList.length > 0) {
          const match = colorList.find(
            (c) =>
              c.name.toLowerCase() === detectedColor.toLowerCase() ||
              (product.variants?.[0]?.colorHex &&
                c.hexCode.toLowerCase() === product.variants[0].colorHex.toLowerCase())
          );
          if (match) setSelectedColor(match);
        }

        // Prepopulate variants
        if (product.variants && product.variants.length > 0) {
          setVariants(
            product.variants.map((v) => ({
              id: v.id,
              size: v.size,
              color: v.color || detectedColor,
              colorHex: v.colorHex,
              sku: v.sku,
              stockQuantity: v.stockQuantity,
              priceAdjustment: v.priceAdjustment || 0,
            }))
          );
        } else {
          setVariants(
            DEFAULT_SIZES.map((size) => ({
              size,
              color: detectedColor,
              colorHex: "#0A0A0A",
              sku: `${product.slug?.toUpperCase() || "CVZ"}-${size}`,
              stockQuantity: 0,
              priceAdjustment: 0,
            }))
          );
        }

        // Prepopulate size chart and measurements
        setSizeChartImageUrl(product.sizeChartImageUrl || "");
        setSizeGuideNotes(product.sizeGuideNotes || "MEASUREMENTS TAKEN FLAT. DEVIATION OF +/- 0.5\" REPRESENTS STANDARD HANDCRAFT TOLERANCE.");
        if (product.sizeMeasurementsJson) {
          try {
            const parsed = JSON.parse(product.sizeMeasurementsJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMeasurements(parsed);
            } else {
              setMeasurements(DEFAULT_MEASUREMENTS);
            }
          } catch {
            setMeasurements(DEFAULT_MEASUREMENTS);
          }
        } else {
          setMeasurements(DEFAULT_MEASUREMENTS);
        }

        // Prepopulate images
        if (product.images && product.images.length > 0) {
          setImages(
            product.images.map((img, idx) => ({
              id: img.id,
              imageUrl: img.imageUrl,
              previewUrl: img.imageUrl,
              isPrimary: img.isPrimary ?? idx === 0,
              displayOrder: img.displayOrder || idx + 1,
            }))
          );
        } else {
          setImages([]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load product details";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [productId]);

  const handleSelectColor = (c: ColorAttribute) => {
    setSelectedColor(c);
    setColor(c.name);
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        color: c.name,
        colorHex: c.hexCode,
      }))
    );
  };

  const handleManualColorChange = (newColorName: string) => {
    setColor(newColorName);
    setSelectedColor(null);
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        color: newColorName.trim() || "Standard",
      }))
    );
  };

  const handleCreateCustomColor = async () => {
    if (!customColorName.trim()) return;

    try {
      setSavingColor(true);
      const created = await createAdminColor(customColorName.trim(), customColorHex);
      setColors((prev) => [...prev, created]);
      handleSelectColor(created);
      setCustomColorName("");
      setShowCustomColor(false);
    } catch (err) {
      console.warn("Could not save color to backend, applying locally:", err);
      const localColor: ColorAttribute = {
        id: `custom-${Date.now()}`,
        name: customColorName.trim(),
        hexCode: customColorHex,
        isActive: true,
        displayOrder: colors.length + 1,
      };
      setColors((prev) => [...prev, localColor]);
      handleSelectColor(localColor);
      setCustomColorName("");
      setShowCustomColor(false);
    } finally {
      setSavingColor(false);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const setAsPrimaryCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategoryIds((prev) => {
      const remaining = prev.filter((item) => item !== id);
      return [id, ...remaining];
    });
  };

  const handleVariantStockChange = (index: number, stock: number) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], stockQuantity: stock };
      return next;
    });
  };

  // Image File Selection with INSTANT PREVIEW (does NOT upload until Update Product button is clicked)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ImageItem[] = Array.from(files).map((file, idx) => ({
      previewUrl: URL.createObjectURL(file),
      file: file,
      isPrimary: images.length === 0 && idx === 0,
      displayOrder: images.length + idx + 1,
    }));

    setImages((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        previewUrl: newImageUrl.trim(),
        imageUrl: newImageUrl.trim(),
        isPrimary: prev.length === 0,
        displayOrder: prev.length + 1,
      },
    ]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const target = prev[index];
      if (target?.previewUrl && target.file) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  // Size Chart Handlers
  const handleSizeChartFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (sizeChartPreviewUrl && sizeChartFile) {
      URL.revokeObjectURL(sizeChartPreviewUrl);
    }

    setSizeChartFile(file);
    setSizeChartPreviewUrl(URL.createObjectURL(file));
    setSizeChartImageUrl("");
    if (sizeChartInputRef.current) sizeChartInputRef.current.value = "";
  };

  const handleRemoveSizeChart = () => {
    if (sizeChartPreviewUrl && sizeChartFile) {
      URL.revokeObjectURL(sizeChartPreviewUrl);
    }
    setSizeChartFile(null);
    setSizeChartPreviewUrl("");
    setSizeChartImageUrl("");
  };

  // Measurement Matrix Table Handlers
  const handleMeasurementChange = (index: number, field: keyof SizeMeasurementRow, value: string) => {
    setMeasurements((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddMeasurementRow = () => {
    setMeasurements((prev) => [
      ...prev,
      { size: "NEW", chest: "", length: "", sleeve: "", shoulder: "" },
    ]);
  };

  const handleRemoveMeasurementRow = (index: number) => {
    setMeasurements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLoadDefaultMeasurements = () => {
    setMeasurements(DEFAULT_MEASUREMENTS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedCategoryIds.length === 0 || !basePrice) {
      setError("Please complete all required fields: Name, Collections/Categories, and Base Price.");
      return;
    }

    if (isOnSale) {
      if (!salePrice || Number(salePrice) <= 0) {
        setError("Please enter a valid sale price greater than 0.");
        return;
      }
      if (Number(salePrice) >= Number(basePrice)) {
        setError("Sale price must be lower than the base retail price.");
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      // 1. Upload any newly added local files on Update Product click
      const preparedImages: UpdateProductImageInput[] = [];

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        let finalUrl = img.imageUrl || "";

        if (img.file) {
          const uploadRes = await uploadAdminProductImage(img.file);
          finalUrl = uploadRes.imageUrl;
        }

        if (finalUrl) {
          preparedImages.push({
            id: img.id,
            imageUrl: finalUrl,
            isPrimary: img.isPrimary ?? i === 0,
            displayOrder: i + 1,
          });
        }
      }

      // Upload size chart file if selected
      let finalSizeChartUrl = sizeChartImageUrl.trim() || null;
      if (sizeChartFile) {
        const chartRes = await uploadAdminProductImage(sizeChartFile);
        finalSizeChartUrl = chartRes.imageUrl;
      }

      const resolvedColor = color.trim() || "Standard";
      const resolvedColorHex = selectedColor?.hexCode || "#0A0A0A";
      const resolvedSlug =
        slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const preparedVariants: UpdateProductVariantInput[] = variants.map((v) => ({
        id: v.id,
        size: v.size,
        color: resolvedColor,
        colorHex: resolvedColorHex,
        sku: v.sku.trim() || `${resolvedSlug.toUpperCase()}-${v.size}`,
        stockQuantity: Number(v.stockQuantity) || 0,
        priceAdjustment: Number(v.priceAdjustment) || 0,
      }));

      const payload: UpdateProductInput = {
        id: productId,
        categoryId: selectedCategoryIds[0] || categories[0]?.id || "cat-default",
        categoryIds: selectedCategoryIds,
        name: name.trim(),
        slug: resolvedSlug,
        description: description.trim(),
        basePrice: Number(basePrice),
        isOnSale,
        salePrice: isOnSale && salePrice ? Number(salePrice) : null,
        isNewArrival,
        isBestSeller,
        gsm: gsm ? Number(gsm) : 240,
        lowStockThreshold: lowStockThreshold !== "" ? Number(lowStockThreshold) : 5,
        isFeatured,
        isActive,
        sizeChartImageUrl: finalSizeChartUrl,
        sizeMeasurementsJson: measurements.length > 0 ? JSON.stringify(measurements) : null,
        sizeGuideNotes: sizeGuideNotes.trim() || null,
        variants: preparedVariants,
        images: preparedImages,
      };

      await updateAdminProduct(productId, payload);
      setSuccess("Product specifications and stock allocation updated successfully.");
      setTimeout(() => {
        router.push("/products");
      }, 1000);
    } catch (err: unknown) {
      let msg = "Failed to update product";
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.errors) {
            msg = Object.values(parsed.errors).flat().join(" ");
          } else if (parsed.title) {
            msg = parsed.title;
          } else {
            msg = err.message;
          }
        } catch {
          msg = err.message;
        }
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAdminProduct(productId);
      setDeleteModalOpen(false);
      router.push("/products");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete product";
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-sm">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
        Loading product editor for ID: {productId}...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/products">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
              Edit Product Specs
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Identifier: {productId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`http://localhost:3000/product/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Storefront Link
          </a>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Specs Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase">Garment Fundamentals</CardTitle>
            <CardDescription>Update naming, categorization, and retail pricing</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="name">Product Title *</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Heavyweight Boxy Tee - Vintage Black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="heavyweight-boxy-tee-vintage-black"
                  className="font-mono text-xs"
                />
              </div>

              {/* MULTI-CATEGORY / COLLECTION SELECTOR */}
              <div className="md:col-span-2 space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-white">
                      Collections / Categories *
                    </Label>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      {selectedCategoryIds.length} Selected
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Click to toggle • First tag is Primary
                  </span>
                </div>

                {categories.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 text-xs font-mono">
                    No categories found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {categories.map((c) => {
                      const isSelected = selectedCategoryIds.includes(c.id);
                      const isPrimary = selectedCategoryIds[0] === c.id;

                      return (
                        <div
                          key={c.id}
                          onClick={() => toggleCategory(c.id)}
                          className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between gap-2 select-none ${
                            isSelected
                              ? "bg-slate-900/90 border-white/40 text-white shadow-sm ring-1 ring-white/10"
                              : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${
                                isSelected
                                  ? "bg-white border-white text-slate-950"
                                  : "border-slate-700 bg-slate-900"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="truncate">
                              <span className="font-semibold block truncate text-xs">{c.name}</span>
                              <span className="text-[10px] font-mono text-slate-500 block truncate">
                                /{c.slug}
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="flex items-center gap-1 shrink-0">
                              {isPrimary ? (
                                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                                  Primary
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => setAsPrimaryCategory(c.id, e)}
                                  className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                                  title="Make this the primary category"
                                >
                                  Make Primary
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Base Retail Price (LKR) *</Label>
                <Input
                  id="price"
                  type="number"
                  required
                  min="0"
                  value={basePrice}
                  onChange={(e) =>
                    setBasePrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="font-mono"
                />
              </div>

              {/* Set for Sale Option & Price */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="onSaleToggle" className="text-sm font-bold text-white cursor-pointer">
                        Set for Sale
                      </Label>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        Discount Option
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Enable to put this product on sale with a special discounted price.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="onSaleToggle"
                      type="checkbox"
                      checked={isOnSale}
                      onChange={(e) => {
                        setIsOnSale(e.target.checked);
                        if (!e.target.checked) setSalePrice("");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                {isOnSale && (
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="salePrice" className="text-xs font-semibold text-slate-200">
                          Sale Price (LKR) *
                        </Label>
                        {basePrice && salePrice && Number(salePrice) > 0 && Number(salePrice) < Number(basePrice) && (
                          <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Save LKR {(Number(basePrice) - Number(salePrice)).toLocaleString()} (-{Math.round(((Number(basePrice) - Number(salePrice)) / Number(basePrice)) * 100)}%)
                          </span>
                        )}
                      </div>
                      <Input
                        id="salePrice"
                        type="number"
                        min="0"
                        required={isOnSale}
                        value={salePrice}
                        onChange={(e) =>
                          setSalePrice(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="e.g. 5200"
                        className="font-mono border-red-500/40 focus:border-red-500"
                      />
                    </div>

                    {basePrice && salePrice && Number(salePrice) >= Number(basePrice) && (
                      <p className="text-[11px] text-amber-400 font-mono">
                        ⚠️ Sale price must be lower than base price (LKR {Number(basePrice).toLocaleString()}).
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Homepage Sections Curation: New Arrivals & Best Selling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. New Arrivals Toggle */}
                <div className={`p-4 rounded-xl border transition-all ${isNewArrival ? "bg-cyan-950/20 border-cyan-700/60" : "bg-slate-900/60 border-slate-800"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="newArrivalToggle" className="text-sm font-semibold text-slate-100 cursor-pointer">
                          New Arrivals (New Drop)
                        </Label>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          Home Section
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Include in &quot;New Arrivals (New Drops)&quot; section on the home page.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        id="newArrivalToggle"
                        type="checkbox"
                        checked={isNewArrival}
                        onChange={(e) => setIsNewArrival(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                  </div>
                </div>

                {/* 2. Best Selling Toggle */}
                <div className={`p-4 rounded-xl border transition-all ${isBestSeller ? "bg-amber-950/20 border-amber-700/60" : "bg-slate-900/60 border-slate-800"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="bestSellerToggle" className="text-sm font-semibold text-slate-100 cursor-pointer">
                          Best Selling Item
                        </Label>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Home Section
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Include in &quot;Best Selling&quot; section on the home page.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        id="bestSellerToggle"
                        type="checkbox"
                        checked={isBestSeller}
                        onChange={(e) => setIsBestSeller(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gsm">Fabric Weight (GSM)</Label>
                <Input
                  id="gsm"
                  type="number"
                  min="0"
                  value={gsm}
                  onChange={(e) =>
                    setGsm(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="240, 300, 450"
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="threshold">Low Stock Alert Threshold</Label>
                  <span className="text-[10px] text-amber-400 font-mono">Warning trigger</span>
                </div>
                <Input
                  id="threshold"
                  type="number"
                  min="1"
                  value={lowStockThreshold}
                  onChange={(e) =>
                    setLowStockThreshold(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="Default: 5 units"
                  className="font-mono"
                />
                <p className="text-[10px] text-slate-500">
                  Flags low-stock warning badges dynamically when any variant drops to or below this quantity.
                </p>
              </div>

              {/* COLOR ATTRIBUTE SELECTION */}
              <div className="md:col-span-2 space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 text-white">
                    <Palette className="w-3.5 h-3.5 text-slate-400" />
                    Color Attribute / Wash *
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowCustomColor(!showCustomColor)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    {showCustomColor ? "Cancel Custom" : "+ Add Custom Color"}
                  </button>
                </div>

                {/* Swatches Grid */}
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => {
                    const isSelected = selectedColor?.id === c.id || color.toLowerCase() === c.name.toLowerCase();
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectColor(c)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${isSelected
                            ? "bg-slate-800 border-white text-white shadow-sm ring-1 ring-white/20"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white"
                          }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: c.hexCode }}
                        />
                        <span>{c.name}</span>
                        {isSelected && <Check className="w-3 h-3 ml-0.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Inline Add Custom Color Form */}
                {showCustomColor && (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3 mt-2 animate-in fade-in duration-200">
                    <div className="text-[11px] font-mono text-slate-400 uppercase">
                      Register New Color Attribute to Database
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        type="text"
                        placeholder="Color Name (e.g. Acid Mint)"
                        value={customColorName}
                        onChange={(e) => setCustomColorName(e.target.value)}
                        className="text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customColorHex}
                          onChange={(e) => setCustomColorHex(e.target.value)}
                          className="w-9 h-9 rounded bg-transparent border border-slate-700 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={customColorHex}
                          onChange={(e) => setCustomColorHex(e.target.value)}
                          className="text-xs font-mono uppercase"
                          placeholder="#HEX"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleCreateCustomColor}
                        disabled={savingColor || !customColorName.trim()}
                        className="text-xs"
                      >
                        {savingColor ? "Saving..." : "Save & Select"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Manual Text Fallback */}
                <div className="pt-1">
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => handleManualColorChange(e.target.value)}
                    placeholder="Selected color name (e.g. Vintage Black)"
                    className="font-mono text-xs bg-slate-950/60"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2 pt-1">
                <Label htmlFor="desc">Technical Specifications & Fabric Composition</Label>
                <textarea
                  id="desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="100% combed cotton, heavy rib collar, oversized dropped shoulder cut..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-slate-500 leading-relaxed"
                />
              </div>

              <div className="md:col-span-2 flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-900 text-white focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isFeatured" className="text-xs text-slate-300 cursor-pointer">
                    Feature in Storefront Hero Showcase
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-900 text-white focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-xs text-slate-300 cursor-pointer">
                    Active & Available for Purchase
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Size Matrix Inventory Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase">Size Matrix Inventory</CardTitle>
            <CardDescription>
              Adjust live warehouse stock units and SKUs for each sizing grade
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {variants.map((v, idx) => (
                <div
                  key={v.size}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-center"
                >
                  <div className="font-mono font-bold text-base text-white">{v.size}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate flex items-center justify-center gap-1">
                    {v.colorHex && (
                      <span
                        className="w-2 h-2 rounded-full border border-white/20 inline-block"
                        style={{ backgroundColor: v.colorHex }}
                      />
                    )}
                    <span>{v.color || color || "Standard"}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono truncate">{v.sku}</div>
                  <div>
                    <Label className="block text-[10px] mb-1">Stock Units</Label>
                    <Input
                      type="number"
                      min="0"
                      value={v.stockQuantity}
                      onChange={(e) => handleVariantStockChange(idx, Number(e.target.value))}
                      className="text-center font-mono text-sm h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Photography / Media Card with Client Preview (Uploads on Update Product) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-mono uppercase">Imagery & Photography</CardTitle>
            <CardDescription>
              Select garment photos from computer to preview. Photos will be uploaded when you click &quot;Update Product&quot;.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Upload Drag/Click Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-slate-500 bg-slate-900/50 hover:bg-slate-900/80 rounded-2xl p-6 text-center transition-all cursor-pointer group flex flex-col items-center justify-center gap-2"
            >
              <div className="p-3 rounded-full bg-slate-800 text-slate-300 group-hover:text-white transition-colors">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  Click to Choose Garment Photos from Computer
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Instant visual preview. Uploads automatically when you click Update Product.
                </p>
              </div>
            </div>

            {/* Or add via URL */}
            <div className="pt-2">
              <Label className="text-[11px] block mb-2">Or Add via Image URL</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or CDN link"
                  className="flex-1 font-mono text-xs"
                />
                <Button type="button" variant="secondary" onClick={handleAddImageUrl}>
                  + Add URL
                </Button>
              </div>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="space-y-2 pt-2">
                <Label className="text-xs font-mono text-slate-300 uppercase">
                  Product Imagery Gallery ({images.length} photos)
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group aspect-3/4 flex items-center justify-center"
                    >
                      <img
                        src={img.previewUrl || img.imageUrl}
                        alt={`Product photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Primary / Pending Upload Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {img.isPrimary ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 text-[10px] font-mono border border-emerald-800">
                            Primary
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="px-2 py-0.5 rounded bg-black/70 text-slate-300 text-[10px] font-mono opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
                          >
                            Set Primary
                          </button>
                        )}
                        {img.file && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 text-[9px] font-mono border border-amber-800/60 w-fit">
                            Ready to upload
                          </span>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-rose-950/80 text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-900 cursor-pointer z-10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Photo Order Footnote */}
                      <div className="absolute bottom-1.5 right-2 font-mono text-[9px] text-white/70 bg-black/50 px-1 rounded">
                        #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Size Chart & Dynamic Measurement Matrix */}
        <Card className="border-slate-800 bg-slate-950/70 backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-slate-900 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <Ruler className="w-4 h-4 text-emerald-400" />
                Size Chart &amp; Measurement Matrix
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Upload garment size guide diagrams and configure dynamic measurements fetched directly by product pages.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadDefaultMeasurements}
              className="text-xs font-mono"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
              Reset Heavyweight Preset
            </Button>
          </CardHeader>

          <CardContent className="space-y-6 pt-5">
            {/* Size Chart Diagram Upload */}
            <div className="space-y-3">
              <Label className="text-xs font-mono text-slate-300 uppercase flex items-center justify-between">
                <span>Garment Size Chart Diagram / Illustration (Optional)</span>
                {sizeChartImageUrl || sizeChartPreviewUrl ? (
                  <span className="text-[10px] text-emerald-400 lowercase font-normal">Diagram configured</span>
                ) : (
                  <span className="text-[10px] text-slate-500 lowercase font-normal">No diagram uploaded</span>
                )}
              </Label>

              <input
                ref={sizeChartInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSizeChartFileSelect}
              />

              {sizeChartPreviewUrl || sizeChartImageUrl ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                  <div className="relative w-36 h-36 rounded-lg overflow-hidden border border-slate-700 bg-black flex items-center justify-center shrink-0">
                    <img
                      src={sizeChartPreviewUrl || sizeChartImageUrl}
                      alt="Size Chart Diagram Preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveSizeChart}
                      className="absolute top-1 right-1 p-1 rounded-md bg-rose-950/90 text-rose-300 hover:bg-rose-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-xs font-semibold text-white">Size Chart Diagram Active</p>
                    <p className="text-[11px] text-slate-400">
                      This illustration will be displayed in the storefront "02 // MEASUREMENTS" tab and in the 3D Size Drape Modal.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => sizeChartInputRef.current?.click()}
                        className="text-xs"
                      >
                        Change Diagram File
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveSizeChart}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        Remove Diagram
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => sizeChartInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/70 rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="p-2.5 rounded-full bg-slate-800 text-slate-300">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Click to Upload Size Chart Blueprint / Diagram
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      JPG, PNG, or WebP diagram. Will upload automatically upon saving.
                    </p>
                  </div>
                </div>
              )}

              {/* Or Direct Size Chart URL */}
              {!sizeChartPreviewUrl && (
                <div className="flex gap-2 pt-1">
                  <Input
                    type="url"
                    value={sizeChartImageUrl}
                    onChange={(e) => setSizeChartImageUrl(e.target.value)}
                    placeholder="Or paste external Size Chart image URL (e.g., https://...)"
                    className="text-xs font-mono"
                  />
                  {sizeChartImageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSizeChartImageUrl("")}
                      className="text-xs text-slate-400"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Dynamic Measurement Table Editor */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-mono text-slate-300 uppercase">
                  Product Measurement Matrix ({measurements.length} Sizes)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMeasurementRow}
                  className="text-xs font-mono"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Size Row
                </Button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                      <th className="p-3 w-28 font-semibold">Size</th>
                      <th className="p-3 font-semibold">Chest Width (IN / CM)</th>
                      <th className="p-3 font-semibold">Body Length (IN / CM)</th>
                      <th className="p-3 font-semibold">Sleeve Length (IN / CM)</th>
                      <th className="p-3 font-semibold">Shoulder Drop (IN / CM)</th>
                      <th className="p-3 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {measurements.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-2.5">
                          <Input
                            value={row.size}
                            onChange={(e) => handleMeasurementChange(idx, "size", e.target.value.toUpperCase())}
                            placeholder="S, M, L..."
                            className="font-bold text-white uppercase text-xs h-8 bg-slate-950/80"
                          />
                        </td>
                        <td className="p-2.5">
                          <Input
                            value={row.chest || ""}
                            onChange={(e) => handleMeasurementChange(idx, "chest", e.target.value)}
                            placeholder='44.0" / 111.8 cm'
                            className="text-xs h-8 bg-slate-950/80"
                          />
                        </td>
                        <td className="p-2.5">
                          <Input
                            value={row.length || ""}
                            onChange={(e) => handleMeasurementChange(idx, "length", e.target.value)}
                            placeholder='29.5" / 74.9 cm'
                            className="text-xs h-8 bg-slate-950/80"
                          />
                        </td>
                        <td className="p-2.5">
                          <Input
                            value={row.sleeve || ""}
                            onChange={(e) => handleMeasurementChange(idx, "sleeve", e.target.value)}
                            placeholder='9.5" / 24.1 cm'
                            className="text-xs h-8 bg-slate-950/80"
                          />
                        </td>
                        <td className="p-2.5">
                          <Input
                            value={row.shoulder || ""}
                            onChange={(e) => handleMeasurementChange(idx, "shoulder", e.target.value)}
                            placeholder='22.5" / 57.1 cm'
                            className="text-xs h-8 bg-slate-950/80"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveMeasurementRow(idx)}
                            className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {measurements.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500 text-xs font-mono">
                          No measurement rows configured. Click "Add Size Row" or "Reset Heavyweight Preset".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Size Guide Footnote / Notes */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-mono text-slate-300 uppercase">
                Fit Notes &amp; Measuring Instructions
              </Label>
              <Input
                value={sizeGuideNotes}
                onChange={(e) => setSizeGuideNotes(e.target.value)}
                placeholder='e.g., MEASUREMENTS TAKEN FLAT. DEVIATION OF +/- 0.5" REPRESENTS HANDCRAFT TOLERANCE.'
                className="text-xs font-mono bg-slate-950/80"
              />
              <p className="text-[10px] text-slate-500 font-mono">
                Appears beneath the measurements table on the customer product detail page.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button asChild variant="outline">
            <Link href="/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={submitting} size="lg">
            {submitting ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Updating Product...
              </span>
            ) : (
              "Update Product"
            )}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              Confirm Product Deletion
            </DialogTitle>
            <DialogDescription className="text-slate-300 pt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-white font-mono">{name}</strong>?
              <br />
              <span className="text-slate-400 text-xs mt-1 block">
                This will immediately remove this garment from the active storefront catalog.
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
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
