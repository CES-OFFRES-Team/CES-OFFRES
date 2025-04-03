<?php
// Liste des origines autorisées
$allowed_origins = [
    'http://20.19.36.142',
    'http://20.19.36.142:8000',
    'http://20.19.36.142:3000',  // Frontend
    'http://localhost:3000',
    'http://localhost'
];

// Récupération de l'origine de la requête
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Vérification si l'origine est autorisée
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    error_log("[CORS] Origine autorisée: $origin");
} else {
    error_log("[CORS] Origine non autorisée: $origin");
}

// Configuration CORS standard
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400'); // 24 heures

// Gestion des requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    error_log("[CORS] Requête OPTIONS détectée");
    http_response_code(200);
    exit();
} 