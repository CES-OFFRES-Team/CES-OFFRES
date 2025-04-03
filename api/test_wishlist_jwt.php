<?php

require_once __DIR__ . '/utils/JWTUtils.php';
require_once __DIR__ . '/controllers/WishListController.php';
require_once __DIR__ . '/models/WishList.php';

class WishListTest {
    private $jwtUtils;
    private $wishListController;
    private $testUserId = 5; // ID de l'utilisateur de test
    private $testStageId = 1; // ID du stage de test

    public function __construct() {
        $this->jwtUtils = new JWTUtils();
        $this->wishListController = new WishListController();
    }

    public function runTests() {
        echo "\n=== Début des tests de la WishList ===\n\n";

        // Test 1: Génération du token
        echo "1. Test de génération du token JWT\n";
        $token = $this->jwtUtils->generateToken($this->testUserId, 'Etudiant');
        if (!empty($token)) {
            echo "✅ Token généré avec succès: " . substr($token, 0, 50) . "...\n\n";
        } else {
            echo "❌ Échec de la génération du token\n\n";
            return;
        }

        // Test 2: Vérification du token
        echo "2. Test de vérification du token\n";
        $payload = $this->jwtUtils->verifyToken($token);
        if ($payload && $payload->id == $this->testUserId) {
            echo "✅ Token vérifié avec succès\n";
            echo "   ID utilisateur: " . $payload->id . "\n";
            echo "   Rôle: " . $payload->role . "\n\n";
        } else {
            echo "❌ Échec de la vérification du token\n\n";
            return;
        }

        // Simulation des headers pour le test
        $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;

        // Test 3: Récupération de la wishlist
        echo "3. Test de récupération de la wishlist\n";
        $response = $this->simulateRequest('GET', 'list');
        $this->displayResponse($response);

        // Test 4: Ajout d'un stage à la wishlist
        echo "\n4. Test d'ajout d'un stage à la wishlist\n";
        $_POST = ['idStage' => $this->testStageId];
        $response = $this->simulateRequest('POST', 'add');
        $this->displayResponse($response);

        // Test 5: Vérification que le stage a bien été ajouté
        echo "\n5. Vérification de l'ajout du stage\n";
        $response = $this->simulateRequest('GET', 'list');
        $this->displayResponse($response);

        // Test 6: Suppression du stage de la wishlist
        echo "\n6. Test de suppression du stage de la wishlist\n";
        $response = $this->simulateRequest('DELETE', 'remove', $this->testStageId);
        $this->displayResponse($response);

        // Test 7: Test avec un token invalide
        echo "\n7. Test avec un token invalide\n";
        $_SERVER['HTTP_AUTHORIZATION'] = 'Bearer invalid_token';
        $response = $this->simulateRequest('GET', 'list');
        $this->displayResponse($response);

        echo "\n=== Fin des tests ===\n";
    }

    private function simulateRequest($method, $action, $id = null) {
        ob_start();
        $result = $this->wishListController->handleRequest($method, $action, $id);
        $output = ob_get_clean();
        return ['result' => $result, 'output' => $output];
    }

    private function displayResponse($response) {
        if (!empty($response['output'])) {
            echo "Output: " . $response['output'] . "\n";
        }
        if (!empty($response['result'])) {
            echo "Résultat: " . $response['result'] . "\n";
            $decoded = json_decode($response['result']);
            if ($decoded) {
                echo "Données décodées: \n";
                print_r($decoded);
            }
        }
    }

    private function cleanupTest() {
        // Nettoyer les données de test si nécessaire
        try {
            $database = new Database();
            $db = $database->getConnection();
            $stmt = $db->prepare("DELETE FROM ajouter_wish_list WHERE id_personne = ? AND id_stage = ?");
            $stmt->execute([$this->testUserId, $this->testStageId]);
        } catch (Exception $e) {
            echo "Erreur lors du nettoyage: " . $e->getMessage() . "\n";
        }
    }
}

// Exécution des tests
try {
    $tester = new WishListTest();
    $tester->runTests();
} catch (Exception $e) {
    echo "❌ Erreur lors des tests: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
} 