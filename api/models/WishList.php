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
            $query = "SELECT w.*, 
                      o.titre as titre_stage,
                      o.description,
                      o.remuneration as salaire,
                      o.type_stage,
                      o.niveau_etude,
                      e.nom_entreprise,
                      e.email,
                      e.telephone,
                      e.site_web,
                      e.localisation
                      FROM ajouter_wish_list w
                      LEFT JOIN Offres_de_stage o ON w.id_stage = o.id_stage
                      LEFT JOIN Entreprises e ON o.id_entreprise = e.id_entreprise
                      WHERE w.id_personne = ?
                      ORDER BY w.date_ajout DESC";
            
            error_log("Exécution de la requête getWishList pour l'utilisateur " . $idPersonne);
            $stmt = $this->db->prepare($query);
            $stmt->execute([$idPersonne]);
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Nombre de résultats trouvés : " . count($result));
            return $result;
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