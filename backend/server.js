import express from 'express';
import mariadb from 'mariadb';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

// Configuration MariaDB
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'univ_mongo_app',
    password: process.env.DB_PASSWORD || 'azerty',
    database: process.env.DB_NAME || 'universite_mongo',
    connectionLimit: 5,
    acquireTimeout: 10000,
    connectTimeout: 10000
};

let pool;
let dbConnected = false;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token d\'accès requis' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        req.user = user;
        next();
    });
};

// Middleware d'authorisation
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }
        next();
    };
};

// Connexion à la base de données
async function connectDatabase() {
    try {
        pool = mariadb.createPool(dbConfig);
        const conn = await pool.getConnection();
        console.log('✅ Connexion à MariaDB réussie');
        conn.release();
        dbConnected = true;
        return true;
    } catch (error) {
        console.log('❌ Erreur de connexion à MariaDB:', error.message);
        dbConnected = false;
        return false;
    }
}

// ==================== ROUTES D'AUTHENTIFICATION ====================

// Login avec support pour 'password' et 'mot_de_passe'
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, mot_de_passe } = req.body;
        
        console.log('🔐 Tentative de login reçue:', { email, password, mot_de_passe });
        
        // Utiliser 'password' ou 'mot_de_passe' selon ce qui est envoyé
        const motDePasseSaisi = password || mot_de_passe;
        
        if (!email || !motDePasseSaisi) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        const conn = await pool.getConnection();
        const [user] = await conn.query(
            'SELECT * FROM utilisateur WHERE email = ? AND actif = TRUE',
            [email]
        );
        conn.release();

        console.log('👤 Utilisateur trouvé:', user ? 'OUI' : 'NON');

        if (!user) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        // MOT DE PASSE UNIQUE PAR RÔLE
        let motDePasseCorrect = '';
        
        switch(user.role) {
            case 'admin':
                motDePasseCorrect = 'admin123';
                break;
            case 'enseignant':
                motDePasseCorrect = 'enseignant123';
                break;
            case 'etudiant':
                motDePasseCorrect = 'etudiant123';
                break;
            default:
                motDePasseCorrect = '';
        }

        console.log(`🔑 Rôle: ${user.role}, Mot de passe attendu: ${motDePasseCorrect}, Saisi: ${motDePasseSaisi}`);

        // Vérifier le mot de passe
        if (motDePasseSaisi === motDePasseCorrect) {
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    role: user.role,
                    nom: user.nom,
                    prenom: user.prenom
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('✅ Login réussi pour:', email);
            
            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    nom: user.nom,
                    prenom: user.prenom
                }
            });
        } else {
            console.log('❌ Mot de passe incorrect');
            res.status(401).json({ error: 'Identifiants invalides' });
        }
    } catch (error) {
        console.error('💥 Erreur login:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
});

// ==================== ROUTES EMPLOI DU TEMPS ====================

// Emploi du temps pour enseignant - TOUS LES COURS
app.get('/api/emploi-du-temps/enseignant', authenticateToken, async (req, res) => {
    try {
        const conn = await pool.getConnection();

        // L'enseignant unique voit TOUS les cours
        const emploiDuTemps = await conn.query(`
            SELECT 
                c.id,
                m.nom as cours,
                m.code as code_cours,
                c.date_debut,
                c.date_fin,
                c.type_seance,
                s.nom as salle,
                b.nom as batiment,
                u.nom as enseignant_nom,
                u.prenom as enseignant_prenom,
                fil.nom as filiere,
                d.nom as departement,
                fac.nom as faculte,
                c.statut
            FROM cours c
            JOIN matiere m ON c.matiere_id = m.id
            JOIN salle s ON c.salle_id = s.id
            JOIN batiment b ON s.batiment_id = b.id
            JOIN enseignant e ON c.enseignant_id = e.id
            JOIN utilisateur u ON e.utilisateur_id = u.id
            JOIN filiere fil ON c.filiere_id = fil.id
            JOIN departement d ON fil.departement_id = d.id
            JOIN faculte fac ON d.faculte_id = fac.id
            WHERE c.statut != 'annule'
            ORDER BY c.date_debut
            LIMIT 50
        `);

        conn.release();
        
        res.json(emploiDuTemps);
    } catch (error) {
        console.error('Erreur emploi du temps enseignant:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Emploi du temps pour étudiant - TOUS LES COURS
app.get('/api/emploi-du-temps/etudiant', authenticateToken, async (req, res) => {
    try {
        const conn = await pool.getConnection();
        
        // L'étudiant unique voit TOUS les cours
        const emploiDuTemps = await conn.query(`
            SELECT 
                c.id,
                m.nom as cours,
                m.code as code_cours,
                c.date_debut,
                c.date_fin,
                c.type_seance,
                s.nom as salle,
                b.nom as batiment,
                u.nom as enseignant_nom,
                u.prenom as enseignant_prenom,
                fil.nom as filiere,
                d.nom as departement,
                fac.nom as faculte,
                c.statut
            FROM cours c
            JOIN matiere m ON c.matiere_id = m.id
            JOIN salle s ON c.salle_id = s.id
            JOIN batiment b ON s.batiment_id = b.id
            JOIN enseignant e ON c.enseignant_id = e.id
            JOIN utilisateur u ON e.utilisateur_id = u.id
            JOIN filiere fil ON c.filiere_id = fil.id
            JOIN departement d ON fil.departement_id = d.id
            JOIN faculte fac ON d.faculte_id = fac.id
            WHERE c.statut != 'annule'
            ORDER BY c.date_debut
            LIMIT 50
        `);

        conn.release();
        
        res.json(emploiDuTemps);
    } catch (error) {
        console.error('Erreur emploi du temps étudiant:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Emploi du temps admin (tous les cours)
app.get('/api/emploi-du-temps/admin', authenticateToken, authorize(['admin']), async (req, res) => {
    try {
        const conn = await pool.getConnection();
        
        const emploiDuTemps = await conn.query(`
            SELECT 
                c.id,
                m.nom as cours,
                m.code as code_cours,
                c.date_debut,
                c.date_fin,
                c.type_seance,
                s.nom as salle,
                b.nom as batiment,
                u.nom as enseignant_nom,
                u.prenom as enseignant_prenom,
                fil.nom as filiere,
                d.nom as departement,
                fac.nom as faculte,
                c.statut
            FROM cours c
            JOIN matiere m ON c.matiere_id = m.id
            JOIN salle s ON c.salle_id = s.id
            JOIN batiment b ON s.batiment_id = b.id
            JOIN enseignant e ON c.enseignant_id = e.id
            JOIN utilisateur u ON e.utilisateur_id = u.id
            JOIN filiere fil ON c.filiere_id = fil.id
            JOIN departement d ON fil.departement_id = d.id
            JOIN faculte fac ON d.faculte_id = fac.id
            WHERE c.statut != 'annule'
            ORDER BY c.date_debut
        `);

        conn.release();
        
        res.json(emploiDuTemps);
    } catch (error) {
        console.error('Erreur emploi du temps admin:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ==================== ROUTES UTILISATEURS ====================

// Get current user profile
app.get('/api/utilisateurs/profile', authenticateToken, async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const [user] = await conn.query(
            'SELECT id, email, role, nom, prenom, date_creation FROM utilisateur WHERE id = ?',
            [req.user.id]
        );
        conn.release();
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all users (admin only)
app.get('/api/utilisateurs', authenticateToken, authorize(['admin']), async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const users = await conn.query(
            'SELECT id, email, role, nom, prenom, date_creation, actif FROM utilisateur'
        );
        conn.release();
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ROUTES FACULTES ====================

// Get all faculties
app.get('/api/facultes', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const facultes = await conn.query('SELECT * FROM faculte ORDER BY nom');
        conn.release();
        
        res.json(facultes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get faculty by ID
app.get('/api/facultes/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const [faculte] = await conn.query('SELECT * FROM faculte WHERE id = ?', [req.params.id]);
        conn.release();
        
        if (!faculte) {
            return res.status(404).json({ error: 'Faculté non trouvée' });
        }
        
        res.json(faculte);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ROUTES DEPARTEMENTS ====================

// Get departments by faculty
app.get('/api/facultes/:faculteId/departements', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const departements = await conn.query(
            'SELECT * FROM departement WHERE faculte_id = ? ORDER BY nom',
            [req.params.faculteId]
        );
        conn.release();
        
        res.json(departements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all departments
app.get('/api/departements', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const departements = await conn.query(`
            SELECT d.*, f.nom as faculte_nom 
            FROM departement d 
            JOIN faculte f ON d.faculte_id = f.id 
            ORDER BY f.nom, d.nom
        `);
        conn.release();
        
        res.json(departements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ROUTES FILIERES ====================

// Get filieres by department
app.get('/api/departements/:departementId/filieres', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const filieres = await conn.query(
            'SELECT * FROM filiere WHERE departement_id = ? ORDER BY nom',
            [req.params.departementId]
        );
        conn.release();
        
        res.json(filieres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all filieres
app.get('/api/filieres', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const filieres = await conn.query(`
            SELECT f.*, d.nom as departement_nom, fac.nom as faculte_nom
            FROM filiere f
            JOIN departement d ON f.departement_id = d.id
            JOIN faculte fac ON d.faculte_id = fac.id
            ORDER BY fac.nom, d.nom, f.nom
        `);
        conn.release();
        
        res.json(filieres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ROUTES BATIMENTS ====================

// Get all batiments
app.get('/api/batiments', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const batiments = await conn.query('SELECT * FROM batiment ORDER BY nom');
        conn.release();
        
        res.json(batiments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ROUTES SALLES ====================

// Get all salles
app.get('/api/salles', async (req, res) => {
    try {
        const { type, batiment_id } = req.query;
        let query = `
            SELECT s.*, b.nom as batiment_nom 
            FROM salle s 
            JOIN batiment b ON s.batiment_id = b.id 
            WHERE 1=1
        `;
        const params = [];

        if (type) {
            query += ' AND s.type_salle = ?';
            params.push(type);
        }

        if (batiment_id) {
            query += ' AND s.batiment_id = ?';
            params.push(batiment_id);
        }

        query += ' ORDER BY b.nom, s.nom';

        const conn = await pool.getConnection();
        const salles = await conn.query(query, params);
        conn.release();
        
        res.json(salles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check salle availability
app.get('/api/salles/:id/disponibilite', async (req, res) => {
    try {
        const { date_debut, date_fin } = req.query;
        
        if (!date_debut || !date_fin) {
            return res.status(400).json({ error: 'Dates de début et fin requises' });
        }

        const conn = await pool.getConnection();
        
        // Vérifier les conflits de cours
        const [conflits] = await conn.query(`
            SELECT COUNT(*) as conflits 
            FROM cours 
            WHERE salle_id = ? 
            AND statut != 'annule'
            AND ((? BETWEEN date_debut AND date_fin) 
                 OR (? BETWEEN date_debut AND date_fin)
                 OR (date_debut BETWEEN ? AND ?))
        `, [req.params.id, date_debut, date_fin, date_debut, date_fin]);

        res.json({ 
            disponible: conflits.conflits === 0,
            conflits: conflits.conflits
        });
        
        conn.release();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ROUTES MATIERES ====================

// Get all matieres
app.get('/api/matieres', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const matieres = await conn.query(`
            SELECT m.*, f.nom as filiere_nom, u.nom as enseignant_nom, u.prenom as enseignant_prenom
            FROM matiere m
            LEFT JOIN filiere f ON m.filiere_id = f.id
            LEFT JOIN enseignant e ON m.enseignant_responsable_id = e.id
            LEFT JOIN utilisateur u ON e.utilisateur_id = u.id
            ORDER BY m.nom
        `);
        conn.release();
        
        res.json(matieres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get matieres by filiere
app.get('/api/filieres/:filiereId/matieres', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const matieres = await conn.query(`
            SELECT m.*, u.nom as enseignant_nom, u.prenom as enseignant_prenom
            FROM matiere m
            LEFT JOIN enseignant e ON m.enseignant_responsable_id = e.id
            LEFT JOIN utilisateur u ON e.utilisateur_id = u.id
            WHERE m.filiere_id = ?
            ORDER BY m.semestre, m.nom
        `, [req.params.filiereId]);
        conn.release();
        
        res.json(matieres);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ROUTES ENSEIGNANTS ====================

// Get all enseignants
app.get('/api/enseignants', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const enseignants = await conn.query(`
            SELECT e.*, u.nom, u.prenom, u.email
            FROM enseignant e
            JOIN utilisateur u ON e.utilisateur_id = u.id
            WHERE e.actif = TRUE
            ORDER BY u.nom, u.prenom
        `);
        conn.release();
        
        res.json(enseignants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ROUTES INDISPONIBILITES ====================

// Get all indisponibilites
app.get('/api/indisponibilites', async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const indisponibilites = await conn.query(`
            SELECT i.*, u.nom as enseignant_nom, u.prenom as enseignant_prenom
            FROM indisponibilite i
            JOIN enseignant e ON i.enseignant_id = e.id
            JOIN utilisateur u ON e.utilisateur_id = u.id
            ORDER BY i.date_debut DESC
        `);
        conn.release();
        
        res.json(indisponibilites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ROUTES COURS ====================

// Get all courses with filters
app.get('/api/cours', async (req, res) => {
    try {
        const { filiere_id, enseignant_id, date_debut, date_fin } = req.query;
        
        let query = `
            SELECT c.*, 
                   m.nom as matiere_nom,
                   m.code as matiere_code,
                   u.nom as enseignant_nom,
                   u.prenom as enseignant_prenom,
                   s.nom as salle_nom,
                   fil.nom as filiere_nom
            FROM cours c
            JOIN matiere m ON c.matiere_id = m.id
            JOIN enseignant e ON c.enseignant_id = e.id
            JOIN utilisateur u ON e.utilisateur_id = u.id
            JOIN salle s ON c.salle_id = s.id
            JOIN filiere fil ON c.filiere_id = fil.id
            WHERE c.statut != 'annule'
        `;
        
        const params = [];

        if (filiere_id) {
            query += ' AND c.filiere_id = ?';
            params.push(filiere_id);
        }

        if (enseignant_id) {
            query += ' AND c.enseignant_id = ?';
            params.push(enseignant_id);
        }

        if (date_debut && date_fin) {
            query += ' AND c.date_debut BETWEEN ? AND ?';
            params.push(date_debut, date_fin);
        }

        query += ' ORDER BY c.date_debut';

        const conn = await pool.getConnection();
        const cours = await conn.query(query, params);
        conn.release();
        
        res.json(cours);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new course
app.post('/api/cours', authenticateToken, authorize(['admin']), async (req, res) => {
    try {
        const {
            matiere_id,
            enseignant_id,
            salle_id,
            filiere_id,
            date_debut,
            date_fin,
            type_seance,
            observations
        } = req.body;

        // Validation des données requises
        if (!matiere_id || !enseignant_id || !salle_id || !filiere_id || !date_debut || !date_fin) {
            return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
        }

        const conn = await pool.getConnection();

        // Vérifier les conflits
        const [conflitSalle] = await conn.query(`
            SELECT COUNT(*) as conflits 
            FROM cours 
            WHERE salle_id = ? 
            AND statut != 'annule'
            AND ((? BETWEEN date_debut AND date_fin) 
                 OR (? BETWEEN date_debut AND date_fin)
                 OR (date_debut BETWEEN ? AND ?))
        `, [salle_id, date_debut, date_fin, date_debut, date_fin]);

        const [conflitEnseignant] = await conn.query(`
            SELECT COUNT(*) as conflits 
            FROM cours 
            WHERE enseignant_id = ? 
            AND statut != 'annule'
            AND ((? BETWEEN date_debut AND date_fin) 
                 OR (? BETWEEN date_debut AND date_fin)
                 OR (date_debut BETWEEN ? AND ?))
        `, [enseignant_id, date_debut, date_fin, date_debut, date_fin]);

        if (conflitSalle.conflits > 0) {
            conn.release();
            return res.status(400).json({ error: 'La salle n\'est pas disponible à cette heure' });
        }

        if (conflitEnseignant.conflits > 0) {
            conn.release();
            return res.status(400).json({ error: 'L\'enseignant n\'est pas disponible à cette heure' });
        }

        // Créer le cours
        const result = await conn.query(`
            INSERT INTO cours (matiere_id, enseignant_id, salle_id, filiere_id, date_debut, date_fin, type_seance, observations, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [matiere_id, enseignant_id, salle_id, filiere_id, date_debut, date_fin, type_seance || 'cours', observations, req.user.id]);

        // Récupérer le cours créé
        const [nouveauCours] = await conn.query(`
            SELECT c.*, 
                   m.nom as matiere_nom,
                   u.nom as enseignant_nom,
                   u.prenom as enseignant_prenom,
                   s.nom as salle_nom
            FROM cours c
            JOIN matiere m ON c.matiere_id = m.id
            JOIN enseignant e ON c.enseignant_id = e.id
            JOIN utilisateur u ON e.utilisateur_id = u.id
            JOIN salle s ON c.salle_id = s.id
            WHERE c.id = ?
        `, [result.insertId]);

        conn.release();
        
        res.status(201).json(nouveauCours);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update course
app.put('/api/cours/:id', authenticateToken, authorize(['admin']), async (req, res) => {
    try {
        const { statut, motif_annulation } = req.body;

        const conn = await pool.getConnection();
        
        await conn.query(
            'UPDATE cours SET statut = ?, motif_annulation = ? WHERE id = ?',
            [statut, motif_annulation, req.params.id]
        );

        const [cours] = await conn.query('SELECT * FROM cours WHERE id = ?', [req.params.id]);
        conn.release();
        
        res.json(cours);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ROUTES STATISTIQUES ====================

// Get dashboard statistics
app.get('/api/statistiques', authenticateToken, async (req, res) => {
    try {
        const conn = await pool.getConnection();
        
        const [totalCours] = await conn.query('SELECT COUNT(*) as total FROM cours WHERE statut != "annule"');
        const [coursPlanifies] = await conn.query('SELECT COUNT(*) as total FROM cours WHERE statut = "planifie"');
        const [coursConfirmes] = await conn.query('SELECT COUNT(*) as total FROM cours WHERE statut = "confirme"');
        const [totalEnseignants] = await conn.query('SELECT COUNT(*) as total FROM enseignant WHERE actif = TRUE');
        const [totalSalles] = await conn.query('SELECT COUNT(*) as total FROM salle');
        const [totalFilieres] = await conn.query('SELECT COUNT(*) as total FROM filiere');

        const stats = {
            totalCours: totalCours.total,
            coursPlanifies: coursPlanifies.total,
            coursConfirmes: coursConfirmes.total,
            totalEnseignants: totalEnseignants.total,
            totalSalles: totalSalles.total,
            totalFilieres: totalFilieres.total
        };

        conn.release();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ROUTES PUBLICATION EMPLOI DU TEMPS ====================

// Get published schedules
app.get('/api/publications', async (req, res) => {
    try {
        const { filiere_id, annee_academique, semestre } = req.query;
        
        let query = `
            SELECT p.*, f.nom as filiere_nom, u.nom as publie_par_nom
            FROM publication_emploi_du_temps p
            JOIN filiere f ON p.filiere_id = f.id
            LEFT JOIN utilisateur u ON p.publie_par = u.id
            WHERE p.statut = 'publie'
        `;
        
        const params = [];

        if (filiere_id) {
            query += ' AND p.filiere_id = ?';
            params.push(filiere_id);
        }

        if (annee_academique) {
            query += ' AND p.annee_academique = ?';
            params.push(annee_academique);
        }

        if (semestre) {
            query += ' AND p.semestre = ?';
            params.push(semestre);
        }

        query += ' ORDER BY p.date_publication DESC';

        const conn = await pool.getConnection();
        const publications = await conn.query(query, params);
        conn.release();
        
        res.json(publications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ROUTE RACINE ====================

app.get('/', (req, res) => {
    res.json({ 
        message: 'API Gestion Universitaire - Université de Mongo',
        status: 'Fonctionnel',
        database: dbConnected ? 'MariaDB (Connectée)' : 'Non connectée',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth/login',
            utilisateurs: '/api/utilisateurs',
            facultes: '/api/facultes',
            departements: '/api/departements',
            filieres: '/api/filieres',
            batiments: '/api/batiments',
            salles: '/api/salles',
            matieres: '/api/matieres',
            cours: '/api/cours',
            enseignants: '/api/enseignants',
            indisponibilites: '/api/indisponibilites',
            statistiques: '/api/statistiques',
            publications: '/api/publications',
            emploiDuTemps: {
                enseignant: '/api/emploi-du-temps/enseignant',
                etudiant: '/api/emploi-du-temps/etudiant',
                admin: '/api/emploi-du-temps/admin'
            }
        }
    });
});

// ==================== GESTION DES ERREURS ====================

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint non trouvé' });
});

// ==================== INITIALISATION DU SERVEUR ====================

async function initializeServer() {
    console.log('🔧 Initialisation du serveur...');
    
    await connectDatabase();
    
    app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur le port ${PORT}`);
        console.log(`📍 URL: http://localhost:${PORT}`);
        console.log(`📊 Base de données: ${dbConnected ? 'MariaDB (Connectée)' : 'Non connectée'}`);
        console.log('💡 API de gestion universitaire prête !');
        console.log('👥 Comptes de test disponibles:');
        console.log('   - Admin: admin@univ-mongo.com / admin123');
        console.log('   - Enseignant: enseignant@univ-mongo.com / enseignant123');
        console.log('   - Étudiant: etudiant@univ-mongo.com / etudiant123');
    });
}

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
    console.log('\n🛑 Arrêt du serveur...');
    if (pool) await pool.end();
    process.exit(0);
});

initializeServer().catch(console.error);