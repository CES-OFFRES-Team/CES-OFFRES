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
    
    // Standardisation des routes
    $routes = [
        '/users' => ['controller' => 'UserController', 'methods' => ['GET', 'POST']],
        '/users/etudiants' => ['controller' => 'UserController', 'methods' => ['GET']],
        '/users/pilotes' => ['controller' => 'UserController', 'methods' => ['GET']],
        '/login' => ['controller' => 'UserController', 'methods' => ['POST']],
        '/candidatures' => ['controller' => 'CandidatureController', 'methods' => ['GET', 'POST']],
        '/candidatures/\d+' => ['controller' => 'CandidatureController', 'methods' => ['GET', 'PUT', 'DELETE']],
        '/entreprises' => ['controller' => 'EntrepriseController', 'methods' => ['GET', 'POST']],
        '/entreprises/\d+' => ['controller' => 'EntrepriseController', 'methods' => ['GET', 'PUT', 'DELETE']],
        '/offres' => ['controller' => 'OffreController', 'methods' => ['GET', 'POST']],
        '/offres/\d+' => ['controller' => 'OffreController', 'methods' => ['GET', 'PUT', 'DELETE']]
    ];

    // Recherche de la route correspondante
    $matched_route = null;
    foreach ($routes as $route_pattern => $route_config) {
        if (preg_match('#^' . $route_pattern . '$#', $path)) {
            $matched_route = $route_config;
            break;
        }
    }

    if ($matched_route) {
        error_log("[DEBUG] Route trouvée: " . $path);
        error_log("[DEBUG] Méthodes autorisées: " . implode(', ', $matched_route['methods']));
        
        if (!in_array($method, $matched_route['methods'])) {
            error_log("[ERROR] Méthode non autorisée: " . $method);
            http_response_code(405);
            echo json_encode([
                'status' => 'error',
                'message' => 'Méthode non autorisée',
                'allowed_methods' => $matched_route['methods']
            ]);
            exit();
        }

        $controller_name = $matched_route['controller'];
        $controller = new $controller_name();
        echo $controller->handleRequest($method, $id);
    } else {
        error_log("[ERROR] Route non trouvée: " . $path);
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'Route non trouvée',
            'path' => $path,
            'method' => $method
        ]);
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
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]
    ]);
}