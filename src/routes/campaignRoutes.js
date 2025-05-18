const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { validateJwt } = require("../middlewares/authMiddleware.js");


router.get('/campaigns/active', validateJwt, campaignController.getActiveCampaigns);
router.get('/campaigns/past', validateJwt, campaignController.getPastCampaigns);
router.post('/campaigns', validateJwt, campaignController.createCampaign);
router.put('/campaigns/:id', validateJwt, campaignController.updateCampaign);
router.delete('/campaigns/:id', validateJwt, campaignController.deleteCampaign);

module.exports = router;
