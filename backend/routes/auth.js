import express from 'express';
const router = express.Router();

// Route GET de test
router.get('/', (req, res) => {
  res.json({ message: 'Route auth fonctionne!' });
});

// ✅ AJOUTEZ CETTE ROUTE POST POUR L'AUTHENTIFICATION
router.post('/', (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    
    console.log('🔐 Tentative de connexion:', { email });
    
    // Validation des données
    if (!email || !mot_de_passe) {
      return res.status(400).json({
        success: false,
        message: '❌ Email et mot de passe requis'
      });
    }
    
    // Simulation d'authentification
    if (email === 'admin@univ.fr' && mot_de_passe === 'password123') {
      return res.json({
        success: true,
        message: '✅ Authentification réussie',
        user: { 
          email: email, 
          role: 'admin',
          nom: 'Administrateur Université',
          token: 'simulated-jwt-token-' + Date.now()
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: '❌ Email ou mot de passe incorrect'
      });
    }
  } catch (error) {
    console.error('💥 Erreur auth:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur lors de l\'authentification' 
    });
  }
});

export default router;