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
        try {
            $database = new Database();
            $this->db = $database->getConnection();
            if (!$this->db) {
                throw new Exception("Erreur de connexion à la base de données");
            }
            $this->candidature = new Candidature($this->db);
            $this->personne = new Personne($this->db);
            $this->upload_directory = dirname(__DIR__) . '/uploads/';
            error_log("[DEBUG] Chemin du dossier d'upload: " . $this->upload_directory);
            
            $this->createUploadDirectories();
        } catch (Exception $e) {
            error_log("[ERROR] Erreur dans le constructeur: " . $e->getMessage());
            throw $e;
        }
    }

    private function createUploadDirectories() {
        $directories = [
            $this->upload_directory,
            $this->upload_directory . 'cv/',
            $this->upload_directory . 'lettres/'
        ];

        foreach ($directories as $dir) {
            error_log("[DEBUG] Vérification du dossier: " . $dir);
            
            // Créer le dossier s'il n'existe pas
            if (!file_exists($dir)) {
                error_log("[DEBUG] Création du dossier: " . $dir);
                if (!mkdir($dir, 0777, true)) {
                    error_log("[ERROR] Impossible de créer le dossier: " . $dir);
                    error_log("[ERROR] Dernière erreur PHP: " . error_get_last()['message']);
                    throw new Exception("Impossible de créer le dossier d'upload: " . $dir);
                }
            }
            
            // Vérifier et corriger les permissions
            if (!is_writable($dir)) {
                error_log("[DEBUG] Tentative de correction des permissions pour: " . $dir);
                // Essayer de changer les permissions
                if (!chmod($dir, 0777)) {
                    error_log("[ERROR] Impossible de modifier les permissions du dossier: " . $dir);
                    error_log("[ERROR] Dernière erreur PHP: " . error_get_last()['message']);
                    // Si on ne peut pas changer les permissions, essayer de créer un nouveau dossier
                    $temp_dir = $dir . '_temp';
                    if (mkdir($temp_dir, 0777, true)) {
                        error_log("[DEBUG] Création d'un nouveau dossier avec les bonnes permissions: " . $temp_dir);
                        // Supprimer l'ancien dossier
                        if (file_exists($dir)) {
                            rmdir($dir);
                        }
                        // Renommer le nouveau dossier
                        rename($temp_dir, $dir);
                    } else {
                        throw new Exception("Impossible de configurer le dossier d'upload: " . $dir);
                    }
                }
            }
            
            // Vérifier l'état final du dossier
            error_log("[DEBUG] État final du dossier " . $dir . ":");
            error_log("[DEBUG] - Existe: " . (file_exists($dir) ? 'Oui' : 'Non'));
            error_log("[DEBUG] - Est un dossier: " . (is_dir($dir) ? 'Oui' : 'Non'));
            error_log("[DEBUG] - Permissions: " . substr(sprintf('%o', fileperms($dir)), -4));
            error_log("[DEBUG] - Accessible en écriture: " . (is_writable($dir) ? 'Oui' : 'Non'));
            
            // Vérifier que le dossier est bien accessible
            if (!is_writable($dir)) {
                throw new Exception("Le dossier d'upload n'est pas accessible en écriture: " . $dir);
            }
        }
    }

    public function handleRequest($method, $id = null) {
        try {
            error_log("[DEBUG] Début du traitement de la requête");
            error_log("[DEBUG] Méthode: " . $method);
            error_log("[DEBUG] ID: " . ($id ?? 'null'));
            error_log("[DEBUG] POST: " . print_r($_POST, true));
            error_log("[DEBUG] FILES: " . print_r($_FILES, true));

            // Récupérer l'origine de la requête
            $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
            
            // Définir les en-têtes CORS
            header("Access-Control-Allow-Origin: $origin");
            header("Content-Type: application/json; charset=UTF-8");
            header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
            header("Access-Control-Max-Age: 3600");
            header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
            header("Access-Control-Allow-Credentials: true");

            // Gérer la requête OPTIONS pour CORS
            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                http_response_code(200);
                exit();
            }

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
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans handleRequest: " . $e->getMessage());
            error_log("[ERROR] Trace: " . $e->getTraceAsString());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur serveur interne: ' . $e->getMessage(),
                'debug_info' => [
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]
            ]);
        }
    }

    private function createCandidature() {
        $logs = [];
        try {
            $logs[] = "[DEBUG] Début de la création d'une candidature";
            $logs[] = "[DEBUG] Contenu de \$_FILES: " . print_r($_FILES, true);
            $logs[] = "[DEBUG] Contenu de \$_POST: " . print_r($_POST, true);
            
            // Vérifier si des fichiers ont été envoyés
            if (!isset($_FILES['cv'])) {
                throw new Exception("Le CV est requis");
            }

            // Valider les données du formulaire
            $data = [
                'id_personne' => $_POST['id_personne'] ?? null,
                'id_stage' => $_POST['id_stage'] ?? null
            ];

            $logs[] = "[DEBUG] Données reçues: " . print_r($data, true);

            if (!$data['id_personne'] || !$data['id_stage']) {
                throw new Exception("ID personne et ID stage requis");
            }

            // Vérifier si une candidature existe déjà
            if ($this->candidature->candidatureExists($data['id_personne'], $data['id_stage'])) {
                throw new Exception("Vous avez déjà postulé à cette offre");
            }

            // Gérer le CV
            $cv_info = pathinfo($_FILES['cv']['name']);
            $cv_extension = strtolower($cv_info['extension']);
            $logs[] = "[DEBUG] Extension du fichier CV: " . $cv_extension;
            
            if ($cv_extension !== 'pdf') {
                throw new Exception("Le CV doit être au format PDF");
            }

            $cv_filename = uniqid('cv_') . '.pdf';
            $cv_path = $this->upload_directory . 'cv/' . $cv_filename;
            
            $logs[] = "[DEBUG] Chemin du dossier d'upload CV: " . $this->upload_directory . 'cv/';
            $logs[] = "[DEBUG] Chemin complet du fichier: " . $cv_path;
            $logs[] = "[DEBUG] Le dossier existe: " . (file_exists($this->upload_directory . 'cv/') ? 'Oui' : 'Non');
            $logs[] = "[DEBUG] Le dossier est accessible en écriture: " . (is_writable($this->upload_directory . 'cv/') ? 'Oui' : 'Non');
            $logs[] = "[DEBUG] Le fichier temporaire existe: " . (file_exists($_FILES['cv']['tmp_name']) ? 'Oui' : 'Non');
            $logs[] = "[DEBUG] Taille du fichier temporaire: " . filesize($_FILES['cv']['tmp_name']);

            if (!move_uploaded_file($_FILES['cv']['tmp_name'], $cv_path)) {
                $logs[] = "[ERROR] Échec de l'upload du fichier";
                $logs[] = "[ERROR] Erreur de upload: " . error_get_last()['message'];
                $logs[] = "[ERROR] Dernière erreur PHP: " . print_r(error_get_last(), true);
                throw new Exception("Erreur lors de l'upload du CV");
            }

            $logs[] = "[DEBUG] CV uploadé avec succès à: " . $cv_path;
            $logs[] = "[DEBUG] Taille du fichier uploadé: " . filesize($cv_path);

            // Gérer la lettre de motivation
            $lettre_path = null;
            if (isset($_POST['lettre_motivation']) && !empty($_POST['lettre_motivation'])) {
                $lettre_filename = uniqid('lettre_') . '.txt';
                $lettre_path = $this->upload_directory . 'lettres/' . $lettre_filename;
                if (!file_put_contents($lettre_path, $_POST['lettre_motivation'])) {
                    $logs[] = "[ERROR] Échec de l'écriture de la lettre de motivation";
                    $logs[] = "[ERROR] Dernière erreur PHP: " . error_get_last()['message'];
                }
            }

            // Préparer les données pour la création de la candidature
            $candidatureData = [
                'id_personne' => $data['id_personne'],
                'id_stage' => $data['id_stage'],
                'cv_path' => $cv_path,
                'lettre_path' => $lettre_path,
                'statut' => 'En attente'
            ];

            $logs[] = "[DEBUG] Données de la candidature: " . print_r($candidatureData, true);

            // Créer la candidature
            $id = $this->candidature->create($candidatureData);

            if ($id) {
                http_response_code(201);
                return json_encode([
                    'status' => 'success',
                    'message' => 'Candidature créée avec succès',
                    'data' => ['id' => $id],
                    'logs' => $logs
                ]);
            }

            throw new Exception("Erreur lors de la création de la candidature");

        } catch (Exception $e) {
            $logs[] = "[ERROR] Exception dans createCandidature: " . $e->getMessage();
            $logs[] = "[ERROR] Trace complète: " . $e->getTraceAsString();
            http_response_code(400);
            return json_encode([
                'status' => 'error',
                'message' => $e->getMessage(),
                'logs' => $logs,
                'debug_info' => [
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]
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