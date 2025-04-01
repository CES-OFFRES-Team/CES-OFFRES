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

    public function getEtudiants() {
        try {
            $query = "SELECT id_personne, nom_personne, prenom_personne, téléphone_personne, email_personne, role 
                     FROM " . $this->table . " 
                     WHERE role = 'Etudiant'";
            
            error_log("[DEBUG] Requête pour récupérer les étudiants: " . $query);
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return $stmt;
        } catch(PDOException $e) {
            error_log("[ERROR] Exception lors de la récupération des étudiants: " . $e->getMessage());
            throw $e;
        }
    }

    public function getPilotes() {
        try {
            $query = "SELECT id_personne, nom_personne, prenom_personne, téléphone_personne, email_personne, role 
                     FROM " . $this->table . " 
                     WHERE role = 'Pilote'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (Exception $e) {
            error_log("[ERROR] Erreur lors de la récupération des pilotes: " . $e->getMessage());
            throw $e;
        }
    }

    public function create() {
        try {
            $query = "INSERT INTO " . $this->table . "
                    (nom_personne, prenom_personne, téléphone_personne, email_personne, password_personne, role)
                    VALUES
                    (:nom_personne, :prenom_personne, :telephone_personne, :email_personne, :password_personne, :role)";

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
                'password' => 'HIDDEN',
                'role' => $this->role
            ], true));

            // Liaison des paramètres avec les noms exacts
            $stmt->bindParam(":nom_personne", $this->nom_personne);
            $stmt->bindParam(":prenom_personne", $this->prenom_personne);
            $stmt->bindParam(":telephone_personne", $this->téléphone_personne);
            $stmt->bindParam(":email_personne", $this->email_personne);
            $stmt->bindParam(":password_personne", $this->password_personne);
            $stmt->bindParam(":role", $this->role);

            if($stmt->execute()) {
                error_log("[SUCCESS] Insertion réussie dans la table Personnes");
                return true;
            }

            $error = $stmt->errorInfo();
            error_log("[ERROR] Échec de l'exécution de la requête SQL sur la table Personnes");
            error_log("[ERROR] SQL State: " . $error[0]);
            error_log("[ERROR] Error Code: " . $error[1]);
            error_log("[ERROR] Message: " . $error[2]);
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

    public function findByToken($token) {
        try {
            $query = "SELECT * FROM " . $this->table . " WHERE token = :token";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":token", $token);
            
            error_log("[DEBUG] Recherche d'un utilisateur par token");
            
            if($stmt->execute()) {
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                if($user) {
                    error_log("[SUCCESS] Utilisateur trouvé avec le token");
                    return $user;
                }
                error_log("[INFO] Aucun utilisateur trouvé avec ce token");
                return null;
            }
            
            error_log("[ERROR] Erreur lors de l'exécution de la requête de recherche par token");
            return null;
        } catch(PDOException $e) {
            error_log("[ERROR] Exception PDO lors de la recherche par token: " . $e->getMessage());
            return null;
        }
    }

    // Méthode pour mettre à jour le token d'un utilisateur
    public function updateToken($userId, $token) {
        try {
            $query = "UPDATE " . $this->table . " SET token = :token WHERE id_personne = :id";
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(":token", $token);
            $stmt->bindParam(":id", $userId);
            
            if($stmt->execute()) {
                error_log("[SUCCESS] Token mis à jour pour l'utilisateur ID: " . $userId);
                return true;
            }
            
            error_log("[ERROR] Échec de la mise à jour du token pour l'utilisateur ID: " . $userId);
            return false;
        } catch(PDOException $e) {
            error_log("[ERROR] Exception PDO lors de la mise à jour du token: " . $e->getMessage());
            return false;
        }
    }

    public function update($id, $data) {
        try {
            $query = "UPDATE " . $this->table . "
                     SET nom_personne = :nom_personne,
                         prenom_personne = :prenom_personne,
                         téléphone_personne = :telephone_personne,
                         email_personne = :email_personne
                     WHERE id_personne = :id";

            error_log("[DEBUG] Requête de mise à jour: " . $query);
            error_log("[DEBUG] Données à mettre à jour: " . print_r($data, true));

            $stmt = $this->conn->prepare($query);

            // Nettoyage des données
            $data['nom_personne'] = htmlspecialchars(strip_tags(trim($data['nom_personne'])));
            $data['prenom_personne'] = htmlspecialchars(strip_tags(trim($data['prenom_personne'])));
            $data['téléphone_personne'] = htmlspecialchars(strip_tags(trim($data['téléphone_personne'])));
            $data['email_personne'] = htmlspecialchars(strip_tags(trim($data['email_personne'])));

            // Liaison des paramètres
            $stmt->bindParam(":nom_personne", $data['nom_personne']);
            $stmt->bindParam(":prenom_personne", $data['prenom_personne']);
            $stmt->bindParam(":telephone_personne", $data['téléphone_personne']);
            $stmt->bindParam(":email_personne", $data['email_personne']);
            $stmt->bindParam(":id", $id);

            if($stmt->execute()) {
                error_log("[SUCCESS] Mise à jour réussie pour l'utilisateur ID: " . $id);
                return true;
            }

            $error = $stmt->errorInfo();
            error_log("[ERROR] Échec de la mise à jour pour l'utilisateur ID: " . $id);
            error_log("[ERROR] SQL State: " . $error[0]);
            error_log("[ERROR] Error Code: " . $error[1]);
            error_log("[ERROR] Message: " . $error[2]);
            return false;

        } catch(PDOException $e) {
            error_log("[ERROR] Exception PDO lors de la mise à jour: " . $e->getMessage());
            throw $e;
        }
    }
}
