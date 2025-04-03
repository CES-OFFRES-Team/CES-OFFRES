<?php

require_once __DIR__ . '/../config/database.php';

class WishList {
    private $db;

    public function __construct($db) {
        $this->db = $db;
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
            $query = "SELECT o.id_stage, o.titre, o.description, o.remuneration, 
                            o.date_publication, o.date_debut, o.date_fin,
                            e.id_entreprise, e.nom_entreprise, e.adresse, 
                            e.email, e.telephone, e.moyenne_eval, e.description as description_entreprise,
                            w.date_ajout
                     FROM ajouter_wish_list w
                     INNER JOIN Offres_de_stage o ON w.id_stage = o.id_stage 
                     LEFT JOIN Entreprises e ON o.id_entreprise = e.id_entreprise 
                     WHERE w.id_personne = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$idPersonne]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erreur dans getWishList: " . $e->getMessage() . "\nRequête: " . $query);
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