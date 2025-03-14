<?php
require_once __DIR__ . '/../models/Candidature.php';
require_once __DIR__ . '/../config/database.php';

class CandidatureController {
    private $db;
    private $candidature;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->candidature = new Candidature($this->db);
    }

    public function handleRequest($method) {
        header('Access-Control-Allow-Origin: *');
        header('Content-Type: application/json');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

        // Log de la méthode et des en-têtes
        error_log("Méthode reçue: " . $method);
        error_log("Headers reçus: " . json_encode(getallheaders()));

        switch ($method) {
            case 'POST':
                return $this->createCandidature();
            case 'GET':
                return $this->getCandidatures();
            case 'OPTIONS':
                http_response_code(200);
                return json_encode(['status' => 'success']);
            default:
                http_response_code(405);
                return json_encode(['error' => 'Méthode non autorisée']);
        }
    }

    private function createCandidature() {
        try {
            // Log des données reçues
            error_log("POST data reçues: " . json_encode($_POST));
            error_log("FILES data reçues: " . json_encode($_FILES));

            // Récupérer les données POST
            $offre_id = $_POST['offre_id'] ?? null;
            $nom = $_POST['nom'] ?? null;
            $prenom = $_POST['prenom'] ?? null;
            $email = $_POST['email'] ?? null;
            $telephone = $_POST['telephone'] ?? null;
            $lettre_motivation = $_POST['lettre_motivation'] ?? null;

            // Log des données extraites
            error_log("Données extraites: " . json_encode([
                'offre_id' => $offre_id,
                'nom' => $nom,
                'prenom' => $prenom,
                'email' => $email,
                'telephone' => $telephone,
                'lettre_motivation' => $lettre_motivation,
                'cv_present' => isset($_FILES['cv'])
            ]));

            // Vérifier les données requises
            if (!$offre_id || !$nom || !$prenom || !$email || !$telephone || !$lettre_motivation || !isset($_FILES['cv'])) {
                $missing = [];
                if (!$offre_id) $missing[] = 'offre_id';
                if (!$nom) $missing[] = 'nom';
                if (!$prenom) $missing[] = 'prenom';
                if (!$email) $missing[] = 'email';
                if (!$telephone) $missing[] = 'telephone';
                if (!$lettre_motivation) $missing[] = 'lettre_motivation';
                if (!isset($_FILES['cv'])) $missing[] = 'cv';

                error_log("Données manquantes: " . json_encode($missing));
                
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Données manquantes: ' . implode(', ', $missing)
                ]);
            }

            // Gérer l'upload du CV
            $cv_path = $this->handleCVUpload($_FILES['cv']);
            if (!$cv_path) {
                error_log("Erreur upload CV: " . json_encode($_FILES['cv']));
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Erreur lors du téléchargement du CV'
                ]);
            }

            // Assigner les valeurs au modèle
            $this->candidature->offre_id = $offre_id;
            $this->candidature->nom = $nom;
            $this->candidature->prenom = $prenom;
            $this->candidature->email = $email;
            $this->candidature->telephone = $telephone;
            $this->candidature->cv_path = $cv_path;
            $this->candidature->lettre_motivation = $lettre_motivation;

            // Créer la candidature
            if ($this->candidature->create()) {
                http_response_code(201);
                return json_encode([
                    'status' => 'success',
                    'message' => 'Candidature créée avec succès'
                ]);
            }

            error_log("Erreur création candidature dans la base de données");
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur lors de la création de la candidature'
            ]);

        } catch (Exception $e) {
            error_log("Exception: " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur serveur: ' . $e->getMessage()
            ]);
        }
    }

    private function getCandidatures() {
        try {
            $offre_id = $_GET['offre_id'] ?? null;
            
            if (!$offre_id) {
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'ID de l\'offre manquant'
                ]);
            }

            $stmt = $this->candidature->getCandidaturesByOffre($offre_id);
            $candidatures = [];

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $candidatures[] = $row;
            }

            return json_encode([
                'status' => 'success',
                'data' => $candidatures
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des candidatures'
            ]);
        }
    }

    private function handleCVUpload($file) {
        // Vérifier si le dossier uploads/cv existe, sinon le créer
        $upload_dir = __DIR__ . '/../uploads/cv/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        // Vérifier le type de fichier
        $allowed_types = ['application/pdf'];
        if (!in_array($file['type'], $allowed_types)) {
            return false;
        }

        // Générer un nom de fichier unique
        $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $file_name = uniqid() . '.' . $file_extension;
        $file_path = $upload_dir . $file_name;

        // Déplacer le fichier
        if (move_uploaded_file($file['tmp_name'], $file_path)) {
            return 'uploads/cv/' . $file_name;
        }

        return false;
    }
} 