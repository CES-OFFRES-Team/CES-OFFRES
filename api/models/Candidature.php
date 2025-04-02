<?php

class Candidature {
    private $conn;
    private $table_name = "candidatures";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($data) {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                    (cv_path, lettre_path, statut, date_candidature, id_personne, id_stage)
                    VALUES
                    (:cv_path, :lettre_path, :statut, NOW(), :id_personne, :id_stage)";

            $stmt = $this->conn->prepare($query);

            // Nettoyer les données
            $id_personne = htmlspecialchars(strip_tags($data['id_personne']));
            $id_stage = htmlspecialchars(strip_tags($data['id_stage']));
            $cv_path = htmlspecialchars(strip_tags($data['cv_path']));
            $lettre_path = $data['lettre_path'] ? htmlspecialchars(strip_tags($data['lettre_path'])) : null;

            // Lier les valeurs
            $stmt->bindParam(":id_personne", $id_personne);
            $stmt->bindParam(":id_stage", $id_stage);
            $stmt->bindParam(":cv_path", $cv_path);
            $stmt->bindParam(":lettre_path", $lettre_path);
            $stmt->bindValue(":statut", "En attente");

            if ($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            return false;
        } catch (Exception $e) {
            error_log("Erreur dans Candidature::create : " . $e->getMessage());
            throw $e;
        }
    }

    public function getById($id) {
        $query = "SELECT c.*, s.titre, e.nom as nom_entreprise 
                 FROM " . $this->table_name . " c
                 JOIN stages s ON c.id_stage = s.id_stage
                 JOIN entreprises e ON s.id_entreprise = e.id_entreprise
                 WHERE c.id_candidature = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAll() {
        $query = "SELECT c.*, s.titre, e.nom as nom_entreprise 
                 FROM " . $this->table_name . " c
                 JOIN stages s ON c.id_stage = s.id_stage
                 JOIN entreprises e ON s.id_entreprise = e.id_entreprise
                 ORDER BY c.date_candidature DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    public function getByPersonne($id_personne) {
        $query = "SELECT c.*, s.titre, e.nom as nom_entreprise 
                 FROM " . $this->table_name . " c
                 JOIN stages s ON c.id_stage = s.id_stage
                 JOIN entreprises e ON s.id_entreprise = e.id_entreprise
                 WHERE c.id_personne = ?
                 ORDER BY c.date_candidature DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id_personne]);

        return $stmt;
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
        $query = "UPDATE " . $this->table_name . "
                SET statut = :statut
                WHERE id_candidature = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":statut", $statut);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id_candidature = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }

    public function candidatureExists($id_personne, $id_stage) {
        try {
            $query = "SELECT COUNT(*) FROM " . $this->table_name . "
                     WHERE id_personne = :id_personne AND id_stage = :id_stage";
            
            $stmt = $this->conn->prepare($query);
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