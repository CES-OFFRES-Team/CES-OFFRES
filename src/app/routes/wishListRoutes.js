const express = require('express');
const router = express.Router();
const wishListController = require('../controllers/wishListController');
const { isAuthenticated } = require('../middleware/auth');

// Routes protégées par authentification
router.use(isAuthenticated);

// Ajouter un stage à la wishlist
router.post('/add', wishListController.addToWishList);

// Supprimer un stage de la wishlist
router.delete('/remove/:idStage', wishListController.removeFromWishList);

// Récupérer la wishlist de l'utilisateur
router.get('/list', wishListController.getWishList);

// Vérifier si un stage est dans la wishlist
router.get('/check/:idStage', wishListController.checkWishListStatus);

module.exports = router; 