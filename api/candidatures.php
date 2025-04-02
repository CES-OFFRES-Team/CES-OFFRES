<?php

require_once __DIR__ . '/controllers/CandidatureController.php';

// Récupérer la méthode HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Récupérer l'ID de la candidature s'il est présent dans l'URL
$id = null;
if (isset($_GET['id'])) {
    $id = $_GET['id'];
}

// Créer une instance du contrôleur
$controller = new CandidatureController();

// Gérer la requête
echo $controller->handleRequest($method, $id); 