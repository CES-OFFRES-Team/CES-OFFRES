<?php
require_once 'config/database.php';

try {
    error_log("[DEBUG] Début du test de connexion");
    $database = new Database();
    $db = $database->getConnection();
    
    if($db) {
        // Test de la connexion avec une requête simple
        $query = "SELECT 1";
        $stmt = $db->query($query);
        $result = $stmt->fetch();

        if ($result) {
            echo json_encode([
                "status" => "success",
                "message" => "Connexion à la base de données réussie !",
                "details" => [
                    "host" => $database->host,
                    "database" => $database->db_name,
                    "user" => $database->username
                ]
            ]);
        } else {
            throw new Exception("La connexion est établie mais la requête test a échoué");
        }
    } else {
        throw new Exception("Impossible d'établir la connexion à la base de données");
    }
} catch(PDOException $e) {
    error_log("[ERROR] PDOException: " . $e->getMessage());
    echo json_encode([
        "status" => "error",
        "message" => "Erreur PDO: " . $e->getMessage(),
        "code" => $e->getCode()
    ]);
} catch(Exception $e) {
    error_log("[ERROR] Exception: " . $e->getMessage());
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
} 