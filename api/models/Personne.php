<?php

class Personne {
    private $db;
    private $table_name = "personnes";

    public function __construct($db) {
        $this->db = $db;
    }

    public function create($data) {
        try {
            // Vérifier si la personne existe déjà avec cet email
            $query = "SELECT id_personne FROM " . $this->table_name . " WHERE email_personne = :email";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':email', $data['email']);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                // Si la personne existe, retourner son ID
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                return $row['id_personne'];
            }

            // Si la personne n'existe pas, la créer
            $query = "INSERT INTO " . $this->table_name . "
                    (nom_personne, prenom_personne, email_personne, téléphone_personne)
                    VALUES
                    (:nom, :prenom, :email, :telephone)";

            $stmt = $this->db->prepare($query);

            // Nettoyer les données
            $nom = htmlspecialchars(strip_tags($data['nom']));
            $prenom = htmlspecialchars(strip_tags($data['prenom']));
            $email = htmlspecialchars(strip_tags($data['email']));
            $telephone = htmlspecialchars(strip_tags($data['telephone']));

            // Lier les valeurs
            $stmt->bindParam(":nom", $nom);
            $stmt->bindParam(":prenom", $prenom);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":telephone", $telephone);

            if ($stmt->execute()) {
                return $this->db->lastInsertId();
            }

            return false;
        } catch (PDOException $e) {
            error_log("[ERROR] Exception dans Personne::create(): " . $e->getMessage());
            throw new Exception("Erreur lors de la création de la personne");
        }
    }

    public function getById($id) {
        try {
            error_log("[DEBUG] Personne::getById - Début de la méthode");
            error_log("[DEBUG] ID reçu: " . var_export($id, true));
            error_log("[DEBUG] Type de l'ID: " . gettype($id));

            // Vérification de l'ID
            if (!is_numeric($id)) {
                error_log("[ERROR] L'ID n'est pas numérique");
                return false;
            }

            $query = "SELECT * FROM " . $this->table_name . " WHERE id_personne = :id";
            error_log("[DEBUG] Requête SQL: " . $query);

            $stmt = $this->db->prepare($query);
            
            // Conversion explicite en entier
            $id = intval($id);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            error_log("[DEBUG] Exécution de la requête avec ID = " . $id);
            $success = $stmt->execute();
            
            if (!$success) {
                error_log("[ERROR] Erreur lors de l'exécution de la requête");
                error_log("[ERROR] Info PDO: " . print_r($stmt->errorInfo(), true));
                return false;
            }

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("[DEBUG] Résultat de la requête: " . var_export($result, true));

            return $result;
        } catch (PDOException $e) {
            error_log("[ERROR] Exception PDO dans getById: " . $e->getMessage());
            error_log("[ERROR] Code: " . $e->getCode());
            error_log("[ERROR] Trace: " . $e->getTraceAsString());
            throw new Exception("Erreur lors de la récupération de la personne");
        } catch (Exception $e) {
            error_log("[ERROR] Exception générale dans getById: " . $e->getMessage());
            error_log("[ERROR] Trace: " . $e->getTraceAsString());
            throw new Exception("Erreur lors de la récupération de la personne");
        }
    }

    public function getByEmail($email) {
        try {
            $query = "SELECT 
                        id_personne,
                        nom_personne as nom,
                        prenom_personne as prenom,
                        email_personne as email,
                        téléphone_personne as telephone,
                        role
                    FROM " . $this->table_name . " 
                    WHERE email_personne = :email";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[ERROR] Exception dans Personne::getByEmail(): " . $e->getMessage());
            throw new Exception("Erreur lors de la récupération de la personne");
        }
    }
} 