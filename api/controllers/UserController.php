<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../config/database.php';

class UserController {
    private $db;
    private $user;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->user = new User($this->db);
    }

    public function handleRequest($method) {
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');

        switch ($method) {
            case 'GET':
                return $this->getUsers();
            case 'POST':
                return $this->createUser();
            case 'OPTIONS':
                http_response_code(200);
                return json_encode(['status' => 'success']);
            default:
                http_response_code(405);
                return json_encode(['error' => 'Méthode non autorisée']);
        }
    }

    private function getUsers() {
        try {
            $stmt = $this->user->getAll();
            $users = [];

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // On ne renvoie pas le mot de passe
                unset($row['password']);
                $users[] = $row;
            }

            return json_encode([
                'status' => 'success',
                'data' => $users
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des utilisateurs'
            ]);
        }
    }

    private function createUser() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data || !isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Données manquantes'
                ]);
            }

            $this->user->name = htmlspecialchars(strip_tags($data['name']));
            $this->user->email = htmlspecialchars(strip_tags($data['email']));
            $this->user->password = password_hash($data['password'], PASSWORD_DEFAULT);

            if ($this->user->create()) {
                http_response_code(201);
                return json_encode([
                    'status' => 'success',
                    'message' => 'Utilisateur créé avec succès'
                ]);
            }

            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur lors de la création de l\'utilisateur'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur serveur'
            ]);
        }
    }
} 