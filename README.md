# Limo — Operations, elevated

A responsive TypeScript and React frontend for a limousine operations SaaS. Built with Vite and Lucide icons. No database, authentication, payment processing, live maps, or AI integration is connected.

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
- Booking details, driver assignment, and trip status changes
- Searchable, sortable fleet and driver tables with status filters, pagination, and CSV export
- Click-through vehicle profiles with mileage, service thresholds, registration, insurance, and editable details
- Driver profiles with contacts, licences, permits, emergency details, and editable information
- Corporate customers, invoices, and booking reports
- Companies tab with onboarding, editable business/contact details, status filters, pagination, CSV export, and demo workspace switching
- Workspace preferences and illustrative subscription screen
- Responsive navigation and mobile layouts

Bookings persist in localStorage under `limo-bookings`. Company records persist under `limo-companies`. Clear that key to reset the sample companies. New directory records persist under `limo-records`; vehicle/driver profile edits use `limo-directory-edits`. Clear these booking and directory keys to reset sample data. Workspace switching is illustrative and does not isolate bookings. Dashboard totals, fleet inventory, phone contacts, billing, and invoice payment statuses are sample data. Dates default to 21 October 2026 for a consistent demo. Fonts use Google Fonts with system fallbacks.

## Future backend

Connect Supabase only after designing company membership, roles, tenant-scoped records, and Row Level Security. Replace browser storage through a typed repository/service layer. Pricing, availability, payments, and access decisions must be enforced server-side. This frontend does not provide production tenant isolation or security.
