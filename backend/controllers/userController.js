const db = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT 
        u.id, u.nom, u.prenom, u.email, u.role, u.telephone, u.filiere_id,
        u.date_creation, u.derniere_connexion,
        f.nom as filiere_nom,
        e.matricule, e.specialite, e.grade
      FROM utilisateur u 
      LEFT JOIN enseignant e ON u.id = e.utilisateur_id 
      LEFT JOIN filiere f ON u.filiere_id = f.id
      ORDER BY u.date_creation DESC
    `);
    res.json(users);
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { nom, prenom, email, role, telephone, filiere_id, matricule, specialite, grade } = req.body;

    // Vérifier si l'email existe déjà
    const [existingUser] = await db.execute(
      'SELECT id FROM utilisateur WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Mot de passe par défaut
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Démarrer une transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Créer l'utilisateur
      const [userResult] = await connection.execute(
        `INSERT INTO utilisateur 
         (nom, prenom, email, password, role, telephone, filiere_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nom, prenom, email, hashedPassword, role, telephone, filiere_id || null]
      );

      const userId = userResult.insertId;

      // Si c'est un enseignant, créer l'entrée dans la table enseignant
      if (role === 'enseignant' && matricule) {
        await connection.execute(
          `INSERT INTO enseignant (utilisateur_id, matricule, specialite, grade) 
           VALUES (?, ?, ?, ?)`,
          [userId, matricule, specialite || null, grade || null]
        );
      }

      await connection.commit();

      res.status(201).json({ 
        message: 'Utilisateur créé avec succès', 
        id: userId,
        password: defaultPassword // À envoyer par email en production
      });

    } catch (transactionError) {
      await connection.rollback();
      throw transactionError;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, role, telephone, filiere_id, matricule, specialite, grade } = req.body;

    // Vérifier si l'utilisateur existe
    const [user] = await db.execute(
      'SELECT id, role FROM utilisateur WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const [emailCheck] = await db.execute(
      'SELECT id FROM utilisateur WHERE email = ? AND id != ?',
      [email, id]
    );

    if (emailCheck.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Démarrer une transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Mettre à jour l'utilisateur
      await connection.execute(
        `UPDATE utilisateur 
         SET nom = ?, prenom = ?, email = ?, role = ?, telephone = ?, filiere_id = ?
         WHERE id = ?`,
        [nom, prenom, email, role, telephone, filiere_id || null, id]
      );

      // Gérer l'entrée enseignant
      if (role === 'enseignant') {
        const [existingEnseignant] = await connection.execute(
          'SELECT id FROM enseignant WHERE utilisateur_id = ?',
          [id]
        );

        if (existingEnseignant.length > 0) {
          // Mettre à jour l'enseignant existant
          await connection.execute(
            `UPDATE enseignant 
             SET matricule = ?, specialite = ?, grade = ?
             WHERE utilisateur_id = ?`,
            [matricule, specialite || null, grade || null, id]
          );
        } else if (matricule) {
          // Créer une nouvelle entrée enseignant
          await connection.execute(
            `INSERT INTO enseignant (utilisateur_id, matricule, specialite, grade) 
             VALUES (?, ?, ?, ?)`,
            [id, matricule, specialite || null, grade || null]
          );
        }
      } else {
        // Supprimer l'entrée enseignant si le rôle change
        await connection.execute(
          'DELETE FROM enseignant WHERE utilisateur_id = ?',
          [id]
        );
      }

      await connection.commit();
      res.json({ message: 'Utilisateur modifié avec succès' });

    } catch (transactionError) {
      await connection.rollback();
      throw transactionError;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erreur modification utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la modification' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Empêcher la suppression de l'admin principal
    const [user] = await db.execute(
      'SELECT role, email FROM utilisateur WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user[0].role === 'admin' && user[0].email === 'admin@univ-mongo.com') {
      return res.status(400).json({ error: 'Impossible de supprimer l\'admin principal' });
    }

    // Démarrer une transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Supprimer d'abord les entrées liées dans enseignant
      await connection.execute(
        'DELETE FROM enseignant WHERE utilisateur_id = ?',
        [id]
      );

      // Puis supprimer l'utilisateur
      await connection.execute(
        'DELETE FROM utilisateur WHERE id = ?',
        [id]
      );

      await connection.commit();
      res.json({ message: 'Utilisateur supprimé avec succès' });

    } catch (transactionError) {
      await connection.rollback();
      throw transactionError;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cet utilisateur car il est référencé dans d\'autres tables' 
      });
    }
    
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await db.execute(`
      SELECT 
        u.id, u.nom, u.prenom, u.email, u.role, u.telephone, u.filiere_id,
        u.date_creation, u.derniere_connexion,
        f.nom as filiere_nom,
        e.matricule, e.specialite, e.grade
      FROM utilisateur u 
      LEFT JOIN enseignant e ON u.id = e.utilisateur_id 
      LEFT JOIN filiere f ON u.filiere_id = f.id
      WHERE u.id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};