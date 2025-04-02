<?php
class Database {
    public $host = "localhost";
    public $db_name = "ces_offres";
    public $username = "ces_offres_user";
    public $password = "ces_offres123";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            error_log("[DEBUG] Tentative de connexion à la base de données");
            error_log("[DEBUG] Host: " . $this->host);
            error_log("[DEBUG] Database: " . $this->db_name);
            error_log("[DEBUG] Username: " . $this->username);
            
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            error_log("[DEBUG] DSN: " . $dsn);
            
            $this->conn = new PDO($dsn, $this->username, $this->password, array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ));
            
            // Test de la connexion
            $this->conn->query("SELECT 1");
            error_log("[DEBUG] Connexion à la base de données établie avec succès");
        } catch(PDOException $e) {
            error_log("[ERROR] Erreur de connexion à la base de données");
            error_log("[ERROR] Code: " . $e->getCode());
            error_log("[ERROR] Message: " . $e->getMessage());
            throw new Exception("Impossible de se connecter à la base de données: " . $e->getMessage());
        }

        return $this->conn;
    }
} 