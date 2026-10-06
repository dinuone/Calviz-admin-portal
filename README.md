# CALVIZ Admin Portal

Operational Control Deck for CALVIZ Luxury Heavyweight Streetwear.

## Technology Stack
- **Framework**: Next.js 16 (App Router)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons
- **Language**: TypeScript
- **Target Backend**: .NET 9 Clean Architecture Web API (`http://localhost:5089/api`)
- **Port**: `3001` (to run concurrently with Storefront on `3000`)

---

## Features

1. **Operations Deck (`/dashboard`)**:
   - Live revenue volume, total order count, and catalog health.
   - Bank transfer slip verification alert banner.
   - Recent orders feed with quick status badges.

2. **Order Fulfillment Register (`/orders`)**:
   - Filter by Order Status (`Placed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
   - Filter by Payment Method (`BankTransfer`, `CashOnDelivery`, and `Unverified Slips`).
   - **Slide-over Order Detail Drawer**:
     - Customer contact and shipping destination manifest.
     - Line items with size and quantities.
     - **Direct Bank Slip Review**: In-line high-resolution bank receipt viewer with 1-click **"Approve Bank Slip & Move to Processing"** action.
     - Manual lifecycle stage override (`OrderStatus` & `PaymentStatus`).
     - QuestPDF invoice download link.

3. **Silhouettes & Catalog (`/products`)**:
   - Full catalog overview with GSM weight badges.
   - Size Matrix inventory tracking (`S`, `M`, `L`, `XL`, `XXL`) with low-stock warnings.
   - Live storefront preview link.

4. **New Silhouette Creator (`/products/new`)**:
   - Technical garment specs input (Title, Slug, Category, Base Price, Fabric GSM, Description, Featured toggle).
   - Dynamic size matrix allocation with auto-generated SKUs.
   - Multiple image CDN links with primary angle designation.

5. **Collections & Categories (`/categories`)**:
   - Manage streetwear collections, seasonal capsules, and drop categories.
   - New collection modal dialog.

6. **System Telemetry & Architecture Settings (`/settings`)**:
   - Live ping check to backend `.NET` API (`/api/categories`).
   - Response latency meter.
   - Invoicing and static file storage telemetry.

---

## Authentication & Credentials

Default Administrator credentials configured in backend:
- **Identifier**: `admin@calviz.com`
- **Passkey**: `CalvizAdmin2026!`
- *(A 1-click autofill button is available on the `/login` screen)*

---

## Quick Start

```bash
# 1. Navigate into admin-portal
cd admin-portal

# 2. Install dependencies
npm install

# 3. Start development server on port 3001
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001) in your browser.
