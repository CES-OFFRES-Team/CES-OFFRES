<?php
error_log("[DEBUG] Début du traitement de la requête dans index.php");

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Gestion des requêtes OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    error_log("[DEBUG] Requête OPTIONS détectée");
    http_response_code(200);
    exit();
}

// Chargement des classes
require_once 'config/database.php';
require_once 'controllers/BaseController.php';
require_once 'controllers/UserController.php';
require_once 'controllers/CandidatureController.php';
require_once __DIR__ . '/controllers/EntrepriseController.php';
require_once __DIR__ . '/controllers/OffreController.php';

// Récupération de l'URL
$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];
error_log("[DEBUG] URI reçue: " . $request_uri);
error_log("[DEBUG] Méthode HTTP: " . $method);

// Extraction du chemin
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/api', '', $path);
error_log("[DEBUG] Chemin traité: " . $path);

// Extraction de l'ID si présent
$id = null;
if (preg_match('/\/(\d+)$/', $path, $matches)) {
    $id = $matches[1];
    // Nettoyer le chemin pour le routage
    $path = preg_replace('/\/\d+$/', '', $path);
    error_log("[DEBUG] ID extrait: " . $id);
    error_log("[DEBUG] Chemin nettoyé: " . $path);
}

// Routage
try {
    error_log("[DEBUG] Tentative de routage pour le chemin: " . $path . " avec la méthode: " . $method . " et l'ID: " . ($id ?? 'null'));
    switch ($path) {
        case '/users':
        case '/users/etudiants':
        case '/users/pilotes':
        case '/login':
            $controller = new UserController();
            echo $controller->handleRequest($method);
            break;

        case '/candidatures':
            error_log("[DEBUG] Route /candidatures détectée");
            error_log("[DEBUG] Méthode: " . $method);
            error_log("[DEBUG] ID: " . ($id ?? 'null'));
            $controller = new CandidatureController();
            echo $controller->handleRequest($method, $id);
            break;
        
        case '/entreprises':
            $controller = new EntrepriseController();
            echo $controller->handleRequest($method, $id);
            break;

        case '/offres':
        case (preg_match('/^\/offres\/\d+$/', $path) ? $path : !$path):
            $controller = new OffreController();
            echo $controller->handleRequest($method, $id);
            break;

        default:
            error_log("[ERROR] Route non trouvée: " . $path);
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Route non trouvée'
            ]);
            break;
    }
} catch (Exception $e) {
    error_log("[ERROR] Exception dans le routage: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur serveur interne'
    ]);
}