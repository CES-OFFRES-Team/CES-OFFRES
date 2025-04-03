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

    public function getUserOffers($idPersonne) {
        try {
            $query = "SELECT 
                o.*,
                e.nom_entreprise,
                e.email as email_entreprise,
                e.telephone as telephone_entreprise,
                e.site_web,
                e.localisation,
                w.date_ajout as date_ajout_wishlist
            FROM Offres_de_stage o
            INNER JOIN ajouter_wish_list w ON o.id_stage = w.id_stage
            LEFT JOIN Entreprises e ON o.id_entreprise = e.id_entreprise
            WHERE w.id_personne = ?
            ORDER BY w.date_ajout DESC";

            error_log("Récupération des offres pour l'utilisateur " . $idPersonne);
            $stmt = $this->db->prepare($query);
            $stmt->execute([$idPersonne]);
            
            $offers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Nombre d'offres trouvées : " . count($offers));
            
            return [
                'count' => count($offers),
                'offers' => array_map(function($offer) {
                    return [
                        'id_stage' => $offer['id_stage'],
                        'titre' => $offer['titre'],
                        'description' => $offer['description'],
                        'remuneration' => $offer['remuneration'],
                        'date_debut' => $offer['date_debut'],
                        'date_fin' => $offer['date_fin'],
                        'type_stage' => $offer['type_stage'],
                        'niveau_etude' => $offer['niveau_etude'],
                        'entreprise' => [
                            'nom' => $offer['nom_entreprise'],
                            'email' => $offer['email_entreprise'],
                            'telephone' => $offer['telephone_entreprise'],
                            'site_web' => $offer['site_web'],
                            'localisation' => $offer['localisation']
                        ],
                        'date_ajout_wishlist' => $offer['date_ajout_wishlist']
                    ];
                }, $offers)
            ];
        } catch (PDOException $e) {
            error_log("Erreur dans getUserOffers: " . $e->getMessage() . "\nRequête: " . $query);
            throw $e;
        }
    }
} 