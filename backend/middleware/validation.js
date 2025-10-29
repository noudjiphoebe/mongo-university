import { body, validationResult } from 'express-validator';

// Validation pour la connexion - CORRIGÉE
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('mot_de_passe')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, // ← AJOUT
        errors: errors.array() 
      }); // ← BIEN UTILISER 'return'
    }
    next(); // ← Continuer seulement si pas d'erreurs
  }
];

// Même correction pour les autres validateurs...
export const validateUser = [
  // ... vos règles de validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, // ← AJOUT
        errors: errors.array() 
      }); // ← BIEN UTILISER 'return'
    }
    next();
  }
];