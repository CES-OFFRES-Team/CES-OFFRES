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
                if ($_SERVER['REQUEST_URI'] === '/api/login') {
                    return $this->login();
                }
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
                //unset($row['password']);
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

        if (!$data || !isset($data['nom_personne']) || !isset($data['prenom_personne']) || !isset($data['téléphone_personne']) || !isset($data['email_personne']) || !isset($data['password_personne']) || !isset($data['role'])) {
            http_response_code(400);
            return json_encode([
                'status' => 'error',
                'message' => 'Données manquantes'
            ]);
        }

        $this->user->nom_personne = htmlspecialchars(strip_tags($data['nom_personne']));
        $this->user->prenom_personne = htmlspecialchars(strip_tags($data['prenom_personne']));
        $this->user->téléphone_personne = htmlspecialchars(strip_tags($data['téléphone_personne']));
        $this->user->email_personne = htmlspecialchars(strip_tags($data['email_personne']));
        $this->user->password_personne = password_hash($data['password_personne'], PASSWORD_DEFAULT);
        $this->user->role = htmlspecialchars(strip_tags($data['role']));

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


    private function login() {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        return json_encode(['error' => 'Email et mot de passe requis']);
    }

    $user = $this->user->findByEmail($email);
    error_log('Email: ' . $email);
    error_log('Password: ' . $password);
    error_log('User: ' . print_r($user, true));

    if ($user && password_verify($password, $user['password'])) {
        $token = bin2hex(random_bytes(16)); // Générer un jeton d'authentification
        // Enregistrer le jeton dans la base de données ou le retourner directement
        return json_encode(['token' => $token]);
    } else {
        http_response_code(401);
        return json_encode(['error' => 'Email ou mot de passe incorrect']);
    }
}

}