<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/WishList.php';

class WishListController extends BaseController {
    private $wishListModel;

    public function __construct() {
        $this->wishListModel = new WishList();
    }

    public function handleRequest($method, $action = null, $id = null) {
        header("Access-Control-Allow-Origin: *");
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Max-Age: 3600");
        header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

        if ($method === 'OPTIONS') {
            http_response_code(200);
            return json_encode(['status' => 'success']);
        }

        try {
            switch ($action) {
                case 'getWishList':
                    return $this->getWishList();
                case 'addToWishList':
                    return $this->addToWishList();
                case 'removeFromWishList':
                    return $this->removeFromWishList($id);
                case 'checkWishListStatus':
                    return $this->checkWishListStatus($id);
                default:
                    http_response_code(400);
                    return json_encode(['error' => 'Action non supportée']);
            }
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans WishListController: " . $e->getMessage());
            http_response_code(500);
            return json_encode(['error' => 'Erreur serveur interne']);
        }
    }

    private function getWishList() {
        try {
            $userData = $this->getUserData();
            if (!$userData || !isset($userData['id'])) {
                http_response_code(401);
                return json_encode(['error' => 'Utilisateur non authentifié']);
            }

            $wishList = $this->wishListModel->getWishList($userData['id']);
            $count = $this->wishListModel->getWishListCount($userData['id']);

            return json_encode([
                'count' => $count,
                'stages' => $wishList
            ]);
        } catch (Exception $e) {
            error_log("Erreur dans getWishList: " . $e->getMessage());
            http_response_code(500);
            return json_encode(['error' => 'Erreur lors de la récupération de la wishlist']);
        }
    }

    private function addToWishList() {
        try {
            $userData = $this->getUserData();
            if (!$userData || !isset($userData['id'])) {
                http_response_code(401);
                return json_encode(['error' => 'Utilisateur non authentifié']);
            }

            $data = json_decode(file_get_contents('php://input'), true);
            if (!isset($data['idStage'])) {
                http_response_code(400);
                return json_encode(['error' => 'ID du stage requis']);
            }

            if ($this->wishListModel->isInWishList($userData['id'], $data['idStage'])) {
                http_response_code(400);
                return json_encode(['error' => 'Ce stage est déjà dans votre wishlist']);
            }

            $this->wishListModel->addToWishList($userData['id'], $data['idStage']);
            http_response_code(201);
            return json_encode(['message' => 'Stage ajouté à la wishlist avec succès']);
        } catch (Exception $e) {
            error_log("Erreur dans addToWishList: " . $e->getMessage());
            http_response_code(500);
            return json_encode(['error' => 'Erreur lors de l\'ajout à la wishlist']);
        }
    }

    private function removeFromWishList($idStage) {
        try {
            $userData = $this->getUserData();
            if (!$userData || !isset($userData['id'])) {
                http_response_code(401);
                return json_encode(['error' => 'Utilisateur non authentifié']);
            }

            if (!$idStage) {
                http_response_code(400);
                return json_encode(['error' => 'ID du stage requis']);
            }

            $this->wishListModel->removeFromWishList($userData['id'], $idStage);
            return json_encode(['message' => 'Stage retiré de la wishlist avec succès']);
        } catch (Exception $e) {
            error_log("Erreur dans removeFromWishList: " . $e->getMessage());
            http_response_code(500);
            return json_encode(['error' => 'Erreur lors de la suppression de la wishlist']);
        }
    }

    private function checkWishListStatus($idStage) {
        try {
            $userData = $this->getUserData();
            if (!$userData || !isset($userData['id'])) {
                http_response_code(401);
                return json_encode(['error' => 'Utilisateur non authentifié']);
            }

            if (!$idStage) {
                http_response_code(400);
                return json_encode(['error' => 'ID du stage requis']);
            }

            $isInWishList = $this->wishListModel->isInWishList($userData['id'], $idStage);
            return json_encode(['isInWishList' => $isInWishList]);
        } catch (Exception $e) {
            error_log("Erreur dans checkWishListStatus: " . $e->getMessage());
            http_response_code(500);
            return json_encode(['error' => 'Erreur lors de la vérification du statut de la wishlist']);
        }
    }
} 