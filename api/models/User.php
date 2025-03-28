<?php
class User {
    private $conn;
    private $table = 'Personnes';

    public $id_personne;
    public $nom_personne;
    public $prenom_personne;
    public $téléphone_personne;
    public $email_personne;
    public $password_personne;
    public $role;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function create() {
        try {
            $query = "INSERT INTO " . $this->table . "
                    (nom_personne, prenom_personne, téléphone_personne, email_personne, password_personne, role)
                    VALUES
                    (:nom_personne, :prenom_personne, :téléphone_personne, :email_personne, :password_personne, :role)";

            error_log("[DEBUG] Requête SQL: " . $query);

            $stmt = $this->conn->prepare($query);

            // Nettoyage et validation des données
            $this->nom_personne = trim($this->nom_personne);
            $this->prenom_personne = trim($this->prenom_personne);
            $this->téléphone_personne = trim($this->téléphone_personne);
            $this->email_personne = trim($this->email_personne);
            $this->role = trim($this->role ?? 'user');

            error_log("[DEBUG] Données à insérer dans la table Personnes: " . print_r([
                'nom' => $this->nom_personne,
                'prenom' => $this->prenom_personne,
                'telephone' => $this->téléphone_personne,
                'email' => $this->email_personne,
                'role' => $this->role
            ], true));

            // Liaison des paramètres
            $stmt->bindParam(":nom_personne", $this->nom_personne);
            $stmt->bindParam(":prenom_personne", $this->prenom_personne);
            $stmt->bindParam(":téléphone_personne", $this->téléphone_personne);
            $stmt->bindParam(":email_personne", $this->email_personne);
            $stmt->bindParam(":password_personne", $this->password_personne);
            $stmt->bindParam(":role", $this->role);

            if($stmt->execute()) {
                error_log("[SUCCESS] Insertion réussie dans la table Personnes");
                return true;
            }

            error_log("[ERROR] Échec de l'exécution de la requête SQL sur la table Personnes");
            error_log("[ERROR] SQL State: " . $stmt->errorInfo()[0]);
            error_log("[ERROR] Error Code: " . $stmt->errorInfo()[1]);
            error_log("[ERROR] Message: " . $stmt->errorInfo()[2]);
            return false;

        } catch(PDOException $e) {
            error_log("[ERROR] Exception PDO lors de la création dans Personnes: " . $e->getMessage());
            throw $e;
        }
    }

    public function emailExists() {
        try {
            $query = "SELECT id_personne FROM " . $this->table . " WHERE email_personne = :email_personne LIMIT 1";
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':email_personne', $this->email_personne);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch(PDOException $e) {
            error_log("[ERROR] Exception lors de la vérification de l'email dans Personnes: " . $e->getMessage());
            throw $e;
        }
    }

    public function findByEmail($email_personne) {
        try {
            $query = "SELECT * FROM " . $this->table . " WHERE email_personne = :email_personne LIMIT 1";
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':email_personne', $email_personne);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log("[ERROR] Exception lors de la recherche par email dans Personnes: " . $e->getMessage());
            throw $e;
        }
    }
}
