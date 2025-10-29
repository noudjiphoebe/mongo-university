import express from 'express';
const router = express.Router();

// GET /api/professeurs - Liste des professeurs
router.get('/', (req, res) => {
    res.json({ 
        message: 'Liste des professeurs fonctionne!',
        route: '/api/professeurs'
    });
});

// GET /api/professeurs/:id - Détails d'un professeur
router.get('/:id', (req, res) => {
    res.json({ 
        message: `Détails du professeur ${req.params.id}`,
        id: req.params.id
    });
});

// POST /api/professeurs - Créer un professeur
router.post('/', (req, res) => {
    res.json({ 
        message: 'Création d\'un professeur',
        data: req.body
    });
});

export default router;