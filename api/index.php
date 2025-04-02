<?php
error_log("[DEBUG] Début du traitement de la requête dans index.php");

// Récupération de l'origine de la requête
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
error_log("[DEBUG] Origine de la requête: " . $origin);

// Liste des origines autorisées
$allowed_origins = [
    'http://20.19.36.142',
    'http://20.19.36.142:8000',
    'http://localhost:3000'
];

// Vérification si l'origine est autorisée
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    error_log("[DEBUG] Origine autorisée: $origin");
} else {
    error_log("[DEBUG] Origine non autorisée: $origin");
}

// En-têtes CORS pour les requêtes préliminaires (OPTIONS)
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400'); // 24 heures

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