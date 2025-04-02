<?php

class Candidature {
    private $conn;
    private $table_name = "Candidatures";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($data) {
        try {
            $query = "INSERT INTO " . $this->table_name . " 
                    (id_personne, id_stage, cv_path, lettre_path, statut, date_candidature) 
                    VALUES 
                    (:id_personne, :id_stage, :cv_path, :lettre_path, :statut, NOW())";

            $stmt = $this->conn->prepare($query);

            // Nettoyer et lier les données
            $stmt->bindParam(":id_personne", $data['id_personne']);
            $stmt->bindParam(":id_stage", $data['id_stage']);
            $stmt->bindParam(":cv_path", $data['cv_path']);
            $stmt->bindParam(":lettre_path", $data['lettre_path']);
            $stmt->bindParam(":statut", $data['statut']);

            if ($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            return false;
        } catch (PDOException $e) {
            error_log("[ERROR] Erreur PDO dans create: " . $e->getMessage());
            return false;
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

            $stmt = $this->conn->prepare($query);
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
            error_log("[DEBUG] Début de getAll()");
            
            $query = "SELECT c.*, 
                     p.nom_personne, p.prenom_personne, p.email_personne, 
                     o.titre as titre_offre, 
                     e.nom_entreprise 
                     FROM " . $this->table_name . " c
                     JOIN personnes p ON c.id_personne = p.id_personne
                     JOIN offres_de_stage o ON c.id_stage = o.id_stage
                     JOIN entreprises e ON o.id_entreprise = e.id_entreprise
                     ORDER BY c.date_candidature DESC";

            error_log("[DEBUG] Requête SQL: " . $query);
            
            $stmt = $this->conn->prepare($query);
            $success = $stmt->execute();
            
            if (!$success) {
                error_log("[ERROR] Erreur lors de l'exécution de la requête");
                error_log("[ERROR] Info PDO: " . print_r($stmt->errorInfo(), true));
                throw new Exception("Erreur lors de l'exécution de la requête");
            }
            
            error_log("[DEBUG] Nombre de résultats: " . $stmt->rowCount());
            
            return $stmt;
        } catch (PDOException $e) {
            error_log("[ERROR] Exception PDO dans getAll(): " . $e->getMessage());
            error_log("[ERROR] Code: " . $e->getCode());
            error_log("[ERROR] Trace: " . $e->getTraceAsString());
            throw new Exception("Erreur lors de la récupération des candidatures");
        }
    }

    public function getByPersonne($id_personne) {
        try {
            $query = "SELECT 
                        c.*,
                        o.titre_stage as titre,
                        e.nom_entreprise
                     FROM Candidatures c
                     JOIN Offres_de_stage o ON c.id_stage = o.id_stage
                     JOIN Entreprises e ON o.id_entreprise = e.id_entreprise
                     WHERE c.id_personne = :id_personne
                     ORDER BY c.date_candidature DESC";

            error_log("[DEBUG] Requête SQL: " . $query);
            error_log("[DEBUG] ID personne: " . $id_personne);

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id_personne", $id_personne);
            
            if (!$stmt->execute()) {
                error_log("[ERROR] Erreur d'exécution de la requête: " . print_r($stmt->errorInfo(), true));
                return false;
            }

            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("[DEBUG] Nombre de candidatures trouvées: " . count($result));
            error_log("[DEBUG] Données récupérées: " . print_r($result, true));
            
            return $result;
        } catch (PDOException $e) {
            error_log("[ERROR] Erreur PDO dans getByPersonne: " . $e->getMessage());
            return false;
        }
    }

    public function getByOffre($id_stage) {
        try {
            $query = "SELECT c.*, p.nom, p.prenom, p.email 
                     FROM Candidatures c
                     JOIN Personnes p ON c.id_personne = p.id_personne
                     WHERE c.id_stage = :id_stage
                     ORDER BY c.date_candidature DESC";
            
            $stmt = $this->conn->prepare($query);
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

            $stmt = $this->conn->prepare($query);
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
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $files = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Supprimer la candidature de la base de données
            $query = "DELETE FROM Candidatures WHERE id_candidature = :id";
            $stmt = $this->conn->prepare($query);
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
            $query = "SELECT id_candidature FROM " . $this->table_name . " 
                     WHERE id_personne = :id_personne AND id_stage = :id_stage";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id_personne", $id_personne);
            $stmt->bindParam(":id_stage", $id_stage);
            $stmt->execute();

            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("[ERROR] Erreur PDO dans candidatureExists: " . $e->getMessage());
            return false;
        }
    }
} 