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
require_once 'controllers/UserController.php';
require_once 'controllers/CandidatureController.php';
require_once __DIR__ . '/controllers/EntrepriseController.php';

// Récupération de l'URL
$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Extraction du chemin
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/api', '', $path);

// Routage
switch ($path) {
    case '/users':
        $controller = new UserController();
        echo $controller->handleRequest($method);
        break;

    case '/users/etudiants':
        $controller = new UserController();
        echo $controller->handleRequest($method);
        break;

    case '/users/pilotes':
        $controller = new UserController();
        echo $controller->handleRequest($method);
        break;

    case (preg_match('/^\/users\/\d+$/', $path) ? true : false):
        $controller = new UserController();
        echo $controller->handleRequest($method);
        break;

    case '/login':
        $controller = new UserController();
        echo $controller->handleRequest($method);
        break;
        
    case '/candidatures':
        $controller = new CandidatureController();
        echo $controller->handleRequest($method);
        break;
        
    case '/entreprises':
        $controller = new EntrepriseController();
        echo $controller->handleRequest($method);
        break;

    case (preg_match('/^\/entreprises\/\d+$/', $path) ? true : false):
        $controller = new EntrepriseController();
        $id = substr($path, strrpos($path, '/') + 1);
        echo $controller->handleRequest($method, $id);
        break;

    default:
        http_response_code(404);
        echo json_encode(array("message" => "Route non trouvée"));
        break;
}