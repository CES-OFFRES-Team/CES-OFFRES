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
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        // Récupérer l'URL complète
        $requestUri = $_SERVER['REQUEST_URI'];
        
        // Vérifier si l'URL contient /etudiants ou /pilotes
        $isEtudiantsEndpoint = strpos($requestUri, '/etudiants') !== false;
        $isPilotesEndpoint = strpos($requestUri, '/pilotes') !== false;
        $isLoginEndpoint = strpos($requestUri, '/login') !== false;

        // Vérifier si c'est une requête avec un ID
        if (preg_match('/\/users\/(\d+)/', $requestUri, $matches)) {
            $id = $matches[1];
            switch ($method) {
                case 'PUT':
                    return $this->updateUser($id);
                case 'DELETE':
                    return $this->deleteUser($id);
                default:
                    http_response_code(405);
                    return json_encode(['error' => 'Méthode non autorisée']);
            }
        }

        switch ($method) {
            case 'GET':
                if ($isEtudiantsEndpoint) {
                    return $this->getEtudiants();
                }
                if ($isPilotesEndpoint) {
                    return $this->getPilotes();
                }
                return $this->getUsers();
            case 'POST':
                if ($isLoginEndpoint) {
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
                'message' => 'Erreur lors de la récupération des personnes'
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
                error_log("[SUCCESS] Personne créée avec succès");
                http_response_code(201);
                return json_encode([
                    'status' => 'success',
                    'message' => 'Personne créée avec succès'
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
        try {
            // Récupérer et vérifier les données POST
            $data = json_decode(file_get_contents('php://input'), true);
            error_log('[DEBUG] Données reçues: ' . print_r($data, true));
            
            if (!isset($data['email']) || !isset($data['password'])) {
                error_log('[ERROR] Données manquantes');
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Email et mot de passe requis'
                ]);
            }

            $email = $data['email'];
            $password = $data['password'];

            // Rechercher l'utilisateur
            $user = $this->user->findByEmail($email);
            error_log('[DEBUG] Recherche utilisateur avec email: ' . $email);
            error_log('[DEBUG] Utilisateur trouvé: ' . ($user ? 'Oui' : 'Non'));

            if ($user && password_verify($password, $user['password_personne'])) {
                // Générer un nouveau token
                $token = bin2hex(random_bytes(32));
                error_log('[DEBUG] Nouveau token généré');
                
                // Sauvegarder le token
                if ($this->user->updateToken($user['id_personne'], $token)) {
                    error_log('[SUCCESS] Connexion réussie pour: ' . $email);
                    http_response_code(200);
                    return json_encode([
                        'status' => 'success',
                        'message' => 'Connexion réussie',
                        'token' => $token,
                        'user' => [
                            'id' => $user['id_personne'],
                            'nom' => $user['nom_personne'],
                            'prenom' => $user['prenom_personne'],
                            'email' => $user['email_personne'],
                            'role' => $user['role']
                        ]
                    ]);
                }
            }

            error_log('[ERROR] Échec de connexion pour: ' . $email);
            http_response_code(401);
            return json_encode([
                'status' => 'error',
                'message' => 'Email ou mot de passe incorrect'
            ]);

        } catch (Exception $e) {
            error_log('[ERROR] Exception lors de la connexion: ' . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur serveur lors de la connexion'
            ]);
        }
    }

    private function verifyToken() {
        try {
            // Récupérer le header Authorization
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? '';

            // Vérifier si le header commence par "Bearer "
            if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                http_response_code(401);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Token non fourni ou format invalide'
                ]);
            }

            $token = $matches[1];
            error_log("[DEBUG] Vérification du token: " . substr($token, 0, 10) . "...");

            // Vérifier si le token correspond à un utilisateur valide
            $user = $this->user->findByToken($token);
            
            if ($user) {
                error_log("[SUCCESS] Token valide pour l'utilisateur: " . $user['email_personne']);
                http_response_code(200);
                return json_encode([
                    'status' => 'success',
                    'message' => 'Token valide',
                    'user' => [
                        'id' => $user['id_personne'],
                        'email' => $user['email_personne'],
                        'nom' => $user['nom_personne'],
                        'prenom' => $user['prenom_personne'],
                        'role' => $user['role']
                    ]
                ]);
            }

            error_log("[ERROR] Token invalide ou expiré");
            http_response_code(401);
            return json_encode([
                'status' => 'error',
                'message' => 'Token invalide ou expiré'
            ]);

        } catch (Exception $e) {
            error_log("[ERROR] Erreur lors de la vérification du token: " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur lors de la vérification du token'
            ]);
        }
    }

    private function getEtudiants() {
        try {
            // Vérifier le token d'authentification
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? '';
            
            if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                http_response_code(401);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Token non fourni ou format invalide'
                ]);
            }

            $token = $matches[1];
            $user = $this->user->findByToken($token);

            if (!$user) {
                http_response_code(401);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Token invalide'
                ]);
            }

            // Vérifier si l'utilisateur est admin
            if ($user['role'] !== 'Admin') {
                http_response_code(403);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Accès non autorisé'
                ]);
            }

            $stmt = $this->user->getEtudiants();
            $etudiants = [];

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $etudiants[] = $row;
            }

            return json_encode([
                'status' => 'success',
                'data' => $etudiants
            ]);
        } catch (Exception $e) {
            error_log("[ERROR] Erreur lors de la récupération des étudiants: " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des étudiants'
            ]);
        }
    }

    private function getPilotes() {
        try {
            // Vérifier le token d'authentification
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? '';
            
            if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                http_response_code(401);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Token non fourni ou format invalide'
                ]);
            }

            $token = $matches[1];
            $user = $this->user->findByToken($token);

            if (!$user) {
                http_response_code(401);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Token invalide'
                ]);
            }

            // Vérifier si l'utilisateur est admin
            if ($user['role'] !== 'Admin') {
                http_response_code(403);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Accès non autorisé'
                ]);
            }

            $stmt = $this->user->getPilotes();
            $pilotes = [];

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $pilotes[] = $row;
            }

            return json_encode([
                'status' => 'success',
                'data' => $pilotes
            ]);
        } catch (Exception $e) {
            error_log("[ERROR] Erreur lors de la récupération des pilotes: " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des pilotes'
            ]);
        }
    }

    public function updateUser($id) {
        try {
            // Récupération des données du corps de la requête
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!$data) {
                error_log("[ERROR] Données JSON invalides reçues pour la mise à jour de l'utilisateur ID: " . $id);
                http_response_code(400);
                echo json_encode(["message" => "Données invalides"]);
                return;
            }

            // Validation des champs requis
            $requiredFields = ['nom_personne', 'prenom_personne', 'téléphone_personne', 'email_personne'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty(trim($data[$field]))) {
                    error_log("[ERROR] Champ manquant: " . $field . " pour l'utilisateur ID: " . $id);
                    http_response_code(400);
                    echo json_encode(["message" => "Le champ " . $field . " est requis"]);
                    return;
                }
            }

            // Validation de l'email
            if (!filter_var($data['email_personne'], FILTER_VALIDATE_EMAIL)) {
                error_log("[ERROR] Format d'email invalide pour l'utilisateur ID: " . $id);
                http_response_code(400);
                echo json_encode(["message" => "Format d'email invalide"]);
                return;
            }

            // Vérification si l'email existe déjà pour un autre utilisateur
            $existingUser = $this->user->findByEmail($data['email_personne']);
            if ($existingUser && $existingUser['id_personne'] != $id) {
                error_log("[ERROR] Email déjà utilisé pour l'utilisateur ID: " . $id);
                http_response_code(400);
                echo json_encode(["message" => "Cet email est déjà utilisé"]);
                return;
            }

            // Mise à jour de l'utilisateur
            if ($this->user->update($id, $data)) {
                error_log("[SUCCESS] Utilisateur ID: " . $id . " mis à jour avec succès");
                http_response_code(200);
                echo json_encode([
                    "message" => "Utilisateur mis à jour avec succès",
                    "user" => [
                        "id" => $id,
                        "nom" => $data['nom_personne'],
                        "prenom" => $data['prenom_personne'],
                        "telephone" => $data['téléphone_personne'],
                        "email" => $data['email_personne']
                    ]
                ]);
            } else {
                error_log("[ERROR] Échec de la mise à jour de l'utilisateur ID: " . $id);
                http_response_code(500);
                echo json_encode(["message" => "Erreur lors de la mise à jour de l'utilisateur"]);
            }

        } catch (Exception $e) {
            error_log("[ERROR] Exception lors de la mise à jour de l'utilisateur ID: " . $id . " - " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["message" => "Erreur serveur lors de la mise à jour"]);
        }
    }

    public function deleteUser($id) {
        try {
            // Vérifier le token d'authentification
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? '';
            
            if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                http_response_code(401);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Token non fourni ou format invalide'
                ]);
            }

            $token = $matches[1];
            $user = $this->user->findByToken($token);

            if (!$user) {
                http_response_code(401);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Token invalide'
                ]);
            }

            // Vérifier si l'utilisateur est admin
            if ($user['role'] !== 'Admin') {
                http_response_code(403);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Accès non autorisé'
                ]);
            }

            if ($this->user->delete($id)) {
                error_log("[SUCCESS] Utilisateur ID: " . $id . " supprimé avec succès");
                http_response_code(200);
                return json_encode([
                    'status' => 'success',
                    'message' => 'Utilisateur supprimé avec succès'
                ]);
            } else {
                error_log("[ERROR] Échec de la suppression de l'utilisateur ID: " . $id);
                http_response_code(500);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Erreur lors de la suppression de l\'utilisateur'
                ]);
            }
        } catch (Exception $e) {
            error_log("[ERROR] Exception lors de la suppression de l'utilisateur ID: " . $id . " - " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur serveur lors de la suppression'
            ]);
        }
    }

}