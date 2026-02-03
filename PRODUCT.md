# PRODUCT GUIDE: TT-CRONOGRAMA

## 1. PRODUCT OVERVIEW
**TT-Cronograma** is the digital companion for "Team Training" (TT) running group members. It serves two main purposes:
1.  **For Runners:** A central hub to find upcoming races, access exclusive member benefits, view training routes, buy gear, and validate their active membership.
2.  **For Admins:** A content management system to keep the community updated without needing code changes.

The application is built as a **PWA (Progressive Web App)**, allowing users to install it on their phones for offline access to key information.

---

## 2. KEY FEATURES: RUNNER EXPERIENCE (PUBLIC)

### 🏃 Race Calendar (`/races`)
A comprehensive and interactive calendar for upcoming road and trail events.
*   **Smart Filtering:**
    *   **Date Range:** Custom start/end date picker to plan the season.
    *   **Modality:** Toggle between "Calle" (Road) and "Trail" races.
    *   **Region:** Filter by specific Argentine provinces.
*   **Visual Indicators:**
    *   **Countdown:** Automatically calculates days remaining or marks events as "Finished" (grayscale).
    *   **Tags:** Distance pills (e.g., "10k", "42k") and modality badges.
*   **Detail View:**
    *   Dedicated pages for each race with descriptions, location maps, and external registration links.
    *   **Exclusive Discounts:** "Discount Code" cards that are only visible for specific partner races.

### 🛒 TT Store (`/store`)
A streamlined e-commerce catalog for official merchandise.
*   **Search & Discovery:** Real-time search bar filters products by name or description with smooth fade animations.
*   **Product Cards:** Display price, available sizes, and high-quality images.
*   **2-Step Checkout Process:**
    1.  **Payment Info:** Shows the product summary and the official transfer Alias (`rparodi26`) with a one-tap copy button.
    2.  **Validation:** User uploads their payment receipt (Image/PDF up to 5MB) and enters personal contact details (Name, WhatsApp).
*   **Backend Processing:** Automatically uploads receipts to Firebase Storage and creates an order record in Firestore for admin review.

### 🗺️ Training Tracks (`/tracks`)
An interactive library of training routes for runners.
*   **GPX Visualization:** Renders actual GPX file data onto a canvas, drawing the route shape dynamically.
*   **Performance Metrics:** Automatically calculates and displays total distance (km) and elevation gain (m).
*   **States:** Handles loading states and provides fallbacks if the GPX cannot be rendered (allowing raw file download instead).
*   **Visual Themes:** Supports different accent colors (Orange/Cyan) for route visualization.

### 💎 Member Benefits (`/benefits`)
A perks section connecting runners with partner brands.
*   **Interaction Models:**
    *   **Direct Link:** "Aprovechar" button leading directly to partner websites.
    *   **Info Modal:** "Info" button opens a dialog with specific redemption instructions (e.g., "Show your ID at checkout").
    *   **Social Integration:** Direct deep-links to WhatsApp or Instagram for service-based partners.
*   **Visuals:** prominent partner logos and clear discount descriptions.

### 🪪 Digital Credential (`/card/[dni]` & Dialog)
The core validation system for physical access and in-store discounts.
*   **Lookup System:** Validates DNI against a central Google Sheet (cached for 1 hour for performance).
*   **Status States:**
    *   **Active:** Displays Green "Activo" badge, Runner Name, and DNI.
    *   **Inactive/Error:** clearly informs the user if their membership is expired or not found.
*   **Offline Convenience:** Automatically saves the last validated DNI to `localStorage` for quick access next time.
*   **QR Code:** Generates a unique QR pointing to `/card/[dni]` for scannable validation. The QR can be expanded to full screen for easier scanning.

### 📝 Onboarding Quiz (`/quiz`)
A guided multi-step form for runner profiling.
*   **5-Step Wizard:**
    1.  **Personal:** Name, DNI, Email.
    2.  **Demographics:** DOB, Gender.
    3.  **Activity:** Current running volume, strengthening habits.
    4.  **Logistics:** Training location/time availability.
    5.  **Health/Goals:** Injuries history and primary objectives.
*   **Zero-Backend logic:** Submits data directly to a Google Form via a `no-cors` POST request, allowing coaches to receive data in their existing spreadsheets without a custom database.

### 🔔 Engagement & Notifications
*   **Infinite Banner:** A scrolling marquee (e.g., "¡Carrera TT 2026!") used for high-priority announcements.
*   **News Notifier:** A "Toast" system that stacks important updates (with links) on the screen when the app loads, ensuring users don't miss critical info.

---

## 3. ADMIN DASHBOARD (`/admin`)

Protected area for team managers. Authentication is handled via Firebase Auth.

### Content Management (CMS)
*   **Races:** Full CRUD. Upload cover images, set dates, manage distances and discount codes.
*   **Products:** Manage inventory, update prices, and upload product photos.
*   **Tracks:** Upload GPX files and set difficulty ratings (Easy/Medium/Hard).
*   **Benefits:** Manage partner relationships, upload logos, and configure link behaviors.

### Operations
*   **Order Management:** View incoming orders from the store, access uploaded receipts, and manage order status.

---

## 4. DATA & INTEGRATIONS

| Feature | Source / Backend | Tech Details |
| :--- | :--- | :--- |
| **Dynamic Content** | **Firebase Firestore** | Stores Races, Benefits, Tracks, Products, Orders. |
| **File Storage** | **Firebase Storage** | Hosting for Race covers, Receipts, Partner logos, GPX files. |
| **Membership Source** | **Google Sheets** | Read-only integration via CSV export. Admin updates Sheet -> App validates. |
| **Form Submissions** | **Google Forms** | Direct POST integration for the Onboarding Quiz. |
| **Auth** | **Firebase Auth** | Email/Password login for Admins. |

---

## 5. USER FLOWS

### The "Race Day" Flow
1. User filters Race Calendar for "September" + "Trail".
2. Finds "Patagonia Run".
3. Notes the "Countdown: 45 days".
4. Copies the "Discount Code" and clicks "Register" to go to the official site.

### The "Merch Drop" Flow
1. User sees "New Tee" in the Infinite Banner.
2. Goes to `/store`, searches "Remera".
3. Selects Size M -> Checkout.
4. Copies Alias -> Makes Bank Transfer.
5. Uploads screenshot of transfer -> "Finalizar Pedido".
6. Admin sees order + receipt in Dashboard.

### The "Discount Hunter" Flow
1. User is at a partner store.
2. Opens App -> Clicks "Credencial TT".
3. DNI is auto-filled from previous visit -> Shows "Active" screen.
4. Clerk scans QR code or verifies screen.
5. User gets 15% off.
