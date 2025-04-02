<?php
error_log("[DEBUG] Début du traitement de la requête dans candidatures.php");

// Récupération de l'origine de la requête
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
error_log("[DEBUG] Origine de la requête candidature: " . $origin);

// Liste des origines autorisées
$allowed_origins = [
    'http://20.19.36.142',
    'http://20.19.36.142:8000',
    'http://localhost:3000'
];

// Vérification si l'origine est autorisée
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    error_log("[DEBUG] Origine autorisée pour candidature: $origin");
} else {
    error_log("[DEBUG] Origine non autorisée pour candidature: $origin");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Gestion des requêtes OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    error_log("[DEBUG] Requête OPTIONS détectée pour candidature");
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/controllers/CandidatureController.php';

// Récupérer la méthode HTTP
$method = $_SERVER['REQUEST_METHOD'];
error_log("[DEBUG] Méthode HTTP pour candidature: " . $method);

// Récupérer l'ID de la candidature s'il est présent dans l'URL
$id = null;
if (isset($_GET['id'])) {
    $id = $_GET['id'];
    error_log("[DEBUG] ID de candidature: " . $id);
}

// Créer une instance du contrôleur
$controller = new CandidatureController();

// Gérer la requête
echo $controller->handleRequest($method, $id); 