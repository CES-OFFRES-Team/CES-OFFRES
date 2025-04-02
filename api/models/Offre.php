<?php

class Offre {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll() {
        try {
            error_log("[DEBUG] Début de la requête getAll dans le modèle Offre");
            $query = "SELECT o.id_stage, o.titre, o.description, o.remuneration, 
                            o.date_debut, o.date_fin, o.id_entreprise,
                            e.nom_entreprise 
                     FROM Offres_de_stage o 
                     LEFT JOIN Entreprises e ON o.id_entreprise = e.id_entreprise 
                     ORDER BY o.date_debut DESC";
            error_log("[DEBUG] Requête SQL: " . $query);
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            if ($stmt->errorInfo()[0] !== '00000') {
                error_log("[ERROR] Erreur SQL: " . implode(', ', $stmt->errorInfo()));
                throw new Exception("Erreur SQL lors de la récupération des offres");
            }
            
            error_log("[DEBUG] Requête getAll exécutée avec succès");
            return $stmt;
        } catch (PDOException $e) {
            error_log("[ERROR] Erreur PDO dans getAll(): " . $e->getMessage());
            throw new Exception("Erreur lors de la récupération des offres: " . $e->getMessage());
        }
    }

    public function getById($id) {
        try {
            error_log("[DEBUG] Début de la requête getById pour l'ID: " . $id);
            if (!is_numeric($id)) {
                throw new Exception("ID invalide");
            }
            $query = "SELECT o.*, e.nom_entreprise 
                     FROM Offres_de_stage o 
                     LEFT JOIN Entreprises e ON o.id_entreprise = e.id_entreprise 
                     WHERE o.id_stage = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$result) {
                error_log("[DEBUG] Aucune offre trouvée pour l'ID: " . $id);
                return null;
            }
            error_log("[DEBUG] Offre trouvée: " . json_encode($result));
            return $result;
        } catch (PDOException $e) {
            error_log("[ERROR] Erreur dans getById(): " . $e->getMessage());
            throw new Exception("Erreur lors de la récupération de l'offre");
        }
    }

    public function create($data) {
        try {
            error_log("[DEBUG] Début de la création d'une offre avec les données: " . json_encode($data));
            $this->validateData($data);
            
            $query = "INSERT INTO Offres_de_stage (titre, description, remuneration, date_debut, date_fin, id_entreprise) 
                     VALUES (:titre, :description, :remuneration, :date_debut, :date_fin, :id_entreprise)";
            
            $stmt = $this->db->prepare($query);
            
            $stmt->bindParam(':titre', $data['titre']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':remuneration', $data['remuneration']);
            $stmt->bindParam(':date_debut', $data['date_debut']);
            $stmt->bindParam(':date_fin', $data['date_fin']);
            $stmt->bindParam(':id_entreprise', $data['id_entreprise']);
            
            $stmt->execute();
            $id = $this->db->lastInsertId();
            error_log("[DEBUG] Offre créée avec l'ID: " . $id);
            return $id;
        } catch (PDOException $e) {
            error_log("[ERROR] Erreur dans create(): " . $e->getMessage());
            throw new Exception("Erreur lors de la création de l'offre");
        }
    }

    public function update($id, $data) {
        try {
            error_log("[DEBUG] Début de la mise à jour de l'offre ID: " . $id . " avec les données: " . json_encode($data));
            if (!is_numeric($id)) {
                throw new Exception("ID invalide");
            }
            $this->validateData($data);
            
            $query = "UPDATE Offres_de_stage 
                     SET titre = :titre, 
                         description = :description, 
                         remuneration = :remuneration, 
                         date_debut = :date_debut, 
                         date_fin = :date_fin, 
                         id_entreprise = :id_entreprise 
                     WHERE id_stage = :id";
            
            $stmt = $this->db->prepare($query);
            
            // Conversion des dates au format MySQL
            $dateDebut = date('Y-m-d', strtotime($data['date_debut']));
            $dateFin = date('Y-m-d', strtotime($data['date_fin']));
            
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':titre', $data['titre']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':remuneration', $data['remuneration']);
            $stmt->bindParam(':date_debut', $dateDebut);
            $stmt->bindParam(':date_fin', $dateFin);
            $stmt->bindParam(':id_entreprise', $data['id_entreprise']);
            
            $result = $stmt->execute();
            
            if ($stmt->errorInfo()[0] !== '00000') {
                error_log("[ERROR] Erreur SQL: " . implode(', ', $stmt->errorInfo()));
                throw new Exception("Erreur SQL lors de la mise à jour de l'offre");
            }
            
            error_log("[DEBUG] Résultat de la mise à jour: " . ($result ? "succès" : "échec"));
            return $result;
        } catch (PDOException $e) {
            error_log("[ERROR] Erreur dans update(): " . $e->getMessage());
            throw new Exception("Erreur lors de la mise à jour de l'offre: " . $e->getMessage());
        }
    }

    public function delete($id) {
        try {
            error_log("[DEBUG] Début de la suppression de l'offre ID: " . $id);
            if (!is_numeric($id)) {
                throw new Exception("ID invalide");
            }
            $query = "DELETE FROM Offres_de_stage WHERE id_stage = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $result = $stmt->execute();
            error_log("[DEBUG] Résultat de la suppression: " . ($result ? "succès" : "échec"));
            return $result;
        } catch (PDOException $e) {
            error_log("[ERROR] Erreur dans delete(): " . $e->getMessage());
            throw new Exception("Erreur lors de la suppression de l'offre");
        }
    }

    private function validateData($data) {
        error_log("[DEBUG] Début de la validation des données");
        $required_fields = ['titre', 'description', 'remuneration', 'date_debut', 'date_fin', 'id_entreprise'];
        
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                error_log("[ERROR] Champ manquant: " . $field);
                throw new Exception("Le champ $field est requis");
            }
        }

        if (!is_numeric($data['remuneration']) || $data['remuneration'] < 0) {
            error_log("[ERROR] Rémunération invalide: " . $data['remuneration']);
            throw new Exception("La rémunération doit être un nombre positif");
        }

        $date_debut = strtotime($data['date_debut']);
        $date_fin = strtotime($data['date_fin']);
        
        if ($date_debut === false || $date_fin === false) {
            error_log("[ERROR] Format de date invalide");
            throw new Exception("Format de date invalide");
        }

        if ($date_debut >= $date_fin) {
            error_log("[ERROR] Date de début doit être antérieure à la date de fin");
            throw new Exception("La date de début doit être antérieure à la date de fin");
        }

        if (!is_numeric($data['id_entreprise'])) {
            error_log("[ERROR] ID entreprise invalide: " . $data['id_entreprise']);
            throw new Exception("ID entreprise invalide");
        }

        error_log("[DEBUG] Validation des données réussie");
    }
} 