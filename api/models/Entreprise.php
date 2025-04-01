<?php
class Entreprise {
    private $conn;
    private $table = 'Entreprises';

    public $id_entreprise;
    public $nom_entreprise;
    public $adresse;
    public $email;
    public $téléphone;
    public $moyenne_eval;
    public $description;

    public function __construct($db) {
        $this->conn = $db;
        error_log("[DEBUG] Initialisation du modèle Entreprise");
    }

    public function getAll() {
        try {
            error_log("[DEBUG] Tentative de récupération de toutes les entreprises");
            $query = "SELECT * FROM " . $this->table;
            error_log("[DEBUG] Requête SQL: " . $query);
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            error_log("[DEBUG] Requête exécutée avec succès");
            return $stmt;
        } catch(PDOException $e) {
            error_log("[ERROR] Exception lors de la récupération des entreprises: " . $e->getMessage());
            error_log("[ERROR] Code d'erreur SQL: " . $e->getCode());
            throw $e;
        }
    }

    public function create() {
        try {
            $query = "INSERT INTO " . $this->table . "
                    (nom_entreprise, adresse, email, téléphone, moyenne_eval, description)
                    VALUES
                    (:nom_entreprise, :adresse, :email, :telephone, :moyenne_eval, :description)";

            error_log("[DEBUG] Requête SQL: " . $query);

            $stmt = $this->conn->prepare($query);

            // Nettoyage et validation des données
            $this->nom_entreprise = htmlspecialchars(strip_tags(trim($this->nom_entreprise)));
            $this->adresse = htmlspecialchars(strip_tags(trim($this->adresse)));
            $this->email = htmlspecialchars(strip_tags(trim($this->email)));
            $this->téléphone = htmlspecialchars(strip_tags(trim($this->téléphone)));
            $this->description = htmlspecialchars(strip_tags(trim($this->description)));

            // Liaison des paramètres
            $stmt->bindParam(":nom_entreprise", $this->nom_entreprise);
            $stmt->bindParam(":adresse", $this->adresse);
            $stmt->bindParam(":email", $this->email);
            $stmt->bindParam(":telephone", $this->téléphone);
            $stmt->bindParam(":moyenne_eval", $this->moyenne_eval);
            $stmt->bindParam(":description", $this->description);

            if($stmt->execute()) {
                error_log("[SUCCESS] Entreprise créée avec succès");
                return true;
            }

            $error = $stmt->errorInfo();
            error_log("[ERROR] Échec de la création de l'entreprise");
            error_log("[ERROR] SQL State: " . $error[0]);
            error_log("[ERROR] Error Code: " . $error[1]);
            error_log("[ERROR] Message: " . $error[2]);
            return false;

        } catch(PDOException $e) {
            error_log("[ERROR] Exception PDO lors de la création: " . $e->getMessage());
            throw $e;
        }
    }

    public function update($id, $data) {
        try {
            $query = "UPDATE " . $this->table . "
                     SET nom_entreprise = :nom_entreprise,
                         adresse = :adresse,
                         email = :email,
                         téléphone = :telephone,
                         moyenne_eval = :moyenne_eval,
                         description = :description
                     WHERE id_entreprise = :id";

            error_log("[DEBUG] Requête de mise à jour: " . $query);
            error_log("[DEBUG] Données à mettre à jour: " . print_r($data, true));

            $stmt = $this->conn->prepare($query);

            // Nettoyage des données
            $data['nom_entreprise'] = htmlspecialchars(strip_tags(trim($data['nom_entreprise'])));
            $data['adresse'] = htmlspecialchars(strip_tags(trim($data['adresse'])));
            $data['email'] = htmlspecialchars(strip_tags(trim($data['email'])));
            $data['téléphone'] = htmlspecialchars(strip_tags(trim($data['téléphone'])));
            $data['description'] = htmlspecialchars(strip_tags(trim($data['description'])));

            // Liaison des paramètres
            $stmt->bindParam(":nom_entreprise", $data['nom_entreprise']);
            $stmt->bindParam(":adresse", $data['adresse']);
            $stmt->bindParam(":email", $data['email']);
            $stmt->bindParam(":telephone", $data['téléphone']);
            $stmt->bindParam(":moyenne_eval", $data['moyenne_eval']);
            $stmt->bindParam(":description", $data['description']);
            $stmt->bindParam(":id", $id);

            if($stmt->execute()) {
                error_log("[SUCCESS] Entreprise ID: " . $id . " mise à jour avec succès");
                return true;
            }

            $error = $stmt->errorInfo();
            error_log("[ERROR] Échec de la mise à jour de l'entreprise ID: " . $id);
            error_log("[ERROR] SQL State: " . $error[0]);
            error_log("[ERROR] Error Code: " . $error[1]);
            error_log("[ERROR] Message: " . $error[2]);
            return false;

        } catch(PDOException $e) {
            error_log("[ERROR] Exception PDO lors de la mise à jour: " . $e->getMessage());
            throw $e;
        }
    }

    public function delete($id) {
        try {
            $query = "DELETE FROM " . $this->table . " WHERE id_entreprise = :id";
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":id", $id);
            
            if($stmt->execute()) {
                error_log("[SUCCESS] Entreprise ID: " . $id . " supprimée avec succès");
                return true;
            }
            
            $error = $stmt->errorInfo();
            error_log("[ERROR] Échec de la suppression de l'entreprise ID: " . $id);
            error_log("[ERROR] SQL State: " . $error[0]);
            error_log("[ERROR] Error Code: " . $error[1]);
            error_log("[ERROR] Message: " . $error[2]);
            return false;
            
        } catch(PDOException $e) {
            error_log("[ERROR] Exception PDO lors de la suppression: " . $e->getMessage());
            throw $e;
        }
    }

    public function getById($id) {
        try {
            $query = "SELECT * FROM " . $this->table . " WHERE id_entreprise = :id LIMIT 1";
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("[ERROR] Exception lors de la récupération de l'entreprise ID: " . $id . " - " . $e->getMessage());
            throw $e;
        }
    }
} 