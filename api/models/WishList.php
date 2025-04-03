<?php

require_once __DIR__ . '/../config/database.php';

class WishList {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function addToWishList($idPersonne, $idStage) {
        try {
            $query = "INSERT INTO ajouter_wish_list (id_personne, id_stage) VALUES (?, ?)";
            $stmt = $this->db->prepare($query);
            return $stmt->execute([$idPersonne, $idStage]);
        } catch (PDOException $e) {
            error_log("Erreur dans addToWishList: " . $e->getMessage());
            throw $e;
        }
    }

    public function removeFromWishList($idPersonne, $idStage) {
        try {
            $query = "DELETE FROM ajouter_wish_list WHERE id_personne = ? AND id_stage = ?";
            $stmt = $this->db->prepare($query);
            return $stmt->execute([$idPersonne, $idStage]);
        } catch (PDOException $e) {
            error_log("Erreur dans removeFromWishList: " . $e->getMessage());
            throw $e;
        }
    }

    public function getWishList($idPersonne) {
        try {
            $query = "SELECT s.*, e.nom_entreprise, e.email, e.téléphone, e.site_web, e.localisation 
                     FROM Offres_de_stage s 
                     INNER JOIN ajouter_wish_list w ON s.id_stage = w.id_stage 
                     LEFT JOIN Entreprises e ON s.id_entreprise = e.id_entreprise 
                     WHERE w.id_personne = ? 
                     ORDER BY w.date_ajout DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$idPersonne]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur dans getWishList: " . $e->getMessage());
            throw $e;
        }
    }

    public function isInWishList($idPersonne, $idStage) {
        try {
            $query = "SELECT COUNT(*) as count FROM ajouter_wish_list WHERE id_personne = ? AND id_stage = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$idPersonne, $idStage]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['count'] > 0;
        } catch (PDOException $e) {
            error_log("Erreur dans isInWishList: " . $e->getMessage());
            throw $e;
        }
    }

    public function getWishListCount($idPersonne) {
        try {
            $query = "SELECT COUNT(*) as count FROM ajouter_wish_list WHERE id_personne = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$idPersonne]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['count'];
        } catch (PDOException $e) {
            error_log("Erreur dans getWishListCount: " . $e->getMessage());
            throw $e;
        }
    }
} 