-- Création de la base de données
CREATE DATABASE IF NOT EXISTS universite_mongo;
USE universite_mongo;

-- Table des utilisateurs
CREATE TABLE utilisateur (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('admin', 'enseignant', 'etudiant') NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Table des facultés
CREATE TABLE faculte (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des départements
CREATE TABLE departement (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    faculte_id INT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculte_id) REFERENCES faculte(id) ON DELETE SET NULL
);

-- Table des filières
CREATE TABLE filiere (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    departement_id INT,
    duree_etudes INT, -- en semestres
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (departement_id) REFERENCES departement(id) ON DELETE SET NULL
);

-- Table des bâtiments
CREATE TABLE batiment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    adresse TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des salles
CREATE TABLE salle (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    capacite INT NOT NULL,
    equipements TEXT, -- JSON ou texte pour stocker les équipements
    type_salle ENUM('cours', 'laboratoire', 'amphitheatre', 'salle_etude') DEFAULT 'cours',
    batiment_id INT,
    etage INT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batiment_id) REFERENCES batiment(id) ON DELETE SET NULL
);

-- Table des enseignants
CREATE TABLE enseignant (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT UNIQUE,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    specialite VARCHAR(255),
    grade ENUM('assistant', 'maitre_assistant', 'professeur', 'professeur_titulaire'),
    telephone VARCHAR(20),
    bureau VARCHAR(100),
    date_embauche DATE,
    actif BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Table des matières
CREATE TABLE matiere (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    credits INT DEFAULT 0,
    volume_horaire_total INT, -- en heures
    filiere_id INT,
    enseignant_responsable_id INT,
    semestre INT,
    description TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filiere_id) REFERENCES filiere(id) ON DELETE CASCADE,
    FOREIGN KEY (enseignant_responsable_id) REFERENCES enseignant(id) ON DELETE SET NULL
);

-- Table des cours (emploi du temps)
CREATE TABLE cours (
    id INT PRIMARY KEY AUTO_INCREMENT,
    matiere_id INT NOT NULL,
    enseignant_id INT NOT NULL,
    salle_id INT NOT NULL,
    filiere_id INT NOT NULL,
    date_debut DATETIME NOT NULL,
    date_fin DATETIME NOT NULL,
    type_seance ENUM('cours', 'td', 'tp', 'examen') DEFAULT 'cours',
    statut ENUM('planifie', 'confirme', 'annule') DEFAULT 'planifie',
    motif_annulation TEXT,
    repetitif BOOLEAN DEFAULT FALSE,
    frequence_repetition ENUM('hebdomadaire', 'mensuelle', 'aucune') DEFAULT 'aucune',
    date_fin_repetition DATE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT, -- utilisateur qui a créé le cours
    FOREIGN KEY (matiere_id) REFERENCES matiere(id) ON DELETE CASCADE,
    FOREIGN KEY (enseignant_id) REFERENCES enseignant(id) ON DELETE CASCADE,
    FOREIGN KEY (salle_id) REFERENCES salle(id) ON DELETE CASCADE,
    FOREIGN KEY (filiere_id) REFERENCES filiere(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES utilisateur(id) ON DELETE SET NULL
);

-- Table des indisponibilités des enseignants
CREATE TABLE indisponibilite (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enseignant_id INT NOT NULL,
    date_debut DATETIME NOT NULL,
    date_fin DATETIME NOT NULL,
    raison ENUM('congé', 'maladie', 'mission', 'formation', 'autre') NOT NULL,
    description TEXT,
    statut ENUM('en_attente', 'approuvee', 'refusee') DEFAULT 'en_attente',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enseignant_id) REFERENCES enseignant(id) ON DELETE CASCADE
);

-- Table de publication des emplois du temps
CREATE TABLE publication_emploi_du_temps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filiere_id INT NOT NULL,
    semestre INT NOT NULL,
    annee_academique VARCHAR(20) NOT NULL, -- ex: "2023-2024"
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    publie_par INT, -- utilisateur admin qui a publié
    statut ENUM('brouillon', 'publie') DEFAULT 'brouillon',
    date_debut_validite DATE,
    date_fin_validite DATE,
    FOREIGN KEY (filiere_id) REFERENCES filiere(id) ON DELETE CASCADE,
    FOREIGN KEY (publie_par) REFERENCES utilisateur(id) ON DELETE SET NULL
);

-- Table des notifications
CREATE TABLE notification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type_notification ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
    lien VARCHAR(500), -- URL pour redirection
    lue BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE
);

-- Table des logs d'activité
CREATE TABLE log_activite (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT,
    action VARCHAR(255) NOT NULL,
    table_concernée VARCHAR(100),
    id_enregistrement INT,
    anciennes_valeurs JSON,
    nouvelles_valeurs JSON,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE SET NULL
);

-- Table de configuration
CREATE TABLE configuration (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cle VARCHAR(100) UNIQUE NOT NULL,
    valeur TEXT,
    description TEXT,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index pour optimiser les performances
CREATE INDEX idx_cours_dates ON cours(date_debut, date_fin);
CREATE INDEX idx_cours_enseignant ON cours(enseignant_id, date_debut);
CREATE INDEX idx_cours_salle ON cours(salle_id, date_debut);
CREATE INDEX idx_indisponibilite_dates ON indisponibilite(date_debut, date_fin);
CREATE INDEX idx_utilisateur_email ON utilisateur(email);
CREATE INDEX idx_publication_annee ON publication_emploi_du_temps(annee_academique, semestre);

-- Insertion des données de base
INSERT INTO configuration (cle, valeur, description) VALUES
('heure_debut_cours', '08:00:00', 'Heure de début des cours'),
('heure_fin_cours', '18:00:00', 'Heure de fin des cours'),
('duree_seance', '01:30:00', 'Durée standard d une séance'),
('delai_publication', '7', 'Délai de publication en jours'),
('email_notification', '1', 'Activer les notifications par email');

-- Insertion d'un administrateur par défaut (mot de passe : admin123)
INSERT INTO utilisateur (email, mot_de_passe, role, nom, prenom) VALUES
('admin@universite-mongo.mg', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Admin', 'System');

-- Insertion d'une faculté exemple
INSERT INTO faculte (nom, description) VALUES
('Faculté des Sciences et Technologies', 'Faculté dédiée aux sciences et technologies');

-- Insertion d'un département exemple
INSERT INTO departement (nom, description, faculte_id) VALUES
('Informatique', 'Département d Informatique', 1);

-- Insertion d'une filière exemple
INSERT INTO filiere (nom, code, description, departement_id, duree_etudes) VALUES
('Licence en Informatique', 'LIC-INFO', 'Licence en Informatique Fondamentale', 1, 6);

-- Insertion d'un bâtiment exemple
INSERT INTO batiment (nom, adresse) VALUES
('Bâtiment A', 'Campus Principal, Université de Mongo');

-- Insertion de salles exemple
INSERT INTO salle (nom, capacite, equipements, type_salle, batiment_id, etage) VALUES
('Amphi 100', 200, 'Projecteur, Micro, Climatisation', 'amphitheatre', 1, 1),
('Salle 101', 30, 'Projecteur, Tableau blanc', 'cours', 1, 1),
('Labo Info 201', 25, '25 PC, Projecteur, Switch réseau', 'laboratoire', 1, 2);

-- Procédure stockée pour vérifier les conflits
DELIMITER //
CREATE PROCEDURE verifier_conflits_cours(
    IN p_salle_id INT,
    IN p_enseignant_id INT,
    IN p_date_debut DATETIME,
    IN p_date_fin DATETIME,
    IN p_cours_id INT -- NULL pour nouvelle création
)
BEGIN
    -- Vérifier conflit de salle
    SELECT COUNT(*) as conflit_salle 
    FROM cours 
    WHERE salle_id = p_salle_id 
    AND ((p_date_debut BETWEEN date_debut AND date_fin) 
         OR (p_date_fin BETWEEN date_debut AND date_fin)
         OR (date_debut BETWEEN p_date_debut AND p_date_fin))
    AND statut != 'annule'
    AND (p_cours_id IS NULL OR id != p_cours_id);

    -- Vérifier conflit d'enseignant
    SELECT COUNT(*) as conflit_enseignant 
    FROM cours 
    WHERE enseignant_id = p_enseignant_id 
    AND ((p_date_debut BETWEEN date_debut AND date_fin) 
         OR (p_date_fin BETWEEN date_debut AND date_fin)
         OR (date_debut BETWEEN p_date_debut AND p_date_fin))
    AND statut != 'annule'
    AND (p_cours_id IS NULL OR id != p_cours_id);

    -- Vérifier indisponibilité de l'enseignant
    SELECT COUNT(*) as indisponible 
    FROM indisponibilite 
    WHERE enseignant_id = p_enseignant_id 
    AND statut = 'approuvee'
    AND ((p_date_debut BETWEEN date_debut AND date_fin) 
         OR (p_date_fin BETWEEN date_debut AND date_fin));
END //
DELIMITER ;

-- Trigger pour loguer les modifications sur la table cours
DELIMITER //
CREATE TRIGGER log_modification_cours
AFTER UPDATE ON cours
FOR EACH ROW
BEGIN
    IF OLD.statut != NEW.statut OR OLD.date_debut != NEW.date_debut OR OLD.salle_id != NEW.salle_id THEN
        INSERT INTO log_activite (utilisateur_id, action, table_concernée, id_enregistrement, anciennes_valeurs, nouvelles_valeurs)
        VALUES (
            NEW.created_by, 
            'MODIFICATION_COURS', 
            'cours', 
            NEW.id,
            JSON_OBJECT('statut', OLD.statut, 'date_debut', OLD.date_debut, 'salle_id', OLD.salle_id),
            JSON_OBJECT('statut', NEW.statut, 'date_debut', NEW.date_debut, 'salle_id', NEW.salle_id)
        );
    END IF;
END //
DELIMITER ;

-- Vue pour les emplois du temps avec toutes les informations
CREATE VIEW vue_emploi_du_temps AS
SELECT 
    c.id,
    c.date_debut,
    c.date_fin,
    c.type_seance,
    c.statut,
    m.nom as matiere_nom,
    m.code as matiere_code,
    e.nom as enseignant_nom,
    e.prenom as enseignant_prenom,
    s.nom as salle_nom,
    s.capacite,
    b.nom as batiment_nom,
    f.nom as filiere_nom,
    f.code as filiere_code,
    d.nom as departement_nom,
    fac.nom as faculte_nom
FROM cours c
JOIN matiere m ON c.matiere_id = m.id
JOIN enseignant en ON c.enseignant_id = en.id
JOIN utilisateur e ON en.utilisateur_id = e.id
JOIN salle s ON c.salle_id = s.id
JOIN batiment b ON s.batiment_id = b.id
JOIN filiere f ON c.filiere_id = f.id
JOIN departement d ON f.departement_id = d.id
JOIN faculte fac ON d.faculte_id = fac.id
WHERE c.statut != 'annule';
