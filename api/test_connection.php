<?php
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if($db) {
        echo json_encode([
            "status" => "success",
            "message" => "Connexion à la base de données réussie !"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Impossible de se connecter à la base de données."
        ]);
    }
} catch(Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
} 