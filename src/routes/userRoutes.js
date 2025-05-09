const express = require('express');
const { getAllUsers, getUserById, updateUser } = require('../controllers/userController');
const { validateJwt } = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', validateJwt, updateUser);

module.exports = router;