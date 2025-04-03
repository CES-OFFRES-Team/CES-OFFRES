<?php

require_once __DIR__ . '/../models/WishList.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';

class WishListController {
    private $wishListModel;
    private $db;
    private $userModel;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->wishListModel = new WishList($this->db);
        $this->userModel = new User($this->db);
    }

    private function getAuthenticatedUser() {
        $headers = apache_request_headers();
        if (!isset($headers['Authorization'])) {
            throw new Exception('Token manquant');
        }

        $token = str_replace('Bearer ', '', $headers['Authorization']);
        
        // Vérifier le token en utilisant la méthode findByToken du modèle User
        $user = $this->userModel->findByToken($token);
        
        if (!$user) {
            error_log("Token invalide ou utilisateur non trouvé");
            throw new Exception('Token invalide');
        }

        return $user;
    }

    public function handleRequest($method, $action = null, $id = null) {
        header("Access-Control-Allow-Origin: *");
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
        header("Access-Control-Max-Age: 3600");
        header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

        if ($method === 'OPTIONS') {
            http_response_code(200);
            return;
        }

        try {
            // Vérifier l'authentification pour toutes les routes sauf OPTIONS
            if ($method !== 'OPTIONS') {
                $user = $this->getAuthenticatedUser();
            }

            switch ($action) {
                case 'list':
                    return $this->getWishList($user['id_personne']);
                case 'add':
                    return $this->addToWishList($user['id_personne']);
                case 'remove':
                    if ($id) {
                        return $this->removeFromWishList($user['id_personne'], $id);
                    }
                    http_response_code(400);
                    return json_encode(['error' => 'ID du stage manquant']);
                default:
                    http_response_code(404);
                    return json_encode(['error' => 'Action non trouvée']);
            }
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans WishListController: " . $e->getMessage());
            
            if ($e->getMessage() === 'Token manquant' || $e->getMessage() === 'Token invalide') {
                http_response_code(401);
                return json_encode(['error' => $e->getMessage()]);
            }
            
            http_response_code(500);
            return json_encode(['error' => 'Erreur lors de la récupération de la wishlist']);
        }
    }

    private function getWishList($userId) {
        try {
            $wishList = $this->wishListModel->getWishList($userId);
            
            if ($wishList === false) {
                throw new Exception("Erreur lors de la récupération de la wishlist");
            }

            return json_encode([
                'status' => 'success',
                'stages' => $wishList
            ]);
        } catch (Exception $e) {
            error_log("Erreur dans getWishList: " . $e->getMessage());
            http_response_code(500);
            return json_encode(['error' => 'Erreur lors de la récupération de la wishlist']);
        }
    }

    private function addToWishList($userId) {
        try {
            $data = json_decode(file_get_contents("php://input"));

            if (!isset($data->idStage)) {
                http_response_code(400);
                return json_encode(['error' => 'ID du stage manquant']);
            }

            if ($this->wishListModel->isInWishList($userId, $data->idStage)) {
                http_response_code(400);
                return json_encode(['error' => 'Stage déjà dans la wishlist']);
            }

            if ($this->wishListModel->addToWishList($userId, $data->idStage)) {
                http_response_code(201);
                return json_encode(['message' => 'Stage ajouté avec succès']);
            } else {
                throw new Exception("Erreur lors de l'ajout du stage");
            }
        } catch (Exception $e) {
            error_log("Erreur dans addToWishList: " . $e->getMessage());
            http_response_code(500);
            return json_encode(['error' => 'Erreur lors de l\'ajout à la wishlist']);
        }
    }

    private function removeFromWishList($userId, $idStage) {
        try {
            if ($this->wishListModel->removeFromWishList($userId, $idStage)) {
                return json_encode(['message' => 'Stage retiré avec succès']);
            } else {
                throw new Exception("Erreur lors de la suppression du stage");
            }
        } catch (Exception $e) {
            error_log("Erreur dans removeFromWishList: " . $e->getMessage());
            http_response_code(500);
            return json_encode(['error' => 'Erreur lors de la suppression de la wishlist']);
        }
    }
} 