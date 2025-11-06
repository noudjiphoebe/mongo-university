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

-- ==================== INSERTION DES DONNÉES DE BASE ====================

-- 1. Facultés
INSERT INTO faculte (nom, code, description, actif) VALUES
('Sciences et Technologies', 'FST', 'Faculté des Sciences et Technologies', TRUE),
('Génie Civil et Architecture', 'FGCA', 'Faculté de Génie Civil et Architecture', TRUE),
('Génie Géologique et Minier', 'FGGM', 'Faculté de Génie Géologique et Minier', TRUE);

-- 2. Départements
INSERT INTO departement (faculte_id, nom, code, description, actif) VALUES
(1, 'Sciences Fondamentales', 'SF', 'Département des Sciences Fondamentales', TRUE),
(1, 'Informatique', 'INFO', 'Département d Informatique', TRUE),
(3, 'Génie Géologique', 'GG', 'Département de Génie Géologique', TRUE);

-- 3. Filières existantes + nouvelles
INSERT INTO filiere (departement_id, nom, code, duree_etudes, description) VALUES
(2, 'Licence en Informatique', 'LIC-INFO', 3, 'Licence en Informatique'),
(1, 'Licence Mathématiques-Physique', 'LMP', 3, 'Licence double compétence Maths-Physique'),
(3, 'Licence Hydrogéologie', 'LHG', 3, 'Licence en Hydrogéologie');

-- 4. Utilisateurs de base + nouveaux
INSERT INTO utilisateur (email, mot_de_passe, role, nom, prenom, actif) VALUES
('admin@upm.mg', 'admin123', 'admin', 'Administrateur', 'UPM', TRUE),
('enseignant@upm.mg', 'enseignant123', 'enseignant', 'Dupont', 'Jean', TRUE),
('etudiant@upm.mg', 'etudiant123', 'etudiant', 'Étudiant', 'UPM', TRUE),
-- Nouveaux enseignants ajoutés
('rakoto.math@upm.mg', 'enseignant123', 'enseignant', 'Rakoto', 'Jean Claude', TRUE),
('rabe.physique@upm.mg', 'enseignant123', 'enseignant', 'Rabe', 'Marie Louise', TRUE),
('randria.chimie@upm.mg', 'enseignant123', 'enseignant', 'Randria', 'Pierre Paul', TRUE),
('rasoa.bio@upm.mg', 'enseignant123', 'enseignant', 'Rasoa', 'Juliette', TRUE),
('ralison.info@upm.mg', 'enseignant123', 'enseignant', 'Ralison', 'Marc', TRUE),
('rajaona.geo@upm.mg', 'enseignant123', 'enseignant', 'Rajaona', 'Albert', TRUE),
('ramanana.minier@upm.mg', 'enseignant123', 'enseignant', 'Ramanana', 'Sophie', TRUE),
('randriana.hydro@upm.mg', 'enseignant123', 'enseignant', 'Randriana', 'Henri', TRUE),
('rakotobe.petrol@upm.mg', 'enseignant123', 'enseignant', 'Rakotobe', 'David', TRUE);

-- 5. Enseignants existants + nouveaux
INSERT INTO enseignant (utilisateur_id, matricule, specialite, grade, telephone, bureau, actif) VALUES
(2, 'PROF001', 'Informatique', 'professeur', '+261 34 00 000 01', 'Bâtiment Principal Bureau 101', TRUE),
(4, 'ENS003', 'Mathématiques Appliquées', 'professeur', '+261 34 12 345 67', 'BAT-A Bureau 201', TRUE),
(5, 'ENS004', 'Physique Quantique', 'maitre_assistant', '+261 34 12 345 68', 'BAT-A Bureau 202', TRUE),
(6, 'ENS005', 'Chimie Organique', 'maitre_assistant', '+261 34 12 345 69', 'BAT-A Bureau 203', TRUE),
(7, 'ENS006', 'Biologie Moléculaire', 'assistant', '+261 34 12 345 70', 'BAT-A Bureau 204', TRUE),
(8, 'ENS007', 'Informatique Avancée', 'maitre_assistant', '+261 34 12 345 71', 'BAT-A Bureau 205', TRUE),
(9, 'ENS008', 'Géologie Structurale', 'professeur', '+261 34 12 345 72', 'BAT-B Bureau 101', TRUE),
(10, 'ENS009', 'Génie Minier', 'professeur', '+261 34 12 345 73', 'BAT-B Bureau 102', TRUE),
(11, 'ENS010', 'Hydrogéologie', 'maitre_assistant', '+261 34 12 345 74', 'BAT-B Bureau 103', TRUE),
(12, 'ENS011', 'Géologie Pétrolière', 'professeur', '+261 34 12 345 75', 'BAT-B Bureau 104', TRUE);

-- 6. Bâtiments
INSERT INTO batiment (nom, code, adresse, nombre_etages, description, actif) VALUES
('Bâtiment Principal', 'BAT-PRINC', 'Campus Central UPM', 4, 'Bâtiment principal de l université', TRUE),
('Bâtiment A - Sciences', 'BAT-A', 'Campus Central UPM', 3, 'Bâtiment A des sciences fondamentales', TRUE),
('Bâtiment B - Sciences Avancées', 'BAT-B', 'Campus Central UPM', 3, 'Bâtiment B des sciences avancées', TRUE);

-- 7. Salles existantes + nouvelles
INSERT INTO salle (batiment_id, nom, capacite, type_salle, equipements, etage, actif) VALUES
(1, 'Amphi 100', 100, 'amphitheatre', 'Vidéoprojecteur, micro', 1, TRUE),
(1, 'Salle 101', 30, 'cours', 'Tableau blanc, vidéoprojecteur', 1, TRUE),
(1, 'Labo Info 201', 25, 'informatique', '20 ordinateurs, réseau', 2, TRUE),
-- Nouvelles salles ajoutées
(1, 'Salle 102', 30, 'cours', 'Vidéoprojecteur, tableau blanc', 1, TRUE),
(1, 'Salle 103', 25, 'cours', 'Vidéoprojecteur, climatisation', 1, TRUE),
(1, 'Labo Physique 202', 20, 'laboratoire', 'Appareils de mesure', 2, TRUE),
(1, 'Labo Chimie 203', 20, 'laboratoire', 'Hottes, produits chimiques', 2, TRUE),
(1, 'Salle 301', 40, 'cours', 'Vidéoprojecteur, tableau interactif', 3, TRUE);

-- 8. Matières existantes + nouvelles
INSERT INTO matiere (filiere_id, nom, code, semestre, credits, enseignant_responsable_id, description) VALUES
-- Informatique
(1, 'Programmation Web', 'WEB001', 1, 6, 1, 'HTML, CSS, JavaScript, PHP'),
-- Mathématiques-Physique
(2, 'Algèbre Linéaire', 'LMP101', 1, 6, 2, 'Espaces vectoriels, applications linéaires'),
(2, 'Mécanique du Point', 'LMP102', 1, 6, 3, 'Cinématique, dynamique du point matériel'),
(2, 'Analyse Réelle', 'LMP103', 1, 6, 2, 'Fonctions réelles, limites, continuité'),
-- Hydrogéologie
(3, 'Géologie Générale', 'LHG101', 1, 6, 7, 'Introduction aux sciences de la Terre'),
(3, 'Hydrologie de Base', 'LHG102', 1, 6, 9, 'Cycle de l eau, bilans hydrologiques'),
(3, 'Cartographie Géologique', 'LHG103', 1, 4, 7, 'Techniques de cartographie géologique');

-- 9. Cours existants + nouveaux
INSERT INTO cours (matiere_id, enseignant_id, salle_id, filiere_id, date_debut, date_fin, type_seance, statut, created_by) VALUES
-- Cours existants
(1, 1, 2, 1, '2024-01-15 08:00:00', '2024-01-15 09:30:00', 'cours', 'confirme', 1),
-- Nouveaux cours
(2, 2, 2, 2, '2024-11-04 08:00:00', '2024-11-04 09:30:00', 'cours', 'confirme', 1),
(2, 2, 2, 2, '2024-11-06 08:00:00', '2024-11-06 09:30:00', 'td', 'confirme', 1),
(3, 3, 2, 2, '2024-11-04 10:00:00', '2024-11-04 11:30:00', 'cours', 'confirme', 1),
(4, 7, 1, 3, '2024-11-04 14:00:00', '2024-11-04 15:30:00', 'cours', 'confirme', 1),
(5, 9, 1, 3, '2024-11-05 14:00:00', '2024-11-05 15:30:00', 'cours', 'confirme', 1),
(6, 7, 2, 3, '2024-11-06 10:00:00', '2024-11-06 11:30:00', 'cours', 'confirme', 1);

-- 10. Indisponibilités
INSERT INTO indisponibilite (enseignant_id, date_debut, date_fin, raison, description, statut) VALUES
(2, '2024-11-05 08:00:00', '2024-11-05 12:00:00', 'formation', 'Formation pédagogique', 'approuvee'),
(3, '2024-11-06 14:00:00', '2024-11-06 18:00:00', 'congé', 'Congé annuel', 'approuvee'),
(7, '2024-11-07 08:00:00', '2024-11-07 10:00:00', 'mission', 'Mission terrain', 'approuvee');

-- 11. Notifications
INSERT INTO notification (utilisateur_id, titre, message, type_notification, lien, lue) VALUES
(1, 'Système Mis à Jour', 'La base de données a été mise à jour avec les nouvelles filières et enseignants.', 'success', '/dashboard', FALSE),
(1, 'Nouvelles Filières', 'Les filières Mathématiques-Physique et Hydrogéologie ont été ajoutées.', 'info', '/filiere', FALSE),
(2, 'Nouveaux Cours', 'De nouveaux cours ont été programmés pour vos matières.', 'info', '/mes-cours', FALSE),
(4, 'Affectation de Cours', 'Vous êtes maintenant responsable de la matière "Algèbre Linéaire".', 'info', '/emploi-du-temps', FALSE);

-- 12. Configuration
INSERT INTO configuration (cle, valeur, description) VALUES
('heure_debut_cours', '08:00:00', 'Heure de début des cours'),
('heure_fin_cours', '18:00:00', 'Heure de fin des cours'),
('duree_seance', '01:30:00', 'Durée standard d une séance'),
('delai_publication', '7', 'Délai de publication en jours'),
('email_notification', '1', 'Activer les notifications par email');

-- ==================== CRÉATION DES VUES ====================

CREATE OR REPLACE VIEW vue_emploi_du_temps AS
SELECT 
    c.id,
    c.date_debut,
    c.date_fin,
    c.type_seance,
    c.statut,
    m.nom as matiere_nom,
    m.code as matiere_code,
    CONCAT(u.nom, ' ', u.prenom) as enseignant_nom,
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

CREATE OR REPLACE VIEW vue_emploi_par_niveau AS
SELECT 
    c.id,
    c.date_debut,
    c.date_fin,
    c.type_seance,
    c.statut,
    m.nom as matiere_nom,
    m.code as matiere_code,
    m.semestre,
    CONCAT(u.nom, ' ', u.prenom) as enseignant_nom,
    s.nom as salle_nom,
    b.nom as batiment_nom,
    f.nom as filiere_nom,
    f.code as filiere_code,
    CASE 
        WHEN m.semestre IN (1,2) THEN 'Niveau 1'
        WHEN m.semestre IN (3,4) THEN 'Niveau 2' 
        WHEN m.semestre IN (5,6) THEN 'Niveau 3'
        ELSE 'Autre'
    END as niveau,
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

-- ==================== CRÉATION DES INDEX ====================

CREATE INDEX idx_cours_dates ON cours(date_debut, date_fin);
CREATE INDEX idx_cours_enseignant ON cours(enseignant_id, date_debut);
CREATE INDEX idx_cours_salle ON cours(salle_id, date_debut);
CREATE INDEX idx_indisponibilite_dates ON indisponibilite(date_debut, date_fin);
CREATE INDEX idx_utilisateur_email ON utilisateur(email);
CREATE INDEX idx_publication_annee ON publication_emploi_du_temps(annee_academique, semestre);

-- ==================== VÉRIFICATION FINALE ====================

SELECT '=== BASE DE DONNÉES UNIVERSITÉ UPM ===' as '';
SELECT 'Création terminée avec succès!' as Status;
SELECT '' as '';

SELECT 'RÉSUMÉ DES DONNÉES:' as '';
SELECT 'Facultés' as Table_Name, COUNT(*) as Count FROM faculte
UNION ALL SELECT 'Départements', COUNT(*) FROM departement
UNION ALL SELECT 'Filières', COUNT(*) FROM filiere
UNION ALL SELECT 'Utilisateurs', COUNT(*) FROM utilisateur
UNION ALL SELECT 'Enseignants', COUNT(*) FROM enseignant
UNION ALL SELECT 'Bâtiments', COUNT(*) FROM batiment
UNION ALL SELECT 'Salles', COUNT(*) FROM salle
UNION ALL SELECT 'Matières', COUNT(*) FROM matiere
UNION ALL SELECT 'Cours', COUNT(*) FROM cours
UNION ALL SELECT 'Indisponibilités', COUNT(*) FROM indisponibilite
UNION ALL SELECT 'Notifications', COUNT(*) FROM notification;