# UAM Commerce — Campus Marketplace

> La marketplace du campus — Achetez & vendez facilement entre étudiants.

## 🛒 À propos

**UAM Commerce** est une marketplace de campus permettant aux étudiants d'acheter et vendre des produits et services directement entre eux. Commandes via WhatsApp, paiements Wave & Orange Money en FCFA.

## ✨ Fonctionnalités

- 🛍️ Catalogue produits par catégorie
- 📲 Commandes directes via WhatsApp
- 💰 Paiement Wave & Orange Money (FCFA)
- ✅ Vendeurs vérifiés avec badge
- 🏪 Abonnement vendeur : **1 000 FCFA/mois**
- 🔐 Authentification Supabase (e-mail + Google)
- 📱 Interface mobile responsive

## 🚀 Stack technique

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS
- **Backend** : Supabase (Auth + DB + Storage)
- **ORM** : Drizzle ORM
- **API** : Hono.js
- **UI** : Framer Motion, Swiper, React Icons

## 🎨 Design système

| Token | Valeur | Usage |
|-------|--------|-------|
| `primary` | `#FF6B00` | Orange principal UAM |
| `accent` | `#CC5500` | Orange foncé hover |
| `secondary` | `#FFF0E6` | Fond secondaire |
| `light` | `#FFF8F3` | Fond clair |
| Font heading | Playfair Display | Titres |
| Font body | Poppins | Corps de texte |

## ⚙️ Installation

```bash
# Cloner le projet
git clone <repo-url>
cd uam-commerce

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Remplir les variables Supabase, Wave, Orange Money

# Lancer en développement
npm run dev
```

## 🔑 Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Wave
WAVE_API_KEY=
WAVE_MERCHANT_ID=

# Orange Money
ORANGE_MONEY_CLIENT_ID=
ORANGE_MONEY_CLIENT_SECRET=
```

## 📁 Structure du projet

```
uam-commerce/
├── app/                    # App Router Next.js
│   ├── (apps)/             # Pages publiques & utilisateur
│   ├── api/                # Routes API (Hono)
│   └── auth/               # Pages d'authentification
├── components/             # Composants réutilisables
│   ├── common/             # Navbar, Footer, Layouts
│   ├── shared/             # ProductCard, etc.
│   └── ui/                 # Composants UI de base
├── screens/                # Écrans complets
│   ├── home/               # Widgets page d'accueil
│   ├── auth/               # Formulaires auth
│   └── cart/               # Panier & paiement
├── db/                     # Schéma Drizzle ORM
├── features/               # Hooks React Query
└── lib/                    # Utilitaires, Supabase, Zustand
```

## 📄 Licence

© 2025 UAM Commerce. Tous droits réservés.
