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
    $database = new Database();
    $db = $database->getConnection();
    if($db) {
        $tests['database'] = true;
    }
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