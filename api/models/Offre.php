<?php

class Offre {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll() {
        try {
            $query = "SELECT o.*, e.nom_entreprise 
                     FROM Offres_de_stage o 
                     LEFT JOIN entreprises e ON o.id_entreprise = e.id_entreprise 
                     ORDER BY o.date_publication DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            error_log("Erreur dans getAll(): " . $e->getMessage());
            throw $e;
        }
    }

    public function getById($id) {
        try {
            $query = "SELECT o.*, e.nom_entreprise 
                     FROM Offres_de_stage o 
                     LEFT JOIN entreprises e ON o.id_entreprise = e.id_entreprise 
                     WHERE o.id_stage = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur dans getById(): " . $e->getMessage());
            throw $e;
        }
    }

    public function create($data) {
        try {
            $query = "INSERT INTO Offres_de_stage (titre, description, remuneration, date_début, date_fin, id_entreprise) 
                     VALUES (:titre, :description, :remuneration, :date_debut, :date_fin, :id_entreprise)";
            
            $stmt = $this->db->prepare($query);
            
            $stmt->bindParam(':titre', $data['titre']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':remuneration', $data['remuneration']);
            $stmt->bindParam(':date_debut', $data['date_debut']);
            $stmt->bindParam(':date_fin', $data['date_fin']);
            $stmt->bindParam(':id_entreprise', $data['id_entreprise']);
            
            $stmt->execute();
            return $this->db->lastInsertId();
        } catch (PDOException $e) {
            error_log("Erreur dans create(): " . $e->getMessage());
            throw $e;
        }
    }

    public function update($id, $data) {
        try {
            $query = "UPDATE Offres_de_stage 
                     SET titre = :titre, 
                         description = :description, 
                         remuneration = :remuneration, 
                         date_début = :date_debut, 
                         date_fin = :date_fin, 
                         id_entreprise = :id_entreprise 
                     WHERE id_stage = :id";
            
            $stmt = $this->db->prepare($query);
            
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':titre', $data['titre']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':remuneration', $data['remuneration']);
            $stmt->bindParam(':date_debut', $data['date_debut']);
            $stmt->bindParam(':date_fin', $data['date_fin']);
            $stmt->bindParam(':id_entreprise', $data['id_entreprise']);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur dans update(): " . $e->getMessage());
            throw $e;
        }
    }

    public function delete($id) {
        try {
            $query = "DELETE FROM Offres_de_stage WHERE id_stage = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur dans delete(): " . $e->getMessage());
            throw $e;
        }
    }
} 