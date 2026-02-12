# 💰 TipCup

> A modern creator monetization platform for receiving tips, setting fundraising goals, and managing withdrawals seamlessly.

[![Nuxt](https://img.shields.io/badge/Nuxt-4.3.1-00DC82?logo=nuxt.js)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3.5.27-4FC08D?logo=vue.js)](https://vuejs.org)
[![Firebase](https://img.shields.io/badge/Firebase-12.9.0-FFCA28?logo=firebase)](https://firebase.google.com)
[![Flutterwave](https://img.shields.io/badge/Flutterwave-v3-FF6B00)](https://flutterwave.com)

---

## 🌟 Features

### For Creators
- ✅ **Custom Profile Pages** - Personalized pages with your username (e.g., `tipcup.adedeji.xyz/yourname`)
- ✅ **Fundraising Goals** - Set and track progress toward financial goals
- ✅ **Multiple Support Tiers** - Create custom tip amounts with emojis and descriptions
- ✅ **Bank Account Management** - Add multiple bank accounts, set primary accounts
- ✅ **Automated Withdrawals** - Instant withdrawals to Nigerian bank accounts via Flutterwave
- ✅ **Earnings Dashboard** - Track total earnings, current balance, and transaction history
- ✅ **Withdrawal History** - Complete audit trail of all payouts

### For Supporters
- ✅ **Quick & Easy Payments** - Support creators with just a few clicks
- ✅ **Secure Transactions** - Powered by Flutterwave's secure payment gateway
- ✅ **Custom Messages** - Send personalized messages with your tips
- ✅ **Goal Contributions** - Help creators reach their fundraising goals

---

## 🛠️ Tech Stack

### Frontend
- **[Nuxt 4](https://nuxt.com)** - The Intuitive Vue Framework
- **[Vue 3](https://vuejs.org)** - Composition API with `<script setup>`
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[Headless UI](https://headlessui.com)** - Unstyled, accessible UI components
- **[Chart.js](https://www.chartjs.org)** - Beautiful charts for analytics
- **[Lucide Icons](https://lucide.dev)** - Clean, customizable icons

### Backend
- **[Firebase Auth](https://firebase.google.com/products/auth)** - User authentication
- **[Firestore](https://firebase.google.com/products/firestore)** - Real-time NoSQL database
- **[Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)** - Server-side operations

### Payment Processing
- **[Flutterwave](https://flutterwave.com)** - Payment gateway and transfers
  - Payment initialization & verification
  - Bank account resolution
  - Automated transfers/withdrawals
  - Webhook handling

---

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Firebase Project** ([Create one here](https://console.firebase.google.com))
- **Flutterwave Account** ([Sign up here](https://dashboard.flutterwave.com/signup))

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/devadedeji/tipcup.git
cd tipcup
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

# Flutterwave
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_SECRET_HASH=your_webhook_secret_hash
```

> **📘 Note:** Get your Firebase Service Account JSON from Firebase Console → Project Settings → Service Accounts → Generate New Private Key

### 4. Configure Firestore Security Rules

Copy the security rules from `firestore_rules.md` artifact and apply them in Firebase Console:

1. Go to **Firestore Database** → **Rules**
2. Paste the rules
3. **Publish**

### 5. Create Firestore Indexes

Create a composite index for payments:
- Collection: `payments`
- Fields: `toUserId` (Ascending), `createdAt` (Descending)

Create a composite index for withdrawals:
- Collection: `withdrawals`
- Fields: `userId` (Ascending), `createdAt` (Descending)

### 6. Run Development Server

```bash
npm run dev
```

Visit **http://localhost:4444** 🎉

---

## 📦 Production Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy! 🚀

---

## 📁 Project Structure

```
tipcup/
├── app/
│   ├── components/
│   │   ├── dashboard/         # Dashboard-specific components
│   │   │   ├── BankModal.vue
│   │   │   ├── GoalModal.vue
│   │   │   ├── WithdrawalModal.vue
│   │   │   └── ...
│   │   └── ui/               # Reusable UI components
│   │       ├── Button.vue
│   │       ├── Input.vue
│   │       ├── Select.vue
│   │       ├── Table.vue
│   │       └── ...
│   ├── composables/          # Vue composables
│   │   ├── useAuth.ts
│   │   ├── useBankDetails.ts
│   │   ├── usePayments.ts
│   │   └── useWithdrawals.ts
│   ├── layouts/              # App layouts
│   │   ├── default.vue
│   │   └── dashboard.vue
│   ├── pages/                # File-based routing
│   │   ├── [username].vue    # Creator profile page
│   │   ├── dashboard/
│   │   │   ├── index.vue
│   │   │   └── earnings.vue
│   │   ├── login.vue
│   │   ├── signup.vue
│   │   └── onboarding.vue
│   └── utils/                # Utility functions
│       ├── format.ts
│       └── cn.ts
├── server/
│   ├── api/
│   │   └── flutterwave/      # Flutterwave API endpoints
│   │       ├── banks.get.ts
│   │       ├── initialize.post.ts
│   │       ├── verify.post.ts
│   │       ├── resolve-account.post.ts
│   │       ├── withdraw.post.ts
│   │       └── webhook.post.ts
│   └── utils/
│       ├── admin.ts          # Firebase Admin SDK
│       └── flutterwave.ts    # Flutterwave utilities
├── public/                   # Static assets
├── firebase.ts               # Firebase client config
└── nuxt.config.ts           # Nuxt configuration
```

---

## 🔑 Key Features Explained

### 1. **Payment Flow**
```
User clicks "Support" → Flutterwave Checkout → Payment Success →
Webhook updates Firestore → Dashboard shows transaction
```

### 2. **Withdrawal Flow**
```
Creator requests withdrawal → Backend validates balance →
Flutterwave transfers to bank → Withdrawal record created →
Balance updated
```

### 3. **Bank Account Resolution**
- Uses Flutterwave's account resolution API
- Verifies account number and bank code
- Returns account holder name for confirmation
- **Test Mode:** Only Access Bank (044) supported with test keys

---

## 🧪 Testing

### Test Bank Account (Flutterwave Test Mode)
- **Bank:** Access Bank
- **Bank Code:** 044
- **Account Number:** 0690000031
- **Account Name:** Pastor Bright

> **⚠️ Important:** Flutterwave test environment only allows bank code `044` for account resolution. Use production keys to test with all banks.

---

## 🔒 Security Considerations

- ✅ Webhook signature verification implemented
- ✅ Firestore security rules enforce user permissions
- ✅ Server-side validation for all transactions
- ✅ Firebase Admin SDK used for privileged operations
- ✅ Environment variables for sensitive credentials

---

## 🐛 Common Issues & Solutions

### Issue: Payments not showing in dashboard
**Solution:** Ensure Firestore security rules include the `payments` collection read permissions. In localhost, webhooks don't work—payments are recorded via the verify endpoint.

### Issue: Withdrawals not displaying
**Solution:** Update Firestore rules to include the `withdrawals` collection read permissions.

### Issue: Bank list is slow
**Solution:** The Select component is optimized for large datasets. It limits initial render to 100 options and includes debounced search.

### Issue: "Only bank code 044 allowed" error
**Solution:** You're using Flutterwave test keys. This is expected behavior. Use production keys or test with Access Bank (044).

---

## 📈 Performance Optimizations

- ✅ **Debounced search** in Select component (150ms)
- ✅ **Limited render** for large option lists (max 100 items)
- ✅ **Real-time listeners** for payments and withdrawals
- ✅ **Paginated tables** for transaction history
- ✅ **Lazy-loaded components** where applicable

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [Nuxt Team](https://nuxt.com) for the amazing framework
- [Flutterwave](https://flutterwave.com) for payment infrastructure
- [Firebase](https://firebase.google.com) for backend services
- [Tailwind CSS](https://tailwindcss.com) for beautiful styling

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Contact: [adedejitewogbade2@example.com]

---

Made with ❤️ by Adedeji
