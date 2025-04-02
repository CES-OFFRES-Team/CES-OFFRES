<?php
require_once __DIR__ . '/../models/Candidature.php';
require_once __DIR__ . '/../models/Personne.php';
require_once __DIR__ . '/../config/database.php';

class CandidatureController {
    private $db;
    private $candidature;
    private $personne;
    private $upload_directory;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->candidature = new Candidature($this->db);
        $this->personne = new Personne($this->db);
        $this->upload_directory = __DIR__ . '/../uploads/';

        // Créer le dossier uploads s'il n'existe pas
        if (!file_exists($this->upload_directory)) {
            mkdir($this->upload_directory, 0777, true);
        }
    }

    public function handleRequest($method, $id = null) {
        header("Access-Control-Allow-Origin: *");
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
        header("Access-Control-Max-Age: 3600");
        header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

        switch ($method) {
            case 'GET':
                if ($id) {
                    return $this->getCandidature($id);
                }
                return $this->getAllCandidatures();
            case 'POST':
                return $this->createCandidature();
            case 'PUT':
                if ($id) {
                    return $this->updateStatut($id);
                }
                http_response_code(400);
                return json_encode(['status' => 'error', 'message' => 'ID requis pour la mise à jour']);
            case 'DELETE':
                if ($id) {
                    return $this->deleteCandidature($id);
                }
                http_response_code(400);
                return json_encode(['status' => 'error', 'message' => 'ID requis pour la suppression']);
            default:
                http_response_code(405);
                return json_encode(['status' => 'error', 'message' => 'Méthode non autorisée']);
        }
    }

    private function createCandidature() {
        try {
            error_log("[DEBUG] Début de la création d'une candidature");
            
            // Vérifier si des fichiers ont été envoyés
            if (!isset($_FILES['cv'])) {
                throw new Exception("Le CV est requis");
            }

            // Valider les données du formulaire
            $data = [
                'id_personne' => $_POST['id_personne'] ?? null,
                'id_stage' => $_POST['id_stage'] ?? null
            ];

            error_log("[DEBUG] Données reçues - id_personne: " . var_export($data['id_personne'], true) . ", type: " . gettype($data['id_personne']));

            if (!$data['id_personne'] || !$data['id_stage']) {
                throw new Exception("ID personne et ID stage requis");
            }

            // Convertir explicitement en entier
            $data['id_personne'] = intval($data['id_personne']);
            error_log("[DEBUG] ID personne après conversion: " . var_export($data['id_personne'], true));

            // Vérifier si la personne existe
            $personne = $this->personne->getById($data['id_personne']);
            error_log("[DEBUG] Résultat getById: " . var_export($personne, true));
            
            if (!$personne) {
                throw new Exception("Personne non trouvée");
            }

            // Vérifier si une candidature existe déjà
            if ($this->candidature->candidatureExists($data['id_personne'], $data['id_stage'])) {
                throw new Exception("Vous avez déjà postulé à cette offre");
            }

            // Gérer le CV
            $cv_info = pathinfo($_FILES['cv']['name']);
            $cv_extension = strtolower($cv_info['extension']);
            if ($cv_extension !== 'pdf') {
                throw new Exception("Le CV doit être au format PDF");
            }

            $cv_filename = uniqid('cv_') . '.pdf';
            $cv_path = $this->upload_directory . $cv_filename;

            if (!move_uploaded_file($_FILES['cv']['tmp_name'], $cv_path)) {
                throw new Exception("Erreur lors de l'upload du CV");
            }

            // Gérer la lettre de motivation
            $lettre_path = null;
            if (isset($_POST['lettre_motivation']) && !empty($_POST['lettre_motivation'])) {
                $lettre_filename = uniqid('lettre_') . '.txt';
                $lettre_path = $this->upload_directory . $lettre_filename;
                file_put_contents($lettre_path, $_POST['lettre_motivation']);
            }

            // Préparer les données pour la création de la candidature
            $candidatureData = [
                'id_personne' => $data['id_personne'],
                'id_stage' => $data['id_stage'],
                'cv_path' => $cv_path,
                'lettre_path' => $lettre_path,
                'statut' => 'En attente'
            ];

            // Créer la candidature
            $id = $this->candidature->create($candidatureData);

            if ($id) {
                http_response_code(201);
                return json_encode([
                    'status' => 'success',
                    'message' => 'Candidature créée avec succès',
                    'data' => ['id' => $id]
                ]);
            }

            throw new Exception("Erreur lors de la création de la candidature");

        } catch (Exception $e) {
            error_log("[ERROR] Exception dans createCandidature: " . $e->getMessage());
            http_response_code(400);
            return json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }

    private function getCandidature($id) {
        try {
            $result = $this->candidature->getById($id);
            
            if ($result) {
                return json_encode([
                    'status' => 'success',
                    'data' => $result
                ]);
            }
            
            http_response_code(404);
            return json_encode([
                'status' => 'error',
                'message' => 'Candidature non trouvée'
            ]);
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans getCandidature: " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }

    private function getAllCandidatures() {
        try {
            error_log("[DEBUG] Début de getAllCandidatures");
            
            // Récupérer l'id_personne depuis les paramètres GET
            $id_personne = isset($_GET['id_personne']) ? $_GET['id_personne'] : null;
            error_log("[DEBUG] id_personne reçu: " . var_export($id_personne, true));
            
            if ($id_personne) {
                error_log("[DEBUG] Récupération des candidatures pour la personne ID: " . $id_personne);
                // Si un id_personne est fourni, récupérer uniquement ses candidatures
                $stmt = $this->candidature->getByPersonne($id_personne);
            } else {
                error_log("[DEBUG] Récupération de toutes les candidatures");
                // Sinon, récupérer toutes les candidatures
                $stmt = $this->candidature->getAll();
            }
            
            $num = $stmt->rowCount();
            error_log("[DEBUG] Nombre de candidatures trouvées: " . $num);
            
            if ($num > 0) {
                $candidatures_arr = [];
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    error_log("[DEBUG] Candidature trouvée: " . json_encode($row));
                    array_push($candidatures_arr, $row);
                }
                
                error_log("[DEBUG] Envoi de la réponse avec " . count($candidatures_arr) . " candidatures");
                return json_encode([
                    'status' => 'success',
                    'data' => $candidatures_arr
                ]);
            }
            
            error_log("[DEBUG] Aucune candidature trouvée");
            return json_encode([
                'status' => 'success',
                'data' => []
            ]);
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans getAllCandidatures: " . $e->getMessage());
            error_log("[ERROR] Trace complète: " . $e->getTraceAsString());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }

    private function updateStatut($id) {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!isset($data['statut'])) {
                throw new Exception("Le statut est requis");
            }
            
            if ($this->candidature->updateStatut($id, $data['statut'])) {
                return json_encode([
                    'status' => 'success',
                    'message' => 'Statut mis à jour avec succès'
                ]);
            }
            
            throw new Exception("Erreur lors de la mise à jour du statut");
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans updateStatut: " . $e->getMessage());
            http_response_code(400);
            return json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }

    private function deleteCandidature($id) {
        try {
            if ($this->candidature->delete($id)) {
                return json_encode([
                    'status' => 'success',
                    'message' => 'Candidature supprimée avec succès'
                ]);
            }
            
            throw new Exception("Erreur lors de la suppression de la candidature");
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans deleteCandidature: " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }
} 