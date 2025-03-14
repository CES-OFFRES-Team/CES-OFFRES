<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Gestion des requêtes OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Chargement des classes
require_once 'config/database.php';
require_once 'controllers/BaseController.php';

// Récupération de l'URL
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/api', '', $path);

// Routage simple
switch ($path) {
    case '/':
        echo json_encode(['message' => 'API is running']);
        break;
        
    case '/users':
        require_once 'controllers/UserController.php';
        $controller = new UserController();
        $controller->handleRequest();
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
        break;
} 