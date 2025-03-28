<?php
class User {
    private $conn;
    private $table = 'users';

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
        $query = "INSERT INTO " . $this->table . "
                SET
                    nom_personne = :nom_personne,
                    prenom_personne = :prenom_personne,
                    téléphone_personne = :téléphone_personne,
                    email_personne = :email_personne,
                    password_personne = :password_personne,
                    role = :role";

        $stmt = $this->conn->prepare($query);

        // Protection contre les injections SQL
        $this->nom_personne = htmlspecialchars(strip_tags($this->nom_personne));
        $this->prenom_personne = htmlspecialchars(strip_tags($this->prenom_personne));
        $this->téléphone_personne = htmlspecialchars(strip_tags($this->téléphone_personne));
        $this->email_personne = htmlspecialchars(strip_tags($this->email_personne));
        $this->password_personne = password_hash($this->password_personne, PASSWORD_DEFAULT);
        $this->role = htmlspecialchars(strip_tags($this->role));

        // Liaison des paramètres
        $stmt->bindParam(":nom_personne", $this->nom_personne);
        $stmt->bindParam(":prenom_personne", $this->prenom_personne);
        $stmt->bindParam(":téléphone_personne", $this->téléphone_personne);
        $stmt->bindParam(":email_personne", $this->email_personne);
        $stmt->bindParam(":password_personne", $this->password_personne);
        $stmt->bindParam(":role", $this->role);

        return $stmt->execute();
    }

    public function emailExists() {
        $query = "SELECT id_personne FROM " . $this->table . " WHERE email_personne = :email_personne LIMIT 1";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':email_personne', $this->email_personne);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }

    public function findByEmail($email_personne) {
        $query = "SELECT * FROM " . $this->table . " WHERE email_personne = :email_personne LIMIT 1";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':email_personne', $email_personne);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
