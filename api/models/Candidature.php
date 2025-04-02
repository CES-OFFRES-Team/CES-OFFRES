<?php

class Candidature {
    private $db;
    private $table_name = "candidatures";

    public function __construct($db) {
        $this->db = $db;
    }

    public function create($data) {
        try {
            error_log("[DEBUG] Début de la création d'une candidature avec les données: " . json_encode($data));
            
            $query = "INSERT INTO Candidatures (cv_path, lettre_path, statut, date_candidature, id_personne, id_stage) 
                     VALUES (:cv_path, :lettre_path, :statut, CURDATE(), :id_personne, :id_stage)";

            $stmt = $this->db->prepare($query);

            // Définir le statut initial
            $statut = "En attente";
            
            $stmt->bindParam(':cv_path', $data['cv_path']);
            $stmt->bindParam(':lettre_path', $data['lettre_path']);
            $stmt->bindParam(':statut', $statut);
            $stmt->bindParam(':id_personne', $data['id_personne']);
            $stmt->bindParam(':id_stage', $data['id_stage']);

            if ($stmt->execute()) {
                $id = $this->db->lastInsertId();
                error_log("[DEBUG] Candidature créée avec l'ID: " . $id);
                return $id;
            }
            
            error_log("[ERROR] Échec de la création de la candidature");
            return false;
        } catch (PDOException $e) {
            error_log("[ERROR] Exception dans create(): " . $e->getMessage());
            throw new Exception("Erreur lors de la création de la candidature: " . $e->getMessage());
        }
    }

    public function getById($id) {
        try {
            $query = "SELECT c.*, p.nom, p.prenom, p.email, o.titre as titre_offre, e.nom_entreprise 
                     FROM Candidatures c
                     JOIN Personnes p ON c.id_personne = p.id_personne
                     JOIN Offres_de_stage o ON c.id_stage = o.id_stage
                     JOIN Entreprises e ON o.id_entreprise = e.id_entreprise
                     WHERE c.id_candidature = :id";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[ERROR] Exception dans getById(): " . $e->getMessage());
            throw new Exception("Erreur lors de la récupération de la candidature");
        }
    }

    public function getAll() {
        try {
            $query = "SELECT c.*, p.nom, p.prenom, p.email, o.titre as titre_offre, e.nom_entreprise 
                     FROM Candidatures c
                     JOIN Personnes p ON c.id_personne = p.id_personne
                     JOIN Offres_de_stage o ON c.id_stage = o.id_stage
                     JOIN Entreprises e ON o.id_entreprise = e.id_entreprise
                     ORDER BY c.date_candidature DESC";

            $stmt = $this->db->prepare($query);
            $stmt->execute();

            return $stmt;
        } catch (PDOException $e) {
            error_log("[ERROR] Exception dans getAll(): " . $e->getMessage());
            throw new Exception("Erreur lors de la récupération des candidatures");
        }
    }

    public function getByPersonne($id_personne) {
        try {
            $query = "SELECT c.*, o.titre as titre_offre, e.nom_entreprise 
                     FROM Candidatures c
                     JOIN Offres_de_stage o ON c.id_stage = o.id_stage
                     JOIN Entreprises e ON o.id_entreprise = e.id_entreprise
                     WHERE c.id_personne = :id_personne
                     ORDER BY c.date_candidature DESC";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id_personne', $id_personne);
            $stmt->execute();

            return $stmt;
        } catch (PDOException $e) {
            error_log("[ERROR] Exception dans getByPersonne(): " . $e->getMessage());
            throw new Exception("Erreur lors de la récupération des candidatures de la personne");
        }
    }

    public function getByOffre($id_stage) {
        try {
            $query = "SELECT c.*, p.nom, p.prenom, p.email 
                     FROM Candidatures c
                     JOIN Personnes p ON c.id_personne = p.id_personne
                     WHERE c.id_stage = :id_stage
                     ORDER BY c.date_candidature DESC";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id_stage', $id_stage);
            $stmt->execute();
            
            return $stmt;
        } catch (PDOException $e) {
            error_log("[ERROR] Exception dans getByOffre(): " . $e->getMessage());
            throw new Exception("Erreur lors de la récupération des candidatures pour l'offre");
        }
    }

    public function updateStatut($id, $statut) {
        try {
            $query = "UPDATE Candidatures SET statut = :statut WHERE id_candidature = :id";

            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':statut', $statut);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[ERROR] Exception dans updateStatut(): " . $e->getMessage());
            throw new Exception("Erreur lors de la mise à jour du statut de la candidature");
        }
    }

    public function delete($id) {
        try {
            // D'abord, récupérer les chemins des fichiers
            $query = "SELECT cv_path, lettre_path FROM Candidatures WHERE id_candidature = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $files = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Supprimer la candidature de la base de données
            $query = "DELETE FROM Candidatures WHERE id_candidature = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                // Si la suppression dans la BD réussit, supprimer les fichiers physiques
                if ($files['cv_path'] && file_exists($files['cv_path'])) {
                    unlink($files['cv_path']);
                }
                if ($files['lettre_path'] && file_exists($files['lettre_path'])) {
                    unlink($files['lettre_path']);
                }
                return true;
            }
            return false;
        } catch (PDOException $e) {
            error_log("[ERROR] Exception dans delete(): " . $e->getMessage());
            throw new Exception("Erreur lors de la suppression de la candidature");
        }
    }

    public function candidatureExists($id_personne, $id_stage) {
        try {
            $query = "SELECT COUNT(*) FROM Candidatures 
                     WHERE id_personne = :id_personne AND id_stage = :id_stage";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id_personne', $id_personne);
            $stmt->bindParam(':id_stage', $id_stage);
            $stmt->execute();
            
            return $stmt->fetchColumn() > 0;
        } catch (PDOException $e) {
            error_log("[ERROR] Exception dans candidatureExists(): " . $e->getMessage());
            throw new Exception("Erreur lors de la vérification de l'existence de la candidature");
        }
    }
} 