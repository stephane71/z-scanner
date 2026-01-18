/**
 * OCR Prompts for Claude Vision API
 * Structured extraction prompts for French Z-ticket (Statistique Totaux) analysis
 */

/**
 * Structured extraction prompt for Claude 3.5 Haiku
 * Returns JSON with extracted fields and confidence scores
 * Based on Z-ticket "Statistique Totaux" format
 */
export const EXTRACTION_PROMPT = `Analyse ce ticket de caisse français de type "Statistique Totaux" (ticket Z).

Réponds UNIQUEMENT avec un objet JSON valide, sans texte additionnel, au format exact suivant:
{
  "type": "STATISTIQUES",
  "impressionDate": "YYYY-MM-DD",
  "lastResetDate": "YYYY-MM-DD",
  "resetNumber": <numéro de RAZ, entier>,
  "ticketNumber": <numéro de ticket, entier>,
  "discountValue": <montant remises en centimes, entier>,
  "cancelValue": <montant annulations en centimes, entier>,
  "cancelNumber": <nombre d'annulations, entier>,
  "payments": [
    { "mode": "CB" | "ESPECES" | "CHEQUE" | "VIREMENT", "value": <montant en centimes, entier> }
  ],
  "total": <total en centimes, entier>,
  "confidence": {
    "type": <0.0-1.0>,
    "impressionDate": <0.0-1.0>,
    "lastResetDate": <0.0-1.0>,
    "resetNumber": <0.0-1.0>,
    "ticketNumber": <0.0-1.0>,
    "discountValue": <0.0-1.0>,
    "cancelValue": <0.0-1.0>,
    "cancelNumber": <0.0-1.0>,
    "payments": <0.0-1.0>,
    "total": <0.0-1.0>
  }
}

Instructions d'extraction:
- type: Toujours "STATISTIQUES" pour les tickets "Statistique Totaux"
- impressionDate: Date d'impression du ticket (format DD/MM/YYYY ou similaire), convertis en YYYY-MM-DD
- lastResetDate: Date de la dernière RAZ (remise à zéro), convertis en YYYY-MM-DD
- resetNumber: Numéro de RAZ (ex: "RAZ N° 42" → 42)
- ticketNumber: Numéro du ticket (ex: "Ticket N° 0001" → 1)
- discountValue: Montant total des remises/rabais en centimes (12,50€ = 1250)
- cancelValue: Montant total des annulations en centimes
- cancelNumber: Nombre d'annulations effectuées
- payments: Tableau de tous les modes de paiement avec leurs montants en centimes
  - CB: Carte bancaire
  - ESPECES: Espèces/Liquide
  - CHEQUE: Chèque
  - VIREMENT: Virement bancaire
- total: Total général TTC en centimes
- confidence: Score de 0 à 1 pour chaque champ (1 = très sûr, 0 = illisible)

Si un champ n'est pas lisible ou absent:
- Pour les nombres: mets null
- Pour les dates: mets null
- Pour payments: mets un tableau vide []
- Le score de confiance correspondant doit être 0`;
