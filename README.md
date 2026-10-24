# Limo — Operations, elevated

A responsive TypeScript and React frontend for a limousine operations SaaS. Built with Vite and Lucide icons. No database, authentication, payment processing, or AI integration is connected. Google Places autocomplete is implemented and requires a configured browser API key; no embedded map is used.

## Development

Requires Node.js 22.12+ (validated with Node 24).

```sh
npm ci
npm run dev -- --port 5173
```

```sh
npm run build
npm run preview -- --port 4173
```

## Included

- Operations dashboard with illustrative revenue and fleet metrics
- Searchable bookings, status and vehicle filters, CSV export
- Booking creation with passenger, journey, date/time, fare, and notes
- Google Places pickup/drop-off suggestions with structured addresses, Place IDs, coordinates, and separate meeting instructions
- Booking details, driver assignment, and trip status changes
- Completed bookings record actual drop-off date/time in GST; cancellation requires a reason and keeps a Cancelled record
- Searchable, sortable fleet and driver tables with status filters, pagination, and CSV export
- Fleet sections for Vehicles, Mileage & shifts, and Maintenance
- Start/end odometer readings with driver, QC/driver entry source, submitter, distance and notes
- Lower-reading and overlapping-shift checks; unusual distances and mileage gaps require review
- Accepted shift readings update mileage and maintenance reminders; record service by KM or date
- Click-through vehicle profiles with mileage/service history, registration, insurance, and editable details
- Driver profiles with contacts, licences, permits, emergency details, and editable information
- Customer tables with per-company creation, editable profiles, search, filters, pagination, and scoped CSV export
- Registered Suppliers with contact details, search, status filters, pagination and CSV export
- Outsource assignments inside booking details with optional driver/vehicle information and assignment history
- Invoices and booking reports
- Workspace preferences and illustrative subscription screen
- Responsive navigation and mobile layouts

Bookings persist in localStorage under `limo-bookings`. Customers persist under `limo-customers` and are grouped by stable company IDs. Existing unscoped demo customers are migrated to the original company (`CO-1001`, or the first company if that record is absent). The single demo workspace is saved under `limo-workspace`. Company onboarding and switching have been removed; company-specific Supabase logins will be added later. Previous `limo-companies` data is retained locally only to preserve the original workspace ID and existing customer records. New directory records persist under `limo-records`; vehicle/driver profile edits use `limo-directory-edits`. Clear these booking and directory keys to reset sample data. Customers remain linked to the current company ID; bookings, fleet, and driver data remain demo data. Browser filtering is not a security boundary. Dashboard totals, fleet inventory, phone contacts, billing, and invoice payment statuses are sample data. Dates default to 21 October 2026 for a consistent demo. Fonts use Google Fonts with system fallbacks.

## Future backend

Connect Supabase only after designing company membership, roles, tenant-scoped records, and Row Level Security. Replace browser storage through a typed repository/service layer. Pricing, availability, payments, and access decisions must be enforced server-side. This frontend does not provide production tenant isolation or security.

## Fleet workflow

Open **Fleet → Mileage & shifts** to start a vehicle shift. When it ends, enter the closing odometer and time. Distances above 1,000 km per shift, or gaps between current mileage and the starting reading, require review before updating the vehicle. Reviewers can correct the closing reading and leave a note. A vehicle cannot start another shift until its previous shift is closed and reviewed. Multiple non-overlapping shifts per day are supported; all shift times use GST (UTC+04:00).

Open **Fleet → Maintenance** to see services due by mileage or date (whichever comes first), mark a vehicle under maintenance, and record completed work, workshop, cost, service mileage and next KM/date thresholds. Vehicle profiles show full mileage and service history.

Logs persist under `limo-shifts` and `limo-services`; accepted mileage and service schedules persist with vehicle overrides under `limo-directory-edits`. No backend, automatic notifications, document uploads, PWA, or mobile app is connected. Driver/submitter/reviewer names and the QC/Driver source are demo inputs, not authenticated identities. Existing vehicles without a next-service date remain driven by their mileage threshold until a date is entered.

Run validation tests with Node 24:

```sh
npm test
```

## Booking completion and cancellation

Open a booking and choose **Complete booking** to enter its actual drop-off date/time in GST. It must be after pickup (or at the same minute) and cannot be in the future. The timestamp appears in the booking list, details, and CSV export. Existing completed bookings without a recorded timestamp show `Not recorded`; use **Add drop-off time** to fill it accurately.

Use **Cancel booking**, enter a reason, and confirm to retain the booking with a cancellation timestamp and reason. The Cancelled filter shows these records. Driver assignment is locked for completed/cancelled bookings so it cannot accidentally reset their status. The status selector uses these same completion/cancellation forms. There is no payment-provider or refund action in this frontend demo.

## Outsourced bookings

Register partner companies under **Suppliers → New supplier**. In **Dispatch**, open a non-final booking and choose **Assign driver → Outsource…**, select a supplier, and save. Driver name, driver mobile, vehicle model, plate number, and supplier reference are optional initially. Missing driver/vehicle information displays **Outsourced · Awaiting details**; use **Edit outsource details** when the supplier provides it. There are no colour or supplier-cost fields.

Supplier driver and vehicle details remain snapshots on that booking, outside your own Drivers and Fleet registers. Later changes preserve the preceding assignment and change time in **Assignment history**. Selecting your own driver again removes the current outsource assignment but retains that history. Completed and cancelled bookings remain locked against reassignment. Inactive suppliers cannot receive new assignments, but existing assignments can be updated. Supplier record edits do not silently rewrite booking snapshots.

Supplier records are grouped by company ID under localStorage key `limo-suppliers`; assignments and history persist with `limo-bookings`. Dispatch bookings can be searched by supplier/model/plate and Dispatch/Reports CSV exports include supplier assignment details. Your team sends confirmation messages manually: no portal, supplier links, invitations, messaging, or supplier billing integration has been added.

## Booking and dispatch responsibilities

**Bookings** captures passenger, journey, requested vehicle, fare and booking status. Driver names, assignment controls, outsourced driver details and assignment history are shown only in **Dispatch**. Bookings/Overview display the requested vehicle; Dispatch displays the operational vehicle and driver. Open a booking from Dispatch to select an own-fleet driver or **Outsource…**. Existing assignments are retained. Booking exports omit driver/supplier assignment fields; Dispatch and Reports exports retain them. This separates frontend workflows and does not implement role-based security.

## Google Places setup

The pickup and drop-off fields use **Places API (New)** through the official Google Maps JavaScript loader. They show UAE suggestions with a Dubai location bias, debounce requests, and use a separate autocomplete session token per location-selection session. Selecting a result fetches only the Place ID, display name, formatted address and location. The loader is shared across both fields.

1. Open [Google Cloud Console](https://console.cloud.google.com/), create/select a project and link billing.
2. Enable **Maps JavaScript API** and **Places API (New)** under APIs & Services → Library.
3. Create an API key under APIs & Services → Credentials. Use a browser key with **Websites** application restrictions. For local testing, allow `http://localhost:5173/*` and `http://127.0.0.1:5173/*`; add your actual HTTPS production website before deployment.
4. Apply API restrictions allowing only Maps JavaScript API and Places API (New).
5. Create or edit an untracked `.env.local` in the project root (see `.env.example`):

```dotenv
VITE_GOOGLE_MAPS_API_KEY=your_restricted_browser_key
```

6. Run `npm ci`, then restart `npm run dev`. Production deployments need the variable present during `npm run build`; rebuild after changing it.

`VITE_` variables are compiled into the browser bundle. This key is intentionally browser-visible and must be protected by website/API restrictions; never use an unrestricted server credential here. Do not commit `.env.local` or paste keys into chat. Google billing/quota/key restrictions are configured in your Google Cloud project, not by this app.

For cloud development, the saved environment draft declares `VITE_GOOGLE_MAPS_API_KEY` and allows `maps.googleapis.com`, `maps.gstatic.com`, and `places.googleapis.com`. Review/save the environment settings and publish to activate that configuration; a draft save alone does not apply it.

### Location records

Each new booking stores `pickupLocation` and `dropoffLocation` with `name`, `formattedAddress`, `placeId`, `latitude`, `longitude`, `provider`, `resolvedAt`, and `instructions`, alongside the existing pickup/drop-off text. Meeting instructions are independent of the address. Details are visible in the booking drawer. Selecting a place and then editing its text immediately clears the previous Place ID and coordinates. Future location-sharing/navigation can use this structured record; sending links and map-pin adjustment are not implemented yet.

Without a key, or if Google fails, typed locations can still be saved but are clearly marked unverified, with no Place ID or fabricated coordinates. Existing bookings remain text-only until re-entered through a connected Places workflow. The app does not invent Google Place IDs or use fake production suggestions.

This phase stores demo booking data in localStorage, not Supabase. Before production persistence, review Google's current Places content storage/refresh terms: Place IDs and other Places content have different storage rules. `resolvedAt` records when a lookup occurred for that future refresh design.

### Validation

`npm test` covers structured location persistence, invalid coordinates, and stale-data clearing. Browser validation exercised SDK loading, autocomplete, keyboard/mouse selection, per-field session tokens, detail fetching, persistence, manual fallback, error handling and mobile layout with mocked Google responses. Live Google requests have **not** been verified because no real API key has been configured.
