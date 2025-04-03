<?php

require_once __DIR__ . '/../models/WishList.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

class WishListController {
    private $wishListModel;
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->wishListModel = new WishList($this->db);
    }

    private function getAuthorizationHeader() {
        $headers = null;
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }
        return $headers;
    }

    private function getBearerToken() {
        $headers = $this->getAuthorizationHeader();
        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    private function validateToken() {
        $token = $this->getBearerToken();
        if (!$token) {
            return null;
        }

        try {
            $jwt = \Firebase\JWT\JWT::decode($token, JWT_SECRET, array('HS256'));
            return (array) $jwt;
        } catch (Exception $e) {
            error_log("Erreur de validation du token: " . $e->getMessage());
            return null;
        }
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
            // Valider le token et récupérer les données utilisateur
            $userData = $this->validateToken();
            if (!$userData) {
                http_response_code(401);
                return json_encode(['error' => 'Non authentifié']);
            }

            error_log("Action demandée: " . $action);
            error_log("Données utilisateur: " . print_r($userData, true));

            switch ($action) {
                case 'getWishList':
                    return $this->getWishList($userData['id']);
                case 'addToWishList':
                    return $this->addToWishList($userData['id']);
                case 'removeFromWishList':
                    return $this->removeFromWishList($userData['id'], $id);
                case 'checkWishListStatus':
                    return $this->checkWishListStatus($userData['id'], $id);
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

    private function getWishList($userId) {
        try {
            error_log("Récupération de la wishlist pour l'utilisateur: " . $userId);
            
            $wishList = $this->wishListModel->getWishList($userId);
            $count = $this->wishListModel->getWishListCount($userId);

            error_log("Nombre d'éléments trouvés: " . $count);

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

    private function addToWishList($userId) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            if (!isset($data['idStage'])) {
                http_response_code(400);
                return json_encode(['error' => 'ID du stage requis']);
            }

            if ($this->wishListModel->isInWishList($userId, $data['idStage'])) {
                http_response_code(400);
                return json_encode(['error' => 'Ce stage est déjà dans votre wishlist']);
            }

            $this->wishListModel->addToWishList($userId, $data['idStage']);
            http_response_code(201);
            return json_encode(['message' => 'Stage ajouté à la wishlist avec succès']);
        } catch (Exception $e) {
            error_log("Erreur dans addToWishList: " . $e->getMessage());
            http_response_code(500);
            return json_encode(['error' => 'Erreur lors de l\'ajout à la wishlist']);
        }
    }

    private function removeFromWishList($userId, $idStage) {
        try {
            if (!$idStage) {
                http_response_code(400);
                return json_encode(['error' => 'ID du stage requis']);
            }

            $this->wishListModel->removeFromWishList($userId, $idStage);
            return json_encode(['message' => 'Stage retiré de la wishlist avec succès']);
        } catch (Exception $e) {
            error_log("Erreur dans removeFromWishList: " . $e->getMessage());
            http_response_code(500);
            return json_encode(['error' => 'Erreur lors de la suppression de la wishlist']);
        }
    }

    private function checkWishListStatus($userId, $idStage) {
        try {
            if (!$idStage) {
                http_response_code(400);
                return json_encode(['error' => 'ID du stage requis']);
            }

            $isInWishList = $this->wishListModel->isInWishList($userId, $idStage);
            return json_encode(['isInWishList' => $isInWishList]);
        } catch (Exception $e) {
            error_log("Erreur dans checkWishListStatus: " . $e->getMessage());
            http_response_code(500);
            return json_encode(['error' => 'Erreur lors de la vérification du statut de la wishlist']);
        }
    }
} 