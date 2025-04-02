<?php

require_once __DIR__ . '/../models/Offre.php';

class OffreController {
    private $offre;

    public function __construct($db) {
        $this->offre = new Offre($db);
    }

    public function handleRequest($method, $id = null) {
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
                return ['error' => 'ID requis pour la mise à jour'];
            case 'DELETE':
                if ($id) {
                    return $this->deleteOffre($id);
                }
                return ['error' => 'ID requis pour la suppression'];
            case 'OPTIONS':
                return ['status' => 'ok'];
            default:
                return ['error' => 'Méthode non supportée'];
        }
    }

    private function getAllOffres() {
        try {
            $stmt = $this->offre->getAll();
            $offres = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $offres;
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erreur lors de la récupération des offres'];
        }
    }

    private function getOffre($id) {
        try {
            $offre = $this->offre->getById($id);
            if ($offre) {
                return $offre;
            }
            http_response_code(404);
            return ['error' => 'Offre non trouvée'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erreur lors de la récupération de l\'offre'];
        }
    }

    private function createOffre() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validation des données requises
            $requiredFields = ['titre', 'description', 'remuneration', 'date_debut', 'date_fin', 'id_entreprise'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    http_response_code(400);
                    return ['error' => "Le champ $field est requis"];
                }
            }

            // Validation des dates
            $dateDebut = strtotime($data['date_debut']);
            $dateFin = strtotime($data['date_fin']);
            if ($dateDebut > $dateFin) {
                http_response_code(400);
                return ['error' => 'La date de début doit être antérieure à la date de fin'];
            }

            // Validation de la rémunération
            if (!is_numeric($data['remuneration']) || $data['remuneration'] < 0) {
                http_response_code(400);
                return ['error' => 'La rémunération doit être un nombre positif'];
            }

            $id = $this->offre->create($data);
            return ['id' => $id, 'message' => 'Offre créée avec succès'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erreur lors de la création de l\'offre'];
        }
    }

    private function updateOffre($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validation des données requises
            $requiredFields = ['titre', 'description', 'remuneration', 'date_debut', 'date_fin', 'id_entreprise'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    http_response_code(400);
                    return ['error' => "Le champ $field est requis"];
                }
            }

            // Validation des dates
            $dateDebut = strtotime($data['date_debut']);
            $dateFin = strtotime($data['date_fin']);
            if ($dateDebut > $dateFin) {
                http_response_code(400);
                return ['error' => 'La date de début doit être antérieure à la date de fin'];
            }

            // Validation de la rémunération
            if (!is_numeric($data['remuneration']) || $data['remuneration'] < 0) {
                http_response_code(400);
                return ['error' => 'La rémunération doit être un nombre positif'];
            }

            $success = $this->offre->update($id, $data);
            if ($success) {
                return ['message' => 'Offre mise à jour avec succès'];
            }
            http_response_code(404);
            return ['error' => 'Offre non trouvée'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erreur lors de la mise à jour de l\'offre'];
        }
    }

    private function deleteOffre($id) {
        try {
            $success = $this->offre->delete($id);
            if ($success) {
                return ['message' => 'Offre supprimée avec succès'];
            }
            http_response_code(404);
            return ['error' => 'Offre non trouvée'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erreur lors de la suppression de l\'offre'];
        }
    }
} 