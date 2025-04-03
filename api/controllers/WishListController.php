<?php

require_once __DIR__ . '/../models/WishList.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/JWTUtils.php';

class WishListController {
    private $wishListModel;
    private $db;
    private $jwtUtils;
    private $logFile;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->wishListModel = new WishList($this->db);
        $this->jwtUtils = new JWTUtils();
        $this->logFile = __DIR__ . '/../logs/wishlist.log';
        
        // Créer le dossier logs s'il n'existe pas
        if (!file_exists(__DIR__ . '/../logs')) {
            mkdir(__DIR__ . '/../logs', 0777, true);
        }
    }

    private function log($message, $type = 'INFO') {
        $date = date('Y-m-d H:i:s');
        $logMessage = "[$date][$type] $message" . PHP_EOL;
        file_put_contents($this->logFile, $logMessage, FILE_APPEND);
    }

    private function getAuthenticatedUser($token) {
        try {
            $this->log("Tentative de vérification du token: " . substr($token, 0, 20) . "...");
            
            $payload = $this->jwtUtils->verifyToken($token);
            if (!$payload || !isset($payload->id_personne)) {
                $this->log("Token invalide ou ID utilisateur manquant", "ERROR");
                throw new Exception("Token invalide ou ID utilisateur manquant");
            }
            
            $this->log("Utilisateur authentifié avec succès. ID: " . $payload->id_personne);
            return $payload->id_personne;
        } catch (Exception $e) {
            $this->log("Erreur d'authentification: " . $e->getMessage(), "ERROR");
            throw new Exception("Erreur d'authentification");
        }
    }

    public function handleRequest($method, $action = null, $id = null) {
        $this->log("Nouvelle requête reçue - Méthode: $method, Action: $action, ID: $id");
        
        header("Access-Control-Allow-Origin: *");
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
        header("Access-Control-Max-Age: 3600");
        header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

        if ($method === 'OPTIONS') {
            $this->log("Requête OPTIONS reçue - Réponse 200");
            http_response_code(200);
            return;
        }

        // Récupérer le token du header Authorization
        $headers = apache_request_headers();
        $token = null;

        if (isset($headers['Authorization'])) {
            $token = str_replace('Bearer ', '', $headers['Authorization']);
            $this->log("Token trouvé dans les headers");
        } else {
            $this->log("Aucun token trouvé dans les headers", "WARNING");
        }

        if (!$token) {
            $this->log("Tentative d'accès sans token", "WARNING");
            http_response_code(401);
            echo json_encode(['error' => 'Token d\'authentification manquant']);
            return;
        }

        try {
            $userId = $this->getAuthenticatedUser($token);

            switch ($action) {
                case 'list':
                    $this->log("Demande de liste des stages pour l'utilisateur $userId");
                    return $this->getWishList($userId);
                case 'add':
                    $this->log("Tentative d'ajout d'un stage pour l'utilisateur $userId");
                    return $this->addToWishList($userId);
                case 'remove':
                    if ($id) {
                        $this->log("Tentative de suppression du stage $id pour l'utilisateur $userId");
                        return $this->removeFromWishList($userId, $id);
                    }
                    $this->log("Tentative de suppression sans ID de stage", "WARNING");
                    http_response_code(400);
                    return json_encode(['error' => 'ID du stage manquant']);
                default:
                    $this->log("Action non reconnue: $action", "WARNING");
                    http_response_code(404);
                    return json_encode(['error' => 'Action non trouvée']);
            }
        } catch (Exception $e) {
            if ($e->getMessage() === "Erreur d'authentification") {
                $this->log("Erreur d'authentification détectée", "ERROR");
                http_response_code(401);
                return json_encode(['error' => 'Token invalide ou expiré']);
            }
            $this->log("Erreur inattendue: " . $e->getMessage(), "ERROR");
            http_response_code(500);
            return json_encode(['error' => 'Une erreur est survenue']);
        }
    }

    private function getWishList($userId) {
        try {
            $this->log("Récupération de la wishlist pour l'utilisateur $userId");
            
            $stages = $this->wishListModel->getWishList($userId);
            
            if ($stages === false) {
                $this->log("Échec de la récupération de la wishlist", "ERROR");
                throw new Exception("Erreur lors de la récupération de la wishlist");
            }

            $this->log("Wishlist récupérée avec succès - " . count($stages) . " stages trouvés");
            return json_encode([
                'status' => 'success',
                'stages' => $stages
            ]);

        } catch (Exception $e) {
            $this->log("Erreur getWishList: " . $e->getMessage(), "ERROR");
            http_response_code(500);
            return json_encode(['error' => 'Erreur lors de la récupération de la wishlist']);
        }
    }

    private function addToWishList($userId) {
        try {
            $data = json_decode(file_get_contents("php://input"));
            $this->log("Tentative d'ajout du stage à la wishlist - UserID: $userId, Data reçue: " . json_encode($data));

            if (!isset($data->idStage)) {
                $this->log("Tentative d'ajout sans ID de stage", "WARNING");
                http_response_code(400);
                return json_encode(['error' => 'ID du stage manquant']);
            }

            if ($this->wishListModel->isInWishList($userId, $data->idStage)) {
                $this->log("Stage déjà présent dans la wishlist - UserID: $userId, StageID: $data->idStage", "WARNING");
                http_response_code(400);
                return json_encode(['error' => 'Stage déjà dans la wishlist']);
            }

            if ($this->wishListModel->addToWishList($userId, $data->idStage)) {
                $this->log("Stage ajouté avec succès - UserID: $userId, StageID: $data->idStage");
                http_response_code(201);
                return json_encode(['message' => 'Stage ajouté avec succès']);
            } else {
                throw new Exception("Échec de l'ajout du stage");
            }

        } catch (Exception $e) {
            $this->log("Erreur addToWishList: " . $e->getMessage(), "ERROR");
            http_response_code(500);
            return json_encode(['error' => 'Erreur lors de l\'ajout à la wishlist']);
        }
    }

    private function removeFromWishList($userId, $idStage) {
        try {
            $this->log("Tentative de suppression - UserID: $userId, StageID: $idStage");

            if ($this->wishListModel->removeFromWishList($userId, $idStage)) {
                $this->log("Stage supprimé avec succès - UserID: $userId, StageID: $idStage");
                return json_encode(['message' => 'Stage retiré avec succès']);
            } else {
                throw new Exception("Échec de la suppression du stage");
            }

        } catch (Exception $e) {
            $this->log("Erreur removeFromWishList: " . $e->getMessage(), "ERROR");
            http_response_code(500);
            return json_encode(['error' => 'Erreur lors de la suppression de la wishlist']);
        }
    }
} 