"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  fetchAdminCities,
  createAdminCity,
  updateAdminCity,
  toggleAdminCityActive,
  deleteAdminCity,
  bulkUpdateAdminCityFees,
  quickUpdateAdminCityFee,
} from "@/lib/api";
import { DeliveryCity } from "@/types";
import {
  MapPin,
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
  Truck,
  Coins,
  ArrowRight,
  Layers,
  Sparkles,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
];

const PROVINCES = [
  "Western",
  "Central",
  "Southern",
  "North Western",
  "Sabaragamuwa",
  "North Central",
  "Uva",
  "Northern",
  "Eastern",
];

export default function CitiesPage() {
  const [cities, setCities] = useState<DeliveryCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Multi-select for bulk actions
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);

  // Inline Quick Fee Editing State per city row
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineFeeValue, setInlineFeeValue] = useState<string>("");
  const [inlineSaving, setInlineSaving] = useState(false);

  // Bulk Fee Modal state
  const [isBulkFeeModalOpen, setIsBulkFeeModalOpen] = useState(false);
  const [bulkFeeScope, setBulkFeeScope] = useState<"all" | "district" | "selected">("all");
  const [bulkFeeAmount, setBulkFeeAmount] = useState<string>("350");
  const [bulkEstimatedDays, setBulkEstimatedDays] = useState<string>("");
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Create / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<DeliveryCity | null>(null);
  const [formName, setFormName] = useState("");
  const [formDistrict, setFormDistrict] = useState("Colombo");
  const [formPostalCode, setFormPostalCode] = useState("");
  const [formProvince, setFormProvince] = useState("Western");
  const [formDeliveryFee, setFormDeliveryFee] = useState<string>("");
  const [formEstimatedDays, setFormEstimatedDays] = useState<string>("2-3 Business Days");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deletingCity, setDeletingCity] = useState<DeliveryCity | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminCities();
      setCities(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load delivery cities";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCities();
  }, []);

  const filteredCities = useMemo(() => {
    return cities.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.postalCode.includes(searchQuery);

      const matchesDistrict =
        selectedDistrict === "all" || c.district.toLowerCase() === selectedDistrict.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && c.isActive) ||
        (statusFilter === "inactive" && !c.isActive);

      return matchesSearch && matchesDistrict && matchesStatus;
    });
  }, [cities, searchQuery, selectedDistrict, statusFilter]);

  // Handle select all checkbox in table
  const isAllFilteredSelected =
    filteredCities.length > 0 &&
    filteredCities.every((c) => selectedCityIds.includes(c.id));

  const toggleSelectAll = () => {
    if (isAllFilteredSelected) {
      const filteredIds = new Set(filteredCities.map((c) => c.id));
      setSelectedCityIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const newIds = Array.from(new Set([...selectedCityIds, ...filteredCities.map((c) => c.id)]));
      setSelectedCityIds(newIds);
    }
  };

  const toggleSelectCity = (id: string) => {
    setSelectedCityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCity(null);
    setFormName("");
    setFormDistrict(selectedDistrict !== "all" ? selectedDistrict : "Colombo");
    setFormPostalCode("");
    setFormProvince("Western");
    setFormDeliveryFee("350");
    setFormEstimatedDays("2-3 Business Days");
    setFormIsActive(true);
    setFormDisplayOrder(cities.length + 1);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (city: DeliveryCity) => {
    setEditingCity(city);
    setFormName(city.name);
    setFormDistrict(city.district);
    setFormPostalCode(city.postalCode);
    setFormProvince(city.province);
    setFormDeliveryFee(city.deliveryFee !== null && city.deliveryFee !== undefined ? city.deliveryFee.toString() : "");
    setFormEstimatedDays(city.estimatedDeliveryDays || "2-3 Business Days");
    setFormIsActive(city.isActive);
    setFormDisplayOrder(city.displayOrder);
    setIsModalOpen(true);
  };

  // Save Full Create/Edit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDistrict.trim() || !formPostalCode.trim() || !formProvince.trim()) {
      setError("Please fill all required city details.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const feeValue = formDeliveryFee.trim() !== "" ? parseFloat(formDeliveryFee) : null;

      if (editingCity) {
        const updated = await updateAdminCity(editingCity.id, {
          id: editingCity.id,
          name: formName.trim(),
          district: formDistrict.trim(),
          postalCode: formPostalCode.trim(),
          province: formProvince.trim(),
          deliveryFee: feeValue,
          estimatedDeliveryDays: formEstimatedDays.trim() || null,
          isActive: formIsActive,
          displayOrder: Number(formDisplayOrder) || 0,
        });

        setCities((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setSuccess(`Updated delivery city ${updated.name} (Fee: Rs. ${updated.deliveryFee ?? "Default"}) successfully.`);
      } else {
        const created = await createAdminCity({
          name: formName.trim(),
          district: formDistrict.trim(),
          postalCode: formPostalCode.trim(),
          province: formProvince.trim(),
          deliveryFee: feeValue,
          estimatedDeliveryDays: formEstimatedDays.trim() || null,
          isActive: formIsActive,
          displayOrder: Number(formDisplayOrder) || 0,
        });

        setCities((prev) => [...prev, created]);
        setSuccess(`Added delivery city ${created.name} successfully.`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save city";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Inline Quick Fee Save
  const handleStartInlineEdit = (city: DeliveryCity) => {
    setInlineEditingId(city.id);
    setInlineFeeValue(city.deliveryFee !== null && city.deliveryFee !== undefined ? city.deliveryFee.toString() : "");
  };

  const handleSaveInlineFee = async (city: DeliveryCity) => {
    try {
      setInlineSaving(true);
      setError(null);
      const parsedFee = inlineFeeValue.trim() !== "" ? parseFloat(inlineFeeValue) : null;
      const updated = await quickUpdateAdminCityFee(city.id, parsedFee, city.estimatedDeliveryDays);
      setCities((prev) => prev.map((c) => (c.id === city.id ? updated : c)));
      setInlineEditingId(null);
      setSuccess(`Updated delivery fee for ${city.name} to ${parsedFee !== null ? `Rs. ${parsedFee.toLocaleString()}` : "Default"}.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update fee";
      setError(msg);
    } finally {
      setInlineSaving(false);
    }
  };

  // Bulk Delivery Fee Update
  const handleOpenBulkFeeModal = (initialScope?: "all" | "district" | "selected") => {
    if (initialScope) {
      setBulkFeeScope(initialScope);
    } else if (selectedCityIds.length > 0) {
      setBulkFeeScope("selected");
    } else if (selectedDistrict !== "all") {
      setBulkFeeScope("district");
    } else {
      setBulkFeeScope("all");
    }
    setBulkFeeAmount("350");
    setBulkEstimatedDays("");
    setIsBulkFeeModalOpen(true);
  };

  const handleExecuteBulkFeeUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBulkUpdating(true);
      setError(null);

      const feeNum = bulkFeeAmount.trim() !== "" ? parseFloat(bulkFeeAmount) : null;
      let targetDistrict: string | null = null;
      let targetIds: string[] | null = null;

      if (bulkFeeScope === "selected") {
        if (selectedCityIds.length === 0) {
          setError("No cities are currently selected.");
          setBulkUpdating(false);
          return;
        }
        targetIds = selectedCityIds;
      } else if (bulkFeeScope === "district") {
        if (selectedDistrict === "all") {
          setError("Please choose a specific district from the filter dropdown first or select 'All Cities'.");
          setBulkUpdating(false);
          return;
        }
        targetDistrict = selectedDistrict;
      }

      const res = await bulkUpdateAdminCityFees({
        deliveryFee: feeNum,
        estimatedDeliveryDays: bulkEstimatedDays.trim() || null,
        district: targetDistrict,
        cityIds: targetIds,
      });

      setSuccess(res.message || `Updated ${res.count} delivery cities successfully.`);
      setIsBulkFeeModalOpen(false);
      setSelectedCityIds([]);
      await loadCities();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to bulk update delivery fees";
      setError(msg);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleToggleStatus = async (city: DeliveryCity) => {
    try {
      const newStatus = await toggleAdminCityActive(city.id);
      setCities((prev) =>
        prev.map((c) => (c.id === city.id ? { ...c, isActive: newStatus } : c))
      );
      setSuccess(`${city.name} is now ${newStatus ? "ENABLED" : "DISABLED"}.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle city status";
      setError(msg);
    }
  };

  const handleDelete = async () => {
    if (!deletingCity) return;
    try {
      setDeleting(true);
      await deleteAdminCity(deletingCity.id);
      setCities((prev) => prev.filter((c) => c.id !== deletingCity.id));
      setSuccess(`Deleted city ${deletingCity.name}.`);
      setDeletingCity(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete city";
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-white font-mono uppercase">
              Delivery Cities & Shipping Fees
            </h1>
            <Badge variant="secondary" className="font-mono">
              {cities.length} Cities
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage island-wide shipping rates. Edit delivery fees for <strong>all cities at once</strong> or customize individual city rates.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCities}
            className="border-slate-800 text-slate-300 hover:text-white font-mono text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {/* Bulk Update Delivery Fee Button */}
          <Button
            onClick={() => handleOpenBulkFeeModal()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs shadow-lg shadow-emerald-950/40"
          >
            <Coins className="w-3.5 h-3.5 mr-1.5" />
            Set Fee For All Cities
          </Button>

          <Button
            onClick={handleOpenCreate}
            className="bg-white text-black hover:bg-slate-200 font-mono text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add New City
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Active Delivery Zones
            </span>
            <span className="text-2xl font-black text-white font-mono mt-0.5 block">
              {cities.filter((c) => c.isActive).length} / {cities.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
            <MapPin className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Global / Standard Fee
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
              {cities.length > 0 && cities[0]?.deliveryFee !== null && cities[0]?.deliveryFee !== undefined
                ? `Rs. ${cities[0].deliveryFee.toLocaleString()}`
                : "Rs. 350 - 425"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
            <Truck className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Quick Batch Action
            </span>
            <button
              onClick={() => handleOpenBulkFeeModal("all")}
              className="text-xs text-white font-bold hover:text-emerald-400 transition-colors flex items-center gap-1.5 mt-1 font-mono"
            >
              Update All Fees In 1 Click <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-1 flex-wrap gap-2 w-full">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search city, postal code, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#0e1420] border-slate-800 text-xs"
            />
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 bg-[#0e1420] border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-hidden"
          >
            <option value="all">All Districts (25)</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex bg-[#0e1420] p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              All ({cities.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === "active" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Active ({cities.filter((c) => c.isActive).length})
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === "inactive" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Inactive ({cities.filter((c) => !c.isActive).length})
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Selection Floating / Action Banner */}
      {selectedCityIds.length > 0 && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Badge variant="success" className="font-mono text-xs">
              {selectedCityIds.length} Selected
            </Badge>
            <span className="text-slate-300">
              Apply bulk changes to the selected cities.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleOpenBulkFeeModal("selected")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs h-7"
            >
              <Coins className="w-3.5 h-3.5 mr-1" />
              Set Fee for {selectedCityIds.length} Cities
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedCityIds([])}
              className="border-slate-700 text-slate-300 hover:text-white font-mono text-xs h-7"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Cities Table */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Loading Delivery Cities & Fees...
          </p>
        </div>
      ) : filteredCities.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-[#0e1420]/50 p-8">
          <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Delivery Cities Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedDistrict !== "all"
              ? "No cities matched the active filters."
              : "No delivery cities are registered yet."}
          </p>
          <Button onClick={handleOpenCreate} className="mt-4 bg-white text-black hover:bg-slate-200">
            <Plus className="w-4 h-4 mr-1.5" />
            Add First City
          </Button>
        </div>
      ) : (
        <div className="bg-[#0e1420] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 accent-emerald-500 cursor-pointer"
                      title="Select all visible cities"
                    />
                  </th>
                  <th className="py-3 px-4">City / Area Name</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Postal Code</th>
                  <th className="py-3 px-4">Province</th>
                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Delivery Fee (LKR)</span>
                    </div>
                  </th>
                  <th className="py-3 px-4">Est. Delivery</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredCities.map((city) => {
                  const isSelected = selectedCityIds.includes(city.id);
                  const isInline = inlineEditingId === city.id;

                  return (
                    <tr
                      key={city.id}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isSelected ? "bg-emerald-950/20" : ""
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectCity(city.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 accent-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* City Name */}
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="tracking-tight">{city.name}</span>
                      </td>

                      {/* District */}
                      <td className="py-3 px-4 font-mono font-medium">{city.district}</td>

                      {/* Postal Code */}
                      <td className="py-3 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                          {city.postalCode}
                        </span>
                      </td>

                      {/* Province */}
                      <td className="py-3 px-4 text-slate-400">{city.province}</td>

                      {/* Delivery Fee with Inline Quick Edit */}
                      <td className="py-3 px-4">
                        {isInline ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-slate-500">Rs.</span>
                            <Input
                              type="number"
                              value={inlineFeeValue}
                              onChange={(e) => setInlineFeeValue(e.target.value)}
                              placeholder="Fee (e.g. 350)"
                              className="w-24 h-7 text-xs font-mono bg-slate-950 border-emerald-500/50 text-white px-2"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveInlineFee(city);
                                if (e.key === "Escape") setInlineEditingId(null);
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveInlineFee(city)}
                              disabled={inlineSaving}
                              className="h-7 w-7 p-0 bg-emerald-600 hover:bg-emerald-500 text-white"
                              title="Save Fee"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setInlineEditingId(null)}
                              className="h-7 w-7 p-0 text-slate-400 hover:text-white"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartInlineEdit(city)}
                            className="group/fee flex items-center gap-2 cursor-pointer py-1 px-2 -mx-2 rounded hover:bg-slate-800/60 transition-colors"
                            title="Click to edit delivery fee directly"
                          >
                            <span className="font-mono font-bold text-white text-[12px]">
                              {city.deliveryFee !== null && city.deliveryFee !== undefined
                                ? city.deliveryFee === 0
                                  ? "FREE"
                                  : `Rs. ${city.deliveryFee.toLocaleString()}`
                                : "Rs. 350 (Std)"}
                            </span>
                            <Edit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover/fee:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </td>

                      {/* Delivery Time */}
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {city.estimatedDeliveryDays || "2-3 Days"}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <Badge variant={city.isActive ? "success" : "secondary"}>
                          {city.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(city)}
                            className="h-7 px-2 text-slate-400 hover:text-white"
                            title={city.isActive ? "Disable City" : "Enable City"}
                          >
                            {city.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(city)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-white"
                            title="Edit Full City Details & Fee"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingCity(city)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                            title="Delete City"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* BULK UPDATE DELIVERY FEE MODAL */}
      {isBulkFeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e1420] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Coins className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-black text-white uppercase tracking-wider font-mono">
                  Bulk Set Delivery Fee
                </h2>
              </div>
              <button
                onClick={() => setIsBulkFeeModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteBulkFeeUpdate} className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-mono uppercase text-slate-300 mb-2 block">
                  Select Scope <span className="text-rose-400">*</span>
                </Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="scope"
                      value="all"
                      checked={bulkFeeScope === "all"}
                      onChange={() => setBulkFeeScope("all")}
                      className="accent-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-white text-xs block">
                        All Registered Cities ({cities.length} Cities)
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Applies standard delivery fee to all cities island-wide.
                      </span>
                    </div>
                  </label>

                  {selectedDistrict !== "all" && (
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="scope"
                        value="district"
                        checked={bulkFeeScope === "district"}
                        onChange={() => setBulkFeeScope("district")}
                        className="accent-emerald-500"
                      />
                      <div>
                        <span className="font-bold text-white text-xs block">
                          Only {selectedDistrict} District ({cities.filter((c) => c.district.toLowerCase() === selectedDistrict.toLowerCase()).length} Cities)
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Update cities located in {selectedDistrict} only.
                        </span>
                      </div>
                    </label>
                  )}

                  {selectedCityIds.length > 0 && (
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="scope"
                        value="selected"
                        checked={bulkFeeScope === "selected"}
                        onChange={() => setBulkFeeScope("selected")}
                        className="accent-emerald-500"
                      />
                      <div>
                        <span className="font-bold text-white text-xs block">
                          Selected Cities Only ({selectedCityIds.length} Cities)
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Update only the checkboxes you selected in the table.
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                  New Delivery Fee (LKR) <span className="text-rose-400">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-500">
                    Rs.
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    value={bulkFeeAmount}
                    onChange={(e) => setBulkFeeAmount(e.target.value)}
                    placeholder="e.g. 350 or 0 for Free Delivery"
                    className="pl-10 bg-slate-950 border-slate-800 text-xs font-mono text-white"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter 0 for Free Delivery, or leave blank to reset to standard checkout fallback.
                </p>
              </div>

              <div>
                <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                  Estimated Delivery Timeline (Optional)
                </Label>
                <Input
                  type="text"
                  value={bulkEstimatedDays}
                  onChange={(e) => setBulkEstimatedDays(e.target.value)}
                  placeholder="e.g. 2-3 Business Days (leave empty to keep unchanged)"
                  className="bg-slate-950 border-slate-800 text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBulkFeeModalOpen(false)}
                  className="border-slate-800 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={bulkUpdating}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs"
                >
                  {bulkUpdating ? "Applying to Cities..." : "Apply Delivery Fee"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CITY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e1420] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-white" />
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  {editingCity ? "Edit Delivery City & Fee" : "Add Delivery City"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                  City / Area Name <span className="text-rose-400">*</span>
                </Label>
                <Input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Colombo 03 (Kollupitiya) or Kandy"
                  className="bg-slate-950 border-slate-800 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                    District <span className="text-rose-400">*</span>
                  </Label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-hidden"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                    Postal Code <span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={formPostalCode}
                    onChange={(e) => setFormPostalCode(e.target.value)}
                    placeholder="e.g. 00300"
                    className="bg-slate-950 border-slate-800 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                    Province <span className="text-rose-400">*</span>
                  </Label>
                  <select
                    value={formProvince}
                    onChange={(e) => setFormProvince(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-hidden"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                    Delivery Fee (LKR)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-slate-500">
                      Rs.
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      value={formDeliveryFee}
                      onChange={(e) => setFormDeliveryFee(e.target.value)}
                      placeholder="e.g. 350"
                      className="pl-8 bg-slate-950 border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                    Estimated Delivery
                  </Label>
                  <Input
                    type="text"
                    value={formEstimatedDays}
                    onChange={(e) => setFormEstimatedDays(e.target.value)}
                    placeholder="e.g. 2-3 Days"
                    className="bg-slate-950 border-slate-800 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                    Display Order
                  </Label>
                  <Input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(parseInt(e.target.value) || 1)}
                    className="bg-slate-950 border-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <span>Active for Customer Checkout</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-slate-800 text-slate-300"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-white text-black hover:bg-slate-200">
                  {saving ? "Saving..." : editingCity ? "Save Changes" : "Create City"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCity && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e1420] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold uppercase tracking-wider font-mono text-white">
                Delete Delivery City
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove <span className="font-bold text-white">{deletingCity.name}</span> ({deletingCity.district}) from the delivery destination list?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingCity(null)}
                className="border-slate-800 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
