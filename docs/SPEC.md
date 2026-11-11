# StationPro — Spécification partagée (contrat d'équipe)

> Document de référence pour TOUS les agents. Toute décision qui le contredit doit être validée par le coordinateur.
> Objectif utilisateur : reproduire **à l'identique** (couleurs, textes, libellés, ordre, icônes, espacements, hiérarchie) les 7 captures de `docs/captures/`, en application web **mobile-first responsive** (320 px → 1920 px), fonctionnelle de bout en bout. Ne rien réinventer ; améliorer **uniquement** quand c'est nécessaire (responsive, accessibilité, états manquants, cohérence entre écrans).
> Phase 1 : serveur local (Vite) + données locales persistées. Phase 2 : Supabase + GitHub + Vercel → la couche `services/` doit être remplaçable sans toucher aux pages.

## 1. Captures (lire chaque image avec l'outil de lecture de fichier)

| Fichier | Contenu |
|---|---|
| `docs/captures/01-staff-mobile-login-pompiste.jpg` | Mobile personnel : (a) Espace Personnel – choix du poste, (b) Connexion code PIN, (c) Accueil Pompiste mobile |
| `docs/captures/02-desktop-caissiere-boutique.jpg` | Desktop : Caisse Boutique (Caissière) |
| `docs/captures/03-desktop-chef-de-poste.jpg` | Desktop : Tableau de bord Chef de Poste |
| `docs/captures/04-client-mobile-ma-station-reservation-mobile-money.jpg` | Mobile client : (a) Accueil « Ma station » + produits disponibles, (b) Réserver un produit, (c) Paiement Mobile Money / Réservation confirmée |
| `docs/captures/05-client-mobile-accueil-station-reservation-qr.jpg` | Mobile client : (a) Accueil « Ma position » + Que recherchez-vous ?, (b) Détails de la station, (c) Réserver un produit + QR de réservation |
| `docs/captures/06-desktop-pompiste.jpg` | Desktop : Accueil Pompiste |
| `docs/captures/07-desktop-chef-de-piste.jpg` | Desktop : Tableau de bord Chef de Piste |

## 2. Stack & environnement

- Vite + React 18 + **TypeScript strict** + Tailwind CSS v3 + React Router v6 (data router) + `lucide-react` + `@fontsource/poppins` (titres, logo) + `@fontsource/inter` (texte) + `qrcode` (génération de vrais QR codes SVG).
- Windows / PowerShell : `npm.ps1` est bloqué → **toujours `npm.cmd` / `npx.cmd`**. Le chemin du projet contient des espaces : mettre les chemins entre guillemets.
- Un seul serveur de dev, lancé par `foundation` : `npm.cmd run dev -- --host --port 5173` (http://localhost:5173, accessible sur le réseau local pour tester sur téléphone). Ne pas en lancer d'autres sur 5173.
- Contrôle qualité : `npx.cmd tsc --noEmit -p tsconfig.app.json` et `npm.cmd run lint` doivent être propres sur vos fichiers.
- **Ne pas faire de commit git** sauf demande explicite du coordinateur.

## 3. Règles qualité (non négociables — règles utilisateur)

WCAG 2.2 AA · HTML sémantique (`button`, `nav`, `main`, `header`, titres hiérarchisés) · focus-visible fort contraste · cibles tactiles ≥ 44 px · navigation clavier complète, focus trap dans modales/tiroirs + restauration du focus · `aria-live` pour retours asynchrones · `prefers-reduced-motion` · transitions 150–250 ms · zéro `TODO`, zéro `href="#"`, zéro bouton muet, zéro `any`, zéro `@ts-ignore`/`eslint-disable` · unions discriminées pour les états · confirmation avant toute action irréversible · double-soumission verrouillée · aucune donnée sensible en console/URL · pas de débordement horizontal de 320 px à 1920 px.
Mode démo : les données sont locales ; l'indiquer **discrètement** (ex. mention dans Profil/Paramètres et texte d'aide « Mode démo » sous le formulaire PIN), sans dégrader la maquette. Ne jamais simuler silencieusement un paiement réel : Mobile Money = « paiement simulé (démo) » dans la couche service.

## 4. Design tokens (relevés sur les captures — `foundation` les centralise dans `tailwind.config.ts` + `src/styles/index.css`)

| Token | Valeur indicative | Usage |
|---|---|---|
| `navy-900` | `#0A2A66` | bas du dégradé sidebar, textes très forts |
| `navy-800` | `#0B3A85` | en-têtes de sections (« État des pompes », « Panier »…), barre d'app mobile, boutons « Voir mes réservations » / « Réserver maintenant » |
| `navy-700` | `#0F4BA8` | haut du dégradé sidebar / header |
| `brand-600` | `#1565E0` | bleu primaire (icônes, liens, bouton « Mobile Money », onglet actif bottom-nav) |
| `brand-100` / `brand-50` | `#DCE8FB` / `#EEF4FD` | encadrés d'info (« Votre réservation est valable… »), fond de page |
| `accent-400→500` | `#FFC72C → #F5A700` | bouton jaune dégradé (« Se connecter », « Confirmer la réservation »), item actif sidebar (`#F9BE1E` plein), « Pro » du logo |
| `success-600` / `success-100` | `#1E9E46` / `#E2F5E7` | pastilles « Disponible », « En service », « Stock OK », textes verts |
| `danger-600` | `#E5392F` | « Stock faible », triangle d'alerte, badges de notification |
| `ink-900` / `ink-600` / `ink-400` | `#0F1C3A` / `#4A5A78` / `#8A97AD` | texte principal / secondaire / tertiaire |
| `line` | `#D8E3F3` | bordures des cartes |
| Rayons | cartes 12–14 px, tuiles 10–12 px, pilules 999 px, bouton jaune 14 px | |
| Ombres | douces, bleutées (`0 2px 8px rgba(15,60,140,.08)`) | |

Typo : titres Poppins 600/700 ; texte Inter 400/500/600 ; logo « Station » blanc + « Pro » jaune, Poppins 700 ; slogan « Gérer • Servir • Performer » (personnel) / « Vérifiez • Réservez • Payez » (client).

## 5. Architecture & propriété des fichiers (UN propriétaire par fichier)

```
src/
  main.tsx, app/ (router.tsx, providers)            → foundation
  styles/, types/, data/ (seed fixtures), services/, store/, hooks/, lib/  → foundation
  components/ui/ (primitives), components/layout/   → foundation
  config/assets.ts + public/assets/**               → assets
  features/client/**                                → client
  features/staff/auth/**, features/staff/pompiste/**,
  features/staff/shared/{settings,alerts,incidents}/** → staff
  features/staff/caissiere/**, rayonniste/**, agent-comptoir/**,
  features/staff/shared/{products,boutique-stock}/**   → boutique
  features/staff/chef-de-piste/**, chef-de-poste/**, gerant/**,
  features/staff/shared/{reports,team,pumps,fuel-stock}/** → managers
```
`foundation` crée dans `router.tsx` **toutes** les routes ci-dessous en pointant vers des fichiers de page (stubs temporaires) dans les dossiers des propriétaires ; chaque propriétaire remplace ensuite ses stubs. Besoin d'une primitive UI ou d'une action de service manquante → demander à `@foundation` sur le tableau (ou créer un composant local dans son propre dossier).

## 6. Routes (lazy-loaded)

**Client** (layout `ClientLayout` : barre bleue marine en haut sur sous-pages, bottom-nav 5 onglets sur mobile ; sur ≥ 1024 px, contenu centré max ~ 480–560 px façon app OU mise en page élargie à 2 colonnes — garder le look mobile)
| Route | Écran |
|---|---|
| `/` | Accueil. Si aucune station choisie : carte « Ma position » + « Que recherchez-vous ? » (grille 3×3) + « Trouver une station près de moi » (capture 05a). Si une station est choisie (« Ma station ») : carte « Ma station » + « Produits disponibles » (capture 04a). Le chevron de la carte permet de basculer/choisir. |
| `/stations` (`?produit=<slug>`) | Liste des stations (filtrable par produit, distance) |
| `/stations/:stationId` | Détails de la station (05b), cœur = favori |
| `/stations/:stationId/reserver/:productId` | Réserver un produit (04b/05c). « Payer sur place » → réservation créée, carte « Votre QR Code de réservation » affichée (05c). « Mobile Money » → `/reservations/:id/paiement` |
| `/reservations/:id/paiement` | Paiement Mobile Money / Réservation confirmée + compte à rebours (04c) |
| `/reservations`, `/reservations/:id` | Mes réservations (liste, détail, annulation avec confirmation) |
| `/qr` | Mes QR (QR des réservations actives) |
| `/notifications` | Notifications client (cloche, badge) |
| `/profil` | Profil (+ lien « Espace personnel » vers `/personnel`, mention mode démo) |

Bottom-nav client unifiée (les captures montrent deux variantes) : **Accueil · Stations · Mes réservations · Mes QR · Profil**.

**Personnel** (layout `StaffLayout` : sidebar dégradé marine + illustration ville en bas + bouton « Déconnexion » sur ≥ 1024 px ; sur mobile : barre marine avec ☰ (tiroir = menu sidebar) · « StationPro » · cloche à badge, et bottom-nav « Accueil · Transactions · Rapports · Profil » (capture 01c))
| Route | Écran |
|---|---|
| `/personnel` | Espace Personnel – Choisissez votre poste (01a) |
| `/personnel/connexion/:role` | Connexion code PIN 4 chiffres + Scanner votre badge (01b) |
| `/personnel/:role` | Tableau de bord du rôle (mobile 01c ; desktop 06 / 07 / 02 / 03) |
| `/personnel/:role/:section` | Sous-pages de la sidebar du rôle (voir §7) |

Rôles (slug → libellé capture → sous-titre) : `pompiste` Pompiste / Service sur la piste · `chef-de-piste` Chef de Piste / Supervision piste · `caissiere` Caissière de Boutique / Encaissement boutique · `rayonniste` Rayonniste / Gestion des rayons · `agent-comptoir` Agent de Comptoir / Restauration / Café · `chef-de-poste` Chef de Poste / Gestion de l'équipe · `gerant` Gérant / Direction de la station.
Routes personnel protégées : session requise et rôle = `:role`, sinon redirection vers `/personnel/connexion/:role`.

## 7. Menus sidebar par rôle (texte EXACT des captures ; rôles non capturés : dérivés cohérents)

- **pompiste** (06) : Accueil · Piste · Encaissement · Stock & Niveaux · Rapports · Paramètres
- **chef-de-piste** (07) : Tableau de bord · Pistes & Pompes · Équipe · Stocks & Produits · Rapports · Alertes (badge) · Paramètres
- **caissiere** (02) : Caisse Boutique · Produits · Stocks · Rapports · Alertes (badge) · Paramètres
- **chef-de-poste** (03) : Tableau de bord · Équipe · Pistes & Pompes · Stocks · Rapports · Incidents · Paramètres
- **rayonniste** (dérivé) : Tableau de bord · Rayons · Stocks · Réassort · Alertes · Paramètres
- **agent-comptoir** (dérivé) : Comptoir Café · Commandes · Produits · Rapports · Paramètres
- **gerant** (dérivé) : Tableau de bord · Équipe · Pistes & Pompes · Stocks · Finances · Rapports · Incidents · Paramètres

## 8. Modèle de données & connectivité (owner : foundation)

Entités typées (`src/types`) : `Station`, `Product` (+ catégorie, image, unité), `StationProduct` (dispo, prix, stock), `Pump` (n°, carburant, statut), `Tank` (cuve, niveau %), `Employee` (rôle, nom, avatar, statut, PIN haché/démo), `FuelTransaction` (heure, pompe, produit, litres, mode de paiement, statut), `BoutiqueSale` (n° VTE-AAAAMMJJ-NNN, lignes, total, paiement, ticket TKT-…), `Reservation` (code STP-AAAAMMJJ-NNN, produit, quantité, station, mode de paiement, statut `pending|awaiting_payment|paid|collected|expired|cancelled`, expiresAt = +30 min), `Alert`/`Incident`, `Notification`, `Shift` (poste, clôture).

Couche `services/` : interfaces asynchrones (Promise) + adaptateur local (`localStorage` + seed `src/data/fixtures`) + synchronisation multi-onglets (`storage` event / `BroadcastChannel`). Phase 2 : adaptateur Supabase avec la même interface.

Flux connectés obligatoires (à tester par les vérificateurs) :
1. Client réserve → la réservation apparaît dans Mes réservations / Mes QR, notifie le personnel (alertes caissière/chef de piste) ; le personnel valide le QR (scan ou saisie du code) → statut `paid/collected` côté client ; expiration automatique à 30 min.
2. Caissière : ajouter au panier → quantités ± → total → Espèces / Mobile Money → « Paiement confirmé ! » + QR ticket → vente dans « Ventes récentes » → stock boutique décrémenté → « Alertes Stock » recalculées.
3. Pompiste : servir un client (pompe, produit, litres, paiement) → « Dernières transactions » + ventes du jour des managers ; signaler une anomalie → incident visible chez Chef de Piste / Chef de Poste / Gérant ; changement de statut d'une pompe → reflété partout (6/6 → 5/6, « Disponible » → « En maintenance »).
4. Disponibilités produits/stations gérées par le personnel → reflétées côté client (pastilles « Disponible » / « Rupture »).
5. Badges de notification (cloche, Alertes) = nombre réel d'éléments non lus.

## 9. Assets (owner : assets) — chemins EXACTS, référencés via `src/config/assets.ts`

```
public/assets/brand/logo-mark.svg            flamme orange/jaune + goutte bleue (logo)
public/assets/scenes/client-hero.webp        station-service 3D + ville, ciel bleu (05a/04a)
public/assets/scenes/station-front.webp      station avec auvent bleu « StationPro » (05b)
public/assets/scenes/staff-hero.webp         station + ville + arbres (01a)
public/assets/scenes/header-station.webp     station (en-tête dashboards 03/06/07, fondu vers la gauche)
public/assets/scenes/boutique-front.webp     façade « Boutique » (en-tête 02)
public/assets/scenes/sidebar-city.webp       ville + route + arbres, teinte bleue (bas de sidebar)
public/assets/scenes/sidebar-boutique.webp   boutique + ville (bas sidebar caissière)
public/assets/avatars/{pompiste,chef-de-piste,caissiere,rayonniste,agent-comptoir,chef-de-poste,gerant}.webp
public/assets/avatars/team-{1..6}.webp       membres d'équipe (pompistes hommes, caissière, agent femme…)
public/assets/products/{gaz-butane,gazoil,super,essence,huile-moteur,lave-glace,gaz-industriel,graisse,eau-minerale,snacks,boissons,eau-50cl,jus-naturel,coca-cola,jus-tropical,chips,chocolat,biscuits,huile,lubrifiant,cafe}.webp
public/assets/icons/{pump,fuel-drop,barrel,gas-bottle,coins,cube}.webp
```
Tant qu'un asset manque, les composants doivent afficher un fond neutre de mêmes dimensions (pas d'icône cassée) — `aspect-ratio` réservé pour CLS nul.

