<?php

require_once __DIR__ . '/../models/Offre.php';

class OffreController {
    private $offre;

    public function __construct($db) {
        $this->offre = new Offre($db);
    }

    public function handleRequest($method, $id = null) {
        // Définition des en-têtes CORS
        header("Access-Control-Allow-Origin: *");
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Max-Age: 3600");
        header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

        switch ($method) {
            case 'GET':
                if ($id) {
                    return $this->getOffre($id);
                } else {
                    return $this->getAllOffres();
                }
            case 'POST':
                return $this->createOffre();
            case 'PUT':
                if ($id) {
                    return $this->updateOffre($id);
                }
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'ID requis pour la mise à jour'
                ]);
            case 'DELETE':
                if ($id) {
                    return $this->deleteOffre($id);
                }
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'ID requis pour la suppression'
                ]);
            case 'OPTIONS':
                http_response_code(200);
                return json_encode(['status' => 'success']);
            default:
                http_response_code(405);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Méthode non supportée'
                ]);
        }
    }

    private function getAllOffres() {
        try {
            error_log("[DEBUG] Début de la récupération des offres");
            $stmt = $this->offre->getAll();
            $offres = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (count($offres) > 0) {
                error_log("[DEBUG] " . count($offres) . " offres trouvées");
                http_response_code(200);
                return json_encode([
                    'status' => 'success',
                    'data' => $offres
                ]);
            } else {
                error_log("[DEBUG] Aucune offre trouvée");
                http_response_code(404);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Aucune offre trouvée'
                ]);
            }
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans getAllOffres: " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération des offres'
            ]);
        }
    }

    private function getOffre($id) {
        try {
            error_log("[DEBUG] Récupération de l'offre ID: " . $id);
            $offre = $this->offre->getById($id);
            
            if ($offre) {
                error_log("[DEBUG] Offre trouvée");
                http_response_code(200);
                return json_encode([
                    'status' => 'success',
                    'data' => $offre
                ]);
            }
            
            error_log("[DEBUG] Offre non trouvée");
            http_response_code(404);
            return json_encode([
                'status' => 'error',
                'message' => 'Offre non trouvée'
            ]);
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans getOffre: " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur lors de la récupération de l\'offre'
            ]);
        }
    }

    private function createOffre() {
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
            
            // Validation des données requises
            $requiredFields = ['titre', 'description', 'remuneration', 'date_debut', 'date_fin', 'id_entreprise'];
            $missingFields = [];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    $missingFields[] = $field;
                }
            }

            if (!empty($missingFields)) {
                error_log("[ERROR] Champs manquants: " . implode(', ', $missingFields));
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Champs obligatoires manquants: ' . implode(', ', $missingFields)
                ]);
            }

            // Validation des dates
            $dateDebut = strtotime($data['date_debut']);
            $dateFin = strtotime($data['date_fin']);
            if ($dateDebut > $dateFin) {
                error_log("[ERROR] Date de début postérieure à la date de fin");
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'La date de début doit être antérieure à la date de fin'
                ]);
            }

            // Validation de la rémunération
            if (!is_numeric($data['remuneration']) || $data['remuneration'] < 0) {
                error_log("[ERROR] Rémunération invalide: " . $data['remuneration']);
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'La rémunération doit être un nombre positif'
                ]);
            }

            $id = $this->offre->create($data);
            error_log("[SUCCESS] Offre créée avec l'ID: " . $id);
            http_response_code(201);
            return json_encode([
                'status' => 'success',
                'message' => 'Offre créée avec succès',
                'data' => ['id' => $id]
            ]);
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans createOffre: " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur lors de la création de l\'offre'
            ]);
        }
    }

    private function updateOffre($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                error_log("[ERROR] Données JSON invalides reçues pour la mise à jour de l'offre ID: " . $id);
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Format JSON invalide'
                ]);
            }
            
            // Validation des données requises
            $requiredFields = ['titre', 'description', 'remuneration', 'date_debut', 'date_fin', 'id_entreprise'];
            $missingFields = [];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    $missingFields[] = $field;
                }
            }

            if (!empty($missingFields)) {
                error_log("[ERROR] Champs manquants: " . implode(', ', $missingFields));
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'Champs obligatoires manquants: ' . implode(', ', $missingFields)
                ]);
            }

            // Validation des dates
            $dateDebut = strtotime($data['date_debut']);
            $dateFin = strtotime($data['date_fin']);
            if ($dateDebut > $dateFin) {
                error_log("[ERROR] Date de début postérieure à la date de fin");
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'La date de début doit être antérieure à la date de fin'
                ]);
            }

            // Validation de la rémunération
            if (!is_numeric($data['remuneration']) || $data['remuneration'] < 0) {
                error_log("[ERROR] Rémunération invalide: " . $data['remuneration']);
                http_response_code(400);
                return json_encode([
                    'status' => 'error',
                    'message' => 'La rémunération doit être un nombre positif'
                ]);
            }

            $success = $this->offre->update($id, $data);
            if ($success) {
                error_log("[SUCCESS] Offre ID: " . $id . " mise à jour avec succès");
                http_response_code(200);
                return json_encode([
                    'status' => 'success',
                    'message' => 'Offre mise à jour avec succès'
                ]);
            }
            
            error_log("[ERROR] Offre ID: " . $id . " non trouvée");
            http_response_code(404);
            return json_encode([
                'status' => 'error',
                'message' => 'Offre non trouvée'
            ]);
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans updateOffre: " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur lors de la mise à jour de l\'offre'
            ]);
        }
    }

    private function deleteOffre($id) {
        try {
            $success = $this->offre->delete($id);
            if ($success) {
                error_log("[SUCCESS] Offre ID: " . $id . " supprimée avec succès");
                http_response_code(200);
                return json_encode([
                    'status' => 'success',
                    'message' => 'Offre supprimée avec succès'
                ]);
            }
            
            error_log("[ERROR] Offre ID: " . $id . " non trouvée");
            http_response_code(404);
            return json_encode([
                'status' => 'error',
                'message' => 'Offre non trouvée'
            ]);
        } catch (Exception $e) {
            error_log("[ERROR] Exception dans deleteOffre: " . $e->getMessage());
            http_response_code(500);
            return json_encode([
                'status' => 'error',
                'message' => 'Erreur lors de la suppression de l\'offre'
            ]);
        }
    }
} 