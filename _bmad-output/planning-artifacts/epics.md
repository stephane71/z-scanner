---
stepsCompleted: [1, 2, 3, 4]
workflowStatus: complete
completedAt: '2026-01-15'
totalEpics: 6
totalStories: 33
frCoverage: 36/36
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# Z-Scanner - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Z-Scanner, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Account & Authentication (FR-AUTH)**
- FR1: L'utilisateur peut créer un compte avec email et mot de passe
- FR2: L'utilisateur peut se connecter à son compte existant
- FR3: L'utilisateur peut réinitialiser son mot de passe oublié
- FR4: L'utilisateur peut se déconnecter de son compte

**Ticket Capture (FR-CAP)**
- FR5: L'utilisateur peut capturer un ticket Z via la caméra du téléphone
- FR6: Le système peut extraire automatiquement les données du ticket via OCR
- FR7: L'utilisateur peut voir les valeurs extraites par l'OCR pour vérification
- FR8: L'utilisateur peut saisir manuellement les données d'un ticket
- FR9: L'utilisateur peut modifier les valeurs extraites avant validation (édition inline)
- FR10: Le système peut détecter et signaler un échec de lecture OCR

**Ticket Validation & Compliance (FR-VAL)**
- FR11: L'utilisateur peut valider un ticket en 1 clic
- FR12: Le système rend les données d'un ticket validé immutables
- FR13: Le système archive la photo originale du ticket avec les données
- FR14: Le système horodate cryptographiquement chaque validation
- FR15: L'utilisateur peut annuler un ticket validé (sans le modifier)
- FR16: Le système conserve les tickets annulés visibles dans l'historique avec statut "Annulé"

**Ticket Management (FR-MAN)**
- FR17: L'utilisateur peut consulter la liste de tous ses tickets
- FR18: L'utilisateur peut filtrer ses tickets par date
- FR19: L'utilisateur peut filtrer ses tickets par marché/lieu
- FR20: L'utilisateur peut voir le détail complet d'un ticket
- FR21: L'utilisateur peut associer un ticket à un marché/point de vente
- FR22: L'utilisateur peut créer et gérer ses marchés/points de vente

**Export & Sharing (FR-EXP)**
- FR23: L'utilisateur peut exporter ses tickets au format CSV
- FR24: L'utilisateur peut sélectionner une période pour l'export
- FR25: L'utilisateur peut télécharger un fichier d'export

**Dashboard & Analytics (FR-DASH)**
- FR26: L'utilisateur peut voir un récapitulatif de son activité (dashboard)
- FR27: L'utilisateur peut voir le total de ses ventes par période
- FR28: L'utilisateur peut voir le total de ses ventes par marché
- FR29: L'utilisateur peut voir son historique de tickets permanent

**Offline & Sync (FR-OFF)**
- FR30: L'utilisateur peut utiliser l'OCR sans connexion internet
- FR31: L'utilisateur peut valider un ticket sans connexion internet
- FR32: Le système indique visuellement les tickets non synchronisés
- FR33: Le système synchronise automatiquement les données quand la connexion revient
- FR34: L'utilisateur peut installer l'app sur son écran d'accueil (PWA)

**Landing Page (FR-LAND)**
- FR35: Le visiteur peut consulter une landing page publique présentant le produit
- FR36: Le visiteur peut s'inscrire depuis la landing page

### NonFunctional Requirements

**Performance (NFR-P)**
- NFR-P1: Capture caméra → résultat OCR en <5 secondes
- NFR-P2: Temps de validation ticket <1 seconde
- NFR-P3: Chargement dashboard <3 secondes
- NFR-P4: Application utilisable sur connexion 3G

**Security & Compliance (NFR-S)**
- NFR-S1: Données chiffrées en transit (HTTPS)
- NFR-S2: Données chiffrées au repos (cloud storage)
- NFR-S3: Authentification sécurisée (hachage mot de passe)
- NFR-S4: Données immutables après validation (aucune modification possible)
- NFR-S5: Conservation des données 6 ans minimum
- NFR-S6: Horodatage cryptographique vérifiable

**Reliability (NFR-R)**
- NFR-R1: Mode offline fonctionne sans dégradation des features core
- NFR-R2: Synchronisation automatique avec taux de succès >99%
- NFR-R3: Aucune perte de données en cas de crash ou fermeture app
- NFR-R4: Photos tickets archivées avec redondance

**Scalability (NFR-SC)**
- NFR-SC1: Architecture supportant 1,000 utilisateurs sans refonte
- NFR-SC2: Stockage photos scalable (cloud storage)

### Additional Requirements

**From Architecture Document:**
- Starter template initialization: create-next-app + Serwist + Supabase (modular approach)
- Technology stack: Next.js 16.1.1, React 19, TypeScript strict, Tailwind CSS 4.x
- Supabase setup: PostgreSQL database, Auth, Storage buckets, Row Level Security
- Serwist 9.5.0 Service Worker: precaching, runtime caching, background sync
- Dexie.js 4.x: IndexedDB schema with migrations, useLiveQuery hooks
- NF525 compliance: append-only tables, SHA-256 hash (@noble/hashes), 6-year retention
- OCR engine: Tesseract.js for local processing
- Auth: JWT 30 days duration, 7-day offline grace period
- Sync: Queue-based with 5 retries, exponential backoff (1s→16s)
- Image optimization: WebP 80% (~100KB) + thumbnail 60% (~10KB)
- API: Next.js API Routes exclusively (no direct Supabase client from frontend)
- Monitoring: Sentry error tracking + Vercel Analytics

**From UX Design Document:**
- Touch targets: 48px minimum, primary buttons 64-80px
- One-handed mobile use: bottom-anchored actions, thumb zone
- Direct to scanner: app launch goes directly to camera (no onboarding screens)
- Validation feedback: checkmark animation + haptic vibration + "Conforme NF525" message
- Badge NF525: visible on all validated tickets
- Auto-return: return to camera 2 seconds after validation
- Design system: Tailwind CSS 4 + shadcn/ui components
- Color tokens: primary green (#16A34A), trust blue (#1D4ED8), danger red (#DC2626)
- Typography: Inter font, 16px base, 36px hero (total amount)
- Accessibility: WCAG 2.1 AA minimum, AAA for contrast (7:1 ratio)
- States: empty states with illustration, offline indicator in header
- Form patterns: labels above inputs, inline validation, errors in red below field

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | Création compte email/password |
| FR2 | Epic 2 | Connexion compte existant |
| FR3 | Epic 2 | Réinitialisation mot de passe |
| FR4 | Epic 2 | Déconnexion |
| FR5 | Epic 3 | Capture caméra ticket Z |
| FR6 | Epic 3 | Extraction OCR automatique |
| FR7 | Epic 3 | Affichage valeurs OCR pour vérification |
| FR8 | Epic 3 | Saisie manuelle fallback |
| FR9 | Epic 3 | Édition inline avant validation |
| FR10 | Epic 3 | Détection échec OCR |
| FR11 | Epic 3 | Validation 1-click |
| FR12 | Epic 3 | Immutabilité post-validation |
| FR13 | Epic 3 | Archivage photo originale |
| FR14 | Epic 3 | Horodatage cryptographique |
| FR15 | Epic 4 | Annulation ticket validé |
| FR16 | Epic 4 | Conservation tickets annulés avec statut |
| FR17 | Epic 4 | Liste tous les tickets |
| FR18 | Epic 4 | Filtre par date |
| FR19 | Epic 4 | Filtre par marché/lieu |
| FR20 | Epic 4 | Détail complet ticket |
| FR21 | Epic 4 | Association ticket → marché |
| FR22 | Epic 4 | CRUD marchés/points de vente |
| FR23 | Epic 5 | Export CSV |
| FR24 | Epic 5 | Sélection période export |
| FR25 | Epic 5 | Téléchargement fichier |
| FR26 | Epic 6 | Récapitulatif activité dashboard |
| FR27 | Epic 6 | Total ventes par période |
| FR28 | Epic 6 | Total ventes par marché |
| FR29 | Epic 6 | Historique permanent |
| FR30 | Epic 3 | OCR offline |
| FR31 | Epic 3 | Validation offline |
| FR32 | Epic 3 | Indicateur sync visuel |
| FR33 | Epic 3 | Sync automatique |
| FR34 | Epic 1 | Installation PWA |
| FR35 | Epic 1 | Landing page publique |
| FR36 | Epic 1 | Inscription depuis landing |

## Epic List

### Epic 1: Fondation Projet & Landing Page
Permet aux utilisateurs de découvrir Z-Scanner et installer l'app sur leur écran d'accueil.
**FRs couverts:** FR34, FR35, FR36
**Implementation notes:** Project initialization (create-next-app + Serwist + Supabase), PWA manifest, landing page SEO-optimized with SSR.

### Epic 2: Authentification Utilisateur
Permet aux utilisateurs de créer un compte et accéder à leurs données personnelles en toute sécurité.
**FRs couverts:** FR1, FR2, FR3, FR4
**Implementation notes:** Supabase Auth (email/password), JWT 30 days, 7-day offline grace period, RLS policies.

### Epic 3: Scan & Validation (Core Flow + Offline)
Permet aux utilisateurs de scanner, vérifier et valider un ticket Z en moins de 2 minutes, même sans connexion internet. C'est le coeur de la valeur produit.
**FRs couverts:** FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR30, FR31, FR32, FR33
**Implementation notes:** Tesseract.js OCR, Dexie.js local storage, sync queue, NF525 compliance (append-only, SHA-256, crypto timestamp), WebP compression, validation feedback (animation + haptic).

### Epic 4: Gestion des Tickets & Marchés
Permet aux utilisateurs de consulter leur historique, filtrer, organiser leurs tickets et gérer leurs points de vente.
**FRs couverts:** FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22
**Implementation notes:** useLiveQuery for reactive lists, annulation workflow NF525 compliant, CRUD marchés.

### Epic 5: Export Comptable
Permet aux utilisateurs d'exporter leurs données au format CSV pour le comptable.
**FRs couverts:** FR23, FR24, FR25
**Implementation notes:** CSV generation, date range picker, file download.

### Epic 6: Dashboard & Insights
Permet aux utilisateurs de visualiser leur activité commerciale et prendre de meilleures décisions business.
**FRs couverts:** FR26, FR27, FR28, FR29
**Implementation notes:** Aggregation queries via useLiveQuery, responsive charts optional post-MVP.

---

## Epic 1: Fondation Projet & Landing Page

Permet aux utilisateurs de découvrir Z-Scanner et installer l'app sur leur écran d'accueil.

### Story 1.1: Project Initialization & PWA Setup

As a **developer**,
I want **to initialize the project with Next.js 16, Tailwind CSS 4, and PWA configuration**,
So that **the technical foundation is ready for feature development**.

**Acceptance Criteria:**

**Given** a fresh development environment
**When** the initialization scripts are run
**Then** a Next.js 16.1.1 project is created with TypeScript strict mode
**And** Tailwind CSS 4.x is configured with CSS-first @theme
**And** shadcn/ui is initialized with Button and Card components
**And** Serwist 9.5.0 is configured for Service Worker
**And** PWA manifest includes app name, icons (192px, 512px), and standalone mode
**And** the app can be installed on mobile home screen (FR34)
**And** `npm run dev` starts without errors

### Story 1.2: Supabase Backend Setup

As a **developer**,
I want **to configure Supabase with database, auth, and storage**,
So that **the backend infrastructure is ready for user data**.

**Acceptance Criteria:**

**Given** a Supabase project is created
**When** the configuration is applied
**Then** PostgreSQL database is accessible via Supabase client
**And** Supabase Auth is configured for email/password
**And** Storage bucket "ticket-photos" is created with private access
**And** Environment variables are set in .env.local
**And** @supabase/supabase-js and @supabase/ssr are installed
**And** lib/supabase/client.ts exports browser client
**And** lib/supabase/server.ts exports server client

### Story 1.3: Landing Page (Public)

As a **visitor**,
I want **to see a landing page presenting Z-Scanner's value proposition**,
So that **I understand what the app does and can decide to register** (FR35).

**Acceptance Criteria:**

**Given** a visitor navigates to the root URL
**When** the landing page loads
**Then** the page renders with SSR (SEO optimized)
**And** the value proposition is clearly displayed ("Scanne ton ticket Z, valide en 1 tap, c'est conforme")
**And** a "Commencer" CTA button is visible
**And** the page meets Core Web Vitals (LCP < 2.5s)
**And** meta tags and Open Graph are configured
**And** the page is responsive (mobile-first, max-width ~480px)

### Story 1.4: Registration from Landing

As a **visitor**,
I want **to register for an account directly from the landing page**,
So that **I can start using Z-Scanner immediately** (FR36).

**Acceptance Criteria:**

**Given** I am on the landing page
**When** I click "Commencer" or "S'inscrire"
**Then** I am navigated to /register
**And** a registration form is displayed with email and password fields
**And** form validation shows errors inline (labels above, errors below)
**And** on successful registration, my account is created in Supabase Auth
**And** I am redirected to the main app (/scan)

---

## Epic 2: Authentification Utilisateur

Permet aux utilisateurs de créer un compte et accéder à leurs données personnelles en toute sécurité.

### Story 2.1: User Login

As a **registered user**,
I want **to log in to my account with email and password**,
So that **I can access my personal ticket data** (FR2).

**Acceptance Criteria:**

**Given** I am on the /login page
**When** I enter valid email and password and submit
**Then** I am authenticated via Supabase Auth
**And** my JWT token is stored (30 days duration)
**And** I am redirected to /scan (direct to scanner per UX spec)
**And** my auth state persists across page refreshes

**Given** I enter invalid credentials
**When** I submit the form
**Then** an error message is displayed inline
**And** I remain on the login page

### Story 2.2: User Registration (Full Flow)

As a **new user**,
I want **to create an account with email and password**,
So that **I can start using Z-Scanner** (FR1).

**Acceptance Criteria:**

**Given** I am on the /register page
**When** I enter a valid email and password (min 8 chars)
**Then** my account is created in Supabase Auth
**And** I am automatically logged in
**And** I am redirected to /scan

**Given** I enter an email already in use
**When** I submit the form
**Then** an error message indicates the email is taken

**Given** I enter an invalid email format or weak password
**When** I try to submit
**Then** inline validation errors are shown below the fields

### Story 2.3: Password Reset

As a **user who forgot their password**,
I want **to reset my password via email**,
So that **I can regain access to my account** (FR3).

**Acceptance Criteria:**

**Given** I am on the /login page
**When** I click "Mot de passe oublié?"
**Then** I am navigated to /reset-password

**Given** I enter my registered email on /reset-password
**When** I submit the form
**Then** a password reset email is sent via Supabase Auth
**And** a confirmation message is displayed

**Given** I click the reset link in the email
**When** I enter a new password
**Then** my password is updated
**And** I am redirected to /login with a success message

### Story 2.4: User Logout

As a **logged-in user**,
I want **to log out of my account**,
So that **I can secure my data on shared devices** (FR4).

**Acceptance Criteria:**

**Given** I am logged in and on the /settings page
**When** I tap the "Déconnexion" button
**Then** my session is terminated via Supabase Auth
**And** my local JWT token is cleared
**And** I am redirected to the landing page (/)
**And** I cannot access protected routes without logging in again

### Story 2.5: Auth Middleware & Protected Routes

As a **developer**,
I want **to protect app routes and handle auth state**,
So that **only authenticated users can access the main app**.

**Acceptance Criteria:**

**Given** I am not logged in
**When** I try to access /scan, /tickets, /export, or /settings
**Then** I am redirected to /login

**Given** I am logged in
**When** I navigate to auth routes (/login, /register)
**Then** I am redirected to /scan

**Given** my JWT token expires while offline
**When** I use the app within the 7-day grace period
**Then** I can still access local data (offline grace per architecture)

---

## Epic 3: Scan & Validation (Core Flow + Offline)

Permet aux utilisateurs de scanner, vérifier et valider un ticket Z en moins de 2 minutes, même sans connexion internet. C'est le coeur de la valeur produit.

### Story 3.1: Local Database Schema (Dexie.js)

As a **developer**,
I want **to set up the local IndexedDB schema with Dexie.js**,
So that **tickets can be stored and queried offline**.

**Acceptance Criteria:**

**Given** Dexie.js 4.x is installed
**When** the database is initialized
**Then** a `tickets` table exists with fields: id, dataHash, date, montantTTC, modeReglement, numeroTicket, userId, marketId, status, createdAt, validatedAt
**And** a `photos` table exists with fields: id, ticketId, blob, thumbnail, createdAt
**And** a `syncQueue` table exists with fields: id, action, entityType, entityId, payload, status, retries, createdAt
**And** a `markets` table exists with fields: id, name, userId, createdAt
**And** migrations are versioned for future schema changes
**And** useLiveQuery hooks work correctly for reactive updates

### Story 3.2: Camera Capture UI

As a **user**,
I want **to capture a photo of my ticket Z using my phone camera**,
So that **I can digitize my sales data** (FR5).

**Acceptance Criteria:**

**Given** I am logged in and on /scan
**When** the page loads
**Then** the camera viewfinder is displayed immediately (direct to scanner per UX)
**And** a dotted guide frame shows where to position the ticket
**And** a capture button (64px, green) is visible in the thumb zone

**Given** I tap the capture button
**When** the photo is taken
**Then** a flash animation confirms capture
**And** the image is compressed to WebP 80% (~100KB)
**And** a thumbnail is generated at WebP 60% (~10KB)
**And** I am navigated to the verification screen

**Given** camera permission is denied
**When** I try to access /scan
**Then** a clear message explains camera is required
**And** a button to retry permission is shown

### Story 3.3: OCR Processing (Tesseract.js)

As a **user**,
I want **the app to automatically extract data from my ticket photo**,
So that **I don't have to type everything manually** (FR6, FR30).

**Acceptance Criteria:**

**Given** I have captured a ticket photo
**When** OCR processing runs
**Then** Tesseract.js processes the image locally (works offline - FR30)
**And** a loading spinner is shown (max 5s per NFR-P1)
**And** extracted fields include: date, total TTC, mode de règlement, numéro ticket

**Given** OCR completes successfully
**When** results are available
**Then** extracted values are displayed on the verification screen
**And** confidence indicators show extraction quality

**Given** OCR fails or produces low-confidence results
**When** the threshold is not met
**Then** a message "Lecture difficile" is displayed (FR10)
**And** the manual entry option is prominently shown

### Story 3.4: Verification Screen

As a **user**,
I want **to see and verify the extracted values before validation**,
So that **I can ensure accuracy** (FR7).

**Acceptance Criteria:**

**Given** OCR processing is complete
**When** the verification screen loads
**Then** the ticket photo thumbnail is displayed
**And** the TOTAL TTC is shown in hero size (36px per UX)
**And** all extracted fields are displayed in editable inputs
**And** the NF525 badge is visible in the header

**Given** I want to correct a value (FR9)
**When** I tap on a field
**Then** I can edit the value inline
**And** validation runs on blur (format checks)

### Story 3.5: Manual Entry Fallback

As a **user**,
I want **to enter ticket data manually when OCR fails**,
So that **I can still digitize damaged or unclear tickets** (FR8).

**Acceptance Criteria:**

**Given** OCR has failed or I choose manual entry
**When** I tap "Saisie manuelle"
**Then** an empty form is displayed with all required fields
**And** fields include: date, montant TTC, mode de règlement, numéro ticket
**And** date picker defaults to today
**And** amount field accepts decimal input (converted to centimes)

**Given** I complete the manual entry form
**When** all required fields are filled
**Then** the VALIDER button becomes active
**And** I can proceed to validation

### Story 3.6: Ticket Validation with NF525 Compliance

As a **user**,
I want **to validate my ticket with one tap**,
So that **my data is securely archived and legally compliant** (FR11, FR12, FR14, FR31).

**Acceptance Criteria:**

**Given** I am on the verification screen with valid data
**When** I tap the VALIDER button (80px green, thumb zone)
**Then** a SHA-256 hash is computed from: date, montantTTC, modeReglement, numeroTicket, userId (@noble/hashes)
**And** a cryptographic timestamp is recorded (client + server time)
**And** the ticket is saved to Dexie with status "validated"
**And** the ticket data becomes immutable (FR12)
**And** validation works offline (FR31)

**Given** validation succeeds
**When** the ticket is saved
**Then** a checkmark animation plays with haptic vibration
**And** the message "Conforme NF525" is displayed
**And** after 2 seconds, I auto-return to the camera (per UX)

### Story 3.7: Photo Archival

As a **user**,
I want **my ticket photos to be archived with the data**,
So that **I have visual proof for tax audits** (FR13).

**Acceptance Criteria:**

**Given** a ticket is validated
**When** the photo is archived
**Then** the original WebP image is stored in Dexie `photos` table
**And** the thumbnail is stored for list display
**And** the photo is linked to the ticket via ticketId
**And** photos are included in the sync queue for cloud backup

### Story 3.8: Sync Queue & Indicator

As a **user**,
I want **to see which tickets are synced and which are pending**,
So that **I know my data is safely backed up** (FR32).

**Acceptance Criteria:**

**Given** a ticket is validated offline
**When** the ticket is saved
**Then** it is added to the syncQueue with status "pending"
**And** a sync indicator shows "Non synchronisé" on the ticket

**Given** I am viewing the app
**When** there are pending sync items
**Then** a subtle indicator in the header shows the count (e.g., "2 en attente")
**And** the indicator is not alarming (per UX: offline is normal)

### Story 3.9: Background Sync Engine

As a **user**,
I want **my data to sync automatically when I'm back online**,
So that **I don't have to think about backups** (FR33).

**Acceptance Criteria:**

**Given** there are items in the syncQueue
**When** network connectivity is restored
**Then** the sync engine processes the queue automatically
**And** tickets metadata syncs before photos (priority per architecture)
**And** each item retries up to 5 times with exponential backoff (1s→2s→4s→8s→16s)

**Given** a sync item succeeds
**When** the server confirms receipt
**Then** the syncQueue item status is updated to "completed"
**And** the ticket's sync indicator is removed

**Given** a sync item fails after 5 retries
**When** all retries are exhausted
**Then** the status is set to "failed"
**And** a toast notification informs the user
**And** manual retry is available in settings

### Story 3.10: App Layout & Bottom Navigation

As a **user**,
I want **to navigate between main app sections easily**,
So that **I can access all features with my thumb**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I view any app page
**Then** a Bottom Tab Bar is visible with 4 tabs: Scanner, Historique, Export, Paramètres
**And** touch targets are 48px minimum
**And** the current tab is highlighted
**And** tapping a tab navigates to that section

---

## Epic 4: Gestion des Tickets & Marchés

Permet aux utilisateurs de consulter leur historique, filtrer, organiser leurs tickets et gérer leurs points de vente.

### Story 4.1: Ticket List (Historique)

As a **user**,
I want **to see a list of all my validated tickets**,
So that **I can review my sales history** (FR17, FR29).

**Acceptance Criteria:**

**Given** I navigate to /tickets (Historique tab)
**When** the page loads
**Then** all my tickets are displayed in a list (most recent first)
**And** each ticket shows: date, montant TTC, marché (if assigned), sync status
**And** the thumbnail photo is visible
**And** the NF525 badge is shown on validated tickets
**And** data loads reactively via useLiveQuery (works offline)

**Given** I have no tickets
**When** the page loads
**Then** an empty state with illustration is shown
**And** a CTA to scan my first ticket is displayed

### Story 4.2: Ticket Detail View

As a **user**,
I want **to see the complete details of a ticket**,
So that **I can verify information or show proof** (FR20).

**Acceptance Criteria:**

**Given** I am on the ticket list
**When** I tap on a ticket
**Then** I navigate to /tickets/[id]
**And** the full-size photo is displayed
**And** all ticket fields are shown: date, montant TTC, mode règlement, numéro ticket
**And** the NF525 badge with timestamp is prominently displayed
**And** the dataHash is visible (for audit purposes)
**And** the market name is shown (if assigned)

### Story 4.3: Filter by Date

As a **user**,
I want **to filter my tickets by date range**,
So that **I can find specific tickets quickly** (FR18).

**Acceptance Criteria:**

**Given** I am on the ticket list
**When** I tap the date filter
**Then** a date range picker appears
**And** I can select start and end dates
**And** quick presets are available: "Cette semaine", "Ce mois", "Ce trimestre"

**Given** I apply a date filter
**When** the filter is active
**Then** only tickets within the date range are displayed
**And** a filter chip shows the active date range
**And** I can clear the filter with one tap

### Story 4.4: Filter by Market

As a **user**,
I want **to filter my tickets by market/location**,
So that **I can see sales per market** (FR19).

**Acceptance Criteria:**

**Given** I am on the ticket list
**When** I tap the market filter
**Then** a list of my markets is displayed
**And** I can select one or multiple markets

**Given** I apply a market filter
**When** the filter is active
**Then** only tickets from selected markets are displayed
**And** a filter chip shows the active market(s)
**And** combined filters (date + market) work correctly

### Story 4.5: Market Management (CRUD)

As a **user**,
I want **to create and manage my markets/points de vente**,
So that **I can organize my tickets by location** (FR22).

**Acceptance Criteria:**

**Given** I navigate to /settings → "Mes marchés"
**When** the page loads
**Then** a list of my existing markets is displayed

**Given** I tap "Ajouter un marché"
**When** the form opens
**Then** I can enter a market name
**And** on save, the market is created in Dexie
**And** it syncs to Supabase when online

**Given** I want to edit a market
**When** I tap on a market name
**Then** I can rename it
**And** changes are saved to Dexie and synced

**Given** I want to delete a market
**When** I tap delete
**Then** a confirmation dialog appears
**And** on confirm, the market is soft-deleted (not removed, per NF525 audit trail)

### Story 4.6: Assign Ticket to Market

As a **user**,
I want **to assign a ticket to a market**,
So that **I can track sales by location** (FR21).

**Acceptance Criteria:**

**Given** I am on the verification screen (before validation)
**When** I tap the market field
**Then** a picker shows my existing markets
**And** I can select a market or leave empty
**And** I can quick-add a new market from this picker

**Given** I validate a ticket with a market assigned
**When** the ticket is saved
**Then** the marketId is stored with the ticket
**And** the ticket appears when filtering by that market

### Story 4.7: Ticket Cancellation (NF525 Compliant)

As a **user**,
I want **to cancel a validated ticket if I made an error**,
So that **I can correct mistakes while maintaining compliance** (FR15, FR16).

**Acceptance Criteria:**

**Given** I am viewing a validated ticket detail
**When** I tap "Annuler ce ticket"
**Then** a confirmation dialog appears
**And** I must enter a cancellation reason (required)

**Given** I confirm the cancellation
**When** the ticket is cancelled
**Then** the ticket status changes to "cancelled" (append-only, not deleted per NF525)
**And** the cancellation timestamp and reason are recorded
**And** the ticket remains visible in history with "Annulé" badge
**And** a new syncQueue entry is created for this action

**Given** I view a cancelled ticket
**When** the detail page loads
**Then** the "Annulé" status is clearly displayed
**And** the cancellation reason and timestamp are shown
**And** no further actions are available on this ticket

---

## Epic 5: Export Comptable

Permet aux utilisateurs d'exporter leurs données au format CSV pour le comptable.

### Story 5.1: Export Page & Period Selection

As a **user**,
I want **to select a date range for exporting my tickets**,
So that **I can prepare data for my accountant** (FR24).

**Acceptance Criteria:**

**Given** I navigate to /export (Export tab)
**When** the page loads
**Then** a date range picker is displayed
**And** quick presets are available: "Ce mois", "Mois dernier", "Ce trimestre", "Trimestre dernier", "Cette année"
**And** custom date range selection is available
**And** the number of tickets in the selected period is shown

**Given** no tickets exist in the selected period
**When** the preview updates
**Then** a message indicates "Aucun ticket pour cette période"
**And** the export button is disabled

### Story 5.2: CSV Export Generation

As a **user**,
I want **to export my tickets as a CSV file**,
So that **my accountant can import them into their software** (FR23).

**Acceptance Criteria:**

**Given** I have selected a valid date range with tickets
**When** I tap "Exporter CSV"
**Then** a CSV file is generated containing all tickets in the period
**And** CSV columns include: date, montant_ttc, mode_reglement, numero_ticket, marche, statut, hash, validated_at
**And** amounts are formatted in euros with 2 decimals (e.g., "12,50")
**And** dates are formatted as dd/MM/yyyy
**And** cancelled tickets are included with status "Annulé"

### Story 5.3: File Download

As a **user**,
I want **to download the exported CSV file to my device**,
So that **I can share it with my accountant** (FR25).

**Acceptance Criteria:**

**Given** CSV generation is complete
**When** the file is ready
**Then** the file automatically downloads to my device
**And** the filename follows pattern: z-scanner_export_YYYY-MM-DD_YYYY-MM-DD.csv
**And** a success toast confirms the download

**Given** I am on iOS Safari
**When** I export
**Then** a share sheet appears allowing me to save or share the file

**Given** I want to export again
**When** I return to the export page
**Then** I can select a new period and generate another export

---

## Epic 6: Dashboard & Insights

Permet aux utilisateurs de visualiser leur activité commerciale et prendre de meilleures décisions business.

### Story 6.1: Activity Dashboard

As a **user**,
I want **to see a summary of my activity**,
So that **I can quickly understand my business status** (FR26).

**Acceptance Criteria:**

**Given** I am logged in (dashboard could be integrated into /tickets or separate)
**When** I view the dashboard section
**Then** I see a summary card with:
- Total tickets this month
- Total revenue this month (in euros)
- Number of markets visited
**And** data loads reactively via useLiveQuery
**And** loading state shows skeleton while computing

**Given** I have no tickets
**When** the dashboard loads
**Then** zeros are displayed gracefully
**And** an encouraging message invites me to scan my first ticket

### Story 6.2: Sales by Period

As a **user**,
I want **to see my total sales by period**,
So that **I can track my business performance over time** (FR27).

**Acceptance Criteria:**

**Given** I am viewing the dashboard
**When** I look at the period summary
**Then** I see totals for: "Cette semaine", "Ce mois", "Ce trimestre"
**And** each period shows: number of tickets, total revenue
**And** I can tap to expand and see daily/weekly breakdown

**Given** I want to compare periods
**When** I view the dashboard
**Then** a simple comparison shows trend vs previous period (e.g., "+15% vs mois dernier")

### Story 6.3: Sales by Market

As a **user**,
I want **to see my sales broken down by market**,
So that **I can identify my best performing locations** (FR28).

**Acceptance Criteria:**

**Given** I am viewing the dashboard
**When** I look at the market breakdown
**Then** I see a list of my markets with: name, ticket count, total revenue
**And** markets are sorted by revenue (highest first)
**And** tapping a market filters the ticket list to that market

**Given** I have tickets without assigned markets
**When** viewing the breakdown
**Then** an "Non assigné" category shows unassigned ticket totals

### Story 6.4: Settings Page

As a **user**,
I want **to access app settings**,
So that **I can manage my account and preferences**.

**Acceptance Criteria:**

**Given** I navigate to /settings (Paramètres tab)
**When** the page loads
**Then** I see sections for:
- Mon compte (email, logout)
- Mes marchés (link to market management)
- Synchronisation (manual retry, sync status)
- À propos (version, support contact)

**Given** I want to force sync
**When** I tap "Synchroniser maintenant"
**Then** pending items are synced immediately
**And** a progress indicator shows sync status
