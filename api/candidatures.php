<?php
error_log("[DEBUG] Début du traitement de la requête dans candidatures.php");

// Chargement de la configuration CORS
require_once 'config/cors.php';

require_once __DIR__ . '/controllers/CandidatureController.php';

try {
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

    // Vérifier que la réponse est bien du JSON
    if (!isJson($response)) {
        throw new Exception("La réponse n'est pas au format JSON valide");
    }

    // Envoyer la réponse
    header('Content-Type: application/json');
    echo $response;

} catch (Exception $e) {
    error_log("[ERROR] Exception dans candidatures.php: " . $e->getMessage());
    error_log("[ERROR] Trace: " . $e->getTraceAsString());
    
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur serveur: ' . $e->getMessage(),
        'debug_info' => [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]
    ]);
}

// Fonction pour vérifier si une chaîne est du JSON valide
function isJson($string) {
    if (!is_string($string)) {
        return false;
    }
    json_decode($string);
    return (json_last_error() === JSON_ERROR_NONE);
} 