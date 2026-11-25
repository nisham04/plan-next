# CardVault — Personal Card, Offer & Reward Manager

CardVault is a personal card information manager designed to help you track credit and debit cards, categorized merchant offers and perks, and reward point balances with automated cash value calculations.

---

## 🔒 Security & Privacy (Section 7 Compliance)

This is a personal card information and perk tracking tool, **not** a banking or payment processing application.

- **Last 4 Digits Only**: Stores only the last four digits of each card for personal identification. Full 16-digit card numbers are never accepted.
- **Zero Sensitive Data**: Never requests or stores CVV, PIN, OTP, or banking passwords.
- **No External Connections**: Operates offline with zero connections to banks, card networks, or payment processors. No financial transactions are ever executed.
- **Client-Side Validation & Isolation**: All user inputs are validated client-side, and data persists exclusively within local device storage (`localStorage`).
- **Encrypted Local Backup & Restore**: Supports one-click JSON backup export and restore without cloud transmission.

---

## 🚀 Key Features

1. **Card Management (Credit & Debit)**
   - Distinguishes Credit and Debit cards with distinct indicators.
   - Realistic 3D card visualization displaying issuing bank, card name, masked number (`•••• •••• •••• 4589`), expiration, and network logo.
   - Visual color gradient themes (Midnight Obsidian, Royal Sapphire, Emerald Peak, Velvet Amethyst, Rose Metallic, Titanium Slate).
   - Card search and filtering by type.

2. **Categorized Offers & Perks**
   - Stores Offer ID, linked Card ID, Category, Description, and Usage Status (`isUsed`).
   - Filter offers by issuing card, category (Dining, Travel, Shopping, Groceries, Entertainment, Fuel & Utilities, Electronics, General), or redemption status.
   - Quick one-click usage checkbox toggle with instant persistence.
   - Dynamic relational lookups: Any edits to a card's name or bank immediately reflect in the Offers section.

3. **Rewards Tracking & Point Valuation**
   - Stores Card ID, Current Reward Points, Minimum Redemption Points, Value Per Point, and Visibility toggle.
   - **Automatic 1:1 Provisioning**: Adding any new card automatically provisions its corresponding reward record.
   - Calculates estimated cash value (`Points × Value Per Point`).
   - Real-time progress bar toward the minimum redemption threshold with "Eligible for Redemption" badges.
   - Portfolio aggregates: Total tracked points, total estimated cash value, and count of cards ready to redeem.

4. **Cascading Deletion Safety Warning**
   - Warns the user before deleting a card, detailing the exact count of linked offers and the reward record that will be removed.
   - Safely cleans up the card, all its offers, and its reward record upon confirmation.

5. **Persistence & Demo Data**
   - Automatically saves all changes to browser `localStorage`.
   - Preloaded with clearly identified fictional sample data (`[Demo]` prefix) for immediate evaluation.
   - Quick "Reset to Demo Data" and "Clear Vault" actions available in the footer and security modal.

---

## 🛠️ Instructions for Running the Application

### Prerequisites
- Node.js (version 18 or newer recommended)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to the local URL displayed in the terminal (typically `http://localhost:5173/`).

### 3. Build for Production
```bash
npm run build
```
The compiled, production-ready static assets will be output to the `dist/` directory.

### 4. Run Code Quality Checks
```bash
npm run lint
```
Runs ESLint across all source components.

---

## 📁 Source Code Structure

```text
src/
├── components/
│   ├── cards/
│   │   ├── CardFormModal.jsx     # Add/Edit card modal with last-4 validation
│   │   ├── CardsView.jsx         # Card inventory, filter tabs, and grid
│   │   ├── DeleteCardModal.jsx   # Cascade warning modal before card deletion
│   │   └── VisualCard.jsx        # Realistic card component with masked numbers
│   ├── common/
│   │   ├── Badge.jsx             # Category & status badge pill component
│   │   └── Modal.jsx             # Accessible backdrop & dialog container
│   ├── layout/
│   │   ├── Header.jsx            # Top bar with branding, stats, and privacy modal
│   │   └── Navbar.jsx            # Primary navigation tabs (Cards, Offers, Rewards)
│   ├── offers/
│   │   ├── OfferFormModal.jsx    # Add/Edit categorized offer linked to cardId
│   │   └── OffersView.jsx        # Categorized offers list and usage toggles
│   ├── rewards/
│   │   ├── RewardEditModal.jsx   # Reward parameters & valuation editor
│   │   └── RewardsView.jsx       # Reward cards, progress bars & cash estimates
│   └── security/
│       └── SecurityModal.jsx     # Section 7 security policy, backup & restore
├── context/
│   └── CardContext.jsx           # Global state, automatic reward creation, cascade deletions
├── data/
│   └── sampleData.js             # Fictional demo cards, offers, and rewards
├── types/
│   └── cardTypes.js              # Themes, categories, networks, and validation rules
├── App.jsx                       # Master shell coordinating layout and active tabs
├── index.css                     # Tailwind CSS and card theme styling
└── main.jsx                      # React 19 root bootstrap
```
