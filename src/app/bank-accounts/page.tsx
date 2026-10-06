"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  fetchAdminBankDetails,
  createAdminBankDetail,
  updateAdminBankDetail,
  toggleAdminBankDetailActive,
  deleteAdminBankDetail,
  uploadAdminProductImage,
} from "@/lib/api";
import { BankDetail } from "@/types";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  Copy,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  CreditCard,
  Landmark,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const SRI_LANKA_BANKS = [
  "Commercial Bank of Ceylon",
  "Sampath Bank",
  "Hatton National Bank (HNB)",
  "Nations Trust Bank (NTB)",
  "Seylan Bank",
  "Bank of Ceylon (BOC)",
  "People's Bank",
  "DFCC Bank",
];

export default function BankAccountsPage() {
  const [bankAccounts, setBankAccounts] = useState<BankDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Create / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankDetail | null>(null);
  const [formBankName, setFormBankName] = useState("Commercial Bank of Ceylon");
  const [formAccountName, setFormAccountName] = useState("CALVIZ APPAREL (PVT) LTD");
  const [formAccountNumber, setFormAccountNumber] = useState("");
  const [formBranch, setFormBranch] = useState("Colombo Main Branch");
  const [formSwiftCode, setFormSwiftCode] = useState("");
  const [formInstructions, setFormInstructions] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState<string>("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Delete modal state
  const [deletingBank, setDeletingBank] = useState<BankDetail | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Copy feedback
  const [copiedAcc, setCopiedAcc] = useState<string | null>(null);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminBankDetails();
      setBankAccounts(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load bank accounts";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const filteredBanks = useMemo(() => {
    return bankAccounts.filter((b) => {
      const matchesSearch =
        b.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.branch.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && b.isActive) ||
        (statusFilter === "inactive" && !b.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [bankAccounts, searchQuery, statusFilter]);

  const handleOpenCreate = () => {
    setEditingBank(null);
    setFormBankName("Commercial Bank of Ceylon");
    setFormAccountName("CALVIZ APPAREL (PVT) LTD");
    setFormAccountNumber("");
    setFormBranch("Colombo Main Branch");
    setFormSwiftCode("CCEYLKX");
    setFormInstructions("Please use your Order Number or Phone Number as deposit reference.");
    setFormLogoUrl("");
    setFormIsActive(true);
    setFormDisplayOrder(bankAccounts.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bank: BankDetail) => {
    setEditingBank(bank);
    setFormBankName(bank.bankName);
    setFormAccountName(bank.accountName);
    setFormAccountNumber(bank.accountNumber);
    setFormBranch(bank.branch);
    setFormSwiftCode(bank.swiftCode || "");
    setFormInstructions(bank.instructions || "");
    setFormLogoUrl(bank.logoUrl || "");
    setFormIsActive(bank.isActive);
    setFormDisplayOrder(bank.displayOrder);
    setIsModalOpen(true);
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    try {
      setUploadingLogo(true);
      setError(null);
      const res = await uploadAdminProductImage(file);
      setFormLogoUrl(res.imageUrl);
      setSuccess("Bank logo uploaded successfully!");
      setTimeout(() => setSuccess(null), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload logo image";
      setError(msg);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBankName.trim() || !formAccountNumber.trim() || !formAccountName.trim() || !formBranch.trim()) {
      setError("Please fill all required bank fields.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingBank) {
        const updated = await updateAdminBankDetail(editingBank.id, {
          id: editingBank.id,
          bankName: formBankName.trim(),
          accountName: formAccountName.trim(),
          accountNumber: formAccountNumber.trim(),
          branch: formBranch.trim(),
          swiftCode: formSwiftCode.trim() || undefined,
          instructions: formInstructions.trim() || undefined,
          logoUrl: formLogoUrl.trim() || null,
          isActive: formIsActive,
          displayOrder: Number(formDisplayOrder) || 0,
        });

        setBankAccounts((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        setSuccess(`Updated bank account ${updated.bankName} successfully.`);
      } else {
        const created = await createAdminBankDetail({
          bankName: formBankName.trim(),
          accountName: formAccountName.trim(),
          accountNumber: formAccountNumber.trim(),
          branch: formBranch.trim(),
          swiftCode: formSwiftCode.trim() || undefined,
          instructions: formInstructions.trim() || undefined,
          logoUrl: formLogoUrl.trim() || null,
          isActive: formIsActive,
          displayOrder: Number(formDisplayOrder) || 0,
        });

        setBankAccounts((prev) => [...prev, created]);
        setSuccess(`Added bank account ${created.bankName} successfully.`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save bank account";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (bank: BankDetail) => {
    try {
      const newStatus = await toggleAdminBankDetailActive(bank.id);
      setBankAccounts((prev) =>
        prev.map((b) => (b.id === bank.id ? { ...b, isActive: newStatus } : b))
      );
      setSuccess(`${bank.bankName} is now ${newStatus ? "ACTIVE" : "INACTIVE"}.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle bank account status";
      setError(msg);
    }
  };

  const handleDelete = async () => {
    if (!deletingBank) return;
    try {
      setDeleting(true);
      await deleteAdminBankDetail(deletingBank.id);
      setBankAccounts((prev) => prev.filter((b) => b.id !== deletingBank.id));
      setSuccess(`Deleted bank account ${deletingBank.bankName}.`);
      setDeletingBank(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete bank account";
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyAcc = (acc: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedAcc(acc);
    setTimeout(() => setCopiedAcc(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
              Bank Accounts Configuration
            </h1>
            <Badge variant="secondary" className="font-mono">
              {bankAccounts.length} Accounts
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage corporate deposit accounts and bank logos displayed during customer checkout & order status tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadBankAccounts}
            className="border-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleOpenCreate} className="bg-white text-black hover:bg-slate-200">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Bank Account
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search bank name, account, branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#0e1420] border-slate-800 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-[#0e1420] p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              All ({bankAccounts.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === "active" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Active ({bankAccounts.filter((b) => b.isActive).length})
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === "inactive" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Inactive ({bankAccounts.filter((b) => !b.isActive).length})
            </button>
          </div>
        </div>
      </div>

      {/* Bank Accounts Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Loading Bank Details...
          </p>
        </div>
      ) : filteredBanks.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-[#0e1420]/50 p-8">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Bank Accounts Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? "No accounts matched your search criteria."
              : "No bank accounts are registered in the system yet."}
          </p>
          <Button onClick={handleOpenCreate} className="mt-4 bg-white text-black hover:bg-slate-200">
            <Plus className="w-4 h-4 mr-1.5" />
            Add First Bank Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBanks.map((bank) => (
            <div
              key={bank.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                bank.isActive
                  ? "bg-[#0e1420] border-slate-800 hover:border-slate-700 shadow-xs"
                  : "bg-[#0e1420]/40 border-slate-900 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    {bank.logoUrl ? (
                      <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={bank.logoUrl}
                          alt={bank.bankName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex-shrink-0">
                        <Landmark className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{bank.bankName}</h3>
                      <p className="text-[11px] font-mono text-slate-400">{bank.branch}</p>
                    </div>
                  </div>

                  <Badge variant={bank.isActive ? "success" : "secondary"}>
                    {bank.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2 text-xs font-mono my-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 uppercase text-[10px]">Account No</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-bold tracking-wider">{bank.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyAcc(bank.accountNumber)}
                        className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                        title="Copy Account Number"
                      >
                        {copiedAcc === bank.accountNumber ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 uppercase text-[10px]">Beneficiary</span>
                    <span className="text-slate-300 truncate max-w-[160px]">{bank.accountName}</span>
                  </div>

                  {bank.swiftCode && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 uppercase text-[10px]">SWIFT</span>
                      <span className="text-slate-400">{bank.swiftCode}</span>
                    </div>
                  )}
                </div>

                {bank.instructions && (
                  <p className="text-[11px] text-slate-400 italic mb-4 line-clamp-2">
                    &ldquo;{bank.instructions}&rdquo;
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleStatus(bank)}
                  className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
                >
                  {bank.isActive ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 mr-1" /> Deactivate
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 mr-1" /> Activate
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(bank)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Edit Bank Account"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingBank(bank)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Delete Bank Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e1420] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0e1420] z-10">
              <div className="flex items-center gap-2.5">
                <Landmark className="w-5 h-5 text-white" />
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  {editingBank ? "Edit Bank Account" : "Add New Bank Account"}
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
              {/* Bank Logo Upload & Preview */}
              <div>
                <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                  Bank Logo
                </Label>
                <div className="flex items-center gap-4 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  {formLogoUrl ? (
                    <div className="relative w-14 h-14 bg-white rounded-lg p-1.5 border border-slate-700 flex items-center justify-center flex-shrink-0">
                      <img
                        src={formLogoUrl}
                        alt="Bank Logo Preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setFormLogoUrl("")}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-rose-600 shadow"
                        title="Remove logo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-slate-900 border border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-500 flex-shrink-0">
                      <ImageIcon className="w-5 h-5 mb-0.5" />
                      <span className="text-[8px] uppercase font-mono">No Logo</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono rounded-lg transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingLogo ? "Uploading..." : "Upload Logo Image"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileUpload}
                          disabled={uploadingLogo}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <Input
                      type="text"
                      value={formLogoUrl}
                      onChange={(e) => setFormLogoUrl(e.target.value)}
                      placeholder="Or enter logo image URL (e.g. /uploads/commercial-bank.png)"
                      className="bg-slate-900 border-slate-800 text-[11px] font-mono h-8"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                  Bank Name <span className="text-rose-400">*</span>
                </Label>
                <div className="space-y-2">
                  <Input
                    type="text"
                    value={formBankName}
                    onChange={(e) => setFormBankName(e.target.value)}
                    placeholder="e.g. Commercial Bank of Ceylon"
                    className="bg-slate-950 border-slate-800 text-xs"
                    required
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {SRI_LANKA_BANKS.map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setFormBankName(b)}
                        className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors ${
                          formBankName === b
                            ? "bg-white text-black font-bold"
                            : "bg-slate-900 text-slate-400 hover:text-white"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                    Account Number <span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={formAccountNumber}
                    onChange={(e) => setFormAccountNumber(e.target.value)}
                    placeholder="e.g. 8010045231"
                    className="bg-slate-950 border-slate-800 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                    Account Holder Name <span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={formAccountName}
                    onChange={(e) => setFormAccountName(e.target.value)}
                    placeholder="e.g. CALVIZ APPAREL (PVT) LTD"
                    className="bg-slate-950 border-slate-800 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                    Branch <span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    placeholder="e.g. Colombo Main Branch"
                    className="bg-slate-950 border-slate-800 text-xs"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                    SWIFT / BIC Code (Optional)
                  </Label>
                  <Input
                    type="text"
                    value={formSwiftCode}
                    onChange={(e) => setFormSwiftCode(e.target.value)}
                    placeholder="e.g. CCEYLKX"
                    className="bg-slate-950 border-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-mono uppercase text-slate-300 mb-1.5 block">
                  Deposit Instructions for Customers (Optional)
                </Label>
                <textarea
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="e.g. Please use your Order Number as deposit reference."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-hidden focus:border-slate-600 resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 accent-white rounded"
                  />
                  <span>Display on Storefront (Active)</span>
                </label>

                <div>
                  <Label className="text-[10px] font-mono uppercase text-slate-400 mb-1 block">
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

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2 sticky bottom-0 bg-[#0e1420]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-slate-800 text-slate-300"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || uploadingLogo} className="bg-white text-black hover:bg-slate-200">
                  {saving ? "Saving..." : editingBank ? "Save Changes" : "Create Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBank && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e1420] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold uppercase tracking-wider font-mono text-white">
                Delete Bank Account
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete <span className="font-bold text-white">{deletingBank.bankName}</span> ({deletingBank.accountNumber})?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingBank(null)}
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
