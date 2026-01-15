---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-z-scanner-2026-01-14.md
  - _bmad-output/planning-artifacts/research/market-maraîchers-commerçants-ambulants-france-2026-01-14.md
  - _bmad-output/analysis/brainstorming-session-2026-01-14.md
workflowType: 'prd'
project_name: z-scanner
user_name: Stephane
date: 2026-01-14
documentCounts:
  briefs: 1
  research: 1
  brainstorming: 1
  projectDocs: 0
projectType: greenfield
classification:
  projectType: web_app_pwa
  domain: general
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - Z-Scanner

**Author:** Stephane
**Date:** 2026-01-14

## Success Criteria

### User Success

**Emotional Success Indicators (Qualitative)**
- Feedback direct type : "Ça simplifie ma journée !"
- Expressions de soulagement : "C'est tellement mieux avec ton application !"
- Reconnaissance de valeur : "Ça m'enlève une épine du pied"

**Behavioral Success Metrics (Quantitative)**

| Métrique | Cible | Justification |
|----------|-------|---------------|
| Taux de retour J+7 | >60% | Preuve d'intégration dans le rituel |
| Rétention mensuelle | >70% | Valeur durable perçue |
| Workflow completion | >80% | Scan → Validation effectué |
| Tickets/utilisateur/semaine | 3-4 | Correspond à la fréquence marché |

**North Star Metric:** Taux de retour hebdomadaire
> Un utilisateur qui revient chaque semaine = Z-Scanner fait partie de son rituel.

### Business Success

**Objectif Principal (M+6)**
> **10 utilisateurs payants à €5/mois = €50 MRR**

| Horizon | Objectif | Indicateur |
|---------|----------|------------|
| **M+1** | Validation concept | 50 utilisateurs actifs (gratuit) |
| **M+3** | Product-market fit | 200 utilisateurs actifs |
| **M+6** | Première monétisation | **10 abonnés payants (€5/mois)** |
| **M+12** | Croissance | 1,000+ utilisateurs, 100+ payants |

**Définition "Utilisateur actif":** A scanné ou consulté au moins 1 ticket dans les 30 derniers jours.

### Technical Success

**Critère Principal: OCR First-Scan Accuracy**

| Métrique | Cible | Seuil d'alerte |
|----------|-------|----------------|
| **Taux OCR réussi 1er essai** | >85% | <70% |
| Temps de validation total | <2 min | >5 min |
| Disponibilité offline | 100% core features | - |
| Sync success rate | >99% | <95% |

**UX Technique: Minimiser la saisie**
- OCR = accélérateur, saisie manuelle = fallback
- Édition inline pour corrections mineures uniquement
- Validation 1-click sans friction

### Measurable Outcomes

| Outcome | Comment le mesurer | Quand |
|---------|-------------------|-------|
| "Ça simplifie ma vie" | Feedback qualitatif direct | Continu |
| Adoption sticky | Rétention J+7 >60% | Mensuel |
| Willingness to pay | 10 conversions à €5/mois | M+6 |
| Technical reliability | OCR 1st scan >85% | Quotidien |

---

## Product Scope

### MVP - Minimum Viable Product

**Core 5 (Indispensable)**
1. Scan OCR du ticket Z
2. Saisie manuelle (fallback robuste)
3. Validation 1-click (immutable, NF525)
4. Export fichier
5. Dashboard "Mon activité"

**Complémentaires MVP**
- Vérification des valeurs extraites
- Édition inline pour corrections
- Mode offline complet
- Sync cloud automatique
- Vue multi-marchés
- Historique permanent

### Growth Features (Post-MVP)

| Feature | Horizon | Trigger |
|---------|---------|---------|
| TVA visible | V1.1 | Demande utilisateurs |
| Export programmé auto | V1.2+ | Feedback comptables |
| Mémo contextuel | V1.2+ | Usage patterns |

### Vision (Future)

Pas de vision d'expansion prématurée. Le futur se construira en fonction :
- Du feedback des 10 premiers payants
- De la validation du product-market fit
- Des opportunités qui émergeront naturellement

**Philosophie:** Faire une chose, la faire bien, puis itérer.

---

## User Journeys

### Persona Principal: Jean-Marc, Maraîcher

**Backstory**
Jean-Marc est maraîcher depuis 15 ans. Micro-entrepreneur, il fait 3-4 marchés par semaine dans des communes rurales de Saône-et-Loire. Il utilise une balance poids-prix avec tickets, non connectée à aucun logiciel. Son smartphone Android est son seul outil numérique - il n'est pas technophile.

**Sa douleur actuelle**
Chaque soir après le marché, fatigué, il doit conserver précieusement son ticket Z papier thermique (qui s'efface), puis le recopier dans Excel plus tard. Cette corvée administrative lui pèse et l'inquiète : Excel est modifiable, donc non conforme à la réglementation NF525. Il vit avec une anxiété permanente.

---

### Journey 1: First-Time Onboarding

**Scène d'ouverture**
Jean-Marc a entendu parler de Z-Scanner par un collègue au marché. Il télécharge l'app sur son Android.

| Étape | Action | Émotion |
|-------|--------|---------|
| **Téléchargement** | Installe l'app depuis le Play Store | Curieux mais sceptique |
| **Lancement** | Ouvre l'app, crée son compte (email + mdp) | "Espérons que c'est simple" |
| **Onboarding** | L'app l'envoie directement au scanner | Surpris : "C'est tout ?" |
| **Premier scan** | Scanne son ticket Z du jour | "Voyons voir..." |
| **Résultat** | Voit les valeurs extraites, vérifie le total | "Ah ouais, c'est bon !" |
| **Validation** | Appuie sur Valider | Soulagé |

**Résolution**
En moins de 2 minutes après l'installation, Jean-Marc a scanné et validé son premier ticket. Pas de tutoriel, pas de friction. Il comprend immédiatement la valeur.

**Capabilities révélées:** Inscription minimaliste, onboarding direct vers scanner, UX zéro-friction

---

### Journey 2: Scan Immédiat (Fin de Marché) - Happy Path

**Scène d'ouverture**
13h30, marché de Moroges. Jean-Marc remballe ses cagettes. Il est fatigué, il fait froid, il veut rentrer.

| Étape | Action | Émotion |
|-------|--------|---------|
| **Fin de vente** | Range sa caisse, imprime le Z | Fatigué, pressé |
| **Ouverture app** | Sort son téléphone, ouvre Z-Scanner (une main) | Automatique |
| **Scan** | Photo du ticket Z | "Vite fait" |
| **Vérification** | Vérifie le total affiché (2 secondes) | Rassuré |
| **Validation** | 1 clic → "Ticket validé - immutable" | "C'est dans la boîte !" |
| **Départ** | Range le téléphone, rentre chez lui | Tranquillité d'esprit |

**Résolution**
Le ticket papier peut se perdre ou s'effacer - Jean-Marc s'en fiche. Ses données sont sécurisées, immuables, conformes. Il rentre l'esprit léger.

**Durée totale: < 2 minutes**

**Capabilities révélées:** OCR rapide, interface une main, validation 1-click, feedback de confirmation, immutabilité

---

### Journey 3: Scan avec OCR Échoué (Edge Case)

**Scène d'ouverture**
Le ticket de Jean-Marc est froissé et partiellement effacé par la pluie.

| Étape | Action | Émotion |
|-------|--------|---------|
| **Scan** | Photo du ticket abîmé | Espère que ça marche |
| **Résultat OCR** | Message : "Ticket non lisible" | "Ah mince..." |
| **Proposition** | L'app propose "Saisir manuellement" | Soulagé qu'il y ait une option |
| **Saisie manuelle** | Entre le total et les infos clés | Un peu fastidieux mais OK |
| **Validation** | Valide le ticket saisi manuellement | "Au moins c'est fait" |

**Résolution**
Même si l'OCR échoue, Jean-Marc peut toujours enregistrer son ticket. Le scan est un accélérateur, pas une dépendance.

**Capabilities révélées:** Détection échec OCR, message clair, fallback saisie manuelle, robustesse

---

### Journey 4: Scan Hors-Ligne (Edge Case)

**Scène d'ouverture**
Marché de campagne, pas de réseau mobile.

| Étape | Action | Émotion |
|-------|--------|---------|
| **Scan** | Photo du ticket Z | Normal |
| **OCR** | Fonctionne localement (offline) | "Ah ça marche quand même !" |
| **Validation** | Valide le ticket | Rassuré |
| **Indicateur** | Ticket marqué "Non synchronisé" | Comprend la situation |
| **Plus tard** | De retour chez lui avec WiFi, sync auto | Ne s'en occupe pas |
| **Résultat** | Le ticket apparaît comme synchronisé | Confiance dans le système |

**Résolution**
Jean-Marc peut travailler sur n'importe quel marché, même sans réseau. La sync se fait automatiquement quand la connexion revient.

**Capabilities révélées:** OCR offline, validation offline, indicateur de sync status, sync automatique, architecture offline-first

---

### Journey 5: Saisie par Lot (Fin de Semaine)

**Scène d'ouverture**
Dimanche soir, Jean-Marc est posé chez lui. Il sort les 4 tickets de la semaine.

| Étape | Action | Émotion |
|-------|--------|---------|
| **Préparation** | Sort ses 4 tickets papier | Méthodique |
| **Scan séquentiel** | Scanne chaque ticket, vérifie, valide | Satisfait de l'efficacité |
| **Consultation** | "Voyons voir cette semaine..." | Curieux |
| **Dashboard** | Voit le total de la semaine, par marché | "Ah, Moroges a bien marché !" |
| **Export** | Télécharge le récap CSV pour le comptable | Tâche accomplie |

**Résolution**
En 10 minutes, Jean-Marc a traité toute sa semaine. Il a une vision claire de ses ventes et son comptable a les données.

**Durée totale: ~10 minutes pour 4 tickets**

**Capabilities révélées:** Batch processing, dashboard agrégé, vue par marché, export CSV, envoi email

---

### Journey 6: Consultation Historique

**Scène d'ouverture**
Mercredi matin, Jean-Marc prépare sa commande au grossiste. Il se demande ce qui s'est bien vendu.

| Étape | Action | Émotion |
|-------|--------|---------|
| **Question** | "Qu'est-ce que j'ai vendu jeudi à Moroges ?" | Besoin d'info |
| **Recherche** | Ouvre l'app, filtre par date + lieu | Simple |
| **Résultat** | Voit le détail du ticket du jeudi | "Ah oui, les tomates ont cartonné" |
| **Décision** | Ajuste sa commande en conséquence | Empowered |

**Résolution**
Jean-Marc a accès instantané à une information qu'il n'avait jamais eue avant. Il prend de meilleures décisions business.

**Capabilities révélées:** Historique permanent, filtres (date, lieu), recherche rapide, détail des tickets

---

### Journey Requirements Summary

| Journey | Capabilities Clés |
|---------|-------------------|
| **Onboarding** | Inscription simple, accès direct scanner |
| **Scan immédiat** | OCR rapide, 1-click validation, feedback immutabilité |
| **OCR échoué** | Détection erreur, message clair, fallback saisie manuelle |
| **Hors-ligne** | OCR offline, validation offline, indicateur sync, sync auto |
| **Saisie par lot** | Batch processing, dashboard, export CSV |
| **Consultation** | Historique, filtres, recherche |

**Export Format (pour comptable):** CSV dans un premier temps

---

## Domain-Specific Requirements

### Positionnement Réglementaire NF525

| Aspect | Clarification |
|--------|---------------|
| **Z-Scanner n'est PAS** | Une caisse enregistreuse certifiée NF525 |
| **Z-Scanner EST** | Un système d'archivage conforme des tickets Z |
| **Objectif** | Fournir une preuve d'authenticité en cas de contrôle fiscal |

### Exigences de Conformité

**Immutabilité des Données**
- Un ticket validé ne peut JAMAIS être modifié
- L'application doit bloquer toute tentative de modification post-validation
- Pas de bouton "Éditer" sur un ticket validé

**Workflow d'Annulation (Erreur Post-Validation)**
- Si erreur détectée après validation → **Annulation** du ticket (pas modification)
- Le ticket annulé reste visible dans l'historique (statut "Annulé")
- Comportement identique à une facture annulée en comptabilité
- L'annulation elle-même est immutable (traçabilité complète)

**Preuve d'Authenticité**
- **Photo originale** du ticket archivée avec les données extraites
- Lien permanent entre données OCR et image source
- Permet vérification visuelle en cas de contrôle fiscal

### Contraintes Techniques

| Contrainte | Implementation |
|------------|----------------|
| **Horodatage** | Horodatage cryptographique à la validation |
| **Intégrité** | Hash des données + photo pour détecter altération |
| **Archivage photo** | Stockage sécurisé de l'image source OCR |
| **Durée conservation** | Minimum légal fiscal (6 ans en France) |

### Risques & Mitigations

| Risque | Mitigation |
|--------|------------|
| Modification post-validation | UI bloque l'édition, API refuse les updates |
| Erreur OCR validée trop vite | Workflow d'annulation + nouveau ticket |
| Contestation authenticité | Photo originale archivée comme preuve |
| Perte de données | Sync cloud + backup |

---

## Web App (PWA) Specific Requirements

### Architecture Overview

| Aspect | Choix |
|--------|-------|
| **Type** | Progressive Web App (PWA) |
| **Framework** | React via Next.js |
| **Rendering** | SPA avec SSR pour landing page (SEO) |
| **Viewport** | Mobile-only (pas de responsive desktop) |
| **Distribution** | URL directe + "Add to Home Screen" |

### Platform Requirements

**Browser Support**
- Chrome Mobile (Android)
- Safari Mobile (iOS)
- Firefox Mobile
- Samsung Internet
- Autres navigateurs mobiles modernes

**Minimum Features Required**
- Service Workers support
- IndexedDB support
- MediaDevices API (camera)
- Web App Manifest support

### Device Permissions

| Permission | Usage | Obligatoire |
|------------|-------|-------------|
| **Camera** | Capture photo ticket Z pour OCR | ✅ Oui |
| **Storage** | IndexedDB pour données offline | ✅ Oui |
| **Service Worker** | Fonctionnement offline | ✅ Oui |

### Offline Mode Architecture

| Composant | Technologie |
|-----------|-------------|
| **Data Storage** | IndexedDB (tickets, métadonnées) |
| **Image Storage** | IndexedDB ou Cache API (photos tickets) |
| **App Shell** | Service Worker cache |
| **Sync Strategy** | Background Sync API quand connexion disponible |

**Comportement Offline**
- OCR fonctionne localement (modèle embarqué ou dégradé)
- Validation ticket possible sans connexion
- Indicateur visuel "Non synchronisé"
- Sync automatique au retour de connexion

### PWA Configuration

| Feature | Status |
|---------|--------|
| **Web App Manifest** | ✅ Requis |
| **Add to Home Screen** | ✅ Requis |
| **Splash Screen** | ✅ Requis |
| **Standalone Mode** | ✅ Requis (navigation bar cachée) |
| **Push Notifications** | ❌ Hors scope MVP |

### SEO Strategy

| Page | SEO | Rendering |
|------|-----|-----------|
| **Landing Page** | ✅ Optimisé | SSR (Next.js) |
| **App (post-login)** | ❌ Non indexé | CSR (SPA) |

**Landing Page SEO**
- Meta tags optimisés
- Open Graph pour partage social
- Schema.org markup si pertinent
- Performance (Core Web Vitals)

### Implementation Considerations

**Next.js Specific**
- App Router ou Pages Router selon préférence
- API Routes pour backend si needed
- next-pwa ou similaire pour Service Worker
- Image optimization pour photos tickets

**Contraintes Mobile-Only**
- Viewport fixé pour mobile (max-width ~480px)
- Touch-first interactions (zones 48px+)
- Pas de hover states critiques
- Orientation portrait uniquement recommandée

---

## Project Scoping & Phased Development

### MVP Strategy Confirmation

**Philosophie MVP:** Problem-Solving MVP
> Résoudre complètement le problème core (digitalisation ticket Z) avant d'ajouter des fonctionnalités.

**Scope validé:** Voir section "Product Scope" ci-dessus
- Core 5 features + Complémentaires MVP
- Post-MVP features planifiées (V1.1, V1.2+)

### Risk Mitigation Strategy

| Type de Risque | Risque Principal | Mitigation |
|----------------|------------------|------------|
| **Technique** | OCR pas assez précis (<85%) | Fallback saisie manuelle toujours disponible |
| **Technique** | Offline OCR trop lourd | Modèle léger ou OCR cloud avec cache |
| **Marché** | Adoption lente | Validation avec 50 users gratuits avant monétisation |
| **Ressources** | Développement solo | MVP minimaliste, itérations rapides |

### MVP Success Gate

**Critères Go/No-Go pour V1.1 :**
- 50 utilisateurs actifs à M+1
- Feedback positif sur workflow principal
- OCR first-scan >70% (seuil minimum)
- Pas de blocage technique majeur

---

## Functional Requirements

### Account & Authentication

- **FR1:** L'utilisateur peut créer un compte avec email et mot de passe
- **FR2:** L'utilisateur peut se connecter à son compte existant
- **FR3:** L'utilisateur peut réinitialiser son mot de passe oublié
- **FR4:** L'utilisateur peut se déconnecter de son compte

### Ticket Capture

- **FR5:** L'utilisateur peut capturer un ticket Z via la caméra du téléphone
- **FR6:** Le système peut extraire automatiquement les données du ticket via OCR
- **FR7:** L'utilisateur peut voir les valeurs extraites par l'OCR pour vérification
- **FR8:** L'utilisateur peut saisir manuellement les données d'un ticket
- **FR9:** L'utilisateur peut modifier les valeurs extraites avant validation (édition inline)
- **FR10:** Le système peut détecter et signaler un échec de lecture OCR

### Ticket Validation & Compliance

- **FR11:** L'utilisateur peut valider un ticket en 1 clic
- **FR12:** Le système rend les données d'un ticket validé immutables
- **FR13:** Le système archive la photo originale du ticket avec les données
- **FR14:** Le système horodate cryptographiquement chaque validation
- **FR15:** L'utilisateur peut annuler un ticket validé (sans le modifier)
- **FR16:** Le système conserve les tickets annulés visibles dans l'historique avec statut "Annulé"

### Ticket Management

- **FR17:** L'utilisateur peut consulter la liste de tous ses tickets
- **FR18:** L'utilisateur peut filtrer ses tickets par date
- **FR19:** L'utilisateur peut filtrer ses tickets par marché/lieu
- **FR20:** L'utilisateur peut voir le détail complet d'un ticket
- **FR21:** L'utilisateur peut associer un ticket à un marché/point de vente
- **FR22:** L'utilisateur peut créer et gérer ses marchés/points de vente

### Export & Sharing

- **FR23:** L'utilisateur peut exporter ses tickets au format CSV
- **FR24:** L'utilisateur peut sélectionner une période pour l'export
- **FR25:** L'utilisateur peut télécharger un fichier d'export

### Dashboard & Analytics

- **FR26:** L'utilisateur peut voir un récapitulatif de son activité (dashboard)
- **FR27:** L'utilisateur peut voir le total de ses ventes par période
- **FR28:** L'utilisateur peut voir le total de ses ventes par marché
- **FR29:** L'utilisateur peut voir son historique de tickets permanent

### Offline & Sync

- **FR30:** L'utilisateur peut utiliser l'OCR sans connexion internet
- **FR31:** L'utilisateur peut valider un ticket sans connexion internet
- **FR32:** Le système indique visuellement les tickets non synchronisés
- **FR33:** Le système synchronise automatiquement les données quand la connexion revient
- **FR34:** L'utilisateur peut installer l'app sur son écran d'accueil (PWA)

### Landing Page

- **FR35:** Le visiteur peut consulter une landing page publique présentant le produit
- **FR36:** Le visiteur peut s'inscrire depuis la landing page

---

## Non-Functional Requirements

### Performance

| NFR | Critère | Justification |
|-----|---------|---------------|
| **NFR-P1** | Capture caméra → résultat OCR en <5 secondes | UX fluide, utilisateur pressé |
| **NFR-P2** | Temps de validation ticket <1 seconde | Action instantanée perçue |
| **NFR-P3** | Chargement dashboard <3 secondes | Consultation rapide |
| **NFR-P4** | Application utilisable sur connexion 3G | Marchés ruraux, réseau faible |

### Security & Compliance

| NFR | Critère | Justification |
|-----|---------|---------------|
| **NFR-S1** | Données chiffrées en transit (HTTPS) | Protection des données |
| **NFR-S2** | Données chiffrées au repos (cloud storage) | NF525 / protection |
| **NFR-S3** | Authentification sécurisée (hachage mot de passe) | Standard sécurité |
| **NFR-S4** | Données immutables après validation (aucune modification possible) | NF525 compliance |
| **NFR-S5** | Conservation des données 6 ans minimum | Obligation légale fiscale |
| **NFR-S6** | Horodatage cryptographique vérifiable | Preuve d'authenticité |

### Reliability

| NFR | Critère | Justification |
|-----|---------|---------------|
| **NFR-R1** | Mode offline fonctionne sans dégradation des features core | Marchés sans réseau |
| **NFR-R2** | Synchronisation automatique avec taux de succès >99% | Fiabilité données |
| **NFR-R3** | Aucune perte de données en cas de crash ou fermeture app | Données critiques |
| **NFR-R4** | Photos tickets archivées avec redondance | Preuve fiscale |

### Scalability

| NFR | Critère | Justification |
|-----|---------|---------------|
| **NFR-SC1** | Architecture supportant 1,000 utilisateurs sans refonte | Vision M+12 |
| **NFR-SC2** | Stockage photos scalable (cloud storage) | Volume croissant |
