<?php
require_once __DIR__ . '/../models/Entreprise.php';
require_once __DIR__ . '/../config/database.php';

class EntrepriseController {
    private $db;
    private $entreprise;

    public function __construct() {
        error_log("[DEBUG] Initialisation du contrôleur Entreprise");
        $database = new Database();
        $this->db = $database->getConnection();
        $this->entreprise = new Entreprise($this->db);
    }

    public function handleRequest($method = null, $id = null) {
        error_log("[DEBUG] Début du traitement de la requête");
        header("Access-Control-Allow-Origin: *");
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Max-Age: 3600");
        header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

        if ($method === null) {
            $method = $_SERVER['REQUEST_METHOD'];
        }
        error_log("[DEBUG] Méthode HTTP: " . $method);

        switch($method) {
            case 'GET':
                if ($id !== null) {
                    $this->getEntreprise($id);
                } else {
                    $this->getEntreprises();
                }
                break;
            case 'POST':
                $this->createEntreprise();
                break;
            case 'PUT':
                if ($id !== null) {
                    $this->updateEntreprise($id);
                } else {
                    http_response_code(400);
                    echo json_encode(array("message" => "ID requis pour la mise à jour"));
                }
                break;
            case 'DELETE':
                if ($id !== null) {
                    $this->deleteEntreprise($id);
                } else {
                    http_response_code(400);
                    echo json_encode(array("message" => "ID requis pour la suppression"));
                }
                break;
            case 'OPTIONS':
                http_response_code(200);
                break;
            default:
                http_response_code(405);
                echo json_encode(array("message" => "Méthode non autorisée"));
                break;
        }
    }

    public function getEntreprises() {
        try {
            error_log("[DEBUG] Début de la récupération des entreprises");
            $stmt = $this->entreprise->getAll();
            $num = $stmt->rowCount();
            error_log("[DEBUG] Nombre d'entreprises trouvées: " . $num);

            if($num > 0) {
                $entreprises_arr = array();
                $entreprises_arr["records"] = array();

                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    $entreprise_item = array(
                        "id_entreprise" => $id_entreprise,
                        "nom_entreprise" => $nom_entreprise,
                        "adresse" => $adresse,
                        "email" => $email,
                        "téléphone" => $téléphone,
                        "moyenne_eval" => $moyenne_eval,
                        "description" => $description
                    );
                    array_push($entreprises_arr["records"], $entreprise_item);
                }
                error_log("[DEBUG] Données des entreprises: " . json_encode($entreprises_arr));
                http_response_code(200);
                echo json_encode($entreprises_arr);
            } else {
                error_log("[DEBUG] Aucune entreprise trouvée");
                http_response_code(404);
                echo json_encode(array("message" => "Aucune entreprise trouvée."));
            }
        } catch(Exception $e) {
            error_log("[ERROR] Exception dans getEntreprises: " . $e->getMessage());
            http_response_code(503);
            echo json_encode(array("message" => "Impossible de récupérer les entreprises."));
        }
    }

    private function createEntreprise() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                error_log("[ERROR] Données JSON invalides reçues");
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Format JSON invalide'
                ]);
            }

            // Vérification des champs requis
            $required_fields = ['nom_entreprise', 'adresse', 'email', 'téléphone'];
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
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                error_log("[ERROR] Format d'email invalide: " . $data['email']);
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Format d\'email invalide'
                ]);
            }

            // Nettoyage et assignation des données
            $this->entreprise->nom_entreprise = $data['nom_entreprise'];
            $this->entreprise->adresse = $data['adresse'];
            $this->entreprise->email = $data['email'];
            $this->entreprise->téléphone = $data['téléphone'];
            $this->entreprise->moyenne_eval = isset($data['moyenne_eval']) ? $data['moyenne_eval'] : 0;
            $this->entreprise->description = isset($data['description']) ? $data['description'] : '';

            if ($this->entreprise->create()) {
                error_log("[SUCCESS] Entreprise créée avec succès");
                http_response_code(201);
                return json_encode([
                    'status' => 'success',
                    'message' => 'Entreprise créée avec succès'
                ]);
            } else {
                error_log("[ERROR] Échec de la création dans la base de données");
                throw new Exception("Échec de l'insertion dans la base de données");
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

    public function updateEntreprise($id) {
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

            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                error_log("[ERROR] Données JSON invalides reçues pour la mise à jour de l'entreprise ID: " . $id);
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Données invalides'
                ]);
            }

            // Validation des champs requis
            $required_fields = ['nom_entreprise', 'adresse', 'email', 'téléphone'];
            foreach ($required_fields as $field) {
                if (!isset($data[$field]) || empty(trim($data[$field]))) {
                    error_log("[ERROR] Champ manquant: " . $field . " pour l'entreprise ID: " . $id);
                    http_response_code(400);
                    return json_encode([
                        'status' => 'error',
                        'message' => 'Le champ ' . $field . ' est requis'
                    ]);
                }
            }

            // Validation de l'email
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                error_log("[ERROR] Format d'email invalide pour l'entreprise ID: " . $id);
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Format d\'email invalide'
                ]);
            }

            if ($this->entreprise->update($id, $data)) {
                error_log("[SUCCESS] Entreprise ID: " . $id . " mise à jour avec succès");
                http_response_code(200);
                return json_encode([
                    'status' => 'success',
                    'message' => 'Entreprise mise à jour avec succès'
                ]);
            } else {
                error_log("[ERROR] Échec de la mise à jour de l'entreprise ID: " . $id);
                http_response_code(500);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Erreur lors de la mise à jour de l\'entreprise'
                ]);
            }
        } catch (Exception $e) {
            error_log("[ERROR] Exception lors de la mise à jour de l'entreprise ID: " . $id . " - " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur serveur lors de la mise à jour'
            ]);
        }
    }

    public function deleteEntreprise($id) {
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

            if ($this->entreprise->delete($id)) {
                error_log("[SUCCESS] Entreprise ID: " . $id . " supprimée avec succès");
                http_response_code(200);
                return json_encode([
                    'status' => 'success',
                    'message' => 'Entreprise supprimée avec succès'
                ]);
            } else {
                error_log("[ERROR] Échec de la suppression de l'entreprise ID: " . $id);
                http_response_code(500);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Erreur lors de la suppression de l\'entreprise'
                ]);
            }
        } catch (Exception $e) {
            error_log("[ERROR] Exception lors de la suppression de l'entreprise ID: " . $id . " - " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur serveur lors de la suppression'
            ]);
        }
    }
} 