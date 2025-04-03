const WishList = require('../models/WishList');
const { getUserData } = require('../utils/auth');

const wishListController = {
    // Ajouter un stage à la wishlist
    async addToWishList(req, res) {
        try {
            const userData = getUserData();
            if (!userData || !userData.id) {
                return res.status(401).json({ message: 'Utilisateur non authentifié' });
            }

            const { idStage } = req.body;
            if (!idStage) {
                return res.status(400).json({ message: 'ID du stage requis' });
            }

            // Vérifier si le stage est déjà dans la wishlist
            const isAlreadyInWishList = await WishList.isInWishList(userData.id, idStage);
            if (isAlreadyInWishList) {
                return res.status(400).json({ message: 'Ce stage est déjà dans votre wishlist' });
            }

            await WishList.addToWishList(userData.id, idStage);
            res.status(201).json({ message: 'Stage ajouté à la wishlist avec succès' });
        } catch (error) {
            console.error('Erreur lors de l\'ajout à la wishlist:', error);
            res.status(500).json({ message: 'Erreur lors de l\'ajout à la wishlist' });
        }
    },

    // Supprimer un stage de la wishlist
    async removeFromWishList(req, res) {
        try {
            const userData = getUserData();
            if (!userData || !userData.id) {
                return res.status(401).json({ message: 'Utilisateur non authentifié' });
            }

            const { idStage } = req.params;
            if (!idStage) {
                return res.status(400).json({ message: 'ID du stage requis' });
            }

            await WishList.removeFromWishList(userData.id, idStage);
            res.status(200).json({ message: 'Stage retiré de la wishlist avec succès' });
        } catch (error) {
            console.error('Erreur lors de la suppression de la wishlist:', error);
            res.status(500).json({ message: 'Erreur lors de la suppression de la wishlist' });
        }
    },

    // Récupérer la wishlist de l'utilisateur
    async getWishList(req, res) {
        try {
            const userData = getUserData();
            if (!userData || !userData.id) {
                return res.status(401).json({ message: 'Utilisateur non authentifié' });
            }

            const [wishList, count] = await Promise.all([
                WishList.getWishList(userData.id),
                WishList.getWishListCount(userData.id)
            ]);

            res.status(200).json({
                count,
                stages: wishList
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de la wishlist:', error);
            res.status(500).json({ message: 'Erreur lors de la récupération de la wishlist' });
        }
    },

    // Vérifier si un stage est dans la wishlist
    async checkWishListStatus(req, res) {
        try {
            const userData = getUserData();
            if (!userData || !userData.id) {
                return res.status(401).json({ message: 'Utilisateur non authentifié' });
            }

            const { idStage } = req.params;
            if (!idStage) {
                return res.status(400).json({ message: 'ID du stage requis' });
            }

            const isInWishList = await WishList.isInWishList(userData.id, idStage);
            res.status(200).json({ isInWishList });
        } catch (error) {
            console.error('Erreur lors de la vérification du statut de la wishlist:', error);
            res.status(500).json({ message: 'Erreur lors de la vérification du statut de la wishlist' });
        }
    }
};

module.exports = wishListController; 