<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/WishList.php';

class WishListController extends BaseController {
    private $wishListModel;

    public function __construct() {
        parent::__construct();
        $this->wishListModel = new WishList();
    }

    public function getWishList() {
        try {
            $userData = $this->getUserData();
            if (!$userData || !isset($userData['id'])) {
                return $this->jsonResponse(['error' => 'Utilisateur non authentifié'], 401);
            }

            $wishList = $this->wishListModel->getWishList($userData['id']);
            $count = $this->wishListModel->getWishListCount($userData['id']);

            return $this->jsonResponse([
                'count' => $count,
                'stages' => $wishList
            ]);
        } catch (Exception $e) {
            error_log("Erreur dans getWishList: " . $e->getMessage());
            return $this->jsonResponse(['error' => 'Erreur lors de la récupération de la wishlist'], 500);
        }
    }

    public function addToWishList() {
        try {
            $userData = $this->getUserData();
            if (!$userData || !isset($userData['id'])) {
                return $this->jsonResponse(['error' => 'Utilisateur non authentifié'], 401);
            }

            $data = json_decode(file_get_contents('php://input'), true);
            if (!isset($data['idStage'])) {
                return $this->jsonResponse(['error' => 'ID du stage requis'], 400);
            }

            // Vérifier si le stage est déjà dans la wishlist
            if ($this->wishListModel->isInWishList($userData['id'], $data['idStage'])) {
                return $this->jsonResponse(['error' => 'Ce stage est déjà dans votre wishlist'], 400);
            }

            $this->wishListModel->addToWishList($userData['id'], $data['idStage']);
            return $this->jsonResponse(['message' => 'Stage ajouté à la wishlist avec succès'], 201);
        } catch (Exception $e) {
            error_log("Erreur dans addToWishList: " . $e->getMessage());
            return $this->jsonResponse(['error' => 'Erreur lors de l\'ajout à la wishlist'], 500);
        }
    }

    public function removeFromWishList($idStage) {
        try {
            $userData = $this->getUserData();
            if (!$userData || !isset($userData['id'])) {
                return $this->jsonResponse(['error' => 'Utilisateur non authentifié'], 401);
            }

            if (!$idStage) {
                return $this->jsonResponse(['error' => 'ID du stage requis'], 400);
            }

            $this->wishListModel->removeFromWishList($userData['id'], $idStage);
            return $this->jsonResponse(['message' => 'Stage retiré de la wishlist avec succès']);
        } catch (Exception $e) {
            error_log("Erreur dans removeFromWishList: " . $e->getMessage());
            return $this->jsonResponse(['error' => 'Erreur lors de la suppression de la wishlist'], 500);
        }
    }

    public function checkWishListStatus($idStage) {
        try {
            $userData = $this->getUserData();
            if (!$userData || !isset($userData['id'])) {
                return $this->jsonResponse(['error' => 'Utilisateur non authentifié'], 401);
            }

            if (!$idStage) {
                return $this->jsonResponse(['error' => 'ID du stage requis'], 400);
            }

            $isInWishList = $this->wishListModel->isInWishList($userData['id'], $idStage);
            return $this->jsonResponse(['isInWishList' => $isInWishList]);
        } catch (Exception $e) {
            error_log("Erreur dans checkWishListStatus: " . $e->getMessage());
            return $this->jsonResponse(['error' => 'Erreur lors de la vérification du statut de la wishlist'], 500);
        }
    }
} 