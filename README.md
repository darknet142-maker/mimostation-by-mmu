# StationPro — Gérer • Servir • Performer ⛽📱💻

> Application web moderne, responsive (Mobile-First & Desktop Dashboard) pour la gestion opérationnelle et la réservation client de stations-services.

---

## 🌟 Présentation du Projet

**StationPro** est une plateforme complète conçue pour digitaliser l'expérience client et fluidifier l'exploitation opérationnelle des stations-services :
- **Espace Client Mobile-First & Desktop** : Géolocalisation, consultation en temps réel des carburants et produits boutique, réservation avec compte à rebours (30 min), génération de QR Code de retrait, mode de paiement sur place ou Mobile Money (Airtel Money / Moov Money), et recherche visuelle accessible avec pictogrammes 3D pour usagers analphabètes.
- **Moteur d'Alternatives Inter-Stations** : Lorsqu'un client consulte un produit, la station sélectionnée est mise en avant avec son stock en temps réel, et les stations environnantes disposant du même produit sont suggérées avec leur distance kilométrique et un commutateur en 1 clic.
- **Espace Personnel Multi-Rôles** : Accès sécurisé par code PIN à 4 chiffres ou scan de badge avec interfaces dédiées pour chaque corps de métier :
  - **Pompiste** : Suivi des 6 pompes, enregistrement rapide des services et paiements (espèces, carte, Mobile Money), signalement d'anomalies.
  - **Chef de Piste** : Supervision de l'état des pompes, alertes cuves en direct, suivi d'équipe de piste et ventes horaires.
  - **Caissière de Boutique** : Caisse tactile POS avec catalogue 3D, lecteur code-barres, panier interactif, encaissement espèces / Mobile Money, alertes rupture de stock et tickets horodatés.
  - **Chef de Poste** : Vue synthétique opérationnelle, suivi d'équipe en service, répartition des ventes par produit (graphique camembert), performance journalière (+12%) et clôture de poste.
  - **Rayonniste & Agent de Comptoir** : Gestion dédiée aux rayons boutique et espaces café / restauration.
  - **Gérant de Station** : Pilotage multi-stations (Station Liberté, Station Akanda, Station Owendo Port), catalogue produits & gestion des stocks, gestion RH des équipes (recrutement, statuts, PIN), et **Registre d'Audit Immuable** certifié avec empreinte SHA-256 horodatée infalsifiable à vie.

---

## 🎨 Design & Expérience Utilisateur

- **Direction Artistique** : Palette corporate pétrolière premium (Bleu Marine `#0B3A82`, Bleu Royal `#1668E3`, Jaune Énergie `#F7B928`, Vert Opérationnel `#10B981`).
- **Responsive Intégral** :
  - **Mobile (< 1024px)** : Navigation tactile ergonomique, barre de recherche intelligente flottante au-dessus du menu inférieur, cartes compactes et bottom sheets.
  - **Desktop (≥ 1024px)** : Layout panoramique multi-colonnes, barre latérale permanente avec raccourcis métiers, horloge temps réel synchronisée et KPI visuels.
- **Accessibilité WCAG 2.2 AA** : Contrastes vérifiés, navigation complète au clavier, annonces dynamiques, zones de toucher ≥ 44x44px.

---

## 🛠️ Stack Technique

- **Framework** : React 18 + TypeScript strict mode
- **Bundler & Outillage** : Vite 5
- **Routage** : React Router v6 (Data Router avec `RouterProvider`)
- **Styles** : Tailwind CSS 3 + PostCSS + Autoprefixer
- **Typographie** : Polices Inter & Poppins auto-hébergées via `@fontsource`
- **Iconographie & Visuels** : Lucide React + Renders 3D haute fidélité
- **Génération QR Code** : `qrcode` Canvas optimisé
- **State Management & Persistance** : Store réactif en mémoire avec synchronisation `localStorage` défensive (`stationpro_state_v3`) et tolérance de panne avec `ErrorBoundary`.

---

## 🚀 Installation & Démarrage Local

### Prérequis
- Node.js (version 18 ou supérieure recommandée)
- npm ou pnpm

### Commandes

```bash
# 1. Cloner le dépôt
git clone https://github.com/darknet142-maker/mimostation-by-mmu.git
cd mimostation-by-mmu

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement local
npm run dev

# 4. Vérifier les types TypeScript
npm run typecheck

# 5. Compiler pour la production
npm run build
```

Le serveur local démarre par défaut sur `http://localhost:5173/`.

---

## 📁 Architecture du Code

```text
src/
├── app/                  # Configuration du routeur et routes
├── components/           # Composants UI réutilisables & layout
│   ├── client/           # Composants dédiés au parcours client (SmartSearchBar, AlternativesModal)
│   ├── layout/           # ClientLayout, StaffLayout (Desktop Sidebar + Mobile Drawer)
│   └── ui/               # Primitives UI (Button, Modal, StatusPill, PinInput, ErrorBoundary...)
├── config/               # Constantes, tokens visuels et chemins d'assets
├── data/                 # Fixtures réalistes (stations, produits, pompes, équipes, logs audit)
├── features/             # Pages fonctionnelles découpées par domaine
│   ├── client/           # Accueil, Stations, Réservation, Paiement Mobile Money, QR, Profil
│   └── staff/            # Authentification PIN & Dashboards (Pompiste, Caissière, Chef de Poste, Gérant...)
├── hooks/                # Hooks personnalisés (useAppStore)
├── services/             # Store global réactif, fonctions CRUD, moteur d'audit SHA-256
├── styles/               # Directives Tailwind CSS & variables globales
└── types/                # Types TypeScript stricts
```

---

## 🔒 Sécurité & Traçabilité

Toute opération de création, modification ou suppression de stock ou de collaborateur génère automatiquement une entrée dans le journal d'audit :
- Horodatage certifié (Jour / Mois / Année Heure : Minute : Seconde)
- Identité de l'auteur et station concernée
- Empreinte cryptographique de contrôle SHA-256 non altérable
- Historique ineffaçable consultable par filtre de date ou mot-clé

---

## 📄 Licence

Propriété de **StationPro** / MIMOSTATION. Tous droits réservés.

