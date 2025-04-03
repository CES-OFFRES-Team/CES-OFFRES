<?php
error_log("[DEBUG] Début du traitement de la requête dans index.php");

// Chargement de la configuration CORS
require_once 'config/cors.php';

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

// Extraction des paramètres GET
$query_params = [];
if (isset($_SERVER['QUERY_STRING'])) {
    parse_str($_SERVER['QUERY_STRING'], $query_params);
    error_log("[DEBUG] Paramètres GET: " . print_r($query_params, true));
}

// Routage
try {
    error_log("[DEBUG] Tentative de routage pour le chemin: " . $path);
    
    // Extraire le chemin de base (sans paramètres)
    $base_path = strtok($path, '?');
    error_log("[DEBUG] Chemin de base: " . $base_path);

    switch ($base_path) {
        case '/users':
        case '/users/etudiants':
        case '/users/pilotes':
        case '/login':
        case '/verify-token':
            $controller = new UserController();
            echo $controller->handleRequest($method);
            break;

        case '/candidatures':
        case '/candidatures.php':  // Ajout pour la compatibilité
            error_log("[DEBUG] Route /candidatures détectée");
            error_log("[DEBUG] Méthode: " . $method);
            $controller = new CandidatureController();
            echo $controller->handleRequest($method, isset($query_params['id']) ? $query_params['id'] : null);
            break;
        
        case '/entreprises':
            $controller = new EntrepriseController();
            echo $controller->handleRequest($method, isset($query_params['id']) ? $query_params['id'] : null);
            break;

        case '/offres':
            $controller = new OffreController();
            echo $controller->handleRequest($method, isset($query_params['id']) ? $query_params['id'] : null);
            break;

        default:
            error_log("[ERROR] Route non trouvée: " . $base_path);
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Route non trouvée'
            ]);
            break;
    }
} catch (Exception $e) {
    error_log("[ERROR] Exception dans le routage: " . $e->getMessage());
    error_log("[ERROR] Trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur serveur interne',
        'debug_info' => [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
}