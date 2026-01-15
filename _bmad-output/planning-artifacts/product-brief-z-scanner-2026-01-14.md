---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - _bmad-output/analysis/brainstorming-session-2026-01-14.md
  - _bmad-output/planning-artifacts/research/market-maraîchers-commerçants-ambulants-france-2026-01-14.md
date: 2026-01-14
author: Stephane
project_name: z-scanner
status: complete
---

# Product Brief: Z-Scanner

## Executive Summary

Z-Scanner est une application mobile qui permet aux maraîchers et commerçants ambulants de digitaliser leurs tickets Z de caisse en moins de 10 minutes, directement sur le terrain. En combinant OCR intelligent et archivage conforme NF525, Z-Scanner libère les commerçants de la charge mentale liée à la gestion administrative, leur permettant de se concentrer sur leur métier.

**Marché adressable :** 40,000-60,000 commerçants en France non équipés de logiciels connectés.

**Positionnement unique :** "Gardez votre balance, digitalisez votre Z en 10 minutes."

---

## Core Vision

### Problem Statement

Les commerçants de marché utilisant des balances poids-prix passent un temps disproportionné à recopier manuellement leurs tickets Z de fermeture dans des fichiers Excel. Ce processus est non seulement chronophage mais génère de l'anxiété : le papier thermique se dégrade, Excel est modifiable (donc non conforme), et la moindre erreur peut avoir des conséquences fiscales.

### Problem Impact

- **Temps perdu :** 4 étapes manuelles (conserver → transcrire → vérifier → envoyer) répétées à chaque marché
- **Risque fiscal :** Fichiers Excel modifiables = non-conformité NF525 → amende €7,500 dès mars 2026
- **Charge mentale :** Anxiété permanente liée à la fragilité des tickets papier et au risque d'erreur
- **Coût d'opportunité :** Temps qui pourrait être consacré au repos ou à la préparation du lendemain

### Why Existing Solutions Fall Short

| Solution actuelle | Limitation |
|-------------------|------------|
| **Caisses mobiles (Toporder, Tactill)** | Remplacement total de l'équipement existant, prix élevé (€29-39/mois), complexité d'installation |
| **OCR de tickets (Dataleon, Klippa)** | Conçus pour tickets clients, pas pour rapports Z de caisse |
| **Logiciels de gestion agricole** | Trop complets/complexes pour le simple besoin de scan Z |
| **Excel/Papier** | Non conforme, source d'erreurs, charge mentale |

**Insight critique :** Aucun concurrent n'offre d'OCR dédié aux tickets Z - c'est un gap de marché inexploité.

### Proposed Solution

Z-Scanner est une application mobile-first qui :

1. **Scanne** le ticket Z via OCR (ou saisie manuelle en fallback)
2. **Affiche** les données extraites pour vérification (total en premier, détails ensuite)
3. **Valide** en 1 clic - rendant les données immutables (conformité NF525)
4. **Exporte** vers le comptable (email/fichier)

**Promesse produit :** "10 minutes max, une main, même avec des doigts froids."

### Key Differentiators

| Différenciateur | Impact |
|-----------------|--------|
| **Complément, pas remplacement** | Gardez votre balance existante - zéro investissement matériel |
| **Premier OCR Z** | Avantage first-mover dans une niche inexploitée |
| **NF525 natif** | Immutabilité = conformité + tranquillité d'esprit |
| **Offline-first** | Fonctionne même sans réseau sur le marché |
| **UX terrain** | Conçu pour une main, fatigué, lumière faible, 10 min max |
| **Prix accessible** | <€20/mois (vs €29-39 des caisses complètes) |

---

## Target Users

### Primary Users

#### Persona Principal : Jean-Marc, Maraîcher

**Profil**
- Maraîcher depuis 15 ans, micro-entrepreneur
- Fait 3-4 marchés par semaine dans des communes rurales
- Utilise une balance poids-prix avec tickets (non connectée)
- Smartphone Android standard, pas technophile

**Contexte quotidien**
- Lever 4h, préparation, route, installation, vente, remballage
- En fin de marché : fatigué, pressé de rentrer, mains froides
- Gère son administratif le soir ou en fin de semaine

**Frustrations actuelles**
- Tickets papier qui s'effacent ou se perdent
- Recopie manuelle dans Excel = corvée et source d'erreurs
- Anxiété permanente : "Est-ce que j'ai bien tout noté ?"
- Peur du contrôle fiscal (Excel modifiable = non conforme)

**Ce qui le rendrait heureux**
- "Mon ticket est dans la boîte, je n'y pense plus"
- Pouvoir répondre à "Combien j'ai vendu jeudi à Moroges ?"
- Ne plus jamais recopier de chiffres à la main

#### Autres profils similaires

| Profil | Spécificité | Volume estimé |
|--------|-------------|---------------|
| **Fromager ambulant** | Produits au poids, marchés + tournées | ~15,000 |
| **Boucher de marché** | Volumes plus importants, tickets détaillés | ~10,000 |
| **Poissonnier** | Produits périssables, traçabilité importante | ~8,000 |
| **Confiseur/Épicier** | Vrac, produits au poids | ~5,000 |

**Point commun** : Tous utilisent des balances poids-prix avec tickets et font face aux mêmes contraintes (terrain, fatigue, conformité).

### Secondary Users

Pas d'utilisateurs secondaires pour le MVP. Le comptable reçoit les exports mais n'interagit pas directement avec l'application.

*Future considération : Interface comptable pour récupération directe des données.*

### User Journey

#### Parcours 1 : Scan immédiat (fin de marché)

| Étape | Action | Émotion |
|-------|--------|---------|
| **Fin de vente** | Jean-Marc range sa caisse, imprime le Z | Fatigué, pressé |
| **Scan** | Ouvre Z-Scanner, photo du ticket | "Vite fait" |
| **Vérification** | Vérifie le total extrait (2 secondes) | Rassuré |
| **Validation** | 1 clic → immutable | "C'est dans la boîte !" |
| **Départ** | Range le téléphone, rentre chez lui | Tranquillité d'esprit |

**Durée totale : < 2 minutes**

#### Parcours 2 : Saisie par lot (fin de semaine)

| Étape | Action | Contexte |
|-------|--------|----------|
| **Dimanche soir** | Jean-Marc sort ses 4 tickets de la semaine | Posé, chez lui |
| **Scan séquentiel** | Scanne chaque ticket, vérifie, valide | Méthodique |
| **Consultation** | "Voyons voir cette semaine..." | Curieux |
| **Export** | Envoie le récap au comptable | Satisfait |

**Durée totale : ~10 minutes pour 4 tickets**

#### Parcours 3 : Consultation historique

| Déclencheur | Question | Action |
|-------------|----------|--------|
| "C'était bien jeudi ?" | "Qu'est-ce que j'ai vendu à Moroges ?" | Filtre par date + lieu |
| Bilan hebdo | "Combien cette semaine ?" | Vue dashboard |
| Préparation | "Qu'est-ce qui marche le mieux ?" | Analyse des ventes |

**Moment aha!** : Quand Jean-Marc peut répondre instantanément à une question sur ses ventes passées - information qu'il n'avait jamais eue avant.

---

## Success Metrics

### User Success Metrics

| Métrique | Définition | Cible indicative |
|----------|------------|------------------|
| **Taux de retour** | % utilisateurs qui reviennent après 1ère utilisation | >60% à J+7 |
| **Rétention mensuelle** | % utilisateurs actifs mois N vs mois N-1 | >70% |
| **Adoption du workflow** | % utilisateurs qui complètent Scan → Validation | >80% |

**North Star Metric** : Taux de retour hebdomadaire
> Un utilisateur qui revient chaque semaine prouve que Z-Scanner s'est intégré à son rituel de marché.

### Business Objectives

| Horizon | Objectif | Indicateur |
|---------|----------|------------|
| **Lancement (M+1)** | Validation du concept | 50 utilisateurs actifs |
| **Traction (M+3)** | Product-market fit | 200 utilisateurs actifs |
| **Croissance (M+6)** | Scalabilité | 500 utilisateurs actifs |
| **Maturité (M+12)** | Rentabilité | 1,000+ utilisateurs actifs |

**Définition "Utilisateur actif"** : A scanné ou consulté au moins 1 ticket dans les 30 derniers jours.

### Key Performance Indicators

| KPI | Mesure | Fréquence de suivi |
|-----|--------|-------------------|
| **Tickets/utilisateur/semaine** | Volume d'usage réel | Hebdomadaire |
| **Tickets/utilisateur/mois** | Tendance d'engagement | Mensuel |
| **Taux de succès OCR** | Qualité technique | Quotidien |
| **Temps moyen de validation** | Performance UX | Hebdomadaire |

**KPI Principal** : Tickets scannés par utilisateur actif par semaine
> Cible : 3-4 tickets/semaine (correspond à la fréquence moyenne de marchés)

### Métriques de Santé Produit

| Signal | Bon signe | Signal d'alerte |
|--------|-----------|-----------------|
| **Rétention J+7** | >60% | <40% |
| **Scan → Validation** | >80% | <60% |
| **Temps de validation** | <2 min | >5 min |
| **Taux OCR réussi** | >85% | <70% |

---

## MVP Scope

### Core Features

**Le "Core 5" - Fonctionnalités indispensables :**

| # | Fonctionnalité | Raison d'être |
|---|----------------|---------------|
| 1 | **Scan OCR du ticket Z** | Entrée principale - capture instantanée |
| 2 | **Saisie manuelle (fallback)** | Robustesse garantie si OCR échoue |
| 3 | **Validation 1-click (immutable)** | Action clé + conformité NF525 |
| 4 | **Export email/fichier** | Sortie vers comptable |
| 5 | **Dashboard "Mon activité"** | Visibilité et valeur ajoutée |

**Fonctionnalités complémentaires MVP :**

| Fonctionnalité | Justification |
|----------------|---------------|
| **Vérification des valeurs** | Contrôle utilisateur avant validation |
| **Édition inline** | Correction sans perdre le contexte |
| **Mode offline** | Marchés sans réseau fiable |
| **Sync cloud** | Multi-device, données sécurisées |
| **Vue multi-marchés** | Organisation par point de vente |
| **Historique permanent** | Consultation des ventes passées |

### Out of Scope for MVP

| Fonctionnalité | Horizon | Raison du report |
|----------------|---------|------------------|
| **TVA visible** | V1.1 | Utile mais pas bloquant |
| **Export programmé auto** | V1.2+ | Confort, pas essentiel |
| **Mémo contextuel** | V1.2+ | Enrichissement futur |
| **Multi-utilisateurs** | Futur | Complexité technique |
| **Intégrations comptables** | Futur | Dépend du product-market fit |
| **Analyses avancées** | Futur | Valeur secondaire |

**Principe directeur :** On livre le minimum qui résout complètement le problème remonté.

### MVP Success Criteria

| Critère | Validation |
|---------|------------|
| **Problème résolu** | Jean-Marc n'a plus besoin de recopier ses tickets |
| **Workflow complet** | Scan → Vérif → Validation → Export fonctionne de bout en bout |
| **Conformité** | Données immutables après validation |
| **Terrain-ready** | Utilisable en <2 min, une main, offline |
| **Rétention** | >60% des utilisateurs reviennent à J+7 |

**Go/No-Go pour V1.1 :**
- 50 utilisateurs actifs à M+1
- Feedback positif sur le workflow principal
- Pas de blocage technique majeur (OCR, sync)

### Future Vision

**Approche actuelle :** Résoudre précisément un problème remonté en direct.

Pas de vision d'expansion prématurée. Le futur se construira en fonction :
- Du feedback utilisateurs réels
- De la validation du product-market fit
- Des opportunités qui émergeront naturellement

**Philosophie :** Faire une chose, la faire bien, puis itérer.

> "Build something a small number of people want, rather than something a large number of people kind of want." - Paul Graham
