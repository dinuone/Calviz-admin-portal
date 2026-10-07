export type PaymentMethod = "CashOnDelivery" | "BankTransfer";
export type OrderStatus = "Pending" | "Placed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
export type PaymentStatus = "Pending" | "Paid" | "Verified" | "Failed";

export interface ColorAttribute {
  id: string;
  name: string;
  hexCode: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  color?: string;
  colorHex?: string;
  sku: string;
  stockQuantity: number;
  priceAdjustment?: number;
  isActive?: boolean;
}

export interface ProductImage {
  id?: string;
  imageUrl: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

export interface SizeMeasurementRow {
  size: string;
  chest?: string;
  length?: string;
  sleeve?: string;
  shoulder?: string;
}

export interface Product {
  id: string;
  categoryId?: string;
  categoryIds?: string[];
  categoryName?: string;
  categories?: { id: string; name: string; slug: string }[];
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  gsm?: number;
  lowStockThreshold?: number;
  isFeatured: boolean;
  sizeChartImageUrl?: string | null;
  sizeMeasurementsJson?: string | null;
  sizeGuideNotes?: string | null;
  variants?: ProductVariant[];
  images?: ProductImage[];
  createdAt?: string;
}

export interface ProductSummary {
  id: string;
  categoryId?: string;
  categoryIds?: string[];
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  gsm?: number;
  lowStockThreshold?: number;
  isFeatured: boolean;
  categoryName?: string;
  categorySlug?: string;
  categories?: { id: string; name: string; slug: string }[];
  primaryImageUrl?: string;
  availableSizes?: string[];
  availableColors?: string[];
  totalStock?: number;
  variants?: ProductVariant[];
  images?: ProductImage[];
  createdAt?: string;
}

export interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
}

export interface OrderItemDetail {
  id: string;
  productVariantId?: string;
  productId?: string;
  productName: string;
  size: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  imageUrl?: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: ShippingAddress;
  streetAddress?: string;
  city?: string;
  postalCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  shippingFee?: number;
  deliveryFee?: number;
  discountAmount?: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  invoiceNumber?: string;
  invoicePdfUrl?: string;
  bankSlipUrl?: string;
  bankTransferRef?: string;
  bankSlipApproved?: boolean;
  items: OrderItemDetail[];
}

export interface OrderSummaryAdmin {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  totalItems: number;
  totalAmount: number;
  createdAt: string;
  hasBankSlip: boolean;
  bankSlipApproved?: boolean;
}

export interface CreateProductVariantInput {
  size: string;
  color?: string;
  colorHex?: string;
  sku: string;
  stockQuantity: number;
  priceAdjustment?: number;
}

export interface CreateProductImageInput {
  imageUrl: string;
  displayOrder?: number;
  isPrimary?: boolean;
}

export interface CreateProductInput {
  categoryId?: string;
  categoryIds?: string[];
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  gsm?: number;
  lowStockThreshold?: number;
  isFeatured: boolean;
  sizeChartImageUrl?: string | null;
  sizeMeasurementsJson?: string | null;
  sizeGuideNotes?: string | null;
  variants: CreateProductVariantInput[];
  images: CreateProductImageInput[];
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateProductVariantInput {
  id?: string;
  size: string;
  color?: string;
  colorHex?: string;
  sku: string;
  stockQuantity: number;
  priceAdjustment?: number;
}

export interface UpdateProductImageInput {
  id?: string;
  imageUrl: string;
  displayOrder?: number;
  isPrimary?: boolean;
}

export interface UpdateProductInput {
  id: string;
  categoryId?: string;
  categoryIds?: string[];
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  gsm: number;
  lowStockThreshold?: number;
  isFeatured: boolean;
  isActive: boolean;
  sizeChartImageUrl?: string | null;
  sizeMeasurementsJson?: string | null;
  sizeGuideNotes?: string | null;
  variants: UpdateProductVariantInput[];
  images: UpdateProductImageInput[];
}

export interface BankDetail {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  swiftCode?: string;
  instructions?: string;
  logoUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBankDetailInput {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  swiftCode?: string;
  instructions?: string;
  logoUrl?: string | null;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateBankDetailInput {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  swiftCode?: string;
  instructions?: string;
  logoUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
}


export interface DeliveryCity {
  id: string;
  name: string;
  district: string;
  postalCode: string;
  province: string;
  deliveryFee?: number | null;
  estimatedDeliveryDays?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCityInput {
  name: string;
  district: string;
  postalCode: string;
  province: string;
  deliveryFee?: number | null;
  estimatedDeliveryDays?: string | null;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateCityInput {
  id: string;
  name: string;
  district: string;
  postalCode: string;
  province: string;
  deliveryFee?: number | null;
  estimatedDeliveryDays?: string | null;
  isActive: boolean;
  displayOrder: number;
}

export interface DeliveryEstimatesSummary {
  colomboEstimate: string;
  outstationEstimate: string;
  colomboCount: number;
  outstationCount: number;
}

export interface UpdateDeliveryEstimatesInput {
  colomboEstimate: string;
  outstationEstimate: string;
}

export interface AdminReview {
  id: string;
  productId?: string | null;
  productName?: string | null;
  productSlug?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  rating: number;
  reviewTitle?: string | null;
  comment: string;
  isApproved: boolean;
  approvedAt?: string | null;
  isVerifiedBuyer: boolean;
  imageUrls: string[];
  createdAt: string;
}

export interface PaginatedReviewsResult {
  items: AdminReview[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface LookbookBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  badgeText?: string | null;
  isLarge: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export interface LookbookBannerInput {
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  badgeText?: string;
  isLarge: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface HeroSlide {
  id: number;
  title: string;
  tag: string;
  img: string;
}

export interface HeroSectionConfig {
  id?: string;
  badgeText: string;
  locationText: string;
  titleLine1: string;
  titleLine2: string;
  titleLine3: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  spec1Label: string;
  spec1Value: string;
  spec2Label: string;
  spec2Value: string;
  spec3Label: string;
  spec3Value: string;
  slidesJson: string;
  isActive: boolean;
}

export interface UpdateHeroSectionInput {
  badgeText: string;
  locationText: string;
  titleLine1: string;
  titleLine2: string;
  titleLine3: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  spec1Label: string;
  spec1Value: string;
  spec2Label: string;
  spec2Value: string;
  spec3Label: string;
  spec3Value: string;
  slidesJson: string;
  isActive?: boolean;
}

export interface OfferCard {
  id: number;
  icon: string;
  badge: string;
  title: string;
  description: string;
  footerTag: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
}

export interface OffersSectionConfig {
  id?: string;
  tagline: string;
  title: string;
  subtitle: string;
  noteBadge: string;
  marqueeText: string;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  heroPromoCode: string;
  heroButtonText: string;
  heroButtonUrl: string;
  heroImageUrl: string;
  heroPerk1Title: string;
  heroPerk1Description: string;
  heroPerk2Title: string;
  heroPerk2Description: string;
  cardsJson: string;
  isActive: boolean;
}

export interface UpdateOffersSectionInput {
  tagline: string;
  title: string;
  subtitle: string;
  noteBadge: string;
  marqueeText: string;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  heroPromoCode: string;
  heroButtonText: string;
  heroButtonUrl: string;
  heroImageUrl: string;
  heroPerk1Title: string;
  heroPerk1Description: string;
  heroPerk2Title: string;
  heroPerk2Description: string;
  cardsJson: string;
  isActive?: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: "FixedAmount" | "Percentage" | string;
  discountValue: number;
  minItemQuantity: number;
  minOrderSubtotal: number;
  maxUsesPerCustomer: number;
  maxTotalUses?: number | null;
  currentTotalUses: number;
  isActive: boolean;
  startDate?: string | null;
  expiryDate?: string | null;
  createdAt: string;
}

export interface CreatePromoCodeInput {
  code: string;
  title: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minItemQuantity: number;
  minOrderSubtotal: number;
  maxUsesPerCustomer: number;
  maxTotalUses?: number | null;
  isActive: boolean;
  startDate?: string | null;
  expiryDate?: string | null;
}

export interface UpdatePromoCodeInput extends CreatePromoCodeInput {
  id: string;
}

export interface SizeChartProductSummary {
  id: string;
  name: string;
  slug: string;
  categoryName?: string | null;
}

export interface SizeChart {
  id: string;
  name: string;
  description?: string | null;
  fitType?: string | null;
  categoryHint?: string | null;
  modelStats?: string | null;
  careInstructions?: string | null;
  imageUrl?: string | null;
  measurementsJson: string;
  isDefault: boolean;
  isActive: boolean;
  displayOrder: number;
  productCount: number;
  products?: SizeChartProductSummary[];
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateSizeChartInput {
  name: string;
  description?: string;
  fitType?: string;
  categoryHint?: string;
  modelStats?: string;
  careInstructions?: string;
  imageUrl?: string;
  measurementsJson: string;
  isDefault?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  productIds?: string[];
}

export interface UpdateSizeChartInput extends CreateSizeChartInput {
  id: string;
}





