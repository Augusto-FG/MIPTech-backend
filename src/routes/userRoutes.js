const express = require('express');
const { getAllUsers, getUserProfile, updateUserProfile, activateMembership } = require('../controllers/userController');
const { validateJwt } = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.get('/users', getAllUsers);
router.get('/user/', validateJwt, getUserProfile);
router.put('/user/', validateJwt, updateUserProfile);
router.post('/user/activate-membership', validateJwt, activateMembership);


module.exports = router;