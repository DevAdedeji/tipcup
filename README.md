# TipCup

A creator monetization platform for receiving tips, funding goals, and paying out to Nigerian bank accounts.

[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js)](https://vuejs.org)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase)](https://firebase.google.com)
[![Bachs](https://img.shields.io/badge/Payments-Bachs-F2661F)](https://bachs.io)

---

## Features

**For creators**
- A public page at `tipcup.adedeji.xyz/yourname`, server-rendered so shared links unfurl with your name, bio and avatar
- Custom support tiers with emojis and labels
- Fundraising goals that advance as tips land
- Multiple bank accounts with a designated primary
- Withdrawals to any Nigerian bank account
- Earnings dashboard with transaction and withdrawal history
- Light and dark themes

**For supporters**
- Pay by bank transfer or card, no account required
- Attach a message to a tip
- Contribute toward a creator's active goal

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Nuxt 4 (hybrid rendering), Vue 3 `<script setup>` |
| Styling | Tailwind CSS on an HSL design-token layer, Headless UI, Lucide icons |
| Auth & data | Firebase Auth, Firestore, Firebase Admin SDK |
| Payments | [Bachs](https://bachs.io) — checkout, bank resolution, payouts, webhooks |
| Charts | Chart.js via vue-chartjs |

---

## Payments: Bachs

TipCup previously ran on Flutterwave. Every call has a direct Bachs equivalent:

| Flutterwave | Bachs |
| --- | --- |
| `POST /payments` | `POST /v1/checkout-sessions` |
| `GET /transactions/{id}/verify` | `GET /v1/checkout-sessions/{id}` |
| `GET /banks/NG` | `GET /v1/payouts/banks?country_code=NG` |
| `POST /accounts/resolve` | `POST /v1/payouts/resolve-account` |
| `POST /transfers` | `POST /v1/payouts/withdrawals` |
| `verif-hash` header | `X-Bachs-Signature` (HMAC-SHA256) |

Three things about the Bachs API shape the integration:

1. **Tips are a raw amount, not a catalog product.** Checkouts use Bachs' "pure checkout" (`pricing: { currency, amount }`) rather than `product_cart`, so no product has to exist per tier.
2. **Money is a decimal string** (`"1000.00"`) at the currency's precision — never minor units, never a JS number. Conversion happens only at the provider boundary in `server/utils/bachs.ts`.
3. **Webhooks are the source of truth.** The redirect back from checkout triggers a verification call purely so the supporter sees confirmation immediately; both paths funnel into the same idempotent recorder.

### Constraints worth knowing

- **Your organization must hold an NGN balance.** Until it does, every NGN checkout fails with `BASE_CURRENCY_NOT_HELD_BY_ORG`. Enable NGN under balance currencies in the Bachs dashboard before testing payments — this is the first thing to check if checkouts fail.
- **Minimum tip is ₦1,000.** Bachs rejects NGN checkouts below this. Enforced in the tier editors, in the API handler, and in `server/utils/bachs.ts`.
- **NGN card payments are in beta at Bachs.** NGN collection is primarily bank transfer; cards are priced in USD. Confirm beta access before relying on card tips.
- **Fees:** collection 1.5% capped at ₦2,000 for bank transfer (2% for local cards); withdrawals a flat ₦100. NGN balances settle immediately.
- **Who pays the fee** is a Bachs org setting, not a code setting. This project runs `fee_preference: org_pays`, so a supporter is charged exactly the tier amount and the creator is credited the settlement amount. Change it with `PUT /v1/organizations/checkout/settings`. It is set per environment — sandbox and live are configured separately.

### Where the live API differs from its OpenAPI spec

Both verified against `sandbox-api.bachs.io` and handled in `server/utils/bachs.ts`:

| | Spec says | Actually returns |
| --- | --- | --- |
| `GET /payouts/banks` | `{ status, message, data }` | `{ banks: [...] }` |
| Errors | `{ message }` | `{ detail, error_code, doc_url }` |

The provider layer accepts both envelope shapes and reads `detail` first when building error messages, so failures surface something actionable rather than a generic "request failed".

---

## Getting started

### 1. Install

```bash
git clone https://github.com/devadedeji/tipcup.git
cd tipcup
npm install
```

> Do not run `npm install` with `sudo` — it creates root-owned files in `node_modules` that later installs cannot update.

### 2. Configure

Copy `.env.example` to `.env` and fill it in:

```bash
cp .env.example .env
```

Firebase client values use the plain `FIREBASE_*` names (no `VITE_` prefix) and are exposed through Nuxt runtime config.

### 3. Firestore indexes

Composite indexes required:

| Collection | Fields |
| --- | --- |
| `payments` | `toUserId` asc, `createdAt` desc |
| `withdrawals` | `userId` asc, `createdAt` desc |
| `users` | `username` asc |
| `users/{uid}/goals` | `status` asc, `createdAt` desc |

### 4. Webhooks

In the Bachs Developer Portal, add an endpoint pointing at:

```
https://your-domain/api/bachs/webhook
```

Subscribe to `collection.succeeded`, `payout.paid`, and `payout.failed`, then copy the signing secret into `BACHS_WEBHOOK_SECRET`.

For local development, use the portal's Local Testing feature — no tunnel required.

### 5. Run

```bash
npm run dev
```

http://localhost:4444

---

## Rendering model

Hybrid, configured in `nuxt.config.ts`:

- **Server-rendered:** `/` and `/[username]` — these need to be indexable and to unfurl correctly when shared.
- **Client-only:** `/dashboard/**`, `/login`, `/signup`, `/onboarding` — Firebase auth state lives in the browser.

Public profiles are read server-side through `server/api/profile/[username].get.ts` using the Admin SDK, so the public page needs no client read access to the `users` collection.

---

## Design system

**Adire** — Yoruba indigo resist-dye cloth. Deep indigo on undyed cotton, with the resist geometry drawn in CSS and used structurally: header bands, goal-bar fills, section markers.

Colours are HSL triplets defined once in `app/assets/css/main.css` and mapped in `tailwind.config.js` as `hsl(var(--token) / <alpha-value>)`. Dark mode is a single `.dark` class on `<html>`; no component knows which theme is active. Type is Fraunces (display) over Karla (body); money uses the `.amount` class, which pins the sans face because the display serif has no naira glyph.

### The cloth

Every creator's page pattern is generated from their username — six resist motifs combined with a weave scale, chosen by hashing the name in `useAdire`. Deterministic, so the same name always produces the same cloth and SSR never disagrees with the client.

Render it through `<AdireCloth :seed="username" />` rather than calling `useAdire` in a template. The motif classes live **outside** `@layer` in `main.css` on purpose: Tailwind only keeps layered rules whose class names appear literally in source, and these are composed by interpolation (`cloth-${n}`), so inside a layer they get purged and every cloth renders as a flat block.

Use tokens (`bg-surface`, `text-text-secondary`, `border-border`, `bg-accent-muted`), never raw Tailwind colours — a `bg-white/5` is invisible on a light background and a `text-green-500` ignores the theme.

---

## Project structure

```
app/
├─ assets/css/main.css      # Design tokens, light + dark
├─ components/
│  ├─ ui/                   # Button, Card, Input, Table, Modal, StatCard, ...
│  └─ dashboard/            # Sidebar, Topbar, charts, modals
├─ composables/             # useAuth, usePaymentFlow, useTheme, useChartTheme, ...
├─ firebase/                # Lazy, SSR-safe client SDK
├─ pages/
│  ├─ index.vue             # Landing (SSR)
│  ├─ [username].vue        # Creator profile (SSR)
│  └─ dashboard/            # Overview, earnings, goals, settings (SPA)
└─ utils/format.ts          # Currency formatting + amount limits

server/
├─ api/
│  ├─ bachs/                # initialize, verify, banks, resolve-account,
│  │                        # withdraw, webhook
│  └─ profile/              # SSR profile read + view counter
└─ utils/
   ├─ admin.ts              # Firebase Admin
   ├─ auth.ts               # ID-token verification for money endpoints
   ├─ bachs.ts              # Bachs provider layer
   └─ payments.ts           # Atomic, idempotent money recording
```

---

## Money handling

All balance changes run inside Firestore transactions in `server/utils/payments.ts`.

- Payment documents are keyed by the checkout reference, so a redirect and a webhook arriving together cannot double-credit.
- Webhook event IDs are claimed in a `webhook_events` collection, making redeliveries free.
- Withdrawals debit the balance and write a `pending` record in one transaction, before any money moves. A rejected payout restores the balance and closes the record.
- `/api/bachs/withdraw` identifies the caller from their Firebase ID token, never from a user id in the request body.

---

## License

MIT
