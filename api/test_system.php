<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

require_once 'config/database.php';

$tests = [
    'database' => false,
    'php_version' => false,
    'pdo_mysql' => false,
    'json' => false
];

// Test PHP Version
$tests['php_version'] = version_compare(PHP_VERSION, '7.4.0', '>=');

// Test PDO MySQL
$tests['pdo_mysql'] = extension_loaded('pdo_mysql');

// Test Database Connection
try {
    error_log("[DEBUG] Début du test système");
    $database = new Database();
    $db = $database->getConnection();
    
    if(!$db) {
        throw new Exception("Impossible de se connecter à la base de données");
    }

    // Récupération de la structure de la table Offres_de_stage
    $query = "DESCRIBE Offres_de_stage";
    $stmt = $db->query($query);
    $structure_offres = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Récupération de la structure de la table entreprises
    $query = "DESCRIBE entreprises";
    $stmt = $db->query($query);
    $structure_entreprises = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Test de la requête de jointure
    $query = "SELECT o.*, e.nom_entreprise 
              FROM Offres_de_stage o 
              LEFT JOIN entreprises e ON o.id_entreprise = e.id_entreprise 
              LIMIT 1";
    $stmt = $db->query($query);
    $sample_data = $stmt->fetch(PDO::FETCH_ASSOC);

    $tests['database'] = true;
} catch(PDOException $e) {
    error_log("[ERROR] PDOException: " . $e->getMessage());
    $tests['database'] = false;
} catch(Exception $e) {
    error_log("[ERROR] Exception: " . $e->getMessage());
    $tests['database'] = false;
}

// Test JSON
$tests['json'] = function_exists('json_encode') && function_exists('json_decode');

// Résultats
$results = [
    'status' => 'success',
    'message' => 'Test système réussi',
    'tests' => $tests,
    'details' => [
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'server_protocol' => $_SERVER['SERVER_PROTOCOL'] ?? 'Unknown'
    ],
    'structure' => [
        'Offres_de_stage' => $structure_offres,
        'entreprises' => $structure_entreprises
    ],
    'sample_data' => $sample_data
];

echo json_encode($results, JSON_PRETTY_PRINT); 