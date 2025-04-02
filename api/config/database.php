<?php
class Database {
    private $host = "localhost";
    private $db_name = "ces_offres";
    private $username = "ces_offres_user";
    private $password = "ces_offres123";
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            error_log("[DEBUG] Tentative de connexion à la base de données");
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                )
            );
            error_log("[DEBUG] Connexion à la base de données établie avec succès");
        } catch(PDOException $e) {
            error_log("[ERROR] Erreur de connexion à la base de données : " . $e->getMessage());
            throw new Exception("Impossible de se connecter à la base de données");
        }

        return $this->conn;
    }
} 