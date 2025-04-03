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
            
            // Définir le chemin d'upload avec le bon séparateur de chemin
            $this->upload_directory = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;
            error_log("[DEBUG] Chemin d'upload configuré: " . $this->upload_directory);

            // Créer les dossiers nécessaires avec les bons droits
            foreach (['', 'cv', 'lettres'] as $dir) {
                $path = $this->upload_directory . $dir;
                if (!file_exists($path)) {
                    if (!@mkdir($path, 0777, true)) {
                        error_log("[ERROR] Impossible de créer le dossier: " . $path);
                        throw new Exception("Erreur lors de la création du dossier " . $dir);
                    }
                    error_log("[DEBUG] Dossier créé: " . $path);
                }
                if (!is_writable($path)) {
                    error_log("[ERROR] Le dossier n'est pas accessible en écriture: " . $path);
                    throw new Exception("Le dossier " . $dir . " n'est pas accessible en écriture");
                }
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
                    if (isset($_GET['id_personne'])) {
                        return $this->getCandidaturesByPersonne($_GET['id_personne']);
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
            error_log("[DEBUG] Début de createCandidature");
            error_log("[DEBUG] POST reçu: " . print_r($_POST, true));
            error_log("[DEBUG] FILES reçu: " . print_r($_FILES, true));

            // Vérifier si des fichiers ont été envoyés
            if (!isset($_FILES['cv']) || $_FILES['cv']['error'] !== UPLOAD_ERR_OK) {
                $error = isset($_FILES['cv']) ? $_FILES['cv']['error'] : 'Aucun fichier';
                error_log("[ERROR] Erreur upload CV: " . $error);
                throw new Exception("Erreur lors de l'upload du CV: " . $this->getUploadErrorMessage($error));
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
            $cv_path = 'uploads/cv/' . $cv_filename; // Chemin relatif pour la BD
            $cv_full_path = $this->upload_directory . 'cv' . DIRECTORY_SEPARATOR . $cv_filename;

            error_log("[DEBUG] Tentative d'upload du CV vers: " . $cv_full_path);
            
            if (!@move_uploaded_file($_FILES['cv']['tmp_name'], $cv_full_path)) {
                error_log("[ERROR] Erreur move_uploaded_file. Permissions du dossier: " . substr(sprintf('%o', fileperms($this->upload_directory . 'cv')), -4));
                error_log("[ERROR] Erreur PHP: " . error_get_last()['message']);
                throw new Exception("Erreur lors de l'upload du CV");
            }

            error_log("[DEBUG] CV uploadé avec succès: " . $cv_full_path);

            // Gérer la lettre de motivation
            $lettre_path = null;
            if (isset($_POST['lettre_motivation']) && !empty($_POST['lettre_motivation'])) {
                $lettre_filename = uniqid('lettre_') . '.txt';
                $lettre_path = 'uploads/lettres/' . $lettre_filename;
                $lettre_full_path = $this->upload_directory . 'lettres' . DIRECTORY_SEPARATOR . $lettre_filename;
                
                if (!@file_put_contents($lettre_full_path, $_POST['lettre_motivation'])) {
                    error_log("[ERROR] Erreur lors de l'écriture de la lettre. PHP Error: " . error_get_last()['message']);
                    throw new Exception("Erreur lors de l'enregistrement de la lettre de motivation");
                }
                error_log("[DEBUG] Lettre de motivation enregistrée: " . $lettre_full_path);
            }

            // Créer la candidature
            $candidatureData = [
                'id_personne' => $_POST['id_personne'],
                'id_stage' => $_POST['id_stage'],
                'cv_path' => $cv_path,
                'lettre_path' => $lettre_path,
                'statut' => 'En attente'
            ];

            error_log("[DEBUG] Tentative de création de la candidature avec les données: " . print_r($candidatureData, true));

            $id = $this->candidature->create($candidatureData);

            if ($id) {
                error_log("[DEBUG] Candidature créée avec succès, ID: " . $id);
                return json_encode([
                    'status' => 'success',
                    'message' => 'Candidature créée avec succès',
                    'data' => ['id' => $id]
                ]);
            }

            throw new Exception("Erreur lors de la création de la candidature dans la base de données");

        } catch (Exception $e) {
            error_log("[ERROR] Exception dans createCandidature: " . $e->getMessage());
            error_log("[ERROR] Trace: " . $e->getTraceAsString());
            
            // Supprimer les fichiers uploadés en cas d'erreur
            if (isset($cv_full_path) && file_exists($cv_full_path)) {
                @unlink($cv_full_path);
            }
            if (isset($lettre_full_path) && file_exists($lettre_full_path)) {
                @unlink($lettre_full_path);
            }

            return json_encode([
                'status' => 'error',
                'message' => $e->getMessage(),
                'debug_info' => [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]
            ]);
        }
    }

    private function getUploadErrorMessage($code) {
        switch ($code) {
            case UPLOAD_ERR_INI_SIZE:
                return 'Le fichier dépasse la taille maximale autorisée par PHP';
            case UPLOAD_ERR_FORM_SIZE:
                return 'Le fichier dépasse la taille maximale autorisée par le formulaire';
            case UPLOAD_ERR_PARTIAL:
                return 'Le fichier n\'a été que partiellement téléchargé';
            case UPLOAD_ERR_NO_FILE:
                return 'Aucun fichier n\'a été téléchargé';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Le dossier temporaire est manquant';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Échec de l\'écriture du fichier sur le disque';
            case UPLOAD_ERR_EXTENSION:
                return 'Une extension PHP a arrêté l\'upload du fichier';
            default:
                return 'Erreur inconnue lors de l\'upload';
        }
    }

    private function getCandidaturesByPersonne($id_personne) {
        try {
            error_log("[DEBUG] Récupération des candidatures pour la personne ID: " . $id_personne);
            
            $candidatures = $this->candidature->getByPersonne($id_personne);
            
            if ($candidatures === false) {
                error_log("[ERROR] Échec de la récupération des candidatures");
                throw new Exception("Erreur lors de la récupération des candidatures");
            }

            // Même si aucune candidature n'est trouvée, on renvoie un tableau vide avec succès
            error_log("[DEBUG] Candidatures récupérées avec succès. Nombre: " . count($candidatures));
            
            return json_encode([
                'status' => 'success',
                'data' => $candidatures
            ]);
            
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans getCandidaturesByPersonne: " . $e->getMessage());
            http_response_code(400);
            return json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }

    private function getAllCandidatures() {
        try {
            // Cette méthode n'est pas implémentée car non nécessaire pour le moment
            throw new Exception("Méthode non implémentée");
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans getAllCandidatures: " . $e->getMessage());
            http_response_code(400);
            return json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }
} 