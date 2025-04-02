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
            $query = "SELECT id_personne FROM " . $this->table_name . " WHERE email = :email";
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
                    (nom, prenom, email, telephone)
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
            $query = "SELECT * FROM " . $this->table_name . " WHERE id_personne = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[ERROR] Exception dans Personne::getById(): " . $e->getMessage());
            throw new Exception("Erreur lors de la récupération de la personne");
        }
    }

    public function getByEmail($email) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE email = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$email]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[ERROR] Exception dans Personne::getByEmail(): " . $e->getMessage());
            throw new Exception("Erreur lors de la récupération de la personne");
        }
    }
} 