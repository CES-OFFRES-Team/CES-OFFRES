const db = require('../config/database');

class WishList {
    static async addToWishList(idPersonne, idStage) {
        try {
            const query = `
                INSERT INTO ajouter_wish_list (id_personne, id_stage)
                VALUES (?, ?)
            `;
            const result = await db.query(query, [idPersonne, idStage]);
            return result;
        } catch (error) {
            console.error('Erreur lors de l\'ajout à la wishlist:', error);
            throw error;
        }
    }

    static async removeFromWishList(idPersonne, idStage) {
        try {
            const query = `
                DELETE FROM ajouter_wish_list
                WHERE id_personne = ? AND id_stage = ?
            `;
            const result = await db.query(query, [idPersonne, idStage]);
            return result;
        } catch (error) {
            console.error('Erreur lors de la suppression de la wishlist:', error);
            throw error;
        }
    }

    static async getWishList(idPersonne) {
        try {
            const query = `
                SELECT 
                    s.id_stage,
                    s.titre,
                    s.description,
                    s.date_debut,
                    s.date_fin,
                    s.salaire,
                    s.type_stage,
                    s.niveau_etude,
                    s.competences_requises,
                    s.localisation,
                    e.id_entreprise,
                    e.nom as nom_entreprise,
                    e.secteur,
                    e.description as description_entreprise,
                    e.telephone,
                    e.email,
                    e.site_web,
                    e.adresse,
                    wl.date_ajout
                FROM ajouter_wish_list wl
                JOIN stage s ON wl.id_stage = s.id_stage
                JOIN entreprise e ON s.id_entreprise = e.id_entreprise
                WHERE wl.id_personne = ?
                ORDER BY wl.date_ajout DESC
            `;
            const [rows] = await db.query(query, [idPersonne]);
            return rows;
        } catch (error) {
            console.error('Erreur lors de la récupération de la wishlist:', error);
            throw error;
        }
    }

    static async isInWishList(idPersonne, idStage) {
        try {
            const query = `
                SELECT COUNT(*) as count
                FROM ajouter_wish_list
                WHERE id_personne = ? AND id_stage = ?
            `;
            const [rows] = await db.query(query, [idPersonne, idStage]);
            return rows[0].count > 0;
        } catch (error) {
            console.error('Erreur lors de la vérification de la wishlist:', error);
            throw error;
        }
    }

    static async getWishListCount(idPersonne) {
        try {
            const query = `
                SELECT COUNT(*) as count
                FROM ajouter_wish_list
                WHERE id_personne = ?
            `;
            const [rows] = await db.query(query, [idPersonne]);
            return rows[0].count;
        } catch (error) {
            console.error('Erreur lors du comptage de la wishlist:', error);
            throw error;
        }
    }
}

module.exports = WishList; 