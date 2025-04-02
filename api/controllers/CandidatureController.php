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
            
            // Définir le chemin d'upload
            $this->upload_directory = dirname(__DIR__) . '/uploads/';
            error_log("[DEBUG] Chemin du dossier d'upload: " . $this->upload_directory);
            
            // Créer les dossiers nécessaires
            if (!file_exists($this->upload_directory)) {
                mkdir($this->upload_directory, 0777, true);
                error_log("[DEBUG] Dossier uploads créé");
            }
            
            if (!file_exists($this->upload_directory . 'cv')) {
                mkdir($this->upload_directory . 'cv', 0777, true);
                error_log("[DEBUG] Dossier cv créé");
            }
            
            if (!file_exists($this->upload_directory . 'lettres')) {
                mkdir($this->upload_directory . 'lettres', 0777, true);
                error_log("[DEBUG] Dossier lettres créé");
            }

            // Vérifier les permissions
            if (!is_writable($this->upload_directory)) {
                error_log("[ERROR] Le dossier uploads n'est pas accessible en écriture");
                throw new Exception("Le dossier d'upload n'est pas accessible en écriture");
            }
            
            if (!is_writable($this->upload_directory . 'cv')) {
                error_log("[ERROR] Le dossier cv n'est pas accessible en écriture");
                throw new Exception("Le dossier cv n'est pas accessible en écriture");
            }
            
            if (!is_writable($this->upload_directory . 'lettres')) {
                error_log("[ERROR] Le dossier lettres n'est pas accessible en écriture");
                throw new Exception("Le dossier lettres n'est pas accessible en écriture");
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
            error_log("[DEBUG] Début de la création d'une candidature");
            error_log("[DEBUG] FILES reçus: " . print_r($_FILES, true));
            error_log("[DEBUG] POST reçus: " . print_r($_POST, true));

            // Vérifier si des fichiers ont été envoyés
            if (!isset($_FILES['cv'])) {
                error_log("[ERROR] Aucun fichier CV reçu");
                throw new Exception("Le CV est requis");
            }

            // Vérifier les données requises
            if (!isset($_POST['id_personne']) || !isset($_POST['id_stage'])) {
                error_log("[ERROR] Données manquantes: id_personne ou id_stage");
                throw new Exception("ID personne et ID stage requis");
            }

            // Vérifier si une candidature existe déjà
            if ($this->candidature->candidatureExists($_POST['id_personne'], $_POST['id_stage'])) {
                error_log("[ERROR] Candidature déjà existante");
                throw new Exception("Vous avez déjà postulé à cette offre");
            }

            // Gérer le CV
            $cv_info = pathinfo($_FILES['cv']['name']);
            $cv_extension = strtolower($cv_info['extension']);
            error_log("[DEBUG] Extension du fichier CV: " . $cv_extension);
            
            if ($cv_extension !== 'pdf') {
                error_log("[ERROR] Format de fichier non autorisé: " . $cv_extension);
                throw new Exception("Le CV doit être au format PDF");
            }

            $cv_filename = uniqid('cv_') . '.pdf';
            $cv_path = $this->upload_directory . 'cv/' . $cv_filename;
            error_log("[DEBUG] Chemin complet du fichier CV: " . $cv_path);
            
            // Vérifier si le fichier temporaire existe
            if (!file_exists($_FILES['cv']['tmp_name'])) {
                error_log("[ERROR] Fichier temporaire non trouvé");
                throw new Exception("Erreur lors de l'upload du CV: fichier temporaire non trouvé");
            }

            // Tenter l'upload
            if (!move_uploaded_file($_FILES['cv']['tmp_name'], $cv_path)) {
                error_log("[ERROR] Échec de l'upload du fichier");
                error_log("[ERROR] Dernière erreur PHP: " . error_get_last()['message']);
                throw new Exception("Erreur lors de l'upload du CV");
            }

            error_log("[DEBUG] CV uploadé avec succès à: " . $cv_path);
            error_log("[DEBUG] Taille du fichier uploadé: " . filesize($cv_path));

            // Gérer la lettre de motivation
            $lettre_path = null;
            if (isset($_POST['lettre_motivation']) && !empty($_POST['lettre_motivation'])) {
                $lettre_filename = uniqid('lettre_') . '.txt';
                $lettre_path = $this->upload_directory . 'lettres/' . $lettre_filename;
                if (!file_put_contents($lettre_path, $_POST['lettre_motivation'])) {
                    error_log("[ERROR] Échec de l'enregistrement de la lettre de motivation");
                    throw new Exception("Erreur lors de l'enregistrement de la lettre de motivation");
                }
                error_log("[DEBUG] Lettre de motivation enregistrée à: " . $lettre_path);
            }

            // Créer la candidature
            $candidatureData = [
                'id_personne' => $_POST['id_personne'],
                'id_stage' => $_POST['id_stage'],
                'cv_path' => $cv_path,
                'lettre_path' => $lettre_path,
                'statut' => 'En attente'
            ];

            error_log("[DEBUG] Données de la candidature: " . print_r($candidatureData, true));
            $id = $this->candidature->create($candidatureData);

            if ($id) {
                error_log("[DEBUG] Candidature créée avec succès, ID: " . $id);
                http_response_code(201);
                return json_encode([
                    'status' => 'success',
                    'message' => 'Candidature créée avec succès',
                    'data' => ['id' => $id]
                ]);
            }

            error_log("[ERROR] Échec de la création de la candidature dans la base de données");
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