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

    // Vérification de la table Offres_de_stage
    $query = "SHOW COLUMNS FROM Offres_de_stage";
    $stmt = $db->query($query);
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    error_log("[DEBUG] Colonnes de Offres_de_stage: " . implode(', ', $columns));

    // Vérification de la table entreprises
    $query = "SHOW COLUMNS FROM entreprises";
    $stmt = $db->query($query);
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    error_log("[DEBUG] Colonnes de entreprises: " . implode(', ', $columns));

    // Test de la requête principale
    $query = "SELECT o.*, e.nom_entreprise 
              FROM Offres_de_stage o 
              LEFT JOIN entreprises e ON o.id_entreprise = e.id_entreprise 
              ORDER BY o.date_début DESC";
    $stmt = $db->query($query);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("[DEBUG] Nombre d'offres trouvées: " . count($result));

    $tests['database'] = true;
} catch(Exception $e) {
    $tests['database'] = false;
}

// Test JSON
$tests['json'] = function_exists('json_encode') && function_exists('json_decode');

// Résultats
$results = [
    'status' => 'success',
    'message' => 'Tests système',
    'tests' => $tests,
    'details' => [
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'server_protocol' => $_SERVER['SERVER_PROTOCOL'] ?? 'Unknown'
    ]
];

echo json_encode($results); 