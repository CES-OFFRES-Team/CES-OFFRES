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
            
            // Définir le chemin d'upload de manière absolue
            $this->upload_directory = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads';
            error_log("[DEBUG] Chemin d'upload absolu: " . $this->upload_directory);

            // Vérifier les permissions des dossiers
            $required_dirs = [
                $this->upload_directory => "dossier principal d'upload",
                $this->upload_directory . DIRECTORY_SEPARATOR . 'cv' => "dossier des CVs",
                $this->upload_directory . DIRECTORY_SEPARATOR . 'lettres' => "dossier des lettres"
            ];

            foreach ($required_dirs as $dir => $description) {
                error_log("[DEBUG] Vérification du " . $description . ": " . $dir);
                
                if (!file_exists($dir)) {
                    error_log("[ERROR] Le " . $description . " n'existe pas: " . $dir);
                    throw new Exception("Le " . $description . " n'existe pas");
                }

                error_log("[DEBUG] Permissions actuelles du " . $description . ": " . substr(sprintf('%o', fileperms($dir)), -4));
                
                // Tenter de définir les permissions si nécessaire
                if (!is_writable($dir)) {
                    error_log("[DEBUG] Tentative de modification des permissions pour " . $description);
                    @chmod($dir, 0777);
                    
                    if (!is_writable($dir)) {
                        error_log("[ERROR] Le " . $description . " n'est pas accessible en écriture après tentative de modification des permissions");
                        throw new Exception("Le " . $description . " n'est pas accessible en écriture");
                    }
                }

                error_log("[DEBUG] " . $description . " est accessible en écriture");
            }

            error_log("[DEBUG] Tous les dossiers sont correctement configurés et accessibles");

        } catch (Exception $e) {
            error_log("[ERROR] Exception dans le constructeur: " . $e->getMessage());
            error_log("[ERROR] Trace complète: " . $e->getTraceAsString());
            throw new Exception("Erreur d'initialisation: " . $e->getMessage());
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
            $cv_dir = $this->upload_directory . DIRECTORY_SEPARATOR . 'cv';
            $cv_full_path = $cv_dir . DIRECTORY_SEPARATOR . $cv_filename;
            $cv_relative_path = 'uploads/cv/' . $cv_filename;

            error_log("[DEBUG] Tentative d'upload du CV");
            error_log("[DEBUG] Chemin complet: " . $cv_full_path);
            error_log("[DEBUG] Permissions du dossier: " . substr(sprintf('%o', fileperms($cv_dir)), -4));
            
            if (!is_writable($cv_dir)) {
                error_log("[ERROR] Le dossier CV n'est pas accessible en écriture");
                throw new Exception("Le dossier de destination n'est pas accessible en écriture");
            }

            if (!@move_uploaded_file($_FILES['cv']['tmp_name'], $cv_full_path)) {
                $error = error_get_last();
                error_log("[ERROR] Échec de l'upload du CV: " . ($error ? $error['message'] : 'Erreur inconnue'));
                throw new Exception("Impossible d'uploader le CV");
            }

            error_log("[DEBUG] CV uploadé avec succès");

            // Créer la candidature
            $candidatureData = [
                'id_personne' => $_POST['id_personne'],
                'id_stage' => $_POST['id_stage'],
                'cv_path' => $cv_relative_path,
                'lettre_path' => null,
                'statut' => 'En attente'
            ];

            // Gérer la lettre de motivation si présente
            if (isset($_POST['lettre_motivation']) && !empty($_POST['lettre_motivation'])) {
                $lettre_filename = uniqid('lettre_') . '.txt';
                $lettre_dir = $this->upload_directory . DIRECTORY_SEPARATOR . 'lettres';
                $lettre_full_path = $lettre_dir . DIRECTORY_SEPARATOR . $lettre_filename;
                $lettre_relative_path = 'uploads/lettres/' . $lettre_filename;

                if (!@file_put_contents($lettre_full_path, $_POST['lettre_motivation'])) {
                    error_log("[ERROR] Échec de l'écriture de la lettre de motivation");
                    throw new Exception("Impossible d'enregistrer la lettre de motivation");
                }

                $candidatureData['lettre_path'] = $lettre_relative_path;
                error_log("[DEBUG] Lettre de motivation enregistrée");
            }

            error_log("[DEBUG] Tentative de création de la candidature dans la BD");
            $id = $this->candidature->create($candidatureData);

            if (!$id) {
                throw new Exception("Échec de la création de la candidature dans la base de données");
            }

            error_log("[DEBUG] Candidature créée avec succès, ID: " . $id);
            return json_encode([
                'status' => 'success',
                'message' => 'Candidature créée avec succès',
                'data' => ['id' => $id]
            ]);

        } catch (Exception $e) {
            error_log("[ERROR] Exception dans createCandidature: " . $e->getMessage());
            error_log("[ERROR] Trace: " . $e->getTraceAsString());
            
            // Nettoyer les fichiers en cas d'erreur
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
                    'trace' => $e->getTraceAsString(),
                    'upload_dir' => $this->upload_directory
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