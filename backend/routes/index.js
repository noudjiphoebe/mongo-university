const express = require('express');
const router = express.Router();

// Importer toutes les routes
const authRoutes = require('./auth');
const utilisateursRoutes = require('./utilisateurs');
const sallesRoutes = require('./salles');
const emploiDuTempsRoutes = require('./emploi_du_temps');
const professeursRoutes = require('./professeurs');
const statsRoutes = require('./stats');

// Utiliser les routes
router.use('/api/auth', authRoutes);
router.use('/api/utilisateurs', utilisateursRoutes);
router.use('/api/salles', sallesRoutes);
router.use('/api/emploi-du-temps', emploiDuTempsRoutes);
router.use('/api/professeurs', professeursRoutes);
router.use('/api/stats', statsRoutes);

// Route racine
router.get('/', (req, res) => {
    res.json({
        message: "API Gestion Universitaire - Université de Mongo",
        status: "Fonctionnel",
        database: "MariaDB (Connectée)",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth/login",
            utilisateurs: "/api/utilisateurs",
            salles: "/api/salles",
            emploi_du_temps: "/api/emploi-du-temps",
            professeurs: "/api/professeurs",
            statistiques: "/api/stats"
        }
    });
});

// Gestion des routes non trouvées
router.use('*', (req, res) => {
    res.status(404).json({ 
        error: "Endpoint non trouvé",
        path: req.originalUrl,
        method: req.method
    });
});

module.exports = router;
