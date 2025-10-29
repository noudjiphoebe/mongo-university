import express from 'express';
const router = express.Router();

// GET /api/utilisateurs - Liste des utilisateurs
router.get('/', (req, res) => {
    res.json({ 
        message: 'Liste des utilisateurs fonctionne!',
        route: '/api/utilisateurs'
    });
});

export default router;