const express = require('express');
const { getAllUsers, getUserProfile, updateUserProfile } = require('../controllers/userController');
const { validateJwt } = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.get('/users', getAllUsers);
router.get('/user/', validateJwt, getUserProfile);
router.put('/user/', validateJwt, updateUserProfile);

module.exports = router;