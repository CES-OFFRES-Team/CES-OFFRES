<?php
// Activer l'affichage des erreurs pour le débogage
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Inclure les fichiers nécessaires
require_once __DIR__ . '/config/database.php';

// Fonction pour afficher les résultats de manière lisible
function displayResult($title, $data) {
    echo "<h2>$title</h2>";
    echo "<pre>";
    print_r($data);
    echo "</pre>";
    echo "<hr>";
}

echo "<h1>Test de la table Wishlist</h1>";

try {
    // Connexion à la base de données
    $database = new Database();
    $db = $database->getConnection();

    // 1. Afficher la structure de la table
    $query = "DESCRIBE ajouter_wish_list";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $structure = $stmt->fetchAll(PDO::FETCH_ASSOC);
    displayResult("Structure de la table ajouter_wish_list", $structure);

    // 2. Afficher toutes les données de la table
    $query = "SELECT w.*, 
              o.titre as titre_stage,
              p.nom_personne, p.prenom_personne
              FROM ajouter_wish_list w
              LEFT JOIN Offres_de_stage o ON w.id_stage = o.id_stage
              LEFT JOIN Personnes p ON w.id_personne = p.id_personne
              ORDER BY w.date_ajout DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    displayResult("Contenu de la table ajouter_wish_list avec détails", $data);

} catch (Exception $e) {
    echo "<h2>Erreur</h2>";
    echo "<pre>";
    echo "Message: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString();
    echo "</pre>";
} 