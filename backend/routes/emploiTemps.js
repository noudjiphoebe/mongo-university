const pool = require('../database');

// GET - Liste des cours
const getCours = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT c.*, m.nom as matiere_nom, m.code as matiere_code,
                   u.nom as enseignant_nom, u.prenom as enseignant_prenom,
                   s.nom as salle_nom, s.capacite, b.nom as batiment_nom,
                   f.nom as filiere_nom, f.code as filiere_code
            FROM cours c
            JOIN matiere m ON c.matiere_id = m.id
            JOIN enseignant e ON c.enseignant_id = e.id
            JOIN utilisateur u ON e.utilisateur_id = u.id
            JOIN salle s ON c.salle_id = s.id
            JOIN batiment b ON s.batiment_id = b.id
            JOIN filiere f ON c.filiere_id = f.id
            WHERE c.statut != 'annule'
            ORDER BY c.date_debut DESC
        `;
        const cours = await conn.query(query);
        res.json(cours);
    } catch (error) {
        console.error('Erreur getCours:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
        if (conn) conn.release();
    }
};

// POST - Créer un cours
const createCours = async (req, res) => {
    let conn;
    try {
        const {
            matiere_id,
            enseignant_id,
            salle_id,
            filiere_id,
            date_debut,
            date_fin,
            type_seance,
            statut = 'planifie'
        } = req.body;

        conn = await pool.getConnection();

        // Vérifier les conflits
        const conflitQuery = `
            SELECT COUNT(*) as conflit 
            FROM cours 
            WHERE salle_id = ? 
            AND ((? BETWEEN date_debut AND date_fin) OR (? BETWEEN date_debut AND date_fin))
            AND statut != 'annule'
        `;
        const conflits = await conn.query(conflitQuery, [salle_id, date_debut, date_fin]);

        if (conflits[0].conflit > 0) {
            return res.status(400).json({ message: 'Conflit de salle détecté' });
        }

        const query = `
            INSERT INTO cours (matiere_id, enseignant_id, salle_id, filiere_id, 
                             date_debut, date_fin, type_seance, statut, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        `;
        const result = await conn.query(query, [
            matiere_id, enseignant_id, salle_id, filiere_id,
            date_debut, date_fin, type_seance, statut
        ]);

        res.status(201).json({ 
            message: 'Cours créé avec succès', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Erreur createCours:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
        if (conn) conn.release();
    }
};

// GET - Recherche de cours
const searchCours = async (req, res) => {
    let conn;
    try {
        const { matiere, enseignant, salle, filiere, date_debut, date_fin, type_seance, statut } = req.query;
        
        conn = await pool.getConnection();
        
        let query = `
            SELECT c.*, m.nom as matiere_nom, u.nom as enseignant_nom, 
                   s.nom as salle_nom, f.nom as filiere_nom
            FROM cours c
            JOIN matiere m ON c.matiere_id = m.id
            JOIN enseignant e ON c.enseignant_id = e.id
            JOIN utilisateur u ON e.utilisateur_id = u.id
            JOIN salle s ON c.salle_id = s.id
            JOIN filiere f ON c.filiere_id = f.id
            WHERE 1=1
        `;
        const params = [];

        if (matiere) {
            query += ' AND m.nom LIKE ?';
            params.push(`%${matiere}%`);
        }
        if (enseignant) {
            query += ' AND (u.nom LIKE ? OR u.prenom LIKE ?)';
            params.push(`%${enseignant}%`, `%${enseignant}%`);
        }
        if (salle) {
            query += ' AND s.nom LIKE ?';
            params.push(`%${salle}%`);
        }
        if (filiere) {
            query += ' AND f.nom LIKE ?';
            params.push(`%${filiere}%`);
        }
        if (date_debut) {
            query += ' AND c.date_debut >= ?';
            params.push(date_debut);
        }
        if (date_fin) {
            query += ' AND c.date_fin <= ?';
            params.push(date_fin);
        }
        if (type_seance) {
            query += ' AND c.type_seance = ?';
            params.push(type_seance);
        }
        if (statut) {
            query += ' AND c.statut = ?';
            params.push(statut);
        }

        query += ' ORDER BY c.date_debut DESC';

        const resultats = await conn.query(query, params);
        res.json(resultats);
    } catch (error) {
        console.error('Erreur searchCours:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
        if (conn) conn.release();
    }
};

// GET - Liste des bâtiments
const getBatiments = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT b.*, 
                   COUNT(s.id) as nombre_salles,
                   GROUP_CONCAT(s.nom SEPARATOR ', ') as salles
            FROM batiment b
            LEFT JOIN salle s ON b.id = s.batiment_id
            GROUP BY b.id
            ORDER BY b.nom
        `;
        const batiments = await conn.query(query);
        res.json(batiments);
    } catch (error) {
        console.error('Erreur getBatiments:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
        if (conn) conn.release();
    }
};

// GET - Disponibilité des enseignants
const getDisponibiliteEnseignants = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT e.id, u.nom, u.prenom, e.specialite, e.grade,
                   COUNT(c.id) as cours_planifies,
                   GROUP_CONCAT(DISTINCT m.nom SEPARATOR ', ') as matieres
            FROM enseignant e
            JOIN utilisateur u ON e.utilisateur_id = u.id
            LEFT JOIN cours c ON e.id = c.enseignant_id AND c.statut = 'planifie'
            LEFT JOIN matiere m ON c.matiere_id = m.id
            WHERE e.actif = TRUE
            GROUP BY e.id
            ORDER BY u.nom, u.prenom
        `;
        const enseignants = await conn.query(query);
        res.json(enseignants);
    } catch (error) {
        console.error('Erreur getDisponibiliteEnseignants:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
        if (conn) conn.release();
    }
};

// GET - Disponibilité des salles
const getDisponibiliteSalles = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT s.*, b.nom as batiment_nom,
                   COUNT(c.id) as cours_planifies,
                   (SELECT COUNT(*) FROM cours c2 
                    WHERE c2.salle_id = s.id 
                    AND c2.date_debut >= NOW() 
                    AND c2.statut = 'planifie') as cours_futurs
            FROM salle s
            JOIN batiment b ON s.batiment_id = b.id
            LEFT JOIN cours c ON s.id = c.salle_id AND c.statut = 'planifie'
            GROUP BY s.id
            ORDER BY b.nom, s.nom
        `;
        const salles = await conn.query(query);
        res.json(salles);
    } catch (error) {
        console.error('Erreur getDisponibiliteSalles:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
        if (conn) conn.release();
    }
};

// GET - Informations d'une salle
const getSalleInfo = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT s.*, b.nom as batiment_nom
            FROM salle s
            JOIN batiment b ON s.batiment_id = b.id
            WHERE s.id = ?
        `;
        const salle = await conn.query(query, [req.params.id]);
        res.json(salle[0] || {});
    } catch (error) {
        console.error('Erreur getSalleInfo:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
        if (conn) conn.release();
    }
};

// GET - Informations d'un enseignant
const getEnseignantInfo = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT e.*, u.nom, u.prenom
            FROM enseignant e
            JOIN utilisateur u ON e.utilisateur_id = u.id
            WHERE e.id = ?
        `;
        const enseignant = await conn.query(query, [req.params.id]);
        res.json(enseignant[0] || {});
    } catch (error) {
        console.error('Erreur getEnseignantInfo:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
        if (conn) conn.release();
    }
};

// GET - Matières
const getMatieres = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const matieres = await conn.query('SELECT * FROM matiere');
        res.json(matieres);
    } catch (error) {
        console.error('Erreur getMatieres:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
        if (conn) conn.release();
    }
};

// GET - Enseignants
const getEnseignants = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT e.*, u.nom, u.prenom 
            FROM enseignant e 
            JOIN utilisateur u ON e.utilisateur_id = u.id 
            WHERE e.actif = TRUE
        `;
        const enseignants = await conn.query(query);
        res.json(enseignants);
    } catch (error) {
        console.error('Erreur getEnseignants:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
        if (conn) conn.release();
    }
};

// GET - Salles
const getSalles = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const query = `
            SELECT s.*, b.nom as batiment_nom 
            FROM salle s 
            JOIN batiment b ON s.batiment_id = b.id
        `;
        const salles = await conn.query(query);
        res.json(salles);
    } catch (error) {
        console.error('Erreur getSalles:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
        if (conn) conn.release();
    }
};

// GET - Filieres
const getFilieres = async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const filieres = await conn.query('SELECT * FROM filiere');
        res.json(filieres);
    } catch (error) {
        console.error('Erreur getFilieres:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    } finally {
        if (conn) conn.release();
    }
};

module.exports = {
    getCours,
    createCours,
    searchCours,
    getBatiments,
    getDisponibiliteEnseignants,
    getDisponibiliteSalles,
    getSalleInfo,
    getEnseignantInfo,
    getMatieres,
    getEnseignants,
    getSalles,
    getFilieres
};