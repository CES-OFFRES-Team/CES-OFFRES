<?php
// Activer l'affichage des erreurs pour le débogage
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Inclure les fichiers nécessaires
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/BaseController.php';
require_once __DIR__ . '/controllers/WishListController.php';

// Fonction pour afficher les résultats de manière lisible
function displayResult($title, $data) {
    echo "<h2>$title</h2>";
    echo "<pre>";
    print_r($data);
    echo "</pre>";
    echo "<hr>";
}

// Créer une instance du contrôleur
$controller = new WishListController();

// Test 1: Récupérer la wishlist d'un utilisateur spécifique
echo "<h1>Test de la Wishlist</h1>";

// ID de l'utilisateur à tester (à remplacer par un ID valide)
$userId = 1; // Remplacez par un ID d'utilisateur valide

try {
    // Test de la méthode getWishList
    echo "<h2>Test de getWishList pour l'utilisateur ID: $userId</h2>";
    
    // Créer une instance du modèle WishList
    $wishListModel = new WishList();
    
    // Récupérer la wishlist
    $wishList = $wishListModel->getWishList($userId);
    displayResult("Wishlist récupérée", $wishList);
    
    // Compter le nombre d'éléments
    $count = $wishListModel->getWishListCount($userId);
    displayResult("Nombre d'éléments dans la wishlist", $count);
    
    // Test de la méthode isInWishList
    if (!empty($wishList)) {
        $firstStageId = $wishList[0]['id_stage'];
        $isInWishList = $wishListModel->isInWishList($userId, $firstStageId);
        displayResult("Vérification si le stage ID $firstStageId est dans la wishlist", $isInWishList);
    }
    
    // Test de la méthode addToWishList (commenté pour éviter d'ajouter des doublons)
    /*
    $newStageId = 10; // ID d'un stage à ajouter
    $added = $wishListModel->addToWishList($userId, $newStageId);
    displayResult("Ajout du stage ID $newStageId à la wishlist", $added);
    */
    
    // Test de la méthode removeFromWishList (commenté pour éviter de supprimer des données)
    /*
    if (!empty($wishList)) {
        $stageToRemove = $wishList[0]['id_stage'];
        $removed = $wishListModel->removeFromWishList($userId, $stageToRemove);
        displayResult("Suppression du stage ID $stageToRemove de la wishlist", $removed);
    }
    */
    
} catch (Exception $e) {
    echo "<h2>Erreur</h2>";
    echo "<pre>";
    echo "Message: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString();
    echo "</pre>";
}

// Afficher la structure de la table
echo "<h2>Structure de la table ajouter_wish_list</h2>";
try {
    $db = Database::getInstance()->getConnection();
    $query = "DESCRIBE ajouter_wish_list";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    displayResult("Structure de la table", $columns);
} catch (Exception $e) {
    echo "<h2>Erreur lors de la récupération de la structure de la table</h2>";
    echo "<pre>" . $e->getMessage() . "</pre>";
}

// Afficher quelques exemples de données
echo "<h2>Exemples de données dans la table ajouter_wish_list</h2>";
try {
    $db = Database::getInstance()->getConnection();
    $query = "SELECT * FROM ajouter_wish_list LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $examples = $stmt->fetchAll(PDO::FETCH_ASSOC);
    displayResult("Exemples de données", $examples);
} catch (Exception $e) {
    echo "<h2>Erreur lors de la récupération des exemples de données</h2>";
    echo "<pre>" . $e->getMessage() . "</pre>";
} 