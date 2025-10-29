import express from 'express';
const router = express.Router();

// GET /api/salles - Liste des salles
router.get('/', (req, res) => {
    res.json({ 
        message: 'Liste des salles fonctionne!',
        route: '/api/salles'
    });
});

// GET /api/salles/:id - Détails d'une salle
router.get('/:id', (req, res) => {
    res.json({ 
        message: `Détails de la salle ${req.params.id}`,
        id: req.params.id
    });
});

export default router;