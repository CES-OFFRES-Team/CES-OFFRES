<?php
require_once __DIR__ . '/../models/Candidature.php';
require_once __DIR__ . '/../config/database.php';

class CandidatureController {
    private $db;
    private $candidature;
    private $upload_directory;

    public function __construct() {
        try {
            $database = new Database();
            $this->db = $database->getConnection();
            if (!$this->db) {
                throw new Exception("Erreur de connexion à la base de données");
            }
            $this->candidature = new Candidature($this->db);
            $this->upload_directory = dirname(__DIR__) . '/uploads/';
            
            // Créer les dossiers nécessaires
            if (!file_exists($this->upload_directory . 'cv')) {
                mkdir($this->upload_directory . 'cv', 0777, true);
            }
            if (!file_exists($this->upload_directory . 'lettres')) {
                mkdir($this->upload_directory . 'lettres', 0777, true);
            }
        } catch (Exception $e) {
            error_log("[ERROR] Erreur dans le constructeur: " . $e->getMessage());
            throw $e;
        }
    }

    public function handleRequest($method, $id = null) {
        try {
            switch ($method) {
                case 'POST':
                    return $this->createCandidature();
                case 'GET':
                    if ($id) {
                        return $this->getCandidature($id);
                    }
                    return $this->getAllCandidatures();
                default:
                    http_response_code(405);
                    return json_encode(['status' => 'error', 'message' => 'Méthode non autorisée']);
            }
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans handleRequest: " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur serveur interne: ' . $e->getMessage()
            ]);
        }
    }

    private function createCandidature() {
        try {
            // Vérifier si des fichiers ont été envoyés
            if (!isset($_FILES['cv'])) {
                throw new Exception("Le CV est requis");
            }

            // Vérifier les données requises
            if (!isset($_POST['id_personne']) || !isset($_POST['id_stage'])) {
                throw new Exception("ID personne et ID stage requis");
            }

            // Vérifier si une candidature existe déjà
            if ($this->candidature->candidatureExists($_POST['id_personne'], $_POST['id_stage'])) {
                throw new Exception("Vous avez déjà postulé à cette offre");
            }

            // Gérer le CV
            $cv_info = pathinfo($_FILES['cv']['name']);
            $cv_extension = strtolower($cv_info['extension']);
            
            if ($cv_extension !== 'pdf') {
                throw new Exception("Le CV doit être au format PDF");
            }

            $cv_filename = uniqid('cv_') . '.pdf';
            $cv_path = $this->upload_directory . 'cv/' . $cv_filename;
            
            if (!move_uploaded_file($_FILES['cv']['tmp_name'], $cv_path)) {
                throw new Exception("Erreur lors de l'upload du CV");
            }

            // Gérer la lettre de motivation
            $lettre_path = null;
            if (isset($_POST['lettre_motivation']) && !empty($_POST['lettre_motivation'])) {
                $lettre_filename = uniqid('lettre_') . '.txt';
                $lettre_path = $this->upload_directory . 'lettres/' . $lettre_filename;
                if (!file_put_contents($lettre_path, $_POST['lettre_motivation'])) {
                    throw new Exception("Erreur lors de l'enregistrement de la lettre de motivation");
                }
            }

            // Créer la candidature
            $candidatureData = [
                'id_personne' => $_POST['id_personne'],
                'id_stage' => $_POST['id_stage'],
                'cv_path' => $cv_path,
                'lettre_path' => $lettre_path,
                'statut' => 'En attente'
            ];

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
            $candidature = $this->candidature->read($id);
            if ($candidature) {
                return json_encode([
                    'status' => 'success',
                    'data' => $candidature
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
                'message' => 'Erreur lors de la récupération de la candidature'
            ]);
        }
    }

    private function getAllCandidatures() {
        try {
            $candidatures = $this->candidature->readAll();
            return json_encode([
                'status' => 'success',
                'data' => $candidatures
            ]);
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans getAllCandidatures: " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des candidatures'
            ]);
        }
    }
} 