import {
  Category,
  Product,
  ProductSummary,
  OrderSummaryAdmin,
  OrderDetail,
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "@/types";
import { validateFileMagicBytes } from "@/lib/fileValidation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5089/api";

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("calviz_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ----------------------------------------------------
// 1. ADMIN AUTHENTICATION
// ----------------------------------------------------
export interface AdminLoginResult {
  token: string;
  username: string;
  expiresAt: string;
}

export async function adminLogin(username: string, password: string): Promise<AdminLoginResult> {
  const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    let errMessage = "Invalid administrator credentials.";
    try {
      const errData = await res.json();
      if (errData?.message) errMessage = errData.message;
    } catch {
      // Ignore json parse error
    }
    throw new Error(errMessage);
  }

  return await res.json();
}

// ----------------------------------------------------
// 2. ORDERS MANAGEMENT
// ----------------------------------------------------
export interface AdminOrderFilters {
  orderStatus?: OrderStatus | "";
  paymentStatus?: PaymentStatus | "";
  paymentMethod?: PaymentMethod | "";
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

export async function fetchAdminOrders(filters?: AdminOrderFilters): Promise<{
  items: OrderSummaryAdmin[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
}> {
  const url = new URL(`${API_BASE_URL}/orders`);
  if (filters?.orderStatus) url.searchParams.set("orderStatus", filters.orderStatus);
  if (filters?.paymentStatus) url.searchParams.set("paymentStatus", filters.paymentStatus);
  if (filters?.paymentMethod) url.searchParams.set("paymentMethod", filters.paymentMethod);
  if (filters?.search) url.searchParams.set("search", filters.search);
  url.searchParams.set("pageNumber", (filters?.pageNumber || 1).toString());
  url.searchParams.set("pageSize", (filters?.pageSize || 20).toString());

  const res = await fetch(url.toString(), {
    headers: getAuthHeader(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load orders from backend (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  return {
    items: data.items || [],
    totalCount: data.totalCount || (data.items ? data.items.length : 0),
    pageNumber: data.pageNumber || 1,
    totalPages: data.totalPages || 1,
  };
}

export async function fetchAdminOrderById(orderId: string): Promise<OrderDetail> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    headers: getAuthHeader(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load order #${orderId} from backend (${res.status} ${res.statusText})`);
  }

  return await res.json();
}

export async function updateAdminOrderStatus(
  orderId: string,
  payload: {
    orderId: string;
    newOrderStatus?: OrderStatus;
    newPaymentStatus?: PaymentStatus;
    approveBankSlip?: boolean;
  }
): Promise<OrderDetail> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to update order status (${res.status})`);
  }

  // Refetch the updated order detail from backend
  return await fetchAdminOrderById(orderId);
}

// ----------------------------------------------------
// 3. PRODUCT & CATEGORY MANAGEMENT
// ----------------------------------------------------
export async function fetchAdminCategories(includeInactive: boolean = true): Promise<Category[]> {
  const url = new URL(`${API_BASE_URL}/categories`);
  if (includeInactive) url.searchParams.set("includeInactive", "true");

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to load categories from backend (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createAdminCategory(category: CreateCategoryInput): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(category),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to create collection (${res.status})`);
  }

  const data = await res.json();
  return { id: data.id || data };
}

export async function updateAdminCategory(
  id: string,
  category: import("@/types").UpdateCategoryInput
): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(category),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to update collection (${res.status})`);
  }

  return true;
}

export async function deleteAdminCategory(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(errText || `Failed to delete collection (${res.status})`);
  }

  return true;
}

export async function fetchAdminProducts(category?: string, search?: string): Promise<ProductSummary[]> {
  const url = new URL(`${API_BASE_URL}/products`);
  if (category && category !== "all") url.searchParams.set("category", category);
  if (search) url.searchParams.set("search", search);
  url.searchParams.set("pageSize", "100");

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to load products from backend (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  return data.items || (Array.isArray(data) ? data : []);
}

export async function fetchAdminProductByIdOrSlug(idOrSlug: string): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${idOrSlug}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch product "${idOrSlug}" (${res.status} ${res.statusText})`);
  }

  return await res.json();
}

export async function createAdminProduct(product: CreateProductInput): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(product),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to create product (${res.status})`);
  }

  const data = await res.json();
  return { id: data.id || data };
}

export async function updateAdminProduct(id: string, product: UpdateProductInput): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(product),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to update product (${res.status})`);
  }

  return true;
}

export async function deleteAdminProduct(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to delete product (${res.status})`);
  }

  return true;
}

export async function uploadAdminProductImage(file: File): Promise<{ imageUrl: string; relativePath: string }> {
  // Validate magic bytes before upload
  const validation = await validateFileMagicBytes(file, { allowPdf: false, maxSizeMb: 15 });
  if (!validation.isValid) {
    throw new Error(validation.error || "File security check failed.");
  }

  const formData = new FormData();
  formData.append("file", file);

  // Try dedicated /upload endpoint first
  let res = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });

  // If 404 or 405, fallback to /products/upload-image
  if (!res.ok && (res.status === 404 || res.status === 405)) {
    res = await fetch(`${API_BASE_URL}/products/upload-image`, {
      method: "POST",
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to upload image (${res.status})`);
  }

  return await res.json();
}

// ----------------------------------------------------
// 4. COLOR ATTRIBUTES MANAGEMENT
// ----------------------------------------------------
export async function fetchAdminColors(): Promise<import("@/types").ColorAttribute[]> {
  const res = await fetch(`${API_BASE_URL}/colors?includeInactive=true`, {
    cache: "no-store",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to load colors (${res.status})`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createAdminColor(
  name: string,
  hexCode: string,
  displayOrder: number = 0
): Promise<import("@/types").ColorAttribute> {
  const res = await fetch(`${API_BASE_URL}/colors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ name, hexCode, displayOrder }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to create color (${res.status})`);
  }

  return await res.json();
}

export async function updateAdminColor(
  id: string,
  name: string,
  hexCode: string,
  isActive: boolean = true,
  displayOrder: number = 0
): Promise<import("@/types").ColorAttribute> {
  const res = await fetch(`${API_BASE_URL}/colors/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ name, hexCode, isActive, displayOrder }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to update color (${res.status})`);
  }

  return await res.json();
}

export async function deleteAdminColor(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/colors/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(errText || `Failed to delete color (${res.status})`);
  }
}

// ----------------------------------------------------
// 6. BANK DETAILS MANAGEMENT
// ----------------------------------------------------
export async function fetchAdminBankDetails(): Promise<import("@/types").BankDetail[]> {
  const res = await fetch(`${API_BASE_URL}/bankdetails/admin`, {
    headers: getAuthHeader(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load bank accounts (${res.status} ${res.statusText})`);
  }

  return await res.json();
}

export async function createAdminBankDetail(
  input: import("@/types").CreateBankDetailInput
): Promise<import("@/types").BankDetail> {
  const res = await fetch(`${API_BASE_URL}/bankdetails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to create bank account (${res.status})`);
  }

  return await res.json();
}

export async function updateAdminBankDetail(
  id: string,
  input: import("@/types").UpdateBankDetailInput
): Promise<import("@/types").BankDetail> {
  const res = await fetch(`${API_BASE_URL}/bankdetails/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to update bank account (${res.status})`);
  }

  return await res.json();
}

export async function toggleAdminBankDetailActive(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/bankdetails/${id}/toggle-active`, {
    method: "PUT",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to toggle bank account status (${res.status})`);
  }

  return await res.json();
}

export async function deleteAdminBankDetail(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/bankdetails/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(errText || `Failed to delete bank account (${res.status})`);
  }
}

// ----------------------------------------------------
// 7. DELIVERY CITIES MANAGEMENT
// ----------------------------------------------------
export async function fetchAdminCities(
  search?: string,
  district?: string
): Promise<import("@/types").DeliveryCity[]> {
  const url = new URL(`${API_BASE_URL}/cities/admin`);
  if (search) url.searchParams.set("search", search);
  if (district && district !== "all") url.searchParams.set("district", district);

  const res = await fetch(url.toString(), {
    headers: getAuthHeader(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load delivery cities (${res.status} ${res.statusText})`);
  }

  return await res.json();
}

export async function createAdminCity(
  input: import("@/types").CreateCityInput
): Promise<import("@/types").DeliveryCity> {
  const res = await fetch(`${API_BASE_URL}/cities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to create delivery city (${res.status})`);
  }

  return await res.json();
}

export async function updateAdminCity(
  id: string,
  input: import("@/types").UpdateCityInput
): Promise<import("@/types").DeliveryCity> {
  const res = await fetch(`${API_BASE_URL}/cities/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to update delivery city (${res.status})`);
  }

  return await res.json();
}

export async function toggleAdminCityActive(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/cities/${id}/toggle-active`, {
    method: "PUT",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to toggle delivery city status (${res.status})`);
  }

  return await res.json();
}

export async function deleteAdminCity(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/cities/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(errText || `Failed to delete delivery city (${res.status})`);
  }
}

export interface BulkUpdateDeliveryFeeInput {
  deliveryFee: number | null;
  estimatedDeliveryDays?: string | null;
  district?: string | null;
  cityIds?: string[] | null;
}

export async function bulkUpdateAdminCityFees(
  input: BulkUpdateDeliveryFeeInput
): Promise<{ count: number; message: string }> {
  const res = await fetch(`${API_BASE_URL}/cities/bulk-delivery-fee`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to bulk update delivery fees (${res.status})`);
  }

  return await res.json();
}

export async function quickUpdateAdminCityFee(
  id: string,
  deliveryFee: number | null,
  estimatedDeliveryDays?: string | null
): Promise<import("@/types").DeliveryCity> {
  const res = await fetch(`${API_BASE_URL}/cities/${id}/quick-fee`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      deliveryFee,
      estimatedDeliveryDays,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to update delivery fee (${res.status})`);
  }

  return await res.json();
}

// ---------------------------------------------------------------------------
// REVIEWS MANAGEMENT API
// ---------------------------------------------------------------------------

export async function fetchAdminReviews(params?: {
  status?: string;
  productId?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<import("@/types").PaginatedReviewsResult> {
  const url = new URL(`${API_BASE_URL}/reviews/admin`);
  if (params?.status) url.searchParams.set("status", params.status);
  if (params?.productId) url.searchParams.set("productId", params.productId);
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.pageNumber) url.searchParams.set("pageNumber", String(params.pageNumber));
  if (params?.pageSize) url.searchParams.set("pageSize", String(params.pageSize));

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load customer reviews (${res.status})`);
  }

  return await res.json();
}

export async function approveAdminReview(reviewId: string, isApproved: boolean = true): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}/approve`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ isApproved }),
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(errText || `Failed to update review status (${res.status})`);
  }

  return true;
}

export async function deleteAdminReview(reviewId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(errText || `Failed to delete review (${res.status})`);
  }

  return true;
}

// ----------------------------------------------------
// 9. LOOKBOOK & BANNER MANAGEMENT
// ----------------------------------------------------
export async function fetchAdminLookbooks(): Promise<import("@/types").LookbookBanner[]> {
  const res = await fetch(`${API_BASE_URL}/lookbooks/admin`, {
    headers: getAuthHeader(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load lookbook banners (${res.status})`);
  }

  return await res.json();
}

export async function createAdminLookbook(input: import("@/types").LookbookBannerInput): Promise<import("@/types").LookbookBanner> {
  const res = await fetch(`${API_BASE_URL}/lookbooks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to create lookbook banner (${res.status})`);
  }

  return await res.json();
}

export async function updateAdminLookbook(id: string, input: import("@/types").LookbookBannerInput): Promise<import("@/types").LookbookBanner> {
  const res = await fetch(`${API_BASE_URL}/lookbooks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ ...input, id }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to update lookbook banner (${res.status})`);
  }

  return await res.json();
}

export async function deleteAdminLookbook(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/lookbooks/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(errText || `Failed to delete lookbook banner (${res.status})`);
  }

  return true;
}

export async function uploadLookbookPhoto(file: File): Promise<{ imageUrl: string; relativePath: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/lookbooks/upload-photo`, {
    method: "POST",
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to upload banner photo");
  }

  return await res.json();
}

// ----------------------------------------------------
// 10. HERO SECTION CMS
// ----------------------------------------------------
export async function fetchAdminHeroSection(): Promise<import("@/types").HeroSectionConfig | null> {
  const res = await fetch(`${API_BASE_URL}/herosection`, {
    headers: getAuthHeader(),
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load hero section configuration (${res.status})`);
  }

  return await res.json();
}

export async function updateAdminHeroSection(
  input: import("@/types").UpdateHeroSectionInput
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/herosection`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to update hero section (${res.status})`);
  }

  return await res.json();
}

export async function uploadHeroSlideImage(file: File): Promise<{ imageUrl: string; relativePath: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/herosection/upload-image`, {
    method: "POST",
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to upload hero image");
  }

  return await res.json();
}

// ----------------------------------------------------
// 11. OFFERS & PRIVILEGES CMS
// ----------------------------------------------------
export async function fetchAdminOffersSection(): Promise<import("@/types").OffersSectionConfig | null> {
  const res = await fetch(`${API_BASE_URL}/offerssection`, {
    headers: getAuthHeader(),
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load offers section configuration (${res.status})`);
  }

  return await res.json();
}

export async function updateAdminOffersSection(
  input: import("@/types").UpdateOffersSectionInput
): Promise<{ id: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/offerssection`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to update offers section (${res.status})`);
  }

  return await res.json();
}

export async function uploadOfferImage(file: File): Promise<{ imageUrl: string; relativePath: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/offerssection/upload-image`, {
    method: "POST",
    headers: {
      ...getAuthHeader(),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to upload offer image");
  }

  return await res.json();
}

// ---------------------------------------------------------------------------
// PROMO CODES & OFFER CONDITIONS API
// ---------------------------------------------------------------------------

export async function fetchAdminPromoCodes(): Promise<import("@/types").PromoCode[]> {
  const res = await fetch(`${API_BASE_URL}/promocodes`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load promo codes (${res.status})`);
  }

  return await res.json();
}

export async function createAdminPromoCode(input: import("@/types").CreatePromoCodeInput): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/promocodes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to create promo code (${res.status})`);
  }

  return await res.json();
}

export async function updateAdminPromoCode(id: string, input: import("@/types").UpdatePromoCodeInput): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/promocodes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(errText || `Failed to update promo code (${res.status})`);
  }
}

export async function deleteAdminPromoCode(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/promocodes/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(errText || `Failed to delete promo code (${res.status})`);
  }
}

// ----------------------------------------------------
// 10. SIZE CHARTS & MEASUREMENT MATRIX MANAGEMENT
// ----------------------------------------------------
export async function fetchAdminSizeCharts(includeInactive: boolean = true): Promise<import("@/types").SizeChart[]> {
  const res = await fetch(`${API_BASE_URL}/sizecharts?includeInactive=${includeInactive}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to load size charts from backend (${res.status})`);
  }

  return await res.json();
}

export async function fetchAdminSizeChartById(id: string): Promise<import("@/types").SizeChart> {
  const res = await fetch(`${API_BASE_URL}/sizecharts/${id}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to load size chart details (${res.status})`);
  }

  return await res.json();
}

export async function createAdminSizeChart(input: import("@/types").CreateSizeChartInput): Promise<import("@/types").SizeChart> {
  const res = await fetch(`${API_BASE_URL}/sizecharts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to create size chart (${res.status})`);
  }

  return await res.json();
}

export async function updateAdminSizeChart(id: string, input: import("@/types").CreateSizeChartInput): Promise<import("@/types").SizeChart> {
  const res = await fetch(`${API_BASE_URL}/sizecharts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to update size chart (${res.status})`);
  }

  return await res.json();
}

export async function assignSizeChartProducts(id: string, productIds: string[]): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/sizecharts/${id}/assign-products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ productIds }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Failed to assign products to size chart (${res.status})`);
  }

  return await res.json();
}

export async function deleteAdminSizeChart(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/sizecharts/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(errText || `Failed to delete size chart (${res.status})`);
  }
}







