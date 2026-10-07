"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Upload,
  ExternalLink,
  CheckCircle2,
  Eye,
  ArrowUpDown,
  RefreshCw,
  Sparkles,
  AlertCircle,
  X,
  Link2,
  Sliders,
  Type,
  LayoutTemplate,
  Compass,
  FileText,
  Save,
  RotateCcw,
  ArrowRight,
  Tag,
  Percent,
  Gift,
  Flame,
  Copy,
  Check,
  Truck,
  ShieldCheck,
  Package,
} from "lucide-react";
import {
  LookbookBanner,
  LookbookBannerInput,
  HeroSectionConfig,
  HeroSlide,
  UpdateHeroSectionInput,
  OfferCard,
  OffersSectionConfig,
  UpdateOffersSectionInput,
  PromoCode,
  CreatePromoCodeInput,
  UpdatePromoCodeInput,
} from "@/types";
import {
  fetchAdminLookbooks,
  createAdminLookbook,
  updateAdminLookbook,
  deleteAdminLookbook,
  uploadLookbookPhoto,
  fetchAdminHeroSection,
  updateAdminHeroSection,
  uploadHeroSlideImage,
  fetchAdminOffersSection,
  updateAdminOffersSection,
  uploadOfferImage,
  fetchAdminPromoCodes,
  createAdminPromoCode,
  updateAdminPromoCode,
  deleteAdminPromoCode,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 0,
    title: "FIG. 01 — BOXY DROP SHOULDER",
    tag: "HEAVYWEIGHT EDITION",
    img: "https://lh3.googleusercontent.com/aida/AEtjO1W2UlicQK-ALNnpCFI_VnuAFHutBsM5uozFpmtPjMXZsKgJaWhuXUp4SDT1tJNzteqkhaiH2znBpGa_yQ2sr3WBt_5huSnSvMcSV6thVGD_KhYlLUIVjIqtwj2g5iI8la0TFUIpcr1C06lWj9EtWpnFrZ06wCyOupxEFBXyjgGa-3zYp-HEWnXyUBhZqXtBhAWnLx6mdqBN9l2gOhTIPTpQU8-meqP0eOIh29qFsd0yU35In11zyiQ7kKk",
  },
  {
    id: 1,
    title: "FIG. 02 — STARK WHITE DRAPE",
    tag: "ORGANIC COMBED YARNS",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuzg2LxzQkqrpZ4G57-36DmhgQTo3PWG0pVQqECJXLgfz256S3dcn95qPKrhKTJI0-c7286_Xck46Ut994iOeXcwn9eiyzctwx7_-bPcBuLxJUGoWYCFdbQo1wsHWwuPRKr7bPCcQDzsgg51Se6K_2sLE3dpbRYg2cdAm4CnAt87wxoHMfr2iq8ewcMfdoi4IbJLt2ciAtVu0kYTKa-ocQ2x0BarK62BWYFxyclf44msB7TWnX-pyXGVTqYyWlwFHAyg",
  },
  {
    id: 2,
    title: "FIG. 03 — ARCHIVAL MONOGRAM",
    tag: "TACTILE SILK SCREEN",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFnAGDvyhL3sXyDD_E5Gd40gtlkrLg5U0fzEkMEwEj6cLdeoe-OnZEOsxZ52lrnPyqSlcotASCOtIO3MAqzuMSzLCKAG7cyCaxHd1G9jVCebSPrF2umtYF3D3Mi4ZgbUL2COuqHrxJ8cvHeTpYU20oHPNcC-1ZUnN2a0Orw0k-tSbzU3MzViAYt9qe0_5xC0Uz9MU9ycSdjfmYr3-cNRh14HqEm2vbbQTMkEqdVz_SiU-r5tENpU4DX2DLMkE0C7obrQ",
  },
];

const DEFAULT_OFFER_CARDS: OfferCard[] = [
  {
    id: 1,
    icon: "Truck",
    badge: "ZERO-FEE LOGISTICS",
    title: "FREE ISLAND-WIDE SHIPPING",
    description: "Every order exceeding LKR 10,000 qualifies for complimentary express door-to-door courier dispatch across Sri Lanka.",
    footerTag: "AUTO-APPLIED AT CHECKOUT",
    buttonText: "SHOP NOW",
    buttonUrl: "#catalog",
    imageUrl: "https://lh3.googleusercontent.com/aida/AEtjO1VWwzrkvIXs9P97KvIEZny8bXkyVwlwGXt5FNUiMjAAm8Q-Jl5tRqWalnbNioctZvKjriLbJKNWdIe33IhvB-tDSUS4gJkF6_OFTzdNhnpUV83im4x1-rnF6Xl416VwRxs1DtvB2Okh3KqxI9CsTw_jHqg5r6d5kI1jlUQKEzgBT5mq1sm3H3_eWNP6h3zLvYtShouuQ6vlFZURcCQKan4dXMus65fsc_ywlsVmcKdeuaK8tsb3oe5rmI0",
  },
  {
    id: 2,
    icon: "ShieldCheck",
    badge: "EXPRESS LOGISTICS",
    title: "DOORSTEP DELIVERY IN 24 HOURS",
    description: "Enjoy rapid 24-hour door-to-door express delivery across Colombo and priority island-wide courier dispatch with 7-day size exchange.",
    footerTag: "COLOMBO 24H DISPATCH",
    buttonText: "HOW IT WORKS",
    buttonUrl: "#doorstep-delivery",
    imageUrl: "/doorstep-delivery.jpg",
  },
  {
    id: 3,
    icon: "Flame",
    badge: "EARLY ALLOCATION",
    title: "DROP 02 VIP EARLY PASS",
    description: "Join our private client reservation ledger to gain priority checkout access 2 hours before Drop 02 is released to the general public.",
    footerTag: "LIMITED TO 200 CLIENTS",
    buttonText: "CLAIM PASS",
    buttonUrl: "#vip-reservation",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFnAGDvyhL3sXyDD_E5Gd40gtlkrLg5U0fzEkMEwEj6cLdeoe-OnZEOsxZ52lrnPyqSlcotASCOtIO3MAqzuMSzLCKAG7cyCaxHd1G9jVCebSPrF2umtYF3D3Mi4ZgbUL2COuqHrxJ8cvHeTpYU20oHPNcC-1ZUnN2a0Orw0k-tSbzU3MzViAYt9qe0_5xC0Uz9MU9ycSdjfmYr3-cNRh14HqEm2vbbQTMkEqdVz_SiU-r5tENpU4DX2DLMkE0C7obrQ",
  },
];

const DEFAULT_OFFERS_CONFIG: UpdateOffersSectionInput = {
  tagline: "SEASONAL PRIVILEGES & CLIENT OFFERS",
  title: "CURATED ATELIER OFFERS",
  subtitle: "Exclusive wardrobe incentives, complimentary island-wide logistics, and doorstep assurance for the discerning client.",
  noteBadge: "ALL OFFERS ACTIVE FOR DROP 01 ARCHIVE",
  marqueeText: "✦ ARCHIVAL DUO BUNDLE: SAVE 10% ON 2+ TEES WITH CODE \"CALVIZ10\" ✦ FREE ISLAND-WIDE EXPRESS DISPATCH ON ORDERS OVER LKR 10,000 ✦ DOORSTEP DELIVERY WITHIN 24 HOURS ✦ 7-DAY EFFORTLESS SIZE EXCHANGES ✦ VIP EARLY ALLOCATION PASSES ACTIVE FOR DROP 02 ✦",
  heroBadge: "CAPSULE BUNDLE PRIVILEGE",
  heroTitle: "ARCHIVAL DUO BUNDLE: SAVE 10% ON 2+ TEES",
  heroDescription: "Upgrade your daily rotation. Add any two or more heavyweight tees across Drop 01 to your cart and claim an instant 10% privilege discount.",
  heroPromoCode: "CALVIZ10",
  heroButtonText: "EXPLORE CAPSULE",
  heroButtonUrl: "#catalog",
  heroImageUrl: "https://lh3.googleusercontent.com/aida/AEtjO1W2UlicQK-ALNnpCFI_VnuAFHutBsM5uozFpmtPjMXZsKgJaWhuXUp4SDT1tJNzteqkhaiH2znBpGa_yQ2sr3WBt_5huSnSvMcSV6thVGD_KhYlLUIVjIqtwj2g5iI8la0TFUIpcr1C06lWj9EtWpnFrZ06wCyOupxEFBXyjgGa-3zYp-HEWnXyUBhZqXtBhAWnLx6mdqBN9l2gOhTIPTpQU8-meqP0eOIh29qFsd0yU35In11zyiQ7kKk",
  heroPerk1Title: "AUTOMATIC CART STACKING",
  heroPerk1Description: "Stacks seamlessly with island-wide free dispatch on orders over LKR 10,000.",
  heroPerk2Title: "ALL SIZES & CUTS ELIGIBLE",
  heroPerk2Description: "Mix and match between Obsidian Black, Stark White & Graphic Editions.",
  cardsJson: JSON.stringify(DEFAULT_OFFER_CARDS, null, 2),
  isActive: true,
};

export default function BannersPage() {
  const [activeTab, setActiveTab] = useState<"hero" | "lookbook" | "offers" | "rules">("hero");

  // ==========================================
  // LOOKBOOK BANNERS STATE
  // ==========================================
  const [banners, setBanners] = useState<LookbookBanner[]>([]);
  const [loadingLookbooks, setLoadingLookbooks] = useState(true);
  const [lookbookError, setLookbookError] = useState<string | null>(null);

  // Lookbook Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<LookbookBanner | null>(null);
  const [savingLookbook, setSavingLookbook] = useState(false);
  const [uploadingLookbookImage, setUploadingLookbookImage] = useState(false);

  // Lookbook Delete Modal State
  const [deletingBanner, setDeletingBanner] = useState<LookbookBanner | null>(null);
  const [isDeletingLookbook, setIsDeletingLookbook] = useState(false);

  // Lookbook Form State
  const [formData, setFormData] = useState<LookbookBannerInput>({
    title: "",
    subtitle: "",
    description: "",
    imageUrl: "",
    linkUrl: "/products",
    badgeText: "",
    isLarge: false,
    displayOrder: 1,
    isActive: true,
  });

  const lookbookFileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // HERO SECTION CMS STATE
  // ==========================================
  const [heroConfig, setHeroConfig] = useState<UpdateHeroSectionInput>({
    badgeText: "CAPSULE DROP 01",
    locationText: "COLOMBO 6.9271° N, 79.8612° E",
    titleLine1: "ARCHITECTURAL",
    titleLine2: "silhouette.",
    titleLine3: "HEAVYWEIGHT WEAVE.",
    description:
      "Structured boxy proportions cut from custom-milled organic combed cotton with tension-locked anti-sag collar ribbing.",
    primaryButtonText: "EXPLORE COLLECTION",
    primaryButtonUrl: "#catalog",
    secondaryButtonText: "TRACK ORDER",
    secondaryButtonUrl: "/track",
    spec1Label: "FABRIC DENSITY",
    spec1Value: "HEAVYWEIGHT",
    spec2Label: "COLLAR SPEC",
    spec2Value: "ZERO-SAG",
    spec3Label: "LIMITED RUN",
    spec3Value: "250 UNITS",
    slidesJson: JSON.stringify(DEFAULT_SLIDES, null, 2),
    isActive: true,
  });

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [loadingHero, setLoadingHero] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [heroSuccessMsg, setHeroSuccessMsg] = useState<string | null>(null);
  const [heroErrorMsg, setHeroErrorMsg] = useState<string | null>(null);
  const [activeSlidePreview, setActiveSlidePreview] = useState(0);
  const [uploadingHeroIndex, setUploadingHeroIndex] = useState<number | null>(null);
  const heroSlideFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // ==========================================
  // OFFERS & PRIVILEGES CMS STATE
  // ==========================================
  const [offersConfig, setOffersConfig] = useState<UpdateOffersSectionInput>(DEFAULT_OFFERS_CONFIG);
  const [offerCards, setOfferCards] = useState<OfferCard[]>(DEFAULT_OFFER_CARDS);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [savingOffers, setSavingOffers] = useState(false);
  const [offersSuccessMsg, setOffersSuccessMsg] = useState<string | null>(null);
  const [offersErrorMsg, setOffersErrorMsg] = useState<string | null>(null);
  const [uploadingHeroOfferImage, setUploadingHeroOfferImage] = useState(false);
  const [uploadingOfferCardIndex, setUploadingOfferCardIndex] = useState<number | null>(null);
  const [copiedPromoPreview, setCopiedPromoPreview] = useState(false);

  const heroOfferFileInputRef = useRef<HTMLInputElement>(null);
  const offerCardFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // ==========================================
  // PROMO CODES & RULES ENGINE STATE
  // ==========================================
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [promoErrorMsg, setPromoErrorMsg] = useState<string | null>(null);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);

  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [savingPromo, setSavingPromo] = useState(false);

  const [promoFormData, setPromoFormData] = useState<CreatePromoCodeInput>({
    code: "",
    title: "",
    description: "",
    discountType: "FixedAmount",
    discountValue: 1500,
    minItemQuantity: 2,
    minOrderSubtotal: 0,
    maxUsesPerCustomer: 1,
    maxTotalUses: null,
    isActive: true,
    startDate: null,
    expiryDate: null,
  });

  const [deletingPromo, setDeletingPromo] = useState<PromoCode | null>(null);
  const [isDeletingPromo, setIsDeletingPromo] = useState(false);

  // ==========================================
  // DATA LOADERS
  // ==========================================
  const loadPromos = async () => {
    try {
      setLoadingPromos(true);
      setPromoErrorMsg(null);
      const data = await fetchAdminPromoCodes();
      setPromos(data);
    } catch (err: any) {
      console.error(err);
      setPromoErrorMsg(err.message || "Failed to load promo codes.");
    } finally {
      setLoadingPromos(false);
    }
  };

  const loadBanners = async () => {
    try {
      setLoadingLookbooks(true);
      setLookbookError(null);
      const data = await fetchAdminLookbooks();
      setBanners(data);
    } catch (err: any) {
      console.error(err);
      setLookbookError(err.message || "Failed to load lookbook banners.");
    } finally {
      setLoadingLookbooks(false);
    }
  };

  const loadHeroSection = async () => {
    try {
      setLoadingHero(true);
      setHeroErrorMsg(null);
      const data = await fetchAdminHeroSection();
      if (data) {
        setHeroConfig({
          badgeText: data.badgeText || "CAPSULE DROP 01",
          locationText: data.locationText || "COLOMBO 6.9271° N, 79.8612° E",
          titleLine1: data.titleLine1 || "ARCHITECTURAL",
          titleLine2: data.titleLine2 || "silhouette.",
          titleLine3: data.titleLine3 || "HEAVYWEIGHT WEAVE.",
          description: data.description || "",
          primaryButtonText: data.primaryButtonText || "EXPLORE COLLECTION",
          primaryButtonUrl: data.primaryButtonUrl || "#catalog",
          secondaryButtonText: data.secondaryButtonText || "TRACK ORDER",
          secondaryButtonUrl: data.secondaryButtonUrl || "/track",
          spec1Label: data.spec1Label || "FABRIC DENSITY",
          spec1Value: data.spec1Value || "HEAVYWEIGHT",
          spec2Label: data.spec2Label || "COLLAR SPEC",
          spec2Value: data.spec2Value || "ZERO-SAG",
          spec3Label: data.spec3Label || "LIMITED RUN",
          spec3Value: data.spec3Value || "250 UNITS",
          slidesJson: data.slidesJson || JSON.stringify(DEFAULT_SLIDES, null, 2),
          isActive: data.isActive ?? true,
        });

        if (data.slidesJson) {
          try {
            const parsed = JSON.parse(data.slidesJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setHeroSlides(parsed);
            }
          } catch (e) {
            console.error("Failed to parse slides JSON", e);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setHeroErrorMsg(err.message || "Failed to load Hero section configuration.");
    } finally {
      setLoadingHero(false);
    }
  };

  const loadOffersSection = async () => {
    try {
      setLoadingOffers(true);
      setOffersErrorMsg(null);
      const data = await fetchAdminOffersSection();
      if (data) {
        setOffersConfig({
          tagline: data.tagline || DEFAULT_OFFERS_CONFIG.tagline,
          title: data.title || DEFAULT_OFFERS_CONFIG.title,
          subtitle: data.subtitle || DEFAULT_OFFERS_CONFIG.subtitle,
          noteBadge: data.noteBadge || DEFAULT_OFFERS_CONFIG.noteBadge,
          marqueeText: data.marqueeText || DEFAULT_OFFERS_CONFIG.marqueeText,
          heroBadge: data.heroBadge || DEFAULT_OFFERS_CONFIG.heroBadge,
          heroTitle: data.heroTitle || DEFAULT_OFFERS_CONFIG.heroTitle,
          heroDescription: data.heroDescription || DEFAULT_OFFERS_CONFIG.heroDescription,
          heroPromoCode: data.heroPromoCode || DEFAULT_OFFERS_CONFIG.heroPromoCode,
          heroButtonText: data.heroButtonText || DEFAULT_OFFERS_CONFIG.heroButtonText,
          heroButtonUrl: data.heroButtonUrl || DEFAULT_OFFERS_CONFIG.heroButtonUrl,
          heroImageUrl: data.heroImageUrl || DEFAULT_OFFERS_CONFIG.heroImageUrl,
          heroPerk1Title: data.heroPerk1Title || DEFAULT_OFFERS_CONFIG.heroPerk1Title,
          heroPerk1Description: data.heroPerk1Description || DEFAULT_OFFERS_CONFIG.heroPerk1Description,
          heroPerk2Title: data.heroPerk2Title || DEFAULT_OFFERS_CONFIG.heroPerk2Title,
          heroPerk2Description: data.heroPerk2Description || DEFAULT_OFFERS_CONFIG.heroPerk2Description,
          cardsJson: data.cardsJson || JSON.stringify(DEFAULT_OFFER_CARDS, null, 2),
          isActive: data.isActive ?? true,
        });

        if (data.cardsJson) {
          try {
            const parsed = JSON.parse(data.cardsJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setOfferCards(parsed);
            }
          } catch (e) {
            console.error("Failed to parse cards JSON", e);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setOffersErrorMsg(err.message || "Failed to load Offers section configuration.");
    } finally {
      setLoadingOffers(false);
    }
  };

  useEffect(() => {
    loadBanners();
    loadHeroSection();
    loadOffersSection();
    loadPromos();
  }, []);

  // ==========================================
  // PROMO CODES & RULES HANDLERS
  // ==========================================
  const handleOpenCreatePromo = () => {
    setEditingPromo(null);
    setPromoFormData({
      code: "",
      title: "",
      description: "",
      discountType: "FixedAmount",
      discountValue: 1500,
      minItemQuantity: 2,
      minOrderSubtotal: 0,
      maxUsesPerCustomer: 1,
      maxTotalUses: null,
      isActive: true,
      startDate: null,
      expiryDate: null,
    });
    setIsPromoModalOpen(true);
  };

  const handleOpenEditPromo = (promo: PromoCode) => {
    setEditingPromo(promo);
    setPromoFormData({
      code: promo.code,
      title: promo.title,
      description: promo.description || "",
      discountType: promo.discountType || "FixedAmount",
      discountValue: promo.discountValue,
      minItemQuantity: promo.minItemQuantity || 1,
      minOrderSubtotal: promo.minOrderSubtotal || 0,
      maxUsesPerCustomer: promo.maxUsesPerCustomer || 1,
      maxTotalUses: promo.maxTotalUses ?? null,
      isActive: promo.isActive,
      startDate: promo.startDate ? promo.startDate.substring(0, 10) : null,
      expiryDate: promo.expiryDate ? promo.expiryDate.substring(0, 10) : null,
    });
    setIsPromoModalOpen(true);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoFormData.code.trim() || !promoFormData.title.trim() || promoFormData.discountValue <= 0) {
      alert("Please provide a valid promo code, title, and discount value.");
      return;
    }

    try {
      setSavingPromo(true);
      setPromoErrorMsg(null);

      const payload = {
        ...promoFormData,
        code: promoFormData.code.trim().toUpperCase(),
        title: promoFormData.title.trim(),
        description: promoFormData.description?.trim() || undefined,
        minItemQuantity: Math.max(1, Number(promoFormData.minItemQuantity) || 1),
        minOrderSubtotal: Math.max(0, Number(promoFormData.minOrderSubtotal) || 0),
        maxUsesPerCustomer: Math.max(1, Number(promoFormData.maxUsesPerCustomer) || 1),
        discountValue: Number(promoFormData.discountValue) || 0,
        maxTotalUses: promoFormData.maxTotalUses ? Number(promoFormData.maxTotalUses) : null,
        startDate: promoFormData.startDate ? new Date(promoFormData.startDate).toISOString() : null,
        expiryDate: promoFormData.expiryDate ? new Date(promoFormData.expiryDate).toISOString() : null,
      };

      if (editingPromo) {
        await updateAdminPromoCode(editingPromo.id, {
          ...payload,
          id: editingPromo.id,
        });
        setPromoSuccessMsg(`Promo rule "${payload.code}" updated successfully!`);
      } else {
        await createAdminPromoCode(payload);
        setPromoSuccessMsg(`Promo rule "${payload.code}" created successfully!`);
      }

      setIsPromoModalOpen(false);
      await loadPromos();
      setTimeout(() => setPromoSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save promo code.");
    } finally {
      setSavingPromo(false);
    }
  };

  const handleTogglePromoActive = async (promo: PromoCode) => {
    try {
      await updateAdminPromoCode(promo.id, {
        id: promo.id,
        code: promo.code,
        title: promo.title,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minItemQuantity: promo.minItemQuantity,
        minOrderSubtotal: promo.minOrderSubtotal,
        maxUsesPerCustomer: promo.maxUsesPerCustomer,
        maxTotalUses: promo.maxTotalUses,
        isActive: !promo.isActive,
        startDate: promo.startDate,
        expiryDate: promo.expiryDate,
      });
      await loadPromos();
    } catch (err: any) {
      alert("Failed to toggle status: " + (err.message || "Unknown error"));
    }
  };

  const handleConfirmDeletePromo = async () => {
    if (!deletingPromo) return;
    try {
      setIsDeletingPromo(true);
      await deleteAdminPromoCode(deletingPromo.id);
      setDeletingPromo(null);
      await loadPromos();
    } catch (err: any) {
      alert("Failed to delete promo code: " + (err.message || "Unknown error"));
    } finally {
      setIsDeletingPromo(false);
    }
  };

  // ==========================================
  // OFFERS SECTION CMS HANDLERS
  // ==========================================
  const handleOfferCardChange = (index: number, field: keyof OfferCard, value: any) => {
    setOfferCards((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleUploadHeroOfferImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingHeroOfferImage(true);
      const res = await uploadOfferImage(file);
      setOffersConfig((prev) => ({ ...prev, heroImageUrl: res.imageUrl }));
    } catch (err: any) {
      alert("Failed to upload hero offer background image: " + (err.message || "Unknown error"));
    } finally {
      setUploadingHeroOfferImage(false);
      if (heroOfferFileInputRef.current) heroOfferFileInputRef.current.value = "";
    }
  };

  const handleUploadOfferCardImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingOfferCardIndex(index);
      const res = await uploadOfferImage(file);
      handleOfferCardChange(index, "imageUrl", res.imageUrl);
    } catch (err: any) {
      alert("Failed to upload offer card image: " + (err.message || "Unknown error"));
    } finally {
      setUploadingOfferCardIndex(null);
      if (offerCardFileInputRefs.current[index]) {
        offerCardFileInputRefs.current[index]!.value = "";
      }
    }
  };

  const handleSaveOffersConfig = async () => {
    try {
      setSavingOffers(true);
      setOffersSuccessMsg(null);
      setOffersErrorMsg(null);

      const payload: UpdateOffersSectionInput = {
        ...offersConfig,
        cardsJson: JSON.stringify(offerCards, null, 2),
      };

      await updateAdminOffersSection(payload);
      setOffersSuccessMsg("Offers & privileges section updated successfully! Storefront will reflect changes instantly.");
      setTimeout(() => setOffersSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error("Save offers config error:", err);
      setOffersErrorMsg(err.message || "Failed to save Offers section configuration.");
    } finally {
      setSavingOffers(false);
    }
  };

  const handleResetOffersDefaults = () => {
    if (!confirm("Reset Offers Section to official Calviz default branding?")) return;
    setOffersConfig(DEFAULT_OFFERS_CONFIG);
    setOfferCards(DEFAULT_OFFER_CARDS);
  };

  // ==========================================
  // HERO SECTION CMS HANDLERS
  // ==========================================
  const handleHeroSlideChange = (index: number, field: keyof HeroSlide, value: string) => {
    setHeroSlides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleHeroSlideUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingHeroIndex(index);
      const res = await uploadHeroSlideImage(file);
      handleHeroSlideChange(index, "img", res.imageUrl);
    } catch (err: any) {
      alert("Failed to upload hero image: " + (err.message || "Unknown error"));
    } finally {
      setUploadingHeroIndex(null);
      if (heroSlideFileInputRefs.current[index]) {
        heroSlideFileInputRefs.current[index]!.value = "";
      }
    }
  };

  const handleAddHeroSlide = () => {
    const newSlide: HeroSlide = {
      id: heroSlides.length,
      title: `FIG. 0${heroSlides.length + 1} — NEW PERSPECTIVE`,
      tag: "HEAVYWEIGHT EDITION",
      img: "https://lh3.googleusercontent.com/aida/AEtjO1W2UlicQK-ALNnpCFI_VnuAFHutBsM5uozFpmtPjMXZsKgJaWhuXUp4SDT1tJNzteqkhaiH2znBpGa_yQ2sr3WBt_5huSnSvMcSV6thVGD_KhYlLUIVjIqtwj2g5iI8la0TFUIpcr1C06lWj9EtWpnFrZ06wCyOupxEFBXyjgGa-3zYp-HEWnXyUBhZqXtBhAWnLx6mdqBN9l2gOhTIPTpQU8-meqP0eOIh29qFsd0yU35In11zyiQ7kKk",
    };
    setHeroSlides((prev) => [...prev, newSlide]);
    setActiveSlidePreview(heroSlides.length);
  };

  const handleRemoveHeroSlide = (index: number) => {
    if (heroSlides.length <= 1) {
      alert("At least one hero slide is required.");
      return;
    }
    const updated = heroSlides.filter((_, i) => i !== index);
    setHeroSlides(updated);
    if (activeSlidePreview >= updated.length) {
      setActiveSlidePreview(Math.max(0, updated.length - 1));
    }
  };

  const handleSaveHeroConfig = async () => {
    try {
      setSavingHero(true);
      setHeroSuccessMsg(null);
      setHeroErrorMsg(null);

      const payload: UpdateHeroSectionInput = {
        ...heroConfig,
        slidesJson: JSON.stringify(heroSlides, null, 2),
      };

      await updateAdminHeroSection(payload);
      setHeroSuccessMsg("Hero section updated successfully! Storefront will reflect changes instantly.");
      setTimeout(() => setHeroSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error("Save hero config error:", err);
      setHeroErrorMsg(err.message || "Failed to save Hero section configuration.");
    } finally {
      setSavingHero(false);
    }
  };

  const handleResetHeroDefaults = () => {
    if (!confirm("Reset Hero Section to official Calviz default branding?")) return;
    setHeroConfig({
      badgeText: "CAPSULE DROP 01",
      locationText: "COLOMBO 6.9271° N, 79.8612° E",
      titleLine1: "ARCHITECTURAL",
      titleLine2: "silhouette.",
      titleLine3: "HEAVYWEIGHT WEAVE.",
      description:
        "Structured boxy proportions cut from custom-milled organic combed cotton with tension-locked anti-sag collar ribbing.",
      primaryButtonText: "EXPLORE COLLECTION",
      primaryButtonUrl: "#catalog",
      secondaryButtonText: "TRACK ORDER",
      secondaryButtonUrl: "/track",
      spec1Label: "FABRIC DENSITY",
      spec1Value: "HEAVYWEIGHT",
      spec2Label: "COLLAR SPEC",
      spec2Value: "ZERO-SAG",
      spec3Label: "LIMITED RUN",
      spec3Value: "250 UNITS",
      slidesJson: JSON.stringify(DEFAULT_SLIDES, null, 2),
      isActive: true,
    });
    setHeroSlides(DEFAULT_SLIDES);
    setActiveSlidePreview(0);
  };

  // ==========================================
  // LOOKBOOK BANNERS HANDLERS
  // ==========================================
  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "LOOKBOOK // COLOMBO ATELIER",
      description: "",
      imageUrl: "",
      linkUrl: "/products",
      badgeText: `PLATE 0${banners.length + 1}`,
      isLarge: banners.length === 0,
      displayOrder: banners.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: LookbookBanner) => {
    setEditingBanner(banner);
    setFormData({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "/products",
      badgeText: banner.badgeText || "",
      isLarge: banner.isLarge,
      displayOrder: banner.displayOrder,
      isActive: banner.isActive,
    });
    setIsModalOpen(true);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLookbookImage(true);
      const res = await uploadLookbookPhoto(file);
      setFormData((prev) => ({ ...prev, imageUrl: res.imageUrl }));
    } catch (err: any) {
      alert("Failed to upload image: " + (err.message || "Unknown error"));
    } finally {
      setUploadingLookbookImage(false);
      if (lookbookFileInputRef.current) lookbookFileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a title for the banner.");
      return;
    }
    if (!formData.imageUrl.trim()) {
      alert("Please provide or upload an image.");
      return;
    }

    try {
      setSavingLookbook(true);
      if (editingBanner) {
        await updateAdminLookbook(editingBanner.id, formData);
      } else {
        await createAdminLookbook(formData);
      }
      setIsModalOpen(false);
      await loadBanners();
    } catch (err: any) {
      alert("Error saving lookbook banner: " + (err.message || "Unknown error"));
    } finally {
      setSavingLookbook(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBanner) return;
    try {
      setIsDeletingLookbook(true);
      await deleteAdminLookbook(deletingBanner.id);
      setDeletingBanner(null);
      await loadBanners();
    } catch (err: any) {
      alert("Failed to delete banner: " + (err.message || "Unknown error"));
    } finally {
      setIsDeletingLookbook(false);
    }
  };

  const handleToggleActive = async (banner: LookbookBanner) => {
    try {
      await updateAdminLookbook(banner.id, {
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle || "",
        description: banner.description || "",
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl || "",
        badgeText: banner.badgeText || "",
        isLarge: banner.isLarge,
        displayOrder: banner.displayOrder,
        isActive: !banner.isActive,
      });
      await loadBanners();
    } catch (err: any) {
      alert("Failed to toggle status: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-widest mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Storefront Visual Merchandising &amp; Copy CMS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Hero Showcase &amp; Banners
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Customize the storefront homepage hero photography, monumental typography, specs, and campaign lookbooks.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab("hero")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium uppercase tracking-wider transition-all ${
              activeTab === "hero"
                ? "bg-indigo-600 text-white shadow-md font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Hero Showcase CMS</span>
          </button>
          <button
            onClick={() => setActiveTab("lookbook")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium uppercase tracking-wider transition-all ${
              activeTab === "lookbook"
                ? "bg-indigo-600 text-white shadow-md font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Lookbook Banners ({banners.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium uppercase tracking-wider transition-all ${
              activeTab === "offers"
                ? "bg-amber-600 text-white shadow-md font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Offers &amp; Privileges CMS</span>
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium uppercase tracking-wider transition-all ${
              activeTab === "rules"
                ? "bg-rose-600 text-white shadow-md font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Promo Rules &amp; Abuse Prevention ({promos.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HERO SHOWCASE CMS                                                  */}
      {/* ========================================================================= */}
      {activeTab === "hero" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Notifications */}
          {heroSuccessMsg && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-emerald-300 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{heroSuccessMsg}</span>
            </div>
          )}

          {heroErrorMsg && (
            <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-xl text-red-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{heroErrorMsg}</span>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-xs">
                <span className="text-white font-semibold">Homepage Hero Section Control</span>
                <span className="text-slate-400 ml-2">Live synchronization with storefront homepage</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetHeroDefaults}
                className="border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-2" />
                Reset Defaults
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveHeroConfig}
                disabled={savingHero}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-950/50"
              >
                <Save className={`w-4 h-4 mr-2 ${savingHero ? "animate-spin" : ""}`} />
                {savingHero ? "Saving Hero..." : "Publish Hero Changes"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Action Buttons & Links */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Link2 className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-white">
                    Action Buttons &amp; Navigation Links
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Button */}
                  <div className="space-y-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider">
                      PRIMARY BUTTON (SOLID BLACK)
                    </span>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-mono">Button Label</label>
                      <input
                        type="text"
                        value={heroConfig.primaryButtonText}
                        onChange={(e) =>
                          setHeroConfig({ ...heroConfig, primaryButtonText: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-hidden font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-mono">Destination URL</label>
                      <input
                        type="text"
                        value={heroConfig.primaryButtonUrl}
                        onChange={(e) =>
                          setHeroConfig({ ...heroConfig, primaryButtonUrl: e.target.value })
                        }
                        placeholder="#catalog"
                        className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  {/* Secondary Button */}
                  <div className="space-y-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                      SECONDARY BUTTON (PULSE LINK)
                    </span>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-mono">Button Label</label>
                      <input
                        type="text"
                        value={heroConfig.secondaryButtonText}
                        onChange={(e) =>
                          setHeroConfig({ ...heroConfig, secondaryButtonText: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-hidden font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-mono">Destination URL</label>
                      <input
                        type="text"
                        value={heroConfig.secondaryButtonUrl}
                        onChange={(e) =>
                          setHeroConfig({ ...heroConfig, secondaryButtonUrl: e.target.value })
                        }
                        placeholder="/track"
                        className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Technical Spec Metrics */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-white">
                    Technical Specifications (3 Columns)
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Spec 1 */}
                  <div className="space-y-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">SPEC #1</span>
                    <input
                      type="text"
                      value={heroConfig.spec1Label}
                      onChange={(e) => setHeroConfig({ ...heroConfig, spec1Label: e.target.value })}
                      placeholder="e.g. FABRIC DENSITY"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-400 font-mono uppercase"
                    />
                    <input
                      type="text"
                      value={heroConfig.spec1Value}
                      onChange={(e) => setHeroConfig({ ...heroConfig, spec1Value: e.target.value })}
                      placeholder="e.g. HEAVYWEIGHT"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono font-bold uppercase"
                    />
                  </div>

                  {/* Spec 2 */}
                  <div className="space-y-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">SPEC #2</span>
                    <input
                      type="text"
                      value={heroConfig.spec2Label}
                      onChange={(e) => setHeroConfig({ ...heroConfig, spec2Label: e.target.value })}
                      placeholder="e.g. COLLAR SPEC"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-400 font-mono uppercase"
                    />
                    <input
                      type="text"
                      value={heroConfig.spec2Value}
                      onChange={(e) => setHeroConfig({ ...heroConfig, spec2Value: e.target.value })}
                      placeholder="e.g. ZERO-SAG"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono font-bold uppercase"
                    />
                  </div>

                  {/* Spec 3 */}
                  <div className="space-y-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">SPEC #3</span>
                    <input
                      type="text"
                      value={heroConfig.spec3Label}
                      onChange={(e) => setHeroConfig({ ...heroConfig, spec3Label: e.target.value })}
                      placeholder="e.g. LIMITED RUN"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-400 font-mono uppercase"
                    />
                    <input
                      type="text"
                      value={heroConfig.spec3Value}
                      onChange={(e) => setHeroConfig({ ...heroConfig, spec3Value: e.target.value })}
                      placeholder="e.g. 250 UNITS"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono font-bold uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Slide Manager & Interactive Live Preview */}
            <div className="lg:col-span-5 space-y-6">
              {/* Slides Manager Deck */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-white">
                      Hero Slide Showcase ({heroSlides.length})
                    </h2>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddHeroSlide}
                    className="h-7 px-2.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Slide
                  </Button>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {heroSlides.map((slide, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        activeSlidePreview === idx
                          ? "bg-slate-950 border-indigo-500/80 shadow-md"
                          : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveSlidePreview(idx)}
                            className="flex items-center gap-1.5 text-xs font-mono font-bold text-white hover:text-indigo-400"
                          >
                            <span className="w-5 h-5 rounded bg-indigo-900/60 text-indigo-300 flex items-center justify-center text-[10px]">
                              0{idx + 1}
                            </span>
                            <span>Slide #{idx + 1}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveSlidePreview(idx)}
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                              activeSlidePreview === idx
                                ? "bg-indigo-600 text-white border-indigo-500"
                                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                            }`}
                          >
                            {activeSlidePreview === idx ? "Active Preview" : "Preview"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveHeroSlide(idx)}
                            className="text-slate-500 hover:text-red-400 p-1"
                            title="Remove slide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3 items-start">
                        {/* Slide Thumbnail */}
                        <div className="w-20 aspect-[4/5] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shrink-0 relative group">
                          <img
                            src={slide.img}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Slide Details */}
                        <div className="flex-1 space-y-2 min-w-0">
                          <div>
                            <input
                              type="text"
                              value={slide.title}
                              onChange={(e) => handleHeroSlideChange(idx, "title", e.target.value)}
                              placeholder="Slide Title (e.g. FIG. 01 — BOXY DROP SHOULDER)"
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono font-semibold"
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              value={slide.tag}
                              onChange={(e) => handleHeroSlideChange(idx, "tag", e.target.value)}
                              placeholder="Slide Tag (e.g. HEAVYWEIGHT EDITION)"
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-indigo-300 font-mono"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={slide.img}
                              onChange={(e) => handleHeroSlideChange(idx, "img", e.target.value)}
                              placeholder="Image URL (https://...)"
                              className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-400 truncate"
                            />

                            <input
                              type="file"
                              ref={(el) => {
                                heroSlideFileInputRefs.current[idx] = el;
                              }}
                              onChange={(e) => handleHeroSlideUpload(idx, e)}
                              accept="image/*"
                              className="hidden"
                            />

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => heroSlideFileInputRefs.current[idx]?.click()}
                              disabled={uploadingHeroIndex === idx}
                              className="h-6 px-2 text-[10px] border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                            >
                              <Upload className={`w-3 h-3 mr-1 ${uploadingHeroIndex === idx ? "animate-spin" : ""}`} />
                              Upload
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Mini Preview Deck */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-white">
                      Live Storefront Simulation
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Slide {activeSlidePreview + 1} of {heroSlides.length}
                  </span>
                </div>

                {/* Simulated Storefront Card */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 overflow-hidden relative shadow-2xl">
                  {/* Watermark Shadow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none font-black text-6xl text-white/5 tracking-tighter">
                    CALVIZ
                  </div>

                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2 text-[9px] font-mono text-neutral-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                      <span>{heroConfig.badgeText}</span>
                      <span>•</span>
                      <span className="truncate">{heroConfig.locationText}</span>
                    </div>

                    <div>
                      <h4 className="text-lg font-black uppercase text-white leading-none">
                        BOLD FIT.
                      </h4>
                      <h4 className="text-lg font-black uppercase text-neutral-400 leading-none">
                        EFFORTLESS STYLE.
                      </h4>
                    </div>

                    <p className="text-[10px] text-neutral-400 font-mono line-clamp-2">
                      {heroConfig.description}
                    </p>

                    {/* Active Slide Image Preview */}
                    {heroSlides[activeSlidePreview] && (
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-900 border border-white/10 mt-2">
                        <img
                          src={heroSlides[activeSlidePreview].img}
                          alt={heroSlides[activeSlidePreview].title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between text-white">
                          <div>
                            <span className="text-[8px] font-mono text-neutral-400 block uppercase">
                              {heroSlides[activeSlidePreview].tag}
                            </span>
                            <span className="text-[11px] font-mono font-bold block">
                              {heroSlides[activeSlidePreview].title}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-neutral-400">
                            0{activeSlidePreview + 1} / 0{heroSlides.length}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <span className="bg-white text-black text-[9px] font-mono font-bold px-3 py-1 uppercase rounded-xs">
                        {heroConfig.primaryButtonText}
                      </span>
                      <span className="text-neutral-300 text-[9px] font-mono underline uppercase">
                        {heroConfig.secondaryButtonText}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LOOKBOOK & CAMPAIGN BANNERS                                        */}
      {/* ========================================================================= */}
      {activeTab === "lookbook" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-start gap-3 flex-1">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white">Storefront Lookbook &amp; Campaign Bento Grid</p>
                <p className="text-slate-400 leading-relaxed">
                  These banners are rendered inside the <strong className="text-slate-200">"CALVIZ SIGNATURE LOOKBOOK &amp; CAMPAIGNS"</strong> section. 
                  Featured cards occupy prominent editorial placement.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={loadBanners}
                variant="outline"
                size="sm"
                className="border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loadingLookbooks ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                onClick={handleOpenAdd}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Banner Card
              </Button>
            </div>
          </div>

          {/* Error state */}
          {lookbookError && (
            <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-xl text-red-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{lookbookError}</span>
            </div>
          )}

          {/* Banner Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <span>Configured Cards</span>
                <Badge variant="outline" className="border-slate-700 text-slate-400">
                  {banners.length} {banners.length === 1 ? "Card" : "Cards"}
                </Badge>
              </h2>
            </div>

            {loadingLookbooks ? (
              <div className="py-20 text-center text-slate-500 font-mono text-sm">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                Loading lookbook banners...
              </div>
            ) : banners.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-base font-semibold text-slate-300">No Lookbook Banners Found</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Create your first campaign lookbook banner card to showcase your collection to shoppers.
                </p>
                <Button onClick={handleOpenAdd} size="sm" className="mt-4 bg-indigo-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Banner Card
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className={`bg-slate-900/80 border rounded-xl overflow-hidden transition-all duration-200 flex flex-col justify-between ${
                      banner.isActive
                        ? "border-slate-800 hover:border-slate-700 shadow-lg"
                        : "border-slate-800/50 opacity-60"
                    }`}
                  >
                    <div>
                      {/* Image Preview Container */}
                      <div className="relative aspect-[4/5] w-full bg-slate-950 overflow-hidden group">
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Overlay Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                          {banner.isLarge && (
                            <span className="bg-indigo-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow">
                              FEATURED / LARGE
                            </span>
                          )}
                          {banner.badgeText && (
                            <span className="bg-black/80 backdrop-blur-sm text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded border border-white/10">
                              {banner.badgeText}
                            </span>
                          )}
                        </div>

                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => handleToggleActive(banner)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold transition-colors cursor-pointer ${
                              banner.isActive
                                ? "bg-emerald-950/90 text-emerald-400 border border-emerald-800"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {banner.isActive ? "Published" : "Draft"}
                          </button>
                        </div>

                        <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded border border-white/10">
                          ORDER #{banner.displayOrder}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-2">
                        {banner.subtitle && (
                          <p className="font-mono text-[10px] text-indigo-400 uppercase tracking-widest font-semibold">
                            {banner.subtitle}
                          </p>
                        )}
                        <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                          {banner.title}
                        </h3>
                        {banner.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {banner.description}
                          </p>
                        )}

                        {banner.linkUrl && (
                          <div className="pt-2 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                            <Link2 className="w-3.5 h-3.5 text-slate-500" />
                            <span className="truncate text-slate-300">{banner.linkUrl}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          onClick={() => handleOpenEdit(banner)}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                      </div>

                      <Button
                        onClick={() => setDeletingBanner(banner)}
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: OFFERS & PRIVILEGES CMS                                            */}
      {/* ========================================================================= */}
      {activeTab === "offers" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Notifications */}
          {offersSuccessMsg && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-emerald-300 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{offersSuccessMsg}</span>
            </div>
          )}

          {offersErrorMsg && (
            <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-xl text-red-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{offersErrorMsg}</span>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <div className="text-xs">
                <span className="text-white font-semibold">Storefront Offers &amp; Privileges Control</span>
                <span className="text-slate-400 ml-2">Manage promo codes, incentives, marquee bar, and cards</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
                <input
                  type="checkbox"
                  checked={offersConfig.isActive}
                  onChange={(e) => setOffersConfig((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-900"
                />
                <span>Active on Storefront</span>
              </label>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetOffersDefaults}
                className="border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-2" />
                Reset Defaults
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveOffersConfig}
                disabled={savingOffers}
                className="bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-lg shadow-amber-950/50"
              >
                <Save className={`w-4 h-4 mr-2 ${savingOffers ? "animate-spin" : ""}`} />
                {savingOffers ? "Publishing Offers..." : "Publish Offers Changes"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Header & Announcement Ticker */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Type className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    01. Section Header &amp; Marquee Ticker
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                      Tagline Badge
                    </label>
                    <input
                      type="text"
                      value={offersConfig.tagline}
                      onChange={(e) => setOffersConfig((prev) => ({ ...prev, tagline: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                      Note / Status Badge
                    </label>
                    <input
                      type="text"
                      value={offersConfig.noteBadge}
                      onChange={(e) => setOffersConfig((prev) => ({ ...prev, noteBadge: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                    Main Section Title
                  </label>
                  <input
                    type="text"
                    value={offersConfig.title}
                    onChange={(e) => setOffersConfig((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-500 uppercase tracking-tight"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                    Subtitle Description
                  </label>
                  <textarea
                    rows={2}
                    value={offersConfig.subtitle}
                    onChange={(e) => setOffersConfig((prev) => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                    Animated Marquee Ticker Strip Text (Repeats seamlessly)
                  </label>
                  <textarea
                    rows={2}
                    value={offersConfig.marqueeText}
                    onChange={(e) => setOffersConfig((prev) => ({ ...prev, marqueeText: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                    placeholder="✦ ARCHIVAL DUO BUNDLE: SAVE 10% ON 2+ TEES WITH CODE 'CALVIZ10' ✦ FREE ISLAND-WIDE EXPRESS DISPATCH..."
                  />
                </div>
              </div>

              {/* Card 2: Main Featured Hero Promo Offer */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    02. Main Featured Promo Banner (Archival Duo Bundle)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                      Promo Badge Text
                    </label>
                    <input
                      type="text"
                      value={offersConfig.heroBadge}
                      onChange={(e) => setOffersConfig((prev) => ({ ...prev, heroBadge: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-amber-400 font-bold">
                      Interactive Coupon Code
                    </label>
                    <input
                      type="text"
                      value={offersConfig.heroPromoCode}
                      onChange={(e) => setOffersConfig((prev) => ({ ...prev, heroPromoCode: e.target.value }))}
                      className="w-full bg-slate-950 border border-amber-500/50 rounded-lg px-3 py-2 text-xs text-amber-300 font-mono font-bold tracking-widest focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                    Hero Promo Headline
                  </label>
                  <input
                    type="text"
                    value={offersConfig.heroTitle}
                    onChange={(e) => setOffersConfig((prev) => ({ ...prev, heroTitle: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-500 uppercase tracking-tight"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                    Hero Promo Description
                  </label>
                  <textarea
                    rows={2}
                    value={offersConfig.heroDescription}
                    onChange={(e) => setOffersConfig((prev) => ({ ...prev, heroDescription: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={offersConfig.heroButtonText}
                      onChange={(e) => setOffersConfig((prev) => ({ ...prev, heroButtonText: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                      Button Link URL
                    </label>
                    <input
                      type="text"
                      value={offersConfig.heroButtonUrl}
                      onChange={(e) => setOffersConfig((prev) => ({ ...prev, heroButtonUrl: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                {/* Hero Background Image */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                    Hero Banner Background Photo
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={offersConfig.heroImageUrl}
                      onChange={(e) => setOffersConfig((prev) => ({ ...prev, heroImageUrl: e.target.value }))}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                      placeholder="https://... or upload image"
                    />
                    <input
                      type="file"
                      ref={heroOfferFileInputRef}
                      onChange={handleUploadHeroOfferImage}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => heroOfferFileInputRef.current?.click()}
                      disabled={uploadingHeroOfferImage}
                      className="border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800 shrink-0"
                    >
                      <Upload className={`w-3.5 h-3.5 mr-1.5 ${uploadingHeroOfferImage ? "animate-spin" : ""}`} />
                      {uploadingHeroOfferImage ? "Uploading..." : "Upload Photo"}
                    </Button>
                  </div>
                </div>

                {/* Highlights / Perk Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div className="space-y-2 p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="text-[11px] font-mono font-bold text-amber-400 uppercase">
                      Perk Item 01
                    </div>
                    <input
                      type="text"
                      value={offersConfig.heroPerk1Title}
                      onChange={(e) => setOffersConfig((prev) => ({ ...prev, heroPerk1Title: e.target.value }))}
                      placeholder="Title (e.g. AUTOMATIC CART STACKING)"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                    />
                    <textarea
                      rows={2}
                      value={offersConfig.heroPerk1Description}
                      onChange={(e) => setOffersConfig((prev) => ({ ...prev, heroPerk1Description: e.target.value }))}
                      placeholder="Description"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-[11px] text-slate-300"
                    />
                  </div>

                  <div className="space-y-2 p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase">
                      Perk Item 02
                    </div>
                    <input
                      type="text"
                      value={offersConfig.heroPerk2Title}
                      onChange={(e) => setOffersConfig((prev) => ({ ...prev, heroPerk2Title: e.target.value }))}
                      placeholder="Title (e.g. ALL SIZES & CUTS ELIGIBLE)"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white font-mono font-bold"
                    />
                    <textarea
                      rows={2}
                      value={offersConfig.heroPerk2Description}
                      onChange={(e) => setOffersConfig((prev) => ({ ...prev, heroPerk2Description: e.target.value }))}
                      placeholder="Description"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-[11px] text-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: 3 Companion Privilege Bento Cards */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    03. Companion Privilege Cards (Bento Deck)
                  </h3>
                </div>

                {offerCards.map((card, idx) => (
                  <div key={card.id || idx} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          CARD 0{idx + 1}
                        </span>
                        <span className="text-xs font-mono font-semibold text-white uppercase truncate">
                          {card.title || "Privilege Card"}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        Icon: {card.icon || "Default"}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono uppercase text-slate-400">
                          Badge Text
                        </label>
                        <input
                          type="text"
                          value={card.badge}
                          onChange={(e) => handleOfferCardChange(idx, "badge", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono uppercase text-slate-400">
                          Card Title
                        </label>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => handleOfferCardChange(idx, "title", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono uppercase text-slate-400">
                        Description Copy
                      </label>
                      <textarea
                        rows={2}
                        value={card.description}
                        onChange={(e) => handleOfferCardChange(idx, "description", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono uppercase text-slate-400">
                          Footer Tag
                        </label>
                        <input
                          type="text"
                          value={card.footerTag}
                          onChange={(e) => handleOfferCardChange(idx, "footerTag", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono uppercase text-slate-400">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={card.buttonText}
                          onChange={(e) => handleOfferCardChange(idx, "buttonText", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono uppercase text-slate-400">
                          Button Link URL
                        </label>
                        <input
                          type="text"
                          value={card.buttonUrl}
                          onChange={(e) => handleOfferCardChange(idx, "buttonUrl", e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Background Image Upload for Card */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <label className="block text-[11px] font-mono uppercase text-slate-400">
                        Card Background Photo
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={card.imageUrl}
                          onChange={(e) => handleOfferCardChange(idx, "imageUrl", e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                          placeholder="Image URL"
                        />
                        <input
                          type="file"
                          ref={(el) => {
                            offerCardFileInputRefs.current[idx] = el;
                          }}
                          onChange={(e) => handleUploadOfferCardImage(idx, e)}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => offerCardFileInputRefs.current[idx]?.click()}
                          disabled={uploadingOfferCardIndex === idx}
                          className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 text-xs shrink-0"
                        >
                          <Upload className={`w-3 h-3 mr-1 ${uploadingOfferCardIndex === idx ? "animate-spin" : ""}`} />
                          {uploadingOfferCardIndex === idx ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Interactive Storefront Preview Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                      Live Storefront Atelier Preview
                    </h3>
                  </div>
                  <Badge variant="outline" className="border-amber-500/40 text-amber-400 font-mono text-[10px]">
                    REALTIME SYNC
                  </Badge>
                </div>

                {/* Dark Storefront Section Preview Box */}
                <div className="bg-[#080808] text-white rounded-xl border border-neutral-800 p-4 space-y-4 overflow-hidden shadow-2xl">
                  {/* Header preview */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                      <span>{offersConfig.tagline || "SEASONAL PRIVILEGES"}</span>
                    </div>
                    <h4 className="text-base font-extrabold uppercase text-white tracking-tight leading-tight">
                      {offersConfig.title || "CURATED ATELIER OFFERS"}
                    </h4>
                    <p className="text-[10px] text-neutral-400 line-clamp-2">
                      {offersConfig.subtitle || "Exclusive wardrobe incentives..."}
                    </p>
                  </div>

                  {/* Marquee ticker preview */}
                  <div className="bg-neutral-900/90 border border-neutral-800 rounded p-1.5 overflow-hidden">
                    <div className="animate-marquee whitespace-nowrap text-[9px] font-mono text-neutral-300 font-bold">
                      <span>{offersConfig.marqueeText || "✦ SPECIAL OFFERS ✦"}</span>
                    </div>
                  </div>

                  {/* Hero Offer Banner Preview */}
                  <div className="relative overflow-hidden rounded-xl bg-neutral-950 border border-neutral-800 p-4 space-y-3">
                    {offersConfig.heroImageUrl && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <img
                          src={offersConfig.heroImageUrl}
                          alt="Hero Promo"
                          className="w-full h-full object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/50"></div>
                      </div>
                    )}

                    <div className="relative z-10 space-y-2">
                      <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase">
                        <Gift className="w-2.5 h-2.5 text-amber-400" />
                        <span>{offersConfig.heroBadge || "BUNDLE PRIVILEGE"}</span>
                      </div>

                      <h5 className="text-xs font-bold uppercase text-white tracking-tight leading-snug">
                        {offersConfig.heroTitle || "PROMO TITLE"}
                      </h5>

                      <p className="text-[10px] text-neutral-300 leading-relaxed line-clamp-2">
                        {offersConfig.heroDescription || "Description..."}
                      </p>

                      {/* Promo Code Copy Pill */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <div className="flex items-center bg-black/90 border border-neutral-700 rounded-md p-1 pl-2 gap-2 text-[10px] font-mono">
                          <span className="text-neutral-400">CODE:</span>
                          <span className="font-bold text-amber-300 bg-neutral-800 px-1.5 py-0.5 rounded">
                            {offersConfig.heroPromoCode || "CALVIZ10"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCopiedPromoPreview(true);
                              setTimeout(() => setCopiedPromoPreview(false), 2000);
                            }}
                            className="bg-white text-black px-2 py-0.5 rounded text-[9px] font-bold uppercase hover:bg-neutral-200"
                          >
                            {copiedPromoPreview ? "COPIED!" : "COPY"}
                          </button>
                        </div>

                        <span className="text-[9px] font-mono text-white bg-white/10 px-2.5 py-1 rounded border border-white/20 uppercase font-bold">
                          {offersConfig.heroButtonText || "EXPLORE"} →
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Bento Cards Mini Preview */}
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {offerCards.map((card, i) => (
                      <div
                        key={i}
                        className="relative overflow-hidden rounded-lg bg-neutral-950 border border-neutral-800 p-2.5 space-y-1.5"
                      >
                        {card.imageUrl && (
                          <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <img
                              src={card.imageUrl}
                              alt={card.title}
                              className="w-full h-full object-cover opacity-20"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-neutral-950/60"></div>
                          </div>
                        )}
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-[8px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase">
                            {card.badge || `CARD 0${i + 1}`}
                          </span>
                          <span className="text-[8px] font-mono text-neutral-400">{card.footerTag}</span>
                        </div>
                        <div className="relative z-10 text-[11px] font-bold uppercase text-white truncate">
                          {card.title}
                        </div>
                        <p className="relative z-10 text-[9px] text-neutral-400 line-clamp-1">
                          {card.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    When you click <strong>"Publish Offers Changes"</strong>, the storefront homepage will instantly synchronize all promo codes, background images, marquee texts, and privilege cards.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PROMO RULES & ABUSE PREVENTION                                     */}
      {/* ========================================================================= */}
      {activeTab === "rules" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Notifications */}
          {promoSuccessMsg && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-emerald-300 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{promoSuccessMsg}</span>
            </div>
          )}

          {promoErrorMsg && (
            <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-xl text-rose-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{promoErrorMsg}</span>
            </div>
          )}

          {/* Top Actions & Info Deck */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Percent className="w-5 h-5 text-rose-400" />
                <span>Promo Codes &amp; Qualification Engine</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure discount rules, enforce minimum garment counts (e.g. require 2+ t-shirts), and prevent repeat abuse per customer phone/email.
              </p>
            </div>

            <Button
              onClick={handleOpenCreatePromo}
              className="bg-rose-600 hover:bg-rose-500 text-white gap-2 text-xs font-mono font-bold uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Promo Rule</span>
            </Button>
          </div>

          {/* Validation & Anti-Abuse Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
                <Package className="w-4 h-4" />
                <span>Garment Quantity Validation</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When <strong>Minimum Garments = 2</strong> is set, customers attempting to apply the promo code with only 1 t-shirt in their shopping bag will be strictly blocked on both the storefront checkout and the backend order validation pipeline.
              </p>
            </div>

            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Repeat Abuse Blocker</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When <strong>Max Uses Per Customer = 1</strong> is configured, the server verifies previous redemptions against the customer&apos;s phone number and email address to stop customers from exploiting promotional codes repeatedly.
              </p>
            </div>
          </div>

          {/* Promo Codes Table */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Configured Promotional Codes ({promos.length})
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadPromos}
                disabled={loadingPromos}
                className="text-xs text-slate-400 hover:text-white gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPromos ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
            </div>

            {loadingPromos ? (
              <div className="p-12 text-center text-slate-500">
                <div className="w-6 h-6 border-2 border-slate-700 border-t-rose-500 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs font-mono">Loading promo codes...</p>
              </div>
            ) : promos.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <Percent className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm font-medium text-slate-300">No promo codes configured yet.</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click &quot;Create New Promo Rule&quot; to set up your first promotional voucher code with custom item constraints.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Promo Code &amp; Title</th>
                      <th className="py-3 px-4">Discount Value</th>
                      <th className="py-3 px-4">Item &amp; Subtotal Rule</th>
                      <th className="py-3 px-4">Abuse Limit</th>
                      <th className="py-3 px-4">Total Redemptions</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {promos.map((promo) => (
                      <tr key={promo.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono font-bold text-xs rounded">
                              {promo.code}
                            </span>
                            <span className="font-semibold text-white truncate max-w-[200px]">
                              {promo.title}
                            </span>
                          </div>
                          {promo.description && (
                            <p className="text-[11px] text-slate-400 truncate max-w-[280px]">
                              {promo.description}
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-emerald-400 text-xs">
                            {promo.discountType === "FixedAmount"
                              ? `LKR ${promo.discountValue.toLocaleString()} OFF`
                              : `${promo.discountValue}% OFF`}
                          </span>
                        </td>

                        <td className="py-3 px-4 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              promo.minItemQuantity > 1
                                ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                                : "bg-slate-800 text-slate-400"
                            }`}>
                              Min {promo.minItemQuantity} {promo.minItemQuantity === 1 ? "Item" : "Garments (e.g. 2 Tees)"}
                            </span>
                          </div>
                          {promo.minOrderSubtotal > 0 && (
                            <p className="text-[10px] font-mono text-slate-400">
                              Min Subtotal: LKR {promo.minOrderSubtotal.toLocaleString()}
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded text-[10px] font-mono font-semibold">
                            Max {promo.maxUsesPerCustomer} use / customer
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{promo.currentTotalUses}</span>
                            <span className="text-slate-500 text-[10px]">
                              {promo.maxTotalUses ? `/ ${promo.maxTotalUses} quota` : "uses"}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleTogglePromoActive(promo)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              promo.isActive
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                            }`}
                          >
                            {promo.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditPromo(promo)}
                              className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800"
                              title="Edit promo rule"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingPromo(promo)}
                              className="h-7 w-7 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                              title="Delete promo rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT PROMO CODE MODAL                                               */}
      {/* ========================================================================= */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 text-slate-100 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-900/50 border border-rose-700/50 flex items-center justify-center text-rose-400">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingPromo ? "Edit Promo Code & Rules" : "Create New Promo Code"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define qualification conditions and abuse prevention limits.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromoModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1 font-semibold">
                    Promo Code (e.g. CALVIZ1500) *
                  </label>
                  <input
                    type="text"
                    required
                    value={promoFormData.code}
                    onChange={(e) => setPromoFormData({ ...promoFormData, code: e.target.value.toUpperCase() })}
                    placeholder="CALVIZ1500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono font-bold focus:border-rose-500 focus:outline-hidden uppercase"
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1 font-semibold">
                    Discount Type *
                  </label>
                  <select
                    value={promoFormData.discountType}
                    onChange={(e) => setPromoFormData({ ...promoFormData, discountType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:border-rose-500 focus:outline-hidden"
                  >
                    <option value="FixedAmount">Fixed Amount (LKR Flat Off)</option>
                    <option value="Percentage">Percentage (% Off Order)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1 font-semibold">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={promoFormData.title}
                  onChange={(e) => setPromoFormData({ ...promoFormData, title: e.target.value })}
                  placeholder="Archival Duo Bundle — LKR 1,500 Off on 2+ T-Shirts"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1 font-semibold">
                  Description / Subtitle
                </label>
                <input
                  type="text"
                  value={promoFormData.description || ""}
                  onChange={(e) => setPromoFormData({ ...promoFormData, description: e.target.value })}
                  placeholder="Applies LKR 1,500 privilege discount when purchasing 2 or more Drop 01 heavyweight tees."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              {/* Discount Value & Minimum Item Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1 font-semibold">
                    Discount Value ({promoFormData.discountType === "FixedAmount" ? "LKR" : "%"}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={promoFormData.discountValue}
                    onChange={(e) => setPromoFormData({ ...promoFormData, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:border-rose-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    {promoFormData.discountType === "FixedAmount"
                      ? "LKR deducted from order subtotal."
                      : "Percentage discount applied to subtotal."}
                  </p>
                </div>

                <div>
                  <label className="block text-amber-300 font-mono text-[11px] uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-400" />
                    <span>Min Garments in Cart (e.g. 2) *</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={promoFormData.minItemQuantity}
                    onChange={(e) => setPromoFormData({ ...promoFormData, minItemQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-amber-600/50 rounded-lg px-3 py-2 text-white font-mono font-bold focus:border-amber-400 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-amber-400/90 mt-1">
                    Set to <strong>2</strong> to strictly block 1-item orders from claiming this offer.
                  </p>
                </div>
              </div>

              {/* Abuse Prevention: Max Uses per Customer & Min Order Subtotal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-emerald-300 font-mono text-[11px] uppercase tracking-wider mb-1 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Max Uses Per Customer *</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={promoFormData.maxUsesPerCustomer}
                    onChange={(e) => setPromoFormData({ ...promoFormData, maxUsesPerCustomer: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-emerald-600/50 rounded-lg px-3 py-2 text-white font-mono font-bold focus:border-emerald-400 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-emerald-400/90 mt-1">
                    Set to <strong>1</strong> to block repeat redemptions by the same phone/email.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1 font-semibold">
                    Min Order Subtotal (LKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={promoFormData.minOrderSubtotal}
                    onChange={(e) => setPromoFormData({ ...promoFormData, minOrderSubtotal: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:border-rose-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">0 = No minimum spending required.</p>
                </div>
              </div>

              {/* Max Total Uses & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1 font-semibold">
                    Global Total Quota (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={promoFormData.maxTotalUses ?? ""}
                    onChange={(e) => setPromoFormData({
                      ...promoFormData,
                      maxTotalUses: e.target.value ? Number(e.target.value) : null
                    })}
                    placeholder="Unlimited"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:border-rose-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Leave blank for unlimited storewide uses.</p>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="promoIsActive"
                    checked={promoFormData.isActive}
                    onChange={(e) => setPromoFormData({ ...promoFormData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-rose-600 focus:ring-rose-500"
                  />
                  <label htmlFor="promoIsActive" className="text-slate-200 font-mono text-xs cursor-pointer font-bold">
                    Promo Code Active Storewide
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsPromoModalOpen(false)}
                  disabled={savingPromo}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingPromo}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-medium gap-1.5"
                >
                  {savingPromo ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingPromo ? "Save Promo Rule" : "Create Promo Rule"}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE PROMO CONFIRMATION MODAL                                           */}
      {/* ========================================================================= */}
      {deletingPromo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Delete Promo Code &quot;{deletingPromo.code}&quot;?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to permanently delete this promotional code? Clients will no longer be able to claim this discount at checkout.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                disabled={isDeletingPromo}
                onClick={() => setDeletingPromo(null)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeletingPromo}
                onClick={handleConfirmDeletePromo}
                className="bg-red-600 hover:bg-red-500 text-white font-medium"
              >
                {isDeletingPromo ? "Deleting..." : "Yes, Delete Promo"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT BANNER MODAL DIALOG                                            */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 text-slate-100 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingBanner ? "Edit Lookbook Banner" : "New Lookbook Banner"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload or URL */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Banner Photo *
                </label>

                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  {/* Photo Preview */}
                  <div className="w-32 aspect-[4/5] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden relative shrink-0 flex items-center justify-center">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2 text-slate-600 text-[10px] font-mono">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        NO IMAGE
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <div>
                      <input
                        type="file"
                        ref={lookbookFileInputRef}
                        onChange={handleImageFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        onClick={() => lookbookFileInputRef.current?.click()}
                        disabled={uploadingLookbookImage}
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200"
                      >
                        <Upload className={`w-3.5 h-3.5 mr-2 ${uploadingLookbookImage ? "animate-spin" : ""}`} />
                        {uploadingLookbookImage ? "Uploading Photo..." : "Upload Local Photo File"}
                      </Button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="Or paste direct image URL (https://...)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Recommended: High-resolution vertical studio or lookbook photography (4:5 ratio).
                    </p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sculptural Shoulder Profile on Natural Concrete"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Subtitle / Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Category Tag / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle || ""}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. LOOKBOOK // COLOMBO ATELIER"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.badgeText || ""}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="e.g. PLATE 01 or NEW ARRIVAL"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Link URL */}
              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Click Destination (Link URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.linkUrl || ""}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="e.g. /products or /products/heavyweight-black-tee"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500"
                  />
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setFormData({ ...formData, linkUrl: e.target.value });
                      }
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 text-xs text-slate-400"
                  >
                    <option value="">Quick Link...</option>
                    <option value="/products">All Products (/products)</option>
                    <option value="/#catalog">Catalog Grid (/#catalog)</option>
                    <option value="/track">Order Tracking (/track)</option>
                  </select>
                </div>
              </div>

              {/* Description (Optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Description / Study Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional architectural notes or garment details..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Display Order & Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isLargeCheck"
                    checked={formData.isLarge}
                    onChange={(e) => setFormData({ ...formData, isLarge: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isLargeCheck" className="text-xs text-slate-300 font-medium cursor-pointer">
                    Featured / Large Card
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs text-slate-300 font-medium cursor-pointer">
                    Publish to Store
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingLookbook}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  {savingLookbook ? "Saving..." : editingBanner ? "Save Changes" : "Create Banner"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL DIALOG                                          */}
      {/* ========================================================================= */}
      {deletingBanner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Delete Lookbook Banner?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to permanently delete this lookbook banner card? It will be immediately removed from the storefront.
                </p>
              </div>
            </div>

            {/* Banner Preview Snippet */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="w-12 h-14 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                <img
                  src={deletingBanner.imageUrl}
                  alt={deletingBanner.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                {deletingBanner.subtitle && (
                  <p className="font-mono text-[9px] text-indigo-400 uppercase tracking-wider truncate">
                    {deletingBanner.subtitle}
                  </p>
                )}
                <h4 className="text-xs font-bold text-white truncate">
                  {deletingBanner.title}
                </h4>
                <span className="text-[10px] font-mono text-slate-500">
                  Display Order #{deletingBanner.displayOrder}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                disabled={isDeletingLookbook}
                onClick={() => setDeletingBanner(null)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeletingLookbook}
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-500 text-white font-medium"
              >
                {isDeletingLookbook ? "Deleting..." : "Yes, Delete Banner"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
