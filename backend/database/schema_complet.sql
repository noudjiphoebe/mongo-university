-- ==================== CRÉATION DE LA BASE DE DONNÉES ====================
CREATE DATABASE IF NOT EXISTS universite_mongo;
USE universite_mongo;

-- ==================== CRÉATION DES TABLES ====================

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
    code VARCHAR(50),
    description TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Table des départements
CREATE TABLE departement (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    faculte_id INT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE,
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
    actif BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (departement_id) REFERENCES departement(id) ON DELETE SET NULL
);

-- Table des bâtiments
CREATE TABLE batiment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    adresse TEXT,
    nombre_etages INT,
    description TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE
);

-- Table des salles
CREATE TABLE salle (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    capacite INT NOT NULL,
    equipements TEXT,
    type_salle ENUM('cours', 'laboratoire', 'amphitheatre', 'salle_etude', 'bibliotheque', 'informatique', 'atelier') DEFAULT 'cours',
    batiment_id INT,
    etage INT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE,
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
    volume_horaire INT, -- en heures
    filiere_id INT,
    enseignant_responsable_id INT,
    semestre INT,
    description TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE,
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
    created_by INT,
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
    annee_academique VARCHAR(20) NOT NULL,
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    publie_par INT,
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
    lien VARCHAR(500),
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

-- ==================== INSERTION DES DONNÉES UPM ====================

-- 1. Facultés UPM
INSERT INTO faculte (nom, code, description, actif) VALUES
('Sciences et Technologies', 'FST', 'Faculté des Sciences et Technologies', TRUE),
('Génie Civil et Architecture', 'FGCA', 'Faculté de Génie Civil et Architecture', TRUE),
('Génie Géologique et Minier', 'FGGM', 'Faculté de Génie Géologique et Minier', TRUE),
('Génie Mécanique et Energétique', 'FGME', 'Faculté de Génie Mécanique et Energétique', TRUE),
('Génie Industriel et Maintenance', 'FGIM', 'Faculté de Génie Industriel et Maintenance', TRUE);

-- 2. Départements
INSERT INTO departement (faculte_id, nom, code, description, actif) VALUES
(1, 'Sciences Fondamentales', 'SF', 'Département des Sciences Fondamentales', TRUE),
(2, 'Génie Civil', 'GC', 'Département de Génie Civil', TRUE),
(3, 'Génie Géologique', 'GG', 'Département de Génie Géologique', TRUE),
(4, 'Génie Mécanique', 'GM', 'Département de Génie Mécanique', TRUE),
(5, 'Génie Industriel', 'GI', 'Département de Génie Industriel', TRUE);

-- 3. Filières par département
INSERT INTO filiere (departement_id, nom, code, duree_etudes, description, actif) VALUES
-- Sciences Fondamentales
(1, 'Licence Sciences Fondamentales', 'LSF', 3, 'Licence en Sciences Fondamentales', TRUE),

-- Génie Civil
(2, 'Licence Génie Civil', 'LGC', 3, 'Licence en Génie Civil', TRUE),
(2, 'Master Génie Civil', 'MGC', 2, 'Master en Génie Civil', TRUE),

-- Génie Géologique
(3, 'Licence Génie Géologique', 'LGG', 3, 'Licence en Génie Géologique', TRUE),
(3, 'Master Génie Minier', 'MGM', 2, 'Master en Génie Minier', TRUE),

-- Génie Mécanique
(4, 'Licence Génie Mécanique', 'LGM', 3, 'Licence en Génie Mécanique', TRUE),
(4, 'Master Energétique', 'MEN', 2, 'Master en Energétique', TRUE),

-- Génie Industriel
(5, 'Licence Génie Industriel', 'LGI', 3, 'Licence en Génie Industriel', TRUE),
(5, 'Master Maintenance Industrielle', 'MMI', 2, 'Master en Maintenance Industrielle', TRUE);

-- 4. Utilisateurs UPM
INSERT INTO utilisateur (email, mot_de_passe, role, nom, prenom, actif) VALUES
('admin@upm.mg', 'admin123', 'admin', 'Administrateur', 'UPM', TRUE),
('enseignant@upm.mg', 'enseignant123', 'enseignant', 'Enseignant', 'UPM', TRUE),
('etudiant@upm.mg', 'etudiant123', 'etudiant', 'Étudiant', 'UPM', TRUE),
('prof.math@upm.mg', 'enseignant123', 'enseignant', 'Rakoto', 'Jean', TRUE),
('prof.physique@upm.mg', 'enseignant123', 'enseignant', 'Rasoa', 'Marie', TRUE),
('prof.chimie@upm.mg', 'enseignant123', 'enseignant', 'Randria', 'Pierre', TRUE),
('prof.gcivil@upm.mg', 'enseignant123', 'enseignant', 'Rabe', 'Joseph', TRUE),
('prof.geologie@upm.mg', 'enseignant123', 'enseignant', 'Ranaivo', 'Luc', TRUE),
('prof.mecanique@upm.mg', 'enseignant123', 'enseignant', 'Rajson', 'Henri', TRUE),
('prof.industriel@upm.mg', 'enseignant123', 'enseignant', 'Ralison', 'Paul', TRUE);

-- 5. Enseignants UPM
INSERT INTO enseignant (utilisateur_id, matricule, specialite, grade, actif) VALUES
(4, 'ENS001', 'Toutes les matières', 'professeur', TRUE),
(5, 'ENS002', 'Mathématiques', 'professeur', TRUE),
(6, 'ENS003', 'Physique', 'maitre_assistant', TRUE),
(7, 'ENS004', 'Chimie', 'maitre_assistant', TRUE),
(8, 'ENS005', 'Génie Civil', 'professeur', TRUE),
(9, 'ENS006', 'Géologie', 'professeur', TRUE),
(10, 'ENS007', 'Génie Mécanique', 'maitre_assistant', TRUE),
(11, 'ENS008', 'Génie Industriel', 'maitre_assistant', TRUE);

-- 6. Bâtiments UPM
INSERT INTO batiment (nom, code, adresse, nombre_etages, description, actif) VALUES
('Bâtiment Principal - Sciences', 'BPS', 'Campus Central UPM', 4, 'Bâtiment principal des sciences', TRUE),
('Bâtiment Génie Civil', 'BGC', 'Campus Nord UPM', 3, 'Bâtiment dédié au génie civil', TRUE),
('Bâtiment Géologie', 'BGG', 'Campus Est UPM', 3, 'Bâtiment des sciences de la terre', TRUE),
('Bâtiment Mécanique', 'BGM', 'Campus Ouest UPM', 3, 'Ateliers et laboratoires mécaniques', TRUE),
('Bâtiment Industriel', 'BGI', 'Campus Sud UPM', 3, 'Bâtiment du génie industriel', TRUE),
('Amphithéâtre Central', 'AMPHI', 'Campus Central UPM', 1, 'Grand amphithéâtre de 500 places', TRUE),
('Bibliothèque Universitaire', 'BU', 'Campus Central UPM', 2, 'Bibliothèque centrale UPM', TRUE);

-- 7. Salles par bâtiment
INSERT INTO salle (batiment_id, nom, code, type_salle, capacite, equipements, actif) VALUES
-- Bâtiment Principal Sciences
(1, 'Amphithéâtre A', 'BPS-A1', 'amphitheatre', 200, 'Vidéoprojecteur, sonorisation', TRUE),
(1, 'Laboratoire Physique', 'BPS-L1', 'laboratoire', 30, 'Appareils de mesure, ordinateurs', TRUE),
(1, 'Laboratoire Chimie', 'BPS-L2', 'laboratoire', 30, 'Hottes, produits chimiques', TRUE),
(1, 'Salle Informatique', 'BPS-SI1', 'informatique', 40, '30 ordinateurs, réseau', TRUE),

-- Bâtiment Génie Civil
(2, 'Atelier Construction', 'BGC-A1', 'atelier', 25, 'Matériaux, outils de construction', TRUE),
(2, 'Laboratoire Matériaux', 'BGC-L1', 'laboratoire', 20, 'Presses, fours, microscopes', TRUE),
(2, 'Salle de Dessin', 'BGC-SD1', 'salle_cours', 30, 'Tables à dessin, CAO', TRUE),

-- Bâtiment Géologie
(3, 'Laboratoire Pétrologie', 'BGG-L1', 'laboratoire', 20, 'Microscopes polarisants, échantillons', TRUE),
(3, 'Salle Cartographie', 'BGG-SC1', 'salle_cours', 25, 'Cartes, tables lumineuses', TRUE),

-- Bâtiment Mécanique
(4, 'Atelier Usinage', 'BGM-A1', 'atelier', 20, 'Tours, fraiseuses, machines-outils', TRUE),
(4, 'Laboratoire Métrologie', 'BGM-L1', 'laboratoire', 15, 'Instruments de mesure de précision', TRUE),

-- Bâtiment Industriel
(5, 'Laboratoire Automatisme', 'BGI-L1', 'laboratoire', 20, 'Automates, capteurs, actionneurs', TRUE),
(5, 'Salle Gestion', 'BGI-SG1', 'salle_cours', 30, 'Vidéoprojecteur, tableau blanc', TRUE),

-- Amphithéâtre Central
(6, 'Grand Amphithéâtre', 'AMPHI-A1', 'amphitheatre', 500, 'Écran géant, sonorisation complète', TRUE),

-- Bibliothèque
(7, 'Salle de Lecture', 'BU-SL1', 'bibliotheque', 100, 'Rayonnages, places assises', TRUE);

-- 8. Matières par filière et niveau
-- === SCIENCES FONDAMENTALES - Licence ===
INSERT INTO matiere (filiere_id, nom, code, semestre, volume_horaire, credits, description) VALUES
-- L1 Sciences Fondamentales
(1, 'Mathématiques Fondamentales', 'MAT101', 1, 60, 6, 'Algèbre linéaire, analyse réelle'),
(1, 'Physique Générale', 'PHY101', 1, 60, 6, 'Mécanique, thermodynamique'),
(1, 'Chimie Générale', 'CHI101', 1, 45, 4, 'Structure atomique, liaisons chimiques'),
(1, 'Informatique Fondamentale', 'INF101', 1, 45, 4, 'Algorithmique, programmation'),
(1, 'Analyse Mathématique', 'MAT102', 2, 60, 6, 'Calcul différentiel et intégral'),
(1, 'Physique Ondulatoire', 'PHY102', 2, 60, 6, 'Ondes, optique, physique moderne'),

-- L2 Sciences Fondamentales
(1, 'Algèbre Avancée', 'MAT201', 3, 60, 6, 'Structures algébriques'),
(1, 'Mécanique Analytique', 'PHY201', 3, 60, 6, 'Lagrangien, Hamiltonien'),
(1, 'Chimie Analytique', 'CHI201', 3, 45, 4, 'Techniques d analyse chimique'),
(1, 'Probabilités et Statistiques', 'MAT202', 4, 60, 6, 'Théorie des probabilités'),

-- L3 Sciences Fondamentales
(1, 'Analyse Complexe', 'MAT301', 5, 60, 6, 'Fonctions de variable complexe'),
(1, 'Physique Quantique', 'PHY301', 5, 60, 6, 'Introduction à la mécanique quantique'),
(1, 'Projet de Fin d Études', 'PFE301', 6, 120, 12, 'Travail de recherche');

-- === GÉNIE CIVIL - Licence ===
INSERT INTO matiere (filiere_id, nom, code, semestre, volume_horaire, credits, description) VALUES
-- L1 Génie Civil
(2, 'Mathématiques pour l Ingénieur', 'GCM101', 1, 60, 6, 'Mathématiques appliquées au génie civil'),
(2, 'Mécanique des Solides', 'GCM102', 1, 60, 6, 'Résistance des matériaux'),
(2, 'Topographie', 'GCT101', 1, 45, 4, 'Techniques de mesure topographique'),
(2, 'Mécanique des Fluides', 'GCM103', 2, 60, 6, 'Hydrostatique, hydrodynamique'),

-- L2 Génie Civil
(2, 'Structures Métalliques', 'GCS201', 3, 60, 6, 'Conception des structures en acier'),
(2, 'Béton Armé', 'GCS202', 3, 60, 6, 'Théorie et calcul du béton armé'),
(2, 'Géotechnique', 'GCG201', 3, 45, 4, 'Mécanique des sols'),

-- L3 Génie Civil
(2, 'Structures Précontraintes', 'GCS301', 5, 60, 6, 'Précontrainte des structures'),
(2, 'Projet de Bâtiment', 'GCP301', 6, 120, 12, 'Conception complète d un bâtiment');

-- === GÉNIE GÉOLOGIQUE - Licence ===
INSERT INTO matiere (filiere_id, nom, code, semestre, volume_horaire, credits, description) VALUES
-- L1 Génie Géologique
(3, 'Géologie Générale', 'GGG101', 1, 60, 6, 'Introduction à la géologie'),
(3, 'Minéralogie', 'GGM101', 1, 60, 6, 'Étude des minéraux'),
(3, 'Pétrologie', 'GGP101', 2, 60, 6, 'Étude des roches'),

-- L2 Génie Géologique
(3, 'Géologie Structurale', 'GGG201', 3, 60, 6, 'Structures géologiques'),
(3, 'Prospection Minière', 'GGP201', 3, 60, 6, 'Techniques de prospection'),

-- L3 Génie Géologique
(3, 'Gîtes Minéraux', 'GGM301', 5, 60, 6, 'Gisements minéraux'),
(3, 'Projet de Prospection', 'GGP301', 6, 120, 12, 'Projet de fin d études');

-- === GÉNIE MÉCANIQUE - Licence ===
INSERT INTO matiere (filiere_id, nom, code, semestre, volume_horaire, credits, description) VALUES
-- L1 Génie Mécanique
(4, 'Dessin Industriel', 'GMD101', 1, 60, 6, 'Dessin technique mécanique'),
(4, 'Métallurgie', 'GMM101', 1, 60, 6, 'Science des matériaux métalliques'),
(4, 'Thermodynamique', 'GMT101', 1, 60, 6, 'Principes thermodynamiques'),

-- L2 Génie Mécanique
(4, 'Éléments de Machines', 'GME201', 3, 60, 6, 'Conception des éléments mécaniques'),
(4, 'Usinage', 'GMU201', 3, 60, 6, 'Techniques d usinage'),

-- L3 Génie Mécanique
(4, 'CFAO', 'GMC301', 5, 60, 6, 'Conception Fabrication Assistée'),
(4, 'Projet de Conception', 'GMP301', 6, 120, 12, 'Projet mécanique');

-- === GÉNIE INDUSTRIEL - Licence ===
INSERT INTO matiere (filiere_id, nom, code, semestre, volume_horaire, credits, description) VALUES
-- L1 Génie Industriel
(5, 'Économie d Entreprise', 'GIE101', 1, 45, 4, 'Fonctionnement des entreprises'),
(5, 'Recherche Opérationnelle', 'GIR101', 1, 60, 6, 'Méthodes d optimisation'),
(5, 'Gestion de Production', 'GIG101', 2, 60, 6, 'Planification de production'),

-- L2 Génie Industriel
(5, 'Logistique', 'GIL201', 3, 60, 6, 'Gestion des flux logistiques'),
(5, 'Qualité Totale', 'GIQ201', 3, 60, 6, 'Management de la qualité'),

-- L3 Génie Industriel
(5, 'Audit Industriel', 'GIA301', 5, 60, 6, 'Méthodes d audit'),
(5, 'Projet d Optimisation', 'GIP301', 6, 120, 12, 'Projet d amélioration');

-- 9. Cours d'exemple
INSERT INTO cours (matiere_id, enseignant_id, salle_id, filiere_id, date_debut, date_fin, type_seance, statut, created_by) VALUES
(1, 2, 1, 1, '2024-11-04 08:00:00', '2024-11-04 09:30:00', 'cours', 'confirme', 1),
(2, 3, 2, 1, '2024-11-04 10:00:00', '2024-11-04 11:30:00', 'cours', 'confirme', 1),
(5, 2, 1, 2, '2024-11-04 14:00:00', '2024-11-04 15:30:00', 'cours', 'confirme', 1),
(8, 5, 6, 3, '2024-11-05 08:00:00', '2024-11-05 09:30:00', 'cours', 'confirme', 1),
(12, 6, 8, 4, '2024-11-05 10:00:00', '2024-11-05 11:30:00', 'cours', 'confirme', 1);

-- 10. Configuration
INSERT INTO configuration (cle, valeur, description) VALUES
('heure_debut_cours', '08:00:00', 'Heure de début des cours'),
('heure_fin_cours', '18:00:00', 'Heure de fin des cours'),
('duree_seance', '01:30:00', 'Durée standard d une séance'),
('delai_publication', '7', 'Délai de publication en jours'),
('email_notification', '1', 'Activer les notifications par email');

-- ==================== CRÉATION DES INDEX ====================
CREATE INDEX idx_cours_dates ON cours(date_debut, date_fin);
CREATE INDEX idx_cours_enseignant ON cours(enseignant_id, date_debut);
CREATE INDEX idx_cours_salle ON cours(salle_id, date_debut);
CREATE INDEX idx_indisponibilite_dates ON indisponibilite(date_debut, date_fin);
CREATE INDEX idx_utilisateur_email ON utilisateur(email);
CREATE INDEX idx_publication_annee ON publication_emploi_du_temps(annee_academique, semestre);

-- ==================== CRÉATION DES VUES ====================
CREATE VIEW vue_emploi_du_temps AS
SELECT 
    c.id,
    c.date_debut,
    c.date_fin,
    c.type_seance,
    c.statut,
    m.nom as matiere_nom,
    m.code as matiere_code,
    u.nom as enseignant_nom,
    u.prenom as enseignant_prenom,
    s.nom as salle_nom,
    s.capacite,
    b.nom as batiment_nom,
    f.nom as filiere_nom,
    f.code as filiere_code,
    d.nom as departement_nom,
    fac.nom as faculte_nom
FROM cours c
JOIN matiere m ON c.matiere_id = m.id
JOIN enseignant e ON c.enseignant_id = e.id
JOIN utilisateur u ON e.utilisateur_id = u.id
JOIN salle s ON c.salle_id = s.id
JOIN batiment b ON s.batiment_id = b.id
JOIN filiere f ON c.filiere_id = f.id
JOIN departement d ON f.departement_id = d.id
JOIN faculte fac ON d.faculte_id = fac.id
WHERE c.statut != 'annule';

-- ==================== CRÉATION DES PROCÉDURES ====================
DELIMITER //
CREATE PROCEDURE verifier_conflits_cours(
    IN p_salle_id INT,
    IN p_enseignant_id INT,
    IN p_date_debut DATETIME,
    IN p_date_fin DATETIME,
    IN p_cours_id INT
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
END //
DELIMITER ;

-- ==================== VÉRIFICATION ====================
SELECT 'Base de données UPM créée avec succès!' as Status;

-- Afficher le résumé des données
SELECT 'Facultés' as Table_Name, COUNT(*) as Count FROM faculte
UNION ALL SELECT 'Départements', COUNT(*) FROM departement
UNION ALL SELECT 'Filières', COUNT(*) FROM filiere
UNION ALL SELECT 'Utilisateurs', COUNT(*) FROM utilisateur
UNION ALL SELECT 'Enseignants', COUNT(*) FROM enseignant
UNION ALL SELECT 'Bâtiments', COUNT(*) FROM batiment
UNION ALL SELECT 'Salles', COUNT(*) FROM salle
UNION ALL SELECT 'Matières', COUNT(*) FROM matiere
UNION ALL SELECT 'Cours', COUNT(*) FROM cours;