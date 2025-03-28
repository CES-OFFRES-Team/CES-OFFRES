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
                'message' => 'Erreur lors de la récupération des utlisateurs'
            ]);
        }
    }

    private function createUser() {
    try {
        $rawData = file_get_contents('php://input');
        error_log("[DEBUG] Données reçues brutes: " . $rawData);
        
        $data = json_decode($rawData, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("[ERROR] Erreur JSON: " . json_last_error_msg());
            http_response_code(400);
            return json_encode([
                'status' => 'error',
                'message' => 'Format JSON invalide'
            ]);
        }
        
        error_log("[DEBUG] Données décodées: " . print_r($data, true));

        // Vérification des champs requis
        $required_fields = ['nom_personne', 'prenom_personne', 'téléphone_personne', 'email_personne', 'password_personne'];
        $missing_fields = [];
        
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                $missing_fields[] = $field;
            }
        }

        if (!empty($missing_fields)) {
            error_log("[ERROR] Champs manquants: " . implode(', ', $missing_fields));
            http_response_code(400);
            return json_encode([
                'status' => 'error',
                'message' => 'Champs obligatoires manquants: ' . implode(', ', $missing_fields)
            ]);
        }

        // Vérification du format de l'email
        if (!filter_var($data['email_personne'], FILTER_VALIDATE_EMAIL)) {
            error_log("[ERROR] Format d'email invalide: " . $data['email_personne']);
            http_response_code(400);
            return json_encode([
                'status' => 'error',
                'message' => 'Format d\'email invalide'
            ]);
        }

        // Vérification si l'email existe déjà
        $this->user->email_personne = $data['email_personne'];
        if ($this->user->emailExists()) {
            error_log("[ERROR] Email déjà utilisé: " . $data['email_personne']);
            http_response_code(409);
            return json_encode([
                'status' => 'error',
                'message' => 'Cet email est déjà utilisé'
            ]);
        }

        // Nettoyage et assignation des données
        try {
            $this->user->nom_personne = htmlspecialchars(strip_tags(trim($data['nom_personne'])));
            $this->user->prenom_personne = htmlspecialchars(strip_tags(trim($data['prenom_personne'])));
            $this->user->téléphone_personne = htmlspecialchars(strip_tags(trim($data['téléphone_personne'])));
            $this->user->email_personne = htmlspecialchars(strip_tags(trim($data['email_personne'])));
            $this->user->password_personne = password_hash($data['password_personne'], PASSWORD_DEFAULT);
            $this->user->role = isset($data['role']) ? htmlspecialchars(strip_tags(trim($data['role']))) : 'user';

            error_log("[DEBUG] Données nettoyées: " . print_r([
                'nom' => $this->user->nom_personne,
                'prenom' => $this->user->prenom_personne,
                'email' => $this->user->email_personne,
                'telephone' => $this->user->téléphone_personne,
                'role' => $this->user->role
            ], true));

            if ($this->user->create()) {
                error_log("[SUCCESS] Utilisateur créé avec succès");
                http_response_code(201);
                return json_encode([
                    'status' => 'success',
                    'message' => 'Utilisateur créé avec succès'
                ]);
            } else {
                error_log("[ERROR] Échec de la création dans la base de données");
                throw new Exception("Échec de l'insertion dans la base de données");
            }
        } catch (PDOException $e) {
            error_log("[ERROR] Erreur PDO: " . $e->getMessage());
            throw $e;
        }
    } catch (Exception $e) {
        error_log("[ERROR] Exception: " . $e->getMessage());
        error_log("[ERROR] Trace: " . $e->getTraceAsString());
        http_response_code(500);
        return json_encode([
            'status' => 'error',
            'message' => 'Erreur serveur: ' . $e->getMessage()
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