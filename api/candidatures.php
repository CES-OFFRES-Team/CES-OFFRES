<?php
error_log("[DEBUG] Début du traitement de la requête dans candidatures.php");

// Chargement de la configuration CORS
require_once 'config/cors.php';

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

// Gérer la requête et stocker la réponse
$response = $controller->handleRequest($method, $id);

// Envoyer la réponse
header('Content-Type: application/json');
echo $response; 